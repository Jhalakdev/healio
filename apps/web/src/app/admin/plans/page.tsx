"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  CreditCard,
  Check,
  X,
  Baby,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const plans = [
  {
    id: "1", name: "Single Consult", type: "single", price: 399, consultations: 1,
    maxMembers: 1, validityDays: 30, childDiscount: 10, isActive: true,
    features: ["15-min HD video call", "Digital prescription", "Chat support"],
    description: "One-time consultation with any available doctor",
  },
  {
    id: "2", name: "Family Plan - 3 Members", type: "family", price: 1000, consultations: 3,
    maxMembers: 3, validityDays: 90, childDiscount: 10, isActive: true,
    features: ["3 consultations", "Up to 3 members", "10% child discount", "3 months validity"],
    description: "Perfect for small families",
  },
  {
    id: "3", name: "Family Plan - 5 Members", type: "family", price: 1500, consultations: 5,
    maxMembers: 5, validityDays: 90, childDiscount: 10, isActive: true,
    features: ["5 consultations", "Up to 5 members", "10% child discount", "Priority booking"],
    description: "Best for larger families",
  },
  {
    id: "4", name: "Yearly Card", type: "yearly", price: 5999, consultations: 10,
    maxMembers: 5, validityDays: 365, childDiscount: 10, isActive: true,
    features: ["10 consultations", "5 family members", "Free follow-ups", "Priority booking"],
    description: "Annual health card for the whole family",
  },
];

const typeColors: Record<string, string> = {
  single: "default",
  family: "success",
  yearly: "warning",
};

export default function AdminPlansPage() {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Plan Management</h1>
          <p className="text-slate-400 mt-1">Create and manage consultation plans</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Add Plan
        </Button>
      </div>

      {/* Plan cards */}
      <div className="grid lg:grid-cols-2 gap-5">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <Badge variant={typeColors[plan.type] as any}>{plan.type}</Badge>
                      {plan.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(plan.id)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <CreditCard className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-lg font-bold">₹{plan.price}</p>
                    <p className="text-[10px] text-slate-400">Price</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-lg font-bold">{plan.consultations}</p>
                    <p className="text-[10px] text-slate-400">Consults</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-lg font-bold">{plan.maxMembers}</p>
                    <p className="text-[10px] text-slate-400">Members</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Baby className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-lg font-bold">{plan.childDiscount}%</p>
                    <p className="text-[10px] text-slate-400">Child Off</p>
                  </div>
                </div>

                {/* Validity */}
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-xl mb-3">
                  <span className="text-sm text-teal-700 font-medium">Validity</span>
                  <span className="text-sm font-bold text-teal-800">
                    {plan.validityDays >= 365 ? `${Math.floor(plan.validityDays / 365)} year` : `${Math.floor(plan.validityDays / 30)} months`}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-500">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      {f}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
