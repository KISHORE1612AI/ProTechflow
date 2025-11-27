import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#0891b2").notNull(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("backlog").notNull(),
  priority: varchar("priority", { length: 10 }).default("medium").notNull(),
  dueDate: timestamp("due_date"),
  position: integer("position").default(0).notNull(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  assigneeId: varchar("assignee_id").references(() => users.id),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  labels: text("labels").array().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task comments table
export const comments = pgTable("comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  content: text("content").notNull(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project members table (for team collaboration)
export const projectMembers = pgTable("project_members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedProjects: many(projects),
  assignedTasks: many(tasks, { relationName: "assignee" }),
  createdTasks: many(tasks, { relationName: "creator" }),
  comments: many(comments),
  projectMemberships: many(projectMembers),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
  members: many(projectMembers),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  creator: one(users, {
    fields: [tasks.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectMemberSchema = createInsertSchema(projectMembers).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertProjectMember = z.infer<typeof insertProjectMemberSchema>;
export type ProjectMember = typeof projectMembers.$inferSelect;

// Extended types for frontend usage
export type TaskWithRelations = Task & {
  assignee?: User | null;
  project?: Project | null;
  creator?: User;
};

export type ProjectWithRelations = Project & {
  owner?: User;
  members?: (ProjectMember & { user?: User })[];
  _count?: { tasks: number };
};

export type CommentWithAuthor = Comment & {
  author?: User;
};

// Task status enum
export const TASK_STATUSES = ["backlog", "todo", "inprogress", "review", "done"] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

// Task priority enum  
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

// Status display configuration
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "bg-slate-400" },
  todo: { label: "To Do", color: "bg-blue-500" },
  inprogress: { label: "In Progress", color: "bg-amber-500" },
  review: { label: "Review", color: "bg-purple-500" },
  done: { label: "Done", color: "bg-emerald-500" },
};

// Priority display configuration
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: "Low", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950" },
  medium: { label: "Medium", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950" },
  high: { label: "High", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950" },
};
