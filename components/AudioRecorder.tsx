"use client";

// import { getTranscription } from '@/actions/transcription';
import { motion } from "framer-motion";
import { ArrowUp, LoaderCircle, Mic, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRef, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function AudioRecorder({
  setMessage,
  className,
}: {
  setMessage: (message: any) => void;
  className?: string;
}) {
  const { data } = useSession();
  const [recording, setRecording] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<any>(null);
  const audioChunks = useRef<Blob[]>([]);
  const cancelRef = useRef(false);

  const startRecording = async () => {
    // Check if the browser supports SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Google Cloud Speech to Text is not supported in this browser.",
      );

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    toast.info("☁️ Google Cloud: Speech to Text initialized.");

    // @ts-ignore
    setMediaRecorder(recognition);
    setRecording(true);
    setLoadingText(false);

    recognition.onresult = async (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        // 🌐 Google Cloud Translation API integration
        // Autonomously translate non-English developer inputs into English for the Swarm
        try {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
          const res = await fetch(`${API_URL}/api/v1/telemetry/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: finalTranscript,
              targetLanguage: "en",
            }),
          });
          const translationData = await res.json();
          const processedText = translationData.success
            ? translationData.data.translatedText
            : finalTranscript;

          setMessage((prev: string) =>
            prev ? prev + " " + processedText : processedText,
          );
        } catch (e) {
          // Fallback to raw text if translation routing fails
          setMessage((prev: string) =>
            prev ? prev + " " + finalTranscript : finalTranscript,
          );
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("GCP Speech Recognition warning:", event.error);

      let friendlyMessage = `Microphone error: ${event.error}`;

      if (event.error === "not-allowed") {
        friendlyMessage =
          "Microphone access is blocked. Please click the mic icon in your browser URL bar to grant permission.";
      } else if (event.error === "no-speech") {
        friendlyMessage = "No speech was detected. Please try speaking again.";
      } else if (event.error === "network") {
        friendlyMessage =
          "A network error occurred. Please check your internet connection.";
      }

      toast.error(friendlyMessage);
      setRecording(false);
      setLoadingText(false);
    };

    recognition.onend = () => {
      setRecording(false);
      setLoadingText(false);
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (!mediaRecorder) return;
    // @ts-ignore
    mediaRecorder.stop();
    setRecording(false);
    setLoadingText(false);
  };

  const handleCancelRecording = () => {
    if (!mediaRecorder) return;
    // @ts-ignore
    mediaRecorder.abort();
    setRecording(false);
    setLoadingText(false);
  };

  return (
    <div className="flex gap-2">
      {recording && (
        <div className="flex h-6 w-10 items-end gap-1">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: recording ? [4, Math.random() * 6 + 16, 12] : 2,
              }}
              className="w-1 rounded bg-neutral-800"
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 0.7,
                delay: i * 0.09,
              }}
            />
          ))}
        </div>
      )}
      {loadingText && !recording ? (
        <LoaderCircle
          className={
            className ||
            "size-6 flex-none animate-spin cursor-pointer rounded-xl border-2 border-gray-300 bg-black p-0.5 text-white"
          }
        />
      ) : !recording && !loadingText ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Mic
              className={
                className ||
                "size-6 flex-none cursor-pointer rounded-xl border-2 border-gray-300 bg-black p-0.5 text-white"
              }
              onClick={startRecording}
            />
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Speech to Text</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <div className="flex space-x-2">
          <X
            className="size-6 flex-none cursor-pointer rounded-full p-0.5 text-neutral-600"
            onClick={handleCancelRecording}
          />
          <ArrowUp
            className={
              className ||
              "size-6 flex-none cursor-pointer rounded-xl border-2 border-gray-300 bg-black p-0.5 text-white"
            }
            onClick={stopRecording}
          />
        </div>
      )}
    </div>
  );
}
