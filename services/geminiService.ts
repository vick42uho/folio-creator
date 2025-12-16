
import { GoogleGenAI } from "@google/genai";
import { Language, PortfolioData, ThemeOption } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Shared Persona Definition for consistency across Enhance and Suggestions
const PERSONA_TH = `
บุคลิกของผู้เขียน (Persona):
- เป็นคน Introvert (พูดไม่เก่ง) แต่มีความจริงใจและซื่อสัตย์มาก
- ถ่อมตน (Humble) ไม่โอ้อวดว่าเก่งเทพ แต่จะเน้นว่า "พร้อมเรียนรู้" และ "สอนได้" (Teachable)
- จุดขาย: ขยัน อดทนสูง รับแรงกดดันได้ดีเยี่ยม สู้งานหนัก (Grit)
- Mindset: "ถึงวันนี้อาจจะยังไม่เก่งที่สุด แต่สัญญาว่าจะขยันและเรียนรู้ให้ไวที่สุด"
`;

const PERSONA_EN = `
Writer Persona:
- Introverted but sincere and honest.
- Humble: Doesn't brag about being a wizard, but emphasizes being "Teachable" and eager to learn.
- Key Selling Points: Hardworking, Resilient, High tolerance for pressure, Grit.
- Mindset: "I might not be the expert yet, but I will work the hardest to learn and deliver."
`;

export const enhanceText = async (text: string, lang: Language, context: string = ''): Promise<string> => {
  if (!text || text.length < 5) return text;
  
  try {
    let prompt = '';
    
    if (lang === Language.TH) {
      prompt = `คุณคือบรรณาธิการ Resume มืออาชีพ
      
      บริบท: ${context}
      ข้อความเดิม: "${text}"
      
      ภารกิจ: รีไรท์ข้อความนี้ใหม่ โดยใช้บุคลิกดังนี้:
      ${PERSONA_TH}
      
      กฎเหล็ก:
      1. ห้ามใช้ศัพท์แสง AI (บูรณาการ, ขับเคลื่อน, พลวัต) ให้ใช้ภาษาคนทำงาน
      2. ต้องรักษาความหมายเดิมของข้อความไว้ แต่ปรับ Tone ให้ดูน่าจ้างงาน (น่าเอ็นดูและไว้ใจได้)
      3. กระชับ สุภาพ
      
      ส่งคืนเฉพาะข้อความที่แก้แล้ว`;
    } else {
      prompt = `You are a Professional Resume Editor.
      
      Context: ${context}
      Original Text: "${text}"
      
      Task: Rewrite this text using the following persona:
      ${PERSONA_EN}
      
      Strict Rules:
      1. No AI Jargon (Synergy, Leverage). Use simple, strong verbs.
      2. Keep the original meaning but make it sound like a dedicated, humble employee.
      3. Concise and professional.
      
      Return ONLY the rewritten text.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini enhancement failed:", error);
    return text;
  }
};

export const translateText = async (text: string, targetLang: Language): Promise<string> => {
  if (!text) return text;

  try {
    const prompt = targetLang === Language.TH
      ? `Translate to Thai. Style: Professional, Authentic, Natural. Text: "${text}"`
      : `Translate to English. Style: Professional, Authentic, Natural. Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini translation failed:", error);
    return text;
  }
};

export const generateSuggestion = async (
  section: 'about' | 'experience' | 'project',
  jobTitle: string,
  skills: string = '',
  lang: Language
): Promise<string> => {
  try {
    let prompt = '';
    
    // Thai Prompts - Generate a "Draft" that acts as a Guide
    if (lang === Language.TH) {
        let guideInstruction = "";
        
        if (section === 'about') {
            guideInstruction = `เขียนร่าง "แนะนำตัว" (About Me) สำหรับตำแหน่ง "${jobTitle}" (ทักษะ: "${skills}")
            - เริ่มต้นด้วยการบอกว่าเป็นคนบุคลิกยังไง (ตาม Persona: Introvert, ตั้งใจทำงาน)
            - บอกความตั้งใจ: แม้จะยังต้องเรียนรู้เพิ่ม แต่พร้อมสู้งานหนักและรับแรงกดดันได้
            - จบด้วยเป้าหมาย: อยากฝากเนื้อฝากตัวทำงานที่นี่`;
        } else if (section === 'experience') {
            guideInstruction = `เขียนร่าง "รายละเอียดงาน" (Job Description) สำหรับตำแหน่ง "${jobTitle}"
            - เน้นว่ารับผิดชอบงานที่ได้รับมอบหมายอย่างซื่อสัตย์และตรงเวลา
            - ถ้าเจอปัญหาหรือแรงกดดัน ก็อดทนแก้จนสำเร็จ
            - เน้นการทำงานเป็นทีมแบบถ่อมตน (ช่วยเพื่อนร่วมงาน, รับฟังหัวหน้า)`;
        } else if (section === 'project') {
            guideInstruction = `เขียนร่าง "คำอธิบายโปรเจกต์" ชื่อ "${jobTitle}" (ใช้ Tech: "${skills}")
            - เล่าว่าโปรเจกต์นี้ตั้งใจทำเพื่อแก้ปัญหาอะไร
            - ยอมรับว่าระหว่างทำเจออุปสรรค (Bug/Error) แต่ก็พยายามเรียนรู้และแก้จนได้
            - ภูมิใจที่ได้ใช้ทักษะ "${skills}" สร้างงานนี้ขึ้นมา`;
        }

        prompt = `คุณคือ Career Coach ที่กำลังช่วยน้องจบใหม่/คนทำงานสาย Introvert เขียน Resume
        
        โจทย์: ${guideInstruction}
        
        สิ่งที่ต้องทำ:
        - เขียน "ตัวอย่างข้อความ" (Draft) ให้ผู้ใช้นำไปใช้ได้เลย
        - **ห้าม** เขียนเป็นคำสั่ง (เช่น "ควรเขียนว่า...") แต่ให้เขียนเป็น "เนื้อหา" เลย
        - **Tone**: ${PERSONA_TH}
        - ภาษา: เป็นธรรมชาติ ไม่ทางการจนเกร็ง และไม่เล่นจนเกินไป
        - ความยาว: 2-3 บรรทัด
        
        ส่งคืนเฉพาะเนื้อหาตัวอย่างเท่านั้น`;

    } else {
        // English Prompts
        let guideInstruction = "";
        
        if (section === 'about') {
            guideInstruction = `Draft an "About Me" section for a "${jobTitle}" skilled in "${skills}".
            - Mention being introverted but focused and reliable.
            - Highlight resilience and ability to handle pressure.
            - State that you are humble, teachable, and ready to grow with the company.`;
        } else if (section === 'experience') {
            guideInstruction = `Draft a "Job Description" for the role of "${jobTitle}".
            - Focus on reliability and honesty in delivering tasks.
            - Mention handling pressure well and learning from mistakes.
            - Emphasize being a supportive team player who listens.`;
        } else if (section === 'project') {
            guideInstruction = `Draft a "Project Description" for "${jobTitle}" using "${skills}".
            - Explain the problem solved and the dedication put into it.
            - Mention overcoming technical challenges through persistence.
            - Express pride in learning and applying "${skills}".`;
        }

        prompt = `Act as a Career Coach helping a humble, introverted candidate.
        
        Task: ${guideInstruction}
        
        Output Requirements:
        - Provide a **Ready-to-use Draft**.
        - Do NOT provide instructions (e.g., "You should write..."). Just give the text.
        - **Tone**: ${PERSONA_EN}
        - Style: Authentic, Human, Sincere.
        - Length: 2-3 concise lines.
        
        Return ONLY the draft content.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini suggestion failed:", error);
    return "";
  }
};

export const generateCoverLetter = async (
  data: PortfolioData,
  companyName: string,
  lang: Language
): Promise<string> => {
  try {
    const prompt = lang === Language.TH 
    ? `เขียนจดหมายสมัครงาน (Cover Letter) สั้นๆ แต่จริงใจ
       
       ผู้สมัคร: ${data.fullName}
       ตำแหน่งปัจจุบัน: ${data.title}
       สมัครงานที่บริษัท: ${companyName || '[ชื่อบริษัท]'}
       ทักษะเด่น: ${data.skills}
       ประสบการณ์คร่าวๆ: ${data.experiences[0]?.role} at ${data.experiences[0]?.company}
       
       Tone: ${PERSONA_TH}
       
       โครงสร้าง:
       1. ทักทาย
       2. แนะนำตัวสั้นๆ และบอกว่าทำไมถึงสนใจที่นี่
       3. ขายของ (Skill & Experience) แบบถ่อมตนแต่เอาจริง
       4. จบด้วยการขอโอกาสสัมภาษณ์
       `
    : `Write a sincere, professional Cover Letter.
    
       Applicant: ${data.fullName}
       Current Role: ${data.title}
       Target Company: ${companyName || '[Company Name]'}
       Key Skills: ${data.skills}
       Key Exp: ${data.experiences[0]?.role} at ${data.experiences[0]?.company}
       
       Tone: ${PERSONA_EN}
       
       Structure:
       1. Salutation
       2. Brief Intro & Why this company
       3. Value proposition (Humble but gritty)
       4. Call to Action (Interview request)
       `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Cover letter generation failed:", error);
    return "Could not generate cover letter. Please try again.";
  }
};

export interface PortfolioAnalysis {
    score: number;
    strengths: string[];
    improvements: string[];
    interviewQuestions: string[];
}

export const analyzePortfolio = async (data: PortfolioData, lang: Language): Promise<PortfolioAnalysis> => {
    try {
        const resumeContent = JSON.stringify(data);
        const prompt = lang === Language.TH 
        ? `Act as a Senior HR Manager. Analyze this resume data JSON: ${resumeContent}.
           Output a valid JSON object ONLY (no markdown code blocks) with this structure:
           {
             "score": number (0-100),
             "strengths": ["string", "string", "string"] (3 items in Thai),
             "improvements": ["string", "string", "string"] (3 specific items in Thai about what to fix),
             "interviewQuestions": ["string", "string", "string"] (3 challenging questions in Thai based on their specific projects/experience)
           }`
        : `Act as a Senior HR Manager. Analyze this resume data JSON: ${resumeContent}.
           Output a valid JSON object ONLY (no markdown code blocks) with this structure:
           {
             "score": number (0-100),
             "strengths": ["string", "string", "string"] (3 items),
             "improvements": ["string", "string", "string"] (3 specific items to fix),
             "interviewQuestions": ["string", "string", "string"] (3 challenging questions based on specific projects/experience)
           }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        // Parse JSON output
        const text = response.text || "{}";
        const result = JSON.parse(text);
        
        return {
            score: result.score || 70,
            strengths: result.strengths || [],
            improvements: result.improvements || [],
            interviewQuestions: result.interviewQuestions || []
        };
    } catch (error) {
        console.error("Analysis failed:", error);
        return {
            score: 0,
            strengths: [],
            improvements: ["Error analyzing data. Please try again."],
            interviewQuestions: []
        };
    }
}

export interface DesignSuggestion {
    color: string;
    theme: ThemeOption;
    reasoning: string;
}

export const suggestDesign = async (jobTitle: string, skills: string): Promise<DesignSuggestion | null> => {
    try {
        const prompt = `
        You are a Professional Design Consultant.
        Based on the Job Title: "${jobTitle}" and Skills: "${skills}", suggest the best visual theme for a portfolio.
        
        Rules:
        - Apply Color Psychology (e.g., Banking -> Navy Blue, Creative -> Purple/Pink, Environmental -> Green, Tech/Cyber -> Dark/Neon).
        - Select one layout theme from: 'modern', 'minimal', 'creative', 'cyber'.
        
        Output JSON only:
        {
          "color": "#hexcode",
          "theme": "modern" | "minimal" | "creative" | "cyber",
          "reasoning": "Short explanation in English why this fits"
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text || "{}";
        return JSON.parse(text) as DesignSuggestion;
    } catch (error) {
        console.error("Design suggestion failed:", error);
        return null;
    }
};
