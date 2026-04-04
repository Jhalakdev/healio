"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Tag,
  Percent,
  IndianRupee,
  ArrowUpRight,
  Calendar,
  Copy,
  ToggleLeft,
  ToggleRight,
  Users,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const coupons = [
  {
    id: "1", code: "WELCOME50", discountType: "flat", discountValue: 50,
    maxDiscountAmt: null, minOrderAmt: null, maxUsage: 1000, usedCount: 342,
    perUserLimit: 1, applicableFor: "consultation", applicablePlans: [],
    description: "₹50 off on your first consultation", isActive: true,
    expiresAt: "2027-12-31",
  },
  {
    id: "2", code: "HEALTH20", discountType: "percentage", discountValue: 20,
    maxDiscountAmt: 200, minOrderAmt: 300, maxUsage: 500, usedCount: 128,
    perUserLimit: 2, applicableFor: "all", applicablePlans: [],
    description: "20% off up to ₹200", isActive: true,
    expiresAt: "2027-12-31",
  },
  {
    id: "3", code: "FAMILY100", discountType: "flat", discountValue: 100,
    maxDiscountAmt: null, minOrderAmt: 699, maxUsage: 200, usedCount: 45,
    perUserLimit: 1, applicableFor: "plan_purchase", applicablePlans: ["2", "3"],
    description: "₹100 off on family plans only", isActive: true,
    expiresAt: "2027-12-31",
  },
  {
    id: "4", code: "YEARLY500", discountType: "upto", discountValue: 15,
    maxDiscountAmt: 500, minOrderAmt: 2000, maxUsage: 100, usedCount: 12,
    perUserLimit: 1, applicableFor: "plan_purchase", applicablePlans: ["4"],
    description: "15% off up to ₹500 on yearly plan", isActive: false,
    expiresAt: "2026-06-30",
  },
];

const typeLabel: Record<string, string> = {
  flat: "Flat Discount",
  percentage: "Percentage",
  upto: "% Up To ₹",
};

const typeIcon: Record<string, any> = {
  flat: IndianRupee,
  percentage: Percent,
  upto: ArrowUpRight,
};

const forLabel: Record<string, string> = {
  all: "All",
  consultation: "Consultations",
  plan_purchase: "Plan Purchase",
};

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Coupon Management</h1>
          <p className="text-slate-400 mt-1">
            Create discount codes, link to plans, set limits
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Coupons", value: "3", color: "text-emerald-600" },
          { label: "Total Used", value: "527", color: "text-blue-600" },
          { label: "Revenue Saved", value: "₹28,450", color: "text-violet-600" },
          { label: "Expired", value: "1", color: "text-orange-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coupon list */}
      <div className="space-y-4">
        {coupons.map((coupon, i) => {
          const Icon = typeIcon[coupon.discountType];
          return (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`hover:shadow-md transition-shadow ${!coupon.isActive ? "opacity-60" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-5">
                    {/* Code badge */}
                    <div className="w-28 h-20 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 flex flex-col items-center justify-center border-2 border-dashed border-teal-200">
                      <Tag className="w-4 h-4 text-teal-500 mb-1" />
                      <span className="text-sm font-black text-teal-700 tracking-wider">{coupon.code}</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-base">{coupon.description}</span>
                        {coupon.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Type */}
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md text-xs">
                          <Icon className="w-3 h-3" />
                          <span className="font-medium">
                            {coupon.discountType === "flat" && `₹${coupon.discountValue} off`}
                            {coupon.discountType === "percentage" && `${coupon.discountValue}% off`}
                            {coupon.discountType === "upto" && `${coupon.discountValue}% off up to ₹${coupon.maxDiscountAmt}`}
                          </span>
                        </div>

                        {/* Applicable for */}
                        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md text-xs text-blue-700">
                          <ShoppingBag className="w-3 h-3" />
                          {forLabel[coupon.applicableFor]}
                        </div>

                        {/* Min order */}
                        {coupon.minOrderAmt && (
                          <div className="bg-amber-50 px-2 py-1 rounded-md text-xs text-amber-700">
                            Min ₹{coupon.minOrderAmt}
                          </div>
                        )}

                        {/* Per user */}
                        <div className="bg-violet-50 px-2 py-1 rounded-md text-xs text-violet-700">
                          {coupon.perUserLimit}x per user
                        </div>

                        {/* Linked plans */}
                        {coupon.applicablePlans.length > 0 && (
                          <div className="bg-teal-50 px-2 py-1 rounded-md text-xs text-teal-700">
                            Linked to {coupon.applicablePlans.length} plan(s)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Usage */}
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {coupon.usedCount}/{coupon.maxUsage || "∞"}
                      </p>
                      <p className="text-xs text-slate-400">used</p>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-2">
                        <div
                          className="h-1.5 bg-teal-500 rounded-full"
                          style={{ width: `${coupon.maxUsage ? (coupon.usedCount / coupon.maxUsage) * 100 : 10}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Expires: {coupon.expiresAt}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
