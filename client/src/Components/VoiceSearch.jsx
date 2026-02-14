import React, { useEffect, useRef, useState } from "react";

function VoiceSearch({ onChangeText }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      onChangeText(text.trim());
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, [onChangeText]);

  const startListening = () => {
    if (recognitionRef.current) recognitionRef.current.start();
  };

  return (
    <button
      onClick={startListening}
      className="bg-transparent p-0 m-0"
      style={{ lineHeight: 0 }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isListening ? "#FF2D2D" : "#7A7B7D"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isListening ? "mic-fade" : ""}
        style={{
          transition: "all 0.3s ease",
        }}
      >
        <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3z" />
        <path d="M19 11a7 7 0 0 1-14 0" />
        <path d="M12 18v3" />
        <path d="M8 21h8" />
      </svg>

      <style>
        {`
          .mic-fade {
            animation: micFade 1s infinite ease-in-out;
          }

          @keyframes micFade {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }
        `}
      </style>
    </button>
  );
}

export default VoiceSearch;
