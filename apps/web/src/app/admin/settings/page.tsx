"use client";

import { useEffect, useState } from "react";
import { Save, Clock, IndianRupee, Calendar, FileText, Bell, Wallet, Timer, Send, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

const configKeys = [
  { key: "global_consultation_fee", label: "Default Consultation Fee (₹)", icon: IndianRupee, type: "number" },
  { key: "platform_commission_percent", label: "Platform Commission (%)", icon: IndianRupee, type: "number" },
  { key: "default_consultation_duration_minutes", label: "Consultation Duration (minutes)", icon: Timer, type: "number" },
  { key: "max_wallet_balance", label: "Max Wallet Balance (₹)", icon: Wallet, type: "number" },
  { key: "report_upload_window_days", label: "Report Upload Window (days)", icon: FileText, type: "number" },
  { key: "doctor_reply_deadline_hours", label: "Doctor Reply Deadline (hours)", icon: Clock, type: "number" },
  { key: "min_call_duration_for_charge", label: "Min Call Duration for Charge (seconds)", icon: Clock, type: "number" },
  { key: "max_reschedule_count", label: "Max Reschedules per Booking", icon: Calendar, type: "number" },
];

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<string[]>([]);

  // Notification state
  const [notifTarget, setNotifTarget] = useState("all_patients");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifUserId, setNotifUserId] = useState("");
  const [notifCategoryId, setNotifCategoryId] = useState("");
  const [notifSending, setNotifSending] = useState(false);
  const [notifResult, setNotifResult] = useState<string | null>(null);

  // Data for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    // Load all configs in parallel
    Promise.all(
      configKeys.map(async (c) => {
        try {
          const data = await adminApi(`/admin/config/${c.key}`);
          return { key: c.key, value: data?.value };
        } catch { return null; }
      })
    ).then((results) => {
      const map: Record<string, any> = {};
      results.forEach((r) => { if (r) map[r.key] = r.value; });
      setConfigs(map);
    });

    // Load categories for notification dropdown
    adminApi("/categories/all").then(setCategories).catch(() => {});
    // Load patients and doctors for user dropdown
    adminApi("/admin/patients?limit=200").then((d: any) => setPatients(d?.data || d || [])).catch(() => {});
    adminApi("/admin/doctors").then((d: any) => setDoctors(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const saveConfig = async (key: string) => {
    const value = Number(edited[key] ?? configs[key]);
    if (isNaN(value)) return;
    try {
      await adminApi("/admin/config", { method: "POST", body: JSON.stringify({ key, value }) });
      setConfigs((prev) => ({ ...prev, [key]: value }));
      setSavedKeys((prev) => [...prev, key]);
      setTimeout(() => setSavedKeys((prev) => prev.filter((k) => k !== key)), 2000);
    } catch (e: any) {
      alert("Failed: " + (e.message || "Error"));
    }
  };

  const sendNotification = async () => {
    if (!notifTitle || !notifBody) return alert("Fill title and message");
    if (notifTarget === "specific_user" && !notifUserId) return alert("Select a user");
    if (notifTarget === "category_doctors" && !notifCategoryId) return alert("Select a category");

    setNotifSending(true);
    setNotifResult(null);
    try {
      const result: any = await adminApi("/admin/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          target: notifTarget,
          type: "admin_notification",
          title: notifTitle,
          body: notifBody,
          ...(notifTarget === "specific_user" && { userId: notifUserId }),
          ...(notifTarget === "category_doctors" && { categoryId: notifCategoryId }),
        }),
      });
      setNotifResult(`Sent to ${result?.sent || 0} user(s)`);
      setNotifTitle("");
      setNotifBody("");
    } catch (e: any) {
      setNotifResult(`Failed: ${e.message || "Error"}`);
    }
    setNotifSending(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
      <p className="text-slate-400">Configure platform-wide settings. Changes apply immediately.</p>

      <div className="grid gap-4">
        {configKeys.map((c) => (
          <Card key={c.key}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <c.icon className="w-5 h-5 text-teal-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{c.label}</p>
                <p className="text-xs text-slate-500">{c.key}</p>
              </div>
              <Input
                type="number"
                className="w-32"
                value={edited[c.key] ?? configs[c.key] ?? ""}
                onChange={(e) => setEdited((prev) => ({ ...prev, [c.key]: e.target.value }))}
              />
              <Button size="sm" onClick={() => saveConfig(c.key)} disabled={savedKeys.includes(c.key)}>
                {savedKeys.includes(c.key) ? <><CheckCircle className="w-3 h-3" /> Saved</> : <><Save className="w-3 h-3" /> Save</>}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Send Notification */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Send Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Target */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Send To *</label>
            <select
              value={notifTarget}
              onChange={(e) => setNotifTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm h-11"
            >
              <option value="all_patients">All Patients</option>
              <option value="all_doctors">All Doctors</option>
              <option value="category_doctors">Doctors in Specific Category</option>
              <option value="specific_user">Specific User</option>
            </select>
          </div>

          {/* Category dropdown — shown only for category_doctors */}
          {notifTarget === "category_doctors" && (
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Select Category *</label>
              <select
                value={notifCategoryId}
                onChange={(e) => setNotifCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm h-11"
              >
                <option value="">— Choose a category —</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name} {!cat.isActive ? "(inactive)" : ""}</option>
                ))}
              </select>
              {notifCategoryId && (
                <p className="text-xs text-slate-500 mt-1">
                  {categories.find((c: any) => c.id === notifCategoryId)?._count?.doctors || 0} doctors in this category
                </p>
              )}
            </div>
          )}

          {/* User dropdown — shown only for specific_user */}
          {notifTarget === "specific_user" && (
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Select User *</label>
              <select
                value={notifUserId}
                onChange={(e) => setNotifUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm h-11"
              >
                <option value="">— Choose a user —</option>
                <optgroup label="Patients">
                  {patients.map((p: any) => (
                    <option key={p.id} value={p.user?.id || p.userId}>{p.name || "Unknown"} — {p.user?.phone || p.user?.email || ""}</option>
                  ))}
                </optgroup>
                <optgroup label="Doctors">
                  {doctors.map((d: any) => (
                    <option key={d.id} value={d.userId}>{d.name} — {d.user?.email || d.specialization}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Title *</label>
            <Input placeholder="Notification title" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Message *</label>
            <textarea
              placeholder="Notification message..."
              className="w-full p-3 rounded-xl border bg-transparent text-sm min-h-[80px]"
              value={notifBody}
              onChange={(e) => setNotifBody(e.target.value)}
            />
          </div>

          {/* Result */}
          {notifResult && (
            <div className={`p-3 rounded-xl text-sm font-medium ${notifResult.startsWith("Sent") ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {notifResult}
            </div>
          )}

          <Button className="w-full" onClick={sendNotification} disabled={notifSending}>
            {notifSending ? "Sending..." : <><Send className="w-4 h-4" /> Send Notification</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
