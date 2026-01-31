"use client";

import { ArrowRight, Mic, Keyboard, AudioLines, Hourglass } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import InterviewFeedback from "./interview-feedback";
import { uploadInterview } from "@/app/(protected)/interview/actions";

interface Question {
  id: number;
  text: string;
  topic: string;
}

interface QuestionFeedback {
  question: string;
  userAnswer: string;
  areasOfImprovement: string[];
  suggestedAnswer: string;
  score: number;
}

interface InterviewFeedback {
  overallScore: number;
  questionsFeedback: QuestionFeedback[];
  generalComments: string;
}

interface QuestionsProps {
  questions: Question[];
  totalQuestions?: number;
  onBack?: () => void;
  onShowResults?: (show: boolean) => void;
  jobId?: string;
  interviewStartTime?: number | null;
  difficulty?: "easy" | "intermediate" | "hard";
  type?: "technical" | "behavioral" | "mixed";
}

type AnswerMode = "record" | "type";

export default function Questions({
  questions,
  totalQuestions,
  onBack,
  onShowResults,
  jobId,
  interviewStartTime,
  difficulty = "easy",
  type = "technical",
}: QuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questionTime, setQuestionTime] = useState(0);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("record");
  const [isRecording, setIsRecording] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  const total = totalQuestions || questions.length;
  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const isLastQuestion = currentQuestionIndex == questions.length - 1;

  useEffect(() => {
    const interval = setInterval(() => {
      setQuestionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleRecordClick = async () => {
    if (isRecording) {
      // Stop recording
      stopRecording();
      return;
    }

    try {
      // Show loading state
      setIsSettingUp(true);
      setAnswerMode("record");
      setAnswer(""); // Clear previous answer

      // Get ephemeral key from server
      const tokenResponse = await fetch("/api/session");
      const data = await tokenResponse.json();
      const ephemeralKey = data.value;

      if (!ephemeralKey) {
        console.error("Failed to get ephemeral key");
        setIsSettingUp(false);
        return;
      }

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Capture microphone audio
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setAudioStream(localStream);
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      // Create data channel for Realtime events
      const dc = pc.createDataChannel("oai-events");

      // Wait for data channel to open before starting recording
      dc.onopen = () => {
        console.log("Data channel opened - ready to record");
        setIsSettingUp(false);
        setIsRecording(true);
      };

      dc.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        // Incremental transcription
        if (msg.type === "conversation.item.input_audio_transcription.delta") {
          setAnswer((prev) => prev + msg.delta);
        }
        // Completed turn transcription
        if (
          msg.type === "conversation.item.input_audio_transcription.completed"
        ) {
          console.log("Turn completed:", msg.transcript);
        }
      };
      dcRef.current = dc;

      // Create SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API
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

      console.log("Realtime transcription session setup complete!");
    } catch (error) {
      console.error("Error starting transcription:", error);
      setIsSettingUp(false);
      setIsRecording(false);
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
    dcRef.current = null;
    setIsRecording(false);
    setIsSettingUp(false);
  };

  const handleNext = () => {
    // Save the current answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      // Load the answer for the next question if it exists
      setAnswer(answers[questions[nextIndex].id] || "");
      setQuestionTime(0);
    }
  };

  const handleFinish = async () => {
    // Save the final answer
    const finalAnswers = {
      ...answers,
      [currentQuestion.id]: answer,
    };
    setAnswers(finalAnswers);

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    // Show results
    setShowResults(true);

    // Notify parent that results are being shown
    if (onShowResults) {
      onShowResults(true);
    }

    // Generate feedback
    setIsGeneratingFeedback(true);
    setFeedbackError(null);

    try {
      const interviewData = questions.map((q) => ({
        questionId: q.id,
        question: q.text,
        answer: finalAnswers[q.id] || "",
      }));

      const response = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interviewData }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate feedback");
      }

      setFeedback(data.data);

      // Save interview feedback to database
      if (jobId && interviewStartTime) {
        const interviewDuration = Math.floor(
          (Date.now() - interviewStartTime) / 1000
        );

        const uploadResult = await uploadInterview({
          jobId,
          overallScore: data.data.overallScore,
          generalComments: data.data.generalComments,
          questionsFeedback: data.data.questionsFeedback,
          interviewDuration,
          difficulty,
          type,
        });

        if (!uploadResult.success) {
          console.error(
            "Failed to save interview feedback:",
            uploadResult.error
          );
          // Note: We don't show this error to the user since feedback was generated successfully
        }
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      setFeedbackError(
        error instanceof Error ? error.message : "Failed to generate feedback"
      );
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleBack = () => {
    // Reset all state
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setAnswer("");
    setAnswers({});
    setQuestionTime(0);

    // Notify parent that results are no longer being shown
    if (onShowResults) {
      onShowResults(false);
    }

    // Call the parent's onBack callback if provided
    if (onBack) {
      onBack();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  // Results view
  if (showResults) {
    return (
      <InterviewFeedback
        feedback={feedback}
        isGenerating={isGeneratingFeedback}
        error={feedbackError}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="bg-card rounded-lg p-4 shadow-xl rounded-xl gap-2 w-full flex flex-1 flex-col">
      {/* Question Header with Audio Visualization and Timer */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Audio Visualization */}
          <div className="flex items-center ">
            <AudioLines className="text-primary" />
            <AudioLines className="text-primary" />
            <AudioLines className="text-primary" />
          </div>

          {/* Question Text */}
          <p className="text-xl text-foreground ">{currentQuestion.text}</p>
        </div>

        {/* Timer with Hourglass */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Hourglass className="w-6 h-6 text-muted-foreground/70" />
          <span className="text-[20px]  text-primary">
            {formatTime(questionTime)} mins
          </span>
        </div>
      </div>

      {/* Answer Mode Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleRecordClick}
          disabled={isSettingUp}
          className={`px-6 rounded-md flex items-center gap-2 ${
            isRecording
              ? "bg-red-500 text-white hover:bg-red-600"
              : isSettingUp
              ? "bg-primary-light text-white cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-hover"
          }`}
        >
          {isSettingUp ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              {isRecording ? "Stop Recording" : "Record"}
            </>
          )}
        </Button>
        <Button
          onClick={() => {
            setAnswerMode("type");
            if (isRecording) {
              stopRecording();
            }
          }}
          className={`px-6 rounded-md flex items-center gap-2 bg-primary-lighter text-primary hover:bg-primary-light`}
          disabled={isRecording || isSettingUp}
        >
          <Keyboard className="w-5 h-5" />
          Type
        </Button>
      </div>

      <div className="relative">
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={
            isSettingUp
              ? "Setting up audio connection..."
              : isRecording
              ? "Speak into your microphone... transcription will appear here"
              : answerMode === "type"
              ? "Type your answer here..."
              : "Your answer will appear here"
          }
          readOnly={isRecording || isSettingUp}
          className="min-h-[30vh] bg-primary-lighter border-primary-lighter text-primary text-lg p-3 resize-none focus:ring-0 focus:border-primary"
        />
        {isSettingUp && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-primary font-medium">
              Connecting...
            </span>
          </div>
        )}
        {isRecording && !isSettingUp && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-500 font-medium">Recording</span>
          </div>
        )}
      </div>

      {/* Footer with Question Counter and Next Button */}
      <div className="flex items-center justify-end gap-6">
        <span className="text-md text-muted-foreground">
          {String(currentQuestionIndex + 1).padStart(2, "0")}/{total}
        </span>
        {isLastQuestion ? (
          <Button
            onClick={handleFinish}
            className="bg-primary text-white hover:bg-primary-hover px-6 py-2 rounded-md flex items-center gap-2"
          >
            Finish
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-primary-lighter text-primary hover:bg-primary-light hover:text-primary-hover px-6 py-2 rounded-md flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
