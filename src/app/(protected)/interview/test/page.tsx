// pages/realtime-transcription.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [transcript, setTranscript] = useState("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    async function startTranscription() {
      try {
        // 1️⃣ Get ephemeral key from server
        const tokenResponse = await fetch("/api/session");
        const data = await tokenResponse.json();
        const ephemeralKey = data.value;
        if (!ephemeralKey) throw new Error("Failed to get ephemeral key");

        // 2️⃣ Create RTCPeerConnection
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // 3️⃣ Capture microphone audio
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        localStream
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStream));

        // 4️⃣ Create data channel for Realtime events
        const dc = pc.createDataChannel("oai-events");
        dc.onmessage = (evt) => {
          const msg = JSON.parse(evt.data);
          // Incremental transcription
          if (
            msg.type === "conversation.item.input_audio_transcription.delta"
          ) {
            setTranscript((prev) => prev + msg.delta);
          }
          // Completed turn transcription
          if (
            msg.type === "conversation.item.input_audio_transcription.completed"
          ) {
            console.log("Turn completed:", msg.transcript);
          }
        };
        dcRef.current = dc;

        // 5️⃣ Create SDP offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 6️⃣ Send offer to OpenAI Realtime API
        const model = "gpt-4o-transcribe"; // transcription model
        const baseUrl = "https://api.openai.com/v1/realtime/calls";

        const resp = await fetch(baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        });

        const answerSdp = await resp.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

        console.log("Realtime transcription session started!");
      } catch (err) {
        console.error("Realtime transcription error:", err);
      }
    }

    startTranscription();

    // Cleanup
    return () => {
      pcRef.current?.close();
      pcRef.current = null;
      dcRef.current = null;
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Live Transcription</h1>
      <textarea
        readOnly
        value={transcript}
        rows={15}
        className="w-full p-2 border rounded-md"
        placeholder="Speak into your microphone…"
      />
    </div>
  );
}
