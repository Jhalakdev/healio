"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [maxUsage, setMaxUsage] = useState("100");
  const [minOrder, setMinOrder] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [applicableFor, setApplicableFor] = useState("all");
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [expiryDays, setExpiryDays] = useState("365");

  useEffect(() => {
    loadCoupons();
    adminApi("/admin/plans").then(setPlans).catch(() => {});
  }, []);

  const loadCoupons = async () => {
    try { setCoupons(await adminApi("/admin/coupons")); } catch {}
  };

  const togglePlan = (planId: string) => {
    setSelectedPlans(prev =>
      prev.includes(planId) ? prev.filter(p => p !== planId) : [...prev, planId]
    );
  };

  const addCoupon = async () => {
    if (!code || !discountValue) return alert("Fill coupon code and discount value");
    await adminApi("/admin/coupons", {
      method: "POST",
      body: JSON.stringify({
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        maxDiscountAmt: maxDiscount ? Number(maxDiscount) : undefined,
        minOrderAmt: minOrder ? Number(minOrder) : undefined,
        maxUsage: Number(maxUsage),
        perUserLimit: Number(perUserLimit),
        applicableFor,
        applicablePlans: selectedPlans,
        description,
        expiresAt: new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    // Reset
    setCode(""); setDiscountValue(""); setMaxDiscount(""); setDescription("");
    setMinOrder(""); setSelectedPlans([]);
    setShowAdd(false);
    loadCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Deactivate this coupon?")) return;
    await adminApi(`/admin/coupons/${id}`, { method: "DELETE" });
    loadCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Coupons</h1>
          <p className="text-slate-400 mt-1">{coupons.length} total coupons</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card>
          <CardHeader><CardTitle>Create New Coupon</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Coupon Code *</label>
                <Input placeholder="e.g. SAVE50, FAMILY100" value={code} onChange={(e) => setCode(e.target.value)} />
                <p className="text-[10px] text-slate-500 mt-1">Auto-converted to uppercase</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Discount Type *</label>
                <select className="w-full px-3 py-2 rounded-xl border text-sm h-11" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                  <option value="flat">Flat Discount (₹ off)</option>
                  <option value="percentage">Percentage (% off)</option>
                  <option value="upto">Percentage up to ₹X max</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">
                  {discountType === "flat" ? "Discount Amount (₹) *" : "Discount Percentage (%) *"}
                </label>
                <Input placeholder={discountType === "flat" ? "e.g. 50" : "e.g. 10"} type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
                <p className="text-[10px] text-slate-500 mt-1">
                  {discountType === "flat" ? "Fixed ₹ amount off" : discountType === "percentage" ? "% off the total" : "% off, capped at max amount below"}
                </p>
              </div>
              {(discountType === "upto" || discountType === "percentage") && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Max Discount Cap (₹)</label>
                  <Input placeholder="e.g. 200" type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
                  <p className="text-[10px] text-slate-500 mt-1">Maximum discount amount (leave empty for no cap)</p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Minimum Order (₹)</label>
                <Input placeholder="e.g. 500" type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
                <p className="text-[10px] text-slate-500 mt-1">Minimum amount required to use this coupon</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Total Usage Limit</label>
                <Input placeholder="e.g. 100" type="number" value={maxUsage} onChange={(e) => setMaxUsage(e.target.value)} />
                <p className="text-[10px] text-slate-500 mt-1">0 = unlimited</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Per User Limit</label>
                <Input placeholder="e.g. 1" type="number" value={perUserLimit} onChange={(e) => setPerUserLimit(e.target.value)} />
                <p className="text-[10px] text-slate-500 mt-1">Max times one person can use this</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Valid For (days)</label>
                <Input placeholder="e.g. 365" type="number" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} />
                <p className="text-[10px] text-slate-500 mt-1">Days from now until coupon expires</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Applies To</label>
                <select className="w-full px-3 py-2 rounded-xl border text-sm h-11" value={applicableFor} onChange={(e) => setApplicableFor(e.target.value)}>
                  <option value="all">All (consultations + plans)</option>
                  <option value="consultation">Consultations only</option>
                  <option value="plan_purchase">Plan purchases only</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Where can this coupon be used?</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Description</label>
                <Input placeholder="e.g. 10% off on yearly plan" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            {/* Plan linking */}
            {(applicableFor === "plan_purchase" || applicableFor === "all") && plans.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">
                  Link to Specific Plans (optional — leave empty for all plans)
                </label>
                <div className="flex flex-wrap gap-2">
                  {plans.map((plan: any) => (
                    <button
                      key={plan.id}
                      onClick={() => togglePlan(plan.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedPlans.includes(plan.id)
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                          : "bg-white/5 text-slate-500 border border-white/10"
                      }`}
                    >
                      {selectedPlans.includes(plan.id) ? "✓ " : ""}{plan.name} (₹{plan.price})
                    </button>
                  ))}
                </div>
                {selectedPlans.length > 0 && (
                  <p className="text-[10px] text-teal-400 mt-2">
                    This coupon will ONLY work with: {selectedPlans.map(id => plans.find(p => p.id === id)?.name).join(", ")}
                  </p>
                )}
                {selectedPlans.length === 0 && (
                  <p className="text-[10px] text-slate-500 mt-2">No plans selected — coupon works with all plans</p>
                )}
              </div>
            )}

            <Button onClick={addCoupon}><Save className="w-4 h-4" /> Create Coupon</Button>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-3">
        {coupons.map((c) => (
          <Card key={c.id} className={!c.isActive ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-20 h-16 rounded-xl bg-teal-500/10 flex flex-col items-center justify-center border border-dashed border-teal-500/20">
                <Tag className="w-4 h-4 text-teal-400 mb-0.5" />
                <span className="text-xs font-black text-teal-400">{c.code}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {c.discountType === "flat" && `₹${c.discountValue} off`}
                    {c.discountType === "percentage" && `${c.discountValue}% off`}
                    {c.discountType === "upto" && `${c.discountValue}% off (max ₹${c.maxDiscountAmt})`}
                  </span>
                  <Badge variant={c.isActive ? "success" : "destructive"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {c.applicableFor !== "all" && (
                    <Badge variant="secondary">{c.applicableFor === "plan_purchase" ? "Plans only" : "Consults only"}</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {c.description || "No description"} · Used: {c.usedCount}/{c.maxUsage || "∞"} · {c.perUserLimit}x per user
                  {c.minOrderAmt ? ` · Min ₹${c.minOrderAmt}` : ""}
                </p>
                {c.applicablePlans?.length > 0 && (
                  <p className="text-xs text-teal-400 mt-1">
                    Linked to {c.applicablePlans.length} plan(s)
                  </p>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => deleteCoupon(c.id)}>
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {coupons.length === 0 && <p className="text-slate-500">No coupons yet. Click "Create Coupon" to add one.</p>}
      </div>
    </div>
  );
}
