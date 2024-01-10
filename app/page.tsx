"use client";

import { Sparkles, Trash2 } from "lucide-react";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [htmlCode, setHtmlCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);

  const useTimedState = (state: unknown, delay = 2000) => {
    const [timedState, setTimedState] = useState(state);

    const lastUpdateRef = useRef(Date.now());

    useEffect(() => {
      if (Date.now() - lastUpdateRef.current < delay) {
        setTimedState(state);

        lastUpdateRef.current = Date.now();
      } else {
        const timeout = setTimeout(() => {
          setTimedState(state);
          lastUpdateRef.current = Date.now();
        }, delay - (Date.now() - lastUpdateRef.current));

        return () => clearTimeout(timeout);
      }
    }, [state, delay]);

    return timedState;
  };
  const timedHtmlCode = useTimedState(htmlCode, 1000);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    const formData = new FormData(event.currentTarget);
    const userPrompt = formData.get("prompt") as string;

    setLoading(true);

    const newMessages: ChatCompletionMessageParam[] = [
      ...messages,
      { content: userPrompt, role: "user" },
    ];

    setMessages(newMessages);

    const result = await fetch("/api/tailwind", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: newMessages }),
    });

    const body = await result.text();

    if (!body) {
      alert("No body");
      return;
    }

    setHtmlCode(body);
    setLoading(false);

    setMessages((current) => [
      ...current,
      { content: body, role: "assistant" },
    ]);

    console.log("User Prompt:", userPrompt);
  };

  return (
    <main className="h-full relative">
      {loading ? (
        <div className="absolute top-4 left-0 right-0 flex items-center justify-center">
          <progress className="progress progress-primary w-56 " />
        </div>
      ) : null}

      {timedHtmlCode ? (
        <iframe
          className="h-full w-full"
          srcDoc={`<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
              
                <title>CodePen - Tainlwind css</title>
              </head>
              <body>
                ${timedHtmlCode}
              </body>
            </html>`}
        />
      ) : null}

      <div className="fixed bottom-4 left-0 right-0 flex items-center justify-center">
        <div className="p-4 bg-base-200 max-w-lg w-full rounded-lg shadow-xl">
          <div
            className="max-w-full overflow-auto flex flex-col gap-1"
            style={{ maxHeight: 200 }}
          >
            {messages
              .filter((m) => m.role === "user")
              .map((message, index) => (
                <div key={index}>You: {String(message.content)}</div>
              ))}
          </div>
          <form onSubmit={handleSubmit}>
            <fieldset className="flex items-start gap-4">
              <textarea
                name="prompt"
                className="textarea textarea-primary w-full"
              />
              <div className="flex flex-col gap-1">
                <button className="btn btn-primary btn-sm" type="submit">
                  <Sparkles size={20} />
                </button>

                <button
                  className="btn btn-neutral btn-sm"
                  type="button"
                  onClick={() => {
                    setHtmlCode("");
                    setMessages([]);
                  }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </main>
  );
}
