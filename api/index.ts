import { createServer } from 'http';
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
const httpServer = createServer(app);

// Middleware to parse JSON bodies (Vercel might handle this, but good to have)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
// We ignore the promise here as Vercel needs the app exported synchronously-ish, 
// but registerRoutes is async. 
// However, for Vercel, the cold start might wait. 
// Actually, registerRoutes awaits setupAuth.
// We should wrap this.

// Better approach for Vercel with async setup:
// Export a handler function.

export default async function handler(req: any, res: any) {
    // Ensure routes are registered
    await registerRoutes(httpServer, app);

    // Forward request to express app
    app(req, res);
}
