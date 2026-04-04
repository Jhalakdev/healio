"use client";

import { motion } from "framer-motion";
import {
  Video,
  Shield,
  Clock,
  Wallet,
  Star,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  PhoneCall,
  FileText,
  Users,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Heal<span className="gradient-text">io</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-teal-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">
              How it works
            </a>
            <a href="#for-doctors" className="hover:text-teal-600 transition-colors">
              For Doctors
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden grid-bg">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Trusted by 10,000+ patients across India
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08]"
            >
              See a Doctor in{" "}
              <span className="gradient-text">60 Seconds</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
            >
              Skip the waiting room. Connect with verified doctors instantly via
              HD video — from anywhere, anytime. Secure, affordable, and built
              for India.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth/login">
                <Button size="xl" className="min-w-[200px]">
                  <PhoneCall className="w-5 h-5" />
                  Consult Now
                </Button>
              </Link>
              <Link href="/auth/doctor-register">
                <Button variant="outline" size="xl" className="min-w-[200px]">
                  <Stethoscope className="w-5 h-5" />
                  Join as Doctor
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No app download needed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Verified MBBS doctors
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Prescription included
              </span>
            </motion.div>
          </motion.div>

          {/* Hero visual — consultation card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="relative rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-2xl shadow-teal-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white/30 pulse-online" />
                  <span className="text-white font-semibold">
                    Live Consultation
                  </span>
                </div>
                <span className="text-white/80 text-sm font-mono">12:34</span>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex flex-col items-center justify-center gap-3 border border-slate-100">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                    <Stethoscope className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-700">
                      Dr. Priya Sharma
                    </p>
                    <p className="text-sm text-slate-400">General Medicine</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Video, title: "HD Video Call", desc: "Crystal clear on any network" },
                    { icon: FileText, title: "Share Reports", desc: "Upload during consultation" },
                    { icon: Shield, title: "End-to-End Secure", desc: "Your data stays private" },
                    { icon: Clock, title: "15 Min Session", desc: "Extendable by your doctor" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-200/60 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50,000+", label: "Consultations", icon: PhoneCall },
              { value: "500+", label: "Verified Doctors", icon: Stethoscope },
              { value: "4.9/5", label: "Patient Rating", icon: Star },
              { value: "<60s", label: "Avg Wait Time", icon: Clock },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                <p className="text-3xl font-extrabold tracking-tight gradient-text">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="secondary" className="mb-4">Features</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Everything you need<br />
              <span className="gradient-text">in one platform</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Video, title: "HD Video Consultation", description: "Adaptive streaming that works even on 3G. Auto-fallback to audio when network drops.", gradient: "from-blue-500 to-cyan-500" },
              { icon: Clock, title: "Instant + Scheduled", description: "See a doctor right now, or book a slot that fits your schedule. One tap is all it takes.", gradient: "from-teal-500 to-emerald-500" },
              { icon: FileText, title: "Digital Prescription", description: "Get your prescription as a PDF instantly after your consultation. Download anytime.", gradient: "from-emerald-500 to-green-500" },
              { icon: Wallet, title: "Wallet & Payments", description: "Pre-loaded wallet for instant bookings. Automatic refunds if anything goes wrong.", gradient: "from-violet-500 to-purple-500" },
              { icon: Shield, title: "Privacy First", description: "End-to-end encrypted calls. Your medical records are stored with signed URL access only.", gradient: "from-orange-500 to-red-500" },
              { icon: FileText, title: "Share Reports Live", description: "Upload PDFs, images, and reports during your call. Doctor sees them instantly.", gradient: "from-pink-500 to-rose-500" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-300 group">
                  <CardContent className="p-7">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-slate-50/50 grid-bg">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="secondary" className="mb-4">Simple Process</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Three steps to <span className="gradient-text">better health</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Choose a Doctor", description: "Browse verified doctors by specialization. See who's online right now or schedule for later.", icon: Users },
              { step: "02", title: "Share Your Symptoms", description: "Upload reports, describe symptoms, and list medications. Your doctor sees everything before the call.", icon: FileText },
              { step: "03", title: "Start Consultation", description: "Join the HD video call. Chat, share files, and get your prescription — all in one session.", icon: Video },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                <Card className="text-center p-8 h-full">
                  <span className="text-6xl font-black text-slate-100 absolute top-6 right-6">{item.step}</span>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Doctors CTA */}
      <section id="for-doctors" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600" />
            <div className="relative px-8 md:px-16 py-16 md:py-20 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-white">
                <Badge className="mb-4 bg-white/20 text-white border-0">For Doctors</Badge>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                  Grow your practice.<br />See patients online.
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
                  Join Healio and reach thousands of patients from the comfort of
                  your clinic or home. Set your own schedule, earn per
                  consultation, and focus on what you do best.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {["Set your own hours", "Earn 70% per consult", "See patient reports before call", "Digital prescription tools"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/90">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Link href="/auth/doctor-register">
                  <Button size="xl" className="bg-white text-teal-700 hover:bg-white/90 shadow-xl">
                    Register as Doctor
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-72 h-96 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Dr. Sharma</p>
                      <p className="text-xs text-white/60">General Medicine</p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    {[
                      { label: "Today's Consults", value: "12" },
                      { label: "Earnings", value: "₹8,400" },
                      { label: "Rating", value: "4.9 ★" },
                      { label: "Patients", value: "2,340" },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                        <span className="text-xs text-white/70">{stat.label}</span>
                        <span className="text-sm font-bold text-white">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-emerald-400/20">
                    <span className="text-xs text-emerald-200">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-online" />
                      <span className="text-sm font-semibold text-emerald-300">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: "Bank-Grade Security", description: "All data encrypted at rest and in transit. Medical records accessible only via signed URLs." },
              { icon: Globe, title: "Works Everywhere", description: "Adaptive video quality works on 3G, 4G, and WiFi. Auto-fallback to audio on poor networks." },
              { icon: Wallet, title: "Money-Back Guarantee", description: "Automatic refund if the doctor doesn't join or the call quality is poor. No questions asked." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Ready to feel <span className="gradient-text">better</span>?
            </h2>
            <p className="text-lg text-slate-500 mb-8">Your doctor is just a click away. No downloads, no waiting rooms.</p>
            <Link href="/auth/login">
              <Button size="xl" className="min-w-[240px]">
                <HeartPulse className="w-5 h-5" />
                Start Free Consultation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">Healio</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Making quality healthcare accessible to every Indian through technology.
              </p>
            </div>
            {[
              { title: "Product", links: ["For Patients", "For Doctors", "Pricing", "Download App"] },
              { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Refund Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-400 hover:text-teal-600 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200/60 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Healio Technologies Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
