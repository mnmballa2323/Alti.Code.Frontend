"use client";

import React, { useState, useRef } from "react";
import { Video, Square, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";

import { API_URL } from "@/lib/config";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addMessage } from "@/store/messagesSlice";

/**
 * Global VIDEO_EYE Recorder.
 * Placed in the Layout. Press a global hotkey or the UI button to start recording
 * the screen. Once stopped, it encodes to webm/mp4 and streams directly to
 * the backend Azure Video Indexer Agent for autonomous UI debugging.
 */
export function VideoEyeRecorder() {
  const dispatch = useDispatch();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      // Prompt user for screen share (video)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      });

      // Prompt user for microphone (optional voice-over)
      let audioStream: MediaStream | null = null;

      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      } catch (e) {
        console.warn(
          "Microphone access denied or unavailable. Recording video only.",
        );
      }

      // Mux the video and audio tracks into a single unified stream
      const tracks = [...displayStream.getVideoTracks()];

      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }
      const unifiedStream = new MediaStream(tracks);

      // Dynamically negotiate supported codec
      let options: MediaRecorderOptions | undefined = {
        mimeType: "video/webm;codecs=vp9",
      };

      if (typeof MediaRecorder.isTypeSupported === "function") {
        if (!MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
          options = { mimeType: "video/webm" };
          if (!MediaRecorder.isTypeSupported("video/webm")) {
            options = { mimeType: "video/mp4" };
            if (!MediaRecorder.isTypeSupported("video/mp4")) {
              options = undefined;
            }
          }
        }
      }

      const recorder = new MediaRecorder(unifiedStream, options);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stream ended (either by stop() or user closing screen share)
        unifiedStream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setIsSelected(false);
        await uploadToVideoEye();
      };

      chunksRef.current = [];
      recorder.start(1000); // 1-second chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      toast.info("🔴 Swarm VIDEO_EYE is recording your screen...");
    } catch (err: any) {
      setIsSelected(false);
      toast.error("Failed to start screen capture: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const uploadToVideoEye = async () => {
    if (chunksRef.current.length === 0) return;

    setIsUploading(true);
    toast.loading("Azure Storage: Provisioning SAS URL...");

    const blob = new Blob(chunksRef.current, { type: "video/webm" });

    try {
      // 1. Get Azure SAS URL from the backend
      // We assume /api/v1/azure-storage/sas-url returns { url, gsUri }
      const signedUrlRes = await fetch(
        `${API_URL}/api/v1/azure-storage/sas-url?type=video/webm`,
      );

      // Fallback to direct upload if the GCS route isn't fully provisioned yet on the backend
      if (!signedUrlRes.ok) {
        toast.loading(
          "Azure SAS Route unavailable. Using direct memory streaming...",
        );
        const formData = new FormData();

        formData.append("video", blob, "ui_glitch_debug.webm");
        formData.append(
          "context",
          "Analyze this UI rendering glitch. Identify CSS/DOM failures and return code fixes.",
        );

        const res = await fetch(`${API_URL}/api/v1/telemetry/video-debug`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          toast.dismiss();
          toast.success("✅ VIDEO_EYE analyzed the recording.");
          if (data.data?.analysis?.reply) {
            // @ts-ignore
            dispatch(
              addMessage({
                reply: `👁️ **VIDEO_EYE Visual Diagnosis Complete**\n\n${data.data.analysis.reply}`,
              }),
            );
          }
        }

        return;
      }

      const signedUrlData = await signedUrlRes.json();
      const { url, gsUri } = signedUrlData.data;

      toast.loading("Azure Storage: Streaming video to Azure Blob...");

      // 2. Direct-to-Blob secure upload (bypassing backend memory constraints)
      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "video/webm" },
        body: blob,
      });

      toast.loading("Azure: Publishing Event to Event Grid Topic...");

      // 3. Trigger Video Indexer asynchronously via Azure Event Grid
      // This publishes the Blob URI to an Event Grid topic, enabling infinite scale and decoupled Swarm analysis.
      const res = await fetch(`${API_URL}/api/v1/telemetry/video-eventgrid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gsUri,
          context: "Analyze this UI rendering glitch.",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.dismiss();
        toast.success("✅ Azure Event Grid: Analysis job queued successfully.");

        // Listen for the async Pub/Sub result on the WebSocket or Poll (Simulated via immediate return for UI demo)
        if (data.data?.analysis?.reply) {
          // @ts-ignore
          dispatch(
            addMessage({
              reply: `👁️ **Azure VIDEO_EYE Visual Diagnosis**\n\n${data.data.analysis.reply}`,
            }),
          );
        }
      } else {
        toast.dismiss();
        toast.error("Event Grid Event failed.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Network error while streaming video to backend.");
    } finally {
      setIsUploading(false);
      chunksRef.current = [];
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 flex items-center justify-center ${isSelected || isRecording || isUploading ? "bg-indigo-500 border-indigo-500" : "bg-black border-gray-300"} ${isRecording ? "animate-pulse" : ""}`}
            type="button"
            onClick={() => {
              if (isSelected || isRecording) {
                setIsSelected(false);
                if (isRecording) stopRecording();
              } else {
                setIsSelected(true);
                if (!isUploading) startRecording();
              }
            }}
          >
            {isUploading ? (
              <UploadCloud className="size-4 animate-spin" />
            ) : isRecording ? (
              <Square className="size-3 fill-white" />
            ) : (
              <Video className="size-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>
            {isUploading
              ? "Uploading..."
              : isRecording
                ? "Stop & Analyze"
                : "Visual Debugger"}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
