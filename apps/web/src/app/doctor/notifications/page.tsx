"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, Calendar, FileText, CreditCard, Shield, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

const typeIcons: Record<string, { icon: any; color: string }> = {
  report: { icon: FileText, color: "#3b82f6" },
  account_status: { icon: Shield, color: "#10b981" },
  booking: { icon: Calendar, color: "#f59e0b" },
  payment: { icon: CreditCard, color: "#8b5cf6" },
  admin_notification: { icon: Bell, color: "#0d9488" },
};

export default function DoctorNotificationsPage() {
  const [data, setData] = useState<any>({ data: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setData(await adminApi("/notifications")); } catch {}
    setLoading(false);
  };

  const markAllRead = async () => {
    await adminApi("/notifications/read-all", { method: "POST" });
    load();
  };

  const markRead = async (id: string) => {
    await adminApi(`/notifications/${id}/read`, { method: "POST" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="text-slate-400 mt-1">{data.unreadCount || 0} unread</p>
        </div>
        {data.unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </Button>
        )}
      </div>

      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-2">
          {data.data?.map((n: any) => {
            const typeInfo = typeIcons[n.type] || typeIcons.admin_notification;
            const Icon = typeInfo.icon;
            return (
              <Card key={n.id} className={n.isRead ? "opacity-60" : ""}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: typeInfo.color + "15" }}>
                    <Icon className="w-5 h-5" style={{ color: typeInfo.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{n.title}</p>
                      {!n.isRead && <Badge variant="default" className="text-[10px]">New</Badge>}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{n.body}</p>
                    <p className="text-[10px] text-slate-600 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.isRead && (
                    <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>
                      <CheckCheck className="w-3 h-3" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {data.data?.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No notifications yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
