import React, { useState, useEffect } from "react";

const SpeechToTextChat = () => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    const speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = "en-US";

    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessages((prev) => [...prev, { text: transcript, sender: "user" }]);
      fetchResponse(transcript);
    };

    speechRecognition.onend = () => {
      setIsListening(false);
    };

    setRecognition(speechRecognition);
  }, []);

  const fetchResponse = async (userInput) => {
    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.response, sender: "bot" }]);
      speakResponse(data.response);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  const speakResponse = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
      <div className="w-80 h-96 bg-white p-4 rounded-lg shadow overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded-lg ${
              msg.sender === "user" ? "bg-blue-300 self-end" : "bg-gray-300 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <button
        onClick={startListening}
        className="mt-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
      >
        {isListening ? "Listening..." : "Start Listening"}
      </button>
    </div>
  );
};

export default SpeechToTextChat;
