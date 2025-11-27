import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FolderKanban,
  BarChart3,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  LayoutDashboard,
  Bell,
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: LayoutDashboard,
      title: "Kanban Board",
      description:
        "Drag and drop tasks across customizable columns. Visualize your workflow and track progress effortlessly.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Get insights into team productivity with interactive charts showing tasks completed, workload distribution, and more.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Assign tasks, leave comments, and work together in real-time. Everyone stays in sync automatically.",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description:
        "See changes instantly as they happen. When a teammate moves a task, you'll see it update immediately.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Stay on top of due dates and assignments. Never miss an important deadline again.",
    },
    {
      icon: CheckCircle,
      title: "Priority Management",
      description:
        "Categorize tasks by priority and focus on what matters most. Color-coded badges make it easy to scan.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">ProU TaskBoard</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Built by ProU Technology
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
              Manage Your Team's Tasks with{" "}
              <span className="text-primary">Clarity & Speed</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A powerful task management dashboard with Kanban boards, real-time
              collaboration, and insightful analytics. Keep your team aligned and
              productive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Stay Organized
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ProU TaskBoard combines powerful features with a beautiful,
                intuitive interface that your team will love.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="bg-card hover-elevate transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Ready to boost your team's productivity?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Join teams who trust ProU TaskBoard to manage their projects
                efficiently. Get started in minutes.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleLogin}
                data-testid="button-start-now"
              >
                Start Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">ProU TaskBoard</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with care by ProU Technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
