import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchEditorWorkflows } from "../../../redux/slices/editor.slice";
import {
  Film,
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const EditorCardSkeleton = () => (
  <div className="rounded-3xl border border-gray-200/80 bg-white shadow-xs overflow-hidden flex flex-col animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="w-3/4 h-5 rounded-md bg-gray-200" />
      <div className="w-1/2 h-3 rounded-md bg-gray-100" />
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="w-20 h-4 rounded bg-gray-100" />
        <div className="w-24 h-8 rounded-xl bg-gray-200" />
      </div>
    </div>
  </div>
);

const EditorListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workflows, listLoading, totalWorkflows } = useSelector((s) => s.editor);

  useEffect(() => {
    dispatch(fetchEditorWorkflows({ page: 1, limit: 30 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchEditorWorkflows({ page: 1, limit: 30 }));
  };

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-8 pt-6 sm:pt-10 max-w-7xl mx-auto space-y-8 relative">
      {/* Top Global Loading Bar */}
      {listLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 shadow-xs">
          <div className="h-full w-full bg-white/40 animate-pulse" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
              <Film size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Storywave Editor
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Review and refine generated scene visuals before final video assembly.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={listLoading}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold shadow-sm hover:shadow flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw size={15} className={listLoading ? "animate-spin" : ""} />
          <span>{listLoading ? "Loading..." : "Refresh"}</span>
        </button>
      </div>

      {/* Content */}
      {listLoading && workflows.length === 0 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 w-fit">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Fetching review stories...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EditorCardSkeleton />
            <EditorCardSkeleton />
            <EditorCardSkeleton />
          </div>
        </div>
      ) : workflows.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white/60 p-12 text-center max-w-xl mx-auto space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Film size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              No stories awaiting review
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Stories will appear here when scene generation is complete, giving you full control to inspect, edit prompts, and regenerate scenes before final merge.
            </p>
          </div>
          <Link
            to="/dashboard/generate-story"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#f8be4c] to-[#f0498f] text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            <Sparkles size={16} />
            <span>Generate New Story</span>
          </Link>
        </div>
      ) : (
        /* Grid of stories awaiting review */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((wf) => {
            const thumbnail = wf.coverArtUrl || wf.firstSceneAsset || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";

            return (
              <div
                key={wf.id}
                className="group relative rounded-3xl border border-gray-200/80 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1 hover:border-amber-300"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-black/95 overflow-hidden">
                  <img
                    src={thumbnail}
                    alt={wf.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 animate-pulse">
                      <Edit3 size={12} />
                      Review Required
                    </span>
                  </div>

                  {/* Dual Platform Badge */}
                  {wf.dualPlatform && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/75 text-white text-[11px] font-semibold backdrop-blur-md">
                        Dual Ratio (16:9 & 9:16)
                      </span>
                    </div>
                  )}

                  {/* Scene Count */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 text-white text-xs font-semibold backdrop-blur-md">
                    <Layers size={13} />
                    <span>{wf.sceneCount} Scenes</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {wf.title || "Untitled Story"}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(wf.createdAt), { addSuffix: true })}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{wf.mediaType?.replace("_", " ")}</span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <Link
                    to={`/dashboard/editor/${wf.id}`}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]"
                  >
                    <span>Open Editor</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EditorListPage;
