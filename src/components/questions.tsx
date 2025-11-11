"use client";

import { ArrowRight, Mic, Keyboard, Hourglass, AudioLines } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface Question {
  id: number;
  text: string;
}

type AnswerMode = "record" | "type";

export default function Questions() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questionTime, setQuestionTime] = useState(0);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("record");
  const isRecording = true; // Will be implemented with audio recording feature

  // Mock questions - replace with actual data
  const questions: Question[] = [
    {
      id: 1,
      text: "Can You provide an Overview of your background and what made you interested in backend systems ?",
    },
    // Add more questions as needed
  ];

  const totalQuestions = 25;
  const currentQuestion = questions[currentQuestionIndex] || questions[0];

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

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setAnswer("");
      setQuestionTime(0);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md gap-2 flex flex-col">
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
        {/* <div className="flex items-center gap-2 flex-shrink-0">
          <Hourglass className="w-6 h-6 text-gray-400" />
          <span className="text-[20px] font-semibold text-[#636ae8]">
            {formatTime(questionTime)} mins
          </span>
        </div> */}
      </div>

      {/* Answer Mode Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setAnswerMode("record")}
          className={`px-6 rounded-md flex items-center  bg-[#636ae8] text-white hover:bg-[#5058c9]`}
        >
          <Mic className="w-5 h-5" />
          Record
        </Button>
        <Button
          onClick={() => setAnswerMode("type")}
          className={`px-6 rounded-md flex items-center  bg-[#f2f2fd] text-[#636ae8] hover:bg-[#e9e9ff]`}
        >
          <Keyboard className="w-5 h-5" />
          Type
        </Button>
      </div>

      <div className="relative">
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[216px] bg-[#f2f2fd] border-[#f2f2fd] text-[#636ae8] text-lg font-bold leading-7 p-3 resize-none focus:ring-0 focus:border-[#636ae8]"
        />
      </div>

      {/* Footer with Question Counter and Next Button */}
      <div className="flex items-center justify-end gap-6">
        <span className="text-md text-[#8c8d8b]">
          {String(currentQuestionIndex + 1).padStart(2, "0")}/{totalQuestions}
        </span>
        <Button
          onClick={handleNext}
          className="bg-[#f2f2fd] text-[#636ae8] hover:bg-[#e9e9ff] hover:text-[#4e57c1] px-6 py-2 rounded-md flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
