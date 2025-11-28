import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, X } from "lucide-react";
import type { User, Project } from "@shared/schema";
import { EmptyState } from "@/components/empty-state";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [, navigate] = useLocation();
    const { toast } = useToast();

    // Redirect if not admin
    if (user && !user.isAdmin) {
        navigate("/");
    }

    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
    });

    const { data: projects = [] } = useQuery<Project[]>({
        queryKey: ["/api/projects"],
    });

    const approveMutation = useMutation({
        mutationFn: async (userId: string) => {
            return await apiRequest("POST", `/api/admin/approve/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "User approved successfully" });
        },
        onError: () => {
            toast({ title: "Failed to approve user", variant: "destructive" });
        },
    });

    const handleApprove = (userId: string) => {
        approveMutation.mutate(userId);
    };

    const rejectMutation = useMutation({
        mutationFn: async (userId: string) => {
            return await apiRequest("POST", `/api/admin/reject/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
            toast({ title: "User request rejected" });
        },
        onError: () => {
            toast({ title: "Failed to reject user", variant: "destructive" });
        },
    });

    const handleReject = (userId: string) => {
        if (confirm("Are you sure you want to reject this user? This action cannot be undone.")) {
            rejectMutation.mutate(userId);
        }
    };

    const sidebarStyle = {
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3rem",
    };

    return (
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
                <AppSidebar
                    user={user}
                    projects={projects}
                    selectedProjectId={null}
                    onSelectProject={() => { }}
                    onCreateProject={() => { }}
                    taskCounts={{ myTasks: 0, dueSoon: 0, overdue: 0 }}
                />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                    <TopNav user={user} />
                    <main className="flex-1 overflow-auto p-6">
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage user access and approvals
                            </p>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span>{u.username}</span>
                                                        {u.firstName && (
                                                            <span className="text-muted-foreground text-sm">
                                                                ({u.firstName} {u.lastName})
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{u.email || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={u.isAdmin ? "default" : "secondary"}>
                                                        {u.isAdmin ? "Admin" : "User"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={u.isApproved ? "outline" : "destructive"}
                                                        className={u.isApproved ? "border-green-500 text-green-500" : ""}
                                                    >
                                                        {u.isApproved ? "Active" : "Pending"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!u.isApproved && (
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(u.id)}
                                                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                                            >
                                                                {approveMutation.isPending ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Check className="h-4 w-4 mr-1" />
                                                                )}
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleReject(u.id)}
                                                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                                            >
                                                                {rejectMutation.isPending ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <X className="h-4 w-4 mr-1" />
                                                                )}
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
