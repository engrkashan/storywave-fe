import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  cloneVoice,
  getClonedVoices,
} from "../../../redux/slices/voice.clone.slice";

const VoiceCloning = () => {
  const dispatch = useDispatch();
  const { clones } = useSelector((state) => state.voiceClone);

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("Idle");
  const [cloneText, setCloneText] = useState(
    "Hello! This is my cloned voice speaking."
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Fetch cloned voices on mount
  useEffect(() => {
    dispatch(getClonedVoices()).unwrap();
  }, [dispatch]);

  // Recording logic
  const handleRecordToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatusText("Recording stopped");
      setError(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          setAudioURL(URL.createObjectURL(blob));
        };

        mediaRecorder.start();
        setIsRecording(true);
        setStatusText("Recording...");
        setError(null);
      } catch (err) {
        console.error("Mic access denied:", err);
        toast.error("Microphone access denied");
        setError(
          "Microphone access denied. Please allow microphone permissions."
        );
      }
    }
  };

  // Handle audio upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Please upload a valid audio file");
      setError("Invalid file type. Please upload an audio file.");
      return;
    }
    setAudioBlob(file);
    setAudioURL(URL.createObjectURL(file));
    setStatusText("Voice sample uploaded");
    setError(null);
  };

  // Handle cloning
  const handleCloneVoice = async () => {
    if (!audioBlob) {
      toast.error("Please record or upload a voice sample first");
      setError(
        "No voice sample provided. Please record or upload an audio file."
      );
      return;
    }
    if (!cloneText.trim()) {
      toast.error("Please enter text for the voice clone to speak");
      setError(
        "Text input is empty. Please provide text for the cloned voice."
      );
      return;
    }

    setLoading(true);
    setStatusText("Cloning in progress...");
    setError(null);

    try {
      await dispatch(cloneVoice({ file: audioBlob, text: cloneText })).unwrap();
      toast.success("Voice cloned successfully!");
      setStatusText("Clone complete");
      dispatch(getClonedVoices());
    } catch (err) {
      console.error("Voice cloning error:", err);
      toast.error(err?.message || "Failed to clone voice");
      setStatusText("Error during cloning");
      setError(err?.message || "An error occurred during voice cloning.");
    } finally {
      setLoading(false);
    }
  };

  // Filter cloned voices based on search query
  const filteredClones = clones?.filter((v) =>
    (v.voice || `Voice Clone #${clones.indexOf(v) + 1}`)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col lg:flex-row">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 bg-white border-r border-gray-200 overflow-y-auto shadow-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Voice Cloning Studio
        </h1>
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          Record or upload your voice to create an AI-powered clone.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Recorder Controls */}
          <div className="text-center">
            <button
              onClick={handleRecordToggle}
              className={`px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold text-white text-base md:text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 shadow-lg"
                    : "bg-gradient-to-r from-amber-400 to-pink-500 hover:scale-[1.03] shadow-xl"
                }`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? "Stop Recording" : "🎙️ Start Recording"}
            </button>
            <p className="text-gray-500 text-sm mt-3" aria-live="polite">
              {statusText}
            </p>
          </div>

          {/* Upload Section */}
          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Or Upload a Voice Sample
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="block w-full border border-gray-300 rounded-xl p-3 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              aria-describedby="upload-help"
            />
            <p id="upload-help" className="text-xs text-gray-500 mt-1">
              Upload an audio file (MP3, WAV, etc.) for cloning.
            </p>
          </div>

          {/* Audio Preview */}
          {audioURL && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Preview Audio
              </label>
              <audio
                controls
                src={audioURL}
                className="w-full rounded-xl shadow-sm"
                aria-label="Preview recorded or uploaded audio"
              />
            </div>
          )}

          {/* Text Input for Voice Generation */}
          <div className="mt-6">
            <label
              htmlFor="clone-text"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Text for Cloned Voice
            </label>
            <textarea
              id="clone-text"
              value={cloneText}
              onChange={(e) => setCloneText(e.target.value)}
              placeholder="Type what you want your cloned voice to say..."
              className="w-full border border-gray-300 rounded-xl p-3 h-24 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              aria-describedby="text-help"
            />
            <p id="text-help" className="text-xs text-gray-500 mt-1">
              Enter the text for your cloned voice to speak (max 500
              characters).
            </p>
          </div>

          {/* Clone Button */}
          <button
            onClick={handleCloneVoice}
            disabled={loading || !audioBlob}
            className={`w-full py-3 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${
                loading || !audioBlob
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl"
              }`}
            aria-label="Clone voice"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Cloning...</span>
              </div>
            ) : (
              "Clone My Voice"
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 bg-gray-50 overflow-y-auto p-6 md:p-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Cloned Voices
          </h2>
          {clones?.length > 0 && (
            <button
              onClick={() =>
                clones.forEach((v) => new Audio(v.audioURL).play())
              }
              className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
              aria-label="Play all cloned voices"
            >
              Play All
            </button>
          )}
        </div>
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          Listen to your previously cloned voices or search to find specific
          ones.
        </p>

        {/* Search Input */}
        {clones?.length > 0 && (
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cloned voices..."
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              aria-label="Search cloned voices"
            />
          </div>
        )}

        {filteredClones?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClones.map((v, i) => (
              <div
                key={v.id || i}
                className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-900 truncate">
                    {v.voice || `Voice Clone #${i + 1}`}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(v.createdAt).toLocaleString()}
                  </span>
                </div>
                <audio
                  controls
                  src={v.audioURL}
                  className="w-full rounded-md"
                  aria-label={`Play voice clone ${i + 1}`}
                />
                <p className="text-sm text-gray-600 mt-2 truncate">
                  {v.text || "No text provided"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">
            {searchQuery
              ? "No matching cloned voices found."
              : "No cloned voices yet."}
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceCloning;
