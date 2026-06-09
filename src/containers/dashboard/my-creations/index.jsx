import { useEffect, useState, useRef } from "react";
import { BiBook, BiHeadphone, BiTrash, BiVideo, BiX, BiHeart, BiDownload, BiArrowBack, BiImage, BiMicrophone } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCreations } from "../../../redux/slices/creations.slice";
import { deleteStory } from "../../../redux/slices/story.slice";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const MyCreations = () => {
  const dispatch = useDispatch();
  const { stories, status } = useSelector((state) => state.creations);
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [likedCreations, setLikedCreations] = useState({});

  // Audio Player State & Ref
  const audioPlayerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Time formatter helper
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (audioPlayerRef.current) {
      setCurrentTime(audioPlayerRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioPlayerRef.current) {
      setDuration(audioPlayerRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback error:", err));
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!audioPlayerRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioPlayerRef.current.muted = newMuted;
  };

  // Fetch creations on mount
  useEffect(() => {
    dispatch(fetchMyCreations());
  }, [dispatch]);

  // Merge both types
  const creations = [...stories].map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    video: item.video?.url || null,
    thumbnail: item.image || null,
    content: item.content || item.episode?.script || null,
    audio: item.voiceover?.audioURL || item.episode?.audioURL || null,
    duration: item.video?.duration || item.episode?.duration || null,
    createdAt: new Date(item.createdAt).toLocaleDateString(),
  }));

  // Handle delete from grid
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this creation?")) {
      setDeletingId(id);
      try {
        await dispatch(deleteStory(id));
        await dispatch(fetchMyCreations());
        toast.success("Creation deleted successfully");
      } catch (err) {
        console.error("Delete failed", err);
        toast.error("Failed to delete creation");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Handle delete from detail page
  const handleDeleteDetail = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this creation?")) {
      setDeletingId(id);
      try {
        await dispatch(deleteStory(id));
        setSelectedCreation(null); // Go back to grid
        await dispatch(fetchMyCreations());
        toast.success("Creation deleted successfully");
      } catch (err) {
        console.error("Delete failed", err);
        toast.error("Failed to delete creation");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Handle like toggle
  const handleLikeToggle = (id) => {
    setLikedCreations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle download
  const handleDownloadCreation = async (item) => {
    const fileUrl = item.video || item.audio;
    if (fileUrl) {
      try {
        toast.loading("Starting download...", { id: "download" });
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const ext = item.video ? "mp4" : "mp3";
        link.download = `${item.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Download complete!", { id: "download" });
      } catch (err) {
        toast.error("Failed to download file", { id: "download" });
        console.error(err);
      }
    } else {
      toast.error("No media file available to download");
    }
  };

  // Handle next lesson / creation button
  const handleNextCreation = () => {
    const currentIndex = creations.findIndex((c) => c.id === selectedCreation.id);
    if (currentIndex !== -1 && creations.length > 1) {
      const nextIndex = (currentIndex + 1) % creations.length;
      setSelectedCreation(creations[nextIndex]);
    }
  };

  useEffect(() => {
    if (selectedCreation) {
      const updated = creations.find((c) => c.id === selectedCreation.id);
      if (updated) {
        setSelectedCreation(updated);
      } else {
        setSelectedCreation(null);
      }
    }
  }, [stories]);

  // Reset audio when selected creation changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.load();
    }
  }, [selectedCreation]);

  // If a creation is active, display the premium details page
  if (selectedCreation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-screen pb-12"
      >
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCreation(null)}
            className="flex items-center gap-2 text-[#265073] hover:text-[#FF7A45] font-bold text-lg transition-colors cursor-pointer"
          >
            <BiArrowBack className="w-5 h-5" /> Back
          </motion.button>

          {creations.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05, x: 3 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextCreation}
              className="text-[#265073] hover:text-[#FF7A45] font-bold text-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              Go to next creation <span className="font-normal">➔</span>
            </motion.button>
          )}
        </div>
        {/* Media Grid matching user screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-[1.38fr_1fr_1.38fr] gap-6 mb-8 items-start">
          {/* Column 1 (Left): Video 16:9 & Cover 16:9 */}
          <div className="flex flex-col gap-6">
            {/* Landscape Video Player */}
            <div className="relative aspect-video max-h-[280px] w-full bg-black rounded-[24px] overflow-hidden shadow-md border border-gray-100
             flex flex-col justify-between">
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <BiVideo className="w-3.5 h-3.5" /> Video 16:9
              </span>
              {selectedCreation.video ? (
                <video
                  key={`landscape-${selectedCreation.video}`}
                  src={selectedCreation.video}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FCFDF9] to-[#F0F2F9] flex flex-col items-center justify-center p-6 text-center">
                  <BiVideo className="w-10 h-10 text-[#265073]/30 mb-3" />
                  <span className="text-xs text-[#265073] font-bold px-4 leading-relaxed">
                    No videos are currently available for this series.
                  </span>
                </div>
              )}
            </div>

            {/* Cover 16:9 Card */}
            <div className="relative aspect-video max-h-[300px] w-full rounded-[24px] overflow-hidden shadow-md border border-gray-100 flex flex-col justify-between">
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <BiImage className="w-3.5 h-3.5" /> Cover 16:9
              </span>
              {selectedCreation.thumbnail ? (
                <img
                  src={selectedCreation.thumbnail}
                  alt="Cover 16:9"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#FF7A45] via-[#f5876c] to-[#f8be4c] flex flex-col items-center justify-center text-white">
                  <BiImage className="w-10 h-10 mb-2" />
                  <span className="text-xs font-bold">No Cover Generated</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2 (Middle): Portrait Video 9:16 */}
          <div className="w-full">
            <div className="relative aspect-[9/16] max-h-[600px] w-full bg-black rounded-[24px] overflow-hidden shadow-md border border-gray-100 flex flex-col justify-between">
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <BiVideo className="w-3.5 h-3.5" /> Video 9:16
              </span>
              {selectedCreation.video ? (
                <video
                  key={`portrait-${selectedCreation.video}`}
                  src={selectedCreation.video}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#FCFDF9] to-[#F0F2F9] flex flex-col items-center justify-center p-6 text-center">
                  <BiVideo className="w-10 h-10 text-[#265073]/30 mb-3" />
                  <span className="text-xs text-[#265073] font-bold px-4 leading-relaxed">
                    No videos are currently available for this series.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Column 3 (Right): Cover 1:1 & Audio Player */}
          <div className="flex flex-col gap-6">
            {/* Cover 1:1 Card */}
            <div className="relative aspect-square max-h-[280px] w-full rounded-[24px] overflow-hidden shadow-md border border-gray-100 flex flex-col justify-between">
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <BiImage className="w-3.5 h-3.5" /> Cover 1:1
              </span>
              {selectedCreation.thumbnail ? (
                <img
                  src={selectedCreation.thumbnail}
                  alt="Cover 1:1"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#265073] via-[#8b5cf6] to-[#ec4899] flex flex-col items-center justify-center text-white">
                  <BiImage className="w-10 h-10 mb-2" />
                  <span className="text-xs font-bold">No Cover Generated</span>
                </div>
              )}
            </div>

            {/* Audio Player Card */}
            <div className="bg-gradient-to-b from-[#f3f5fc] to-[#e4e9f7] rounded-[24px] p-5 border border-purple-100/50 shadow-md flex flex-col justify-between min-h-[160px] relative overflow-hidden">
              {/* HTML5 Hidden Audio */}
              {selectedCreation.audio && (
                <audio
                  ref={audioPlayerRef}
                  src={selectedCreation.audio}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                  className="hidden"
                  preload="metadata"
                />
              )}

              <span className="absolute top-3 left-3 bg-white/85 backdrop-blur-sm border border-gray-200 text-[#265073] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                <BiHeadphone className="w-3.5 h-3.5 text-[#265073]" /> Audio
              </span>

              {/* Dynamic Wave Ripple Visualizer */}
              <div className="flex-1 flex flex-col items-center justify-center py-2 mt-4 relative">
                {isPlaying && (
                  <>
                    <div className="absolute w-16 h-16 bg-[#8b5cf6]/10 rounded-full animate-ping duration-1000" />
                    <div className="absolute w-12 h-12 bg-[#8b5cf6]/20 rounded-full animate-pulse duration-700" />
                  </>
                )}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-300 z-10 ${isPlaying
                    ? "bg-gradient-to-tr from-[#8b5cf6] to-[#a78bfa] text-white scale-105 shadow-[#8b5cf6]/20"
                    : "bg-white text-[#8b5cf6] border border-purple-100"
                  }`}>
                  <BiMicrophone className={`w-5 h-5 ${isPlaying ? "animate-bounce" : ""}`} />
                </div>
              </div>

              {/* Custom Controller Bar */}
              <div className="w-full mt-2">
                {selectedCreation.audio ? (
                  <div className="flex flex-col gap-1.5">
                    {/* Time & seek bar */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlayPause}
                        className="w-7 h-7 rounded-full bg-[#265073] hover:bg-[#FF7A45] text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex-shrink-0"
                      >
                        {isPlaying ? (
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      {/* Scrub range */}
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-gray-250 rounded-lg appearance-none cursor-pointer accent-[#265073] focus:outline-none"
                        style={{
                          background: `linear-gradient(to right, #265073 0%, #265073 ${(currentTime / (duration || 1)) * 100}%, #e2e8f0 ${(currentTime / (duration || 1)) * 100}%, #e2e8f0 100%)`
                        }}
                      />
                    </div>

                    {/* Time duration indicator & Mute */}
                    <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold px-0.5">
                      <span className="font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>

                      <button
                        onClick={toggleMute}
                        className="text-[#265073] hover:text-[#FF7A45] transition-colors p-0.5 cursor-pointer"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.03c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L9 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs text-gray-400 font-semibold italic">
                    No audio voiceover available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (col-span-2) - Details, Script */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info and action bar */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#265073] leading-tight">
                    {selectedCreation.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    A creation by <span className="text-[#FF7A45] font-bold">{Cookies.get("fullName") || "Storywave Creator"}</span> • Type: <span className="font-bold text-gray-700">{selectedCreation.type}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLikeToggle(selectedCreation.id)}
                    className={`p-3 rounded-full border transition-all duration-200 cursor-pointer ${likedCreations[selectedCreation.id]
                        ? "bg-rose-50 border-rose-200 text-rose-500 shadow-md"
                        : "bg-white border-gray-200 text-gray-450 hover:text-gray-600 hover:border-gray-300"
                      }`}
                    title="Like Creation"
                  >
                    <BiHeart className={`w-6 h-6 ${likedCreations[selectedCreation.id] ? "fill-current animate-pulse" : ""}`} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDownloadCreation(selectedCreation)}
                    className="p-3 rounded-full border bg-white border-gray-200 text-gray-450 hover:text-[#265073] hover:border-[#265073] hover:shadow-md transition-all duration-200 cursor-pointer"
                    title="Download Media"
                  >
                    <BiDownload className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDeleteDetail(e, selectedCreation.id)}
                    disabled={deletingId === selectedCreation.id}
                    className="p-3 rounded-full border bg-white border-gray-200 text-gray-450 hover:text-red-500 hover:border-red-200 hover:bg-red-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                    title="Delete Creation"
                  >
                    {deletingId === selectedCreation.id ? (
                      <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <BiTrash className="w-6 h-6" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Script Box */}
            {selectedCreation.content && (
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <div className="bg-[#265073]/10 p-2.5 rounded-2xl text-[#265073]">
                    <BiBook className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#265073] text-lg">Story Script</h3>
                </div>
                <div className="text-gray-755 text-base leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto pr-3 thin-scrollbar Montserrat font-medium">
                  {selectedCreation.content}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (col-span-1) - More Creations */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200 flex flex-col max-h-[622px]">
              <h3 className="font-bold text-[#265073] text-lg mb-4 flex items-center justify-between">
                <span>More Creations</span>
                <span className="text-xs px-2.5 py-1 bg-gray-150 text-gray-605 rounded-full font-bold">
                  {creations.filter(c => c.id !== selectedCreation.id).length} available
                </span>
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 thin-scrollbar">
                {creations
                  .filter((c) => c.id !== selectedCreation.id)
                  .map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 10px 15px -3px rgba(38, 80, 115, 0.05)",
                        backgroundColor: "#fafafa"
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCreation(item)}
                      className="w-full flex gap-3 text-left p-3 rounded-2xl border border-gray-150 hover:border-gray-250 transition-all duration-200 cursor-pointer"
                    >
                      <div className="w-16 h-12 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                        {item.video ? (
                          <video src={item.video} className="w-full h-full object-cover pointer-events-none" muted />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                            {item.audio ? (
                              <BiHeadphone className="w-6 h-6 text-gray-400" />
                            ) : (
                              <BiBook className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[9px] text-[#FF7A45] font-extrabold uppercase mt-1">
                          {item.type}
                        </p>
                        <p className="text-[9px] text-gray-450 mt-0.5">
                          {item.createdAt}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                {creations.filter((c) => c.id !== selectedCreation.id).length === 0 && (
                  <p className="text-gray-405 text-center text-sm py-8">No other creations available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Creations Grid View (Default view)
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#265073] mb-2">My Creations</h1>
        <p className="text-gray-650 text-xl font-medium">
          Explore your stories and podcasts in an immersive experience
        </p>
      </div>

      {/* Loading / Empty States */}
      {status === "loading" && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#265073]/30 border-t-[#265073] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your creations...</p>
          </div>
        </div>
      )}

      {status !== "loading" && creations.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center min-h-96">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-3xl font-semibold text-[#265073] mb-2">
            No creations yet
          </p>
          <p className="text-gray-650 text-lg">
            Start generating stories or podcasts and they will appear here.
          </p>
        </div>
      )}

      {/* Grid of Creations */}
      {status !== "loading" && creations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creations.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 20px 25px -5px rgba(38, 80, 115, 0.08), 0 10px 10px -5px rgba(255, 122, 69, 0.05)",
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer border border-gray-200 transition-all duration-300"
              onClick={() => setSelectedCreation(item)}
            >
              {/* Image/Video Thumbnail */}
              <div className="relative h-64 overflow-hidden bg-gray-100 ">
                {item.video ? (
                  <video
                    src={item.video}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 animate-fadeIn"
                    muted
                    loop
                    autoPlay
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FCFDF9] to-[#F0F2F9] flex items-center justify-center p-4">
                    <div className="text-center">
                      {item.audio ? (
                        <BiHeadphone className="w-14 h-14 text-[#FF7A45] mx-auto mb-3 animate-pulse" />
                      ) : (
                        <BiVideo className="w-14 h-14 text-[#FF7A45] mx-auto mb-3" />
                      )}
                      <p className="text-[#265073] text-xs font-bold leading-relaxed px-2">
                        No videos are currently available for this series.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="text-xl font-bold text-[#265073] mb-3 line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-500">
                    {item.type} • {item.createdAt}
                  </p>
                  <div className="flex gap-3 items-center">
                    {item.video && (
                      <BiVideo className="w-5 h-5 text-[#265073]" />
                    )}
                    {item.audio && (
                      <BiHeadphone className="w-5 h-5 text-[#265073]" />
                    )}
                    {item.content && (
                      <BiBook className="w-5 h-5 text-[#265073]" />
                    )}
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="relative cursor-pointer hover:scale-110 transition-transform"
                    >
                      {deletingId === item.id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <BiTrash className="w-5 h-5 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCreations;
