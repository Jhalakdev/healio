"use client";

import { motion } from "framer-motion";
import {
  Video, Shield, Clock, Wallet, Star, ArrowRight, CheckCircle2,
  Stethoscope, HeartPulse, PhoneCall, FileText, Users, Zap, Globe, Lock,
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
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ══════ NAV ══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/20">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Blink<span className="text-teal-600">Cure</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How it works</a>
            <a href="#for-doctors" className="hover:text-teal-600 transition-colors">For Doctors</a>
            <a href="#pricing" className="hover:text-teal-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"><Button variant="ghost" size="sm" className="text-slate-600">Log in</Button></Link>
            <Link href="/auth/login"><Button size="sm" className="rounded-full px-5">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 via-white to-white" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div className="text-center max-w-4xl mx-auto" initial="initial" animate="animate" variants={stagger}>
            <motion.div variants={fadeUp}>
              <Badge className="mb-6 px-4 py-1.5 text-sm bg-teal-50 text-teal-700 border-teal-200/60 rounded-full">
                <Zap className="w-3.5 h-3.5 mr-1.5 text-teal-500" />
                Trusted by 10,000+ patients across India
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-900">
              Healthcare that{" "}
              <span className="relative">
                <span className="relative z-10 text-teal-600">comes to you</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-teal-100/60 -z-0 rounded-full" />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Connect with verified doctors via HD video in under 60 seconds.
              No downloads, no waiting rooms — just instant, affordable care.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/login">
                <Button size="xl" className="min-w-[220px] rounded-full h-14 text-base shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30">
                  <PhoneCall className="w-5 h-5" /> Book Consultation
                </Button>
              </Link>
              <Link href="/auth/doctor-register">
                <Button variant="outline" size="xl" className="min-w-[220px] rounded-full h-14 text-base border-slate-200 hover:border-teal-300 hover:bg-teal-50/50">
                  <Stethoscope className="w-5 h-5" /> Join as Doctor
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
              {["No app download needed", "Verified MBBS doctors", "Prescription included"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero card */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-20 max-w-5xl mx-auto">
            <div className="relative rounded-3xl bg-white shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white/40 pulse-online" />
                  <span className="text-white font-semibold text-sm">Live Consultation in Progress</span>
                </div>
                <span className="text-white/70 text-sm font-mono tracking-wider">12:34</span>
              </div>
              <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center gap-4 border border-slate-100">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <Stethoscope className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-800">Dr. Priya Sharma</p>
                    <p className="text-sm text-slate-400">General Medicine · 8 yrs exp</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                      <span className="text-xs text-slate-400 ml-1">4.9</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Video, title: "HD Video Call", desc: "Crystal clear on any network speed", color: "bg-blue-50 text-blue-600" },
                    { icon: FileText, title: "Upload Reports", desc: "Share PDFs and images during consultation", color: "bg-emerald-50 text-emerald-600" },
                    { icon: Shield, title: "End-to-End Encrypted", desc: "Your medical data stays completely private", color: "bg-violet-50 text-violet-600" },
                    { icon: Clock, title: "15 Min Session", desc: "Focused consultation, extendable by doctor", color: "bg-amber-50 text-amber-600" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                        <item.icon className="w-5 h-5" />
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

      {/* ══════ STATS ══════ */}
      <section className="py-16 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50,000+", label: "Consultations Done", icon: PhoneCall },
              { value: "500+", label: "Verified Doctors", icon: Stethoscope },
              { value: "4.9/5", label: "Patient Rating", icon: Star },
              { value: "<60s", label: "Avg Wait Time", icon: Clock },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-teal-600" />
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp}><Badge className="mb-4 bg-teal-50 text-teal-700 border-teal-200/60 rounded-full">Features</Badge></motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Everything you need,<br /><span className="text-teal-600">nothing you don&apos;t</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Video, title: "HD Video Consultation", desc: "Adaptive streaming that works even on 3G. Auto-fallback to audio on poor networks.", gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
              { icon: Clock, title: "Instant + Scheduled", desc: "See a doctor now or book a slot that fits your schedule. One tap is all it takes.", gradient: "from-teal-500 to-emerald-500", bg: "bg-teal-50" },
              { icon: FileText, title: "Digital Prescription", desc: "Get your prescription instantly after consultation. Download anytime from your history.", gradient: "from-emerald-500 to-green-500", bg: "bg-emerald-50" },
              { icon: Wallet, title: "Smart Wallet", desc: "Pre-loaded wallet for instant bookings. Automatic refunds if anything goes wrong.", gradient: "from-violet-500 to-purple-500", bg: "bg-violet-50" },
              { icon: Shield, title: "Privacy First", desc: "End-to-end encrypted calls. Medical records stored securely with signed URL access.", gradient: "from-orange-500 to-red-500", bg: "bg-orange-50" },
              { icon: Users, title: "Family Plans", desc: "Add up to 5 family members. Children get 10% discount. Share plans across phones.", gradient: "from-pink-500 to-rose-500", bg: "bg-pink-50" },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-slate-100 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group bg-white">
                  <CardContent className="p-7">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md`}>
                      <f.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp}><Badge className="mb-4 bg-white text-slate-600 border-slate-200 rounded-full">Simple Process</Badge></motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Three steps to <span className="text-teal-600">better health</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Choose a Doctor", desc: "Browse by specialization. See who's online or schedule for later.", icon: Users, color: "from-blue-500 to-cyan-500" },
              { step: "02", title: "Share Symptoms", desc: "Upload reports, describe symptoms. Doctor sees everything before the call.", icon: FileText, color: "from-teal-500 to-emerald-500" },
              { step: "03", title: "Get Treatment", desc: "HD video call, live chat, prescription — all in one focused session.", icon: Video, color: "from-emerald-500 to-green-500" },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className="bg-white rounded-3xl p-8 text-center h-full border border-slate-100 hover:shadow-lg transition-shadow relative overflow-hidden">
                  <span className="text-7xl font-black text-slate-50 absolute top-4 right-6 select-none">{item.step}</span>
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FOR DOCTORS ══════ */}
      <section id="for-doctors" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/30">
            <div className="px-8 md:px-16 py-16 md:py-20 flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <Badge className="mb-5 bg-teal-500/10 text-teal-400 border-teal-500/20 rounded-full">For Doctors</Badge>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
                  Grow your practice.<br />See patients online.
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
                  Join BlinkCure and reach thousands of patients. Set your own schedule, earn per consultation, and focus on what matters.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {["Set your own hours", "Earn 70% per consult", "See reports before call", "Digital prescriptions"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
                <Link href="/auth/doctor-register">
                  <Button size="xl" className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl rounded-full h-14 text-base px-8">
                    Register as Doctor <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-80 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div><p className="font-bold text-white">Dr. Sharma</p><p className="text-xs text-slate-400">General Medicine</p></div>
                  </div>
                  {[
                    { label: "Today's Consults", value: "12", color: "text-blue-400" },
                    { label: "Earnings", value: "₹8,400", color: "text-emerald-400" },
                    { label: "Rating", value: "4.9 ★", color: "text-amber-400" },
                    { label: "Patients", value: "2,340", color: "text-violet-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-xs text-slate-400">{stat.label}</span>
                      <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-xs text-emerald-300">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-online" />
                      <span className="text-sm font-semibold text-emerald-400">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ TRUST ══════ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Lock, title: "Bank-Grade Security", desc: "All data encrypted at rest and in transit. Medical records accessible only via signed URLs." },
              { icon: Globe, title: "Works Everywhere", desc: "Adaptive video quality works on 3G, 4G, and WiFi. Auto-fallback to audio on poor networks." },
              { icon: Wallet, title: "Money-Back Guarantee", desc: "Automatic refund if the doctor doesn't join or call quality is poor. No questions asked." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <item.icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
              Your doctor is just<br />a <span className="text-teal-600">click away</span>
            </h2>
            <p className="text-lg text-slate-500 mb-8">No downloads, no waiting rooms, no hassle.</p>
            <Link href="/auth/login">
              <Button size="xl" className="min-w-[260px] rounded-full h-14 text-base shadow-xl shadow-teal-500/20">
                <HeartPulse className="w-5 h-5" /> Start Consultation Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="border-t border-slate-100 py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-extrabold text-slate-900">BlinkCure</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Making quality healthcare accessible to every Indian through technology.</p>
            </div>
            {[
              { title: "Product", links: [{ text: "For Patients", href: "/auth/login" }, { text: "For Doctors", href: "/auth/doctor-register" }, { text: "Download App", href: "#" }] },
              { title: "Company", links: [{ text: "About Us", href: "#" }, { text: "Contact", href: "#" }, { text: "Careers", href: "#" }] },
              { title: "Legal", links: [{ text: "Privacy Policy", href: "#" }, { text: "Terms of Service", href: "#" }, { text: "Refund Policy", href: "#" }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm text-slate-900 mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.text}><a href={link.href} className="text-sm text-slate-500 hover:text-teal-600 transition-colors">{link.text}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-14 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} Web Accuracy Pvt. Ltd. All rights reserved.</p>
            <p className="text-xs text-slate-300">BlinkCure — a venture of Web Accuracy Pvt. Ltd.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
