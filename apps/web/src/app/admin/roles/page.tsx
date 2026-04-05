"use client";

import { useEffect, useState } from "react";
import { Plus, ShieldCheck, Save, Trash2, Eye, Edit2, Ban, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin-api";

const modules = [
  "doctors",
  "bookings",
  "finance",
  "analytics",
  "coupons",
  "plans",
  "categories",
  "content",
  "settings",
  "users",
];

export default function AdminRolesPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [permissions, setPermissions] = useState<Record<string, { read: boolean; write: boolean; delete: boolean }>>({});
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [adminPerms, setAdminPerms] = useState<any[]>([]);

  useEffect(() => { loadAdmins(); }, []);

  const loadAdmins = async () => {
    try { setAdmins(await adminApi("/admin/users")); } catch {}
  };

  const loadPermissions = async (userId: string) => {
    setSelectedAdmin(userId);
    try {
      const perms = await adminApi(`/admin/users/${userId}/permissions`);
      const permMap: Record<string, any> = {};
      perms.forEach((p: any) => {
        permMap[p.module] = { read: p.canRead, write: p.canWrite, delete: p.canDelete };
      });
      setAdminPerms(perms);
      setPermissions(permMap);
    } catch {}
  };

  const initPermissions = () => {
    const p: Record<string, any> = {};
    modules.forEach((m) => { p[m] = { read: true, write: false, delete: false }; });
    setPermissions(p);
  };

  const toggleAdminStatus = async (userId: string, isActive: boolean) => {
    if (!confirm(isActive ? "Deactivate this admin?" : "Activate this admin?")) return;
    try {
      await adminApi(`/admin/users/${userId}/${isActive ? "deactivate" : "activate"}`, { method: "POST" });
      loadAdmins();
    } catch (e: any) { alert(e.message || "Failed"); }
  };

  const createAdmin = async () => {
    if (!newEmail || !newPassword) return alert("Fill email and password");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return alert("Enter a valid email address");
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");
    const mods = Object.entries(permissions).map(([module, perms]) => ({
      module,
      canRead: perms.read,
      canWrite: perms.write,
      canDelete: perms.delete,
    }));
    await adminApi("/admin/users", {
      method: "POST",
      body: JSON.stringify({ email: newEmail, password: newPassword, modules: mods }),
    });
    setNewEmail(""); setNewPassword(""); setShowAdd(false);
    loadAdmins();
  };

  const updatePermission = async (userId: string, module: string, field: string, value: boolean) => {
    const body: any = { module };
    body[field === "read" ? "canRead" : field === "write" ? "canWrite" : "canDelete"] = value;
    await adminApi(`/admin/users/${userId}/permissions`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    loadPermissions(userId);
  };

  const togglePerm = (module: string, field: string) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [field]: !prev[module]?.[field as keyof typeof prev[typeof module]] },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Page Roles & Permissions</h1>
          <p className="text-slate-400 mt-1">Manage admin users and what they can access</p>
        </div>
        <Button onClick={() => { setShowAdd(!showAdd); setSelectedAdmin(null); initPermissions(); }}>
          <Plus className="w-4 h-4" /> Add Admin User
        </Button>
      </div>

      {/* Admin list */}
      <div className="space-y-3">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                {admin.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1">
                <p className="font-bold">{admin.email}</p>
                <p className="text-xs text-slate-500">
                  {admin.role} · Joined {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={admin.role === "SUPER_ADMIN" ? "warning" : "default"}>
                {admin.role}
              </Badge>
              <Badge variant={admin.isActive ? "success" : "destructive"}>
                {admin.isActive ? "Active" : "Blocked"}
              </Badge>
              {admin.role !== "SUPER_ADMIN" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => loadPermissions(admin.id)}>
                    <ShieldCheck className="w-3 h-3" /> Permissions
                  </Button>
                  <Button size="sm" variant={admin.isActive ? "destructive" : "default"} onClick={() => toggleAdminStatus(admin.id, admin.isActive)}>
                    {admin.isActive ? <><Ban className="w-3 h-3" /> Deactivate</> : <><CheckCircle className="w-3 h-3" /> Activate</>}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new admin form */}
      {showAdd && (
        <Card>
          <CardHeader><CardTitle>Create Admin User</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="flex-1" />
              <Input placeholder="Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1" />
            </div>

            <p className="text-sm font-bold text-slate-300 mt-4">Module Permissions</p>
            <div className="grid grid-cols-1 gap-2">
              {modules.map((mod) => (
                <div key={mod} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <span className="w-24 text-sm font-medium capitalize text-slate-300">{mod}</span>
                  {(["read", "write", "delete"] as const).map((perm) => (
                    <button
                      key={perm}
                      onClick={() => togglePerm(mod, perm)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        permissions[mod]?.[perm]
                          ? perm === "delete" ? "bg-red-500/20 text-red-400" : "bg-teal-500/20 text-teal-400"
                          : "bg-white/5 text-slate-600"
                      }`}
                    >
                      {perm === "read" && <Eye className="w-3 h-3 inline mr-1" />}
                      {perm === "write" && <Edit2 className="w-3 h-3 inline mr-1" />}
                      {perm === "delete" && <Ban className="w-3 h-3 inline mr-1" />}
                      {perm}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <Button onClick={createAdmin}><Save className="w-4 h-4" /> Create Admin</Button>
          </CardContent>
        </Card>
      )}

      {/* Edit permissions for selected admin */}
      {selectedAdmin && !showAdd && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Permissions — {admins.find(a => a.id === selectedAdmin)?.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {modules.map((mod) => {
                const perm = permissions[mod] || { read: false, write: false, delete: false };
                return (
                  <div key={mod} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <span className="w-24 text-sm font-medium capitalize text-slate-300">{mod}</span>
                    {(["read", "write", "delete"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => updatePermission(selectedAdmin, mod, p, !perm[p])}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          perm[p]
                            ? p === "delete" ? "bg-red-500/20 text-red-400" : "bg-teal-500/20 text-teal-400"
                            : "bg-white/5 text-slate-600"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
