"use client";

import { useEffect, useState, useRef } from "react";
import { FileText, Upload, CheckCircle, Clock, Shield, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

const API = "http://localhost:3000";

const requiredDocs = [
  { type: "mbbs_certificate", label: "MBBS Certificate", required: true },
  { type: "registration_id", label: "Medical Registration ID", required: true },
  { type: "state_council", label: "State Medical Council Certificate", required: false },
];

export default function DoctorDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setDocs(await adminApi("/doctors/me/documents")); } catch {}
  };

  const triggerUpload = (type: string) => {
    setUploadType(type);
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadType) return;
    setUploading(uploadType);
    try {
      const token = localStorage.getItem("token") || "";
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/doctors/me/documents?type=${uploadType}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      await load();
    } catch (err: any) { alert(err.message || "Upload failed"); }
    setUploading(null);
    e.target.value = "";
  };

  const getDoc = (type: string) => docs.find((d) => d.type === type);

  return (
    <div className="space-y-6">
      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Documents & Verification</h1>
        <p className="text-slate-400 mt-1">Upload your medical credentials for admin verification</p>
      </div>

      {/* Status */}
      <Card className={docs.length >= 2 && docs.every(d => d.verified) ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}>
        <CardContent className="p-4 flex items-center gap-3">
          {docs.length >= 2 && docs.every(d => d.verified) ? (
            <><CheckCircle className="w-6 h-6 text-emerald-400" /><div><p className="font-bold text-emerald-400">All Documents Verified</p><p className="text-sm text-slate-400">Your profile is active.</p></div></>
          ) : (
            <><Clock className="w-6 h-6 text-amber-400" /><div><p className="font-bold text-amber-400">Verification Pending</p><p className="text-sm text-slate-400">Upload required documents. Admin reviews within 24-48 hours.</p></div></>
          )}
        </CardContent>
      </Card>

      {/* Document cards */}
      <div className="space-y-4">
        {requiredDocs.map((req) => {
          const uploaded = getDoc(req.type);
          const isUploading = uploading === req.type;
          return (
            <Card key={req.type}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${uploaded?.verified ? "bg-emerald-500/10" : uploaded ? "bg-amber-500/10" : "bg-white/5"}`}>
                  {isUploading ? <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /> :
                   uploaded?.verified ? <CheckCircle className="w-7 h-7 text-emerald-400" /> :
                   uploaded ? <Clock className="w-7 h-7 text-amber-400" /> :
                   <Upload className="w-7 h-7 text-slate-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{req.label} {req.required && <span className="text-red-400">*</span>}</p>
                    {uploaded?.verified && <Badge variant="success">Verified</Badge>}
                    {uploaded && !uploaded.verified && <Badge variant="warning">Under Review</Badge>}
                    {!uploaded && <Badge variant="secondary">Not Uploaded</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {uploaded ? `${uploaded.fileName} · Uploaded ${new Date(uploaded.createdAt).toLocaleDateString()}` : "Upload a clear PDF or image"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {uploaded?.fileUrl && (
                    <a href={uploaded.fileUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline"><Eye className="w-3 h-3" /> View</Button>
                    </a>
                  )}
                  <Button size="sm" variant={uploaded ? "outline" : "default"} onClick={() => triggerUpload(req.type)} disabled={isUploading}>
                    <Upload className="w-3 h-3" /> {isUploading ? "Uploading..." : uploaded ? "Re-upload" : "Upload"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-blue-300"><Shield className="w-4 h-4 inline mr-1" /> Documents are securely stored. If rejected, you can re-upload corrected versions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
