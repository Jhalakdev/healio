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

      {/* Send notification */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Broadcast Notification</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Title" id="notif-title" />
          <Input placeholder="Body" id="notif-body" />
          <Button onClick={async () => {
            const title = (document.getElementById("notif-title") as HTMLInputElement).value;
            const body = (document.getElementById("notif-body") as HTMLInputElement).value;
            if (!title || !body) return alert("Fill title and body");
            await adminApi("/admin/notifications/send", {
              method: "POST", body: JSON.stringify({ type: "announcement", title, body }),
            });
            alert("Notification sent to all patients!");
          }}>
            <Bell className="w-4 h-4" /> Send to All Patients
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
