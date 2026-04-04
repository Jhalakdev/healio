"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, IndianRupee, Bell, CheckCircle, XCircle, Clock,
  Stethoscope, Video, FileText, ArrowRight, User, Upload,
  AlertTriangle, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import { getIcon } from "@/lib/icon-map";

const statusColor: Record<string, string> = {
  PENDING: "warning", CONFIRMED: "default", IN_PROGRESS: "online",
  COMPLETED: "success", CANCELLED: "destructive",
};

export default function DoctorDashboardHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any>({ data: [], unreadCount: 0 });
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Onboarding state
  const [wizardStep, setWizardStep] = useState(-1); // -1 = loading
  const [wName, setWName] = useState("");
  const [wBio, setWBio] = useState("");
  const [wExp, setWExp] = useState("");
  const [wMax, setWMax] = useState("20");
  const [selCats, setSelCats] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      adminApi("/doctors/me/profile").then((p) => {
        setProfile(p);
        setWName(p.name || ""); setWBio(p.bio || "");
        setWExp(String(p.experience || "")); setWMax(String(p.maxSessionsPerDay || 20));
        setSelCats((p.categories || []).map((c: any) => c.categoryId));
        setWizardStep(p.onboardingStep || 0);
      }).catch(() => {}),
      adminApi("/doctors/me/dashboard").then(setDashboard).catch(() => {}),
      adminApi("/doctors/me/bookings-by-date?range=today").then((d) => setTodayBookings(d?.bookings || [])).catch(() => {}),
      adminApi("/notifications").then(setNotifications).catch(() => {}),
      adminApi("/categories").then(setAllCategories).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const isApproved = profile?.verificationStatus === "APPROVED";
  const isPending = profile?.verificationStatus === "PENDING";
  const isRejected = profile?.verificationStatus === "REJECTED";

  const saveProfile = async () => {
    await adminApi("/doctors/me", { method: "PATCH", body: JSON.stringify({ name: wName, bio: wBio, experience: Number(wExp) || undefined, maxSessionsPerDay: Number(wMax) || 20 }) });
    await adminApi("/doctors/me/onboarding", { method: "PATCH", body: JSON.stringify({ step: 1 }) });
    setWizardStep(1);
  };

  const saveCats = async () => {
    await adminApi("/doctors/me/categories", { method: "POST", body: JSON.stringify({ categoryIds: selCats }) });
    await adminApi("/doctors/me/onboarding", { method: "PATCH", body: JSON.stringify({ step: 2 }) });
    setWizardStep(2);
  };

  const submitDocs = async () => {
    await adminApi("/doctors/me/onboarding", { method: "PATCH", body: JSON.stringify({ step: 4 }) });
    setWizardStep(4);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400">Loading your dashboard...</p></div>;

  // ─── ONBOARDING WIZARD (not yet approved) ─────────
  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Welcome (first time) */}
        {wizardStep === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold mb-3">Welcome to Healio!</h1>
            <p className="text-lg text-slate-400 max-w-md mx-auto mb-8">Let&apos;s set up your doctor profile. This takes about 2 minutes.</p>
            <Button size="lg" onClick={() => setWizardStep(0.5)}>Start Setup <ArrowRight className="w-5 h-5" /></Button>
          </div>
        )}

        {/* Progress */}
        {wizardStep > 0 && (
          <>
            <div className="flex items-center gap-1">
              {["Profile", "Specializations", "Documents", "Review"].map((l, i) => (
                <div key={l} className="flex items-center gap-1 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    wizardStep > i ? "bg-teal-500 text-white" : wizardStep >= i + 0.5 ? "bg-teal-500/30 text-teal-400" : "bg-white/10 text-slate-600"
                  }`}>{wizardStep > i ? "✓" : i + 1}</div>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">{l}</span>
                  {i < 3 && <div className={`flex-1 h-0.5 ${wizardStep > i ? "bg-teal-500" : "bg-white/10"}`} />}
                </div>
              ))}
            </div>

            {isRejected && profile?.rejectionReason && (
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-red-400">Application Rejected</p>
                    <p className="text-sm text-slate-400 mt-1">Reason: {profile.rejectionReason}</p>
                    <p className="text-xs text-slate-500 mt-2">Update your info and resubmit below.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Step 1: Profile */}
        {wizardStep >= 0.5 && wizardStep < 1.5 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Step 1: Your Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Full Name *</label>
              <Input placeholder="Dr. Priya Sharma" value={wName} onChange={(e) => setWName(e.target.value)} /></div>
              <div><label className="text-xs font-semibold text-slate-400 mb-1 block">About You</label>
              <textarea className="w-full p-3 rounded-xl border text-sm min-h-[80px]" placeholder="Your experience..." value={wBio} onChange={(e) => setWBio(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Experience (years) *</label>
                <Input type="number" placeholder="8" value={wExp} onChange={(e) => setWExp(e.target.value)} /></div>
                <div><label className="text-xs font-semibold text-slate-400 mb-1 block">Max Consults/Day</label>
                <Input type="number" placeholder="20" value={wMax} onChange={(e) => setWMax(e.target.value)} /></div>
              </div>
              <Button className="w-full" onClick={saveProfile} disabled={!wName}>Save & Next <ArrowRight className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Specializations */}
        {wizardStep >= 1 && wizardStep < 2.5 && wizardStep !== 0.5 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Step 2: Specializations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">Select all that match your degrees.</p>
              <div className="grid grid-cols-3 gap-2">
                {allCategories.map((cat: any) => {
                  const { icon: Icon, color } = getIcon(cat.icon);
                  const sel = selCats.includes(cat.id);
                  return (<button key={cat.id} onClick={() => setSelCats(p => sel ? p.filter(id => id !== cat.id) : [...p, cat.id])}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${sel ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "bg-white/5 text-slate-500 border border-white/10"}`}>
                    <Icon className="w-4 h-4" style={{ color: sel ? undefined : color }} />{cat.name}
                  </button>);
                })}
              </div>
              <Button className="w-full" onClick={saveCats} disabled={selCats.length === 0}>Save & Next <ArrowRight className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Documents */}
        {wizardStep >= 2 && wizardStep < 4 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Step 3: Upload Documents</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {["MBBS Certificate *", "Medical Registration ID *", "State Medical Council"].map((doc, i) => {
                const uploaded = profile?.documents?.[i];
                return (<div key={doc} className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed ${uploaded ? "border-teal-500/30 bg-teal-500/5" : "border-white/10"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${uploaded ? "bg-teal-500/20" : "bg-white/5"}`}>
                    {uploaded ? <CheckCircle className="w-5 h-5 text-teal-400" /> : <Upload className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div className="flex-1"><p className="font-semibold text-sm">{doc}</p>
                  <p className="text-xs text-slate-500">{uploaded ? uploaded.fileName : "PDF or Image"}</p></div>
                  <Button size="sm" variant={uploaded ? "outline" : "default"}><Upload className="w-3 h-3" /> {uploaded ? "Re-upload" : "Upload"}</Button>
                </div>);
              })}
              <Button className="w-full" onClick={submitDocs}>Submit for Review <CheckCircle className="w-4 h-4" /></Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Submitted */}
        {wizardStep >= 4 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
              {isPending ? <Clock className="w-10 h-10 text-white" /> : <CheckCircle className="w-10 h-10 text-white" />}
            </div>
            <h1 className="text-3xl font-extrabold mb-3">{isPending ? "Under Review" : "Application Submitted"}</h1>
            <p className="text-slate-400 max-w-md mx-auto mb-8">Our team reviews documents within 24-48 hours. You&apos;ll get a notification when approved.</p>
            <div className="max-w-xs mx-auto space-y-3 text-left">
              {["Account Created", "Profile Completed", "Specializations Set", "Documents Uploaded", "Under Verification", "Approved"].map((s, i) => {
                const done = i < 4 || isApproved;
                const active = i === 4 && isPending;
                return (<div key={s} className="flex items-center gap-3">
                  {done ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : active ? <Clock className="w-5 h-5 text-amber-400 animate-pulse" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-700" />}
                  <span className={`text-sm ${done ? "text-slate-200" : active ? "text-amber-400" : "text-slate-600"}`}>{s}</span>
                </div>);
              })}
            </div>
            <Button variant="outline" className="mt-8" onClick={() => router.push("/doctor/documents")}>
              <FileText className="w-4 h-4" /> View / Update Documents
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ─── APPROVED — FULL DASHBOARD ──────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {profile?.name}</h1>
          <p className="text-slate-400 mt-1">Your practice overview for today</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/doctor/notifications")}>
          <Bell className="w-4 h-4" />
          {notifications.unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{notifications.unreadCount}</span>}
        </Button>
      </div>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Video className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-sm text-slate-300"><strong className="text-blue-300">Video calls are on the mobile app.</strong> Use the same login credentials on the Healio app to accept calls and consult patients.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: dashboard?.todayBookings ?? 0, icon: Calendar, color: "from-blue-500 to-cyan-600" },
          { label: "Total Earnings", value: `₹${Number(dashboard?.totalEarnings || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "from-emerald-500 to-green-600" },
          { label: "Status", value: dashboard?.isOnline ? "Online" : "Offline", icon: Stethoscope, color: dashboard?.isOnline ? "from-emerald-500 to-green-600" : "from-slate-500 to-slate-600" },
          { label: "Notifications", value: notifications.unreadCount ?? 0, icon: Bell, color: "from-orange-500 to-amber-600" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl font-extrabold">{s.value}</p><p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Today&apos;s Consultations</CardTitle>
          <Button size="sm" variant="outline" onClick={() => router.push("/doctor/bookings")}>View All</Button>
        </CardHeader>
        <CardContent>
          {todayBookings.length > 0 ? (
            <div className="space-y-3">{todayBookings.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">{b.patientName?.[0] || "P"}</div>
                  <div><p className="font-bold">{b.patientName}</p><p className="text-xs text-slate-500">{new Date(b.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {b.durationMin}min</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-emerald-400">+₹{Math.round(b.netEarning)}</p>
                  <Badge variant={statusColor[b.status] as any}>{b.status}</Badge>
                </div>
              </div>
            ))}</div>
          ) : (
            <div className="text-center py-8"><Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No consultations today</p><p className="text-xs text-slate-500 mt-1">Go online on the mobile app</p></div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "My Bookings", desc: "Past & upcoming", icon: Calendar, href: "/doctor/bookings" },
          { label: "Earnings", desc: "Revenue & payouts", icon: IndianRupee, href: "/doctor/earnings" },
          { label: "Documents", desc: "Certificates", icon: FileText, href: "/doctor/documents" },
        ].map((a) => (
          <Card key={a.label} className="cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push(a.href)}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center"><a.icon className="w-6 h-6 text-teal-400" /></div>
              <div><p className="font-bold">{a.label}</p><p className="text-xs text-slate-500">{a.desc}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
