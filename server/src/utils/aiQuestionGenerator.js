import llm from "../config/llm.js";
import { HumanMessage } from "@langchain/core/messages";

export const generateQuestionsFromText = async ({
    text,
    difficulty,
    subjects,
    count,
    language,
}) => {

    const prompt = `
You are an exam question generator API.

STRICT RULES (follow exactly):
- Return ONLY raw JSON
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include backticks
- Do NOT include text before or after JSON

Syllabus:
${text}

Requirements:
- Subject: ${subjects.join(", ")}
- Difficulty: ${difficulty}
- Language: ${language}
- Number of questions: ${count}

JSON FORMAT (STRICT):
[
  {
    "text": "question text",
    "marks": number,
    "subject": "subject",
    "difficulty": "difficulty",
    "language": "language"
  }
]
`;

    const response = await llm.invoke([
        new HumanMessage(prompt),
    ]);

    const raw = response.content;

    // 🔥 SAFE JSON EXTRACTION (KEY FIX)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
        console.error("RAW AI RESPONSE:", raw);
        throw new Error("AI did not return JSON");
    }

    let questions;
    try {
        questions = JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error("RAW AI RESPONSE:", raw);
        throw new Error("AI returned invalid JSON");
    }

    return questions.map(q => ({
        ...q,
        source: "deepseek-ai",
    }));
};