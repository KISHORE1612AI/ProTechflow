import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";
import type { User } from "@shared/schema";

export function Leaderboard() {
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ["/api/leaderboard"],
    });

    return (
        <Card className="glass border-none shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Contributors
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                {users.map((user, index) => (
                    <div
                        key={user.id}
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center justify-center w-8 font-bold text-muted-foreground">
                            {index === 0 ? (
                                <Medal className="h-5 w-5 text-yellow-500" />
                            ) : index === 1 ? (
                                <Medal className="h-5 w-5 text-gray-400" />
                            ) : index === 2 ? (
                                <Medal className="h-5 w-5 text-amber-600" />
                            ) : (
                                `#${index + 1}`
                            )}
                        </div>
                        <Avatar className="h-8 w-8 border-2 border-primary/20">
                            <AvatarImage src={user.profileImageUrl || undefined} />
                            <AvatarFallback>
                                {user.firstName?.[0]}
                                {user.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium leading-none truncate">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                Level {user.level}
                            </p>
                        </div>
                        <div className="font-bold text-sm text-primary">
                            {user.xp} XP
                        </div>
                    </div>
                ))}
                {users.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                        No active users yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
