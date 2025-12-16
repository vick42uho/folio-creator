
import React, { useState, useRef, useEffect } from 'react';
import { PortfolioData, Language, LABELS, Experience, Education, Project } from '../types';
import GlassCard from './GlassCard';
import { Plus, Trash2, Wand2, Languages, Loader2, Upload, X, User, Link as LinkIcon, Lightbulb, FileText, Check, Copy, Briefcase, GraduationCap, BrainCircuit, Target, AlertCircle, Sparkles } from 'lucide-react';
import { enhanceText, translateText, generateSuggestion, generateCoverLetter, analyzePortfolio, PortfolioAnalysis } from '../services/geminiService';

interface EditorProps {
  data: PortfolioData;
  onChange: (data: PortfolioData) => void;
  lang: Language;
}

interface InputGroupProps {
  label: string;
  value: string;
  onChangeText: (val: string) => void;
  multiline?: boolean;
  fieldId: string;
  enableAI?: boolean;
  enableIdeas?: boolean; // New prop for suggestion
  jobTitle?: string; // Needed for suggestion context
  skills?: string; // Needed for suggestion context
  ideaType?: 'about' | 'experience' | 'project';
  lang?: Language;
  loadingField: string | null;
  onEnhance: (fieldId: string, text: string, updateCb: (newText: string) => void) => void;
  onSuggest?: (fieldId: string, type: 'about' | 'experience' | 'project', updateCb: (newText: string) => void, context?: { jobTitle?: string, skills?: string }) => void;
}

// Helper for Input fields with glass style - Updated for Metallic Blue Theme
// Moved outside to prevent re-renders losing focus
const InputGroup: React.FC<InputGroupProps> = ({ 
  label, 
  value, 
  onChangeText, 
  multiline = false, 
  fieldId, 
  enableAI = false,
  enableIdeas = false,
  jobTitle,
  skills,
  ideaType,
  lang,
  loadingField,
  onEnhance,
  onSuggest
}) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-medium text-blue-200">{label}</label>
      <div className="flex gap-2">
         {/* Idea Button */}
         {enableIdeas && onSuggest && ideaType && (
            <button
              onClick={() => onSuggest(fieldId, ideaType, onChangeText, { jobTitle, skills })}
              disabled={!!loadingField}
              className="text-xs flex items-center gap-1 text-yellow-400 hover:text-yellow-200 disabled:opacity-50 transition-colors"
              title="Get ideas for what to write"
            >
              {loadingField === `suggest-${fieldId}` ? <Loader2 size={12} className="animate-spin"/> : <Lightbulb size={12} />}
              Ideas
            </button>
         )}

         {/* Enhance Button */}
         {enableAI && value && (
          <button
            onClick={() => onEnhance(fieldId, value, onChangeText)}
            disabled={!!loadingField}
            className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-200 disabled:opacity-50 transition-colors shadow-cyan-500/20"
          >
            {loadingField === fieldId ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12} />}
            AI Enhance
          </button>
        )}
      </div>
     
    </div>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={enableIdeas ? "Type here or click 'Ideas' for AI suggestions..." : ""}
        className="w-full bg-glass-input border border-glass-border rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all min-h-[100px] placeholder-blue-300/30"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        className="w-full bg-glass-input border border-glass-border rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all placeholder-blue-300/30"
      />
    )}
  </div>
);

// --- PRESETS DATA ---
const PRESETS: Record<string, Partial<PortfolioData>> = {
  'developer': {
    title: "Full Stack Developer",
    skills: "React, Node.js, TypeScript, PostgreSQL, Docker, AWS",
    about: "Dedicated developer who loves solving complex backend problems. I may not be the loudest person in the room, but I ensure my code speaks for itself. Always eager to learn new technologies.",
    experiences: [
      { id: 'p1', role: 'Junior Developer', company: 'Software House Co.', duration: '2022 - Present', description: 'Assisted in developing web applications using React. Fixed bugs and improved API performance.' }
    ],
    projects: [
      { id: 'proj1', name: 'Task Manager API', description: 'Built a RESTful API for task management with authentication.', technologies: 'Express, MongoDB' }
    ]
  },
  'designer': {
    title: "UI/UX Designer",
    skills: "Figma, Adobe XD, Photoshop, User Research, Prototyping",
    about: "Creative thinker focused on user-centered design. I believe good design should be invisible and intuitive. Diligent in research and testing to ensure the best user experience.",
    experiences: [
      { id: 'p1', role: 'Graphic Designer', company: 'Creative Agency', duration: '2021 - 2023', description: 'Designed marketing materials and website mockups for various clients. Collaborated with developers to ensure design fidelity.' }
    ],
    projects: [
      { id: 'proj1', name: 'Mobile Banking App Redesign', description: 'Redesigned the user flow for a banking app to reduce friction in transfers.', technologies: 'Figma' }
    ]
  },
  'marketing': {
    title: "Digital Marketer",
    skills: "SEO, Google Ads, Content Strategy, Social Media Management, Analytics",
    about: "Result-oriented marketer with a knack for data analysis. I enjoy finding patterns in consumer behavior and optimizing campaigns for better ROI. Hardworking and adaptable.",
    experiences: [
      { id: 'p1', role: 'Content Writer', company: 'Media Corp', duration: '2020 - 2022', description: 'Wrote SEO-friendly articles and managed social media pages. Increased organic traffic by 30% in 6 months.' }
    ],
    projects: [
      { id: 'proj1', name: 'Brand Awareness Campaign', description: 'Launched a viral social media campaign reaching 100k+ users.', technologies: 'Facebook Ads, Instagram' }
    ]
  }
};

const Editor: React.FC<EditorProps> = ({ data, onChange, lang }) => {
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cover Letter State
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [targetCompany, setTargetCompany] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  // Analysis State
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PortfolioAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const t = LABELS[lang];

  const updateField = (field: keyof PortfolioData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const loadPreset = (role: string) => {
    const preset = PRESETS[role];
    if (preset) {
      onChange({
        ...data,
        ...preset,
        // Keep personal info
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        links: data.links,
        profileImage: data.profileImage
      });
    }
  };

  const handleEnhance = async (fieldId: string, text: string, updateCb: (newText: string) => void) => {
    setLoadingField(fieldId);
    let context = '';
    if (fieldId === 'about') {
       context = `Target Role/Title: "${data.title}". Key Skills: "${data.skills}". This is the "About Me" section.`;
    } else if (fieldId.startsWith('exp-desc-')) {
       const id = fieldId.replace('exp-desc-', '');
       const exp = data.experiences.find(e => e.id === id);
       if (exp) {
         context = `Specific Role: "${exp.role}" at Company: "${exp.company}". (Focus ONLY on this role/company, ignore any other context).`;
       }
    } else if (fieldId.startsWith('proj-desc-')) {
       const id = fieldId.replace('proj-desc-', '');
       const proj = data.projects.find(p => p.id === id);
       if (proj) {
         context = `Project Name: "${proj.name}". Technologies used: "${proj.technologies}".`;
       }
    } else {
        context = `Context: Professional Portfolio.`;
    }

    const newText = await enhanceText(text, lang, context);
    updateCb(newText);
    setLoadingField(null);
  };

  const handleSuggest = async (
    fieldId: string, 
    type: 'about' | 'experience' | 'project', 
    updateCb: (newText: string) => void,
    context?: { jobTitle?: string, skills?: string }
  ) => {
    setLoadingField(`suggest-${fieldId}`);
    let targetTitle = "Professional";
    let targetSkills = "";

    if (type === 'about') {
        targetTitle = data.title;
        targetSkills = data.skills;
    } else if (type === 'experience') {
        targetTitle = context?.jobTitle || "Employee";
        targetSkills = context?.skills || ""; 
    } else if (type === 'project') {
        targetTitle = context?.jobTitle || "Project"; 
        targetSkills = context?.skills || ""; 
    }

    const suggestion = await generateSuggestion(type, targetTitle, targetSkills, lang);
    if (suggestion) {
       updateCb(suggestion);
    }
    setLoadingField(null);
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingLetter(true);
    const letter = await generateCoverLetter(data, targetCompany, lang);
    setGeneratedLetter(letter);
    setIsGeneratingLetter(false);
  };

  const handleAnalyze = async () => {
      setIsAnalyzing(true);
      setShowAnalysisModal(true);
      const result = await analyzePortfolio(data, lang);
      setAnalysisResult(result);
      setIsAnalyzing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    updateField('profileImage', undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 font-thai relative">
      
      {/* Quick Action Bar - Redesigned Grid Layout with Wrap Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-glass-100 p-4 rounded-2xl border border-glass-border shadow-lg">
          
          {/* Section 1: Load Presets (Text Chips) */}
          <div className="flex flex-col gap-2.5">
             <label className="text-xs font-bold text-blue-300/80 uppercase tracking-wider flex items-center gap-2">
                <div className="p-1 bg-cyan-500/10 rounded-md"><Briefcase size={12} className="text-cyan-400"/></div>
                {t.quickPresets}
             </label>
             <div className="grid grid-cols-3 gap-2">
                <button onClick={() => loadPreset('developer')} className="px-1 py-2.5 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-200 text-xs font-semibold rounded-lg border border-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 text-center shadow-sm whitespace-normal leading-tight h-full flex items-center justify-center">
                    {t.developer}
                </button>
                <button onClick={() => loadPreset('designer')} className="px-1 py-2.5 bg-pink-900/20 hover:bg-pink-900/40 text-pink-200 text-xs font-semibold rounded-lg border border-pink-500/20 transition-all hover:scale-[1.02] active:scale-95 text-center shadow-sm whitespace-normal leading-tight h-full flex items-center justify-center">
                    {t.designer}
                </button>
                <button onClick={() => loadPreset('marketing')} className="px-1 py-2.5 bg-orange-900/20 hover:bg-orange-900/40 text-orange-200 text-xs font-semibold rounded-lg border border-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 text-center shadow-sm whitespace-normal leading-tight h-full flex items-center justify-center">
                    {t.marketing}
                </button>
             </div>
          </div>

          {/* Section 2: AI Tools (Icon Only buttons matching Preset size) */}
          <div className="flex flex-col gap-2.5 lg:border-l lg:border-white/5 lg:pl-4">
             <label className="text-xs font-bold text-blue-300/80 uppercase tracking-wider flex items-center gap-2">
                <div className="p-1 bg-indigo-500/10 rounded-md"><Sparkles size={12} className="text-indigo-400"/></div>
                {t.aiAssistant}
             </label>
             <div className="grid grid-cols-2 gap-2 h-full">
                 
                 {/* Career Coach - Icon Only */}
                 <div className="relative group w-full h-full">
                     <button 
                        onClick={handleAnalyze}
                        className="w-full h-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-100 border border-indigo-500/30 rounded-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                     >
                        <BrainCircuit size={14} className="shrink-0" /> 
                     </button>
                     {/* Tooltip */}
                     <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        {t.careerCoach}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-t border-l border-slate-700 rotate-45"></div>
                     </span>
                 </div>

                 {/* Cover Letter - Icon Only */}
                 <div className="relative group w-full h-full">
                     <button 
                        onClick={() => setShowCoverLetterModal(true)}
                        className="w-full h-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 border border-blue-500/30 rounded-lg flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                     >
                        <FileText size={14} className="shrink-0" /> 
                     </button>
                     {/* Tooltip */}
                     <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        {t.draftCoverLetter}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-t border-l border-slate-700 rotate-45"></div>
                     </span>
                 </div>
             </div>
          </div>
      </div>

      {/* Personal Info */}
      <GlassCard>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <span className="w-1 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
          {t.personalInfo}
        </h2>

        {/* Image Upload Section */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-glass-border bg-glass-input flex items-center justify-center">
              {data.profileImage ? (
                <img src={data.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="text-blue-300/50" size={32} />
              )}
            </div>
            {data.profileImage && (
              <button 
                onClick={removeImage}
                className="absolute -top-1 -right-1 p-1 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                title={t.removePhoto}
              >
                <X size={12} className="text-white" />
              </button>
            )}
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-glass-input border border-glass-border rounded-lg text-sm text-cyan-200 hover:bg-white/5 transition-colors"
            >
              <Upload size={14} />
              {t.uploadPhoto}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="Full Name" value={data.fullName} onChangeText={(v: string) => updateField('fullName', v)} fieldId="fullName" loadingField={loadingField} onEnhance={handleEnhance} />
          <InputGroup label="Job Title" value={data.title} onChangeText={(v: string) => updateField('title', v)} fieldId="title" loadingField={loadingField} onEnhance={handleEnhance} />
          <InputGroup label="Email" value={data.email} onChangeText={(v: string) => updateField('email', v)} fieldId="email" loadingField={loadingField} onEnhance={handleEnhance} />
          <InputGroup label="Phone" value={data.phone} onChangeText={(v: string) => updateField('phone', v)} fieldId="phone" loadingField={loadingField} onEnhance={handleEnhance} />
          <InputGroup label="Location" value={data.location} onChangeText={(v: string) => updateField('location', v)} fieldId="location" loadingField={loadingField} onEnhance={handleEnhance} />
        </div>
        
        {/* Social Links Section */}
        <div className="mt-4 mb-2">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                    <LinkIcon size={14} /> {t.links}
                </label>
                <button
                    onClick={() => updateField('links', [...(data.links || []), { id: Date.now().toString(), platform: '', url: '' }])}
                    className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-200 transition-colors"
                >
                    <Plus size={12} /> {t.add}
                </button>
            </div>
            <div className="space-y-3">
                {data.links?.map((link, index) => (
                    <div key={link.id} className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder={t.platform}
                            value={link.platform}
                            onChange={(e) => {
                                const newLinks = [...(data.links || [])];
                                newLinks[index].platform = e.target.value;
                                updateField('links', newLinks);
                            }}
                            className="w-1/3 bg-glass-input border border-glass-border rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                        />
                        <input
                            type="text"
                            placeholder={t.url}
                            value={link.url}
                            onChange={(e) => {
                                const newLinks = [...(data.links || [])];
                                newLinks[index].url = e.target.value;
                                updateField('links', newLinks);
                            }}
                            className="flex-1 bg-glass-input border border-glass-border rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                        />
                        <button
                            onClick={() => updateField('links', data.links.filter(l => l.id !== link.id))}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <InputGroup 
            label={t.about} 
            value={data.about} 
            onChangeText={(v: string) => updateField('about', v)} 
            multiline fieldId="about" 
            enableAI enableIdeas ideaType="about" jobTitle={data.title} skills={data.skills} lang={lang}
            loadingField={loadingField} onEnhance={handleEnhance} onSuggest={handleSuggest}
        />
        <InputGroup label={t.skills} value={data.skills} onChangeText={(v: string) => updateField('skills', v)} fieldId="skills" loadingField={loadingField} onEnhance={handleEnhance} />
      </GlassCard>

      {/* Experience */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <span className="w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            {t.experience}
          </h2>
          <button
            onClick={() => updateField('experiences', [...data.experiences, { id: Date.now().toString(), role: '', company: '', duration: '', description: '' }])}
            className="p-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/30 rounded-full transition-colors text-blue-100"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-6">
          {data.experiences.map((exp, index) => (
            <div key={exp.id} className="p-4 bg-glass-input rounded-xl border border-white/5 relative group">
              <button
                onClick={() => updateField('experiences', data.experiences.filter(e => e.id !== exp.id))}
                className="absolute top-2 right-2 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup 
                  label={t.role} 
                  value={exp.role} 
                  onChangeText={(v: string) => {
                    const newExps = [...data.experiences];
                    newExps[index].role = v;
                    updateField('experiences', newExps);
                  }}
                  fieldId={`exp-role-${exp.id}`}
                  loadingField={loadingField} onEnhance={handleEnhance}
                />
                 <InputGroup 
                  label={t.company} 
                  value={exp.company} 
                  onChangeText={(v: string) => {
                    const newExps = [...data.experiences];
                    newExps[index].company = v;
                    updateField('experiences', newExps);
                  }}
                  fieldId={`exp-comp-${exp.id}`}
                  loadingField={loadingField} onEnhance={handleEnhance}
                />
                 <InputGroup 
                  label={t.duration} 
                  value={exp.duration} 
                  onChangeText={(v: string) => {
                    const newExps = [...data.experiences];
                    newExps[index].duration = v;
                    updateField('experiences', newExps);
                  }}
                  fieldId={`exp-dur-${exp.id}`}
                  loadingField={loadingField} onEnhance={handleEnhance}
                />
              </div>
               <InputGroup 
                  label={t.description} 
                  value={exp.description} 
                  multiline
                  fieldId={`exp-desc-${exp.id}`}
                  onChangeText={(v: string) => {
                    const newExps = [...data.experiences];
                    newExps[index].description = v;
                    updateField('experiences', newExps);
                  }}
                  enableAI enableIdeas ideaType="experience" 
                  // Isolate Context: Pass ONLY this role. Do not pass global skills to prevent confusion.
                  jobTitle={exp.role} 
                  skills={""} 
                  lang={lang}
                  loadingField={loadingField} onEnhance={handleEnhance} onSuggest={handleSuggest}
                />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Education */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <span className="w-1 h-6 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
            {t.education}
          </h2>
          <button
             onClick={() => updateField('education', [...data.education, { id: Date.now().toString(), degree: '', institution: '', year: '' }])}
            className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-400/30 rounded-full transition-colors text-emerald-100"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
             <div key={edu.id} className="p-4 bg-glass-input rounded-xl border border-white/5 relative group">
              <button
                onClick={() => updateField('education', data.education.filter(e => e.id !== edu.id))}
                className="absolute top-2 right-2 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputGroup 
                  label={t.degree} 
                  value={edu.degree} 
                  onChangeText={(v: string) => {
                    const newEdu = [...data.education];
                    newEdu[index].degree = v;
                    updateField('education', newEdu);
                  }}
                  fieldId={`edu-deg-${edu.id}`}
                  loadingField={loadingField} onEnhance={handleEnhance}
                />
                 <InputGroup 
                  label={t.institution} 
                  value={edu.institution} 
                  onChangeText={(v: string) => {
                    const newEdu = [...data.education];
                    newEdu[index].institution = v;
                    updateField('education', newEdu);
                  }}
                  fieldId={`edu-inst-${edu.id}`}
                  loadingField={loadingField} onEnhance={handleEnhance}
                />
                 <InputGroup 
                  label={t.year} 
                  value={edu.year} 
                  onChangeText={(v: string) => {
                    const newEdu = [...data.education];
                    newEdu[index].year = v;
                    updateField('education', newEdu);
                  }}
                  fieldId={`edu-year-${edu.id}`}
                  loadingField={loadingField} onEnhance={handleEnhance}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

        {/* Projects */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <span className="w-1 h-6 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
            {t.projects}
          </h2>
          <button
             onClick={() => updateField('projects', [...data.projects, { id: Date.now().toString(), name: '', description: '', technologies: '' }])}
            className="p-2 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-400/30 rounded-full transition-colors text-yellow-100"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-6">
          {data.projects.map((proj, index) => (
             <div key={proj.id} className="p-4 bg-glass-input rounded-xl border border-white/5 relative group">
              <button
                onClick={() => updateField('projects', data.projects.filter(p => p.id !== proj.id))}
                className="absolute top-2 right-2 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
              <div className="grid grid-cols-1 gap-4">
                 <InputGroup 
                  label={t.projectName} 
                  value={proj.name} 
                  onChangeText={(v: string) => {
                    const newProj = [...data.projects];
                    newProj[index].name = v;
                    updateField('projects', newProj);
                  }}
                  fieldId={`proj-name-${proj.id}`}
                  loadingField={loadingField} onEnhance={handleEnhance}
                />
                 <InputGroup 
                  label={t.technologies} 
                  value={proj.technologies} 
                  onChangeText={(v: string) => {
                    const newProj = [...data.projects];
                    newProj[index].technologies = v;
                    updateField('projects', newProj);
                  }}
                  fieldId={`proj-tech-${proj.id}`}
                  loadingField={loadingField} onEnhance={handleEnhance}
                />
                 <InputGroup 
                  label={t.description} 
                  value={proj.description} 
                  multiline
                  fieldId={`proj-desc-${proj.id}`}
                  onChangeText={(v: string) => {
                    const newProj = [...data.projects];
                    newProj[index].description = v;
                    updateField('projects', newProj);
                  }}
                  enableAI enableIdeas ideaType="project" 
                  // Pass Project Name as jobTitle and Tech as Skills for context
                  jobTitle={proj.name} 
                  skills={proj.technologies} 
                  lang={lang}
                  loadingField={loadingField} onEnhance={handleEnhance} onSuggest={handleSuggest}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Cover Letter Modal */}
      {showCoverLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="w-full max-w-lg bg-[#0f172a] border border-glass-border rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
              <button onClick={() => setShowCoverLetterModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
              
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <span className="p-1.5 bg-blue-500/20 rounded-lg"><FileText size={18} className="text-blue-400"/></span>
                 {t.coverLetterGenerator}
              </h3>

              <div className="mb-4">
                 <label className="text-sm text-slate-400 mb-1 block">{t.applyingTo}</label>
                 <input 
                    type="text" 
                    value={targetCompany} 
                    onChange={e => setTargetCompany(e.target.value)}
                    placeholder={t.placeholderCompany}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                 />
              </div>

              {generatedLetter ? (
                 <div className="flex-1 overflow-auto bg-slate-900 rounded-lg p-4 border border-slate-800 mb-4 font-mono text-sm text-slate-300 whitespace-pre-wrap">
                    {generatedLetter}
                 </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 border border-dashed border-slate-700 rounded-lg bg-slate-800/30">
                    <Wand2 size={40} className="mb-3 opacity-50"/>
                    <p className="text-sm">{t.clickToGenerate}</p>
                </div>
              )}

              <div className="flex gap-3 mt-auto pt-2">
                 {!generatedLetter ? (
                     <button 
                        onClick={handleGenerateCoverLetter}
                        disabled={isGeneratingLetter}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                     >
                        {isGeneratingLetter ? <Loader2 size={18} className="animate-spin"/> : <Wand2 size={18} />}
                        {t.generateDraft}
                     </button>
                 ) : (
                    <>
                       <button 
                          onClick={handleGenerateCoverLetter}
                          disabled={isGeneratingLetter}
                          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                       >
                          {t.tryAgain}
                       </button>
                       <button 
                          onClick={() => {navigator.clipboard.writeText(generatedLetter); alert(t.copied)}}
                          className="flex-[2] py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                       >
                          <Copy size={18} /> {t.copyClipboard}
                       </button>
                    </>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Career Coach Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="w-full max-w-2xl bg-[#0f172a] border border-glass-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
               {/* Header */}
               <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <BrainCircuit size={24} className="text-indigo-400"/>
                        {t.careerCoach}
                   </h3>
                   <button onClick={() => setShowAnalysisModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
               </div>
               
               {/* Body */}
               <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                             <div className="relative">
                                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" size={24}/>
                             </div>
                             <p className="text-indigo-200 animate-pulse">{t.analyzing}</p>
                        </div>
                    ) : analysisResult ? (
                        <div className="space-y-8">
                             {/* Score Section */}
                             <div className="flex flex-col items-center mb-8">
                                 <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                     <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                         <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                                         <circle cx="50" cy="50" r="45" fill="none" stroke={analysisResult.score > 75 ? "#22c55e" : analysisResult.score > 50 ? "#eab308" : "#ef4444"} strokeWidth="8" strokeDasharray={`${analysisResult.score * 2.83} 283`} strokeLinecap="round" />
                                     </svg>
                                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                                         <span className="text-4xl font-black text-white">{analysisResult.score}</span>
                                         <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
                                     </div>
                                 </div>
                             </div>

                             {/* Feedback Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                     <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2"><Check size={18}/> {t.strengths}</h4>
                                     <ul className="space-y-2">
                                         {analysisResult.strengths.map((s, i) => (
                                             <li key={i} className="text-sm text-green-100/90 flex items-start gap-2">
                                                 <span className="mt-1.5 w-1 h-1 rounded-full bg-green-400 shrink-0"></span>
                                                 {s}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                                 <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                                     <h4 className="text-orange-400 font-bold mb-3 flex items-center gap-2"><AlertCircle size={18}/> {t.improvements}</h4>
                                     <ul className="space-y-2">
                                         {analysisResult.improvements.map((s, i) => (
                                             <li key={i} className="text-sm text-orange-100/90 flex items-start gap-2">
                                                 <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-400 shrink-0"></span>
                                                 {s}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             </div>

                             {/* Interview Questions */}
                             <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5">
                                  <h4 className="text-indigo-300 font-bold mb-1 flex items-center gap-2"><Target size={20}/> {t.interviewPrep}</h4>
                                  <p className="text-xs text-indigo-300/60 mb-4">{t.interviewDesc}</p>
                                  <div className="space-y-3">
                                      {analysisResult.interviewQuestions.map((q, i) => (
                                          <div key={i} className="bg-slate-900/50 p-3 rounded-lg border border-indigo-500/10">
                                              <span className="text-indigo-400 font-bold mr-2">Q{i+1}.</span>
                                              <span className="text-slate-200 text-sm">{q}</span>
                                          </div>
                                      ))}
                                  </div>
                             </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400">Unable to analyze. Please try again.</div>
                    )}
               </div>

               {/* Footer */}
               <div className="p-4 border-t border-white/10 bg-slate-900/50 flex justify-end">
                   <button 
                      onClick={handleAnalyze} 
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                      disabled={isAnalyzing}
                    >
                       <BrainCircuit size={16}/> {t.refreshAnalysis}
                   </button>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Editor;
