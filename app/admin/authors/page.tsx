"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Edit3,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Copy,
  Check,
  Lock,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Briefcase,
  Mail,
  FileText,
  Shield,
  ShieldAlert,
  Building,
  Calendar,
  X,
} from "lucide-react";

interface AuthorItem {
  id: string;
  name: string;
  slug: string;
  designation?: string | null;
  department?: string | null;
  bio?: string | null;
  avatar?: string | null;
  email?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
  };
}

interface UserItem {
  id: string;
  name: string;
  displayName?: string | null;
  email: string;
  role: "SUPER_ADMIN" | "EDITOR" | "REPORTER" | "READER";
  designation?: string | null;
  department?: string | null;
  bio?: string | null;
  avatar?: string | null;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  authorProfile?: {
    id: string;
    slug: string;
    articleCount: number;
  } | null;
}

export default function AdminAuthorsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    email: "",
    designation: "Senior Editorial Correspondent",
    department: "National Desk",
    role: "REPORTER",
    status: "ACTIVE",
    avatar: "",
    bio: "",
    password: "",
  });

  // Action status states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch current logged in session
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      setCurrentUser(authData.user);

      // Fetch authors list
      const authorsRes = await fetch("/api/authors");
      const authorsData = await authorsRes.json();
      if (authorsData.authors) {
        setAuthors(authorsData.authors);
      }

      // If Super Admin, fetch full users list
      if (authData.user?.role === "SUPER_ADMIN") {
        const usersRes = await fetch("/api/admin/users");
        const usersData = await usersRes.json();
        if (usersData.users) {
          setUsers(usersData.users);
        }
      }
    } catch (err) {
      console.error("Failed to load staff data:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // Filtered list
  const displayItems = isSuperAdmin
    ? users.filter((u) => {
        const matchSearch =
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchRole = filterRole === "ALL" || u.role === filterRole;
        const matchStatus = filterStatus === "ALL" || u.status === filterStatus;
        return matchSearch && matchRole && matchStatus;
      })
    : authors.filter((a) => {
        return (
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.designation && a.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      });

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      displayName: "",
      email: "",
      designation: "Senior Editorial Correspondent",
      department: "National Desk",
      role: "REPORTER",
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      bio: "",
      password: "",
    });
    setActionError("");
    setActionSuccess("");
    setGeneratedPassword("");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: any) => {
    setSelectedUser(item);
    setFormData({
      name: item.name || "",
      displayName: item.displayName || item.name || "",
      email: item.email || "",
      designation: item.designation || "Senior Editorial Correspondent",
      department: item.department || "Newsroom Desk",
      role: item.role || "REPORTER",
      status: item.status || "ACTIVE",
      avatar: item.avatar || "",
      bio: item.bio || "",
      password: "",
    });
    setActionError("");
    setActionSuccess("");
    setShowEditModal(true);
  };

  const handleOpenResetPasswordModal = (item: any) => {
    setSelectedUser(item);
    setActionError("");
    setActionSuccess("");
    setGeneratedPassword("");
    setCopiedPassword(false);
    setShowResetPasswordModal(true);
  };

  const handleOpenDeleteModal = (item: any) => {
    setSelectedUser(item);
    setActionError("");
    setActionSuccess("");
    setShowDeleteModal(true);
  };

  // Submit Add Employee
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create employee");
      }

      setGeneratedPassword(data.tempPassword || formData.password);
      setActionSuccess(`Employee account for "${data.user.name}" created successfully!`);
      await fetchInitialData();
    } catch (err: any) {
      setActionError(err.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Edit Employee
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update employee details");
      }

      setActionSuccess(`Staff details for "${data.user.name}" updated successfully.`);
      await fetchInitialData();
      setTimeout(() => setShowEditModal(false), 1200);
    } catch (err: any) {
      setActionError(err.message || "Failed to update employee");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Password Reset
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setGeneratedPassword(data.tempPassword);
      setActionSuccess("Temporary password generated and hashed successfully.");
    } catch (err: any) {
      setActionError(err.message || "Password reset failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Status (Activate / Suspend)
  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to change status");
        return;
      }

      await fetchInitialData();
    } catch (err) {
      alert("Network error updating status");
    }
  };

  // Confirm Delete / Archive
  const handleDeleteEmployee = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to archive employee");
      }

      setActionSuccess(data.message || "Employee successfully archived.");
      await fetchInitialData();
      setTimeout(() => setShowDeleteModal(false), 1200);
    } catch (err: any) {
      setActionError(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 font-sans">
      {/* Header Banner */}
      <div className="bg-black text-white p-6 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-red-600/20 text-red-500 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold block">
                EDITORIAL NEWSROOM MANAGEMENT
              </span>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
                Editorial Authors & Correspondents
              </h1>
            </div>
          </div>
          <p className="text-xs text-neutral-400 font-sans mt-2">
            Manage newsroom journalists, columnists, desk profiles, staff authorizations, and credential security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-red-950"
            >
              <UserPlus className="w-4 h-4" />
              + Add Employee
            </button>
          )}

          <button
            type="button"
            onClick={fetchInitialData}
            className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-800 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Super Admin Privileges Notice */}
      {!isSuperAdmin && (
        <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-center gap-3 text-xs text-amber-300 font-sans">
          <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <span>
            <strong>Read-Only Mode:</strong> Staff creation, credential resetting, role modification, and account status controls are strictly restricted to Super Administrators.
          </span>
        </div>
      )}

      {/* Controls Bar: Search & Filter */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, designation, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-none focus:border-red-600"
          />
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="EDITOR">Editor</option>
              <option value="REPORTER">Reporter</option>
              <option value="READER">Reader</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white font-mono uppercase focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        )}
      </div>

      {/* Staff / Correspondents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayItems.length === 0 ? (
          <div className="col-span-full py-16 text-center text-neutral-400 font-mono text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
            No employees or correspondents found matching your criteria.
          </div>
        ) : (
          displayItems.map((item: any) => {
            const isUserObj = "role" in item;
            const articlesCount = isUserObj
              ? item.authorProfile?.articleCount || 0
              : item._count?.articles || 0;
            const authorSlug = isUserObj ? item.authorProfile?.slug : item.slug;
            const status = item.status || "ACTIVE";

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between transition hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div>
                  {/* Top Row: Avatar + Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        item.avatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      }
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 border border-neutral-200 dark:border-neutral-800 shadow-xs"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif font-bold text-base text-black dark:text-white truncate">
                          {item.name}
                        </h3>
                        {isUserObj && (
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                              item.role === "SUPER_ADMIN"
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : item.role === "EDITOR"
                                ? "bg-red-950 text-red-400 border border-red-800/40"
                                : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                            }`}
                          >
                            {item.role.replace("_", " ")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-mono text-red-600 dark:text-red-400 font-semibold truncate mt-0.5">
                        {item.designation || "Senior Editorial Correspondent"}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-neutral-400" />
                          {item.department || "Newsroom Desk"}
                        </span>
                        {item.email && (
                          <span className="flex items-center gap-1 truncate" title={item.email}>
                            <Mail className="w-3 h-3 text-neutral-400" />
                            {item.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {item.bio && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-3 font-sans leading-relaxed">
                      {item.bio}
                    </p>
                  )}
                </div>

                {/* Footer Meta & Super Admin Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-3 text-neutral-400">
                    <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      {articlesCount} stories
                    </span>
                    {authorSlug && (
                      <Link
                        href={`/author/${authorSlug}`}
                        target="_blank"
                        className="text-neutral-400 hover:text-red-500 transition flex items-center gap-0.5 text-[11px]"
                      >
                        /author/{authorSlug}
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </Link>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        status === "ACTIVE"
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                          : "bg-red-950/40 text-red-400 border border-red-800/40"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Super Admin Control Buttons */}
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg transition"
                        title="Edit Employee"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {isUserObj && (
                        <button
                          type="button"
                          onClick={() => handleOpenResetPasswordModal(item)}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-950/40 text-amber-500 rounded-lg transition"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isUserObj && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`p-1.5 rounded-lg transition ${
                            status === "ACTIVE"
                              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-red-500"
                              : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          }`}
                          title={status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                        >
                          {status === "ACTIVE" ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(item)}
                        className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-950/40 text-red-500 rounded-lg transition"
                        title="Archive / Remove Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================== */}
      {/* ADD EMPLOYEE MODAL (SUPER ADMIN ONLY)                          */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <span className="p-2 bg-red-600/20 text-red-500 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-serif font-black text-xl text-black dark:text-white">
                  Add Editorial Employee
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  Create newsroom correspondent, editor, or super admin account
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 mb-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-400 font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && generatedPassword ? (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    Account Created Successfully
                  </div>
                  <p className="text-xs text-neutral-300 font-sans">
                    Please copy and securely provide these initial login credentials to the employee. The password has been encrypted with bcrypt before database storage.
                  </p>
                  <div className="bg-black p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                        Temporary Credentials
                      </span>
                      <span className="font-mono text-sm text-emerald-400 font-bold select-all">
                        {generatedPassword}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono rounded-lg transition flex items-center gap-1.5"
                    >
                      {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPassword ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold rounded-xl transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Soumya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                      Display / Byline Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Soumya S."
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="journalist@leadjenmedia.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                      Editorial Role Permission *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono uppercase text-black dark:text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="REPORTER">Reporter (Draft & Submit)</option>
                      <option value="EDITOR">Editor (Review & Publish)</option>
                      <option value="SUPER_ADMIN">Super Admin (Full Newsroom Authority)</option>
                      <option value="READER">Reader (Subscriber)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                      Editorial Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Investigative Reporter"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                      Department / Desk
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. National Desk, Business, Tech"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Biography / Background
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief background of journalistic experience and expertise..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Custom Initial Password (Optional — auto-generated if left blank)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank for automatic secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono text-black dark:text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-xs uppercase font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Create Employee
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT EMPLOYEE MODAL                                            */}
      {/* ============================================================== */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <span className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-xl">
                <Edit3 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-serif font-black text-xl text-black dark:text-white">
                  Edit Staff Details
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  Modify correspondent byline, department, role, and profile
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 mb-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-400 font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 mb-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-400 font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Display / Byline Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Editorial Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono uppercase text-black dark:text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="REPORTER">Reporter</option>
                    <option value="EDITOR">Editor</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="READER">Reader</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Department / Desk
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono uppercase text-black dark:text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                  Biography / Journalist Profile
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-xs uppercase font-bold rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* RESET PASSWORD MODAL (SUPER ADMIN ONLY)                        */}
      {/* ============================================================== */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setShowResetPasswordModal(false)}
              className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="p-2 bg-amber-950 text-amber-500 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-serif font-black text-xl text-black dark:text-white">
                  Reset Password
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  {selectedUser.name} ({selectedUser.email})
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 mb-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-400 font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {generatedPassword ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    New Temporary Password Generated
                  </div>
                  <div className="bg-black p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
                    <span className="font-mono text-sm text-emerald-400 font-bold select-all">
                      {generatedPassword}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono rounded-lg transition flex items-center gap-1.5"
                    >
                      {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPassword ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Password has been hashed with bcryptjs and updated in the database. Provide this to the employee.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
                  Are you sure you want to generate a new temporary password for <strong>{selectedUser.name}</strong>? Their previous password will immediately stop working.
                </p>

                <div className="p-3 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 font-mono">
                  <Shield className="w-4 h-4 text-neutral-400 inline mr-1.5 -mt-0.5" />
                  Passcode will be generated securely, hashed with bcrypt, and logged to the security audit feed.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordModal(false)}
                    className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-xs uppercase font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs uppercase font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SAFE ARCHIVE / DELETE MODAL                                    */}
      {/* ============================================================== */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="p-2 bg-red-950 text-red-500 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-serif font-black text-xl text-black dark:text-white">
                  Archive / Remove Staff
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  {selectedUser.name}
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 mb-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-400 font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-400 font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
                  Are you sure you want to deactivate and remove <strong>{selectedUser.name}</strong> from active newsroom operations?
                </p>

                <div className="p-3.5 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-sans text-neutral-400 space-y-1">
                  <div className="font-mono text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-red-500" />
                    Historical Editorial Protection
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    If this employee has published articles, their historical article attribution will remain 100% intact and uncorrupted in the digital archive.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-xs uppercase font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteEmployee}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Archive
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
