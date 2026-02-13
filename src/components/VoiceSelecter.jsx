import { useState, useEffect } from "react";
import OpenAI from "openai";

// OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const VoiceSelector = ({ value, onChange }) => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [fishVoices, setFishVoices] = useState([]);

  // Static OpenAI voices
  const openaiVoices = [
    { id: "marin", label: "Marin", provider: "openai" },
    { id: "cedar", label: "Cedar", provider: "openai" },
    { id: "verse", label: "Verse", provider: "openai" },
    { id: "ballad", label: "Ballad", provider: "openai" },
    { id: "alloy", label: "Alloy", provider: "openai" },
    { id: "ash", label: "Ash", provider: "openai" },
    { id: "coral", label: "Coral", provider: "openai" },
    { id: "echo", label: "Echo", provider: "openai" },
    { id: "fable", label: "Fable", provider: "openai" },
    { id: "nova", label: "Nova", provider: "openai" },
    { id: "onyx", label: "Onyx", provider: "openai" },
    { id: "sage", label: "Sage", provider: "openai" },
    { id: "shimmer", label: "Shimmer", provider: "openai" },
  ];

  // Fetch Fish Audio voices from backend
  useEffect(() => {
    const fetchFishVoices = async () => {
      setLoadingVoice(true);

      try {
        // Call backend API instead of Fish Audio SDK directly
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/voice/fish-voices`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const voices = data.voices || [];

        setFishVoices(voices);
      } catch (err) {
        console.error("Failed to fetch Fish voices:", err);
        // Fallback: use empty array if API fails
        setFishVoices([]);
      } finally {
        setLoadingVoice(false);
      }
    };

    fetchFishVoices();
  }, []);

  const allVoices = [...openaiVoices, ...fishVoices];

  // Generate voice preview
  useEffect(() => {
    if (!value) {
      setAudioSrc(null);
      return;
    }

    let currentUrl = null;

    const generatePreview = async () => {
      setLoadingVoice(true);
      const sampleText =
        "Once upon a time, in a quiet forest, a clever fox met a wise old owl.";

      try {
        if (value.provider === "openai") {
          const response = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: value.id,
            input: sampleText,
            instructions: "Preview in natural storytelling tone.",
            response_format: "wav",
          });

          // Convert response → Blob
          const arrayBuffer = await response.arrayBuffer();
          const audioBlob = new Blob([arrayBuffer], { type: "audio/wav" });

          // Create URL for audio tag
          currentUrl = URL.createObjectURL(audioBlob);
          setAudioSrc(currentUrl);
        } else if (value.provider === "fish") {
          // -------- Fish Audio Preview via Backend -------- //

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/voice/preview`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: sampleText,
                voiceId: value.id,
                provider: "fish",
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }


          // Convert response to Blob
          const arrayBuffer = await response.arrayBuffer();
          const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });

          currentUrl = URL.createObjectURL(audioBlob);
          setAudioSrc(currentUrl);

        }
      } catch (err) {
        console.error("❌ Preview generation error:", err);
        console.error("Error details:", {
          provider: value.provider,
          voiceId: value.id,
          voiceLabel: value.label,
          error: err.message,
        });
        alert(`Failed to generate preview: ${err.message}`);
      } finally {
        setLoadingVoice(false);
      }
    };

    generatePreview();

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [value]);

  return (
    <div className="flex flex-col space-y-3">

      <select
        value={value?.id || ""}
        onChange={(e) => {
          const selected = allVoices.find((v) => v.id === e.target.value);
          onChange(selected);
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
      >
        <option value="">Select voice...</option>

        <optgroup label="OpenAI Voices">
          {openaiVoices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </optgroup>

        <optgroup label="Fish Voices">
          {fishVoices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </optgroup>
      </select>

      {loadingVoice ? (
        <div className="w-full px-4 py-2 bg-gray-200 rounded-lg text-center">
          Loading preview...
        </div>
      ) : (
        audioSrc && <audio controls src={audioSrc} className="w-full" />
      )}

    </div>
  );
};

export default VoiceSelector;
