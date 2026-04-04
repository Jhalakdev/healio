"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try { setCategories(await adminApi("/categories/all")); } catch {}
  };

  const addCategory = async () => {
    if (!newName) return;
    await adminApi("/categories", {
      method: "POST",
      body: JSON.stringify({ name: newName, icon: newIcon || "🏥" }),
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
          <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="text-slate-400 mt-1">
            {categories.length} categories · {categories.filter(c => c.isActive).length} active
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="p-5 flex gap-3">
            <Input placeholder="Category name (e.g. Urology)" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
            <Input placeholder="Icon emoji" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} className="w-24" />
            <Button onClick={addCategory}><Save className="w-4 h-4" /> Save</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <Card key={cat.id} className={!cat.isActive ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100">
                {cat.icon || "🏥"}
              </div>
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
