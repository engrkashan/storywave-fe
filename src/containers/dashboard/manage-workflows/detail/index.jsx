import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchWorkflowById } from "../../../../redux/slices/overview.slice";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DockIcon,
  Music,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Film,
  Image,
  Copy,
  Download,
} from "lucide-react";
import { BiAlarmExclamation, BiMicrophone } from "react-icons/bi";

const WorkflowDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { workflow, status, error } = useSelector((state) => state.overview);
  const [activeSEOTab, setActiveSEOTab] = useState(null);

  const handleDownload = (url, ratio = "16:9") => {
    if (!url) return;

    // Cloudinary transformation for forced PNG and High Quality download
    // For 1:1, we use 3000x3000px as requested.
    let transformation = "f_png,fl_attachment";
    if (ratio === "1:1") {
      transformation = "w_3000,h_3000,c_limit,f_png,fl_attachment";
    }

    // Insert transformation into Cloudinary URL
    // Format: .../upload/[transformation]/v[version]/...
    const urlParts = url.split("/upload/");
    if (urlParts.length !== 2) return window.open(url, "_blank");

    const transformedUrl = `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = transformedUrl;
    link.setAttribute("download", `cover-art-${ratio.replace(":", "-")}.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (id) dispatch(fetchWorkflowById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (workflow?.story?.seoContent && !activeSEOTab) {
      const platforms = Object.keys(workflow.story.seoContent);
      if (platforms.length > 0) setActiveSEOTab(platforms[0]);
    }
  }, [workflow, activeSEOTab]);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
      : "N/A";

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <X className="h-5 w-5 text-red-500" />;
      case "processing":
        return <ArrowLeft className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <BiAlarmExclamation className="h-5 w-5 text-yellow-500" />;
    }
  };

  const excludedKeys = [
    "seoContent",
    "textIdea",
    "result",
    "url",
    "Url",
    "videoUrl",
    "videoURL",
    "imageUrl",
    "imageURL",
    "fileUrl",
    "fileURL",
    "videoFile",
    "imageFile",
    "file",
    "generateImage",
    "generateVideo",
    "video",
    "thumbnail",
    "audioUrl",
    "audioURL",
    "storyLength",
    "storylength",
  ];

  const shouldExcludeKey = (key) => {
    const lowerKey = key.toLowerCase();
    return excludedKeys.some(
      (excluded) =>
        lowerKey.includes(excluded.toLowerCase()) ||
        lowerKey === excluded.toLowerCase(),
    );
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="mt-6 text-gray-700 font-semibold">
          Loading workflow details…
        </p>
        <p className="mt-2 text-sm text-gray-400">Please wait a moment</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <X className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">
              Error loading workflow
            </h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <Link
            to="/dashboard/manage-workflows"
            className="inline-flex items-center mt-4 text-sm text-red-600 hover:text-red-800"
          >
            ← Return to Workflows
          </Link>
        </div>
      </div>
    );
  }

  if (!workflow) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/manage-workflows"
            className="group inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Workflows
          </Link>
        </div>

        {/* Main Workflow Card  */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8 transform transition-all hover:shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <DockIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {workflow.title}
                </h1>
              </div>

              {workflow.description && (
                <p className="text-gray-600 text-lg leading-relaxed mb-6 max-w-3xl">
                  {workflow.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    Created {formatDate(workflow.createdAt)}
                  </span>
                </div>

                <div className="flex items-center">
                  <span
                    className={`ml-2 px-4 py-1.5 rounded-full text-sm font-medium border ${workflow.status === "completed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : workflow.status === "processing"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : workflow.status === "failed"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                  >
                    {workflow.status.charAt(0).toUpperCase() +
                      workflow.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Workflow Details Section */}
            {workflow.metadata && Object.keys(workflow.metadata).length > 0 && (
              <SectionCard
                title="Workflow Details"
                icon={<DockIcon className="h-6 w-6 text-white" />}
                gradient="from-indigo-600 to-blue-700"
              >
                <div className="space-y-6">
                  {Object.entries(workflow.metadata)
                    .filter(([key]) => !shouldExcludeKey(key))
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="group hover:bg-gray-50 transition-colors p-4 rounded-lg -mx-2"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-start">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-indigo-50 rounded">
                                <Info className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="text-sm font-semibold text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, " $1")}
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <div className="text-sm text-gray-900 break-words bg-white p-3 rounded-lg border border-gray-100">
                              {key.toLowerCase() === "voice" &&
                                value &&
                                typeof value === "object"
                                ? value.label || "—"
                                : renderMetaValue(value, key)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </SectionCard>
            )}

            {/* Story Section */}
            {workflow.story && (
              <SectionCard
                title="Story"
                icon={<DockIcon className="h-6 w-6 text-white" />}
                gradient="from-indigo-500 to-purple-600"
              >
                <div className="space-y-6">
                  {workflow.story.title && (
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {workflow.story.title}
                        </h3>
                        {workflow.story.series && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
                            Series: {workflow.story.series}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {workflow.story.coverArtURL && (
                    <div className="mb-6">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Cover Art</span>
                      <img 
                        src={workflow.story.coverArtURL} 
                        alt="Story Cover Art" 
                        className="w-full h-auto rounded-2xl shadow-lg border border-gray-100 max-h-[400px] object-cover" 
                      />
                    </div>
                  )}

                  {workflow.story.outline && (
                    <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-100">
                      <div className="flex items-center mb-2">
                        <ChevronRight className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-sm font-semibold text-gray-700">
                          Outline
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {workflow.story.outline}
                      </p>
                    </div>
                  )}

                  {workflow.story.content && (
                    <div className="mt-6">
                      <div className="bg-white p-5 rounded-xl border border-gray-100">
                        <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                          {workflow.story.content}
                        </p>
                      </div>
                    </div>
                  )}
                  {workflow.story.visualSuggestions && (
                    <div className="mt-6 bg-amber-50/50 p-5 rounded-xl border border-amber-100/50">
                      <div className="flex items-center mb-2">
                        <Info className="h-4 w-4 text-amber-600 mr-2" />
                        <span className="text-sm font-semibold text-gray-700">
                          Visual Suggestions
                        </span>
                      </div>
                      <p className="text-gray-700 italic text-sm">
                        "{workflow.story.visualSuggestions}"
                      </p>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* SEO Metadata Section */}
            {workflow.story?.seoContent && Object.keys(workflow.story.seoContent).length > 0 && (
              <SectionCard
                title="SEO Metadata"
                icon={<Info className="h-6 w-6 text-white" />}
                gradient="from-blue-600 to-indigo-700"
              >
                <div className="space-y-6">
                  {/* Determine if it's nested (tabbed) or flat */}
                  {(() => {
                    const seoEntries = Object.entries(workflow.story.seoContent);
                    const isNested = seoEntries.some(([_, v]) => v && typeof v === "object" && !Array.isArray(v));

                    if (isNested) {
                      return (
                        <>
                          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
                            {Object.keys(workflow.story.seoContent).map((platform) => (
                              <button
                                key={platform}
                                onClick={() => setActiveSEOTab(platform)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm transform active:scale-95 ${activeSEOTab === platform
                                    ? "bg-indigo-600 text-white shadow-indigo-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                  }`}
                              >
                                {platform}
                              </button>
                            ))}
                          </div>

                          <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-300">
                            {activeSEOTab && workflow.story.seoContent[activeSEOTab] && (
                              <div className="grid grid-cols-1 gap-6">
                                {Object.entries(workflow.story.seoContent[activeSEOTab]).map(([field, value]) => (
                                  <div key={field} className="group/item space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-1">
                                        {field.replace(/([A-Z])/g, " $1")}
                                      </span>
                                      {typeof value === "string" && (
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(value);
                                          }}
                                          className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-300 hover:text-indigo-600 transition-all opacity-0 group-hover/item:opacity-100"
                                          title={`Copy ${field}`}
                                        >
                                          <Copy className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 group-hover/item:border-indigo-100 transition-colors">
                                      {Array.isArray(value) ? (
                                        <div className="flex flex-wrap gap-2">
                                          {value.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-white border border-indigo-50 text-indigo-500 rounded-xl text-[11px] font-medium shadow-sm">
                                              {tag.startsWith("#") ? tag : `#${tag}`}
                                            </span>
                                          ))}
                                        </div>
                                      ) : typeof value === "string" ? (
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                          {value}
                                        </p>
                                      ) : (
                                        <pre className="text-[10px] text-gray-500 overflow-x-auto bg-white p-3 rounded-lg border border-gray-100">
                                          {JSON.stringify(value, null, 2)}
                                        </pre>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 gap-4">
                        {seoEntries.map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-1">
                              {key.replace(/([A-Z])/g, " $1")}
                            </span>
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700">
                              {typeof value === "string" ? value : JSON.stringify(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </SectionCard>
            )}

            {/* Tasks Section */}
            {workflow.tasks?.length > 0 && (
              <SectionCard
                title="Tasks"
                icon={<ListCheck className="h-6 w-6 text-white" />}
                gradient="from-gray-700 to-gray-900"
              >
                <div className="space-y-4">
                  {workflow.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="group hover:shadow-md transition-all p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 font-medium">
                              {index + 1}
                            </div>
                            <div className="absolute -right-1 -bottom-1">
                              {getStatusIcon(task.status)}
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {task.step}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {formatDate(task.createdAt)}
                        </span>
                      </div>
                      <div className="ml-11">
                        {task.details && (
                          <p className="text-sm text-gray-600 mt-2">
                            {task.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            {/* Video Card */}
            {(workflow.video?.fileURL || workflow.video?.video_16_9 || workflow.video?.video_9_16) && (
              <SectionCard
                title="Video Content"
                icon={<Film className="h-6 w-6 text-white" />}
                gradient="from-purple-500 to-pink-600"
              >
                <div className="space-y-8">
                  {/* YouTube / Landscape Version */}
                  {workflow.video?.video_16_9 !== null && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                          Landscape / YouTube (16:9)
                        </span>
                      </div>
                      <video
                        controls
                        src={workflow.video.video_16_9 || workflow.video.fileURL}
                        className="w-full rounded-xl shadow-lg border border-gray-100"
                      />
                    </div>
                  )}

                  {/* TikTok / Portrait Version */}
                  {workflow.video?.video_9_16 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">
                          Portrait / TikTok (9:16)
                        </span>
                      </div>
                      <div className="max-w-[280px] mx-auto">
                        <video
                          controls
                          src={workflow.video.video_9_16}
                          className="w-full rounded-xl shadow-lg border border-gray-100 aspect-[9/16] bg-black"
                        />
                      </div>
                    </div>
                  )}

                  {workflow.video?.duration && (
                    <div className="flex items-center text-sm text-gray-600 pt-2 border-t border-gray-100">
                      <Clock className="h-4 w-4 mr-2" />
                      Duration: {workflow.video.duration}
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Cover Art Card */}
            {(workflow.story?.coverArtURL_1_1 || workflow.story?.coverArtURL_16_9) && (
              <SectionCard
                title="Cover Art"
                icon={<Image className="h-6 w-6 text-white" />}
                gradient="from-blue-500 to-indigo-600"
              >
                <div className="space-y-6">
                  {workflow.story?.coverArtURL_16_9 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest pl-1">
                          Landscape (16:9)
                        </span>
                        <button
                          onClick={() =>
                            handleDownload(workflow.story.coverArtURL_16_9, "16:9")
                          }
                          className="p-1 px-2 flex items-center gap-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm border border-blue-100"
                        >
                          <Download className="h-3 w-3" />
                          Download PNG
                        </button>
                      </div>
                      <img
                        src={workflow.story.coverArtURL_16_9}
                        alt="Cover Art 16:9"
                        className="w-full rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      />
                    </div>
                  )}
                  {workflow.story?.coverArtURL_1_1 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest pl-1">
                          Square (1:1)
                        </span>
                        <button
                          onClick={() =>
                            handleDownload(workflow.story.coverArtURL_1_1, "1:1")
                          }
                          className="p-1 px-2 flex items-center gap-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm border border-indigo-100"
                        >
                          <Download className="h-3 w-3" />
                          Download PNG (3000px)
                        </button>
                      </div>
                      <img
                        src={workflow.story.coverArtURL_1_1}
                        alt="Cover Art 1:1"
                        className="w-full aspect-square object-cover rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      />
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Voiceover Card */}
            {workflow.voiceover && (
              <SectionCard
                title="Voiceover"
                icon={<BiMicrophone className="h-6 w-6 text-white" />}
                gradient="from-emerald-500 to-teal-600"
              >
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl">
                    <audio
                      controls
                      src={workflow.voiceover.audioURL}
                      className="w-full"
                    />
                  </div>
                  {workflow.voiceover.duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Duration: {workflow.voiceover.duration}
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Podcast Episodes Card */}
            {workflow.podcast?.episodes?.length > 0 && (
              <SectionCard
                title="Podcast Episodes"
                icon={<Music className="h-6 w-6 text-white" />}
                gradient="from-orange-500 to-amber-600"
              >
                <div className="space-y-3">
                  {workflow.podcast.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="group hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all p-4 border border-gray-200 rounded-xl hover:border-orange-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center">
                            <Music className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {ep.title}
                          </p>
                          {ep.duration && (
                            <p className="text-xs text-gray-500">
                              {ep.duration}
                            </p>
                          )}
                        </div>
                        {ep.audioURL && (
                          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */

const renderMetaValue = (value, key) => {
  if (!value) return <span className="text-gray-400">—</span>;

  const lowerKey = key.toLowerCase();

  const urlPatterns = [
    "url",
    "link",
    "file",
    "generate",
    "image",
    "video",
    "thumbnail",
    "audio",
  ];
  const shouldHideUrl = urlPatterns.some((pattern) =>
    lowerKey.includes(pattern),
  );

  if (typeof value === "string" && value.startsWith("http") && shouldHideUrl) {
    return null;
  }

  if (typeof value === "string" && value.startsWith("http")) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        {value}
        <ExternalLink className="h-3 w-3 ml-2" />
      </a>
    );
  }

  if (Array.isArray(value)) {
    return (
      <ul className="space-y-2">
        {value.map((v, i) => (
          <li key={i} className="flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2"></div>
            <span>{v}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    if (lowerKey === "voice" && value.label) {
      return (
        <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
          {value.label}
        </div>
      );
    }

    if (shouldHideUrl) {
      return null;
    }

    return (
      <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto border border-gray-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="text-gray-900">{value}</span>;
};

const SectionCard = ({ title, icon, gradient, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transform transition-all hover:shadow-md">
    <div
      className={`bg-gradient-to-r ${gradient} px-6 py-5 relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="absolute inset-0 bg-white rounded-full -mt-16 -mr-16"></div>
      </div>
      <div className="flex items-center space-x-3 relative z-10">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default WorkflowDetailPage;
