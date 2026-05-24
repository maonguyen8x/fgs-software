import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [teamCount, serviceCount, workCount, messageCount, unreadCount] = await Promise.all([
    prisma.teamMember.count(),
    prisma.service.count(),
    prisma.work.count(),
    prisma.message.count(),
    prisma.message.count({ where: { status: "unread" } }),
  ]);

  const stats = [
    { label: "Team Members", value: teamCount },
    { label: "Services", value: serviceCount },
    { label: "Portfolio Works", value: workCount },
    { label: "Messages", value: messageCount },
    { label: "Unread Messages", value: unreadCount },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
