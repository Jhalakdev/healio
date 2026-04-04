"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, FileText, HelpCircle, Image, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";

type Tab = "faqs" | "pages" | "banners";

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("faqs");
  const [faqs, setFaqs] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  // FAQ state
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  // CMS state
  const [pageSlug, setPageSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  // Banner state
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSub, setBannerSub] = useState("");

  useEffect(() => {
    adminApi("/admin/faqs").then(setFaqs).catch(() => {});
    adminApi("/admin/cms").then(setPages).catch(() => {});
    adminApi("/admin/banners").then(setBanners).catch(() => {});
  }, []);

  const addFaq = async () => {
    if (!faqQ || !faqA) return;
    await adminApi("/admin/faqs", { method: "POST", body: JSON.stringify({ question: faqQ, answer: faqA }) });
    setFaqQ(""); setFaqA(""); setShowAdd(false);
    setFaqs(await adminApi("/admin/faqs"));
  };

  const deleteFaq = async (id: string) => {
    await adminApi(`/admin/faqs/${id}`, { method: "DELETE" });
    setFaqs(await adminApi("/admin/faqs"));
  };

  const savePage = async () => {
    if (!pageSlug || !pageTitle || !pageContent) return;
    await adminApi(`/admin/cms/${pageSlug}`, { method: "POST", body: JSON.stringify({ title: pageTitle, content: pageContent }) });
    setPageSlug(""); setPageTitle(""); setPageContent(""); setShowAdd(false);
    setPages(await adminApi("/admin/cms"));
  };

  const addBanner = async () => {
    if (!bannerTitle) return;
    await adminApi("/admin/banners", { method: "POST", body: JSON.stringify({ title: bannerTitle, subtitle: bannerSub }) });
    setBannerTitle(""); setBannerSub(""); setShowAdd(false);
    setBanners(await adminApi("/admin/banners"));
  };

  const deleteBanner = async (id: string) => {
    await adminApi(`/admin/banners/${id}`, { method: "DELETE" });
    setBanners(await adminApi("/admin/banners"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Content Manager</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "faqs" as Tab, label: "FAQs", icon: HelpCircle, count: faqs.length },
          { key: "pages" as Tab, label: "Pages (T&C, Privacy)", icon: FileText, count: pages.length },
          { key: "banners" as Tab, label: "Banners", icon: Image, count: banners.length },
        ].map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            onClick={() => { setTab(t.key); setShowAdd(false); }}
          >
            <t.icon className="w-4 h-4" /> {t.label} ({t.count})
          </Button>
        ))}
      </div>

      {/* Add forms */}
      {showAdd && tab === "faqs" && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <Input placeholder="Question" value={faqQ} onChange={(e) => setFaqQ(e.target.value)} />
            <textarea
              className="w-full p-3 rounded-xl border border-slate-200 text-sm min-h-[80px]"
              placeholder="Answer"
              value={faqA}
              onChange={(e) => setFaqA(e.target.value)}
            />
            <Button onClick={addFaq}><Save className="w-4 h-4" /> Save FAQ</Button>
          </CardContent>
        </Card>
      )}

      {showAdd && tab === "pages" && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex gap-3">
              <select
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
              >
                <option value="">Select page...</option>
                <option value="terms">Terms & Conditions</option>
                <option value="privacy">Privacy Policy</option>
                <option value="refund">Refund Policy</option>
                <option value="about">About Us</option>
              </select>
              <Input placeholder="Page Title" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="flex-1" />
            </div>
            <textarea
              className="w-full p-3 rounded-xl border border-slate-200 text-sm min-h-[150px]"
              placeholder="Page content (supports HTML/Markdown)"
              value={pageContent}
              onChange={(e) => setPageContent(e.target.value)}
            />
            <Button onClick={savePage}><Save className="w-4 h-4" /> Save Page</Button>
          </CardContent>
        </Card>
      )}

      {showAdd && tab === "banners" && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <Input placeholder="Banner Title" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} />
            <Input placeholder="Subtitle (optional)" value={bannerSub} onChange={(e) => setBannerSub(e.target.value)} />
            <Button onClick={addBanner}><Save className="w-4 h-4" /> Save Banner</Button>
          </CardContent>
        </Card>
      )}

      {/* FAQs list */}
      {tab === "faqs" && (
        <div className="space-y-2">
          {faqs.map((f) => (
            <Card key={f.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm">{f.question}</p>
                  <p className="text-sm text-slate-500 mt-1">{f.answer}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteFaq(f.id)}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {faqs.length === 0 && <p className="text-slate-400">No FAQs yet. Click &quot;Add New&quot; to create one.</p>}
        </div>
      )}

      {/* Pages list */}
      {tab === "pages" && (
        <div className="space-y-2">
          {pages.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-bold">{p.title}</p>
                  <p className="text-xs text-slate-400">/{p.slug} · Updated: {new Date(p.updatedAt).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  setPageSlug(p.slug); setPageTitle(p.title); setPageContent(p.content); setShowAdd(true);
                }}>
                  <Edit2 className="w-3 h-3" /> Edit
                </Button>
              </CardContent>
            </Card>
          ))}
          {pages.length === 0 && <p className="text-slate-400">No pages yet. Add Terms & Conditions, Privacy Policy, etc.</p>}
        </div>
      )}

      {/* Banners */}
      {tab === "banners" && (
        <div className="space-y-2">
          {banners.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <Image className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-bold">{b.title}</p>
                  <p className="text-xs text-slate-400">{b.subtitle || "No subtitle"} · Target: {b.target}</p>
                </div>
                <Badge variant={b.isActive ? "success" : "secondary"}>{b.isActive ? "Active" : "Hidden"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => deleteBanner(b.id)}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {banners.length === 0 && <p className="text-slate-400">No banners yet.</p>}
        </div>
      )}
    </div>
  );
}
