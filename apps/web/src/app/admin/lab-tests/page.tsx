"use client";

import { useEffect, useState } from "react";
import {
  FlaskConical, Plus, IndianRupee, Package, Clock, TrendingUp,
  ChevronDown, ChevronUp, Edit2, Save, X, FileText, Upload, Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

type Tab = "dashboard" | "orders" | "tests" | "providers";

const statusColor: Record<string, string> = {
  pending: "warning", confirmed: "default", sample_collected: "default",
  processing: "default", report_ready: "success", delivered: "success", cancelled: "destructive",
};

export default function AdminLabTestsPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [dash, setDash] = useState<any>({});
  const [orders, setOrders] = useState<any>({ data: [], meta: {} });
  const [tests, setTests] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showAddTest, setShowAddTest] = useState(false);
  const [testForm, setTestForm] = useState({ name: "", category: "", mrp: "", sellingPrice: "", costPrice: "", turnaround: "", fasting: false, providerId: "" });
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [providerForm, setProviderForm] = useState({ name: "", contactEmail: "", contactPhone: "", apiEndpoint: "" });

  useEffect(() => {
    adminApi("/lab-tests/admin/dashboard").then(setDash).catch(() => {});
    adminApi("/lab-tests/admin/providers").then(setProviders).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "orders") {
      const q = orderFilter ? `?status=${orderFilter}` : "";
      adminApi(`/lab-tests/admin/orders${q}`).then(setOrders).catch(() => {});
    }
    if (tab === "tests") adminApi("/lab-tests/tests").then(setTests).catch(() => {});
  }, [tab, orderFilter]);

  const updateOrderStatus = async (id: string, status: string) => {
    await adminApi(`/lab-tests/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    adminApi(`/lab-tests/admin/orders${orderFilter ? `?status=${orderFilter}` : ""}`).then(setOrders).catch(() => {});
    adminApi("/lab-tests/admin/dashboard").then(setDash).catch(() => {});
  };

  const addTest = async () => {
    if (!testForm.name || !testForm.category) return alert("Fill required fields");
    const payload = {
      ...testForm,
      mrp: Number(testForm.mrp) || 0,
      sellingPrice: Number(testForm.sellingPrice) || 0,
      costPrice: Number(testForm.costPrice) || 0,
      providerId: testForm.providerId || undefined,
    };
    if (editingTestId) {
      await adminApi(`/lab-tests/admin/tests/${editingTestId}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await adminApi("/lab-tests/admin/tests", { method: "POST", body: JSON.stringify(payload) });
    }
    setShowAddTest(false); setEditingTestId(null);
    setTestForm({ name: "", category: "", mrp: "", sellingPrice: "", costPrice: "", turnaround: "", fasting: false, providerId: "" });
    setTests(await adminApi("/lab-tests/tests"));
  };

  const editTest = (t: any) => {
    setEditingTestId(t.id);
    setTestForm({
      name: t.name, category: t.category, mrp: String(t.mrp), sellingPrice: String(t.sellingPrice),
      costPrice: String(t.costPrice), turnaround: t.turnaround || "", fasting: t.fasting || false, providerId: t.providerId || "",
    });
    setShowAddTest(true);
  };

  const addProvider = async () => {
    if (!providerForm.name) return alert("Provider name required");
    await adminApi("/lab-tests/admin/providers", { method: "POST", body: JSON.stringify(providerForm) });
    setShowAddProvider(false);
    setProviderForm({ name: "", contactEmail: "", contactPhone: "", apiEndpoint: "" });
    setProviders(await adminApi("/lab-tests/admin/providers"));
  };

  const toggleProvider = async (id: string, isActive: boolean) => {
    await adminApi(`/lab-tests/admin/providers/${id}`, { method: "PATCH", body: JSON.stringify({ isActive: !isActive }) });
    setProviders(await adminApi("/lab-tests/admin/providers"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Health Packages & Lab Tests</h1>
          <p className="text-slate-400 mt-1">Manage tests, orders, reports, and providers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "dashboard" as Tab, label: "Dashboard" },
          { key: "orders" as Tab, label: "Orders" },
          { key: "tests" as Tab, label: "Test Catalog" },
          { key: "providers" as Tab, label: "Providers" },
        ].map((t) => (
          <Button key={t.key} size="sm" variant={tab === t.key ? "default" : "outline"} onClick={() => setTab(t.key)}>
            {t.label}
          </Button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Orders", value: dash.totalOrders ?? 0, icon: Package, color: "from-blue-500 to-cyan-600" },
              { label: "Revenue", value: `₹${Number(dash.totalRevenue || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "from-emerald-500 to-green-600" },
              { label: "Profit", value: `₹${Number(dash.totalProfit || 0).toLocaleString("en-IN")}`, icon: TrendingUp, color: "from-violet-500 to-purple-600" },
            ].map((s) => (
              <Card key={s.label}><CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5 text-white" /></div>
                <p className="text-2xl font-extrabold">{s.value}</p><p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="p-5 text-center">
              <p className="text-2xl font-extrabold text-amber-400">{dash.pendingOrders ?? 0}</p>
              <p className="text-xs text-slate-500">Pending Orders</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <p className="text-2xl font-extrabold text-emerald-400">{dash.reportsReady ?? 0}</p>
              <p className="text-xs text-slate-500">Reports Ready</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <p className="text-2xl font-extrabold text-blue-400">₹{Number(dash.totalCost || 0).toLocaleString("en-IN")}</p>
              <p className="text-xs text-slate-500">Cost to Provider</p>
            </CardContent></Card>
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {tab === "orders" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {["", "pending", "confirmed", "sample_collected", "processing", "report_ready", "delivered", "cancelled"].map((s) => (
              <Button key={s} size="sm" variant={orderFilter === s ? "default" : "outline"} onClick={() => setOrderFilter(s)}>
                {s || "All"}
              </Button>
            ))}
          </div>

          {orders.data?.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="p-0">
                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                  <FlaskConical className="w-5 h-5 text-teal-400" />
                  <div className="flex-1">
                    <p className="font-bold">{o.patientName} · {o.items?.length || 0} test(s)</p>
                    <p className="text-xs text-slate-500">
                      {new Date(o.createdAt).toLocaleString()} · ₹{o.totalAmount} paid · Cost ₹{o.totalCostPrice} · Profit ₹{o.profit}
                      {o.doctorId && " · Doctor ordered"}
                    </p>
                  </div>
                  <Badge variant={statusColor[o.status] as any}>{o.status.replace("_", " ")}</Badge>
                  {expandedOrder === o.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>

                {expandedOrder === o.id && (
                  <div className="border-t border-white/5 p-4 space-y-3">
                    {/* Order details */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { l: "Patient", v: `${o.patientName} · ${o.patientPhone}` },
                        { l: "Collection", v: `${o.collectionDate ? new Date(o.collectionDate).toLocaleDateString() : "Not set"} ${o.collectionTime || ""}` },
                        { l: "Address", v: `${o.collectionAddress || "Not set"}, ${o.collectionCity || ""} ${o.collectionPincode || ""}` },
                        { l: "Provider", v: o.provider?.name || "N/A" },
                        { l: "Order #", v: o.orderNumber?.slice(0, 12) },
                        { l: "Provider Order", v: o.providerOrderId || "Not assigned" },
                      ].map((i) => (
                        <div key={i.l} className="p-2 rounded-lg bg-white/5">
                          <span className="text-[10px] text-slate-500 uppercase block">{i.l}</span>
                          <p className="text-sm font-bold">{i.v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Tests in order */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Tests Ordered</p>
                      {o.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between p-2 text-sm border-b border-white/5">
                          <span>{item.testName}</span>
                          <span className="font-bold">₹{item.price} <span className="text-slate-500 font-normal">(cost: ₹{item.costPrice})</span></span>
                        </div>
                      ))}
                    </div>

                    {/* Reports */}
                    {o.reports?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Reports</p>
                        {o.reports.map((r: any) => (
                          <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-sm">{r.fileName}</span>
                            <a href={r.fileUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><Eye className="w-3 h-3" /> View</Button></a>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status update */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Update Status</p>
                      <div className="flex gap-2 flex-wrap">
                        {["confirmed", "sample_collected", "processing", "report_ready", "delivered", "cancelled"].map((s) => (
                          <Button key={s} size="sm" variant={o.status === s ? "default" : "outline"}
                            onClick={() => updateOrderStatus(o.id, s)} disabled={o.status === s}>
                            {s.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {o.notes && <p className="text-xs text-slate-500">Notes: {o.notes}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {orders.data?.length === 0 && <p className="text-slate-400 text-center py-8">No orders found</p>}
        </div>
      )}

      {/* ── TEST CATALOG ── */}
      {tab === "tests" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-slate-400">{tests.length} tests across {[...new Set(tests.map((t: any) => t.category))].length} categories</p>
            <Button onClick={() => setShowAddTest(!showAddTest)}><Plus className="w-4 h-4" /> Add Test</Button>
          </div>

          {showAddTest && (
            <Card>
              <CardHeader><CardTitle>Add New Test / Package</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Test Name *</label>
                  <Input placeholder="e.g. CBC, Thyroid Panel" value={testForm.name} onChange={(e) => setTestForm({ ...testForm, name: e.target.value })} /></div>
                  <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Category *</label>
                  <Input placeholder="e.g. Cardiac Profiles" value={testForm.category} onChange={(e) => setTestForm({ ...testForm, category: e.target.value })} /></div>
                  <div><label className="text-xs font-semibold text-slate-400 mb-1 block">MRP (₹)</label>
                  <Input type="number" placeholder="800" value={testForm.mrp} onChange={(e) => setTestForm({ ...testForm, mrp: e.target.value })} /></div>
                  <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Selling Price (₹) — what patient pays</label>
                  <Input type="number" placeholder="449" value={testForm.sellingPrice} onChange={(e) => setTestForm({ ...testForm, sellingPrice: e.target.value })} /></div>
                  <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Cost Price (₹) — what you pay provider</label>
                  <Input type="number" placeholder="200" value={testForm.costPrice} onChange={(e) => setTestForm({ ...testForm, costPrice: e.target.value })} /></div>
                  <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Turnaround Time</label>
                  <Input placeholder="24 hours" value={testForm.turnaround} onChange={(e) => setTestForm({ ...testForm, turnaround: e.target.value })} /></div>
                  <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Provider *</label>
                  <select className="w-full px-3 py-2 rounded-xl border text-sm h-11" value={testForm.providerId} onChange={(e) => setTestForm({ ...testForm, providerId: e.target.value })}>
                    <option value="">Select provider...</option>
                    {providers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select></div>
                </div>
                <Button onClick={addTest}><Save className="w-4 h-4" /> Save Test</Button>
              </CardContent>
            </Card>
          )}

          {/* Group by category */}
          {[...new Set(tests.map((t: any) => t.category))].map((cat) => (
            <div key={cat as string}>
              <h3 className="text-sm font-bold text-teal-400 mb-2 mt-4">{cat as string}</h3>
              {tests.filter((t: any) => t.category === cat).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 mb-1">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-bold">{t.name} {t.isPackage && <Badge variant="secondary" className="text-[9px] ml-1">Package</Badge>}</p>
                      <p className="text-[10px] text-slate-500">{t.turnaround} · {t.fasting ? "Fasting required" : "No fasting"} · {t.homeCollection ? "Home collection" : "Lab visit"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 line-through">₹{t.mrp}</p>
                    <p className="text-sm font-bold text-emerald-400">₹{t.sellingPrice}</p>
                    <p className="text-[10px] text-slate-600">Cost: ₹{t.costPrice} · Profit: ₹{Number(t.sellingPrice) - Number(t.costPrice)}</p>
                    <Button size="sm" variant="ghost" className="mt-1" onClick={() => editTest(t)}><Edit2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── PROVIDERS ── */}
      {tab === "providers" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-slate-400">{providers.length} provider(s)</p>
            <Button onClick={() => setShowAddProvider(!showAddProvider)}><Plus className="w-4 h-4" /> Add Provider</Button>
          </div>

          {showAddProvider && (
            <Card>
              <CardHeader><CardTitle>Add Lab Provider</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Provider Name *" value={providerForm.name} onChange={(e) => setProviderForm({...providerForm, name: e.target.value})} />
                  <Input placeholder="Contact Email" value={providerForm.contactEmail} onChange={(e) => setProviderForm({...providerForm, contactEmail: e.target.value})} />
                  <Input placeholder="Contact Phone" value={providerForm.contactPhone} onChange={(e) => setProviderForm({...providerForm, contactPhone: e.target.value})} />
                  <Input placeholder="API Endpoint (optional)" value={providerForm.apiEndpoint} onChange={(e) => setProviderForm({...providerForm, apiEndpoint: e.target.value})} />
                </div>
                <Button onClick={addProvider}><Save className="w-4 h-4" /> Save Provider</Button>
              </CardContent>
            </Card>
          )}

          {providers.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    {p._count?.tests || 0} tests · {p._count?.orders || 0} orders
                    {p.contactEmail && ` · ${p.contactEmail}`}
                  </p>
                </div>
                <Badge variant={p.isActive ? "success" : "destructive"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                <Button size="sm" variant="outline" onClick={() => toggleProvider(p.id, p.isActive)}>
                  {p.isActive ? "Deactivate" : "Activate"}
                </Button>
              </CardContent>
            </Card>
          ))}
          {providers.length === 0 && <p className="text-slate-400">No providers yet. Add one to start managing lab tests.</p>}
        </div>
      )}
    </div>
  );
}
