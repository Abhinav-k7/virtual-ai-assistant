import React, { useRef, useState, useContext } from "react";
import Tesseract from "tesseract.js";
import html2canvas from "html2canvas";
import { userDataContext } from "../context/UserContext";
import { GrCamera } from "react-icons/gr";
import { RxCross1 } from "react-icons/rx";

export default function ScreenCapture({ onAnalyzeScreen, onClose }) {
  const { serverUrl } = useContext(userDataContext);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [isFloating, setIsFloating] = useState(true); // Toggle between floating button and modal
  const canvasRef = useRef(null);

  // ✅ Capture screenshot from screen
  const captureScreenModern = async () => {
    try {
      setIsCapturing(true);
      setOcrProgress(0);
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#ffffff",
        ignoreElements: (element) => {
          return element.tagName === "STYLE";
        },
      });

      canvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        setCapturedImage(url);

        // Extract text using Tesseract.js
        const reader = new FileReader();
        reader.onloadend = () => {
          extractTextFromImage(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("❌ Screen capture error:", error);
      alert("Could not capture screen. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  // ✅ Extract text from image using Tesseract OCR
  const extractTextFromImage = async (imageData) => {
    try {
      setIsProcessing(true);
      console.log("🔍 Extracting text from image...");

      const result = await Tesseract.recognize(imageData, "eng", {
        logger: (m) => {
          if (m.status === "recognizing") {
            const progress = Math.round(m.progress * 100);
            console.log(`📖 OCR Progress: ${progress}%`);
            setOcrProgress(progress);
          }
        },
      });

      const text = result.data.text;
      console.log("✅ Extracted text:", text);
      setExtractedText(text);
      setSelectedText(text); // Default to all text, user can edit
      setOcrProgress(100);

      return text;
    } catch (error) {
      console.error("❌ OCR failed:", error);
      setExtractedText("Failed to extract text from image");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setOcrProgress(0), 1000);
    }
  };

  // ✅ Send screenshot + question to AI
  const analyzeScreenWithQuestion = async () => {
    if (!selectedText.trim()) {
      alert("Please select some text or capture screen first");
      return;
    }

    if (!userQuestion.trim()) {
      alert("Please enter a question");
      return;
    }

    try {
      setIsProcessing(true);
      const prompt = `Here is text extracted from a screenshot:\n\n${selectedText}\n\nUser question: ${userQuestion}`;

      // Send to backend to get AI analysis
      const response = await fetch(`${serverUrl}/api/user/asktoassistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ command: prompt }),
      });

      const data = await response.json();
      console.log("🤖 AI Analysis:", data);

      // Call the callback to update UI
      if (onAnalyzeScreen) {
        onAnalyzeScreen(data);
      }

      // Reset and close
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);

      return data;
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      alert("Failed to analyze. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Clear/Close function
  const handleClose = () => {
    setCapturedImage(null);
    setSelectedText("");
    setExtractedText("");
    setUserQuestion("");
    setOcrProgress(0);
    if (onClose) onClose();
  };

  // If showing floating mode (collapsed), show only button
  if (isFloating) {
    return (
      <>
        {/* Floating Button - Always visible at top-right */}
        <button
          onClick={() => setIsFloating(false)}
          className="fixed top-6 right-6 z-50 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl"
          title="Open screen capture"
        >
          <GrCamera className="w-6 h-6" />
        </button>
      </>
    );
  }

  // Modal view (expanded)
  return (
    <>
      {/* Floating Button - Always visible at top-right */}
      <button
        onClick={() => setIsFloating(true)}
        className="fixed top-6 right-6 z-50 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl"
        title="Hide screen capture"
      >
        <RxCross1 className="w-6 h-6" />
      </button>

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
        {/* Modal Content */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg text-white w-full max-w-2xl my-8">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GrCamera className="w-6 h-6" />
              <h3 className="text-xl font-bold">📸 Screen Reader AI</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
              title="Close screen capture"
            >
              <RxCross1 className="w-5 h-5" />
            </button>
          </div>

          {/* Screenshot Preview */}
          {capturedImage && (
            <div className="mb-4 border-2 border-white/30 rounded-lg overflow-hidden max-h-48">
              <img
                src={capturedImage}
                alt="Captured screen"
                className="w-full object-contain"
              />
            </div>
          )}

          {/* OCR Progress Bar */}
          {ocrProgress > 0 && ocrProgress < 100 && (
            <div className="mb-4 bg-black/30 p-3 rounded-lg">
              <div className="flex justify-between mb-2">
                <p className="text-sm text-gray-300">📖 Extracting Text...</p>
                <p className="text-sm font-bold">{ocrProgress}%</p>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Extracted Text - Editable */}
          {extractedText && (
            <div className="mb-4 bg-black/30 p-4 rounded-lg">
              <label className="text-sm text-gray-300 mb-2 block">
                📝 Extracted Text (edit or select what you want):
              </label>
              <textarea
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                className="w-full h-32 bg-black/50 text-white p-3 rounded border border-white/20 text-sm font-mono resize-none focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-yellow-400/50"
                placeholder="Edit extracted text here..."
              />
              <p className="text-xs text-gray-400 mt-2">
                💡 You can edit or delete unwanted text before asking AI
              </p>
            </div>
          )}

          {/* User Question Input */}
          {extractedText && (
            <div className="mb-4 bg-black/30 p-4 rounded-lg">
              <label className="text-sm text-gray-300 mb-2 block">
                ❓ What would you like to ask about this text?
              </label>
              <textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                className="w-full h-20 bg-black/50 text-white p-3 rounded border border-white/20 text-sm resize-none focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-blue-400/50"
                placeholder="Ask your question here... e.g., 'What is the main topic?' or 'Summarize this text'"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={captureScreenModern}
              disabled={isCapturing || isProcessing}
              className="flex-1 min-w-48 bg-white text-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isCapturing ? "📷 Capturing..." : "📷 Capture Screen"}
            </button>

            {extractedText && (
              <button
                onClick={analyzeScreenWithQuestion}
                disabled={isProcessing || !userQuestion.trim()}
                className="flex-1 min-w-48 bg-yellow-400 text-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isProcessing ? "🤖 Analyzing..." : "🤖 Ask AI"}
              </button>
            )}

            {(capturedImage || extractedText || userQuestion) && (
              <button
                onClick={handleClose}
                className="bg-red-500/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition"
              >
                ✕ Clear
              </button>
            )}
          </div>

          <p className="text-xs text-gray-200 mt-3">
            💡 Tip: Capture, edit text if needed, ask a question, then AI will
            analyze!
          </p>
        </div>
      </div>
    </>
  );
}
