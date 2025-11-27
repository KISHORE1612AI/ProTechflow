import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./user-avatar";
import {
  LayoutDashboard,
  BarChart3,
  FolderKanban,
  ListFilter,
  Clock,
  AlertCircle,
  Plus,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import type { User, Project } from "@shared/schema";

type AppSidebarProps = {
  user?: User;
  projects?: Project[];
  selectedProjectId?: number | null;
  onSelectProject: (projectId: number | null) => void;
  onCreateProject: () => void;
  taskCounts?: {
    myTasks: number;
    dueSoon: number;
    overdue: number;
  };
};

export function AppSidebar({
  user,
  projects = [],
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  taskCounts = { myTasks: 0, dueSoon: 0, overdue: 0 },
}: AppSidebarProps) {
  const [location] = useLocation();

  const mainNavItems = [
    {
      title: "Board",
      url: "/",
      icon: LayoutDashboard,
      isActive: location === "/" || location === "/board",
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      isActive: location === "/analytics",
    },
  ];

  const quickFilters = [
    {
      title: "My Tasks",
      icon: ListFilter,
      count: taskCounts.myTasks,
      filter: "my-tasks",
    },
    {
      title: "Due Soon",
      icon: Clock,
      count: taskCounts.dueSoon,
      filter: "due-soon",
    },
    {
      title: "Overdue",
      icon: AlertCircle,
      count: taskCounts.overdue,
      filter: "overdue",
      variant: "destructive" as const,
    },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <FolderKanban className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-sidebar-foreground">
              ProU TaskBoard
            </h1>
            <p className="text-xs text-muted-foreground">Team Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground px-2">
            Quick Filters
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickFilters.map((filter) => (
                <SidebarMenuItem key={filter.title}>
                  <SidebarMenuButton
                    className="justify-between"
                    data-testid={`filter-${filter.filter}`}
                  >
                    <div className="flex items-center gap-2">
                      <filter.icon className="h-4 w-4" />
                      <span>{filter.title}</span>
                    </div>
                    {filter.count > 0 && (
                      <Badge
                        variant={filter.variant || "secondary"}
                        className="text-xs"
                      >
                        {filter.count}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
              Projects
            </SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onCreateProject}
              data-testid="button-add-project"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedProjectId === null}
                  onClick={() => onSelectProject(null)}
                  data-testid="filter-all-projects"
                >
                  <FolderKanban className="h-4 w-4" />
                  <span>All Projects</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    isActive={selectedProjectId === project.id}
                    onClick={() => onSelectProject(project.id)}
                    data-testid={`project-${project.id}`}
                  >
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto py-2 px-2"
              data-testid="button-user-menu"
            >
              <div className="flex items-center gap-2">
                <UserAvatar user={user} size="sm" />
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {user?.firstName || user?.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : user?.email || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem data-testid="menu-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
              data-testid="menu-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
