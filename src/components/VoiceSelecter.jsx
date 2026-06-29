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

  const [elevenLabsVoices, setElevenLabsVoices] = useState([]);

  // Fetch Fish Audio and ElevenLabs voices
  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoice(true);

      try {
        const [fishRes, elevenRes] = await Promise.allSettled([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/voice/fish-voices`, { cache: 'no-store' }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/voice/elevenlabs-voices`, { cache: 'no-store' })
        ]);

        if (fishRes.status === "fulfilled" && fishRes.value.ok) {
          const fishData = await fishRes.value.json();
          setFishVoices(fishData.voices || []);
        } else {
          setFishVoices([]);
        }

        if (elevenRes.status === "fulfilled" && elevenRes.value.ok) {
          const elevenData = await elevenRes.value.json();
          setElevenLabsVoices(elevenData.voices || []);
        } else {
          setElevenLabsVoices([]);
        }

      } catch (err) {
        console.error("Failed to fetch voices:", err);
      } finally {
        setLoadingVoice(false);
      }
    };

    fetchVoices();
  }, []);

  const allVoices = [...openaiVoices, ...fishVoices, ...elevenLabsVoices];

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
          // Validate the voice ID against OpenAI's supported list to prevent 400 errors
          const validOpenAIVoices = new Set(["alloy", "ash", "ballad", "cedar", "coral", "echo", "fable", "marin", "nova", "onyx", "sage", "shimmer", "verse"]);
          const safeVoiceId = validOpenAIVoices.has(value.id) ? value.id : "onyx";

          if (!validOpenAIVoices.has(value.id)) {
            console.warn(`[OpenAI Preview] Unsupported voice ID '${value.id}', falling back to 'onyx'.`);
          }

          const response = await openai.audio.speech.create({
            model: "tts-1", // Use the correct model for OpenAI TTS
            voice: safeVoiceId,
            input: sampleText,
            response_format: "wav",
          });

          // Convert response → Blob
          const arrayBuffer = await response.arrayBuffer();
          const audioBlob = new Blob([arrayBuffer], { type: "audio/wav" });

          // Create URL for audio tag
          currentUrl = URL.createObjectURL(audioBlob);
          setAudioSrc(currentUrl);
        } else if (value.provider === "fish" || value.provider === "elevenlabs") {
          // -------- Preview via Backend -------- //

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
                provider: value.provider,
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

  const [selectedModel, setSelectedModel] = useState("");

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);

    if (value && value.provider !== newModel) {
      onChange(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <select
        value={selectedModel}
        onChange={handleModelChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
      >
        <option value="" disabled>Select Model...</option>
        <option value="elevenlabs">Eleven Labs</option>
        <option value="openai">OpenAI</option>
        <option value="fish">Fish Audio</option>
      </select>

      <select
        value={value?.id || ""}
        onChange={(e) => {
          const selected = allVoices.find((v) => v.id === e.target.value);
          onChange(selected);
        }}
        disabled={!selectedModel}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Select voice...</option>

        {selectedModel === "openai" && (
          <optgroup label="OpenAI Voices">
            {openaiVoices.map((v) => (
              <option key={`openai-${v.id}`} value={v.id}>
                {v.label}
              </option>
            ))}
          </optgroup>
        )}

        {selectedModel === "fish" && (
          <optgroup label="Fish Voices">
            {fishVoices.map((v) => (
              <option key={`fish-${v.id}`} value={v.id}>
                {v.label}
              </option>
            ))}
          </optgroup>
        )}

        {selectedModel === "elevenlabs" && (
          <optgroup label="Eleven Labs Voices">
            {elevenLabsVoices.map((v) => (
              <option key={`elevenlabs-${v.id}`} value={v.id}>
                {v.label}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {loadingVoice ? (
        <div className="w-full px-4 py-2 bg-gray-200 rounded-lg text-center col-span-2">
          Loading preview...
        </div>
      ) : (
        audioSrc && <audio controls src={audioSrc} className="col-span-2" />
      )}

    </div>
  );
};

export default VoiceSelector;
