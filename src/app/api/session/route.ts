import { NextResponse } from "next/server";

const sessionConfig = JSON.stringify({
  session: {
    type: "transcription", // important: transcription session
    audio: {
      input: {
        format: {
          type: "audio/pcm",
          rate: 24000,
        },
        transcription: {
          model: "gpt-4o-transcribe",
          language: "en",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      },
    },
    include: ["item.input_audio_transcription.logprobs"],
  },
});

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: sessionConfig,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate session token", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Session token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate session token" },
      { status: 500 }
    );
  }
}
