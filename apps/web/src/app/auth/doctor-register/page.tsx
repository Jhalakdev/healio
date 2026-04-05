"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HeartPulse, Mail, Lock, User, Phone, FileText, Upload,
  CheckCircle, Clock, ArrowRight, Stethoscope, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const API = "http://localhost:3000";

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: info, 2: categories, 3: documents, 4: done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");
  const [councilNo, setCouncilNo] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [token, setToken] = useState("");

  useEffect(() => {
    fetch(`${API}/categories`).then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  const toggleCat = (id: string) => {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // Step 1: Register
  const register = async () => {
    if (!name || !email || !password) return setError("Fill name, email, and password");
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/doctor/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Login to get token for next steps
      const loginRes = await fetch(`${API}/auth/doctor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      // Doctor login will fail because PENDING — that's ok, we use admin to approve
      // For now just move to step 2
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Step 2: Submit (categories will be assigned by admin for now)
  const submitCategories = () => {
    setStep(3);
  };

  // Step 3: Done
  const submitDocuments = () => {
    setStep(4);
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-4">Application Submitted!</h1>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Your application is under review. Our team will verify your documents within 24-48 hours.
            You&apos;ll receive login credentials at <strong>{email}</strong> once approved.
          </p>
          <div className="bg-white rounded-2xl p-5 shadow-sm border mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium">Account Created</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium">Specializations Selected ({selectedCats.length})</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">Under Verification (24-48 hrs)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
              <span className="text-sm text-slate-400">Approval & Login Credentials</span>
            </div>
          </div>
          <Link href="/">
            <Button size="lg" className="w-full">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 relative">
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">BlinkCure</span>
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Join BlinkCure as a Doctor
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-6">
              Reach thousands of patients. Set your schedule. Earn per consultation.
              Our team reviews applications within 24-48 hours.
            </p>
            <div className="space-y-3">
              {["Upload MBBS certificate & documents", "Get verified by our team", "Start consulting patients"].map((t, i) => (
                <div key={t} className="flex items-center gap-3 text-white/80">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/40">&copy; {new Date().getFullYear()} BlinkCure — Web Accuracy Pvt. Ltd.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-lg">
          <Link href="/" className="flex items-center gap-1 mb-6 text-sm text-slate-500 hover:text-slate-700">
            <ChevronLeft className="w-4 h-4" /> Back to home
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-400"
                }`}>{s}</div>
                {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? "bg-teal-600" : "bg-slate-200"}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Personal Information</CardTitle>
                <p className="text-sm text-slate-400">Create your doctor account</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Dr. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="doctor@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Qualification</label>
                    <Input placeholder="MBBS, MD" value={qualification} onChange={(e) => setQualification(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Experience (years)</label>
                    <Input type="number" placeholder="e.g. 8" value={experience} onChange={(e) => setExperience(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">State Medical Council Number</label>
                  <Input placeholder="e.g. MH/12345/2020" value={councilNo} onChange={(e) => setCouncilNo(e.target.value)} />
                </div>
                <Button className="w-full" size="lg" onClick={register} disabled={loading}>
                  {loading ? "Creating Account..." : "Continue"} <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select Categories */}
          {step === 2 && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Select Your Specializations</CardTitle>
                <p className="text-sm text-slate-400">Choose all that apply — you can have multiple degrees</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCat(cat.id)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all text-center ${
                        selectedCats.includes(cat.id)
                          ? "bg-teal-600 text-white shadow-lg"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-teal-300"
                      }`}
                    >
                      <span className="text-lg block mb-1">{cat.icon || "🏥"}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
                {selectedCats.length > 0 && (
                  <p className="text-sm text-teal-600 font-medium">{selectedCats.length} specialization(s) selected</p>
                )}
                <Button className="w-full" size="lg" onClick={submitCategories}>
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Upload Documents */}
          {step === 3 && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Upload Documents</CardTitle>
                <p className="text-sm text-slate-400">Upload your medical credentials for verification</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: "mbbs_certificate", label: "MBBS Certificate", required: true },
                  { type: "registration_id", label: "Medical Registration ID", required: true },
                  { type: "state_council", label: "State Medical Council Certificate", required: false },
                ].map((doc) => (
                  <div
                    key={doc.type}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-300 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{doc.label} {doc.required && "*"}</p>
                      <p className="text-xs text-slate-400">PDF or Image (max 10MB)</p>
                    </div>
                    <Button size="sm" variant="outline">Choose File</Button>
                  </div>
                ))}
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                  <p className="text-sm text-teal-700">
                    <strong>Note:</strong> Documents will be reviewed by our team within 24-48 hours.
                    You&apos;ll receive your login credentials via email once approved.
                  </p>
                </div>
                <Button className="w-full" size="lg" onClick={submitDocuments}>
                  Submit Application <CheckCircle className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Already registered? <Link href="/auth/login" className="text-teal-600 font-medium">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
