import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { UserAvatar } from "./user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  LayoutDashboard,
  BarChart3,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import type { User } from "@shared/schema";
import { cn } from "@/lib/utils";

type TopNavProps = {
  user?: User;
  onSearch?: (query: string) => void;
};

export function TopNav({ user, onSearch }: TopNavProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const { data: pendingUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/notifications"],
    enabled: user?.isAdmin,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const viewItems = [
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

  return (
    <header className="h-16 glass flex items-center justify-between px-4 gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9"
            data-testid="input-search"
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
          {viewItems.map((item) => (
            <Link key={item.title} href={item.url}>
              <Button
                variant={item.isActive ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid={`view-${item.title.toLowerCase()}`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.title}</span>
              </Button>
            </Link>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
              {pendingUsers.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-2 font-medium border-b">Notifications</div>
            {pendingUsers.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No new notifications
              </div>
            ) : (
              pendingUsers.map((u) => (
                <DropdownMenuItem key={u.id} className="flex flex-col items-start p-3 gap-1 cursor-default">
                  <div className="font-medium text-sm">New Account Request</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">{u.firstName} {u.lastName}</span> ({u.username}) has requested an account.
                  </div>
                </DropdownMenuItem>
              ))
            )}
            {pendingUsers.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="w-full cursor-pointer justify-center text-primary font-medium">
                  <Link href="/admin">View All Requests</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 px-2"
              data-testid="button-user-dropdown"
            >
              <UserAvatar user={user} size="sm" />
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">
                {user?.firstName || user?.lastName
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="dropdown-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
              data-testid="dropdown-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
