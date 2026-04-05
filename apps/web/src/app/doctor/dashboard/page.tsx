"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import {
  Calendar, IndianRupee, Bell, CheckCircle, Clock, Stethoscope, Video,
  FileText, ArrowRight, ArrowLeft, User, Upload, AlertTriangle, Camera, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";
import { getIcon } from "@/lib/icon-map";

const API = "http://localhost:3000";
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

  // Wizard
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [exp, setExp] = useState("");
  const [maxSess, setMaxSess] = useState("20");
  const [selCats, setSelCats] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState("");

  // Photo
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [rawImg, setRawImg] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  // Doc upload
  const [uploading, setUploading] = useState<string | null>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState("");

  useEffect(() => {
    Promise.all([
      adminApi("/doctors/me/profile").then((p) => {
        setProfile(p);
        setStep(p.onboardingStep || 0);
        setName(p.name || ""); setBio(p.bio || "");
        setExp(String(p.experience || "")); setMaxSess(String(p.maxSessionsPerDay || 20));
        setQualifications((p.qualifications || []).join(', ') || p.qualification || '');
        setSelCats((p.categories || []).map((c: any) => c.categoryId));
        setPhotoSrc(p.avatarUrl || null);
      }).catch(() => {}),
      adminApi("/doctors/me/dashboard").then(setDashboard).catch(() => {}),
      adminApi("/doctors/me/bookings-by-date?range=today").then((d) => setTodayBookings(d?.bookings || [])).catch(() => {}),
      adminApi("/notifications").then(setNotifications).catch(() => {}),
      adminApi("/categories").then(setAllCategories).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const [error, setError] = useState("");

  const go = async (to: number) => {
    try {
      await adminApi("/doctors/me/onboarding", { method: "PATCH", body: JSON.stringify({ step: to }) });
      setStep(to);
      const p = await adminApi("/doctors/me/profile");
      setProfile(p);
    } catch (e: any) {
      setError(e.message || "Failed to save. Please re-login and try again.");
      if (e.message?.includes("Unauthorized")) {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
    }
  };

  const saveProfile = async () => {
    setSaving(true); setError("");
    try {
      await adminApi("/doctors/me", { method: "PATCH", body: JSON.stringify({ name, bio, experience: Number(exp) || undefined, maxSessionsPerDay: Number(maxSess) || 20, qualification: qualifications }) });
      await go(2); // profile done → go to specializations
    } catch (e: any) { setError(e.message || "Failed to save profile"); }
    setSaving(false);
  };

  const saveCats = async () => {
    setSaving(true); setError("");
    try {
      await adminApi("/doctors/me/categories", { method: "POST", body: JSON.stringify({ categoryIds: selCats }) });
      await go(3); // specs done → go to documents
    } catch (e: any) { setError(e.message || "Failed to save categories"); }
    setSaving(false);
  };

  const submitForReview = async () => {
    setSaving(true); setError("");
    try { await go(4); } catch (e: any) { setError(e.message || "Failed to submit"); }
    setSaving(false);
  };

  // Real file upload for documents
  const triggerDocUpload = (type: string) => {
    setUploadType(type);
    docRef.current?.click();
  };

  const handleDocFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadType) return;
    setUploading(uploadType);
    try {
      const token = localStorage.getItem("token") || "";
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/doctors/me/documents?type=${uploadType}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      // Refresh profile
      const p = await adminApi("/doctors/me/profile");
      setProfile(p);
    } catch (err: any) {
      alert(err.message || "Upload failed");
    }
    setUploading(null);
    e.target.value = "";
  };

  // Photo
  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setRawImg(reader.result as string); setCropOpen(true); };
    reader.readAsDataURL(file);
  };

  const applyCrop = () => {
    setPhotoSrc(rawImg);
    setCropOpen(false);
    // TODO: upload cropped image to API
  };

  const isApproved = profile?.verificationStatus === "APPROVED";

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // WIZARD (not approved)
  // ═══════════════════════════════════════════════════
  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto min-h-[80vh] flex flex-col">
        {/* Hidden file inputs */}
        <input ref={docRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocFile} />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />

        {/* Crop modal */}
        {cropOpen && rawImg && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8">
            <div className="w-80 h-80 relative rounded-2xl overflow-hidden">
              <Cropper image={rawImg} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={() => {}} />
            </div>
            <div className="flex gap-3 mt-6">
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-48" />
              <Button onClick={applyCrop}><CheckCircle className="w-4 h-4" /> Apply</Button>
              <Button variant="outline" onClick={() => setCropOpen(false)}><X className="w-4 h-4" /> Cancel</Button>
            </div>
          </div>
        )}

        {/* Rejection banner */}
        {profile?.verificationStatus === "REJECTED" && profile?.rejectionReason && (
          <Card className="border-red-500/30 bg-red-500/5 mb-6">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-red-400">Application Rejected</p>
                <p className="text-sm text-slate-400 mt-1">{profile.rejectionReason}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress bar (steps 1,2,3 only) */}
        {step >= 1 && step <= 3 && (
          <div className="flex items-center gap-1 mb-8">
            {["Profile", "Specializations", "Documents"].map((l, i) => {
              const stepNum = i + 1; // 1, 2, 3
              const done = step > stepNum;
              const current = step === stepNum;
              return (
                <div key={l} className="flex items-center gap-2 flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${done ? "bg-teal-500 text-white" : current ? "bg-teal-500/30 text-teal-400 ring-2 ring-teal-500/50" : "bg-white/10 text-slate-600"}`}>
                    {done ? "✓" : stepNum}
                  </div>
                  <span className={`text-xs ${done || current ? "text-slate-300" : "text-slate-600"}`}>{l}</span>
                  {i < 2 && <div className={`flex-1 h-1 rounded ${done ? "bg-teal-500" : "bg-white/10"}`} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-8 shadow-2xl shadow-teal-500/30">
              <Stethoscope className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold mb-4">Welcome to BlinkCure!</h1>
            <p className="text-xl text-slate-400 max-w-md mb-10">Let&apos;s set up your doctor profile. Takes about 2 minutes.</p>
            <Button size="lg" className="text-lg px-10 py-6 rounded-2xl" onClick={() => setStep(1)}>
              Let&apos;s Get Started <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* ── STEP 1: Profile ── */}
        {step === 1 && (
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold mb-2">Your Profile</h2>
            <p className="text-slate-400 mb-8">Tell patients about yourself</p>

            {/* Photo */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white/10">
                  {photoSrc ? <img src={photoSrc} alt="" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-slate-500" />}
                </div>
                <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <div>
                <p className="font-bold">Profile Photo</p>
                <p className="text-xs text-slate-500">Click camera to upload</p>
              </div>
            </div>

            <div className="space-y-5">
              <div><label className="text-sm font-semibold text-slate-300 mb-2 block">Full Name *</label>
              <Input className="h-12 text-base" placeholder="Dr. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><label className="text-sm font-semibold text-slate-300 mb-2 block">Qualifications *</label>
              <Input className="h-12 text-base" placeholder="MBBS, MD, DNB (comma separated)" value={qualifications} onChange={(e) => setQualifications(e.target.value)} /></div>
              <div><label className="text-sm font-semibold text-slate-300 mb-2 block">About You</label>
              <textarea className="w-full p-4 rounded-xl border text-base min-h-[100px]" placeholder="Your experience..." value={bio} onChange={(e) => setBio(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold text-slate-300 mb-2 block">Experience (years) *</label>
                <Input className="h-12 text-base" type="number" placeholder="8" value={exp} onChange={(e) => setExp(e.target.value)} /></div>
                <div><label className="text-sm font-semibold text-slate-300 mb-2 block">Max Consults/Day</label>
                <Input className="h-12 text-base" type="number" placeholder="20" value={maxSess} onChange={(e) => setMaxSess(e.target.value)} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" size="lg" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button size="lg" className="flex-1" onClick={saveProfile} disabled={!name || saving}>{saving ? "Saving..." : "Save & Next"} <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Specializations ── */}
        {step === 2 && (
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold mb-2">Your Specializations</h2>
            <p className="text-slate-400 mb-8">Select all that match your degrees</p>
            <div className="grid grid-cols-2 gap-3">
              {allCategories.map((cat: any) => {
                const { icon: Icon, color } = getIcon(cat.icon);
                const sel = selCats.includes(cat.id);
                return (<button key={cat.id} onClick={() => setSelCats(p => sel ? p.filter(id => id !== cat.id) : [...p, cat.id])}
                  className={`flex items-center gap-3 p-4 rounded-xl text-base font-medium transition-all ${sel ? "bg-teal-500/20 text-teal-400 border-2 border-teal-500/40" : "bg-white/5 text-slate-400 border-2 border-transparent hover:border-white/10"}`}>
                  <Icon className="w-5 h-5" style={{ color: sel ? undefined : color }} />
                  {cat.name}
                  {sel && <CheckCircle className="w-4 h-4 ml-auto" />}
                </button>);
              })}
            </div>
            {selCats.length > 0 && <p className="text-sm text-teal-400 mt-4">{selCats.length} selected</p>}
            <div className="flex gap-3 mt-8">
              <Button variant="outline" size="lg" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button size="lg" className="flex-1" onClick={saveCats} disabled={selCats.length === 0 || saving}>{saving ? "Saving..." : "Save & Next"} <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Documents (REAL UPLOAD) ── */}
        {step === 3 && (
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold mb-2">Upload Documents</h2>
            <p className="text-slate-400 mb-8">Upload your medical credentials for verification</p>
            <div className="space-y-4">
              {[
                { type: "mbbs_certificate", label: "MBBS Certificate", required: true },
                { type: "registration_id", label: "Medical Registration ID", required: true },
                { type: "state_council", label: "State Medical Council Certificate", required: false },
              ].map((doc) => {
                const uploaded = profile?.documents?.find((d: any) => d.type === doc.type);
                const isUploading = uploading === doc.type;
                return (
                  <div key={doc.type} className={`flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed transition-all ${uploaded ? "border-teal-500/30 bg-teal-500/5" : "border-white/10"}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${uploaded ? "bg-teal-500/20" : "bg-white/5"}`}>
                      {isUploading ? <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /> :
                       uploaded ? <CheckCircle className="w-7 h-7 text-teal-400" /> : <Upload className="w-7 h-7 text-slate-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base">{doc.label} {doc.required && <span className="text-red-400">*</span>}</p>
                      <p className="text-sm text-slate-500">{uploaded ? `${uploaded.fileName} · ${uploaded.verified ? "Verified ✓" : "Uploaded"}` : "PDF or Image (max 10MB)"}</p>
                    </div>
                    <Button size="lg" variant={uploaded ? "outline" : "default"} onClick={() => triggerDocUpload(doc.type)} disabled={isUploading}>
                      <Upload className="w-4 h-4" /> {isUploading ? "Uploading..." : uploaded ? "Replace" : "Upload"}
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" size="lg" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button size="lg" className="flex-1" onClick={submitForReview} disabled={saving}>{saving ? "Submitting..." : "Submit for Review"} <CheckCircle className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Submitted ── */}
        {step >= 4 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-8 shadow-2xl shadow-teal-500/30">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold mb-4">Application Submitted!</h1>
            <p className="text-lg text-slate-400 max-w-lg mb-10">Our team reviews within 24-48 hours. You&apos;ll get a notification when approved.</p>
            <div className="max-w-sm w-full space-y-4 text-left mb-10">
              {["Account Created", "Profile Completed", "Specializations Set", "Documents Uploaded", "Under Verification", "Approved"].map((s, i) => {
                const done = i < 4 || isApproved;
                const active = i === 4 && profile?.verificationStatus === "PENDING";
                return (<div key={i} className="flex items-center gap-4">
                  {done ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : active ? <Clock className="w-6 h-6 text-amber-400 animate-pulse" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-700" />}
                  <span className={`text-base ${done ? "text-slate-200" : active ? "text-amber-400 font-bold" : "text-slate-600"}`}>{s}</span>
                </div>);
              })}
            </div>
            <Button variant="outline" size="lg" onClick={() => router.push("/doctor/documents")}>
              <FileText className="w-4 h-4" /> View / Update Documents
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // APPROVED DASHBOARD
  // ═══════════════════════════════════════════════════
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
          <p className="text-sm text-slate-300"><strong className="text-blue-300">Video calls are on the mobile app.</strong> Use same credentials on the BlinkCure app to accept calls.</p>
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
            <div className="text-center py-8"><Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No consultations today</p></div>
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
