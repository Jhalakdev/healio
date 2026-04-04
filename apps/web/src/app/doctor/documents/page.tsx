"use client";

import { useEffect, useState } from "react";
import { FileText, Upload, CheckCircle, Clock, XCircle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

const requiredDocs = [
  { type: "mbbs_certificate", label: "MBBS Certificate", required: true },
  { type: "registration_id", label: "Medical Registration ID", required: true },
  { type: "state_council", label: "State Medical Council Certificate", required: false },
];

export default function DoctorDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi("/doctors/me/documents").then(setDocs).catch(() => {});
    setLoading(false);
  }, []);

  const getDocByType = (type: string) => docs.find((d) => d.type === type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Documents & Verification</h1>
        <p className="text-slate-400 mt-1">Upload your medical credentials for admin verification</p>
      </div>

      {/* Status overview */}
      <Card className={`border-${docs.every(d => d.verified) && docs.length >= 2 ? "emerald" : "amber"}-500/20`}>
        <CardContent className="p-4 flex items-center gap-3">
          {docs.every(d => d.verified) && docs.length >= 2 ? (
            <>
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-400">All Documents Verified</p>
                <p className="text-sm text-slate-400">Your profile is active and visible to patients.</p>
              </div>
            </>
          ) : (
            <>
              <Clock className="w-6 h-6 text-amber-400" />
              <div>
                <p className="font-bold text-amber-400">Verification Pending</p>
                <p className="text-sm text-slate-400">Upload all required documents. Admin will review within 24-48 hours.</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Document cards */}
      <div className="space-y-4">
        {requiredDocs.map((req) => {
          const uploaded = getDocByType(req.type);
          return (
            <Card key={req.type}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    uploaded?.verified ? "bg-emerald-500/10" : uploaded ? "bg-amber-500/10" : "bg-white/5"
                  }`}>
                    {uploaded?.verified ? (
                      <CheckCircle className="w-7 h-7 text-emerald-400" />
                    ) : uploaded ? (
                      <Clock className="w-7 h-7 text-amber-400" />
                    ) : (
                      <Upload className="w-7 h-7 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{req.label} {req.required && <span className="text-red-400">*</span>}</p>
                      {uploaded?.verified && <Badge variant="success">Verified</Badge>}
                      {uploaded && !uploaded.verified && <Badge variant="warning">Under Review</Badge>}
                      {!uploaded && <Badge variant="secondary">Not Uploaded</Badge>}
                    </div>
                    {uploaded ? (
                      <p className="text-sm text-slate-500 mt-1">
                        {uploaded.fileName} · Uploaded {new Date(uploaded.createdAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 mt-1">Upload a clear PDF or image of this document</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {uploaded?.fileUrl && (
                      <a href={uploaded.fileUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline"><FileText className="w-3 h-3" /> View</Button>
                      </a>
                    )}
                    <Button size="sm" variant={uploaded ? "outline" : "default"}>
                      <Upload className="w-3 h-3" /> {uploaded ? "Re-upload" : "Upload"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-blue-300">
            <Shield className="w-4 h-4 inline mr-1" />
            Documents are securely stored and only accessible by admin reviewers.
            Upload clear, legible copies. If a document is rejected, you can re-upload a corrected version.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
