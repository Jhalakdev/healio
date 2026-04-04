"use client";

import { useEffect, useState } from "react";
import { Save, Clock, IndianRupee, Calendar, FileText, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

const configKeys = [
  { key: "global_consultation_fee", label: "Default Consultation Fee (₹)", icon: IndianRupee, type: "number" },
  { key: "platform_commission_percent", label: "Platform Commission (%)", icon: IndianRupee, type: "number" },
  { key: "report_upload_window_days", label: "Report Upload Window (days)", icon: FileText, type: "number" },
  { key: "doctor_reply_deadline_hours", label: "Doctor Reply Deadline (hours)", icon: Clock, type: "number" },
  { key: "min_call_duration_for_charge", label: "Min Call Duration for Charge (seconds)", icon: Clock, type: "number" },
  { key: "max_reschedule_count", label: "Max Reschedules per Booking", icon: Calendar, type: "number" },
];

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [edited, setEdited] = useState<Record<string, string>>({});

  useEffect(() => {
    configKeys.forEach(async (c) => {
      try {
        const data = await adminApi(`/admin/config/${c.key}`);
        if (data) setConfigs((prev) => ({ ...prev, [c.key]: data.value }));
      } catch {}
    });
  }, []);

  const saveConfig = async (key: string) => {
    const value = Number(edited[key] ?? configs[key]);
    await adminApi("/admin/config", { method: "POST", body: JSON.stringify({ key, value }) });
    setConfigs((prev) => ({ ...prev, [key]: value }));
    alert(`${key} updated to ${value}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
      <p className="text-slate-400">Configure platform-wide settings. Changes apply immediately.</p>

      <div className="grid gap-4">
        {configKeys.map((c) => (
          <Card key={c.key}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <c.icon className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{c.label}</p>
                <p className="text-xs text-slate-400">Key: {c.key}</p>
              </div>
              <Input
                type="number"
                className="w-32"
                value={edited[c.key] ?? configs[c.key] ?? ""}
                onChange={(e) => setEdited((prev) => ({ ...prev, [c.key]: e.target.value }))}
              />
              <Button size="sm" onClick={() => saveConfig(c.key)}>
                <Save className="w-3 h-3" /> Save
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Send notification — targeted */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Send Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Send To *</label>
            <select id="notif-target" className="w-full px-3 py-2 rounded-xl border text-sm h-11">
              <option value="all_patients">All Patients</option>
              <option value="all_doctors">All Doctors</option>
              <option value="category_doctors">Doctors in Specific Category</option>
              <option value="specific_user">Specific User (by ID)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">User ID (for specific user only)</label>
            <Input placeholder="User ID (only if targeting specific user)" id="notif-userid" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Category ID (for category doctors only)</label>
            <Input placeholder="Category ID (only if targeting category)" id="notif-catid" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Title *</label>
            <Input placeholder="Notification title" id="notif-title" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Message *</label>
            <textarea id="notif-body" placeholder="Notification message..." className="w-full p-3 rounded-xl border text-sm min-h-[80px]" />
          </div>
          <Button className="w-full" onClick={async () => {
            const target = (document.getElementById("notif-target") as HTMLSelectElement).value;
            const userId = (document.getElementById("notif-userid") as HTMLInputElement).value;
            const categoryId = (document.getElementById("notif-catid") as HTMLInputElement).value;
            const title = (document.getElementById("notif-title") as HTMLInputElement).value;
            const body = (document.getElementById("notif-body") as HTMLTextAreaElement).value;
            if (!title || !body) return alert("Fill title and message");
            try {
              const result = await adminApi("/admin/notifications/send", {
                method: "POST",
                body: JSON.stringify({
                  target, type: "admin_notification", title, body,
                  ...(userId && { userId }),
                  ...(categoryId && { categoryId }),
                }),
              });
              alert(`Sent! ${(result as any)?.sent || 0} users notified.`);
            } catch (e: any) { alert(e.message); }
          }}>
            <Bell className="w-4 h-4" /> Send Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
