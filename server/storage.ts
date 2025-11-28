import {
  users,
  projects,
  tasks,
  comments,
  projectMembers,
  type User,
  type UpsertUser,
  type InsertProject,
  type Project,
  type InsertTask,
  type Task,
  type InsertComment,
  type Comment,
  type TaskWithRelations,
  type CommentWithAuthor,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  approveUser(id: string): Promise<User | undefined>;
  rejectUser(id: string): Promise<void>;
  getLeaderboard(): Promise<User[]>;

  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;

  // Task operations
  getTasks(filters?: { projectId?: number; assigneeId?: string; status?: string }): Promise<TaskWithRelations[]>;
  getTask(id: number): Promise<TaskWithRelations | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;
  getMaxPosition(status: string): Promise<number>;

  // Comment operations
  getComments(taskId: number): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.firstName));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: UpsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      isApproved: false, // Default to false for new registrations
      isAdmin: false,
    }).returning();
    return newUser;
  }

  async approveUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isApproved: true })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async rejectUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Project operations
  async getProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Task operations
  async getTasks(filters?: { projectId?: number; assigneeId?: string; status?: string }): Promise<TaskWithRelations[]> {
    const baseQuery = db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        position: tasks.position,
        projectId: tasks.projectId,
        assigneeId: tasks.assigneeId,
        creatorId: tasks.creatorId,
        labels: tasks.labels,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assignee: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        project: {
          id: projects.id,
          name: projects.name,
          description: projects.description,
          color: projects.color,
          ownerId: projects.ownerId,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .orderBy(asc(tasks.position));

    const result = await baseQuery;

    let filteredResult = result;
    if (filters?.projectId) {
      filteredResult = filteredResult.filter(t => t.projectId === filters.projectId);
    }
    if (filters?.assigneeId) {
      filteredResult = filteredResult.filter(t => t.assigneeId === filters.assigneeId);
    }
    if (filters?.status) {
      filteredResult = filteredResult.filter(t => t.status === filters.status);
    }

    return filteredResult.map(row => ({
      ...row,
      assignee: row.assignee?.id ? row.assignee : null,
      project: row.project?.id ? row.project : null,
    })) as TaskWithRelations[];
  }

  async getTask(id: number): Promise<TaskWithRelations | undefined> {
    const [row] = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        position: tasks.position,
        projectId: tasks.projectId,
        assigneeId: tasks.assigneeId,
        creatorId: tasks.creatorId,
        labels: tasks.labels,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assignee: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.id, id));

    if (!row) return undefined;

    return {
      ...row,
      assignee: row.assignee?.id ? row.assignee : null,
    } as TaskWithRelations;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const maxPosition = await this.getMaxPosition(task.status || "backlog");
    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, position: maxPosition + 1 })
      .returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [currentTask] = await db.select().from(tasks).where(eq(tasks.id, id));

    if (currentTask && (task as any).status === "done" && currentTask.status !== "done") {
      // Award XP to assignee
      if (currentTask.assigneeId) {
        const [user] = await db.select().from(users).where(eq(users.id, currentTask.assigneeId));
        if (user) {
          const newXp = (user.xp || 0) + 10;
          const newLevel = Math.floor(newXp / 100) + 1;

          await db.update(users)
            .set({ xp: newXp, level: newLevel })
            .where(eq(users.id, user.id));
        }
      }
    }

    const [updated] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async getLeaderboard(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.xp))
      .limit(10);
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getMaxPosition(status: string): Promise<number> {
    const [result] = await db
      .select({ maxPos: sql<number>`COALESCE(MAX(${tasks.position}), 0)` })
      .from(tasks)
      .where(eq(tasks.status, status));
    return result?.maxPos || 0;
  }

  // Comment operations
  async getComments(taskId: number): Promise<CommentWithAuthor[]> {
    const result = await db
      .select({
        id: comments.id,
        content: comments.content,
        taskId: comments.taskId,
        authorId: comments.authorId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.taskId, taskId))
      .orderBy(asc(comments.createdAt));

    return result.map(row => ({
      ...row,
      author: row.author?.id ? row.author : undefined,
    })) as CommentWithAuthor[];
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }
}

export const storage = new DatabaseStorage();
