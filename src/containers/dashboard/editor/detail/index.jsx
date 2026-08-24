import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  fetchEditorWorkflowDetail,
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

  // Polling ref
  const pollingRef = useRef(null);

  // Initial load & reset stale merge state on entry/exit
  useEffect(() => {
    dispatch(resetMergeState());
    if (workflowId) {
      dispatch(fetchEditorWorkflowDetail(workflowId));
    }
    return () => {
      dispatch(resetMergeState());
    };
  }, [dispatch, workflowId]);

  // Polling setup: check if workflow is still generating or any scene is in REGENERATING state
  useEffect(() => {
    const isGeneratingOrRegenerating =
      currentWorkflow?.status === "PENDING" ||
      currentWorkflow?.status === "PROCESSING" ||
      currentWorkflow?.scenes?.some((s) => s.status === "REGENERATING");

    if (isGeneratingOrRegenerating) {
      if (!pollingRef.current) {
        pollingRef.current = setInterval(() => {
          if (workflowId) {
            dispatch(fetchEditorWorkflowDetail(workflowId));
          }
        }, 3000);
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [currentWorkflow, dispatch, workflowId]);

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
        charRefPayload = uploadRes.characterReference;
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
        charRefPayload = uploadRes.characterReference;
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

  if (detailLoading && !currentWorkflow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading Storywave Editor...</p>
      </div>
    );
  }

  if (!currentWorkflow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle size={40} className="text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">Story not found or not in review state</h2>
        <Link
          to="/dashboard/editor"
          className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          Back to Editor
        </Link>
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
