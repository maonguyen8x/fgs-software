"use client";

import type { RecentVisitRow } from "@/lib/analytics/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface AdminVisitorsTableProps {
  visits: RecentVisitRow[];
  labels: {
    title: string;
    subtitle: string;
    time: string;
    country: string;
    path: string;
    session: string;
    empty: string;
  };
}

export function AdminVisitorsTable({ visits, labels }: AdminVisitorsTableProps) {
  const formatTime = (iso: string) => new Date(iso).toLocaleString();

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-5 w-5 text-primary-600" />
          {labels.title}
        </CardTitle>
        <p className="text-sm text-slate-500">{labels.subtitle}</p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {visits.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-slate-500">{labels.empty}</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{labels.time}</th>
                <th className="px-4 py-3">{labels.country}</th>
                <th className="px-4 py-3">{labels.path}</th>
                <th className="px-4 py-3">{labels.session}</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{formatTime(v.createdAt)}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-slate-800">{v.country}</span>
                    <span className="ml-1 text-slate-400">({v.countryCode})</span>
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-2.5 text-slate-600" title={v.path ?? "/"}>
                    {v.path ?? "/"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{v.sessionKey.slice(0, 8)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
