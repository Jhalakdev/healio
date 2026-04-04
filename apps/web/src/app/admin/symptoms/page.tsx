"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Eye, EyeOff, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIcon } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function AdminSymptomsPage() {
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  useEffect(() => {
    adminApi("/symptoms/all").then(setSymptoms).catch(() => {});
    adminApi("/categories/all").then(setSpecialists).catch(() => {});
  }, []);

  const toggleSpec = (id: string) => {
    setSelectedSpecs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const addSymptom = async () => {
    if (!name) return alert("Enter symptom name");
    await adminApi("/symptoms", {
      method: "POST",
      body: JSON.stringify({ name, description: desc, icon, imageUrl, specialistIds: selectedSpecs }),
    });
    setName(""); setDesc(""); setIcon(""); setImageUrl(""); setSelectedSpecs([]);
    setShowAdd(false);
    setSymptoms(await adminApi("/symptoms/all"));
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await adminApi(`/symptoms/${id}`, { method: "PATCH", body: JSON.stringify({ isActive: !isActive }) });
    setSymptoms(await adminApi("/symptoms/all"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Symptoms & Diseases</h1>
          <p className="text-slate-400 mt-1">
            Common health problems patients search for. Link each to relevant specialists.
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4" /> Add Symptom
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle>Add Symptom / Disease</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Name *</label>
                <Input placeholder="e.g. Headache, Irregular Periods" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Icon (emoji)</label>
                <Input placeholder="e.g. 🤕" value={icon} onChange={(e) => setIcon(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Description</label>
                <Input placeholder="Brief description of the symptom" value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Image URL (uploaded icon)</label>
                <Input placeholder="https://... or upload path" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">
                <LinkIcon className="w-3 h-3 inline" /> Link to Specialists (which doctors can treat this?)
              </label>
              <div className="flex flex-wrap gap-2">
                {specialists.filter(s => s.isActive).map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => toggleSpec(spec.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedSpecs.includes(spec.id)
                        ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                        : "bg-white/5 text-slate-500 border border-white/10"
                    }`}
                  >
                    {selectedSpecs.includes(spec.id) ? "✓ " : ""}{spec.icon || ""} {spec.name}
                  </button>
                ))}
              </div>
              {selectedSpecs.length > 0 && (
                <p className="text-xs text-teal-400 mt-2">
                  Patients with this symptom will see doctors from: {selectedSpecs.map(id => specialists.find(s => s.id === id)?.name).join(", ")}
                </p>
              )}
            </div>

            <Button onClick={addSymptom}><Save className="w-4 h-4" /> Save Symptom</Button>
          </CardContent>
        </Card>
      )}

      {/* Symptoms grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {symptoms.map((sym) => (
          <Card key={sym.id} className={!sym.isActive ? "opacity-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {(() => {
                  const { icon: Icon, color } = getIcon(sym.icon);
                  return (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                  );
                })()}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{sym.name}</h4>
                    <Badge variant={sym.isActive ? "success" : "secondary"} className="text-[10px]">
                      {sym.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  {sym.description && <p className="text-xs text-slate-500 mt-1">{sym.description}</p>}
                  {sym.specialists?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sym.specialists.map((s: any) => (
                        <Badge key={s.id} variant="outline" className="text-[10px]">
                          {s.category?.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(sym.id, sym.isActive)}>
                  {sym.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {symptoms.length === 0 && <p className="text-slate-400 col-span-3">No symptoms added yet. Click "Add Symptom" to create one.</p>}
      </div>
    </div>
  );
}
