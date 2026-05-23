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
  Image as ImageIcon,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  ListCheck
} from "lucide-react";
import { BiAlarmExclamation, BiMicrophone, BiVideo } from "react-icons/bi";

const WorkflowDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { workflow, status, error } = useSelector((state) => state.overview);
  const [activeSEOTab, setActiveSEOTab] = useState(null);
  const [activeTab, setActiveTab] = useState("metadata");
  const [descExpanded, setDescExpanded] = useState(false);

  const handleDownload = (url, ratio = "16:9") => {
    if (!url) return;
    let transformation = "f_png,fl_attachment";
    if (ratio === "1:1") {
      transformation = "w_3000,h_3000,c_limit,f_png,fl_attachment";
    }
    const urlParts = url.split("/upload/");
    if (urlParts.length !== 2) return window.open(url, "_blank");
    const transformedUrl = `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;
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
      case "completed": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed": return <X className="h-5 w-5 text-red-500" />;
      case "processing": return <ArrowLeft className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <BiAlarmExclamation className="h-5 w-5 text-yellow-500" />;
    }
  };

  const excludedKeys = [
    "seoContent", "textIdea", "result", "url", "Url", "videoUrl", "videoURL",
    "imageUrl", "imageURL", "fileUrl", "fileURL", "videoFile", "imageFile",
    "file", "generateImage", "generateVideo", "video", "thumbnail",
    "audioUrl", "audioURL", "storyLength", "storylength",
  ];

  const shouldExcludeKey = (key) => {
    const lowerKey = key.toLowerCase();
    return excludedKeys.some((ex) => lowerKey.includes(ex.toLowerCase()) || lowerKey === ex.toLowerCase());
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="mt-6 text-gray-700 font-semibold">Loading media...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-800">Error loading</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <Link to="/dashboard/manage-workflows" className="text-red-600 hover:underline mt-4 inline-block">
            ← Return to Workflows
          </Link>
        </div>
      </div>
    );
  }

  if (!workflow) return null;

  const isPodcast = workflow.metadata?.type?.toLowerCase() === "podcast" || !!workflow.podcast;

  // Primary Media selection
  const primaryVideo = workflow.video?.video_16_9 || workflow.video?.fileURL || workflow.video?.video_9_16;
  const primaryImage = workflow.story?.coverArtURL_16_9 || workflow.story?.thumbnail || workflow.story?.coverArtURL_1_1 || workflow.story?.coverArtURL;

  const renderMediaGrid = () => {
    const has16_9Video = !!primaryVideo;
    const has9_16Video = !!workflow.video?.video_9_16;
    const hasCover16_9 = true; // always shown (placeholder fallback)
    const hasCover1_1 = true; // always shown (placeholder fallback)
    const hasAudio = !isPodcast && !!workflow.voiceover?.audioURL;

    return (
      <div className="w-full px-4 sm:px-6 mb-8">
        {/* Grid: 3 columns, auto rows. 9:16 video spans 2 rows. */}
        <div className="grid grid-cols-3 items-center justify-center gap-3 sm:gap-4">

          {/* ── COLUMN 1 ── */}
          <div>
            {/* Video 16:9  (row 1) */}
            {has16_9Video ? (
              <div className="relative rounded-2xl overflow-hidden h-[30vh] bg-black shadow-sm border border-gray-100 group aspect-video">
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold z-10 flex items-center gap-1">
                  <Film className="w-3 h-3" /> Video 16:9
                </span>
                <video controls src={primaryVideo} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200 aspect-video flex items-center justify-center">
                <BiVideo className="w-10 h-10 text-gray-300" />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold z-10">No Video</span>
              </div>
            )}

            {/* Cover 16:9  (row 2) */}
            <div className="mt-5 relative rounded-2xl overflow-hidden h-[30vh] bg-gray-100 shadow-sm border border-gray-200 group aspect-video">
              <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold z-10 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Cover 16:9
              </span>
              <button
                onClick={() => workflow.story?.coverArtURL_16_9 && handleDownload(workflow.story.coverArtURL_16_9, "16:9")}
                title={workflow.story?.coverArtURL_16_9 ? "Download" : "No image available"}
                className={`absolute top-2 right-2 backdrop-blur-sm text-white p-1.5 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 ${workflow.story?.coverArtURL_16_9
                  ? "bg-black/60 hover:bg-black/80 cursor-pointer shadow-md"
                  : "bg-black/30 cursor-not-allowed"
                  }`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <img src={workflow.story?.coverArtURL_16_9 || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Cover Art 16:9" />
            </div>
          </div>
          {/* ── COLUMN 2: 9:16 video spans 2 rows ── */}
          {has9_16Video ? (
            <div className="justify-center items-center flex mx-auto relative rounded-2xl overflow-hidden bg-black shadow-sm border border-gray-100 row-span-2 group"
              style={{ aspectRatio: "9/16", maxHeight: "60vh" }}>
              <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold z-10 flex items-center gap-1">
                <Film className="w-3 h-3" /> Video 9:16
              </span>
              <video controls src={workflow.video.video_9_16} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="justify-center items-center flex mx-auto relative rounded-2xl overflow-hidden bg-gray-900 shadow-sm border border-gray-800 row-span-2 flex items-center justify-center"
              style={{ aspectRatio: "9/16", maxHeight: "450px" }}>
              <BiVideo className="w-10 h-10 text-gray-600" />
              <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold z-10">No 9:16 Video</span>
            </div>
          )}
          <div>
            {/* ── COLUMN 3 ── */}
            {/* Cover 1:1  (row 1) */}
            <div className="relative rounded-2xl overflow-hidden h-[30vh] bg-gray-100 shadow-sm border border-gray-200 group aspect-square">
              <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold z-10 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Cover 1:1
              </span>
              <button
                onClick={() => workflow.story?.coverArtURL_1_1 && handleDownload(workflow.story.coverArtURL_1_1, "1:1")}
                title={workflow.story?.coverArtURL_1_1 ? "Download" : "No image available"}
                className={`absolute top-2 right-2 backdrop-blur-sm text-white p-1.5 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 ${workflow.story?.coverArtURL_1_1
                  ? "bg-black/60 hover:bg-black/80 cursor-pointer shadow-md"
                  : "bg-black/30 cursor-not-allowed"
                  }`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <img src={workflow.story?.coverArtURL_1_1 || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Cover Art 1:1" />
            </div>

            {/* Audio / Voiceover  (row 2) */}
            {hasAudio ? (
              <div className="mt-5 relative rounded-2xl h-[30vh] overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm border border-indigo-100 p-4 flex flex-col items-center justify-center gap-3 aspect-square">
                <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-semibold z-10 flex items-center gap-1 border border-gray-200">
                  <BiMicrophone className="w-3 h-3" /> Audio
                </span>
                <BiMicrophone className="w-10 h-10 text-indigo-300 flex-shrink-0" />
                <audio controls src={workflow.voiceover.audioURL} className="w-full" />
                {workflow.voiceover.duration && (
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{workflow.voiceover.duration}</div>
                )}
              </div>
            ) : (
              <div className="mt-5 relative rounded-2xl overflow-hidden bg-gray-50 shadow-sm border border-gray-200 flex items-center justify-center aspect-square">
                <BiMicrophone className="w-10 h-10 text-gray-200" />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold z-10">No Audio</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar / Back */}
      <div className="px-6 py-4 flex items-center sticky top-0 bg-white/80 backdrop-blur-md z-40 shadow-sm border-b border-gray-100">
        <Link
          to="/dashboard/manage-workflows"
          className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </div>

      <div className="w-full pt-6">

        {/* MEDIA GRID: All assets in a responsive 3-column grid */}
        {renderMediaGrid()}

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">

          {/* TITLE & QUICK ACTIONS */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 break-words">
              {workflow.title || "Untitled Workflow"}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  {isPodcast ? <BiMicrophone className="text-indigo-600 text-xl" /> : <BiVideo className="text-indigo-600 text-xl" />}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {workflow.story?.series ? workflow.story.series : (isPodcast ? "Podcast Episode" : "Video Story")}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(workflow.createdAt)} • {workflow.status?.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Download Actions if applicable */}
                {workflow.story?.coverArtURL_16_9 && (
                  <button onClick={() => handleDownload(workflow.story.coverArtURL_16_9, "16:9")} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-medium transition-colors">
                    <Download className="w-4 h-4" /> Thumbnail
                  </button>
                )}
                <button onClick={() => { localStorage.setItem("editWorkflowId", workflow.id); window.location.href = "/dashboard/generate-story"; }} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors shadow-sm">
                  Edit Content
                </button>
              </div>
            </div>
          </div>

          {/* EXPANDABLE DESCRIPTION BOX */}
          <div className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl p-4 mb-8 cursor-pointer border border-gray-200/60" onClick={() => setDescExpanded(!descExpanded)}>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-900 mb-2">
              <span>{workflow.description ? `${workflow.description.substring(0, 100)}...` : (workflow.story?.outline ? "Story Outline & Details" : "Description")}</span>
            </div>

            {descExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200/60 space-y-6 text-sm text-gray-800 cursor-text" onClick={(e) => e.stopPropagation()}>
                {workflow.description && (
                  <div>
                    <span className="font-semibold block mb-1">Description</span>
                    <p className="whitespace-pre-line">{workflow.description}</p>
                  </div>
                )}
                {workflow.story?.outline && (
                  <div>
                    <span className="font-semibold block mb-1">Outline</span>
                    <p className="whitespace-pre-line leading-relaxed">{workflow.story.outline}</p>
                  </div>
                )}
                {workflow.story?.content && (
                  <div>
                    <span className="font-semibold block mb-1">Full Content / Script</span>
                    <p className="whitespace-pre-line leading-relaxed text-gray-700 bg-white p-4 rounded-xl border border-gray-200">{workflow.story.content}</p>
                  </div>
                )}
                {workflow.story?.visualSuggestions && (
                  <div>
                    <span className="font-semibold block mb-1 text-indigo-700">Visual Suggestions</span>
                    <p className="italic text-indigo-900 bg-indigo-50 p-4 rounded-xl">{workflow.story.visualSuggestions}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 text-sm font-semibold text-gray-600 flex items-center">
              {descExpanded ? "Show less" : "...more"}
            </div>
          </div>

          {/* TABS SECTION */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
              {[
                { id: "metadata", label: "Metadata" },
                { id: "seo", label: "SEO Content", hidden: !workflow.story?.seoContent },
                { id: "tasks", label: "Task History", hidden: !workflow.tasks?.length },
                { id: "podcast", label: "Podcast Episodes", hidden: !workflow.podcast?.episodes?.length }
              ].filter(t => !t.hidden).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* TAB CONTENT */}
          <div className="pb-20">
            {activeTab === "metadata" && workflow.metadata && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(workflow.metadata)
                  .filter(([key]) => !shouldExcludeKey(key))
                  .map(([key, value]) => (
                    <div key={key} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, " $1")}</div>
                      <div className="text-sm text-gray-900 break-words">{renderMetaValue(value, key)}</div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === "seo" && workflow.story?.seoContent && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center gap-1 bg-gray-50 p-2 border-b border-gray-100">
                  {Object.keys(workflow.story.seoContent).map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setActiveSEOTab(platform)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${activeSEOTab === platform ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
                <div className="p-6 space-y-6">
                  {activeSEOTab && workflow.story.seoContent[activeSEOTab] && Object.entries(workflow.story.seoContent[activeSEOTab]).map(([field, value]) => (
                    <div key={field} className="group relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">{field.replace(/([A-Z])/g, " $1")}</span>
                        {typeof value === "string" && (
                          <button onClick={() => navigator.clipboard.writeText(value)} className="text-indigo-500 bg-indigo-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap">
                        {Array.isArray(value) ? value.map(t => <span className="inline-block mr-2 mb-2 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs">{t.startsWith("#") ? t : `#${t}`}</span>) : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "tasks" && workflow.tasks && (
              <div className="space-y-3">
                {workflow.tasks.map((task, i) => (
                  <div key={task.id} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{task.step}</div>
                      {task.details && <div className="text-sm text-gray-500 mt-1">{task.details}</div>}
                      <div className="text-xs text-gray-400 mt-2">{formatDate(task.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "podcast" && workflow.podcast?.episodes && (
              <div className="space-y-4">
                {workflow.podcast.episodes.map(ep => (
                  <div key={ep.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{ep.title}</h4>
                      {ep.duration && <div className="text-xs text-gray-500 mt-0.5">{ep.duration}</div>}
                    </div>
                    {ep.audioURL && <audio controls src={ep.audioURL} className="max-w-[200px] h-8" />}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

const renderMetaValue = (value, key) => {
  if (!value) return <span className="text-gray-400">—</span>;
  const lowerKey = key.toLowerCase();
  const urlPatterns = ["url", "link", "file", "image", "video", "thumbnail", "audio"];
  const shouldHideUrl = urlPatterns.some((pattern) => lowerKey.includes(pattern));

  if (typeof value === "string" && value.startsWith("http") && shouldHideUrl) return null;

  if (typeof value === "string" && value.startsWith("http")) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center">
        {value} <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    );
  }

  if (Array.isArray(value)) {
    return <div className="flex flex-wrap gap-2">{value.map((v, i) => <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{v}</span>)}</div>;
  }

  if (typeof value === "object") {
    if (lowerKey === "voice" && value.label) return <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-sm font-medium">{value.label}</span>;
    if (shouldHideUrl) return null;
    return <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto border border-gray-100">{JSON.stringify(value, null, 2)}</pre>;
  }

  return <span>{value}</span>;
};

export default WorkflowDetailPage;
