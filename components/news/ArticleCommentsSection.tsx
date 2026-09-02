"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  LogIn,
  UserPlus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Clock,
  Check,
  X,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface ArticleCommentsSectionProps {
  articleId: string;
  articleTitle: string;
}

export function ArticleCommentsSection({
  articleId,
  articleTitle,
}: ArticleCommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<any | null>(null);

  // New comment state
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSession();
    fetchComments();
  }, [articleId]);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setSessionUser(data.user || null);
        if (data.user?.name) setAuthorName(data.user.name);
      }
    } catch {}
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments?articleId=${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          authorName: sessionUser?.name || authorName.trim() || "Reader",
          authorEmail: sessionUser?.email || authorEmail.trim() || undefined,
          content: newContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post comment");
      }

      setNewContent("");
      setMessage({
        text: "Your comment has been submitted and will appear after editorial moderation.",
        type: "success",
      });
      fetchComments();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (res.ok) {
        setEditingCommentId(null);
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete your comment?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="mt-12 pt-10 border-t border-neutral-200 dark:border-neutral-800 space-y-8" id="comments">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black">
            <MessageSquare className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-serif font-black text-xl text-black dark:text-white">
              Reader Discussion ({comments.length})
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Moderated commentary on this investigative report
            </p>
          </div>
        </div>
      </div>

      {/* Post Comment Form — Open to All Readers */}
      <form onSubmit={handleSubmitComment} className="space-y-3 bg-neutral-50 dark:bg-neutral-900/40 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        {!sessionUser ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Your Name / Handle"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 font-sans focus:ring-1 focus:ring-black placeholder:text-neutral-400"
            />
            <input
              type="email"
              placeholder="Your Email (optional, kept private)"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 font-sans focus:ring-1 focus:ring-black placeholder:text-neutral-400"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <div className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px] overflow-hidden">
              {sessionUser.avatar ? (
                <img src={sessionUser.avatar} alt={sessionUser.name} className="w-full h-full object-cover" />
              ) : (
                sessionUser.name?.charAt(0) || "U"
              )}
            </div>
            <span>Commenting as <strong className="text-black dark:text-white">{sessionUser.name}</strong></span>
          </div>
        )}

        <textarea
          required
          rows={3}
          maxLength={2000}
          placeholder="Write your analysis or perspective on this dispatch..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full p-3.5 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 font-sans focus:ring-1 focus:ring-black placeholder:text-neutral-400"
        />

          {message && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-mono ${
                message.type === "success"
                  ? "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-black dark:text-white flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-neutral-800 dark:text-neutral-200 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-neutral-400">
              {newContent.length}/2000 characters • All comments are editorially moderated
            </span>
            <button
              type="submit"
              disabled={submitting || !newContent.trim()}
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Submitting..." : "Post Comment"}</span>
            </button>
          </div>
        </form>

      {/* Comments Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-xs font-mono text-neutral-400">
            Loading reader discussion...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-neutral-400 space-y-1">
            <p className="font-serif font-bold text-neutral-600 dark:text-neutral-300">
              Be the first to join the discussion.
            </p>
            <p>Share thoughtful commentary on this investigative report.</p>
          </div>
        ) : (
          comments.map((c) => {
            const isOwner = sessionUser && sessionUser.id === c.userId;
            const isEditing = editingCommentId === c.id;

            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border transition ${
                  c.status === "PENDING"
                    ? "bg-neutral-50 dark:bg-neutral-900/60 border-neutral-300 dark:border-neutral-700"
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-serif font-bold text-xs overflow-hidden">
                      {c.user?.avatar ? (
                        <img src={c.user.avatar} alt={c.authorName} className="w-full h-full object-cover" />
                      ) : (
                        c.authorName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs text-black dark:text-white">
                          {c.authorName}
                        </span>
                        {c.user?.role === "EDITOR" || c.user?.role === "SUPER_ADMIN" ? (
                          <span className="px-1.5 py-0.2 bg-black dark:bg-white text-white dark:text-black rounded text-[8px] font-mono uppercase font-bold">
                            STAFF
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {formatTimeAgo(c.createdAt)}
                        {c.isEdited && " (edited)"}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Comment Owner */}
                  {isOwner && !isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(c)}
                        className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        title="Edit comment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Pending State Banner */}
                {c.status === "PENDING" && (
                  <div className="my-2 p-2 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-500 rounded-lg flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-neutral-600 dark:text-neutral-300" />
                    <span>Your comment is currently pending editorial review.</span>
                  </div>
                )}

                {/* Content */}
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-xs rounded-xl border-none font-sans"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1 text-xs font-mono text-neutral-400 hover:text-black"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleSaveEdit(c.id)}
                        className="px-3.5 py-1 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold uppercase"
                      >
                        {updating ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-sans text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {c.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
