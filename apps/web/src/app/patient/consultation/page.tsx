"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileUp,
  Send,
  Paperclip,
  X,
  Maximize2,
  Minimize2,
  Clock,
  Signal,
  Shield,
  ChevronUp,
  Image as ImageIcon,
  File,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockMessages = [
  { id: 1, sender: "doctor", type: "text", content: "Hello Rahul! I can see you. How are you feeling today?", time: "2:01 PM" },
  { id: 2, sender: "patient", type: "text", content: "Hi Doctor, I've been having headaches for the past 3 days, mostly in the evening.", time: "2:01 PM" },
  { id: 3, sender: "doctor", type: "text", content: "I see. Are you experiencing any other symptoms like nausea, sensitivity to light, or fever?", time: "2:02 PM" },
  { id: 4, sender: "patient", type: "text", content: "Yes, mild fever around 99-100°F and some eye strain.", time: "2:02 PM" },
  { id: 5, sender: "patient", type: "file", content: "blood_report.pdf", time: "2:03 PM" },
  { id: 6, sender: "doctor", type: "text", content: "Thank you for sharing the report. Let me review it. Your blood work looks normal. The headache could be tension-type. I'll prescribe some medication.", time: "2:04 PM" },
];

export default function ConsultationRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft] = useState("12:34");

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 pulse-online" />
            <span className="text-white text-sm font-semibold">LIVE</span>
          </div>
          <div className="h-5 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium">
              Encrypted
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-white font-mono text-sm font-bold">
              {timeLeft}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800">
            <Signal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-slate-300">Good</span>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 relative">
          {/* Doctor video (main) */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-14 h-14 text-white" />
              </div>
              <p className="text-white text-xl font-bold">Dr. Priya Sharma</p>
              <p className="text-slate-400 text-sm mt-1">General Medicine</p>
            </div>
          </div>

          {/* Patient video (PiP) */}
          <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className="absolute bottom-24 right-4 w-48 h-36 rounded-2xl bg-slate-700 border-2 border-slate-600 overflow-hidden shadow-2xl cursor-move z-20"
          >
            <div className="w-full h-full flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center">
                  <Avatar className="w-12 h-12 mx-auto mb-1">
                    <AvatarFallback className="text-xs">RK</AvatarFallback>
                  </Avatar>
                  <p className="text-slate-300 text-xs">Camera off</p>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-sm">RK</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-2">
              <span className="text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded">
                You
              </span>
            </div>
          </motion.div>

          {/* Control bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <div className="flex items-center justify-center gap-3">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-slate-700/80 backdrop-blur-sm hover:bg-slate-600"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isVideoOff
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-slate-700/80 backdrop-blur-sm hover:bg-slate-600"
                }`}
              >
                {isVideoOff ? (
                  <VideoOff className="w-5 h-5 text-white" />
                ) : (
                  <VideoIcon className="w-5 h-5 text-white" />
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.92 }}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/30"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isChatOpen
                    ? "bg-teal-500 hover:bg-teal-600"
                    : "bg-slate-700/80 backdrop-blur-sm hover:bg-slate-600"
                }`}
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.92 }}
                className="w-12 h-12 rounded-full bg-slate-700/80 backdrop-blur-sm hover:bg-slate-600 flex items-center justify-center transition-all"
              >
                <FileUp className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden"
            >
              {/* Chat header */}
              <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <span className="text-white font-semibold text-sm">
                    Chat
                  </span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {mockMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.sender === "patient"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          msg.sender === "patient"
                            ? "order-1"
                            : "order-2"
                        }`}
                      >
                        {msg.type === "text" ? (
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              msg.sender === "patient"
                                ? "bg-teal-600 text-white rounded-br-md"
                                : "bg-slate-800 text-slate-200 rounded-bl-md"
                            }`}
                          >
                            {msg.content}
                          </div>
                        ) : (
                          <div
                            className={`px-4 py-3 rounded-2xl flex items-center gap-2 ${
                              msg.sender === "patient"
                                ? "bg-teal-600/20 border border-teal-500/30 rounded-br-md"
                                : "bg-slate-800 border border-slate-700 rounded-bl-md"
                            }`}
                          >
                            <File className="w-4 h-4 text-teal-400" />
                            <span className="text-sm text-teal-300 underline underline-offset-2">
                              {msg.content}
                            </span>
                          </div>
                        )}
                        <p
                          className={`text-[10px] text-slate-500 mt-1 ${
                            msg.sender === "patient"
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat input */}
              <div className="p-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                  <button className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
