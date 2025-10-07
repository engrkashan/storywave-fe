import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const VoiceCloning = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [clonedVoices, setClonedVoices] = useState([]);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Fetch user's cloned voices
  useEffect(() => {
    const fetchClones = async () => {
      const userId = Cookies.get("userId");
      if (!userId) return;
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5002"
          }/api/voice-clone/${userId}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setClonedVoices(data.voices || []);
      } catch (err) {
        console.error("Failed to load voices:", err);
      }
    };
    fetchClones();
  }, []);

  // Recording Handler
  const handleRecordToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Recording stopped");
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
          const url = URL.createObjectURL(blob);
          setAudioURL(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setStatus("Recording...");
      } catch (err) {
        console.error("Mic access denied:", err);
        toast.error("Microphone access denied.");
      }
    }
  };

  // Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Please upload a valid audio file.");
      return;
    }
    setAudioBlob(file);
    setAudioURL(URL.createObjectURL(file));
    setStatus("Voice sample uploaded");
  };

  // Clone Voice
  const handleCloneVoice = async () => {
    if (!audioBlob) {
      toast.error("Please record or upload a voice sample first.");
      return;
    }

    setLoading(true);
    setStatus("Cloning in progress...");

    try {
      const formData = new FormData();
      formData.append("voice_sample", audioBlob);
      formData.append("userId", Cookies.get("userId") || "unknown");

      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5002"
        }/api/voice-clone`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Voice cloning failed");
      const data = await res.json();

      toast.success("Voice cloned successfully!");
      setStatus("Clone complete");
      setClonedVoices((prev) => [...prev, data.voice]); // Add new one dynamically
    } catch (err) {
      console.error(err);
      toast.error("Failed to clone voice");
      setStatus("Error during cloning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex h-screen">
        {/* Left Panel */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto thin-scrollbar shadow-lg">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Voice Cloning Studio
            </h1>
            <p className="text-gray-600 mb-8">
              Record or upload your voice to clone it with AI precision.
            </p>

            <div className="space-y-6">
              {/* Recorder Controls */}
              <div className="text-center">
                <button
                  onClick={handleRecordToggle}
                  className={`px-8 py-4 rounded-full font-semibold text-white text-lg transition-all duration-300 
                    ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 shadow-lg"
                        : "bg-gradient-to-r from-amber-400 to-pink-500 hover:scale-[1.03] shadow-xl"
                    }`}
                >
                  {isRecording ? "Stop Recording" : "🎙️ Start Recording"}
                </button>
                <p className="text-gray-500 text-sm mt-2">{status}</p>
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
                  className="block w-full border border-gray-300 rounded-xl p-3 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Preview Audio */}
              {audioURL && (
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Recorded / Uploaded Audio
                  </label>
                  <audio
                    controls
                    src={audioURL}
                    className="w-full rounded-xl shadow-sm"
                  />
                </div>
              )}

              {/* Clone Button */}
              <button
                onClick={handleCloneVoice}
                disabled={loading || !audioBlob}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 
                  ${
                    loading || !audioBlob
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  }`}
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
        </div>

        {/* Right Panel */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto thin-scrollbar">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Clone Preview
            </h2>
            <p className="text-gray-600 mb-8">
              Track your voice cloning progress and listen to previous clones.
            </p>

            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center transition-all">
              {loading ? (
                <div className="animate-pulse">
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Cloning Your Voice
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Please wait while we process your voice sample...
                  </p>
                </div>
              ) : audioURL ? (
                <>
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19l12-3M9 19H3M3 19V6m0 0l12-3"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Voice Ready
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Play your latest voice sample below.
                  </p>
                  <audio
                    controls
                    src={audioURL}
                    className="w-full rounded-lg shadow-md"
                  />
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19l12-3M9 19H3M3 19V6m0 0l12-3"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Voice Yet
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Record or upload your voice to start cloning.
                  </p>
                </>
              )}
            </div>

            {/* Cloned Voices List */}
            {clonedVoices.length > 0 && (
              <div className="mt-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  My Cloned Voices
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clonedVoices.map((v, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-xl shadow-md border border-gray-200"
                    >
                      <p className="font-medium text-gray-800 mb-2">
                        {v.name || `Voice ${i + 1}`}
                      </p>
                      <audio
                        controls
                        src={v.url}
                        className="w-full rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCloning;
