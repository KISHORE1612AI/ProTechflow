import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import type { UpsertUser } from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePassword(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function shouldUseMockAuth() {
  return (
    process.env.MOCK_AUTH === "true" ||
    (!process.env.REPL_ID && process.env.NODE_ENV !== "production")
  );
}

const MOCK_USER: UpsertUser = {
  id: "dev-user",
  email: "dev@example.com",
  firstName: "Dev",
  lastName: "User",
  profileImageUrl: "",
  username: "devuser",
  password: "mockpassword",
  isAdmin: true,
  isApproved: true,
};

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  const id = claims["sub"];
  const email = claims["email"];
  const firstName = claims["first_name"];
  const lastName = claims["last_name"];
  const profileImageUrl = claims["profile_image_url"];

  const username = claims["preferred_username"] || email?.split("@")[0] || `user_${id.substring(0, 8)}`;

  // Check if user exists to preserve isAdmin/isApproved status
  const existingUser = await storage.getUser(id);

  await storage.upsertUser({
    id,
    email,
    firstName,
    lastName,
    profileImageUrl,
    username,
    password: "",
    isAdmin: existingUser?.isAdmin || false,
    isApproved: existingUser?.isApproved || false,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!user.password) {
          return done(null, false, { message: "Please log in with Replit." });
        }
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password." });
        }
        if (!user.isApproved) {
          return done(null, false, { message: "Account pending approval." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Replit Auth Strategy (only if configured)
  if (process.env.REPL_ID) {
    try {
      const config = await getOidcConfig();
      const verify: VerifyFunction = async (
        tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
        verified: passport.AuthenticateCallback
      ) => {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      };

      const strategy = new Strategy(
        {
          name: "replit",
          config,
          scope: "openid email profile offline_access",
          callbackURL: `/api/callback`, // Relative path
        },
        verify
      );
      passport.use(strategy);
    } catch (e) {
      console.warn("Failed to setup Replit Auth:", e);
    }
  }

  passport.serializeUser((user: any, cb) => {
    // If it's a local user, it has an id directly. If it's OIDC, it might be structured differently.
    // We'll standardize on storing the user ID in the session.
    cb(null, user.id || user.claims?.sub);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, firstName, lastName } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        role: "user",
        isAdmin: false,
        isApproved: false, // Explicitly false
      });

      // Do NOT log them in automatically if they need approval
      // req.login(user, ...);

      res.status(201).json({ message: "Registration successful. Please wait for admin approval." });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Replit Auth Routes
  app.get("/api/login/replit", (req, res, next) => {
    if (!process.env.REPL_ID) return res.status(404).send("Replit Auth not configured");
    passport.authenticate("replit", {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    if (!process.env.REPL_ID) return res.status(404).send("Replit Auth not configured");
    passport.authenticate("replit", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Fallback for GET request (e.g. if client is stale or user navigates manually)
  app.get("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect("/auth");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    if (user.isApproved) {
      return next();
    }
    return res.status(403).json({ message: "Account pending approval" });
  }
  res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    if (user.isAdmin && user.isApproved) {
      return next();
    }
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
};
