"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type LoginTab = "patient" | "doctor" | "admin";

export default function LoginPage() {
  const [tab, setTab] = useState<LoginTab>("patient");
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/20" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full border border-white/20" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border border-white/10" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Healio
            </span>
          </Link>

          <div className="space-y-8">
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Your health,
              <br />
              <span className="text-emerald-200">our priority.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              Connect with India's finest doctors from the comfort of your home.
              Instant consultations, digital prescriptions, and complete privacy.
            </p>

            <div className="space-y-4">
              {[
                { icon: Shield, text: "100% secure & private consultations" },
                { icon: Stethoscope, text: "500+ verified MBBS doctors" },
                { icon: Phone, text: "Available 24/7, 365 days" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Healio Technologies
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2 mb-8 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Tab selector */}
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200/60 mb-8">
            {[
              { key: "patient" as LoginTab, label: "Patient", icon: Phone },
              { key: "doctor" as LoginTab, label: "Doctor", icon: Stethoscope },
              { key: "admin" as LoginTab, label: "Admin", icon: Shield },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setOtpSent(false);
                }}
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

          <AnimatePresence mode="wait">
            <motion.div
              key={tab + (otpSent ? "-otp" : "")}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "patient" && (
                <Card className="shadow-xl shadow-slate-200/50 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">
                      {otpSent ? "Enter OTP" : "Welcome back"}
                    </CardTitle>
                    <p className="text-sm text-slate-400">
                      {otpSent
                        ? `We sent a 6-digit code to ${phone}`
                        : "Enter your phone number to get started"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!otpSent ? (
                      <>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-11"
                          />
                        </div>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => setOtpSent(true)}
                        >
                          Send OTP
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-2 justify-center">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <input
                              key={i}
                              type="text"
                              maxLength={1}
                              className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                if (target.value && target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLInputElement).focus();
                                }
                              }}
                            />
                          ))}
                        </div>
                        <Button className="w-full" size="lg">
                          Verify & Login
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        <button
                          onClick={() => setOtpSent(false)}
                          className="text-sm text-slate-400 hover:text-teal-600 transition-colors w-full text-center"
                        >
                          Change phone number
                        </button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {tab === "doctor" && (
                <Card className="shadow-xl shadow-slate-200/50 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Doctor Login</CardTitle>
                    <p className="text-sm text-slate-400">
                      Access your dashboard and consultations
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="doctor@healio.in" className="pl-11" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="Password"
                        className="pl-11"
                      />
                    </div>
                    <Button className="w-full" size="lg">
                      Login
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <div className="text-center">
                      <Link
                        href="/auth/doctor-register"
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        New doctor? Register here
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tab === "admin" && (
                <Card className="shadow-xl shadow-slate-200/50 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Admin Portal</CardTitle>
                    <p className="text-sm text-slate-400">
                      Platform management and analytics
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="admin@healio.in" className="pl-11" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="Password"
                        className="pl-11"
                      />
                    </div>
                    <Button className="w-full" size="lg">
                      Login to Admin
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
