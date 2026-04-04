import {
  Droplets, Syringe, Bone, Eye, Baby, Ribbon, Hand, FlaskConical,
  Brain, Hospital, Activity, ScanLine, Heart, Accessibility,
  Stethoscope, Ear, Flower2, Wind, Thermometer, CircleDot,
  Headphones, LucideIcon,
} from "lucide-react";

// Map icon name (stored in DB) → Lucide component + color
const iconRegistry: Record<string, { icon: LucideIcon; color: string }> = {
  droplets: { icon: Droplets, color: "#3b82f6" },
  syringe: { icon: Syringe, color: "#8b5cf6" },
  bone: { icon: Bone, color: "#f59e0b" },
  eye: { icon: Eye, color: "#06b6d4" },
  baby: { icon: Baby, color: "#ec4899" },
  ribbon: { icon: Ribbon, color: "#ef4444" },
  hand: { icon: Hand, color: "#f97316" },
  "flask-conical": { icon: FlaskConical, color: "#10b981" },
  brain: { icon: Brain, color: "#7c3aed" },
  hospital: { icon: Hospital, color: "#dc2626" },
  activity: { icon: Activity, color: "#14b8a6" },
  "scan-line": { icon: ScanLine, color: "#6366f1" },
  heart: { icon: Heart, color: "#e11d48" },
  accessibility: { icon: Accessibility, color: "#0d9488" },
  stethoscope: { icon: Stethoscope, color: "#0d9488" },
  ear: { icon: Ear, color: "#d97706" },
  "flower-2": { icon: Flower2, color: "#ec4899" },
  wind: { icon: Wind, color: "#3b82f6" },
  thermometer: { icon: Thermometer, color: "#ef4444" },
  "circle-dot": { icon: CircleDot, color: "#f97316" },
  headphones: { icon: Headphones, color: "#ef4444" },
};

export function getIcon(name: string | null | undefined): { icon: LucideIcon; color: string } {
  if (!name) return { icon: Stethoscope, color: "#64748b" };
  return iconRegistry[name] || { icon: Stethoscope, color: "#64748b" };
}
