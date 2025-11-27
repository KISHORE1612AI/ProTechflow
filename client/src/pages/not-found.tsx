import { Button } from "@/components/ui/button";
import { FolderKanban, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <FolderKanban className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">Page not found</p>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button data-testid="button-go-home">
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
