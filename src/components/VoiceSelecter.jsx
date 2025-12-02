import { useState, useEffect } from "react";
import OpenAI from "openai";

// OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const HUME_API_URL = "https://api.hume.ai/v0/tts/voices";

const VoiceSelector = ({ value, onChange }) => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [humeVoices, setHumeVoices] = useState([]);

  // Static OpenAI voices
  const openaiVoices = [
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

  // Fetch Hume voices
  useEffect(() => {
    const fetchHumeVoices = async () => {
      setLoadingVoice(true);
      let all = [];
      let page = 0;
      const pageSize = 100;
      let totalPages = 1;

      try {
        while (page < totalPages) {
          const res = await fetch(
            `${HUME_API_URL}?provider=HUME_AI&page_number=${page}&page_size=${pageSize}`,
            {
              headers: {
                "X-Hume-Api-Key": import.meta.env.VITE_HUME_API_KEY,
              },
            }
          );

          if (!res.ok) throw new Error("Error fetching voices");

          const data = await res.json();
          const thisPage = data.voices_page || data.voices;
          if (thisPage) all = all.concat(thisPage);

          totalPages = data.total_pages || 1;
          page += 1;
        }

        const filtered = [];
        const allowedAccents = ["American", "Black American", "Latin American"];

        for (const voice of all) {
          const accents = voice.tags?.ACCENT || voice.labels?.ACCENT; // this is an array
          if (Array.isArray(accents) && accents.some(a => allowedAccents.includes(a))) {
            filtered.push({
              id: voice.id,
              label: voice.name,
              provider: "hume",
              accent: accents.join(", "), // optional: join array into string for display
            });
          }
        }
        setHumeVoices(filtered);
      } catch (err) {
        console.error("Failed to fetch Hume voices:", err);
      } finally {
        setLoadingVoice(false);
      }
    };

    fetchHumeVoices();
  }, []);

  const allVoices = [...openaiVoices, ...humeVoices];

  // Generate voice preview
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
        let audioBlob;

        if (value.provider === "openai") {

          const response = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: value.id,
            input: sampleText,
            response_format: "wav",
          });
          audioBlob = await response.blob();
        } else {
          const response = await fetch("https://api.hume.ai/v0/tts", {
            method: "POST",
            headers: {
              "X-Hume-Api-Key": import.meta.env.VITE_HUME_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              utterances: [
                {
                  text: sampleText,
                  voice: {
                    id: value.id,    // ✔️ correct location
                  },
                },
              ],
              format: {
                type: "mp3",
              },
              num_generations: 1,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Hume API Error:", errorData);
            throw new Error(`Hume API error: ${response.status} ${response.statusText}`);
          }

          const body = await response.json();

          if (!body.generations || body.generations.length === 0) {
            throw new Error("No audio generated");
          }

          const base64Audio = body.generations[0].audio;

          // Convert Base64 → Blob
          const binaryString = window.atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);

          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const audioBlob = new Blob([bytes], { type: "audio/mp3" });

          const currentUrl = URL.createObjectURL(audioBlob);
          setAudioSrc(currentUrl);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to generate preview");
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
      {loadingVoice ? (
        <div className="w-full px-4 py-2 bg-gray-200 rounded-lg text-center">
          Loading preview...
        </div>
      ) : (
        audioSrc && <audio controls src={audioSrc} className="w-full" />
      )}

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

        <optgroup label="Hume Voices">
          {humeVoices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} ({v.accent})
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};

export default VoiceSelector;
