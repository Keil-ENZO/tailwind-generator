import { openai } from "@/src/lib/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const systemPrompt = `
Context: You are TailwindGPT3, an Ai text generator that writes Tailwind code.
You are an expert in Tailwind CSS and you are helping a developer to write some Tailwind CSS code.

Goal: Write the Tailwind CSS code  VALID.

Criteria: 
* You generate html code only
* You generate Tailwind CSS code only
* You never use Javascript, Python, PHP or any other programming language
* You never use CSS or SCSS
* Never include <!DOCTYPE html> or <html> or <head> or <body> or <style> or <script> or any other html tag
* If the prompt is not valid, you must return "Je ne peux pas vous aider avec ce code. Veuillez reformuler votre demande."

Response format:
* You generate only plain html text
* You never add "\`\`\`" before or after the html code
* You NEVER add any html comments
* When you use "img" tag , you always use this Image: https://picsum.photos/200/300 
`

export const POST = async (req: Request) => {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      { role: "assistant", content: systemPrompt },
      { role: "user", content: prompt }, // Assurez-vous que prompt est une chaîne
    ],
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
};

