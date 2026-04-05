"use client";

import { useEffect, useState } from "react";
import { User, Save, Stethoscope, Plus, Trash2, Calendar, Clock, Copy, ChevronDown, ChevronUp, Coffee, Sun, Moon, Sunrise } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIcon } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const timeOptions: string[] = [];
for (let h = 5; h < 23; h++) {
  for (let m = 0; m < 60; m += 15) {
    timeOptions.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function formatTime12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getTimeIcon(t: string) {
  const h = parseInt(t.split(":")[0]);
  if (h < 12) return Sunrise;
  if (h < 17) return Sun;
  return Moon;
}

// Quick presets
const presets = [
  { label: "Morning Clinic", start: "09:00", end: "13:00" },
  { label: "Afternoon Clinic", start: "14:00", end: "18:00" },
  { label: "Full Day", start: "09:00", end: "18:00" },
  { label: "Evening Only", start: "17:00", end: "21:00" },
];

type SlotData = { dayOfWeek: number; startTime: string; endTime: string; isBreak: boolean };

export default function DoctorSettingsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [maxSessions, setMaxSessions] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "schedule" | "specializations">("schedule");

  // Slots
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [savingSlots, setSavingSlots] = useState(false);
  const [savedSlots, setSavedSlots] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(1); // Monday expanded by default

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
        body: JSON.stringify({ name: name || undefined, bio: bio || undefined, experience: experience ? Number(experience) : undefined, maxSessionsPerDay: maxSessions ? Number(maxSessions) : undefined, qualification: qualifications || undefined }),
      });
      alert("Profile updated!");
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const saveSlots = async () => {
    setSavingSlots(true);
    try {
      await adminApi("/doctors/me/slots", { method: "POST", body: JSON.stringify(slots) });
      setSavedSlots(true);
      setTimeout(() => setSavedSlots(false), 3000);
    } catch (e: any) { alert(e.message); }
    setSavingSlots(false);
  };

  const addSlot = (dayOfWeek: number, start = "09:00", end = "17:00") => {
    setSlots([...slots, { dayOfWeek, startTime: start, endTime: end, isBreak: false }]);
  };

  const removeSlot = (index: number) => setSlots(slots.filter((_, i) => i !== index));

  const updateSlot = (index: number, field: string, value: any) => {
    const updated = [...slots];
    (updated[index] as any)[field] = value;
    setSlots(updated);
  };

  const toggleDayOff = (dayIndex: number) => {
    const daySlots = slots.filter(s => s.dayOfWeek === dayIndex);
    if (daySlots.length > 0) {
      setSlots(slots.filter(s => s.dayOfWeek !== dayIndex));
    } else {
      addSlot(dayIndex);
      setExpandedDay(dayIndex);
    }
  };

  const copyToAll = (dayIndex: number) => {
    const sourceSlots = slots.filter(s => s.dayOfWeek === dayIndex);
    if (sourceSlots.length === 0) return;
    const newSlots = slots.filter(s => s.dayOfWeek === dayIndex); // keep source
    for (let d = 0; d < 7; d++) {
      if (d === dayIndex) continue;
      sourceSlots.forEach(s => {
        newSlots.push({ ...s, dayOfWeek: d });
      });
    }
    setSlots(newSlots);
  };

  const applyPreset = (dayIndex: number, start: string, end: string) => {
    // Remove existing slots for this day, add preset
    const filtered = slots.filter(s => s.dayOfWeek !== dayIndex);
    filtered.push({ dayOfWeek: dayIndex, startTime: start, endTime: end, isBreak: false });
    setSlots(filtered);
    setExpandedDay(dayIndex);
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

  // Calculate weekly hours
  const totalMinutes = slots.filter(s => !s.isBreak).reduce((acc, s) => {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    return acc + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
  const daysWorking = new Set(slots.filter(s => !s.isBreak).map(s => s.dayOfWeek)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1.5">
        {[
          { key: "schedule" as const, label: "Availability Schedule", icon: Calendar },
          { key: "profile" as const, label: "Edit Profile", icon: User },
          { key: "specializations" as const, label: "Specializations", icon: Stethoscope },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ SCHEDULE TAB ═══ */}
      {activeTab === "schedule" && (
        <div className="space-y-5">
          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3">
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-extrabold text-teal-400">{daysWorking}</p>
              <p className="text-[10px] text-slate-500">Days/Week</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-extrabold text-blue-400">{totalHours}h</p>
              <p className="text-[10px] text-slate-500">Weekly Hours</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-400">{slots.filter(s => !s.isBreak).length}</p>
              <p className="text-[10px] text-slate-500">Active Slots</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-extrabold text-amber-400">{slots.filter(s => s.isBreak).length}</p>
              <p className="text-[10px] text-slate-500">Break Slots</p>
            </CardContent></Card>
          </div>

          {/* Save button bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-teal-400" />
              <div>
                <p className="text-sm font-bold text-teal-300">Weekly Availability</p>
                <p className="text-xs text-slate-400">Patients book 15-min consultation slots within your available hours</p>
              </div>
            </div>
            <Button onClick={saveSlots} disabled={savingSlots} className={savedSlots ? "bg-emerald-600" : ""}>
              {savedSlots ? "✓ Saved!" : savingSlots ? "Saving..." : <><Save className="w-4 h-4" /> Save Schedule</>}
            </Button>
          </div>

          {/* 7-day calendar */}
          <div className="space-y-2">
            {dayNames.map((day, dayIndex) => {
              const daySlots = slots.filter(s => s.dayOfWeek === dayIndex);
              const workSlots = daySlots.filter(s => !s.isBreak);
              const breakSlots = daySlots.filter(s => s.isBreak);
              const isExpanded = expandedDay === dayIndex;
              const isActive = daySlots.length > 0;

              return (
                <div key={day} className={`rounded-2xl border transition-all ${isActive ? "border-teal-500/20 bg-teal-500/5" : "border-white/5 bg-white/[0.02]"}`}>
                  {/* Day header */}
                  <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedDay(isExpanded ? null : dayIndex)}>
                    {/* Toggle */}
                    <button onClick={(e) => { e.stopPropagation(); toggleDayOff(dayIndex); }}
                      className={`w-12 h-7 rounded-full relative transition-all ${isActive ? "bg-teal-500" : "bg-slate-700"}`}>
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${isActive ? "left-6" : "left-1"}`} />
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{day}</span>
                        {!isActive && <Badge variant="secondary" className="text-[9px]">Day Off</Badge>}
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-2 mt-1">
                          {workSlots.map((s, i) => (
                            <span key={i} className="text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                              {formatTime12(s.startTime)} – {formatTime12(s.endTime)}
                            </span>
                          ))}
                          {breakSlots.length > 0 && (
                            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Coffee className="w-3 h-3" /> {breakSlots.length} break{breakSlots.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <Button size="sm" variant="ghost" className="text-[10px] text-slate-500" onClick={(e) => { e.stopPropagation(); copyToAll(dayIndex); }}>
                        <Copy className="w-3 h-3" /> Copy to all days
                      </Button>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>

                  {/* Expanded slot editor */}
                  {isExpanded && isActive && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4">
                      {/* Quick presets */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold py-1">Quick:</span>
                        {presets.map((p) => (
                          <button key={p.label} onClick={() => applyPreset(dayIndex, p.start, p.end)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5">
                            {p.label}
                          </button>
                        ))}
                      </div>

                      {/* Slots */}
                      {daySlots.map((slot) => {
                        const globalIndex = slots.indexOf(slot);
                        const TimeIcon = getTimeIcon(slot.startTime);
                        return (
                          <div key={globalIndex} className={`flex items-center gap-3 p-3 rounded-xl ${slot.isBreak ? "bg-amber-500/5 border border-amber-500/20" : "bg-white/5 border border-white/5"}`}>
                            <TimeIcon className={`w-4 h-4 shrink-0 ${slot.isBreak ? "text-amber-400" : "text-teal-400"}`} />
                            <select className="px-3 py-2 rounded-lg border border-white/10 bg-transparent text-sm font-mono" value={slot.startTime}
                              onChange={(e) => updateSlot(globalIndex, "startTime", e.target.value)}>
                              {timeOptions.map(t => <option key={t} value={t}>{formatTime12(t)}</option>)}
                            </select>
                            <span className="text-slate-600">→</span>
                            <select className="px-3 py-2 rounded-lg border border-white/10 bg-transparent text-sm font-mono" value={slot.endTime}
                              onChange={(e) => updateSlot(globalIndex, "endTime", e.target.value)}>
                              {timeOptions.map(t => <option key={t} value={t}>{formatTime12(t)}</option>)}
                            </select>
                            <button onClick={() => updateSlot(globalIndex, "isBreak", !slot.isBreak)}
                              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${slot.isBreak ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-slate-500 border border-white/10 hover:text-amber-400"}`}>
                              <Coffee className="w-3 h-3" /> {slot.isBreak ? "Break" : "Work"}
                            </button>
                            <button onClick={() => removeSlot(globalIndex)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}

                      <Button size="sm" variant="outline" onClick={() => addSlot(dayIndex)} className="w-full border-dashed">
                        <Plus className="w-3 h-3" /> Add Time Block
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ PROFILE TAB ═══ */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Edit Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4 max-w-xl">
            <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Display Name</label>
              <Input placeholder="Dr. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Qualifications (comma separated)</label>
              <Input placeholder="MBBS, MD, DNB" value={qualifications} onChange={(e) => setQualifications(e.target.value)} /></div>
            <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Bio / About</label>
              <textarea className="w-full p-3 rounded-xl border bg-transparent text-sm min-h-[120px]" placeholder="Tell patients about your experience..." value={bio} onChange={(e) => setBio(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Experience (years)</label>
                <Input type="number" placeholder="8" value={experience} onChange={(e) => setExperience(e.target.value)} /></div>
              <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Max Sessions/Day</label>
                <Input type="number" placeholder="20" value={maxSessions} onChange={(e) => setMaxSessions(e.target.value)} /></div>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="w-full">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ═══ SPECIALIZATIONS TAB ═══ */}
      {activeTab === "specializations" && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Stethoscope className="w-4 h-4" /> My Specializations</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-4">Select all that match your degrees. Patients searching these categories will find you.</p>
            <div className="grid grid-cols-3 gap-2">
              {allCategories.map((cat: any) => {
                const { icon: Icon, color } = getIcon(cat.icon);
                const selected = selectedCatIds.includes(cat.id);
                return (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${selected ? "bg-teal-500/20 text-teal-400 border-2 border-teal-500/40 shadow-lg shadow-teal-500/10" : "bg-white/5 text-slate-500 border-2 border-transparent hover:border-white/10"}`}>
                    <Icon className="w-5 h-5" style={{ color: selected ? undefined : color }} />
                    <span className="flex-1 text-left">{cat.name}</span>
                    {selected && <span className="text-teal-400 text-lg">✓</span>}
                  </button>
                );
              })}
            </div>
            {selectedCatIds.length > 0 && (
              <p className="text-xs text-teal-400 mt-4">{selectedCatIds.length} specialization(s) selected</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
