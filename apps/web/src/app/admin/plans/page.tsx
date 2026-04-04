"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Save, X, Users, Calendar, CreditCard, Baby, Check, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

const typeColors: Record<string, string> = { single: "default", family: "success", yearly: "warning" };

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", type: "single", price: "", consultations: "", maxMembers: "1",
    validityDays: "30", childDiscountPercent: "10", description: "",
  });

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try { setPlans(await adminApi("/admin/plans")); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: "", type: "single", price: "", consultations: "", maxMembers: "1", validityDays: "30", childDiscountPercent: "10", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (plan: any) => {
    setForm({
      name: plan.name, type: plan.type, price: String(plan.price),
      consultations: String(plan.consultations), maxMembers: String(plan.maxMembers),
      validityDays: String(plan.validityDays), childDiscountPercent: String(plan.childDiscountPercent),
      description: plan.description || "",
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const savePlan = async () => {
    if (!form.name || !form.price || !form.consultations) return alert("Fill name, price, and consultations");
    const body = {
      name: form.name, type: form.type, price: Number(form.price),
      consultations: Number(form.consultations), maxMembers: Number(form.maxMembers),
      validityDays: Number(form.validityDays), childDiscountPercent: Number(form.childDiscountPercent),
      description: form.description,
    };
    try {
      if (editingId) {
        await adminApi(`/admin/plans/${editingId}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await adminApi("/admin/plans", { method: "POST", body: JSON.stringify(body) });
      }
      resetForm();
      loadPlans();
    } catch (e: any) { alert(e.message); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await adminApi(`/admin/plans/${id}`, { method: "PATCH", body: JSON.stringify({ isActive: !isActive }) });
    loadPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Plan Management</h1>
          <p className="text-slate-400 mt-1">{plans.length} plans</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Plan
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Plan" : "Create New Plan"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Plan Name *</label>
                <Input placeholder="e.g. Family Plan - 3 Members" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Plan Type *</label>
                <select className="w-full px-3 py-2 rounded-xl border text-sm h-11" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="single">Single (1 person, 1 consultation)</option>
                  <option value="family">Family (multiple members)</option>
                  <option value="yearly">Yearly (annual card)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Price (₹) *</label>
                <Input placeholder="e.g. 1000" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <p className="text-[10px] text-slate-500 mt-1">Amount patient pays for this plan</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Number of Consultations *</label>
                <Input placeholder="e.g. 3" type="number" value={form.consultations} onChange={(e) => setForm({ ...form, consultations: e.target.value })} />
                <p className="text-[10px] text-slate-500 mt-1">How many doctor video calls included</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Max Family Members</label>
                <Input placeholder="e.g. 5" type="number" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: e.target.value })} />
                <p className="text-[10px] text-slate-500 mt-1">1 = individual, 3-5 = family plan</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Validity (Days)</label>
                <Input placeholder="e.g. 90" type="number" value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: e.target.value })} />
                <p className="text-[10px] text-slate-500 mt-1">30 = 1 month, 90 = 3 months, 365 = 1 year</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Child Discount (%)</label>
                <Input placeholder="e.g. 10" type="number" value={form.childDiscountPercent} onChange={(e) => setForm({ ...form, childDiscountPercent: e.target.value })} />
                <p className="text-[10px] text-slate-500 mt-1">Discount when booking for a child member</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Description</label>
                <Input placeholder="e.g. Best for larger families" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={savePlan}><Save className="w-4 h-4" /> {editingId ? "Update Plan" : "Create Plan"}</Button>
              <Button variant="outline" onClick={resetForm}><X className="w-4 h-4" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans list */}
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="grid lg:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={!plan.isActive ? "opacity-50" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{plan.name}</span>
                      <Badge variant={typeColors[plan.type] as any}>{plan.type}</Badge>
                      <Badge variant={plan.isActive ? "success" : "destructive"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{plan.description || "No description"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(plan)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleActive(plan.id, plan.isActive)}>
                      {plan.isActive ? <X className="w-4 h-4 text-red-400" /> : <Check className="w-4 h-4 text-green-400" />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <CreditCard className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="font-bold">₹{plan.price}</p>
                    <p className="text-[10px] text-slate-500">Price</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Calendar className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="font-bold">{plan.consultations}</p>
                    <p className="text-[10px] text-slate-500">Consults</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Users className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="font-bold">{plan.maxMembers}</p>
                    <p className="text-[10px] text-slate-500">Members</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Baby className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="font-bold">{plan.childDiscountPercent}%</p>
                    <p className="text-[10px] text-slate-500">Child Off</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white/5 rounded-lg text-xs text-slate-400 text-center">
                  Validity: {plan.validityDays >= 365 ? `${Math.floor(plan.validityDays / 365)} year` : `${Math.floor(plan.validityDays / 30)} months`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
