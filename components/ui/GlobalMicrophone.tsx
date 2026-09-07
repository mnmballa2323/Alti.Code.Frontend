"use client";

import { useState, useRef } from "react";
import { Button } from "@heroui/react";
import { toast } from "sonner";
import { Mic, MicOff } from "lucide-react";

export function GlobalMicrophone() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });

        await sendAudioToSwarm(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      toast.success("Acoustic Workspace Activated. Swarm is listening...");
    } catch (err) {
      toast.error("Microphone access denied or unavailable.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const sendAudioToSwarm = async (audioBlob: Blob) => {
    const formData = new FormData();

    formData.append("audio", audioBlob, "command.webm");

    try {
      // Phase 46: Send audio to backend transcription & autonomous sprint trigger
      const res = await fetch("/api/agents/acoustic-workspace", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Audio processing failed.");

      const result = await res.json();

      toast.success(`Swarm Transcript: "${result.transcript}"`);
      if (result.sprintId) {
        toast.info(
          `Autonomous Sprint [${result.sprintId}] initiated from voice command.`,
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process audio command.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        isIconOnly
        aria-label="Toggle Acoustic Workspace"
        className={`w-14 h-14 ${isRecording ? "animate-pulse" : ""}`}
        color={isRecording ? "danger" : "primary"}
        isLoading={isProcessing}
        radius="full"
        size="lg"
        variant="shadow"
        onPress={toggleRecording}
      >
        {!isProcessing &&
          (isRecording ? <MicOff size={24} /> : <Mic size={24} />)}
      </Button>
    </div>
  );
}
