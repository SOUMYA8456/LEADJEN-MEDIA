"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Shield,
  UserPlus,
  Edit3,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Briefcase,
  Mail,
  FileText,
  Building,
  Calendar,
  X,
  Activity,
  ShieldAlert,
  Laptop,
  Globe,
  Filter,
} from "lucide-react";

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
  updatedAt: string;
  authorProfile?: {
    id: string;
    slug: string;
    articleCount: number;
  } | null;
}

interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityTitle?: string | null;
  userName?: string | null;
  userRole?: string | null;
  ip: string;
  userAgent: string;
  reason?: string | null;
  email: string;
  details?: any;
}

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"STAFF" | "SECURITY_AUDIT">("STAFF");

  // Users Data
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    superAdmins: 0,
    editors: 0,
    reporters: 0,
    readers: 0,
    active: 0,
    suspended: 0,
  });

  // Security Audit Data
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState("ALL");
  const [auditStats, setAuditStats] = useState({ total: 0, totalSuccess: 0, totalFailed: 0 });
  const [auditLoading, setAuditLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    email: "",
    designation: "Editorial Correspondent",
    department: "Newsroom Desk",
    role: "REPORTER",
    status: "ACTIVE",
    avatar: "",
    bio: "",
    password: "",
  });

  // Action status
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    fetchUsersData();
  }, []);

  useEffect(() => {
    if (activeTab === "SECURITY_AUDIT") {
      fetchSecurityAudit(auditFilter);
    }
  }, [activeTab, auditFilter]);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      setCurrentUser(authData.user);

      if (authData.user?.role !== "SUPER_ADMIN") {
        setLoading(false);
        return;
      }

      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      if (usersData.users) {
        setUsers(usersData.users);
        setStats(usersData.stats || {});
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityAudit = async (filter: string) => {
    try {
      setAuditLoading(true);
      const res = await fetch(`/api/admin/security/audit?filter=${filter}&limit=50`);
      const data = await res.json();
      if (data.logs) {
        setAuditLogs(data.logs);
        setAuditStats(data.stats || { total: 0, totalSuccess: 0, totalFailed: 0 });
      }
    } catch (err) {
      console.error("Failed to load security audit:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus = filterStatus === "ALL" || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      displayName: "",
      email: "",
      designation: "Staff Reporter",
      department: "Newsroom Desk",
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

  const handleOpenEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      displayName: user.displayName || user.name || "",
      email: user.email || "",
      designation: user.designation || "Staff Member",
      department: user.department || "Newsroom Desk",
      role: user.role,
      status: user.status,
      avatar: user.avatar || "",
      bio: user.bio || "",
      password: "",
    });
    setActionError("");
    setActionSuccess("");
    setShowEditModal(true);
  };

  const handleOpenResetPasswordModal = (user: UserItem) => {
    setSelectedUser(user);
    setActionError("");
    setActionSuccess("");
    setGeneratedPassword("");
    setCopiedPassword(false);
    setShowResetPasswordModal(true);
  };

  const handleOpenDeleteModal = (user: UserItem) => {
    setSelectedUser(user);
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
        throw new Error(data.error || "Failed to create user");
      }

      setGeneratedPassword(data.tempPassword || formData.password);
      setActionSuccess(`Staff account for "${data.user.name}" created successfully!`);
      await fetchUsersData();
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
        throw new Error(data.error || "Failed to update staff details");
      }

      setActionSuccess(`Staff record for "${data.user.name}" updated successfully.`);
      await fetchUsersData();
      setTimeout(() => setShowEditModal(false), 1200);
    } catch (err: any) {
      setActionError(err.message || "Failed to update user");
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
      setActionSuccess("Temporary password generated and hashed with bcrypt.");
    } catch (err: any) {
      setActionError(err.message || "Password reset failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Status
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

      await fetchUsersData();
    } catch (err) {
      alert("Network error updating status");
    }
  };

  // Safe Archive / Delete
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
        throw new Error(data.error || "Failed to remove staff account");
      }

      setActionSuccess(data.message || "Account archived successfully.");
      await fetchUsersData();
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

  if (!loading && !isSuperAdmin) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="p-8 bg-red-950/20 border border-red-900/40 rounded-2xl max-w-md mx-auto space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-serif font-bold text-white">
            Access Restricted (Super Admin Only)
          </h2>
          <p className="text-xs text-neutral-400 font-sans">
            Editorial Role Access Control (RBAC), employee management, credential resets, and login audits require Super Admin authority.
          </p>
          <Link
            href="/admin/news-desk"
            className="inline-block px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono uppercase rounded-xl transition"
          >
            Return to News Desk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 font-sans">
      {/* Header Banner */}
      <div className="bg-black text-white p-6 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-red-600/20 text-red-500 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold block">
                SUPER ADMIN PRIVILEGE
              </span>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
                Editorial Role Access Control (RBAC)
              </h1>
            </div>
          </div>
          <p className="text-xs text-neutral-400 font-sans mt-2">
            Manage newsroom staff authorizations, journalists, credential security, and real-time login activity audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-red-950"
          >
            <UserPlus className="w-4 h-4" />
            + Add Employee
          </button>

          <button
            type="button"
            onClick={() => {
              fetchUsersData();
              if (activeTab === "SECURITY_AUDIT") fetchSecurityAudit(auditFilter);
            }}
            className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-800 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading || auditLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">Total Staff</span>
          <span className="text-lg font-mono font-bold text-black dark:text-white">{stats.total || 0}</span>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-red-500 block">Super Admins</span>
          <span className="text-lg font-mono font-bold text-red-500">{stats.superAdmins || 0}</span>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">Editors</span>
          <span className="text-lg font-mono font-bold text-black dark:text-white">{stats.editors || 0}</span>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">Reporters</span>
          <span className="text-lg font-mono font-bold text-black dark:text-white">{stats.reporters || 0}</span>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">Readers</span>
          <span className="text-lg font-mono font-bold text-neutral-400">{stats.readers || 0}</span>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-emerald-500 block">Active</span>
          <span className="text-lg font-mono font-bold text-emerald-500">{stats.active || 0}</span>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-amber-500 block">Suspended</span>
          <span className="text-lg font-mono font-bold text-amber-500">{stats.suspended || 0}</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("STAFF")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 ${
            activeTab === "STAFF"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
              : "text-neutral-500 hover:text-black dark:hover:text-white bg-transparent"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Staff & User Management ({filteredUsers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SECURITY_AUDIT")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-2 ${
            activeTab === "SECURITY_AUDIT"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
              : "text-neutral-500 hover:text-black dark:hover:text-white bg-transparent"
          }`}
        >
          <Activity className="w-4 h-4 text-red-500" />
          Login Activity & Security Audit
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: STAFF & USER MANAGEMENT TABLE                           */}
      {/* ============================================================== */}
      {activeTab === "STAFF" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, email, department, or designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-sans text-black dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>

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
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">Employee / Journalist</th>
                    <th className="py-3 px-4">Role & Authority</th>
                    <th className="py-3 px-4">Desk / Department</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400 font-mono italic">
                        No employees found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const articleCount = u.authorProfile?.articleCount || 0;
                      return (
                        <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/60 transition">
                          {/* User Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  u.avatar ||
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                                }
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 border border-neutral-200 dark:border-neutral-800"
                              />
                              <div>
                                <div className="font-bold text-black dark:text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.displayName && u.displayName !== u.name && (
                                    <span className="text-[10px] text-neutral-400 font-normal">
                                      ({u.displayName})
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-red-600 dark:text-red-400 font-mono block truncate max-w-[200px]">
                                  {u.designation || "Staff Member"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider inline-block ${
                                u.role === "SUPER_ADMIN"
                                  ? "bg-black text-white dark:bg-white dark:text-black"
                                  : u.role === "EDITOR"
                                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black"
                                  : u.role === "REPORTER"
                                  ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-900"
                              }`}
                            >
                              {u.role.replace("_", " ")}
                            </span>
                          </td>

                          {/* Department & Stories */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                            <div>{u.department || "Newsroom Desk"}</div>
                            {articleCount > 0 && (
                              <span className="text-[10px] text-neutral-400 block mt-0.5">
                                {articleCount} published articles
                              </span>
                            )}
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-300">
                            {u.email}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                u.status === "ACTIVE"
                                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                                  : "bg-red-950/40 text-red-400 border border-red-800/40"
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(u)}
                                className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg transition"
                                title="Edit Staff Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenResetPasswordModal(u)}
                                className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-950/40 text-amber-500 rounded-lg transition"
                                title="Reset Password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u)}
                                className={`p-1.5 rounded-lg transition ${
                                  u.status === "ACTIVE"
                                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-red-500"
                                    : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                }`}
                                title={u.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                              >
                                {u.status === "ACTIVE" ? (
                                  <XCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(u)}
                                className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-950/40 text-red-500 rounded-lg transition"
                                title="Archive / Remove Staff"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: LOGIN ACTIVITY & SECURITY AUDIT FEED                    */}
      {/* ============================================================== */}
      {activeTab === "SECURITY_AUDIT" && (
        <div className="space-y-4">
          {/* Security Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">Total Auth Events</span>
              <span className="text-xl font-mono font-bold text-black dark:text-white">{auditStats.total}</span>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-emerald-500 block">Successful Logins</span>
              <span className="text-xl font-mono font-bold text-emerald-500">{auditStats.totalSuccess}</span>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-red-500 block">Failed / Blocked Attempts</span>
              <span className="text-xl font-mono font-bold text-red-500">{auditStats.totalFailed}</span>
            </div>
          </div>

          {/* Audit Filters Bar */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-mono font-bold uppercase text-neutral-500">Filter Feed:</span>
              {["ALL", "SUCCESS", "FAILED", "ADMIN_CHANGES"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setAuditFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                    auditFilter === f
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fetchSecurityAudit(auditFilter)}
              className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl transition"
              title="Refresh Audit"
            >
              <RefreshCw className={`w-4 h-4 ${auditLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">Timestamp (IST)</th>
                    <th className="py-3 px-4">Event / Action</th>
                    <th className="py-3 px-4">Identity / Target</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Device / Client</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400 italic">
                        No security audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isSuccess = log.action === "LOGIN_SUCCESS";
                      const isFailed = log.action === "LOGIN_FAILED";
                      const isPasswordReset = log.action === "PASSWORD_RESET";

                      return (
                        <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/60 transition">
                          {/* Timestamp */}
                          <td className="py-3 px-4 whitespace-nowrap text-[11px] text-neutral-500">
                            {new Date(log.timestamp).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>

                          {/* Event / Action */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                isSuccess
                                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                                  : isFailed
                                  ? "bg-red-950/40 text-red-400 border border-red-800/40"
                                  : isPasswordReset
                                  ? "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                                  : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                              }`}
                            >
                              {log.action.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* User Identity */}
                          <td className="py-3 px-4 whitespace-nowrap font-sans font-medium text-black dark:text-white">
                            <div>{log.userName || log.entityTitle || "—"}</div>
                            {log.userRole && (
                              <span className="text-[10px] text-neutral-500 font-mono uppercase">
                                {log.userRole}
                              </span>
                            )}
                          </td>

                          {/* IP */}
                          <td className="py-3 px-4 whitespace-nowrap text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-neutral-400" />
                              {log.ip}
                            </div>
                          </td>

                          {/* Device / Client */}
                          <td className="py-3 px-4 max-w-[200px] truncate text-[11px] text-neutral-500 font-mono" title={log.userAgent}>
                            <div className="flex items-center gap-1 truncate">
                              <Laptop className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                              <span className="truncate">{log.userAgent}</span>
                            </div>
                          </td>

                          {/* Reason / Notes */}
                          <td className="py-3 px-4 text-[11px] font-sans text-neutral-600 dark:text-neutral-400">
                            {log.reason ? (
                              <span className="text-red-400 font-mono">{log.reason}</span>
                            ) : log.action === "PASSWORD_RESET" ? (
                              <span className="text-amber-400 font-mono">Bcrypt pass reset</span>
                            ) : isSuccess ? (
                              <span className="text-emerald-400 font-mono">Session authenticated</span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD EMPLOYEE                                            */}
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
                  Add Newsroom Employee
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  Create correspondent, editor, or super admin credentials
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
                    Initial login credentials generated. The password is encrypted with bcrypt and stored safely in the database.
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
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="staff@leadjenmedia.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                      Role & Authority *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono uppercase text-black dark:text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="REPORTER">Reporter (Draft & Submit)</option>
                      <option value="EDITOR">Editor (Review & Publish)</option>
                      <option value="SUPER_ADMIN">Super Admin (Newsroom Authority)</option>
                      <option value="READER">Reader (Subscriber)</option>
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
                      placeholder="e.g. National Desk, Technology"
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
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-red-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">
                    Custom Initial Password (Optional — auto-generated if blank)
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
      {/* MODAL: EDIT EMPLOYEE                                           */}
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
                  Modify role authority, department, byline, and status
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
                    Role Authority *
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
      {/* MODAL: RESET PASSWORD                                          */}
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
                  Are you sure you want to generate a new temporary password for <strong>{selectedUser.name}</strong>? Their existing password will be revoked immediately.
                </p>

                <div className="p-3 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 font-mono">
                  <Shield className="w-4 h-4 text-neutral-400 inline mr-1.5 -mt-0.5" />
                  Password will be hashed using bcrypt (10 rounds) before DB write.
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
      {/* MODAL: SAFE ARCHIVE / DELETE                                   */}
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

            {actionSuccess ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-400 font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
                  Are you sure you want to deactivate and remove <strong>{selectedUser.name}</strong>?
                </p>

                <div className="p-3.5 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-sans text-neutral-400 space-y-1">
                  <div className="font-mono text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-red-500" />
                    Historical Editorial Protection
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    If this employee has created articles or has published bylines, their historical records will remain intact in the newsroom database.
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
