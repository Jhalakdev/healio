"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Video,
  PhoneIncoming,
  Calendar,
  IndianRupee,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  Users,
  HeartPulse,
  Stethoscope,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const upcomingBookings = [
  {
    id: "1",
    patient: "Rahul Kumar",
    age: 28,
    gender: "Male",
    symptoms: "Persistent headache, mild fever for 3 days",
    time: "Now",
    status: "INCOMING",
    reports: 2,
  },
  {
    id: "2",
    patient: "Anita Mishra",
    age: 35,
    gender: "Female",
    symptoms: "Skin rash on arms",
    time: "2:30 PM",
    status: "CONFIRMED",
    reports: 1,
  },
  {
    id: "3",
    patient: "Suresh Patil",
    age: 45,
    gender: "Male",
    symptoms: "Back pain, difficulty sleeping",
    time: "3:00 PM",
    status: "CONFIRMED",
    reports: 0,
  },
  {
    id: "4",
    patient: "Meera Trivedi",
    age: 22,
    gender: "Female",
    symptoms: "Frequent stomach ache after eating",
    time: "4:00 PM",
    status: "CONFIRMED",
    reports: 3,
  },
];

export default function DoctorDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Healio</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-semibold ml-2">
                DOCTOR
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Online toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isOnline
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-slate-100 border border-slate-200"
              }`}
            >
              {isOnline ? (
                <ToggleRight className="w-5 h-5 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-slate-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  isOnline ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </button>

            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <Avatar className="w-9 h-9 cursor-pointer">
              <AvatarFallback className="text-xs">PS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Good afternoon, Dr. Sharma
          </h1>
          <p className="text-slate-400 mt-1">
            You have 4 consultations scheduled today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: "Today's Consults", value: "4", icon: Calendar, color: "from-blue-500 to-cyan-500" },
            { title: "Earnings Today", value: "₹2,800", icon: IndianRupee, color: "from-emerald-500 to-green-500" },
            { title: "This Month", value: "₹54,600", icon: TrendingUp, color: "from-violet-500 to-purple-500" },
            { title: "Total Patients", value: "2,340", icon: Users, color: "from-orange-500 to-amber-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card>
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming bookings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Upcoming Consultations</h2>
              <Badge variant="secondary">{upcomingBookings.length} today</Badge>
            </div>

            {upcomingBookings.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <Card
                  className={`overflow-hidden ${
                    booking.status === "INCOMING"
                      ? "ring-2 ring-teal-500/30 shadow-lg shadow-teal-500/10"
                      : ""
                  }`}
                >
                  {booking.status === "INCOMING" && (
                    <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {booking.patient.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold">{booking.patient}</h3>
                          <p className="text-xs text-slate-400">
                            {booking.age} yrs · {booking.gender}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            booking.status === "INCOMING" ? "online" : "secondary"
                          }
                        >
                          {booking.status === "INCOMING" ? "Incoming Now" : booking.time}
                        </Badge>
                        {booking.reports > 0 && (
                          <p className="text-xs text-teal-600 mt-1 flex items-center justify-end gap-1">
                            <FileText className="w-3 h-3" />
                            {booking.reports} report{booking.reports > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="p-3 rounded-xl bg-slate-50 mb-4">
                      <p className="text-xs text-slate-400 mb-1">Symptoms</p>
                      <p className="text-sm text-slate-600">
                        {booking.symptoms}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {booking.status === "INCOMING" ? (
                        <>
                          <Button className="flex-1" size="default">
                            <Video className="w-4 h-4" />
                            Accept & Join
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:bg-red-50 hover:border-red-200"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" className="flex-1" size="default">
                            <FileText className="w-4 h-4" />
                            View Details
                          </Button>
                          <Button variant="outline" size="default">
                            <Calendar className="w-4 h-4" />
                            Reschedule
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: Calendar, label: "Manage Schedule", desc: "Set your availability" },
                  { icon: FileText, label: "Write Prescription", desc: "For recent patients" },
                  { icon: IndianRupee, label: "Earnings Report", desc: "View detailed breakdown" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <action.icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{action.label}</p>
                      <p className="text-xs text-slate-400">{action.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Today's summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Today&apos;s Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm text-slate-500">Completed</span>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold">7</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm text-slate-500">Remaining</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold">4</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm text-slate-500">Cancelled</span>
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-bold">1</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm text-slate-500">Avg Duration</span>
                    <span className="text-sm font-bold">12.4 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
