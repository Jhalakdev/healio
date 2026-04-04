"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Search, Send, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

export default function DoctorLabOrdersPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    adminApi("/lab-tests/tests").then(setTests).catch(() => {});
    adminApi("/lab-tests/categories").then(setCategories).catch(() => {});
  }, []);

  const filteredTests = tests.filter((t: any) => {
    if (selectedCat && t.category !== selectedCat) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleTest = (id: string) => {
    setSelectedTests(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const totalPrice = selectedTests.reduce((s, id) => {
    const test = tests.find((t: any) => t.id === id);
    return s + Number(test?.sellingPrice || 0);
  }, 0);

  const orderForPatient = async () => {
    if (!patientId || selectedTests.length === 0) return alert("Select patient and at least one test");
    setSending(true);
    try {
      await adminApi("/lab-tests/doctor-order", {
        method: "POST",
        body: JSON.stringify({ patientId, testIds: selectedTests, notes }),
      });
      setSent(true);
      setSelectedTests([]);
      setPatientId("");
      setNotes("");
    } catch (e: any) { alert(e.message); }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
        <h2 className="text-2xl font-extrabold mb-2">Lab Test Ordered!</h2>
        <p className="text-slate-400 mb-6">Patient has been notified. They'll confirm, pay, and schedule collection.</p>
        <Button onClick={() => setSent(false)}>Order Another Test</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Order Lab Tests for Patient</h1>
      <p className="text-slate-400">Select tests → enter patient ID → patient gets notified to confirm and pay</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Test catalog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search tests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <select className="px-3 py-2 rounded-xl border text-sm" value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filteredTests.map((t: any) => {
              const selected = selectedTests.includes(t.id);
              return (
                <div key={t.id}
                  onClick={() => toggleTest(t.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    selected ? "bg-teal-500/20 border border-teal-500/30" : "bg-white/5 hover:bg-white/10"
                  }`}>
                  <div className="flex items-center gap-3">
                    {selected ? <CheckCircle className="w-5 h-5 text-teal-400" /> : <FlaskConical className="w-5 h-5 text-slate-500" />}
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-[10px] text-slate-500">{t.category} · {t.turnaround} · {t.fasting ? "Fasting" : "No fasting"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 line-through">₹{t.mrp}</p>
                    <p className="text-sm font-bold">₹{t.sellingPrice}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order summary */}
        <Card>
          <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Patient ID *</label>
              <Input placeholder="Paste patient ID" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
              <p className="text-[10px] text-slate-500 mt-1">Get from patient's profile in admin panel</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Notes for Patient</label>
              <textarea className="w-full p-3 rounded-xl border text-sm min-h-[60px]" placeholder="e.g. Please fast for 12 hours before test" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Selected Tests ({selectedTests.length})</p>
              {selectedTests.length === 0 ? (
                <p className="text-sm text-slate-500">Click tests on the left to add</p>
              ) : (
                <div className="space-y-1">
                  {selectedTests.map((id) => {
                    const test = tests.find((t: any) => t.id === id);
                    return (
                      <div key={id} className="flex justify-between text-sm p-2 rounded-lg bg-white/5">
                        <span>{test?.name}</span>
                        <span className="font-bold">₹{test?.sellingPrice}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-teal-500/10 text-center">
              <p className="text-xs text-slate-400">Patient will pay</p>
              <p className="text-2xl font-extrabold text-teal-400">₹{totalPrice.toLocaleString("en-IN")}</p>
            </div>

            <Button className="w-full" onClick={orderForPatient} disabled={sending || selectedTests.length === 0 || !patientId}>
              <Send className="w-4 h-4" /> {sending ? "Sending..." : "Order for Patient"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
