# ProU TaskBoard - Team Task Management & Analytics Dashboard

## Overview
ProU TaskBoard is a production-ready full-stack Team Task Management & Analytics Dashboard featuring:
- Responsive Kanban board with drag-and-drop functionality
- Real-time collaboration via WebSockets
- Interactive analytics with Chart.js visualizations
- Secure authentication via Replit Auth (supports Google, GitHub, email)
- PostgreSQL database with Drizzle ORM
- Modern UI with Tailwind CSS and Shadcn/UI components

## Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd ProTechFlow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file with the following variables:
    ```env
    DATABASE_URL=postgresql://user:password@host:port/dbname
    SESSION_SECRET=your_session_secret
    # Optional: For Replit Auth
    # REPL_ID=...
    # ISSUER_URL=...
    ```

4.  **Run Database Migrations**
    ```bash
    npm run db:push
    ```

5.  **Start Development Server**
    ```bash
    npm run dev
    ```

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

### Local development without Replit Auth
Replit Auth requires `REPL_ID`, `ISSUER_URL`, and other OIDC env vars. When running locally you can skip the real login by enabling the mock auth layer:

1. Ensure `DATABASE_URL` and `SESSION_SECRET` are still present in `.env`.
2. Add `MOCK_AUTH=true` to `.env` (this is enabled automatically when `REPL_ID` is missing in non-production environments).
3. Run `npm run dev` – the API will automatically sign requests in as a development user (`dev-user`), so every authenticated route works without hitting the real OIDC provider.

Mock auth never runs in production because `NODE_ENV=production` forces the real Replit Auth setup.

## Environment Variables
Required environment variables are automatically provided by Replit:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `REPL_ID` - Replit app identifier

## Deployment

### Docker
The application is containerized using Docker. To build and run:

1.  **Build the image**
    ```bash
    docker build -t prou-taskboard .
    ```

2.  **Run the container**
    ```bash
    docker run -p 5000:5000 -e DATABASE_URL=... -e SESSION_SECRET=... prou-taskboard
    ```

### Render / Railway
1.  Connect your GitHub repository.
2.  The platform should automatically detect the `Dockerfile`.
3.  Set the environment variables (`DATABASE_URL`, `SESSION_SECRET`).
4.  Deploy.

## Assumptions & Bonus Features

### Assumptions
- Users prefer a Kanban-style view for task management.
- Real-time updates are critical for team collaboration.
- The application is intended to be responsive across devices.

### Bonus Features Implemented
- **Authentication**: Implemented a dual-strategy authentication system supporting both Replit Auth (OIDC) and standard Username/Password (Local Strategy) for portability.
- **Deployment**: Added `Dockerfile` for easy deployment to any container platform (Render, Railway, etc.).
- **Real-time Collaboration**: WebSocket integration for instant updates on task changes and comments.
- **Advanced UI**: Polished UI using Shadcn/UI and Tailwind CSS with dark mode support.
- **Analytics**: Integrated charts for visualizing project progress.

## Screenshots
*(Please include screenshots of the Dashboard, Kanban Board, and Analytics view here)*

