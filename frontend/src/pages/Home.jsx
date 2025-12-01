import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import { CgMenuLeft } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif";
import { FiSend } from "react-icons/fi"; // For send icon

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [_listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [chatInput, setChatInput] = useState(""); // New state for chat input
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const [ham, setHam] = useState(false);
  const isRecognizingRef = useRef(false);
  const greetingSpokenRef = useRef(false);
  const synth = window.speechSynthesis;
  // const [ttsEnabled, setTtsEnabled] = useState(true); // TTS enabled by default
  // const pendingSpeechRef = useRef(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(
    localStorage.getItem("ttsVoice") || ""
  );
  const [showDropdown, setShowDropdown] = useState(false); // New state for profile dropdown

  // Refs for outside click detection
  const hamburgerRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const historyContainerRef = useRef(null); // ✅ Ref for history container auto-scroll

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
    setShowDropdown(false); // Close dropdown after logout
  };

  // Outside click handler for hamburger and profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setHam(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const startRecognition = useCallback(() => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        console.log("Recognition requested to start");
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
      }
    }
  }, []);

  const speak = useCallback(
    (text) => {
      // Stop recognition before speaking to prevent picking up own voice
      try {
        recognition.stop();
      } catch (e) {
        // Already stopped, no action needed
      }

      // TTS is enabled by default, speak directly
      const utterence = new SpeechSynthesisUtterance(text);
      // prefer selected voice, fallback to hi-IN or first available
      const availableVoices = window.speechSynthesis.getVoices() || [];
      let voiceToUse = availableVoices.find((v) => v.name === selectedVoice);
      if (!voiceToUse)
        voiceToUse = availableVoices.find((v) => v.lang === "hi-IN");
      if (!voiceToUse && availableVoices.length)
        voiceToUse = availableVoices[0];
      if (voiceToUse) utterence.voice = voiceToUse;

      isSpeakingRef.current = true;
      utterence.onend = () => {
        setAiText("");
        isSpeakingRef.current = false;
        setTimeout(() => {
          startRecognition(); // ⏳ Delay se race condition avoid hoti hai
        }, 800);
      };
      synth.cancel(); // 🛑 pehle se koi speech ho to band karo
      synth.speak(utterence);
    },
    [synth, startRecognition, selectedVoice]
  );

  // Load available TTS voices and watch for changes
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices() || [];
      setVoices(v);
      if (!selectedVoice && v.length) {
        // Default to hi-IN voice if available, else first available
        const defaultVoice = v.find((voice) => voice.lang === "hi-IN") || v[0];
        setSelectedVoice(defaultVoice.name);
        localStorage.setItem("ttsVoice", defaultVoice.name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  // persist selected voice
  useEffect(() => {
    if (selectedVoice) localStorage.setItem("ttsVoice", selectedVoice);
  }, [selectedVoice]);

  // ✅ Auto-scroll history to bottom when new messages arrive
  useEffect(() => {
    if (historyContainerRef.current) {
      setTimeout(() => {
        historyContainerRef.current.scrollTop =
          historyContainerRef.current.scrollHeight;
      }, 0);
    }
  }, [userData?.history]);

  // ✅ Auto-scroll history to bottom when new messages are added
  useEffect(() => {
    if (historyContainerRef.current) {
      setTimeout(() => {
        historyContainerRef.current.scrollTop =
          historyContainerRef.current.scrollHeight;
      }, 0);
    }
  }, [userData?.history]);

  const handleCommand = useCallback(
    (data) => {
      const { type, userInput, searchQuery, response } = data;
      speak(response);

      if (type === "google-search") {
        const query = encodeURIComponent(searchQuery || userInput);
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
      }
      if (type === "calculator-open") {
        window.open(`https://www.google.com/search?q=calculator`, "_blank");
      }
      if (type === "instagram-open") {
        window.open(`https://www.instagram.com/`, "_blank");
      }
      if (type === "facebook-open") {
        window.open(`https://www.facebook.com/`, "_blank");
      }
      if (type === "weather-show") {
        window.open(`https://www.google.com/search?q=weather`, "_blank");
      }

      if (type === "youtube-search" || type === "youtube-play") {
        const query = encodeURIComponent(searchQuery || userInput);
        window.open(
          `https://www.youtube.com/results?search_query=${query}`,
          "_blank"
        );
      }
    },
    [speak]
  );

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const sentMessage = chatInput; // Store message
    setChatInput(""); // Instantly clear textbox

    // Show user message after delay (like WhatsApp typing effect)
    setTimeout(() => {
      setUserText(sentMessage);
    }, 1500);

    // Process AI response with same delay
    setTimeout(async () => {
      const data = await getGeminiResponse(sentMessage);
      console.log("Chat Response data:", data);

      if (data && data.response) {
        handleCommand(data);
        setAiText(data.response);
      } else {
        speak("Sorry, I couldn't understand that. Please try again.");
        setAiText("Error: No response");
      }

      setUserText("");
    }, 1500);
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    let isMounted = true; // flag to avoid setState on unmounted component

    // Start recognition after 1 second delay only if component still mounted
    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (e) {
          if (e.name !== "InvalidStateError") {
            console.error(e);
          }
        }
      }
    }, 1000);

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
      // Speak greeting on first start (user has interacted)
      if (!greetingSpokenRef.current && isMounted) {
        greetingSpokenRef.current = true;
        const greeting = new SpeechSynthesisUtterance(
          `Hello ${userData.name}, what can I help you with?`
        );
        // choose selected voice if available
        const availableVoices = window.speechSynthesis.getVoices() || [];
        let gVoice = availableVoices.find((v) => v.name === selectedVoice);
        if (!gVoice) gVoice = availableVoices.find((v) => v.lang === "hi-IN");
        if (!gVoice && availableVoices.length) gVoice = availableVoices[0];
        if (gVoice) greeting.voice = gVoice;
        window.speechSynthesis.speak(greeting);
      }
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted");
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" error is normal and shouldn't spam console
      // Only log if it's an actual error
      if (event.error !== "no-speech" && event.error !== "audio-capture") {
        console.warn("Recognition error:", event.error);
      }
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              if (event.error !== "no-speech") {
                console.log("Recognition restarted after error");
              }
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      // Don't process audio while TTS is speaking
      if (isSpeakingRef.current) {
        console.log("🔊 TTS speaking, ignoring audio input");
        return;
      }

      const transcript = e.results[e.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
      console.log("🎤 Recognized:", transcript);

      // Define wake words
      const wakeWords = ["hello", "hey", "hi", "hey nova"];
      const assistantNameLower = userData.assistantName?.toLowerCase() || "";

      // Check if transcript starts with any wake word
      let hasWakeWord = false;
      let userCommand = transcript;

      // Check for standard wake words
      for (const word of wakeWords) {
        if (transcript.startsWith(word)) {
          hasWakeWord = true;
          // Remove wake word and any trailing punctuation/spaces (e.g., "hello, what time is it" -> "what time is it")
          userCommand = transcript
            .replace(new RegExp(`^${word}[\\s,\\.!?]*`), "")
            .trim();
          break;
        }
      }

      // Check if it starts with assistant name as wake word
      if (
        !hasWakeWord &&
        assistantNameLower &&
        transcript.startsWith(assistantNameLower)
      ) {
        hasWakeWord = true;
        // Remove assistant name and any trailing punctuation/spaces (e.g., "nova, what time is it" -> "what time is it")
        userCommand = transcript
          .replace(new RegExp(`^${assistantNameLower}[\\s,\\.!?]*`), "")
          .trim();
      }

      // If no wake word detected, ignore
      if (!hasWakeWord) {
        console.log("❌ No wake word detected, ignoring");
        return;
      }

      // Process command only if we have text after removing wake word
      if (userCommand.length > 0) {
        setAiText("");
        setUserText(userCommand);

        // ✅ Keep recognition RUNNING - don't stop it
        console.log("📝 Processing command:", userCommand);

        const data = await getGeminiResponse(userCommand);
        console.log("✅ Response data:", data);

        if (data && data.response) {
          handleCommand(data);
          setAiText(data.response);

          // ✅ After response, keep listening for next command
          if (isMounted && !isSpeakingRef.current) {
            setTimeout(() => {
              if (isMounted) {
                try {
                  recognition.start();
                  console.log("🎧 Ready for next command");
                } catch (e) {
                  if (e.name !== "InvalidStateError") console.error(e);
                }
              }
            }, 500);
          }
        } else {
          speak("Sorry, I couldn't understand that. Please try again.");
          setAiText("Error: No response");
        }

        setUserText("");
      } else {
        // User said only the wake word with no command
        console.log("⏸️ Only wake word detected, waiting for command");
      }
    };

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, [
    userData?.assistantName,
    userData?.name,
    getGeminiResponse,
    speak,
    selectedVoice,
    handleCommand,
  ]);

  return (
    <div className="w-full h-screen bg-black flex justify-center items-center flex-col gap-4 overflow-hidden relative">
      {/* Hamburger Menu Icon */}
      <CgMenuLeft
        className={`text-white absolute top-5 left-5 w-8 h-8 cursor-pointer z-10 transition-all duration-300 hover:scale-110 ${
          ham ? "hidden" : ""
        }`}
        onClick={() => setHam(true)}
      />

      {/* Profile Icon with First Letter, Gradient, and Glow */}
      <div
        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg cursor-pointer z-10 transition-all duration-300 hover:scale-110 animate-pulse shadow-lg shadow-blue-500/50"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Profile"
        style={{
          boxShadow:
            "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(147, 51, 234, 0.5), 0 0 60px rgba(236, 72, 153, 0.5)",
        }}
      >
        {userData?.name ? userData.name[0].toUpperCase() : "U"}
      </div>

      {/* Profile Dropdown */}
      {showDropdown && (
        <div
          ref={profileDropdownRef}
          className="absolute top-14 right-5 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 z-30 min-w-[250px] border border-gray-200"
        >
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {userData?.name}
              </h3>
              <p className="text-sm text-gray-600">{userData?.email}</p>
            </div>
            <button
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 cursor-pointer"
              onClick={handleLogOut}
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Hamburger Menu */}
      <div
        ref={hamburgerRef}
        className={`absolute top-0 left-0 w-full sm:w-80 h-full bg-black/80 backdrop-blur-xl p-6 flex flex-col gap-6 items-start z-20 transform transition-transform duration-300 ease-in-out ${
          ham ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <RxCross1
          className="text-white absolute top-5 right-5 w-8 h-8 cursor-pointer font-bold transition-all duration-200 hover:scale-110"
          onClick={() => setHam(false)}
        />

        <button
          className="min-w-12 h-14 text-black font-semibold bg-gradient-to-r from-blue-400 to-purple-500 rounded-full cursor-pointer text-base px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>

        {/* Note: Screen Capture button is now always visible as floating button in top-right corner */}
        <div className="flex flex-col gap-3">
          <label className="text-white font-semibold text-lg">
            Select accent of your assistant
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-white/90 text-black p-3 rounded-lg w-full max-w-52 overflow-hidden shadow-md"
            style={{ textOverflow: "ellipsis" }}
          >
            {voices.length === 0 && <option>Loading voices...</option>}
            {voices.map((v) => (
              <option key={v.name} value={v.name} className="truncate">
                {v.name.length > 20 ? `${v.name.substring(0, 20)}...` : v.name}{" "}
                ({v.lang})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full h-0.5 bg-gray-400"></div>
        <h1 className="text-white font-semibold text-xl">History</h1>

        <div
          ref={historyContainerRef}
          className="w-full flex-1 gap-4 overflow-y-auto flex flex-col"
        >
          {userData.history?.map((his, index) => {
            // Handle both old string format and new object format
            const command = typeof his === "string" ? his : his?.command || "";
            const response = typeof his === "object" ? his?.response : "";

            return (
              <div key={index} className="space-y-2">
                {/* User Message */}
                <div className="text-blue-300 text-sm bg-blue-900/30 p-2 rounded-lg">
                  <span className="font-semibold">You:</span> {command}
                </div>
                {/* Assistant Response */}
                {response && (
                  <div className="text-green-300 text-sm bg-green-900/30 p-2 rounded-lg">
                    <span className="font-semibold">Assistant:</span> {response}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center items-center flex-col gap-4 flex-1 px-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="w-72 h-96 sm:w-80 sm:h-[28rem] flex justify-center items-center overflow-hidden rounded-3xl shadow-2xl border-2 border-white/20">
          <img
            src={userData?.assistantImage}
            alt="Assistant"
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="text-white text-xl font-semibold text-center">
          I'm {userData?.assistantName}
        </h1>
        {!aiText && <img src={userImg} alt="User" className="w-48 sm:w-56" />}
        {aiText && <img src={aiImg} alt="AI" className="w-48 sm:w-56" />}

        <h1 className="text-white text-lg font-semibold text-center max-w-md break-words">
          {userText ? userText : aiText ? aiText : null}
        </h1>
      </div>

      {/* 📸 Screen capture is now available via Chrome Extension */}

      {/* Chat Input - Fixed at bottom */}
      <form
        onSubmit={handleChatSubmit}
        className="w-full max-w-md flex items-center gap-3 p-4 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 fixed bottom-4 left-1/2 transform -translate-x-1/2"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none px-4 py-2 text-base"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
        >
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
}

export default Home;
