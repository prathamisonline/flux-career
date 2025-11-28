import { GoogleGenAI } from "@google/genai";

export const generateCoverLetter = async (
  jobDescription: string, 
  resumeText: string,
  userName: string,
  tone: string,
  length: string, // e.g., 'Short', 'Medium', 'Long'
  language: string, // e.g., 'English', 'Spanish'
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Word count mapping
  const wordCountMap: Record<string, string> = {
    'Short': 'under 200 words',
    'Medium': 'approx 300 words',
    'Long': 'approx 500 words'
  };
  const lengthInstruction = wordCountMap[length] || 'approx 300 words';

  // Conditional part of the prompt based on whether resume is provided
  const contextSection = resumeText 
    ? `CANDIDATE'S RESUME/EXPERIENCE:\n"${resumeText}"\n\nINSTRUCTION: Use the candidate's actual skills and experience from the resume above to match the job requirements. Do not invent experiences not found in the resume.`
    : `INSTRUCTION: The candidate has not provided a resume. Generalize the experience based on the job requirements without using bracketed placeholders. Write as if the candidate has the required skills.`;

  const prompt = `You are an expert career counselor and professional writer. 

JOB DESCRIPTION:
${jobDescription}

${contextSection}

TASK:
Generate a highly personalized, compelling cover letter in ${language}.

REQUIREMENTS:
1. Tone: ${tone}
2. Length: ${lengthInstruction}. STRICTLY adhere to this length.
3. Language: Write entirely in ${language}.
4. Structure: Hook -> Skills/Match -> Cultural Fit -> Call to Action.
5. Sign off with: "Best regards,\n${userName || '[Your Name]'}"
6. IMPORTANT: Do NOT include any header contact info (address, phone, email) or the date at the top. The application handles the header design. START DIRECTLY with the salutation (e.g., "Dear Hiring Team,").
7. Do NOT use bracketed placeholders like [Date], [Company Address], or [Hiring Manager Name]. If this information is not in the Job Description, address the letter generally (e.g., to "Hiring Team") and omit the date/address block completely. Do not invent placeholders.
8. Avoid generic AI clichés like "I am writing to", "thrilled to", "delve into". Start strong.

Cover Letter Body:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No content generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate cover letter");
  }
};

export const generateInterviewQuestions = async (
  jobDescription: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Based on this Job Description, generate 5 specific, high-probability interview questions a hiring manager would ask. For each question, provide a brief "Tip" on what they are looking for in the answer.

  Job Description:
  ${jobDescription.substring(0, 2000)}

  Format:
  1. **Question**: [Question text]
     *Tip*: [Brief advice]
  
  (Repeat for 5 questions)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Failed to generate questions.";
  } catch (error) {
    return "Error generating interview questions.";
  }
};

export const generateTailoredResume = async (
  jobDescription: string,
  resumeText: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");
  if (!resumeText) throw new Error("Resume text is required to generate a tailored resume.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert Resume Writer and ATS Optimizer.
    
    JOB DESCRIPTION:
    ${jobDescription}

    CANDIDATE'S ORIGINAL RESUME CONTENT:
    ${resumeText}

    TASK:
    Rewrite the candidate's resume to specifically target the Job Description above. 
    1. **Summary**: Write a powerful 3-4 line professional summary using keywords from the JD.
    2. **Skills**: Create a "Core Competencies" section listing hard skills found in both the JD and the candidate's background.
    3. **Experience**: Rewrite the bullet points. Prioritize achievements that match the JD's requirements. Use strong action verbs. Quantify results where possible.
    4. **Formatting**: Return the result as clean HTML tags. Use <h3> for Section Headers, <ul>/<li> for lists, <p> for text, and <strong> for emphasis. Do NOT use <html> or <body> tags.
    
    STRUCTURE EXAMPLE:
    <h3>PROFESSIONAL SUMMARY</h3>
    <p>Dynamic software engineer...</p>
    
    <h3>CORE COMPETENCIES</h3>
    <p>React, Node.js, Typescript...</p>

    <h3>PROFESSIONAL EXPERIENCE</h3>
    <div>
      <strong>Senior Engineer</strong> | Tech Corp | 2020 - Present
      <ul>
        <li>Led development of...</li>
      </ul>
    </div>

    IMPORTANT: 
    - Do NOT include the contact header (Name/Email/Phone).
    - Return ONLY the HTML body content. No markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    let text = response.text || "";
    // Cleanup markdown if present
    text = text.replace(/```html/g, '').replace(/```/g, '');
    return text;
  } catch (error: any) {
    throw new Error("Failed to generate resume: " + error.message);
  }
};