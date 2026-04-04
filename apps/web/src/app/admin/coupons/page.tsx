"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, Percent, IndianRupee, Trash2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [maxUsage, setMaxUsage] = useState("100");
  const [description, setDescription] = useState("");

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    try { setCoupons(await adminApi("/admin/coupons")); } catch {}
  };

  const addCoupon = async () => {
    if (!code || !discountValue) return alert("Fill code and discount value");
    await adminApi("/admin/coupons", {
      method: "POST",
      body: JSON.stringify({
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        maxDiscountAmt: maxDiscount ? Number(maxDiscount) : undefined,
        maxUsage: Number(maxUsage),
        description,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    setCode(""); setDiscountValue(""); setMaxDiscount(""); setDescription("");
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
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Coupon Code (e.g. SAVE50)" value={code} onChange={(e) => setCode(e.target.value)} />
              <select
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="flat">Flat (₹ off)</option>
                <option value="percentage">Percentage (% off)</option>
                <option value="upto">% off up to ₹X</option>
              </select>
              <Input placeholder="Discount Value" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
              {discountType === "upto" && (
                <Input placeholder="Max Discount (₹)" type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
              )}
              <Input placeholder="Max Usage" type="number" value={maxUsage} onChange={(e) => setMaxUsage(e.target.value)} />
              <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button onClick={addCoupon}><Save className="w-4 h-4" /> Save Coupon</Button>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-3">
        {coupons.map((c) => (
          <Card key={c.id} className={!c.isActive ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-20 h-16 rounded-xl bg-teal-50 flex flex-col items-center justify-center border-2 border-dashed border-teal-200">
                <Tag className="w-4 h-4 text-teal-500 mb-0.5" />
                <span className="text-xs font-black text-teal-700">{c.code}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {c.discountType === "flat" && `₹${c.discountValue} off`}
                    {c.discountType === "percentage" && `${c.discountValue}% off`}
                    {c.discountType === "upto" && `${c.discountValue}% off up to ₹${c.maxDiscountAmt}`}
                  </span>
                  <Badge variant={c.isActive ? "success" : "destructive"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {c.description || "No description"} · Used: {c.usedCount}/{c.maxUsage || "∞"}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => deleteCoupon(c.id)}>
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
