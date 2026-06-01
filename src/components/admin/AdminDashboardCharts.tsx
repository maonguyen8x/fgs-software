"use client";

import type { DashboardAnalytics } from "@/lib/analytics/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Mail, Users, Eye, TrendingUp } from "lucide-react";

interface AdminDashboardChartsProps {
  data: DashboardAnalytics;
  labels: {
    visitors: string;
    thisMonth: string;
    unique: string;
    messages: string;
    partners: string;
    team: string;
    monthlyChart: string;
    countryChart: string;
    visits: string;
  };
}

export function AdminDashboardCharts({ data, labels }: AdminDashboardChartsProps) {
  const maxMonth = Math.max(1, ...data.byMonth.map((m) => m.count));
  const maxCountry = Math.max(1, ...data.byCountry.map((c) => c.count));

  const statCards = [
    { label: labels.visitors, value: data.totalVisits, icon: Eye, color: "text-blue-600 bg-blue-50" },
    { label: labels.thisMonth, value: data.visitsThisMonth, icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
    { label: labels.unique, value: data.uniqueSessionsThisMonth, icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { label: labels.messages, value: data.messageCount, icon: Mail, color: "text-rose-600 bg-rose-50" },
    { label: labels.partners, value: data.partnerCount, icon: Globe, color: "text-amber-600 bg-amber-50" },
    { label: labels.team, value: data.teamCount, icon: Users, color: "text-cyan-600 bg-cyan-50" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{labels.monthlyChart}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end justify-between gap-2 px-1">
              {data.byMonth.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">{m.count}</span>
                  <div
                    className="w-full max-w-[3rem] rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all"
                    style={{ height: `${Math.max(8, (m.count / maxMonth) * 160)}px` }}
                    title={`${m.label}: ${m.count}`}
                  />
                  <span className="text-[10px] font-medium text-slate-500">{m.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{labels.countryChart}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.byCountry.length === 0 ? (
              <p className="text-sm text-slate-500">{labels.visits}: 0</p>
            ) : (
              data.byCountry.map((c) => (
                <div key={c.countryCode}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {c.country}{" "}
                      <span className="text-slate-400">({c.countryCode})</span>
                    </span>
                    <span className="font-semibold text-slate-900">{c.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(c.count / maxCountry) * 100}%`,
                        backgroundColor: c.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
