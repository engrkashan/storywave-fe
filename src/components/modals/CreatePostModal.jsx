import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { schedulePost } from "../../redux/slices/publish.slice";
import { Send, X, ChevronDown, Youtube, Instagram, Facebook, Music2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const PLATFORM_META = {
  youtube: { label: "YouTube", icon: <Youtube className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-100" },
  facebook: { label: "Facebook", icon: <Facebook className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-100" },
  instagram: { label: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "text-pink-600", bg: "bg-pink-100" },
  tiktok: { label: "TikTok", icon: <Music2 className="w-4 h-4" />, color: "text-gray-800", bg: "bg-gray-100" },
};

export default function CreatePostModal({ channels, workflows, onClose, onCreated, initialWorkflowId = "" }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    workflowId: initialWorkflowId,
    platform: "",
    channelId: "",
    caption: "",
    scheduledAt: "",
    thumbnailUrl: "",
    title: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const platformChannels = channels.filter(
    (ch) => ch.platform?.toLowerCase() === form.platform
  );

  // Auto-fill from selected workflow
  useEffect(() => {
    if (form.workflowId) {
      const wf = workflows.find((w) => w.id === form.workflowId || w.workflow === form.workflowId);
      if (wf) {
        setForm((prev) => ({
          ...prev,
          caption: wf.title || "",
          title: wf.title || "",
          thumbnailUrl: wf.thumbnail || wf.story?.coverArtURL_16_9 || wf.story?.coverArtURL_9_16 || wf.story?.coverArtURL || "",
          mediaUrl: wf.video?.video_16_9 || wf.video?.fileURL || wf.audioURL || "",
        }));
      }
    }
  }, [form.workflowId, workflows]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.workflowId || !form.platform || !form.channelId) {
      return toast.error("Please fill all required fields");
    }
    setSubmitting(true);
    try {
      const channel = channels.find((c) => c.id === form.channelId || c.channel_id === form.channelId);
      const mediaUrl = form.mediaUrl;
      if (!mediaUrl) return toast.error("No video URL found for selected story");

      const payload = {
        ...form,
        channelName: channel?.name || form.channelId,
        mediaUrl,
        scheduledAt: form.scheduledAt || undefined,
      };

      await dispatch(schedulePost(payload)).unwrap();
      toast.success("Post scheduled successfully!");
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to schedule post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Schedule a Post</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Story/Workflow selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Story *</label>
            <div className="relative">
              <select
                value={form.workflowId}
                onChange={(e) => setForm((p) => ({ ...p, workflowId: e.target.value }))}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                required
                disabled={!!initialWorkflowId}
              >
                <option value="">Select a story...</option>
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
              </select>
              {!initialWorkflowId && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
            </div>
          </div>

          {/* Platform selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Platform *</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PLATFORM_META).map(([p, meta]) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, platform: p, channelId: "" }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.platform === p
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                >
                  {meta.icon}
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channel selector */}
          {form.platform && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Channel *</label>
              <div className="relative">
                <select
                  value={form.channelId}
                  onChange={(e) => setForm((p) => ({ ...p, channelId: e.target.value }))}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  required
                >
                  <option value="">Select channel...</option>
                  {platformChannels.map((ch) => (
                    <option key={ch.id || ch.channel_id} value={ch.id || ch.channel_id}>
                      {ch.profileName ? `[${ch.profileName}] ` : ''}{ch.name || ch.username || ch.id}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {platformChannels.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ No channels connected for {PLATFORM_META[form.platform]?.label}. Connect one on Mallary.ai first.</p>
              )}
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Caption</label>
            <textarea
              value={form.caption}
              onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              placeholder="Post caption (auto-filled from SEO metadata)"
            />
          </div>

          {/* Post title (YouTube) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="font-normal text-gray-400">(YouTube)</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Video title for YouTube"
            />
          </div>

          {/* Schedule time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Schedule Time <span className="font-normal text-gray-400">(default: 1hr from now)</span>
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              id="submit-schedule-post-btn"
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-pink-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Schedule Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
