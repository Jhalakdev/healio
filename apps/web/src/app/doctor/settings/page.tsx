"use client";

import { useEffect, useState } from "react";
import { User, Save, Calendar, Clock, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIcon } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorSettingsPage() {
  const [profile, setProfile] = useState<any>({});
  const [slots, setSlots] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [maxSessions, setMaxSessions] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi("/doctors/me/dashboard").then((d) => {
      setProfile(d);
    }).catch(() => {});

    // Load profile details via a workaround — get from users/me
    adminApi("/users/me").then((d) => {
      // This works for any logged in user
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
          name: name || undefined,
          bio: bio || undefined,
          experience: experience ? Number(experience) : undefined,
          maxSessionsPerDay: maxSessions ? Number(maxSessions) : undefined,
        }),
      });
      alert("Profile updated!");
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const toggleCategory = async (catId: string) => {
    const current = categories.map((c: any) => c.categoryId);
    const updated = current.includes(catId)
      ? current.filter((id: string) => id !== catId)
      : [...current, catId];

    try {
      const result = await adminApi("/doctors/me/categories", {
        method: "POST",
        body: JSON.stringify({ categoryIds: updated }),
      });
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
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Bio / About</label>
              <textarea
                className="w-full p-3 rounded-xl border text-sm min-h-[100px]"
                placeholder="Tell patients about your experience and approach..."
                value={bio} onChange={(e) => setBio(e.target.value)}
              />
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
            <p className="text-xs text-slate-500 mb-4">Select all categories that match your degrees and expertise. You can have multiple.</p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat: any) => {
                const { icon: Icon, color } = getIcon(cat.icon);
                const selected = selectedCatIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      selected
                        ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                        : "bg-white/5 text-slate-500 border border-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" style={{ color: selected ? undefined : color }} />
                    {cat.name}
                    {selected && <span className="text-teal-400">✓</span>}
                  </button>
                );
              })}
            </div>
            {selectedCatIds.length > 0 && (
              <p className="text-xs text-teal-400 mt-3">
                {selectedCatIds.length} specialization(s) selected — patients searching these categories will find you
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Availability info */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="font-bold text-blue-300">Schedule & Availability</p>
            <p className="text-sm text-slate-400">
              Manage your availability slots from the mobile app. Go online to start receiving bookings.
              Your time slots (Mon-Fri 9am-5pm etc.) are set from the app.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
