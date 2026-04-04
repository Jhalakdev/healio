"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Stethoscope,
  Shield,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const API = "http://localhost:3000";

type LoginTab = "patient" | "doctor" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<LoginTab>("admin");
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      router.push("/admin/dashboard");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleDoctorLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/doctor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.accessToken);
      router.push("/doctor/dashboard");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/20" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full border border-white/20" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Healio</span>
          </Link>
          <div className="space-y-8">
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Your health,<br />
              <span className="text-emerald-200">our priority.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              Manage doctors, patients, bookings, and revenue from one powerful dashboard.
            </p>
          </div>
          <p className="text-sm text-white/40">&copy; {new Date().getFullYear()} Healio — Web Accuracy Pvt. Ltd.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 text-sm text-slate-500 hover:text-slate-700">
            <ChevronLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Tab selector */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200/60 mb-8">
            {[
              { key: "admin" as LoginTab, label: "Admin", icon: Shield },
              { key: "doctor" as LoginTab, label: "Doctor", icon: Stethoscope },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  tab === t.key
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Admin login */}
          {tab === "admin" && (
            <Card className="shadow-xl shadow-slate-200/50 border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Admin Portal</CardTitle>
                <p className="text-sm text-slate-400">Platform management and analytics</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="admin@healio.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11"
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  />
                </div>
                <Button className="w-full" size="lg" onClick={handleAdminLogin} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login to Admin"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Doctor login */}
          {tab === "doctor" && (
            <Card className="shadow-xl shadow-slate-200/50 border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Doctor Login</CardTitle>
                <p className="text-sm text-slate-400">Access your consultations dashboard</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="doctor@healio.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="doctor123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11"
                    onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
                  />
                </div>
                <Button className="w-full" size="lg" onClick={handleDoctorLogin} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            {tab === "admin" ? "Admin: admin@healio.in / admin123" : "Doctor: doctor@healio.in / doctor123"}
          </p>
        </div>
      </div>
    </div>
  );
}
