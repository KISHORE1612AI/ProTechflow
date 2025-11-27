import { useState } from "react";
import { useLocation, Link } from "wouter";
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
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 gap-4">
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

        <Button variant="ghost" size="icon" data-testid="button-notifications">
          <Bell className="h-4 w-4" />
        </Button>

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
