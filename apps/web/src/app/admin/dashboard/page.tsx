"use client";

import { motion } from "framer-motion";
import {
  Users,
  Stethoscope,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PhoneCall,
  Clock,
  Activity,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const revenueData = [
  { name: "Mon", revenue: 12400, consultations: 32 },
  { name: "Tue", revenue: 18600, consultations: 45 },
  { name: "Wed", revenue: 15800, consultations: 38 },
  { name: "Thu", revenue: 22400, consultations: 56 },
  { name: "Fri", revenue: 19200, consultations: 48 },
  { name: "Sat", revenue: 24600, consultations: 62 },
  { name: "Sun", revenue: 16800, consultations: 42 },
];

const hourlyData = [
  { hour: "6am", calls: 3 },
  { hour: "8am", calls: 12 },
  { hour: "10am", calls: 28 },
  { hour: "12pm", calls: 35 },
  { hour: "2pm", calls: 30 },
  { hour: "4pm", calls: 25 },
  { hour: "6pm", calls: 38 },
  { hour: "8pm", calls: 42 },
  { hour: "10pm", calls: 18 },
];

const recentBookings = [
  { patient: "Rahul K.", doctor: "Dr. Priya Sharma", status: "IN_PROGRESS", time: "2 min ago", amount: 500 },
  { patient: "Anita M.", doctor: "Dr. Amit Verma", status: "COMPLETED", time: "15 min ago", amount: 700 },
  { patient: "Suresh P.", doctor: "Dr. Priya Sharma", status: "CONFIRMED", time: "22 min ago", amount: 500 },
  { patient: "Meera T.", doctor: "Dr. Neha Gupta", status: "COMPLETED", time: "45 min ago", amount: 600 },
  { patient: "Vikram S.", doctor: "Dr. Amit Verma", status: "CANCELLED", time: "1 hr ago", amount: 700 },
];

const topDoctors = [
  { name: "Dr. Priya Sharma", specialty: "General", consults: 156, earnings: 54600, rating: 4.9 },
  { name: "Dr. Amit Verma", specialty: "Dermatology", consults: 132, earnings: 66000, rating: 4.8 },
  { name: "Dr. Neha Gupta", specialty: "Pediatrics", consults: 98, earnings: 39200, rating: 4.9 },
  { name: "Dr. Raj Patel", specialty: "Cardiology", consults: 87, earnings: 60900, rating: 4.7 },
];

const statusColor: Record<string, string> = {
  IN_PROGRESS: "online",
  COMPLETED: "success",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  PENDING: "warning",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-online" />
            <span className="text-sm font-semibold text-emerald-700">
              8 doctors online
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
            <Video className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              3 live calls
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Total Revenue",
            value: "₹1,29,800",
            change: "+12.5%",
            trend: "up",
            icon: IndianRupee,
            color: "from-emerald-500 to-green-600",
            bgLight: "bg-emerald-50",
          },
          {
            title: "Today's Bookings",
            value: "48",
            change: "+8.2%",
            trend: "up",
            icon: CalendarCheck,
            color: "from-blue-500 to-cyan-600",
            bgLight: "bg-blue-50",
          },
          {
            title: "Active Patients",
            value: "12,340",
            change: "+4.1%",
            trend: "up",
            icon: Users,
            color: "from-violet-500 to-purple-600",
            bgLight: "bg-violet-50",
          },
          {
            title: "Avg Session Time",
            value: "13.2 min",
            change: "-0.8 min",
            trend: "down",
            icon: Clock,
            color: "from-orange-500 to-amber-600",
            bgLight: "bg-orange-50",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      stat.trend === "up"
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-orange-700 bg-orange-50"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-extrabold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Revenue Overview</CardTitle>
            <Badge variant="secondary">This Week</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hourly Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="calls" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">
              View all
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.map((booking, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="text-xs">
                        {booking.patient.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{booking.patient}</p>
                      <p className="text-xs text-slate-400">
                        {booking.doctor} · {booking.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      ₹{booking.amount}
                    </span>
                    <Badge
                      variant={
                        statusColor[booking.status] as any
                      }
                    >
                      {booking.status.replace("_", " ")}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top doctors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Top Doctors</CardTitle>
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">
              This month
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDoctors.map((doctor, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-sm font-bold text-teal-700">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{doctor.name}</p>
                      <p className="text-xs text-slate-400">
                        {doctor.specialty} · {doctor.consults} consults
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      ₹{doctor.earnings.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-amber-500">
                      ★ {doctor.rating}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
