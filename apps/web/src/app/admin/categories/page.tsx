"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const categories = [
  { id: "1", name: "Nephrology", icon: "🫘", doctors: 12, isActive: true },
  { id: "2", name: "Anesthesiology", icon: "💉", doctors: 8, isActive: true },
  { id: "3", name: "Orthopedics", icon: "🦴", doctors: 15, isActive: true },
  { id: "4", name: "Ophthalmology", icon: "👁️", doctors: 9, isActive: true },
  { id: "5", name: "Pediatrics", icon: "👶", doctors: 22, isActive: true },
  { id: "6", name: "Oncology", icon: "🎗️", doctors: 6, isActive: true },
  { id: "7", name: "Dermatology", icon: "🧴", doctors: 18, isActive: true },
  { id: "8", name: "Pathology", icon: "🔬", doctors: 5, isActive: true },
  { id: "9", name: "Psychiatry", icon: "🧠", doctors: 11, isActive: true },
  { id: "10", name: "General Surgery", icon: "🏥", doctors: 14, isActive: true },
  { id: "11", name: "Endocrinology", icon: "🦋", doctors: 7, isActive: true },
  { id: "12", name: "Radiology", icon: "📡", doctors: 4, isActive: false },
  { id: "13", name: "Cardiology", icon: "❤️", doctors: 20, isActive: true },
  { id: "14", name: "General Medicine", icon: "🩺", doctors: 35, isActive: true },
  { id: "15", name: "ENT", icon: "👂", doctors: 13, isActive: true },
  { id: "16", name: "Gynecology", icon: "🌸", doctors: 16, isActive: true },
  { id: "17", name: "Neurology", icon: "🧠", doctors: 10, isActive: true },
  { id: "18", name: "Geriatrics", icon: "👴", doctors: 3, isActive: true },
];

export default function AdminCategoriesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="text-slate-400 mt-1">
            Manage medical specializations. Doctors register under these categories.
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-teal-600">{categories.length}</p>
            <p className="text-xs text-slate-400">Total Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">
              {categories.filter((c) => c.isActive).length}
            </p>
            <p className="text-xs text-slate-400">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-blue-600">
              {categories.reduce((s, c) => s + c.doctors, 0)}
            </p>
            <p className="text-xs text-slate-400">Total Doctors</p>
          </CardContent>
        </Card>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-3">Add New Category</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Category name (e.g. Urology)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Icon emoji (e.g. 🫘)"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-32"
              />
              <Button onClick={() => { setShowAdd(false); setNewName(""); setNewIcon(""); }}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className={`hover:shadow-md transition-all ${!cat.isActive ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100">
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{cat.name}</h4>
                    <p className="text-xs text-slate-400">{cat.doctors} doctors</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={cat.isActive ? "success" : "secondary"} className="text-[10px]">
                      {cat.isActive ? "Active" : "Hidden"}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500">
                      {cat.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
