
export enum Language {
  TH = 'TH',
  EN = 'EN'
}

export type ThemeOption = 'modern' | 'minimal' | 'creative' | 'cyber';

export interface LayoutConfig {
  order: string[]; // Array of section IDs e.g. ['about', 'skills', 'experience', 'projects', 'education']
  scale: number;   // Font size scaler (0.8 - 1.2)
  spacing: number; // Gap scaler (1 - 4)
}

export interface LinkItem {
  id: string;
  platform: string; // e.g., 'LinkedIn', 'GitHub', 'Website'
  url: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
}

export interface PortfolioData {
  profileImage?: string; // Base64 string for the image
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: LinkItem[]; // New field for social links
  about: string;
  skills: string; // Comma separated
  experiences: Experience[];
  education: Education[];
  projects: Project[];
}

export const INITIAL_DATA: PortfolioData = {
  profileImage: "", 
  fullName: "Somsri Jai-dee",
  title: "Senior Frontend Developer",
  email: "somsri.dev@example.com",
  phone: "+66 81 234 5678",
  location: "Bangkok, Thailand",
  links: [
    { id: '1', platform: 'LinkedIn', url: 'linkedin.com/in/somsri' },
    { id: '2', platform: 'GitHub', url: 'github.com/somsri-dev' }
  ],
  about: "Passionate developer with 5 years of experience in building scalable web applications. I love creating beautiful and functional user interfaces.",
  skills: "React, TypeScript, Tailwind CSS, Node.js, UX/UI Design",
  experiences: [
    {
      id: '1',
      role: "Senior Frontend Engineer",
      company: "Tech Giant Co., Ltd.",
      duration: "2021 - Present",
      description: "Leading the frontend team to rebuild the core product using React and Next.js. Improved performance by 40%."
    }
  ],
  education: [
    {
      id: '1',
      degree: "B.Sc. Computer Science",
      institution: "Chulalongkorn University",
      year: "2017"
    }
  ],
  projects: [
    {
      id: '1',
      name: "E-Commerce Platform",
      description: "A full-featured online store with payment gateway integration.",
      technologies: "Next.js, Stripe, PostgreSQL"
    }
  ]
};

export const LABELS = {
  [Language.EN]: {
    personalInfo: "Personal Information",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    about: "About Me",
    generatePDF: "Download PDF",
    generatePNG: "Download PNG",
    enhanceWithAI: "Enhance with AI",
    suggestWithAI: "Get AI Ideas",
    translateToThai: "Translate to Thai",
    translateToEng: "Translate to English",
    add: "Add",
    remove: "Remove",
    preview: "Preview",
    editor: "Editor",
    role: "Role",
    company: "Company",
    duration: "Duration",
    description: "Description",
    degree: "Degree",
    institution: "Institution",
    year: "Year",
    projectName: "Project Name",
    technologies: "Technologies",
    generating: "Generating...",
    contact: "Contact",
    uploadPhoto: "Upload Photo",
    removePhoto: "Remove Photo",
    links: "Social Links",
    platform: "Platform (e.g. LinkedIn)",
    url: "URL",
    layoutSettings: "Layout Settings",
    scale: "Size",
    spacing: "Spacing",
    reorder: "Reorder Sections",
    quickPresets: "Quick Presets:",
    developer: "Developer",
    designer: "Designer",
    marketing: "Marketing",
    draftCoverLetter: "Draft Cover Letter",
    coverLetterGenerator: "Cover Letter Generator",
    applyingTo: "Applying to Company (Optional)",
    placeholderCompany: "e.g. Google, SCB, Agoda",
    clickToGenerate: "Click generate to draft a letter using your portfolio data.",
    generateDraft: "Generate Draft",
    tryAgain: "Try Again",
    copyClipboard: "Copy to Clipboard",
    copied: "Copied to clipboard!",
    // Career Coach
    aiAssistant: "AI Assistant",
    careerCoach: "Review & Interview",
    analyzing: "Analyzing Profile...",
    analysisResult: "Analysis Result",
    score: "Resume Score",
    strengths: "Strengths",
    improvements: "Improvements",
    interviewPrep: "Interview Prep",
    interviewDesc: "Based on your profile, prepare for these questions:",
    refreshAnalysis: "Refresh Analysis",
    // Smart Design
    magicDesign: "Magic Design",
    magicDesignDesc: "Auto-pick color & layout based on your role",
    applyingDesign: "Designing...",
    // Payment (Support)
    paymentRequired: "Support Developer ☕",
    paymentDesc: "This tool is free forever. If you like it, you can support the developer (Optional).",
    price: "~2.00 THB",
    scanToPay: "Scan to Support",
    confirmPayment: "Download Now",
    checkingPayment: "Processing...",
    paymentSuccess: "Thank You!",
    uploadSlip: "Attach Slip (Optional)",
    slipAttached: "Slip Attached",
    slipHint: "You can download directly without donating if you prefer.",
  },
  [Language.TH]: {
    personalInfo: "ข้อมูลส่วนตัว",
    experience: "ประสบการณ์ทำงาน",
    education: "การศึกษา",
    skills: "ทักษะ",
    projects: "โปรเจกต์",
    about: "เกี่ยวกับฉัน",
    generatePDF: "ดาวน์โหลด PDF",
    generatePNG: "ดาวน์โหลด PNG",
    enhanceWithAI: "ปรับปรุงด้วย AI",
    suggestWithAI: "ขอไอเดียจาก AI",
    translateToThai: "แปลเป็นไทย",
    translateToEng: "แปลเป็นอังกฤษ",
    add: "เพิ่ม",
    remove: "ลบ",
    preview: "ตัวอย่าง",
    editor: "แก้ไขข้อมูล",
    role: "ตำแหน่ง",
    company: "บริษัท",
    duration: "ระยะเวลา",
    description: "รายละเอียด",
    degree: "วุฒิการศึกษา",
    institution: "สถาบัน",
    year: "ปีที่จบ",
    projectName: "ชื่อโปรเจกต์",
    technologies: "เทคโนโลยีที่ใช้",
    generating: "กำลังประมวลผล...",
    contact: "ช่องทางติดต่อ",
    uploadPhoto: "อัปโหลดรูปถ่าย",
    removePhoto: "ลบรูปถ่าย",
    links: "ลิงค์โซเชียล",
    platform: "แพลตฟอร์ม (เช่น LinkedIn)",
    url: "ลิงค์ (URL)",
    layoutSettings: "ตั้งค่าการจัดวาง",
    scale: "ขนาด",
    spacing: "ระยะห่าง",
    reorder: "จัดลำดับหัวข้อ",
    quickPresets: "เลือกอาชีพตัวอย่าง:",
    developer: "นักพัฒนาเว็บ",
    designer: "ดีไซน์เนอร์",
    marketing: "การตลาด",
    draftCoverLetter: "ร่างจดหมายสมัครงาน",
    coverLetterGenerator: "ช่วยเขียนจดหมายสมัครงาน",
    applyingTo: "สมัครงานที่บริษัท (ไม่ใส่ก็ได้)",
    placeholderCompany: "เช่น Google, SCB, Agoda",
    clickToGenerate: "กดปุ่มเพื่อร่างจดหมายสมัครงานจากข้อมูล Portfolio ของคุณ",
    generateDraft: "เริ่มร่างจดหมาย",
    tryAgain: "ลองใหม่",
    copyClipboard: "คัดลอกข้อความ",
    copied: "คัดลอกเรียบร้อย!",
    // Career Coach
    aiAssistant: "ผู้ช่วย AI อัจฉริยะ",
    careerCoach: "ตรวจ Resume & เก็งข้อสอบ",
    analyzing: "กำลังวิเคราะห์ข้อมูล...",
    analysisResult: "ผลการวิเคราะห์",
    score: "คะแนน Resume",
    strengths: "จุดแข็ง",
    improvements: "สิ่งที่ควรปรับปรุง",
    interviewPrep: "เก็งคำถามสัมภาษณ์",
    interviewDesc: "เตรียมคำตอบสำหรับคำถามเหล่านี้ (อิงจากโปรไฟล์คุณ):",
    refreshAnalysis: "วิเคราะห์ใหม่",
    // Smart Design
    magicDesign: "ออกแบบอัตโนมัติ",
    magicDesignDesc: "เลือกสีและธีมที่เหมาะกับอาชีพของคุณ",
    applyingDesign: "กำลังออกแบบ...",
    // Payment (Support)
    paymentRequired: "สนับสนุนนักพัฒนา ☕",
    paymentDesc: "แอปนี้เปิดให้ใช้งานฟรี หากถูกใจสามารถสนับสนุนค่ากาแฟหรือค่าเซิร์ฟเวอร์ได้ตามศรัทธาครับ (ไม่บังคับ)",
    price: "2.00 บาท (หรือตามศรัทธา)",
    scanToPay: "สแกนเพื่อสนับสนุน",
    confirmPayment: "ดำเนินการต่อ / ดาวน์โหลด",
    checkingPayment: "กำลังตรวจสอบ...",
    paymentSuccess: "ขอบคุณครับ!",
    uploadSlip: "แนบสลิป (ไม่บังคับ)",
    slipAttached: "แนบสลิปเรียบร้อย",
    slipHint: "หากไม่สะดวกโอนเงิน สามารถกดปุ่มดาวน์โหลดเพื่อใช้งานได้ทันที",
  }
};
