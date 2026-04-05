"use client";

import { useEffect, useState } from "react";
import { User, Save, Clock, Stethoscope, Plus, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIcon } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeOptions: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    timeOptions.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

export default function DoctorSettingsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [maxSessions, setMaxSessions] = useState("");
  const [saving, setSaving] = useState(false);

  // Slot management
  const [slots, setSlots] = useState<{ dayOfWeek: number; startTime: string; endTime: string; isBreak: boolean }[]>([]);
  const [savingSlots, setSavingSlots] = useState(false);

  useEffect(() => {
    adminApi("/doctors/me/profile").then((p: any) => {
      setName(p.name || ""); setBio(p.bio || "");
      setExperience(String(p.experience || ""));
      setMaxSessions(String(p.maxSessionsPerDay || "20"));
      setQualifications((p.qualifications || []).join(", ") || p.qualification || "");
    }).catch(() => {});

    adminApi("/doctors/me/slots").then((s: any) => {
      if (Array.isArray(s) && s.length > 0) setSlots(s.map((sl: any) => ({ dayOfWeek: sl.dayOfWeek, startTime: sl.startTime, endTime: sl.endTime, isBreak: sl.isBreak || false })));
    }).catch(() => {});

    adminApi("/doctors/me/categories").then(setCategories).catch(() => {});
    adminApi("/categories").then(setAllCategories).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await adminApi("/doctors/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: name || undefined, bio: bio || undefined,
          experience: experience ? Number(experience) : undefined,
          maxSessionsPerDay: maxSessions ? Number(maxSessions) : undefined,
          qualification: qualifications || undefined,
        }),
      });
      alert("Profile updated!");
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const saveSlots = async () => {
    setSavingSlots(true);
    try {
      await adminApi("/doctors/me/slots", {
        method: "POST",
        body: JSON.stringify(slots),
      });
      alert("Schedule saved!");
    } catch (e: any) { alert(e.message); }
    setSavingSlots(false);
  };

  const addSlot = (dayOfWeek: number) => {
    setSlots([...slots, { dayOfWeek, startTime: "09:00", endTime: "17:00", isBreak: false }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: any) => {
    const updated = [...slots];
    (updated[index] as any)[field] = value;
    setSlots(updated);
  };

  const toggleCategory = async (catId: string) => {
    const current = categories.map((c: any) => c.categoryId);
    const updated = current.includes(catId) ? current.filter((id: string) => id !== catId) : [...current, catId];
    try {
      const result = await adminApi("/doctors/me/categories", { method: "POST", body: JSON.stringify({ categoryIds: updated }) });
      setCategories(result);
    } catch (e: any) { alert(e.message); }
  };

  const selectedCatIds = categories.map((c: any) => c.categoryId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Profile & Settings</h1>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Edit profile */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Edit Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Display Name</label>
              <Input placeholder="Dr. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Qualifications (comma separated)</label>
              <Input placeholder="MBBS, MD, DNB" value={qualifications} onChange={(e) => setQualifications(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Bio / About</label>
              <textarea className="w-full p-3 rounded-xl border bg-transparent text-sm min-h-[100px]" placeholder="Tell patients about your experience..." value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Experience (years)</label>
                <Input type="number" placeholder="8" value={experience} onChange={(e) => setExperience(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Max Sessions/Day</label>
                <Input type="number" placeholder="20" value={maxSessions} onChange={(e) => setMaxSessions(e.target.value)} />
              </div>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="w-full">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Stethoscope className="w-4 h-4" /> My Specializations</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-4">Select all that match your degrees. You can have multiple.</p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat: any) => {
                const { icon: Icon, color } = getIcon(cat.icon);
                const selected = selectedCatIds.includes(cat.id);
                return (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${selected ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "bg-white/5 text-slate-500 border border-white/10"}`}>
                    <Icon className="w-4 h-4" style={{ color: selected ? undefined : color }} />
                    {cat.name} {selected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Slot Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4" /> Availability Schedule</CardTitle>
            <Button size="sm" onClick={saveSlots} disabled={savingSlots}>
              <Save className="w-3 h-3" /> {savingSlots ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-4">Set your working hours for each day. Patients will only see available slots during these times.</p>

          <div className="space-y-4">
            {dayNames.map((day, dayIndex) => {
              const daySlots = slots.filter(s => s.dayOfWeek === dayIndex);
              return (
                <div key={day} className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold w-24">{day}</span>
                      {daySlots.length === 0 && <span className="text-xs text-slate-500 italic">Day off</span>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => addSlot(dayIndex)}>
                      <Plus className="w-3 h-3" /> Add Slot
                    </Button>
                  </div>
                  {daySlots.map((slot) => {
                    const globalIndex = slots.indexOf(slot);
                    return (
                      <div key={globalIndex} className="flex items-center gap-3 mb-2">
                        <select className="px-3 py-2 rounded-lg border bg-transparent text-sm" value={slot.startTime}
                          onChange={(e) => updateSlot(globalIndex, "startTime", e.target.value)}>
                          {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="text-slate-500">to</span>
                        <select className="px-3 py-2 rounded-lg border bg-transparent text-sm" value={slot.endTime}
                          onChange={(e) => updateSlot(globalIndex, "endTime", e.target.value)}>
                          {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <label className="flex items-center gap-1 text-xs text-slate-400">
                          <input type="checkbox" checked={slot.isBreak} onChange={(e) => updateSlot(globalIndex, "isBreak", e.target.checked)} />
                          Break
                        </label>
                        <Button size="sm" variant="ghost" onClick={() => removeSlot(globalIndex)}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
