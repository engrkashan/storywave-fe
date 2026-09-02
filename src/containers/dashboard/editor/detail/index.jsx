import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import {
  fetchEditorWorkflowDetail,
  clearCurrentWorkflow,
  setWorkflowHeader,
  appendWorkflowScenes,
  setWorkflowComplete,
  updateScenePrompt,
  regenerateScene,
  replaceSceneFrame,
  uploadCharacterReference,
  revertSceneVersion,
  mergeWorkflow,
  optimisticSetSceneStatus,
  resetMergeState,
} from "../../../../redux/slices/editor.slice";
import {
  ArrowLeft,
  Film,
  Sparkles,
  Layers,
  Clock,
  Volume2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Video,
} from "lucide-react";
import SceneCard from "../components/SceneCard";
import PromptModal from "../components/PromptModal";
import VideoGenModal from "../components/VideoGenModal";
import VersionModal from "../components/VersionModal";
import MediaPreviewModal from "../components/MediaPreviewModal";
import MergeConfirmModal from "../components/MergeConfirmModal";
import MergeBar from "../components/MergeBar";

/**
 * Progressive streaming loader: connects to SSE stream endpoint.
 * Dispatches workflow header in ~30ms, then appends scene batches progressively.
 * Gracefully falls back to standard fetch if stream fails.
 */
const loadWorkflowStream = async ({ workflowId, dispatch, onFirstChunk, onError }) => {
  const token = Cookies.get("token");
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "") + "/api";
  const streamUrl = `${baseUrl}/editor/workflows/${workflowId}/stream`;

  let hasEmittedFirstChunk = false;

  try {
    const response = await fetch(streamUrl, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "text/event-stream",
      },
    });

    if (!response.ok || !response.body) {
      const fallbackData = await dispatch(fetchEditorWorkflowDetail(workflowId)).unwrap();
      if (!hasEmittedFirstChunk && onFirstChunk) {
        hasEmittedFirstChunk = true;
        onFirstChunk(fallbackData);
      }
      return fallbackData;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        if (!block.trim()) continue;
        const eventMatch = block.match(/^event:\s*(\w+)/m);
        const dataMatch = block.match(/^data:\s*(.+)$/m);

        if (eventMatch && dataMatch) {
          const event = eventMatch[1];
          try {
            const data = JSON.parse(dataMatch[1]);
            if (event === "workflow") {
              dispatch(setWorkflowHeader(data));
              if (!hasEmittedFirstChunk && onFirstChunk) {
                hasEmittedFirstChunk = true;
                onFirstChunk(data);
              }
            } else if (event === "scenes") {
              dispatch(appendWorkflowScenes(data.scenes || []));
            } else if (event === "done") {
              dispatch(setWorkflowComplete());
            } else if (event === "error") {
              throw new Error(data.error || "Streaming error");
            }
          } catch (e) {
            console.warn("SSE chunk parse warning:", e);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Stream unavailable or interrupted, falling back to standard request:", err);
    try {
      const fallbackData = await dispatch(fetchEditorWorkflowDetail(workflowId)).unwrap();
      if (!hasEmittedFirstChunk && onFirstChunk) {
        hasEmittedFirstChunk = true;
        onFirstChunk(fallbackData);
      }
      return fallbackData;
    } catch (fallbackErr) {
      const errMsg = fallbackErr?.error || fallbackErr?.message || "Failed to load workflow";
      if (onError) {
        onError(errMsg);
      }
      throw fallbackErr;
    }
  }
};

const EditorDetailPage = () => {
  const { id: workflowId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentWorkflow, detailLoading, isMerging, mergeSuccess } = useSelector((s) => s.editor);

  // Modals state
  const [selectedPromptScene, setSelectedPromptScene] = useState(null);
  const [selectedVideoScene, setSelectedVideoScene] = useState(null);
  const [selectedVersionScene, setSelectedVersionScene] = useState(null);
  const [selectedPreviewScene, setSelectedPreviewScene] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [activeRatioFilter, setActiveRatioFilter] = useState("ALL");

  // Loading / Streaming status
  const [isConnecting, setIsConnecting] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Polling ref & in-flight tracking
  const pollingTimeoutRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Initial load: shows loading until first chunk arrives
  useEffect(() => {
    dispatch(resetMergeState());
    dispatch(clearCurrentWorkflow());
    setIsConnecting(true);
    setLoadError(null);

    if (workflowId) {
      isFetchingRef.current = true;
      loadWorkflowStream({
        workflowId,
        dispatch,
        onFirstChunk: () => {
          setIsConnecting(false);
        },
        onError: (err) => {
          setIsConnecting(false);
          setLoadError(err);
        },
      }).finally(() => {
        isFetchingRef.current = false;
        setIsConnecting(false);
      });
    }
    return () => {
      dispatch(resetMergeState());
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [dispatch, workflowId]);

  // Determine if polling is necessary (only when pending, processing, or a scene is actively regenerating)
  const isGeneratingOrRegenerating = Boolean(
    currentWorkflow?.status === "PENDING" ||
    currentWorkflow?.status === "PROCESSING" ||
    currentWorkflow?.scenes?.some((s) => s.status === "REGENERATING")
  );

  // Safe polling: sequential timeout that waits for previous response before scheduling next poll
  useEffect(() => {
    if (!isGeneratingOrRegenerating || !workflowId) {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const scheduleNextPoll = () => {
      if (isCancelled) return;
      pollingTimeoutRef.current = setTimeout(async () => {
        if (isCancelled || !workflowId) return;

        // Prevent overlapping requests
        if (!isFetchingRef.current) {
          isFetchingRef.current = true;
          try {
            await dispatch(fetchEditorWorkflowDetail(workflowId)).unwrap();
          } catch (err) {
            console.error("Editor polling error:", err);
          } finally {
            isFetchingRef.current = false;
          }
        }

        // Schedule next iteration only after completion
        if (!isCancelled) {
          scheduleNextPoll();
        }
      }, 5000); // 5s interval AFTER prior request completes
    };

    scheduleNextPoll();

    return () => {
      isCancelled = true;
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [isGeneratingOrRegenerating, dispatch, workflowId]);

  // Handlers
  const handleSavePrompt = async (sceneId, promptText) => {
    try {
      await dispatch(updateScenePrompt({ workflowId, sceneId, prompt: promptText })).unwrap();
      toast.success("Scene prompt updated successfully");
      dispatch(fetchEditorWorkflowDetail(workflowId));
    } catch (err) {
      toast.error(err || "Failed to update prompt");
    }
  };

  // Direct 1-Click Regenerate
  const handleRegenerate = async (scene) => {
    try {
      dispatch(optimisticSetSceneStatus({ sceneId: scene.id, status: "REGENERATING" }));
      await dispatch(
        regenerateScene({
          workflowId,
          sceneId: scene.id,
          prompt: scene.activePrompt || scene.originalPrompt,
        })
      ).unwrap();
      toast.success(`Scene ${scene.index + 1} regeneration queued`);
      dispatch(fetchEditorWorkflowDetail(workflowId));
    } catch (err) {
      toast.error(err || "Failed to trigger regeneration");
      dispatch(fetchEditorWorkflowDetail(workflowId));
    }
  };

  // Image Regeneration with custom prompt and character reference
  const handleRegenerateWithRef = async (scene, promptText, characterRef) => {
    try {
      let charRefPayload = characterRef;

      // If user uploaded a new local file for the character reference, upload it first
      if (characterRef?.file) {
        toast.loading("Uploading character reference...", { id: "char-upload" });
        const uploadRes = await dispatch(
          uploadCharacterReference({
            workflowId,
            sceneId: scene.id,
            file: characterRef.file,
            name: characterRef.name || "Character Ref",
          })
        ).unwrap();
        toast.dismiss("char-upload");
        charRefPayload = uploadRes?.characterReference || uploadRes?.data?.characterReference || uploadRes;
      }

      dispatch(optimisticSetSceneStatus({ sceneId: scene.id, status: "REGENERATING" }));
      await dispatch(
        regenerateScene({
          workflowId,
          sceneId: scene.id,
          prompt: promptText,
          characterReference: charRefPayload,
          generateAsVideo: false,
        })
      ).unwrap();
      toast.success(`Scene ${scene.index + 1} image regeneration queued`);
      dispatch(fetchEditorWorkflowDetail(workflowId));
    } catch (err) {
      toast.dismiss("char-upload");
      toast.error(err || "Failed to trigger image regeneration");
      dispatch(fetchEditorWorkflowDetail(workflowId));
    }
  };

  // Motion Graphic Video Generation via Veo 3
  const handleGenerateVideo = async (scene, customPrompt = null, characterRef = null) => {
    try {
      const promptToUse = customPrompt || scene.activePrompt || scene.originalPrompt;
      let charRefPayload = characterRef;

      if (characterRef?.file) {
        toast.loading("Uploading character reference...", { id: "char-upload" });
        const uploadRes = await dispatch(
          uploadCharacterReference({
            workflowId,
            sceneId: scene.id,
            file: characterRef.file,
            name: characterRef.name || "Character Ref",
          })
        ).unwrap();
        toast.dismiss("char-upload");
        charRefPayload = uploadRes?.characterReference || uploadRes?.data?.characterReference || uploadRes;
      }

      dispatch(optimisticSetSceneStatus({ sceneId: scene.id, status: "REGENERATING" }));
      await dispatch(
        regenerateScene({
          workflowId,
          sceneId: scene.id,
          prompt: promptToUse,
          characterReference: charRefPayload,
          generateAsVideo: true,
        })
      ).unwrap();
      toast.success(`Veo 3 video clip generation started for Scene ${scene.index + 1}!`);
      dispatch(fetchEditorWorkflowDetail(workflowId));
    } catch (err) {
      toast.dismiss("char-upload");
      toast.error(err || "Failed to start Veo 3 video generation");
      dispatch(fetchEditorWorkflowDetail(workflowId));
    }
  };

  // Direct Frame Replacement via File Upload
  const handleReplaceFrame = async (scene, imageFile) => {
    try {
      toast.loading("Uploading custom frame...", { id: "frame-upload" });
      await dispatch(
        replaceSceneFrame({
          workflowId,
          sceneId: scene.id,
          file: imageFile,
        })
      ).unwrap();
      toast.dismiss("frame-upload");
      toast.success(`Scene ${scene.index + 1} frame replaced successfully!`);
      dispatch(fetchEditorWorkflowDetail(workflowId));
    } catch (err) {
      toast.dismiss("frame-upload");
      toast.error(err || "Failed to replace frame");
    }
  };

  const handleRevert = async (sceneId, versionNumber) => {
    try {
      await dispatch(revertSceneVersion({ workflowId, sceneId, version: versionNumber })).unwrap();
      toast.success(`Reverted to version ${versionNumber}`);
      dispatch(fetchEditorWorkflowDetail(workflowId));
    } catch (err) {
      toast.error(err || "Failed to revert version");
    }
  };

  const handleOpenMergeModal = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmMerge = async () => {
    try {
      await dispatch(mergeWorkflow(workflowId)).unwrap();
      setIsConfirmModalOpen(false);
      toast.success("Final video assembly started! Moving to processing...");
      navigate("/dashboard/manage-workflows");
    } catch (err) {
      toast.error(err || "Merge request failed");
    }
  };

  // 1. Status is FAILED -> Show failed screen
  if (currentWorkflow?.status === "FAILED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-5 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
          <AlertCircle size={36} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900">Story Generation Failed</h2>
          <p className="text-sm text-gray-500">
            {currentWorkflow?.error || "This workflow encountered an error during generation."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/editor"
            className="px-5 py-2.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm shadow-md transition-all"
          >
            Back to Editor
          </Link>
          <Link
            to="/dashboard/manage-workflows"
            className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-all"
          >
            View Workflows
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fatal load error and no workflow data loaded -> Show error screen
  if (loadError && !currentWorkflow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-5 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
          <AlertCircle size={36} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900">Failed to Load Story</h2>
          <p className="text-sm text-gray-500">{loadError}</p>
        </div>
        <Link
          to="/dashboard/editor"
          className="px-6 py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm shadow-md transition-all"
        >
          Back to Editor
        </Link>
      </div>
    );
  }

  // 3. Show loading till first chunk is loaded
  if (isConnecting || !currentWorkflow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-800 font-semibold">Loading Storywave Editor...</p>
          <p className="text-xs text-gray-400">Streaming story details & scenes</p>
        </div>
      </div>
    );
  }

  const allScenes = currentWorkflow.scenes || [];
  const filteredScenes =
    activeRatioFilter === "ALL"
      ? allScenes
      : allScenes.filter((s) => s.ratio === activeRatioFilter);

  const isDual = currentWorkflow.dualPlatform;

  const storyCharacterReferences =
    currentWorkflow?.metadata?.characterReferences ||
    currentWorkflow?.metadata?.uploadedCharacterReferences ||
    currentWorkflow?.characterReferences ||
    [];

  return (
    <div className="min-h-screen pb-32 px-4 sm:px-8 pt-6 sm:pt-10 max-w-7xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/editor"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Storywave Editor</span>
        </Link>
      </div>

      {/* Story Overview Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold border border-amber-200/60">
                Review Required
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                {currentWorkflow.mediaType?.replace("_", " ").toUpperCase()}
              </span>
              {isDual && (
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                  Dual Platform (16:9 & 9:16)
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {currentWorkflow.title || currentWorkflow.storyTitle}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Review and regenerate individual scene visuals. Narration timing and audio track are permanently synchronized.
            </p>
          </div>

          {/* Audio preview player if available */}
          {currentWorkflow.audioUrl && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 shrink-0 w-full lg:w-80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Volume2 size={14} className="text-indigo-600" />
                  Locked Audio Track
                </span>
                <span className="text-gray-400 font-normal">Whisper Synced</span>
              </div>
              <audio src={currentWorkflow.audioUrl} controls className="w-full h-8" />
            </div>
          )}
        </div>

        {/* Dual ratio filter tabs if applicable */}
        {isDual && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 mr-2">Filter Ratio:</span>
            {["ALL", "16:9", "9:16"].map((r) => (
              <button
                key={r}
                onClick={() => setActiveRatioFilter(r)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeRatioFilter === r
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r === "ALL" ? "All Ratios" : r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sequential Scenes List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers size={20} className="text-amber-500" />
            <span>Story Scenes ({filteredScenes.length})</span>
          </h2>
        
        </div>

        {filteredScenes.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white/70 p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Generating Story Scenes...
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                AI visual generation is in progress. Scene visuals and narration text will appear here automatically for review.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                onEditPrompt={(sc) => setSelectedPromptScene(sc)}
                onRegenerate={handleRegenerate}
                onGenerateVideo={(sc) => setSelectedVideoScene(sc)}
                onReplaceFrame={(sc, file) => handleReplaceFrame(sc, file)}
                onOpenVersions={(sc) => setSelectedVersionScene(sc)}
                onViewFullSize={(sc) => setSelectedPreviewScene(sc)}
                characterTalk={currentWorkflow.characterTalk}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <MediaPreviewModal
        isOpen={!!selectedPreviewScene}
        scene={selectedPreviewScene}
        onClose={() => setSelectedPreviewScene(null)}
      />

      <PromptModal
        isOpen={!!selectedPromptScene}
        scene={selectedPromptScene}
        existingReferences={storyCharacterReferences}
        onClose={() => setSelectedPromptScene(null)}
        onSavePromptOnly={handleSavePrompt}
        onRegenerateImage={handleRegenerateWithRef}
        onGenerateVideo={handleGenerateVideo}
      />

      <VideoGenModal
        isOpen={!!selectedVideoScene}
        scene={selectedVideoScene}
        existingReferences={storyCharacterReferences}
        onClose={() => setSelectedVideoScene(null)}
        onGenerateVideo={handleGenerateVideo}
      />

      <VersionModal
        isOpen={!!selectedVersionScene}
        scene={selectedVersionScene}
        onClose={() => setSelectedVersionScene(null)}
        onRevert={handleRevert}
      />

      <MergeConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmMerge}
        workflow={currentWorkflow}
        scenes={allScenes}
        isMerging={isMerging}
      />

      {/* Sticky Bottom Merge Bar */}
      <MergeBar
        scenes={allScenes}
        onMerge={handleOpenMergeModal}
        isMerging={isMerging}
      />
    </div>
  );
};

export default EditorDetailPage;
