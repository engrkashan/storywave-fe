import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChannels, fetchHealth, syncStatuses } from "../../../redux/slices/publish.slice";
import {
  Youtube, Instagram, Facebook, Music2, CheckCircle2,
  AlertCircle, Loader2, RefreshCw, ExternalLink, Zap,
  Settings, Key, ToggleLeft, ToggleRight, Radio,
} from "lucide-react";
import toast from "react-hot-toast";

const PLATFORM_META = {
  youtube: {
    label: "YouTube",
    icon: <Youtube className="w-7 h-7" />,
    color: "#FF0000",
    gradient: "from-red-500 to-red-700",
    bg: "bg-red-50",
    ring: "ring-red-200",
    desc: "Upload & schedule videos to your YouTube channel",
  },
  facebook: {
    label: "Facebook",
    icon: <Facebook className="w-7 h-7" />,
    color: "#1877F2",
    gradient: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
    desc: "Share story videos on Facebook pages & reels",
  },
  instagram: {
    label: "Instagram",
    icon: <Instagram className="w-7 h-7" />,
    color: "#E1306C",
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    bg: "bg-pink-50",
    ring: "ring-pink-200",
    desc: "Post reels and stories to your Instagram accounts",
  },
  tiktok: {
    label: "TikTok",
    icon: <Music2 className="w-7 h-7" />,
    color: "#010101",
    gradient: "from-gray-800 to-gray-950",
    bg: "bg-gray-50",
    ring: "ring-gray-200",
    desc: "Auto-publish short-form video content to TikTok",
  },
};

const SUPPORTED_PLATFORMS = ["youtube", "facebook", "instagram", "tiktok"];

function StatusBadge({ connected, count = 0 }) {
  if (connected && count > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        {count} channel{count !== 1 ? "s" : ""} connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
      <AlertCircle className="w-3 h-3" />
      Not connected
    </span>
  );
}

function ChannelCard({ channel, platform }) {
  const meta = PLATFORM_META[platform] || {};
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow overflow-hidden`}>
        {channel.avatar ? (
          <img src={channel.avatar} alt={channel.username} className="w-full h-full object-cover" />
        ) : meta.icon ? (
          <span className="scale-75">{meta.icon}</span>
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{channel.name || channel.username || `Channel ${channel.id}`}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {channel.profileName && (
            <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
              {channel.profileName}
            </span>
          )}
          <p className="text-xs text-gray-500 truncate">@{channel.username || channel.id || channel.channel_id}</p>
        </div>
      </div>
      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
    </div>
  );
}

function PlatformCard({ platform, channels = [], autoPublishEnabled, onToggleAutoPublish }) {
  const meta = PLATFORM_META[platform];
  const [expanded, setExpanded] = useState(false);
  const count = channels.length;
  const connected = count > 0;

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${connected ? "border-emerald-200 shadow-md" : "border-gray-100 shadow-sm"
      }`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow-md`}>
            {meta.icon}
          </div>
          <StatusBadge connected={connected} count={count} />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">{meta.label}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{meta.desc}</p>
      </div>

      {/* Auto-publish toggle */}
      {connected && (
        <div className="px-5 pb-4 border-t border-gray-50 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Auto-post stories</p>
              <p className="text-xs text-gray-400 mt-0.5">Schedule 1hr after generation</p>
            </div>
            <button
              id={`toggle-auto-publish-${platform}`}
              onClick={() => onToggleAutoPublish(platform)}
              className="focus:outline-none"
            >
              {autoPublishEnabled ? (
                <ToggleRight className="w-9 h-9 text-emerald-500 transition-colors" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-gray-300 transition-colors" />
              )}
            </button>
          </div>

          {/* Channels list toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            {expanded ? "Hide" : "Show"} {count} channel{count !== 1 ? "s" : ""}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {channels.map((ch, i) => (
                <ChannelCard key={i} channel={ch} platform={platform} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Not connected CTA */}
      {!connected && (
        <div className="px-5 pb-5">
          <a
            href="https://mallary.ai/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            id={`connect-${platform}`}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${meta.gradient} hover:opacity-90 transition-opacity shadow-md`}
          >
            <ExternalLink className="w-4 h-4" />
            Connect on Mallary.ai
          </a>
        </div>
      )}
    </div>
  );
}

export default function Integrations() {
  const dispatch = useDispatch();
  const { channels, mallaryConnected: mallaryStatus, channelsStatus, syncStatus } = useSelector((state) => state.publish);

  const loading = channelsStatus === "loading" || channelsStatus === "idle";
  const syncing = syncStatus === "loading";

  const [autoPublish, setAutoPublish] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sw_auto_publish") || "{}");
    } catch { return {}; }
  });

  const fetchAll = useCallback(async () => {
    await Promise.all([
      dispatch(fetchChannels()),
      dispatch(fetchHealth())
    ]);
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleToggleAutoPublish = (platform) => {
    setAutoPublish((prev) => {
      const updated = { ...prev, [platform]: !prev[platform] };
      localStorage.setItem("sw_auto_publish", JSON.stringify(updated));
      toast.success(`Auto-publish ${updated[platform] ? "enabled" : "disabled"} for ${PLATFORM_META[platform]?.label}`);
      return updated;
    });
  };

  const handleSync = async () => {
    try {
      await dispatch(syncStatuses()).unwrap();
      toast.success("Post statuses synced from Mallary!");
      fetchAll();
    } catch (err) {
      toast.error("Sync failed");
    }
  };

  // Group channels by platform
  const channelsByPlatform = SUPPORTED_PLATFORMS.reduce((acc, p) => {
    acc[p] = channels.filter((ch) => ch.platform?.toLowerCase() === p);
    return acc;
  }, {});

  const totalConnected = channels.length;

  return (
    <div className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-br from-amber-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </span>
            Publish & Integrations
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage social channels via Mallary.ai — auto-post stories on completion
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mallary API Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${mallaryStatus === true
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : mallaryStatus === false
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-gray-50 text-gray-500 border-gray-200"
            }`}>
            <span className={`w-2 h-2 rounded-full ${mallaryStatus === true ? "bg-emerald-400 animate-pulse" :
              mallaryStatus === false ? "bg-red-400" : "bg-gray-400"
              }`} />
            {mallaryStatus === true ? "Mallary Connected" : mallaryStatus === false ? "API Disconnected" : "Checking..."}
          </div>

          <button
            id="refresh-channels-btn"
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalConnected}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Total Channels</p>
          </div>
          {SUPPORTED_PLATFORMS.map((p) => (
            <div key={p} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{channelsByPlatform[p].length}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{PLATFORM_META[p].label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mallary API Key Info */}
      {mallaryStatus !== true && (
        <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Mallary API Key</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Set <code className="bg-white px-1 py-0.5 rounded font-mono text-indigo-600">MALLARY_API_KEY</code> in your <code className="bg-white px-1 py-0.5 rounded font-mono">storywave-be/.env</code> file. Channels will load automatically from your Mallary Pro account.
            </p>
          </div>
          <a
            href="https://mallary.ai/dashboard/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            <Settings className="w-4 h-4" />
            Mallary Settings
          </a>
        </div>
      )}

      {/* Auto-publish global note */}
      <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
        <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Auto-publish</span> schedules new stories 1 hour after completion. You can always change the time from the <span className="font-semibold">Publish</span> page.
        </p>
      </div>

      {/* Platform Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          <p className="text-gray-500 text-sm">Loading your Mallary channels...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SUPPORTED_PLATFORMS.map((platform) => (
            <PlatformCard
              key={platform}
              platform={platform}
              channels={channelsByPlatform[platform]}
              autoPublishEnabled={!!autoPublish[platform]}
              onToggleAutoPublish={handleToggleAutoPublish}
            />
          ))}
        </div>
      )}

      {/* Sync Button */}
      <div className="mt-8 flex justify-center">
        <button
          id="sync-statuses-btn"
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-pink-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Sync Post Statuses from Mallary
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Channels are connected via <a href="https://mallary.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">mallary.ai</a> — add/remove channels from your Mallary dashboard.
      </p>
    </div>
  );
}
