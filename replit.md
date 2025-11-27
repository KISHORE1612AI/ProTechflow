# ProU TaskBoard - Team Task Management & Analytics Dashboard

## Overview
ProU TaskBoard is a production-ready full-stack Team Task Management & Analytics Dashboard featuring:
- Responsive Kanban board with drag-and-drop functionality
- Real-time collaboration via WebSockets
- Interactive analytics with Chart.js visualizations
- Secure authentication via Replit Auth (supports Google, GitHub, email)
- PostgreSQL database with Drizzle ORM
- Modern UI with Tailwind CSS and Shadcn/UI components

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Real-time**: WebSockets (ws library)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Charts**: Recharts
- **Drag & Drop**: @hello-pangea/dnd

## Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Page components
│   └── index.html
├── server/                 # Backend Express server
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── replitAuth.ts      # Authentication setup
├── shared/                # Shared types and schemas
│   └── schema.ts          # Drizzle ORM schemas
└── design_guidelines.md   # UI/UX design guidelines
```

## Key Features
1. **Kanban Board**: 5 columns (Backlog, To Do, In Progress, Review, Done) with drag-and-drop
2. **Task Management**: Create, edit, delete tasks with priorities, due dates, assignees, labels
3. **Real-time Updates**: WebSocket-based instant updates across all connected clients
4. **Analytics Dashboard**: Interactive charts showing task completion trends, user workload, priority distribution
5. **Project Organization**: Create projects to organize tasks
6. **Comments**: Add comments to tasks for collaboration
7. **Filters**: Quick filters for My Tasks, Due Soon, Overdue

## API Endpoints
- `GET /api/auth/user` - Get current authenticated user
- `GET /api/users` - Get all users
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create project
- `GET /api/tasks` - Get tasks (with optional filters)
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/comments` - Get task comments
- `POST /api/tasks/:taskId/comments` - Add comment

## Database Schema
- **users**: User accounts (id, email, firstName, lastName, profileImageUrl, role)
- **projects**: Project containers (id, name, description, color, ownerId)
- **tasks**: Task items (id, title, description, status, priority, dueDate, position, projectId, assigneeId, labels)
- **comments**: Task comments (id, content, taskId, authorId)
- **sessions**: Authentication sessions

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database
- `npm run build` - Build for production

## Environment Variables
Required environment variables are automatically provided by Replit:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `REPL_ID` - Replit app identifier

## Recent Changes
- Initial implementation of full-stack task management dashboard
- Implemented Replit Auth for secure authentication
- Added Kanban board with drag-and-drop functionality
- Created analytics dashboard with Recharts
- Added WebSocket support for real-time updates
- Implemented project management and task comments
