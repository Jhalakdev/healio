"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  Clock,
  Video,
  Calendar,
  MapPin,
  ChevronDown,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const specializations = [
  "All",
  "General Medicine",
  "Dermatology",
  "Pediatrics",
  "Cardiology",
  "Orthopedics",
  "ENT",
  "Gynecology",
  "Psychiatry",
  "Neurology",
];

const doctors = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    specialization: "General Medicine",
    experience: 8,
    qualification: "MBBS, MD",
    fee: 500,
    rating: 4.9,
    reviews: 342,
    isOnline: true,
    avatar: null,
    languages: ["Hindi", "English"],
    nextSlot: "Available now",
  },
  {
    id: "2",
    name: "Dr. Amit Verma",
    specialization: "Dermatology",
    experience: 5,
    qualification: "MBBS, MD (Derma)",
    fee: 700,
    rating: 4.8,
    reviews: 218,
    isOnline: true,
    avatar: null,
    languages: ["Hindi", "English", "Gujarati"],
    nextSlot: "Available now",
  },
  {
    id: "3",
    name: "Dr. Neha Gupta",
    specialization: "Pediatrics",
    experience: 12,
    qualification: "MBBS, DCH",
    fee: 600,
    rating: 4.9,
    reviews: 456,
    isOnline: false,
    avatar: null,
    languages: ["Hindi", "English"],
    nextSlot: "Next slot: 4:00 PM",
  },
  {
    id: "4",
    name: "Dr. Raj Patel",
    specialization: "Cardiology",
    experience: 15,
    qualification: "MBBS, DM (Cardio)",
    fee: 1200,
    rating: 4.7,
    reviews: 189,
    isOnline: true,
    avatar: null,
    languages: ["Hindi", "English", "Tamil"],
    nextSlot: "Available now",
  },
  {
    id: "5",
    name: "Dr. Kavita Singh",
    specialization: "General Medicine",
    experience: 6,
    qualification: "MBBS, MD",
    fee: 400,
    rating: 4.6,
    reviews: 127,
    isOnline: false,
    avatar: null,
    languages: ["Hindi", "English"],
    nextSlot: "Next slot: Tomorrow 10 AM",
  },
  {
    id: "6",
    name: "Dr. Sanjay Kumar",
    specialization: "ENT",
    experience: 10,
    qualification: "MBBS, MS (ENT)",
    fee: 800,
    rating: 4.8,
    reviews: 293,
    isOnline: true,
    avatar: null,
    languages: ["Hindi", "English", "Bengali"],
    nextSlot: "Available now",
  },
];

export default function DoctorListingPage() {
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filtered = doctors.filter((doc) => {
    if (selectedSpec !== "All" && doc.specialization !== selectedSpec) return false;
    if (showOnlineOnly && !doc.isOnline) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Find a Doctor</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  showOnlineOnly
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${showOnlineOnly ? "bg-emerald-500 pulse-online" : "bg-slate-300"}`} />
                Online Now
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search doctors by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-slate-50 border-slate-200"
            />
          </div>

          {/* Specialization pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpec(spec)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSpec === spec
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-sm text-slate-400 mb-6">
          {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doctor, i) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                <CardContent className="p-0">
                  {/* Top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6">
                    {/* Doctor info */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="relative">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="text-lg">
                            {doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {doctor.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white pulse-online" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {doctor.qualification}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={doctor.isOnline ? "online" : "offline"}>
                            {doctor.isOnline ? "Online" : "Offline"}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {doctor.experience} yrs exp
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Specialization & rating */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">{doctor.specialization}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold">{doctor.rating}</span>
                        <span className="text-xs text-slate-400">
                          ({doctor.reviews})
                        </span>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {doctor.languages.map((lang) => (
                        <span
                          key={lang}
                          className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>

                    {/* Fee & slot */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 mb-4">
                      <div>
                        <p className="text-xs text-slate-400">Consultation Fee</p>
                        <p className="text-lg font-extrabold text-slate-800">
                          ₹{doctor.fee}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Next Available</p>
                        <p className={`text-sm font-semibold ${doctor.isOnline ? "text-emerald-600" : "text-slate-600"}`}>
                          {doctor.nextSlot}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {doctor.isOnline ? (
                        <Button className="flex-1" size="default">
                          <Video className="w-4 h-4" />
                          Consult Now
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1" size="default">
                          <Calendar className="w-4 h-4" />
                          Schedule
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
