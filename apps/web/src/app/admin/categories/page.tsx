"use client";

import { useEffect, useState } from "react";
import {
  Plus, Eye, EyeOff, Save,
  Droplets, Syringe, Bone, EyeIcon, Baby, Ribbon,
  Hand, FlaskConical, Brain, Hospital, Flower2, ScanLine,
  Heart, Accessibility, Stethoscope, Ear, Activity, Scan,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

// Map category names to Lucide icons + colors (same as app)
const categoryIconMap: Record<string, { icon: any; color: string }> = {
  "Nephrology": { icon: Droplets, color: "#3b82f6" },
  "Anesthesiology": { icon: Syringe, color: "#8b5cf6" },
  "Orthopedics": { icon: Bone, color: "#f59e0b" },
  "Ophthalmology": { icon: EyeIcon, color: "#06b6d4" },
  "Pediatrics": { icon: Baby, color: "#ec4899" },
  "Oncology": { icon: Ribbon, color: "#ef4444" },
  "Dermatology": { icon: Hand, color: "#f97316" },
  "Pathology": { icon: FlaskConical, color: "#10b981" },
  "Psychiatry": { icon: Brain, color: "#7c3aed" },
  "General Surgery": { icon: Hospital, color: "#dc2626" },
  "Endocrinology": { icon: Activity, color: "#14b8a6" },
  "Radiology": { icon: ScanLine, color: "#6366f1" },
  "Cardiology": { icon: Heart, color: "#e11d48" },
  "General Medicine": { icon: Stethoscope, color: "#0d9488" },
  "ENT": { icon: Ear, color: "#f59e0b" },
  "Gynecology": { icon: Flower2, color: "#ec4899" },
  "Neurology": { icon: Brain, color: "#7c3aed" },
  "Geriatrics": { icon: Accessibility, color: "#0d9488" },
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try { setCategories(await adminApi("/categories/all")); } catch {}
  };

  const addCategory = async (imageUrl?: string) => {
    if (!newName) return;
    await adminApi("/categories", {
      method: "POST",
      body: JSON.stringify({ name: newName, icon: newIcon || "🏥", imageUrl: imageUrl || undefined }),
    });
    setNewName(""); setNewIcon(""); setShowAdd(false);
    loadCategories();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await adminApi(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !isActive }),
    });
    loadCategories();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Deactivate this category?")) return;
    await adminApi(`/categories/${id}`, { method: "DELETE" });
    loadCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Specialists</h1>
          <p className="text-slate-400 mt-1">
            {categories.length} specialists · {categories.filter(c => c.isActive).length} active
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4" /> Add Specialist
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Specialist Name *</label>
                <Input placeholder="e.g. Urology, Pulmonology" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Icon (emoji fallback)</label>
                <Input placeholder="e.g. 🫘" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Icon Image URL (uploaded — overrides emoji)</label>
              <Input placeholder="https://... or upload an icon image" id="cat-image-url" />
              <p className="text-[10px] text-slate-500 mt-1">Upload a consistent icon image for professional look. If empty, emoji icon will be used.</p>
            </div>
            <Button onClick={() => {
              const imageUrl = (document.getElementById("cat-image-url") as HTMLInputElement)?.value;
              addCategory(imageUrl);
            }}><Save className="w-4 h-4" /> Save Specialist</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <Card key={cat.id} className={!cat.isActive ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center gap-3">
              {(() => {
                const mapped = categoryIconMap[cat.name];
                if (mapped) {
                  const Icon = mapped.icon;
                  return (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: mapped.color + "15" }}>
                      <Icon className="w-6 h-6" style={{ color: mapped.color }} />
                    </div>
                  );
                }
                return (
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-teal-400" />
                  </div>
                );
              })()}
              <div className="flex-1">
                <h4 className="font-bold text-sm">{cat.name}</h4>
                <p className="text-xs text-slate-400">{cat._count?.doctors || 0} doctors</p>
              </div>
              <Badge variant={cat.isActive ? "success" : "secondary"} className="text-[10px]">
                {cat.isActive ? "Active" : "Hidden"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleActive(cat.id, cat.isActive)}
              >
                {cat.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
