import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { schedulePost } from "../../redux/slices/publish.slice";
import {
  Send,
  X,
  ChevronDown,
  Youtube,
  Instagram,
  Facebook,
  Music2,
  Loader2,
  Plus,
  Trash2,
  CalendarClock,
} from "lucide-react";
import toast from "react-hot-toast";

const PLATFORM_META = {
  youtube: {
    id: "youtube",
    label: "YouTube",
    icon: <Youtube className="w-4 h-4" />,
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-200",
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    icon: <Facebook className="w-4 h-4" />,
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200",
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    icon: <Instagram className="w-4 h-4" />,
    color: "text-pink-600",
    bg: "bg-pink-100",
    border: "border-pink-200",
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    icon: <Music2 className="w-4 h-4" />,
    color: "text-gray-800",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
};

export default function CreatePostModal({
  channels,
  workflows,
  onClose,
  onCreated,
  initialWorkflowId = "",
}) {
  const dispatch = useDispatch();

  const [globalConfig, setGlobalConfig] = useState({
    workflowId: initialWorkflowId,
    scheduledAt: "",
  });

  const [postConfigs, setPostConfigs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Derived state for the currently selected workflow
  const selectedWorkflow = workflows.find(
    (w) =>
      w.id === globalConfig.workflowId ||
      w.workflow === globalConfig.workflowId,
  );

  const getAvailableFormats = (workflow) => {
    if (!workflow) return [];
    const formats = [];
    if (workflow.video?.video_16_9)
      formats.push({
        id: "video_16:9",
        label: "Video",
        ratio: "16:9",
        type: "video",
      });
    if (workflow.story?.coverArtURL_16_9)
      formats.push({
        id: "image_16:9",
        label: "Cover Art",
        ratio: "16:9",
        type: "image",
      });
    if (workflow.video?.video_9_16)
      formats.push({
        id: "video_9:16",
        label: "Video",
        ratio: "9:16",
        type: "video",
      });

    if (workflow.story?.coverArtURL_9_16)
      formats.push({
        id: "image_9:16",
        label: "Cover Art",
        ratio: "9:16",
        type: "image",
      });

    return formats;
  };

  const availableFormats = getAvailableFormats(selectedWorkflow);

  const handleAddPlatform = (platformId) => {
    let defaultVideoFormat = "";
    let defaultImageFormat = "";
    if (availableFormats.length > 0) {
      const preferredRatio = platformId === "youtube" ? "16:9" : "9:16";
      const vMatch =
        availableFormats.find(
          (f) => f.type === "video" && f.ratio === preferredRatio,
        ) || availableFormats.find((f) => f.type === "video");
      const iMatch =
        availableFormats.find(
          (f) => f.type === "image" && f.ratio === preferredRatio,
        ) || availableFormats.find((f) => f.type === "image");

      if (vMatch) defaultVideoFormat = vMatch.id;
      if (iMatch) defaultImageFormat = iMatch.id;
    }

    const newConfig = {
      id: crypto.randomUUID(),
      platform: platformId,
      channelId: "",
      caption: selectedWorkflow?.title || "",
      title: selectedWorkflow?.title || "",
      tagsStr: "",
      chapters: "",
      altText: "",
      coverTitle: "",
      searchKeywords: "",
      linkPreviewText: "",
      videoFormat: defaultVideoFormat,
      imageFormat: defaultImageFormat,
    };
    setPostConfigs((prev) => [...prev, newConfig]);
  };

  const handleRemoveConfig = (id) => {
    setPostConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  const updateConfig = (id, field, value) => {
    setPostConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!globalConfig.workflowId) return toast.error("Please select a story");
    if (postConfigs.length === 0)
      return toast.error("Please add at least one platform");

    // Validate blocks
    for (const config of postConfigs) {
      if (!config.channelId) {
        return toast.error(
          `Please select a channel for ${PLATFORM_META[config.platform].label}`,
        );
      }
    }

    setSubmitting(true);
    try {
      const fallbackThumbnail = selectedWorkflow?.thumbnail || "";

      const platformsConfig = postConfigs.map((config) => {
        const channel = channels.find(
          (c) => c.id === config.channelId || c.channel_id === config.channelId,
        );

        let finalCaption = config.caption;
        if (config.platform === "youtube" && config.chapters) {
          finalCaption += `\n\nChapters:\n${config.chapters}`;
        }
        if (config.platform === "instagram" && config.coverTitle) {
          finalCaption = `[${config.coverTitle}]\n\n${finalCaption}`;
        }

        let tUrl = fallbackThumbnail;
        let mUrl =
          selectedWorkflow?.video?.fileURL || selectedWorkflow?.audioURL || "";

        if (config.imageFormat) {
          const ratio = config.imageFormat.split("_")[1];
          if (ratio === "16:9")
            tUrl =
              selectedWorkflow?.story?.coverArtURL_16_9 || fallbackThumbnail;
          else if (ratio === "9:16")
            tUrl =
              selectedWorkflow?.story?.coverArtURL_9_16 || fallbackThumbnail;
          else if (ratio === "1:1")
            tUrl =
              selectedWorkflow?.story?.coverArtURL_1_1 || fallbackThumbnail;
          else tUrl = selectedWorkflow?.story?.coverArtURL || fallbackThumbnail;
        }

        if (config.videoFormat) {
          const ratio = config.videoFormat.split("_")[1];
          if (ratio === "16:9")
            mUrl = selectedWorkflow?.video?.video_16_9 || mUrl;
          else if (ratio === "9:16")
            mUrl = selectedWorkflow?.video?.video_9_16 || mUrl;
          else if (ratio === "1:1")
            mUrl = selectedWorkflow?.video?.video_1_1 || mUrl;
          else mUrl = selectedWorkflow?.video?.fileURL || mUrl;
        } else if (config.imageFormat && !config.videoFormat) {
          mUrl = tUrl;
        }

        // Parse tags
        let tags = config.tagsStr
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        if (config.platform === "tiktok" && config.searchKeywords) {
          tags = [
            ...tags,
            ...config.searchKeywords
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          ];
        }

        return {
          platform: config.platform,
          channelId: config.channelId,
          channelName: channel?.name || channel?.username || config.channelId,
          profileId: channel?.profileId,
          caption: finalCaption,
          title: config.title,
          tags,
          thumbnailUrl: tUrl,
          mediaUrl: mUrl,
        };
      });

      const payload = {
        workflowId: globalConfig.workflowId,
        scheduledAt: globalConfig.scheduledAt || undefined,
        scheduledTimezone: globalConfig.scheduledAt ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
        idempotencyKey: crypto.randomUUID(),
        platforms: platformsConfig,
      };

      await dispatch(schedulePost(payload)).unwrap();
      
      toast.success("Posts scheduled successfully!");
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to schedule posts");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
              <CalendarClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Schedule Multi-Platform Post
              </h2>
              <p className="text-sm text-gray-500">
                Configure and schedule content across multiple channels
                simultaneously.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Body (Two Columns) */}
        <div className="flex-1 flex overflow-hidden bg-gray-50/30">
          {/* Left Panel: Global Settings & Platform Select */}
          <div className="w-[350px] flex-shrink-0 border-r border-gray-100 bg-white p-6 overflow-y-auto flex flex-col gap-6">
            {/* Story Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Story *
              </label>
              <div className="relative">
                <select
                  value={globalConfig.workflowId}
                  onChange={(e) =>
                    setGlobalConfig((p) => ({
                      ...p,
                      workflowId: e.target.value,
                    }))
                  }
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!!initialWorkflowId}
                >
                  <option value="">Select a story...</option>
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title}
                    </option>
                  ))}
                </select>
                {!initialWorkflowId && (
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Global Schedule Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Global Schedule Date & Time
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Applies to all selected platforms. Leave empty for default
                auto-post delay.
              </p>
              <input
                type="datetime-local"
                value={globalConfig.scheduledAt}
                onChange={(e) =>
                  setGlobalConfig((p) => ({
                    ...p,
                    scheduledAt: e.target.value,
                  }))
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Platform Multi-Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Platforms
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Click to add a platform block. You can add multiple variants of
                the same platform.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PLATFORM_META).map(([pId, meta]) => (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => handleAddPlatform(pId)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm font-medium text-gray-700 shadow-sm"
                  >
                    <div className={`${meta.bg} ${meta.color} p-1 rounded-md`}>
                      {meta.icon}
                    </div>
                    {meta.label}
                    <Plus className="w-3.5 h-3.5 ml-auto text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Dynamic Content Blocks */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 relative">
            {postConfigs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No platforms selected
                </h3>
                <p className="text-sm text-gray-500">
                  Select platforms from the left panel to configure their
                  specific captions, tags, and thumbnails.
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto pb-20">
                {postConfigs.map((config, index) => {
                  const meta = PLATFORM_META[config.platform];
                  const platformChannels = channels.filter(
                    (ch) => ch.platform?.toLowerCase() === config.platform,
                  );

                  return (
                    <div
                      key={config.id}
                      className={`bg-white rounded-2xl border ${meta.border} shadow-sm overflow-hidden`}
                    >
                      {/* Block Header */}
                      <div
                        className={`px-5 py-3 ${meta.bg} border-b ${meta.border} flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={meta.color}>{meta.icon}</div>
                          <span className="font-bold text-gray-800">
                            {meta.label}{" "}
                            <span className="text-gray-500 font-normal text-sm ml-1">
                              #{index + 1}
                            </span>
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveConfig(config.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-white/50 rounded-lg transition-colors"
                          title="Remove block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Block Form */}
                      <div className="p-5 space-y-4">
                        {/* Channel Selector */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Channel *
                          </label>
                          <div className="relative">
                            <select
                              value={config.channelId}
                              onChange={(e) =>
                                updateConfig(
                                  config.id,
                                  "channelId",
                                  e.target.value,
                                )
                              }
                              className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                            >
                              <option value="">
                                Select a {meta.label} channel...
                              </option>
                              {platformChannels.map((ch) => (
                                <option
                                  key={ch.id || ch.channel_id}
                                  value={ch.id || ch.channel_id}
                                >
                                  {ch.profileName ? `[${ch.profileName}] ` : ""}
                                  {ch.name || ch.username || ch.id}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {platformChannels.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                              ⚠️ No channels connected for {meta.label}.
                            </p>
                          )}
                        </div>

                        {/* Media Viewport Selector */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Media Attachments
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {availableFormats.map((format) => {
                              const isSelected =
                                format.type === "video"
                                  ? config.videoFormat === format.id
                                  : config.imageFormat === format.id;

                              return (
                                <button
                                  key={format.id}
                                  type="button"
                                  onClick={() => {
                                    if (format.type === "video") {
                                      updateConfig(
                                        config.id,
                                        "videoFormat",
                                        config.videoFormat === format.id
                                          ? ""
                                          : format.id,
                                      );
                                    } else {
                                      updateConfig(
                                        config.id,
                                        "imageFormat",
                                        config.imageFormat === format.id
                                          ? ""
                                          : format.id,
                                      );
                                    }
                                  }}
                                  className={`flex  items-center gap-2 justify-center p-3 rounded-xl border-2 transition-all ${
                                    isSelected
                                      ? "border-amber-600 bg-amber-50 text-amber-600"
                                      : "border-gray-200 hover:border-amber-300 bg-white text-gray-600"
                                  }`}
                                >
                                  <span className="text-base font-semibold ">
                                    {format.ratio}
                                  </span>
                                  <span className="text-xs font-medium text-center">
                                    ({format.label})
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {availableFormats.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                              ⚠️ No media found for this story.
                            </p>
                          )}
                        </div>

                        {/* YouTube Specific */}
                        {config.platform === "youtube" && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Title
                              </label>
                              <input
                                type="text"
                                value={config.title}
                                onChange={(e) =>
                                  updateConfig(
                                    config.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="YouTube Video Title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Description
                              </label>
                              <textarea
                                value={config.caption}
                                onChange={(e) =>
                                  updateConfig(
                                    config.id,
                                    "caption",
                                    e.target.value,
                                  )
                                }
                                rows={4}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                placeholder="Video Description"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                  Chapters (Optional)
                                </label>
                                <textarea
                                  value={config.chapters}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.id,
                                      "chapters",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                  placeholder="00:00 Intro&#10;01:30 Topic 1"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                  Hashtags / Tags
                                </label>
                                <textarea
                                  value={config.tagsStr}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.id,
                                      "tagsStr",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                  placeholder="tag1, tag2, tag3"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Instagram Specific */}
                        {config.platform === "instagram" && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Caption
                              </label>
                              <textarea
                                value={config.caption}
                                onChange={(e) =>
                                  updateConfig(
                                    config.id,
                                    "caption",
                                    e.target.value,
                                  )
                                }
                                rows={4}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                placeholder="Instagram Caption"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                  Cover Title (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={config.coverTitle}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.id,
                                      "coverTitle",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                  placeholder="Text overlay for grid"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                  Alt Text
                                </label>
                                <input
                                  type="text"
                                  value={config.altText}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.id,
                                      "altText",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                  placeholder="Image description"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Hashtags
                              </label>
                              <input
                                type="text"
                                value={config.tagsStr}
                                onChange={(e) =>
                                  updateConfig(
                                    config.id,
                                    "tagsStr",
                                    e.target.value,
                                  )
                                }
                                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                placeholder="tag1, tag2"
                              />
                            </div>
                          </>
                        )}

                        {/* TikTok Specific */}
                        {config.platform === "tiktok" && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Caption
                              </label>
                              <textarea
                                value={config.caption}
                                onChange={(e) =>
                                  updateConfig(
                                    config.id,
                                    "caption",
                                    e.target.value,
                                  )
                                }
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                placeholder="TikTok Caption"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                  Hashtags
                                </label>
                                <input
                                  type="text"
                                  value={config.tagsStr}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.id,
                                      "tagsStr",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                  placeholder="tag1, tag2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                  Search Keywords
                                </label>
                                <input
                                  type="text"
                                  value={config.searchKeywords}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.id,
                                      "searchKeywords",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                  placeholder="keyword1, keyword2"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Facebook Specific */}
                        {config.platform === "facebook" && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Post Caption
                              </label>
                              <textarea
                                value={config.caption}
                                onChange={(e) =>
                                  updateConfig(
                                    config.id,
                                    "caption",
                                    e.target.value,
                                  )
                                }
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                placeholder="Facebook Post Caption"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                  Hashtags
                                </label>
                                <input
                                  type="text"
                                  value={config.tagsStr}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.id,
                                      "tagsStr",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                  placeholder="tag1, tag2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                  Link Preview Text (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={config.linkPreviewText}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.id,
                                      "linkPreviewText",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                  placeholder="Override link title"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white p-6 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || postConfigs.length === 0}
            className="px-8 py-2.5 bg-gradient-to-r from-amber-400 to-pink-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Schedule {postConfigs.length > 0 ? postConfigs.length : ""} Post
            {postConfigs.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
