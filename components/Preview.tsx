
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { PortfolioData, Language, LABELS, ThemeOption, LayoutConfig } from '../types';
import { 
  Mail, Phone, MapPin, 
  Briefcase, Code, User, Linkedin, Github, Globe, Twitter, Facebook, Instagram,
  GraduationCap, Cpu, Layers, Terminal, Folder
} from 'lucide-react';

interface PreviewProps {
  data: PortfolioData;
  lang: Language;
  theme: ThemeOption;
  primaryColor: string;
  layoutConfig: LayoutConfig;
}

const A4_WIDTH_PX = 794;
const A4_MIN_HEIGHT_PX = 1123;

// --- Helpers ---
const getLinkIcon = (platform: string, size = 14) => {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return <Linkedin size={size} />;
  if (p.includes('github')) return <Github size={size} />;
  if (p.includes('twitter') || p.includes('x.com')) return <Twitter size={size} />;
  if (p.includes('facebook')) return <Facebook size={size} />;
  if (p.includes('instagram')) return <Instagram size={size} />;
  return <Globe size={size} />;
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

// --- Scalable Text Component ---
// Automatically scales text down to fit width instead of wrapping
const ScalableText = ({ children, className = "", style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const calculate = () => {
             if (outerRef.current && innerRef.current) {
                 const outerWidth = outerRef.current.offsetWidth;
                 const innerWidth = innerRef.current.scrollWidth;
                 
                 // Add a tiny buffer to prevent clipping
                 if (innerWidth > outerWidth) {
                     setScale(outerWidth / innerWidth);
                 } else {
                     setScale(1);
                 }
             }
        };
        
        const observer = new ResizeObserver(calculate);
        if (outerRef.current) observer.observe(outerRef.current);
        
        // Initial calc
        calculate();
        // Recalc after a tick to ensure fonts loaded
        setTimeout(calculate, 100);

        return () => observer.disconnect();
    }, [children]);

    return (
        <div ref={outerRef} className={`w-full ${className}`} style={{ ...style, overflow: 'hidden' }}>
            <div 
                ref={innerRef}
                style={{
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    transform: `scale(${scale})`,
                    transformOrigin: 'left center',
                    width: 'auto'
                }}
            >
                {children}
            </div>
        </div>
    )
}

// --- Section Components (Reusable) ---

const SkillsSection: React.FC<{ skills: string, t: any, color: string, style?: 'tag' | 'bar' | 'cyber' | 'modern' | 'modern-filled' | 'glass-pills' | 'sidebar-clean' }> = ({ skills, t, color, style = 'tag' }) => {
    if (!skills) return null;
    const list = skills.split(',').map(s => s.trim());

    if (style === 'cyber') {
        return (
            <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{color}}>
                    <Terminal size={14}/> {t.skills}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {list.map((s, i) => (
                        <div key={i} className="px-3 py-1 bg-black/40 text-xs font-mono text-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.2)]">
                            [{s}]
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // UPDATED: Sidebar Clean Style -> Underlined text with better spacing
    if (style === 'sidebar-clean') {
        return (
            <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-5 flex items-center gap-2 text-white/90">
                    <Cpu size={14} className="text-white"/> {t.skills}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-3">
                    {list.map((s, i) => (
                        <span key={i} 
                            className="text-sm font-medium font-thai text-white/95 border-b border-white/30 pb-1"
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </div>
        )
    }

    if (style === 'glass-pills') {
        return (
            <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-white/90">
                    <Cpu size={14} className="text-white"/> {t.skills}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {list.map((s, i) => (
                        <span key={i} 
                            className="px-3 py-1.5 text-xs font-bold font-thai rounded-lg bg-white/20 text-white shadow-sm border border-white/10"
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </div>
        )
    }

    // Solid color pills
    if (style === 'modern-filled') {
        return (
            <div className="mb-8">
                 <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-700">
                    <Cpu size={14} style={{ color }}/> {t.skills}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {list.map((s, i) => (
                        <span key={i} 
                            className="px-3 py-1.5 text-xs font-bold font-thai rounded-full shadow-sm text-white transform hover:scale-105 transition-transform"
                            style={{ backgroundColor: color }}
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </div>
        )
    }

    if (style === 'modern') {
        return (
            <div className="mb-6">
                 <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color }}>
                    <Cpu size={14}/> {t.skills}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {list.map((s, i) => (
                        <span key={i} 
                            className="px-3 py-1.5 text-xs font-bold font-thai rounded-lg border border-transparent"
                            style={{ backgroundColor: `${color}15`, color: color }}
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </div>
        )
    }
    
    return (
        <div className="mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest mb-3 opacity-60 flex items-center gap-2">
                {style === 'tag' ? <Cpu size={14}/> : null} {t.skills}
            </h3>
            <div className="flex flex-wrap gap-2">
                {list.map((s, i) => (
                    <span key={i} 
                        className={`px-3 py-1.5 text-xs font-bold font-thai ${style === 'tag' ? 'rounded-md bg-slate-100 text-slate-700' : 'border-b-2 border-slate-100 text-slate-800'}`}
                        style={style === 'tag' ? {} : { borderColor: color }}
                    >
                        {s}
                    </span>
                ))}
            </div>
        </div>
    );
};

const ExperienceSection: React.FC<{ experiences: any[], t: any, color: string, variant?: 'classic' | 'minimal' | 'cyber' | 'modern' }> = ({ experiences, t, color, variant = 'classic' }) => {
    if (experiences.length === 0) return null;
    return (
        <div className="mb-8">
            {/* Header */}
            <h2 className={`text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-4 font-thai ${variant === 'cyber' ? 'text-cyan-400' : 'text-slate-800'}`}>
                {variant === 'modern' ? (
                    <>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: color }}>
                             <Briefcase size={18} />
                        </div>
                        <span className="flex-1 border-b-2 pb-1" style={{ borderColor: `${color}30` }}>{t.experience}</span>
                    </>
                ) : (
                    <>
                        {variant !== 'minimal' && (
                            <div className={`p-1.5 rounded ${variant === 'cyber' ? 'bg-cyan-900/30' : 'text-white'}`} style={variant !== 'cyber' ? { backgroundColor: color } : {}}>
                                <Briefcase size={16} />
                            </div>
                        )}
                        <span className={variant === 'classic' ? 'text-slate-800' : ''}>{t.experience}</span>
                    </>
                )}
            </h2>

            {/* Content */}
            <div className={`space-y-${variant === 'minimal' ? 8 : 6}`}>
                {experiences.map((exp, i) => (
                    <div key={exp.id} className={`relative ${variant === 'classic' ? 'pl-4 border-l-2' : ''}`} style={{ borderColor: variant === 'classic' ? `${color}40` : 'transparent' }}>
                         {variant === 'classic' && <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>}
                         
                         {variant === 'modern' ? (
                            <div className="bg-slate-50 p-5 rounded-r-xl rounded-bl-xl border-l-4 shadow-sm" style={{ borderColor: color }}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex-1 pr-2">
                                        <h3 className="text-base font-bold font-thai text-slate-800 leading-tight">{exp.role}</h3>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">{exp.company}</div>
                                    </div>
                                    {/* UPDATED: Removed background badge, using colored text instead */}
                                    <span className="shrink-0 text-xs font-bold tracking-wider font-mono" style={{ color: color }}>{exp.duration}</span>
                                </div>
                                <p className="text-sm leading-relaxed font-thai text-slate-600 mt-3 border-t border-slate-100 pt-3">
                                    {exp.description}
                                </p>
                            </div>
                         ) : (
                            <>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                    <h3 className={`text-base font-bold font-thai ${variant === 'cyber' ? 'text-white' : 'text-slate-800'}`}>{exp.role}</h3>
                                    <span className={`text-xs font-mono font-bold whitespace-nowrap ${variant === 'cyber' ? 'text-cyan-600' : 'text-slate-500'}`}>{exp.duration}</span>
                                </div>
                                <div className={`text-xs font-bold uppercase tracking-wider mb-2 font-thai ${variant === 'cyber' ? 'text-cyan-200' : ''}`} style={variant !== 'cyber' ? { color } : {}}>
                                    {exp.company}
                                </div>
                                <p className={`text-sm leading-relaxed font-thai whitespace-pre-wrap ${variant === 'cyber' ? 'text-slate-300 font-light' : 'text-slate-600'}`}>
                                    {exp.description}
                                </p>
                            </>
                         )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProjectsSection: React.FC<{ projects: any[], t: any, color: string, variant?: 'classic' | 'grid' | 'cyber' | 'modern' }> = ({ projects, t, color, variant = 'classic' }) => {
    if (projects.length === 0) return null;
    return (
        <div className="mb-8">
             <h2 className={`text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-4 font-thai ${variant === 'cyber' ? 'text-cyan-400' : 'text-slate-800'}`}>
                {variant === 'modern' ? (
                    <>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: color }}>
                             <Folder size={18} />
                        </div>
                        <span className="flex-1 border-b-2 pb-1" style={{ borderColor: `${color}30` }}>{t.projects}</span>
                    </>
                ) : (
                    <>
                        {variant !== 'grid' && (
                            <div className={`p-1.5 rounded ${variant === 'cyber' ? 'bg-cyan-900/30' : 'text-white'}`} style={variant !== 'cyber' ? { backgroundColor: color } : {}}>
                                <Folder size={16} />
                            </div>
                        )}
                        <span className={variant === 'classic' ? 'text-slate-800' : ''}>{t.projects}</span>
                    </>
                )}
            </h2>
            <div className={variant === 'grid' || variant === 'modern' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                {projects.map((proj) => (
                    <div key={proj.id} className={`${variant === 'cyber' ? 'bg-slate-900/50' : 'bg-slate-50 border border-slate-100'} p-4 rounded-lg relative overflow-hidden group`}>
                         {variant === 'modern' && <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }}></div>}
                        <h3 className={`text-base font-bold font-thai mb-1 ${variant === 'cyber' ? 'text-white' : 'text-slate-800'}`}>{proj.name}</h3>
                        <p className={`text-sm mb-2 font-thai leading-relaxed ${variant === 'cyber' ? 'text-slate-400' : 'text-slate-600'}`}>{proj.description}</p>
                        <div className={`text-[10px] font-bold uppercase tracking-wider font-thai ${variant === 'cyber' ? 'text-cyan-600' : 'text-slate-400'}`} style={variant === 'classic' || variant === 'modern' ? { color: variant === 'modern' ? color : `${color}cc` } : {}}>
                            {proj.technologies}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EducationSection: React.FC<{ education: any[], t: any, color: string, variant?: 'classic' | 'minimal' | 'cyber' | 'modern-sidebar' }> = ({ education, t, color, variant = 'classic' }) => {
    if (education.length === 0) return null;

    if (variant === 'modern-sidebar') {
        return (
            <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-white/90">
                    <GraduationCap size={14} className="text-white" /> {t.education}
                </h2>
                <div className="space-y-4">
                    {education.map(edu => (
                        <div key={edu.id} className="relative pl-3 border-l-2 border-white/30">
                            <div className="text-sm font-bold font-thai text-white">{edu.degree}</div>
                            <div className="text-xs font-thai text-white/70">{edu.institution}</div>
                            <div className="text-xs font-mono font-bold mt-1 text-white/90">{edu.year}</div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="mb-8">
             <h2 className={`text-lg font-black uppercase tracking-widest mb-5 flex items-center gap-3 font-thai ${variant === 'cyber' ? 'text-cyan-400' : 'text-slate-800'}`} style={variant === 'classic' ? { color } : {}}>
                {variant !== 'minimal' && (
                    <div className={`p-1.5 rounded ${variant === 'cyber' ? 'bg-cyan-900/30' : 'text-white'}`} style={variant !== 'cyber' ? { backgroundColor: color } : {}}>
                        <GraduationCap size={16} />
                    </div>
                )}
                <span className={variant === 'classic' ? 'text-slate-800' : ''}>{t.education}</span>
            </h2>
            <div className="space-y-4">
                {education.map(edu => (
                    <div key={edu.id} className={variant === 'cyber' ? 'pl-3' : ''}>
                        {variant === 'cyber' && <div className="h-4 w-0.5 bg-cyan-900 mb-2"></div>}
                        <div className={`text-sm font-bold font-thai ${variant === 'cyber' ? 'text-white' : 'text-slate-800'}`}>{edu.degree}</div>
                        <div className={`text-xs font-thai ${variant === 'cyber' ? 'text-slate-400' : 'text-slate-500'}`}>{edu.institution}</div>
                        <div className={`text-xs font-mono font-bold mt-1 ${variant === 'cyber' ? 'text-cyan-600' : ''}`} style={variant !== 'cyber' ? { color } : {}}>{edu.year}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Layouts ---

const ModernLayout = ({ data, t, color, config }: { data: PortfolioData, t: any, color: string, config: LayoutConfig }) => {
    // Modern Redesigned: BOLD Sidebar color, Glassmorphism, Premium feel.
    
    const mainSections = config.order.filter(id => ['experience', 'projects'].includes(id));
    const firstLink = data.links && data.links.length > 0 ? data.links[0] : null;
    
    // UPDATED: Removed background from here to allow parent container to handle it (fixes white gap issue)
    return (
      <div 
        className="flex w-full flex-grow text-slate-800 min-h-full"
      >
        {/* Sidebar - Transparent bg here as parent handles it. */}
        <div 
            className="w-[35%] p-6 flex flex-col shrink-0 relative overflow-hidden text-white" 
        >
             {/* Decorative Background Pattern */}
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle at top left, white, transparent 70%)' }}></div>

             {/* Profile - No Border, just Shadow */}
             <div className="mb-10 text-center relative z-10">
                 <div className="w-40 h-40 mx-auto rounded-full overflow-hidden shadow-2xl mb-6 bg-white relative">
                     {data.profileImage ? (
                         <img src={data.profileImage} className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full bg-slate-200 flex items-center justify-center"><User size={50} className="text-slate-400"/></div>
                     )}
                 </div>
                 
                 {/* Auto Scale Name if too long */}
                 <div className="w-full mb-3">
                    <ScalableText className="text-3xl font-black font-thai leading-tight text-white drop-shadow-md text-center">
                        {data.fullName}
                    </ScalableText>
                 </div>
                 
                 {/* UPDATED: Removed border and container background. Cleaner look. */}
                 <div className="text-sm font-bold font-thai text-white/90 uppercase tracking-widest mt-1 opacity-90">
                    <ScalableText className="text-center">{data.title}</ScalableText>
                 </div>
             </div>
 
             {/* Contact - UPDATED: Changed grid to flex items-start with specific icon styling for perfect alignment */}
             {/* UPDATED: Reverted to text-sm and used ScalableText to prevent wrapping */}
             <div className="space-y-4 mb-14 text-sm relative z-10 px-1">
                {data.email && (
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 w-5 flex justify-center text-white/80">
                             <Mail size={16} />
                        </div>
                        <div className="font-medium text-white/95 leading-snug min-w-0 flex-1">
                             <ScalableText>{data.email}</ScalableText>
                        </div>
                    </div>
                )}
                {data.phone && (
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 w-5 flex justify-center text-white/80">
                             <Phone size={16} />
                        </div>
                        <div className="font-medium text-white/95 leading-snug min-w-0 flex-1">
                            <ScalableText>{data.phone}</ScalableText>
                        </div>
                    </div>
                )}
                {data.location && (
                    <div className="flex items-center gap-3">
                         <div className="shrink-0 w-5 flex justify-center text-white/80">
                            <MapPin size={16} />
                        </div>
                        <div className="font-medium text-white/95 leading-snug min-w-0 flex-1">
                            <ScalableText>{data.location}</ScalableText>
                        </div>
                    </div>
                )}
                {data.links?.map(l => (
                    <div key={l.id} className="flex items-center gap-3">
                         <div className="shrink-0 w-5 flex justify-center text-white/80">
                            {getLinkIcon(l.platform, 16)}
                        </div>
                        <div className="font-medium text-white/95 leading-snug min-w-0 flex-1">
                            <ScalableText>{l.url.replace(/^https?:\/\//, '')}</ScalableText>
                        </div>
                    </div>
                ))}
             </div>

             {/* Skills - UPDATED: Use 'sidebar-clean' for borderless tags */}
             <div className="relative z-10">
                 <SkillsSection skills={data.skills} t={t} color={color} style="sidebar-clean" />
             </div>
             
             {/* MOVED UP: Education Sidebar (White text) - Placed directly after Skills */}
             <div className="relative z-10 mt-10">
                <EducationSection education={data.education} t={t} color="white" variant="modern-sidebar" />
             </div>

             {/* NEW: QR Code at bottom (Replaces previous Education position) */}
             <div className="mt-auto pt-8 border-t border-white/20 relative z-10 flex flex-col items-center justify-center">
                 {firstLink && firstLink.url && (
                    <>
                        <div className="bg-white p-2.5 rounded-xl shadow-lg mb-3">
                            {/* Use public QR API. Add crossOrigin for PDF safety */}
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(firstLink.url.startsWith('http') ? firstLink.url : 'https://' + firstLink.url)}`}
                                alt="QR Code"
                                className="w-24 h-24"
                                crossOrigin="anonymous"
                            />
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 text-center">
                            Scan to visit<br/>{firstLink.platform || 'Portfolio'}
                        </div>
                    </>
                 )}
             </div>
        </div>
 
        {/* Main Content */}
        <div className="flex-1 p-12 pt-16 relative bg-white/0">
            {/* Top decorative line */}
            <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: color }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: `${config.spacing * 0.8}rem` }}>
                
                {/* About Section - Matching Header Style */}
                {data.about && config.order.includes('about') && (
                     <div className="mb-6">
                        <h2 className="text-xl font-black uppercase tracking-widest mb-4 flex items-center gap-4 font-thai text-slate-800">
                             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: color }}>
                                 <User size={18} />
                             </div>
                             <span className="flex-1 border-b-2 pb-1" style={{ borderColor: `${color}30` }}>{t.about}</span>
                        </h2>
                        <p className="text-slate-600 leading-8 font-thai whitespace-pre-wrap text-justify text-lg font-light">
                            {data.about}
                        </p>
                    </div>
                )}

                {mainSections.map(section => {
                    if (section === 'experience') return <ExperienceSection key="exp" experiences={data.experiences} t={t} color={color} variant="modern" />;
                    if (section === 'projects') return <ProjectsSection key="proj" projects={data.projects} t={t} color={color} variant="modern" />;
                    return null;
                })}
            </div>
        </div>
      </div>
    );
 };

const MinimalLayout = ({ data, t, color, config }: { data: PortfolioData, t: any, color: string, config: LayoutConfig }) => {
    // Minimal: Single column or Grid. Very structured. 
    // Uses the order array strictly.
    
    // UPDATED: Use flex-grow
    return (
        <div className="w-full flex-grow bg-white p-12 text-slate-900">
            {/* Header */}
            <div className="border-b-4 border-black pb-8 mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-6xl font-black font-thai uppercase leading-[0.8] tracking-tighter mb-2">{data.fullName}</h1>
                    <p className="text-xl font-medium font-thai text-slate-500 tracking-[0.2em] uppercase">{data.title}</p>
                </div>
                <div className="text-right text-xs font-mono space-y-1 opacity-60">
                     <div>{data.email}</div>
                     <div>{data.phone}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: `${config.spacing}rem` }}>
                {config.order.map(section => {
                     if (section === 'about' && data.about) {
                        return (
                            <div key="about" className="grid grid-cols-12 gap-6">
                                <div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">About</div>
                                <div className="col-span-9 text-lg font-thai font-medium leading-relaxed">{data.about}</div>
                            </div>
                        )
                     }
                     if (section === 'skills' && data.skills) {
                        return (
                            <div key="skills" className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-8">
                                <div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">Skills</div>
                                <div className="col-span-9 flex flex-wrap gap-x-6 gap-y-2">
                                    {data.skills.split(',').map((s,i) => (
                                        <span key={i} className="font-thai font-bold border-b-2 border-transparent hover:border-black transition-colors">{s.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        )
                     }
                     if (section === 'experience') {
                         return (
                            <div key="exp" className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-8">
                                <div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">Experience</div>
                                <div className="col-span-9">
                                    <ExperienceSection experiences={data.experiences} t={t} color={color} variant="minimal" />
                                </div>
                            </div>
                         )
                     }
                     if (section === 'projects') {
                         return (
                            <div key="proj" className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-8">
                                <div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">Selected Works</div>
                                <div className="col-span-9">
                                    <ProjectsSection projects={data.projects} t={t} color={color} variant="grid" />
                                </div>
                            </div>
                         )
                     }
                     if (section === 'education') {
                        return (
                           <div key="edu" className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-8">
                               <div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">Education</div>
                               <div className="col-span-9">
                                   <EducationSection education={data.education} t={t} color={color} variant="minimal" />
                               </div>
                           </div>
                        )
                    }
                    return null;
                })}
            </div>
        </div>
    )
}

const CreativeLayout = ({ data, t, color, config }: { data: PortfolioData, t: any, color: string, config: LayoutConfig }) => {
    // Creative: Magazine feel, uses order for main content column.
    // UPDATED: Use flex-grow
    return (
        <div className="w-full flex-grow bg-slate-50 relative overflow-hidden text-slate-900">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: color }}></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-slate-300 mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>

            <div className="relative z-10 p-12">
                {/* Header */}
                <div className="flex flex-row items-end gap-8 mb-16">
                     <div className="flex-1">
                         {/* UPDATED: Changed bg-black to primary color for better styling and removed rotation to fix PDF glitch. Added proper padding. */}
                         <div className="inline-block px-4 py-1.5 mb-5 text-sm font-bold uppercase tracking-[0.25em] text-white shadow-md relative z-20" 
                              style={{ backgroundColor: color }}>
                            {data.title}
                         </div>
                         
                         {/* UPDATED: Adjusted font size to 6xl and leading-tight for better Thai font rendering (prevents clipping). Adjusted underline position. */}
                         <h1 className="text-6xl font-black font-thai leading-tight tracking-tighter mb-6 relative drop-shadow-sm text-slate-900">
                            {data.fullName}
                            <span className="absolute -z-10 bottom-2 left-0 w-full h-3 opacity-30" style={{ backgroundColor: color }}></span>
                         </h1>
                         
                         <div className="flex gap-4 text-sm font-bold font-mono text-slate-500">
                             <span>{data.email}</span>
                             <span>/</span>
                             <span>{data.location}</span>
                         </div>
                     </div>
                     {data.profileImage && (
                        <div className="w-48 h-56 shrink-0 relative">
                             {/* UPDATED: Changed border-black to border-primary (via style) to match the theme. */}
                             <div className="absolute top-3 left-3 w-full h-full border-2" style={{ borderColor: color }}></div>
                             <img src={data.profileImage} className="w-full h-full object-cover relative z-10 shadow-sm" />
                        </div>
                     )}
                </div>

                {/* Content Loop */}
                <div className="grid grid-cols-12 gap-10">
                    {/* Left Rail - Static Contact/Skills for Magazine feel */}
                    <div className="col-span-4 space-y-8 border-r border-slate-200 pr-8">
                         {data.about && (
                             <div className="text-sm font-serif italic leading-relaxed text-slate-600">
                                 "{data.about}"
                             </div>
                         )}
                         <SkillsSection skills={data.skills} t={t} color={color} style="bar" />
                         <div className="space-y-2 text-xs font-bold uppercase tracking-wider text-slate-400 pt-8 border-t border-slate-200">
                             {data.links?.map(l => (
                                 <div key={l.id} className="flex items-center gap-2 hover:text-black transition-colors cursor-pointer">
                                     {getLinkIcon(l.platform)} {l.url}
                                 </div>
                             ))}
                         </div>
                    </div>

                    {/* Right Rail - Dynamic Content */}
                    <div className="col-span-8">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: `${config.spacing}rem` }}>
                            {config.order.map(section => {
                                if (section === 'experience') return <ExperienceSection key="exp" experiences={data.experiences} t={t} color={color} variant="classic" />;
                                if (section === 'projects') return <ProjectsSection key="proj" projects={data.projects} t={t} color={color} variant="grid" />;
                                if (section === 'education') return <EducationSection key="edu" education={data.education} t={t} color={color} variant="classic" />;
                                return null;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const CyberLayout = ({ data, t, color, config }: { data: PortfolioData, t: any, color: string, config: LayoutConfig }) => {
    // Cyber: Dark mode, tech feel, full width.
    const neonColor = color === '#000000' ? '#06b6d4' : color; // Default to cyan if black is chosen
    
    // UPDATED: Use flex-grow
    return (
        <div className="w-full flex-grow bg-[#05050a] text-blue-50 relative p-10 font-sans">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(${neonColor} 1px, transparent 1px), linear-gradient(90deg, ${neonColor} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
            
            {/* Top HUD */}
            <div className="relative z-10 flex justify-between items-start mb-12">
                <div className="flex items-center gap-6">
                    {data.profileImage && (
                        <div className="w-24 h-24 relative">
                             <div className="absolute inset-0 rounded-full animate-pulse" style={{ boxShadow: `0 0 20px ${neonColor}` }}></div>
                             <img src={data.profileImage} className="w-full h-full object-cover rounded-full relative z-10 border-2" style={{ borderColor: neonColor }} />
                        </div>
                    )}
                    <div>
                        <h1 className="text-4xl font-bold font-thai uppercase tracking-widest text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            {data.fullName}
                        </h1>
                        <div className="inline-block px-2 py-0.5 bg-white/10 border border-white/20 text-xs font-mono" style={{ color: neonColor }}>
                            Running Protocol: {data.title}
                        </div>
                    </div>
                </div>
                {/* UPDATED: Removed ID from display */}
                <div className="text-right font-mono text-xs text-slate-400 space-y-1">
                     <div>{data.email}</div>
                     <div>{data.location}</div>
                </div>
            </div>
            {/* Divider instead of border */}
            <div className="w-full h-px bg-white/10 mb-8 relative z-10"></div>

            {/* Dynamic Content */}
            <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: `${config.spacing}rem` }}>
                {config.order.map(section => {
                     if (section === 'about' && data.about) {
                        return (
                            // UPDATED: Removed border, used bg only
                            <div key="about" className="p-6 bg-white/5 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full transition-all group-hover:h-full h-0" style={{ backgroundColor: neonColor }}></div>
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-slate-400">
                                    <Terminal size={14}/> SYSTEM_LOG: About
                                </h3>
                                <p className="font-mono text-sm leading-relaxed text-slate-300 font-thai">
                                     {data.about}
                                </p>
                            </div>
                        )
                     }
                     if (section === 'skills') return <SkillsSection key="skill" skills={data.skills} t={t} color={neonColor} style="cyber" />;
                     if (section === 'experience') return <ExperienceSection key="exp" experiences={data.experiences} t={t} color={neonColor} variant="cyber" />;
                     if (section === 'projects') return <ProjectsSection key="proj" projects={data.projects} t={t} color={neonColor} variant="cyber" />;
                     if (section === 'education') return <EducationSection key="edu" education={data.education} t={t} color={neonColor} variant="cyber" />;
                     return null;
                })}
            </div>

             {/* Bottom Decoration */}
             <div className="absolute bottom-10 right-10 flex gap-1">
                 {[1,2,3,4].map(i => <div key={i} className="w-16 h-1 bg-white/10"></div>)}
             </div>
        </div>
    )
}


const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ data, lang, theme, primaryColor, layoutConfig }, ref) => {
  const t = LABELS[lang];
  
  // Ref for the outer container to measure available width
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Scaler logic to fit screen
  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Target width = A4 Width + some padding for aesthetics
        const targetWidth = A4_WIDTH_PX + 48; 
        
        if (containerWidth < targetWidth) {
           // Calculate scale to fit
           const newScale = containerWidth / targetWidth;
           setScale(newScale);
        } else {
           // If plenty of space, reset to 1 (actual size)
           setScale(1);
        }
      }
    };

    // Initial calculation
    calculateScale();
    
    // Listen for resize
    const observer = new ResizeObserver(calculateScale);
    if (containerRef.current) observer.observe(containerRef.current);

    window.addEventListener('resize', calculateScale);

    return () => {
        window.removeEventListener('resize', calculateScale);
        observer.disconnect();
    };
  }, []);

  // Internal content density scaler
  const scaledContentWidth = A4_WIDTH_PX / layoutConfig.scale;
  const scaledContentHeight = A4_MIN_HEIGHT_PX / layoutConfig.scale;

  // UPDATED: Dynamic Background Class
  const getBgClass = () => {
    if (theme === 'cyber') return 'bg-[#05050a]';
    if (theme === 'creative') return 'bg-slate-50';
    return 'bg-white';
  };

  return (
    <div 
      ref={containerRef}
      className="w-full flex justify-center py-8 bg-glass-200 rounded-xl overflow-hidden border border-glass-border transition-all"
    >
      {/* Visual Scaler Wrapper */}
      <div style={{
         transform: `scale(${scale})`,
         transformOrigin: 'top center',
      }}>
          <div 
            ref={ref}
            id="portfolio-content"
            className={`${getBgClass()} text-slate-800 shadow-2xl relative print-container transition-all`}
            style={{ 
                width: `${A4_WIDTH_PX}px`, 
                minHeight: `${A4_MIN_HEIGHT_PX}px`,
                margin: '0 auto', 
                boxSizing: 'border-box',
                transformOrigin: 'top center',
                // NEW: Handle Modern Theme Background on the parent container to prevent gaps
                background: theme === 'modern' 
                  ? `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor} 35%, #ffffff 35%, #ffffff 100%)` 
                  : undefined
            }}
          >
            <div style={{
                width: `${scaledContentWidth}px`,
                minHeight: `${scaledContentHeight}px`,
                transform: `scale(${layoutConfig.scale})`,
                transformOrigin: 'top left',
                display: 'flex',       
                flexDirection: 'column'
            }}>
                {theme === 'modern' && <ModernLayout data={data} t={t} color={primaryColor} config={layoutConfig} />}
                {theme === 'minimal' && <MinimalLayout data={data} t={t} color={primaryColor} config={layoutConfig} />}
                {theme === 'creative' && <CreativeLayout data={data} t={t} color={primaryColor} config={layoutConfig} />}
                {theme === 'cyber' && <CyberLayout data={data} t={t} color={primaryColor} config={layoutConfig} />}
            </div>
          </div>
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';
export default Preview;
