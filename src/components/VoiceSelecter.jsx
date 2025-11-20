import { useState, useEffect } from "react";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

const VoiceSelector = ({ value, onChange }) => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [loadingVoice, setLoadingVoice] = useState(false);

  const voices = [
    "alloy", "ash", "coral", "echo", "fable", 
    "nova", "onyx", "sage", "shimmer"
  ];

  useEffect(() => {
    if (!value) {
      setAudioSrc(null);
      return;
    }

    let currentUrl = null;

    const generatePreview = async () => {
      setLoadingVoice(true);
      const sampleText = "Once upon a time, in a quiet forest, a clever fox met a wise old owl. \"Teach me your secrets,\" said the fox. The owl replied, \"Patience is the key to wisdom.\" They laughed together under the stars.";

      try {
        const response = await openai.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: value,
          input: sampleText,
          response_format: "wav",
        });

        const blob = await response.blob();
        currentUrl = URL.createObjectURL(blob);
        setAudioSrc(currentUrl);
      } catch (err) {
        console.error(err);
        alert("Failed to generate voice preview. Check console for details.");
      } finally {
        setLoadingVoice(false);
      }
    };

    generatePreview();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [value]);

  return (
    <div className="flex flex-col space-y-3">
      {loadingVoice ? (
        <div className="w-full px-4 py-2 bg-gray-200 rounded-lg text-center">
          Loading preview...
        </div>
      ) : (
        audioSrc && <audio controls src={audioSrc} className="w-full" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
      >
        <option value="">Select voice...</option>
        {voices.map((voice) => (
          <option key={voice} value={voice}>
            {voice.charAt(0).toUpperCase() + voice.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceSelector;