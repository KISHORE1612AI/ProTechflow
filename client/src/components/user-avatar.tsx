import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@shared/schema";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  user?: User | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
};

export function UserAvatar({ user, size = "sm", className }: UserAvatarProps) {
  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() ||
      user.email?.charAt(0).toUpperCase() ||
      "?"
    : "?";

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user?.profileImageUrl && (
        <AvatarImage
          src={user.profileImageUrl}
          alt={`${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
