"use client"

import { useState, useCallback } from "react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { ChatMessageList } from "./components/chat-message-list"
import { ChatInput } from "./components/chat-input"
import { ArtifactPanel, type Artifact } from "./components/artifact-panel"
import { type ChatMessageData, type CodeBlock } from "./components/chat-message"
import { type Attachment } from "./components/attachment-chip"

// --- Mock response generation ---

const MOCK_RESPONSES: {
  content: string
  codeBlocks?: CodeBlock[]
}[] = [
  {
    content:
      "Here's a simple React counter component that demonstrates state management with hooks:",
    codeBlocks: [
      {
        language: "tsx",
        code: `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-4xl font-bold">{count}</h1>
      <div className="flex gap-2">
        <button
          onClick={() => setCount(c => c - 1)}
          className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Decrement
        </button>
        <button
          onClick={() => setCount(c => c + 1)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Increment
        </button>
      </div>
    </div>
  )
}

export default Counter`,
      },
    ],
  },
  {
    content:
      "Here's an interactive HTML page you can preview in the artifact panel:",
    codeBlocks: [
      {
        language: "html",
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Demo</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    p { font-size: 1.2rem; opacity: 0.9; }
    .card {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem 3rem;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    button {
      margin-top: 1.5rem;
      padding: 0.75rem 2rem;
      border: 2px solid white;
      background: transparent;
      color: white;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover {
      background: white;
      color: #764ba2;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, Artifacts!</h1>
    <p>This is a live HTML preview</p>
    <button onclick="this.textContent = 'Clicked! 🎉'">Click me</button>
  </div>
</body>
</html>`,
      },
    ],
  },
  {
    content:
      "Great question! Let me explain how async/await works in JavaScript.\n\nThe `async` keyword is used to declare an asynchronous function, which automatically wraps the return value in a Promise. The `await` keyword can only be used inside an async function and pauses execution until the Promise resolves.\n\nHere's how it compares to traditional Promise chaining:\n\n**Promise chaining:**\n```\nfetch(url).then(res => res.json()).then(data => console.log(data))\n```\n\n**Async/await (equivalent):**",
    codeBlocks: [
      {
        language: "javascript",
        code: `async function fetchData(url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    console.log(data)
    return data
  } catch (error) {
    console.error("Failed to fetch:", error)
    throw error
  }
}

// Usage
fetchData("https://api.example.com/data")
  .then(data => {
    // Handle data
  })`,
      },
    ],
  },
  {
    content:
      "I'd be happy to help! Based on what you've shared, I can see a few potential approaches to solve this. The key thing to consider is the trade-off between simplicity and performance.\n\nFor most use cases, the simpler approach will work just fine. You'd only need to optimize if you're dealing with very large datasets or real-time constraints.\n\nLet me know if you'd like me to elaborate on any specific aspect, or if you have other questions!",
  },
  {
    content:
      "Here's a Python script that demonstrates a simple sorting algorithm visualization. The bubble sort algorithm is easy to understand — it repeatedly steps through the list, compares adjacent elements, and swaps them if they're in the wrong order:",
    codeBlocks: [
      {
        language: "python",
        code: `import time
import random

def bubble_sort_visual(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]

            # Visualize current state
            display = ""
            for k, val in enumerate(arr):
                if k == j or k == j + 1:
                    display += f"[{val}] "
                else:
                    display += f" {val}  "
            print(f"\\r{display}", end="", flush=True)
            time.sleep(0.05)

    print()
    return arr

# Generate random array
data = random.sample(range(1, 50), 20)
print(f"Unsorted: {data}")
result = bubble_sort_visual(data)
print(f"Sorted:   {result}")`,
      },
    ],
  },
]

let mockIndex = 0

function getNextMockResponse() {
  const response = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length]
  mockIndex++
  return response
}

// --- Page Component ---

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [activeArtifactIndex, setActiveArtifactIndex] = useState(0)
  const [artifactViewMode, setArtifactViewMode] = useState<"code" | "preview">(
    "code"
  )
  const [showArtifact, setShowArtifact] = useState(false)

  const handleOpenArtifact = useCallback(
    (code: string, language: string, title: string) => {
      const existing = artifacts.findIndex((a) => a.content === code)
      if (existing !== -1) {
        setActiveArtifactIndex(existing)
      } else {
        const newArtifact: Artifact = {
          id: crypto.randomUUID(),
          title,
          content: code,
          language,
        }
        setArtifacts((prev) => [...prev, newArtifact])
        setActiveArtifactIndex(artifacts.length)
      }
      setShowArtifact(true)
      setArtifactViewMode(language === "html" ? "preview" : "code")
    },
    [artifacts]
  )

  function handleSend(text: string, attachments: Attachment[]) {
    // Build user message content
    let content = text
    if (attachments.length > 0) {
      const attachmentTexts = attachments.map((a) =>
        a.type === "text"
          ? `[Attached text: ${a.content.length} chars]`
          : `[Attached file: ${a.name}]`
      )
      content = [content, ...attachmentTexts].filter(Boolean).join("\n")
    }

    const userMsg: ChatMessageData = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    }

    const loadingMsg: ChatMessageData = {
      id: "loading",
      role: "assistant",
      content: "",
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMsg, loadingMsg])
    setIsProcessing(true)

    // Simulate response delay
    setTimeout(() => {
      const mockResponse = getNextMockResponse()
      const assistantMsg: ChatMessageData = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: mockResponse.content,
        codeBlocks: mockResponse.codeBlocks,
      }

      setMessages((prev) =>
        prev.filter((m) => m.id !== "loading").concat(assistantMsg)
      )
      setIsProcessing(false)
    }, 1200 + Math.random() * 800)
  }

  return (
    <div className="flex h-[calc(100vh-1rem)] flex-col">
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        {/* Chat Panel */}
        <ResizablePanel
          defaultSize={showArtifact ? 55 : 100}
          minSize={35}
        >
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-hidden">
              <ChatMessageList
                messages={messages}
                onOpenArtifact={handleOpenArtifact}
              />
            </div>
            <ChatInput onSend={handleSend} disabled={isProcessing} />
          </div>
        </ResizablePanel>

        {/* Artifact Panel */}
        {showArtifact && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={25}>
              <ArtifactPanel
                artifacts={artifacts}
                activeIndex={activeArtifactIndex}
                onActiveIndexChange={setActiveArtifactIndex}
                viewMode={artifactViewMode}
                onViewModeChange={setArtifactViewMode}
                onClose={() => setShowArtifact(false)}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
