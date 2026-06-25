import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, fetchStats, fetchChannels, fetchWorkflowsForPublish, syncStatuses, cancelPost, reschedulePost, schedulePost, updateLivePostStatus } from "../../../redux/slices/publish.slice";
import {
  Calendar, List, BarChart2, Send, Clock, CheckCircle2,
  AlertCircle, XCircle, Loader2, RefreshCw, Plus, Trash2,
  Youtube, Instagram, Facebook, Music2, ChevronDown, X,
  CalendarClock, RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import CreatePostModal from "../../../components/modals/CreatePostModal";

const PLATFORM_META = {
  youtube: { label: "YouTube", icon: <Youtube className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-100" },
  facebook: { label: "Facebook", icon: <Facebook className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-100" },
  instagram: { label: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "text-pink-600", bg: "bg-pink-100" },
  tiktok: { label: "TikTok", icon: <Music2 className="w-4 h-4" />, color: "text-gray-800", bg: "bg-gray-100" },
};

const STATUS_META = {
  PENDING: { label: "Pending", icon: <Clock className="w-3.5 h-3.5" />, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  SCHEDULED: { label: "Scheduled", icon: <CalendarClock className="w-3.5 h-3.5" />, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  PUBLISHED: { label: "Published", icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  FAILED: { label: "Failed", icon: <AlertCircle className="w-3.5 h-3.5" />, cls: "bg-red-50 text-red-700 border-red-200" },
  CANCELLED: { label: "Cancelled", icon: <XCircle className="w-3.5 h-3.5" />, cls: "bg-gray-50 text-gray-500 border-gray-200" },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.cls}`}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

function PlatformBadge({ platform }) {
  const meta = PLATFORM_META[platform?.toLowerCase()] || {};
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.bg || "bg-gray-100"} ${meta.color || "text-gray-700"}`}>
      {meta.icon}
      {meta.label || platform}
    </span>
  );
}

function PostRow({ post, onCancel, onReschedule }) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newTime, setNewTime] = useState("");

  const handleReschedule = async () => {
    if (!newTime) return toast.error("Pick a new time");
    setRescheduling(true);
    try {
      await onReschedule(post.id, new Date(newTime).toISOString());
      setNewTime("");
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="py-3 px-4">
        <PlatformBadge platform={post.platform} />
      </td>
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{post.channelName || post.channelId}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs text-gray-500 truncate max-w-[200px]">{post.caption?.substring(0, 60)}...</p>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={post.status} />
      </td>
      <td className="py-3 px-4 text-xs text-gray-500">
        {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "—"}
      </td>
      <td className="py-3 px-4">
        {post.workflow && (
          <p className="text-xs text-indigo-600 truncate max-w-[120px]">{post.workflow.title}</p>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {(post.status === "SCHEDULED" || post.status === "PENDING") && (
            <>
              {/* Reschedule inline */}
              <div className="flex items-center gap-1">
                <input
                  type="datetime-local"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  onClick={handleReschedule}
                  disabled={rescheduling || !newTime}
                  className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors disabled:opacity-50"
                  title="Reschedule"
                >
                  {rescheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={() => onCancel(post.id)}
                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="Cancel post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// Local modal removed in favor of shared component

const TABS = [
  { id: "posts", label: "Posts & Schedule", icon: <List className="w-4 h-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart2 className="w-4 h-4" /> },
];

export default function Publish() {
  const dispatch = useDispatch();
  const { posts, stats, channels, workflows, postsStatus, syncStatus } = useSelector(state => state.publish);
  const loading = postsStatus === "loading" || postsStatus === "idle";
  const syncing = syncStatus === "loading";

  const [activeTab, setActiveTab] = useState("posts");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");

  const [autoDelay, setAutoDelay] = useState(() => {
    return parseInt(localStorage.getItem("sw_auto_publish_delay_total_minutes") || "60", 10);
  });

  const handleDelayChange = (type, val) => {
    let currentTotal = autoDelay;
    const hours = Math.floor(currentTotal / 60);
    const mins = currentTotal % 60;
    
    let num = Math.max(0, parseInt(val || "0", 10));
    let newTotal = currentTotal;

    if (type === "hours") {
      newTotal = (num * 60) + mins;
    } else {
      newTotal = (hours * 60) + num;
    }

    setAutoDelay(newTotal);
    localStorage.setItem("sw_auto_publish_delay_total_minutes", newTotal.toString());
  };

  const autoHours = Math.floor(autoDelay / 60);
  const autoMins = autoDelay % 60;

  const fetchAll = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchPosts({ limit: 50, status: filterStatus || undefined, platform: filterPlatform || undefined })),
        dispatch(fetchStats()),
        dispatch(fetchChannels()),
        dispatch(fetchWorkflowsForPublish()),
      ]);
    } catch (err) {
      toast.error("Failed to load publish data");
    }
  }, [dispatch, filterStatus, filterPlatform]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Live SSE connection for post statuses
  useEffect(() => {
    const sseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/publish/live-status`;
    const sse = new EventSource(sseUrl);
    
    sse.onmessage = (event) => {
      if (event.data === "connected") return;
    };
    
    sse.addEventListener("SOCIAL_POST_UPDATE", (e) => {
      try {
        const payload = JSON.parse(e.data);
        dispatch(updateLivePostStatus(payload));
      } catch (err) {
        console.error("SSE parse error", err);
      }
    });

    return () => {
      sse.close();
    };
  }, [dispatch]);

  const handleCancel = async (postId) => {
    if (!confirm("Cancel this scheduled post?")) return;
    try {
      await dispatch(cancelPost(postId)).unwrap();
      toast.success("Post cancelled");
      fetchAll();
    } catch (err) {
      toast.error("Failed to cancel post");
    }
  };

  const handleReschedule = async (postId, scheduledAt) => {
    try {
      await dispatch(reschedulePost({ postId, scheduledAt })).unwrap();
      toast.success("Post rescheduled!");
      fetchAll();
    } catch (err) {
      toast.error("Failed to reschedule post");
    }
  };

  const handleSync = async () => {
    try {
      await dispatch(syncStatuses()).unwrap();
      toast.success("Post statuses synced!");
      fetchAll();
    } catch (err) {
      toast.error("Failed to sync");
    }
  };

  const statusCounts = {
    SCHEDULED: posts.filter((p) => p.status === "SCHEDULED").length,
    PUBLISHED: posts.filter((p) => p.status === "PUBLISHED").length,
    FAILED: posts.filter((p) => p.status === "FAILED").length,
  };

  return (
    <div className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-br from-amber-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </span>
            Publish to Social
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Schedule and manage social posts via Mallary.ai
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0 justify-end">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mr-1">
            <span className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 border-r border-gray-200" title="Default delay for auto-published stories">
              Auto-Post Delay
            </span>
            <div className="flex items-center bg-white">
              <input 
                type="number" min="0" 
                value={autoHours} 
                onChange={(e) => handleDelayChange("hours", e.target.value)} 
                className="w-12 px-2 py-2 text-sm font-medium text-center text-gray-700 focus:outline-none focus:bg-amber-50" 
                title="Hours"
              />
              <span className="text-gray-400 font-bold">:</span>
              <input 
                type="number" min="0" max="59" 
                value={autoMins.toString().padStart(2, "0")} 
                onChange={(e) => handleDelayChange("mins", e.target.value)} 
                className="w-12 px-2 py-2 text-sm font-medium text-center text-gray-700 focus:outline-none focus:bg-amber-50" 
                title="Minutes"
              />
            </div>
          </div>
          <button
            id="sync-btn"
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            Sync
          </button>
          <button
            id="create-post-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-amber-400 to-pink-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Schedule Post
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Total Posts</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-blue-600">{statusCounts.SCHEDULED}</p>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Scheduled</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-emerald-600">{statusCounts.PUBLISHED}</p>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Published</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-red-500">{statusCounts.FAILED}</p>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Failed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Posts */}
      {activeTab === "posts" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-50 flex flex-wrap gap-3 items-center">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white pr-7"
              >
                <option value="">All Statuses</option>
                {Object.keys(STATUS_META).map((s) => (
                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="appearance-none border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white pr-7"
              >
                <option value="">All Platforms</option>
                {Object.entries(PLATFORM_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {(filterStatus || filterPlatform) && (
              <button
                onClick={() => { setFilterStatus(""); setFilterPlatform(""); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            <p className="ml-auto text-xs text-gray-400">{posts.length} posts</p>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">No posts yet</p>
                <p className="text-sm text-gray-400 mt-1">Schedule your first story post to get started</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-pink-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Schedule First Post
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Channel</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Caption</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Scheduled</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Story</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      onCancel={handleCancel}
                      onReschedule={handleReschedule}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* By Platform */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              Posts by Platform
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(PLATFORM_META).map(([platform, meta]) => {
                const count = stats?.byPlatform?.[platform] || 0;
                return (
                  <div key={platform} className={`${meta.bg} rounded-xl p-4 text-center`}>
                    <div className={`${meta.color} flex justify-center mb-2`}>{meta.icon && <span className="scale-150">{meta.icon}</span>}</div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{meta.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">Posts by Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Object.entries(STATUS_META).map(([status, meta]) => {
                const count = stats?.byStatus?.[status] || 0;
                return (
                  <div key={status} className={`rounded-xl p-4 text-center border ${meta.cls}`}>
                    <div className="flex justify-center mb-2 scale-125">{meta.icon}</div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs font-medium mt-0.5">{meta.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent posts */}
          {stats?.recent?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {stats.recent.map((post) => (
                  <div key={post.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <PlatformBadge platform={post.platform} />
                    <p className="text-sm text-gray-600 flex-1 truncate">{post.channelName || post.channelId}</p>
                    <StatusBadge status={post.status} />
                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          channels={channels}
          workflows={workflows}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchAll}
        />
      )}
    </div>
  );
}
