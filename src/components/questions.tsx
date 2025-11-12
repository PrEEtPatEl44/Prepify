"use client";

import { ArrowRight, Mic, Keyboard, AudioLines, Hourglass } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

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
}

type AnswerMode = "record" | "type";

export default function Questions({
  questions,
  totalQuestions,
  onBack,
  onShowResults,
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
      <div className="bg-white rounded-lg p-6 shadow-md gap-6 min-w-4xl flex flex-col max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-white z-10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#171a1f]">
              Interview Feedback
            </h2>
            {feedback && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg text-gray-600">Overall Score:</span>
                <span
                  className={`text-2xl font-bold ${
                    feedback.overallScore >= 80
                      ? "text-green-600"
                      : feedback.overallScore >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {feedback.overallScore}/100
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={handleBack}
            className="bg-[#636ae8] text-white hover:bg-[#5058c9] px-6 py-2 rounded-md"
          >
            Back
          </Button>
        </div>

        {isGeneratingFeedback ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 border-4 border-[#636ae8] border-t-transparent rounded-full animate-spin" />
            <h3 className="text-xl font-semibold text-gray-800">
              Generating Your Feedback...
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Our AI is analyzing your responses and preparing detailed feedback
              to help you improve
            </p>
          </div>
        ) : feedbackError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Failed to Generate Feedback
            </h3>
            <p className="text-red-600">{feedbackError}</p>
          </div>
        ) : feedback ? (
          <div className="space-y-6">
            {/* General Comments */}
            {feedback.generalComments && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  General Comments
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  {feedback.generalComments}
                </p>
              </div>
            )}

            {/* Question-by-Question Feedback */}
            <div className="space-y-6">
              {feedback.questionsFeedback.map((qf, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-5 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      Question {index + 1}
                    </h3>
                    <span
                      className={`text-lg font-bold px-3 py-1 rounded-full ${
                        qf.score >= 80
                          ? "bg-green-100 text-green-700"
                          : qf.score >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {qf.score}/100
                    </span>
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <p className="text-[#636ae8] font-medium text-base">
                      {qf.question}
                    </p>
                  </div>

                  {/* User's Answer */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Your Answer:
                    </h4>
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {qf.userAnswer || "No answer provided"}
                      </p>
                    </div>
                  </div>

                  {/* Areas of Improvement */}
                  {qf.areasOfImprovement.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Areas of Improvement:
                      </h4>
                      <ul className="space-y-2">
                        {qf.areasOfImprovement.map((area, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="text-[#636ae8] mt-1">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Answer */}
                  {qf.suggestedAnswer && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Suggested Answer:
                      </h4>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {qf.suggestedAnswer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-xl rounded-xl gap-2 w-full flex flex-1 flex-col">
      {/* Question Header with Audio Visualization and Timer */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Audio Visualization */}
          <div className="flex items-center ">
            <AudioLines className="text-[#636AE8]" />
            <AudioLines className="text-[#636AE8]" />
            <AudioLines className="text-[#636AE8]" />
          </div>

          {/* Question Text */}
          <p className="text-xl text-[#171a1f] ">{currentQuestion.text}</p>
        </div>

        {/* Timer with Hourglass */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Hourglass className="w-6 h-6 text-gray-400" />
          <span className="text-[20px]  text-[#636ae8]">
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
              ? "bg-[#9ca3f0] text-white cursor-not-allowed"
              : "bg-[#636ae8] text-white hover:bg-[#5058c9]"
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
          className={`px-6 rounded-md flex items-center gap-2 bg-[#f2f2fd] text-[#636ae8] hover:bg-[#e9e9ff]`}
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
          className="min-h-[30vh] bg-[#f2f2fd] border-[#f2f2fd] text-[#636ae8] text-lg p-3 resize-none focus:ring-0 focus:border-[#636ae8]"
        />
        {isSettingUp && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#636ae8] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#636ae8] font-medium">
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
        <span className="text-md text-[#8c8d8b]">
          {String(currentQuestionIndex + 1).padStart(2, "0")}/{total}
        </span>
        {isLastQuestion ? (
          <Button
            onClick={handleFinish}
            className="bg-[#636ae8] text-white hover:bg-[#5058c9] px-6 py-2 rounded-md flex items-center gap-2"
          >
            Finish
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-[#f2f2fd] text-[#636ae8] hover:bg-[#e9e9ff] hover:text-[#4e57c1] px-6 py-2 rounded-md flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
