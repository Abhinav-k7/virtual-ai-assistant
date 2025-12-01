import React, { useEffect, useRef, useState } from "react";
import { PorcupineWorker } from "@picovoice/porcupine-web";

export default function HotwordListener({
  mode = "porcupine",
  hotword = "hey nova",
  customWakeWords = ["hello", "hey", "hi"], // ✅ Custom wake words like "hello", "hey", "hi"
  porcupineConfig = {},
  assistantEndpoint,
  onWake = () => {},
  onResult = () => {},
}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);

  // Porcupine references
  const porcupineManagerRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);

  // Debouncing to prevent multiple triggers
  const lastDetectionRef = useRef(0);
  const DEBOUNCE_TIME = 1000; // ✅ REDUCED to 1 second (faster listening)

  // ==========================================================
  //  ENHANCED PORCUPINE MODE → Multiple keywords support
  // ==========================================================
  const startPorcupineHotword = async () => {
    try {
      const { accessKey } = porcupineConfig;

      if (!accessKey) {
        const errorMsg = "Missing Porcupine access key in VITE_PICOVOICE_KEY";
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      // Support multiple built-in keywords (actual Porcupine available keywords)
      // Available: Alexa, Americano, Blueberry, Bumblebee, Computer, Grapefruit,
      //            Grasshopper, Hey Google, Hey Siri, Jarvis, Okay Google,
      //            Picovoice, Porcupine, Terminator
      const keywordPaths = [
        "Picovoice", // 0 - Brand name (reliable)
        "Jarvis", // 1 - Popular assistant
        "Computer", // 2 - System command
        "Alexa", // 3 - Amazon's assistant
        "Porcupine", // 4 - Library name
      ];

      const keywordNames = [
        "Picovoice",
        "Jarvis",
        "Computer",
        "Alexa",
        "Porcupine",
      ];

      console.log("🎤 Initializing Porcupine with keywords:", keywordNames);

      // Initialize Porcupine with multiple keywords
      porcupineManagerRef.current = await PorcupineWorker.create(
        accessKey,
        keywordPaths,
        {
          publicDirectory: "/",
        }
      );

      console.log("✅ Porcupine initialized successfully");
      setError(null);

      // Request microphone access with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true, // Enable auto gain for consistent detection
          channelCount: 1,
          sampleRate: 16000, // Optimal for Porcupine
        },
      });

      streamRef.current = stream;

      // Initialize audio context with optimal settings
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Resume audio context if suspended (required in some browsers)
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
        console.log("Audio context resumed");
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create audio processor with optimal buffer size
      processorRef.current = audioContextRef.current.createScriptProcessor(
        2048, // Reduced buffer size for faster detection
        1,
        1
      );

      let frameCount = 0;

      // Process audio frames
      processorRef.current.onaudioprocess = async (event) => {
        const inputFrame = event.inputBuffer.getChannelData(0);
        frameCount++;

        try {
          const result = await porcupineManagerRef.current.process(inputFrame);

          // Result is array of detected keyword indices
          if (result && result.length > 0) {
            const keywordIndex = result[0];
            const detectedKeyword = keywordNames[keywordIndex];

            // Debounce: prevent multiple triggers within 2 seconds
            const now = Date.now();
            if (now - lastDetectionRef.current > DEBOUNCE_TIME) {
              console.log(`🎤 Wake word detected: "${detectedKeyword}"`);
              lastDetectionRef.current = now;

              onWake(detectedKeyword);
              await triggerAssistant(detectedKeyword);
            } else {
              console.log(
                `⏱️ Debouncing... (${now - lastDetectionRef.current}ms)`
              );
            }
          }
        } catch (err) {
          console.error("Error processing audio:", err);
        }
      };

      // Connect audio graph
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      setListening(true);
      console.log("🎧 Listening for wake words...");
    } catch (error) {
      const errorMsg = `Porcupine initialization error: ${error.message}`;
      console.error(errorMsg, error);
      console.log(
        "⚠️ Porcupine failed, falling back to simple speech recognition mode..."
      );
      setError(null); // Clear error to allow fallback
      setListening(false);
      // Automatically fallback to simple mode
      setTimeout(() => startSimpleHotword(), 500);
    }
  };

  // ==========================================================
  //  SIMPLE MODE → Browser Speech Recognition with multiple hotwords
  // ==========================================================
  const startSimpleHotword = () => {
    if (!("webkitSpeechRecognition" in window)) {
      const errorMsg = "Your browser does not support voice recognition.";
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // ✅ Combine custom wake words with assistant name
    const wakeWords = [
      ...customWakeWords, // ["hello", "hey", "hi"]
      hotword, // "hey nova" or assistant name
      "hey nova",
    ];

    console.log("🎤 Simple mode - Listening for wake words:", wakeWords);

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();

      console.log("🎤 Heard:", transcript);

      // ✅ STRICT MATCHING: Check if wake word is at start or standalone
      const matchedWakeWord = wakeWords.find((word) => {
        const lowerWord = word.toLowerCase();
        // Match if:
        // 1. Transcript starts with the wake word (e.g., "hey nova, what time is it")
        // 2. Transcript is exactly the wake word (e.g., "hey")
        // 3. Wake word is followed by punctuation or space
        return (
          transcript === lowerWord ||
          transcript.startsWith(lowerWord + " ") ||
          transcript.startsWith(lowerWord + ",")
        );
      });

      if (matchedWakeWord) {
        // Debounce
        const now = Date.now();
        if (now - lastDetectionRef.current > DEBOUNCE_TIME) {
          console.log(`🎤 Wake word detected: "${matchedWakeWord}"`);
          lastDetectionRef.current = now;

          onWake(matchedWakeWord);
          await triggerAssistant(matchedWakeWord);
        }
      }
    };

    recognition.onerror = (e) => {
      console.error("🔴 Speech recognition error:", e.error);
      setError(`Speech error: ${e.error}`);
    };

    recognition.onend = () => {
      // Restart recognition when it ends
      setTimeout(() => {
        recognition.start();
      }, 1000);
    };

    recognition.start();
    setListening(true);
    console.log("🎧 Simple mode listening...");
  };

  // ==========================================================
  //  OPTIMIZED ASSISTANT CALL with caching
  // ==========================================================
  const triggerAssistant = async (detectedKeyword) => {
    try {
      console.log("📤 Calling assistant endpoint...");
      const startTime = Date.now();

      const res = await fetch(assistantEndpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: detectedKeyword || hotword,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      const responseTime = Date.now() - startTime;

      console.log(`⚡ Response time: ${responseTime}ms`, data);

      onResult(data);
    } catch (error) {
      console.error("🔴 Assistant call error:", error);
      setError(`Assistant error: ${error.message}`);
    }
  };

  // ==========================================================
  //  INIT LISTENING ON MOUNT
  // ==========================================================
  useEffect(() => {
    console.log(`🚀 Initializing with mode: ${mode}`);

    if (mode === "simple") {
      startSimpleHotword();
    } else if (mode === "porcupine") {
      startPorcupineHotword();
    }

    return () => {
      console.log("🧹 Cleaning up...");
      if (processorRef.current) processorRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (porcupineManagerRef.current) porcupineManagerRef.current.terminate();
      setListening(false);
    };
  }, [mode]);

  // ==========================================================
  //  UI STATUS DISPLAY
  // ==========================================================
  return (
    <div
      style={{
        fontSize: "12px",
        padding: "8px",
        margin: "10px 0",
        borderRadius: "4px",
        backgroundColor: listening ? "#e8f5e9" : "#ffebee",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "16px" }}>{listening ? "🎤" : "🔴"}</span>
        <div>
          <strong>Hotword Listener:</strong>
          <br />
          {listening ? (
            <span style={{ color: "green" }}>
              ✅ Active - Listening for: Picovoice, Jarvis, Computer, Alexa,
              Porcupine
            </span>
          ) : (
            <span style={{ color: "red" }}>❌ Not active</span>
          )}
          {error && (
            <div style={{ color: "red", marginTop: "4px" }}>⚠️ {error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
