import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { generatePodcast } from "../../../redux/slices/podcast.slice";

const GeneratePodcast = () => {
  const dispatch = useDispatch();
  const { podcast } = useSelector((state) => state.podcast);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    tone: "",
    type: "",
    audience: "",
    episodes: 1,
    length: 3,
  });
  const [showFullScript, setShowFullScript] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(0);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    "Mixing the perfect podcast vibes 🎶...",
    "Tuning the mic for your epic show 🎙️...",
    "Crafting a story that captivates 📖...",
    "Adding some AI magic to your podcast ✨...",
    "Getting the soundwaves ready 🌊...",
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (podcast && podcast.episode) {
      setSelectedEpisode(0);
      setShowFullScript(false);
    }
  }, [podcast]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    // Validation
    if (!formData.topic || formData.topic.trim().length < 5) {
      toast.error("Podcast topic must be at least 5 characters long");
      return;
    }
    if (formData.topic.length > 15000) {
      toast.error("Podcast topic is too long (max 15000 chars)");
      return;
    }
    if (!formData.tone || !formData.type || !formData.audience) {
      toast.error("Tone, Type, and Audience are required");
      return;
    }

    const payload = {
      topic: formData.topic.trim(),
      tone: formData.tone,
      type: formData.type,
      audience: formData.audience,
      episodes: formData.episodes,
      length: Number(formData.length),
      adminId: Cookies.get("userId") || null,
    };

    try {
      setLoading(true);
      await dispatch(generatePodcast(payload)).unwrap();
      toast.success("Podcast generated successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to generate podcast");
    } finally {
      setLoading(false);
    }
  };

  const episodes = podcast?.episode
    ? Array.isArray(podcast.episode)
      ? podcast.episode
      : [podcast.episode]
    : [];

  // Get current episode data
  const currentEpisode = episodes[selectedEpisode];

  const handleDownload = async () => {
    if (currentEpisode?.audioURL) {
      try {
        const response = await fetch(currentEpisode.audioURL);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentEpisode.title || "episode"}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
        toast.success(`Episode ${selectedEpisode + 1} downloaded!`);
      } catch (err) {
        toast.error("Failed to download episode");
      }
    } else {
      toast.error("No episode available to download");
    }
  };

  // Handle script truncation for current episode
  const renderScript = () => {
    if (!currentEpisode?.script) return null;

    const scriptText = currentEpisode.script;
    const scriptLines = scriptText
      .split("\n")
      .filter((line) => line.trim() !== "");
    const maxVisibleLines = 4;

    if (showFullScript) {
      return (
        <>
          <p className="text-gray-700 whitespace-pre-line mb-2">{scriptText}</p>
          <button
            onClick={() => setShowFullScript(false)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
            Show less
          </button>
        </>
      );
    } else {
      const visibleLines = scriptLines.slice(0, maxVisibleLines);
      const displayText =
        visibleLines.join("\n") +
        (scriptLines.length > maxVisibleLines ? "..." : "");
      return (
        <>
          <p className="text-gray-700 whitespace-pre-line mb-2 max-h-20 overflow-hidden">
            {displayText}
          </p>
          {scriptLines.length > maxVisibleLines && (
            <button
              onClick={() => setShowFullScript(true)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
            >
              Show more
            </button>
          )}
        </>
      );
    }
  };

  const lengthLabels = ["Brief", "Short", "Medium", "Long", "Extended"];

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.75rem",
      padding: "0.25rem",
      borderColor: state.isFocused ? "#6366f1" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px #6366f1" : "none",
      "&:hover": { borderColor: "#6366f1" },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      zIndex: 9999,
    }),
  };

  const toneOptions = [
    {
      label: "Professional / Neutral",
      options: [
        { value: "conversational", label: "Conversational & Engaging" },
        { value: "informative", label: "Informative & Clear" },
        { value: "serious", label: "Serious & Thoughtful" },
        { value: "inspirational", label: "Inspirational & Motivating" },
        { value: "humorous", label: "Humorous & Lighthearted" },
      ],
    },
    {
      label: "Creative / Expressive",
      options: [
        { value: "satirical", label: "Satirical / Comedic" },
        { value: "casual", label: "Casual / Chill Vibes" },
        { value: "motivational", label: "Motivational Speech" },
      ],
    },
    {
      label: "Atmospheric / Genre-based",
      options: [
        { value: "storytelling", label: "Narrative / Storytelling" },
        { value: "horror", label: "Horror & Suspense" },
        { value: "mystery", label: "Mystery / Thriller" },
      ],
    },
  ];

  const typeOptions = [
    {
      label: "Discussion Formats",
      options: [
        { value: "interview", label: "Interview" },
        { value: "debate", label: "Debate / Discussion" },
        { value: "panel", label: "Panel / Roundtable" },
      ],
    },
    {
      label: "Narrative Formats",
      options: [
        { value: "documentary", label: "Documentary" },
        {
          value: "storytelling",
          label: "Storytelling (Fiction / Non-fiction)",
        },
        { value: "true-crime", label: "True Crime" },
      ],
    },
    {
      label: "Solo Formats",
      options: [
        { value: "solo", label: "Solo Commentary" },
        { value: "educational", label: "Educational / Tutorial" },
        { value: "motivational", label: "Motivational / Inspirational Talk" },
      ],
    },
  ];

  const audienceOptions = [
    {
      label: "Education & Career",
      options: [
        { value: "students", label: "Students & Learners" },
        { value: "professionals", label: "Professionals / Industry Experts" },
        { value: "entrepreneurs", label: "Entrepreneurs / Startups" },
      ],
    },
    {
      label: "General",
      options: [
        { value: "general", label: "General Public" },
        { value: "youth", label: "Kids / Young Adults" },
        { value: "casual", label: "Casual Listeners" },
      ],
    },
    {
      label: "Interests & Niche",
      options: [
        { value: "tech", label: "Tech Enthusiasts" },
        { value: "fitness", label: "Health & Fitness" },
        { value: "story", label: "Story Lovers (Fiction / Drama)" },
        { value: "true-crime", label: "True Crime Fans" },
        { value: "motivational", label: "Motivational Seekers" },
        { value: "spiritual", label: "Spiritual / Self-growth" },
      ],
    },
  ];

  const episodeOptions = [...Array(12)].map((_, i) => ({
    value: i + 1,
    label: `${i + 1} Episode${i + 1 > 1 ? "s" : ""}`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex h-screen">
        {/* Left Panel - Forms */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto thin-scrollbar shadow-xl">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Podcast Studio
              </h1>
              <p className="text-gray-600 text-md font-medium">
                Craft your AI-powered podcast with ease
              </p>
            </div>

            <form className="space-y-6">
              {/* Podcast Topic */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Podcast Topic
                </label>
                <textarea
                  placeholder="Describe your podcast topic..."
                  value={formData.topic}
                  onChange={(e) => handleInputChange("topic", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="4"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.topic.length}/15000 characters
                </div>
              </div>

              {/* Voice Tone */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Voice Tone <span className="text-red-500">*</span>
                </label>
                <Select
                  options={toneOptions}
                  styles={customSelectStyles}
                  value={toneOptions
                    .flatMap((group) => group.options)
                    .find((opt) => opt.value === formData.tone)}
                  onChange={(selected) =>
                    handleInputChange("tone", selected.value)
                  }
                  placeholder="Select tone..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Podcast Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Podcast Type <span className="text-red-500">*</span>
                </label>
                <Select
                  options={typeOptions}
                  styles={customSelectStyles}
                  value={typeOptions
                    .flatMap((group) => group.options)
                    .find((opt) => opt.value === formData.type)}
                  onChange={(selected) =>
                    handleInputChange("type", selected.value)
                  }
                  placeholder="Select type..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <Select
                  options={audienceOptions}
                  styles={customSelectStyles}
                  value={audienceOptions
                    .flatMap((group) => group.options)
                    .find((opt) => opt.value === formData.audience)}
                  onChange={(selected) =>
                    handleInputChange("audience", selected.value)
                  }
                  placeholder="Select audience..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Number of Episodes */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Number of Episodes <span className="text-red-500">*</span>
                </label>
                <Select
                  options={episodeOptions}
                  styles={customSelectStyles}
                  value={episodeOptions.find(
                    (opt) => opt.value === formData.episode
                  )}
                  onChange={(selected) =>
                    handleInputChange("episodes", selected.value)
                  }
                  placeholder="Select number of episodes..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Podcast Length */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Podcast Length <span className="text-red-500">*</span>
                </label>
                <div className="px-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.length}
                    onChange={(e) =>
                      handleInputChange("length", Number(e.target.value))
                    }
                    className="w-full h-2 bg-gradient-to-r from-amber-400 to-pink-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
                    {lengthLabels.map((label, index) => (
                      <span
                        key={index}
                        className={
                          formData.length === index + 1
                            ? "text-indigo-600 font-semibold"
                            : ""
                        }
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={
                  loading ||
                  !formData.tone ||
                  !formData.audience ||
                  !formData.type
                }
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 
                  ${
                    loading ||
                    !formData.tone ||
                    !formData.audience ||
                    !formData.type
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-gradient-to-r from-amber-400 to-pink-500 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  "Generate Podcast"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto thin-scrollbar">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Live Preview
              </h2>
              <p className="text-gray-600 text-md font-medium">
                Preview your podcast episodes
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              {loading ? (
                <div className="animate-pulse text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Creating Your Podcast
                  </h3>
                  <p className="text-gray-500 text-sm transition-all duration-500">
                    {loadingMessages[currentMessageIndex]}
                  </p>
                </div>
              ) : podcast && podcast.episode ? (
                <>
                  {/* Podcast Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {podcast.title?.length > 60
                      ? podcast.title.slice(0, 60) + "..."
                      : podcast.title}
                  </h3>

                  {/* Episode Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Episode:
                    </label>
                    <Select
                      options={episodes.map((ep, index) => ({
                        value: index,
                        label: `Episode ${index + 1}: ${
                          ep.title?.length > 30
                            ? ep.title.slice(0, 30) + "..."
                            : ep.title
                        }`,
                      }))}
                      value={{
                        value: selectedEpisode,
                        label: `Episode ${selectedEpisode + 1}: ${
                          podcast?.episode[selectedEpisode]?.title?.length > 30
                            ? podcast?.episode[selectedEpisode]?.title.slice(
                                0,
                                30
                              ) + "..."
                            : podcast?.episode[selectedEpisode]?.title
                        }`,
                      }}
                      onChange={(selected) =>
                        setSelectedEpisode(selected.value)
                      }
                      styles={customSelectStyles}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Current Episode Details */}
                  {currentEpisode && (
                    <>
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          Episode {selectedEpisode + 1}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {Math.floor(currentEpisode.duration / 60)}:
                          {(currentEpisode.duration % 60)
                            .toString()
                            .padStart(2, "0")}
                        </p>
                      </div>

                      <audio controls className="w-full mb-4 rounded-lg">
                        <source
                          src={currentEpisode.audioURL}
                          type="audio/mpeg"
                        />
                        Your browser does not support the audio element.
                      </audio>

                      <button
                        onClick={handleDownload}
                        className="mb-4 w-full px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-md"
                      >
                        ⬇️ Download Episode {selectedEpisode + 1}
                      </button>

                      <div className="text-left border-t pt-4">
                        <h4 className="font-bold text-lg mb-2 text-gray-800">
                          Script
                        </h4>
                        {renderScript()}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center">
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
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Preview Your Podcast
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Fill out the form and generate your podcast to see the
                      episodes here
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePodcast;
