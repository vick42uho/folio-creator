
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { PortfolioData, Language, LABELS, ThemeOption, LayoutConfig } from '../types';
import { 
  Mail, Phone, MapPin, 
  Briefcase, Code, User, Linkedin, Github, Globe, Twitter, Facebook, Instagram,
  GraduationCap, Cpu, Layers, Terminal, Folder, Zap, Calendar
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
  const p = platform ? platform.toLowerCase() : '';
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
const ScalableText = ({ children, className = "", style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const calculate = () => {
             if (outerRef.current && measureRef.current) {
                 const outerWidth = outerRef.current.offsetWidth;
                 const naturalWidth = measureRef.current.offsetWidth;
                 if (naturalWidth > outerWidth && naturalWidth > 0) {
                     setScale(outerWidth / naturalWidth);
                 } else {
                     setScale(1);
                 }
             }
        };
        const observer = new ResizeObserver(calculate);
        if (outerRef.current) observer.observe(outerRef.current);
        calculate();
        setTimeout(calculate, 100);
        return () => observer.disconnect();
    }, [children]);

    return (
        <div ref={outerRef} className={`w-full relative ${className}`} style={{ ...style, overflow: 'hidden' }}>
            <div ref={measureRef} style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', width: 'auto', height: 'auto', left: 0, top: 0 }} aria-hidden="true">{children}</div>
            <div style={{ whiteSpace: 'nowrap', fontSize: `${scale}em`, width: '100%', transformOrigin: 'left center' }}>{children}</div>
        </div>
    )
}

// --- Section Components ---

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
                        <div key={i} className="px-3 py-1 bg-black/40 text-xs font-mono text-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.2)]">[{s}]</div>
                    ))}
                </div>
            </div>
        )
    }
    if (style === 'sidebar-clean') {
        return (
            <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-white border-b border-white/20 pb-2">
                    {t.skills}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {list.map((s, i) => (
                        <span key={i} className="px-2 py-1 rounded text-xs font-medium font-thai bg-white/10 text-white/90 border border-white/10">{s}</span>
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
                    <span key={i} className={`px-3 py-1.5 text-xs font-bold font-thai ${style === 'tag' ? 'rounded-md bg-slate-100 text-slate-700' : 'border-b-2 border-slate-100 text-slate-800'}`} style={style === 'tag' ? {} : { borderColor: color }}>{s}</span>
                ))}
            </div>
        </div>
    );
};

const ExperienceSection: React.FC<{ experiences: any[], t: any, color: string, variant?: 'classic' | 'minimal' | 'cyber' | 'modern' }> = ({ experiences, t, color, variant = 'classic' }) => {
    if (experiences.length === 0) return null;
    return (
        <div className="mb-8">
            <h2 className={`text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-4 font-thai ${variant === 'cyber' ? 'text-cyan-400' : 'text-slate-800'}`}>
                {variant === 'modern' ? (
                    <>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0" style={{ backgroundColor: color }}><Briefcase size={16} /></div>
                        <span className="flex-1 font-bold text-slate-800">{t.experience}</span>
                    </>
                ) : (
                    <>
                        {variant !== 'minimal' && <div className={`p-1.5 rounded ${variant === 'cyber' ? 'bg-cyan-900/30' : 'text-white'}`} style={variant !== 'cyber' ? { backgroundColor: color } : {}}><Briefcase size={16} /></div>}
                        <span className={variant === 'classic' ? 'text-slate-800' : ''}>{t.experience}</span>
                    </>
                )}
            </h2>
            <div className={`space-y-${variant === 'minimal' ? 8 : 6}`}>
                {variant === 'modern' ? (
                    <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-2">
                        {experiences.map((exp, i) => (
                            <div key={exp.id} className="relative pl-8">
                                {/* Dot */}
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-[3px]" style={{ borderColor: color }}></div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight font-thai">{exp.role}</h3>
                                    <span className="text-xs font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded ml-2 whitespace-nowrap">{exp.duration}</span>
                                </div>
                                <div className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-1" style={{ color }}>
                                    {exp.company}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed text-justify font-thai">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    experiences.map((exp, i) => (
                        <div key={exp.id} className={`relative ${variant === 'classic' ? 'pl-4 border-l-2' : ''}`} style={{ borderColor: variant === 'classic' ? `${color}40` : 'transparent' }}>
                             {variant === 'classic' && <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>}
                             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                <h3 className={`text-base font-bold font-thai ${variant === 'cyber' ? 'text-white' : 'text-slate-800'}`}>{exp.role}</h3>
                                <span className={`text-xs font-mono font-bold whitespace-nowrap ${variant === 'cyber' ? 'text-cyan-600' : 'text-slate-500'}`}>{exp.duration}</span>
                            </div>
                            <div className={`text-xs font-bold uppercase tracking-wider mb-2 font-thai ${variant === 'cyber' ? 'text-cyan-200' : ''}`} style={variant !== 'cyber' ? { color } : {}}>{exp.company}</div>
                            <p className={`text-sm leading-relaxed font-thai whitespace-pre-wrap ${variant === 'cyber' ? 'text-slate-300 font-light' : 'text-slate-600'}`}>{exp.description}</p>
                        </div>
                    ))
                )}
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
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0" style={{ backgroundColor: color }}><Folder size={16} /></div>
                        <span className="flex-1 font-bold text-slate-800">{t.projects}</span>
                    </>
                ) : (
                    <>
                        {variant !== 'grid' && <div className={`p-1.5 rounded ${variant === 'cyber' ? 'bg-cyan-900/30' : 'text-white'}`} style={variant !== 'cyber' ? { backgroundColor: color } : {}}><Folder size={16} /></div>}
                        <span className={variant === 'classic' ? 'text-slate-800' : ''}>{t.projects}</span>
                    </>
                )}
            </h2>
            <div className={variant === 'grid' || variant === 'modern' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                {projects.map((proj) => (
                    <div key={proj.id} className={`${variant === 'cyber' ? 'bg-slate-900/50' : 'bg-white'} ${variant === 'modern' ? 'p-5 border-t-4 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.08)]' : 'p-4 rounded-lg border border-slate-100'} relative overflow-hidden group`} style={variant === 'modern' ? { borderTopColor: color } : {}}>
                        <h3 className={`text-base font-bold font-thai mb-2 ${variant === 'cyber' ? 'text-white' : 'text-slate-800'}`}>{proj.name}</h3>
                        <p className={`text-sm mb-3 font-thai leading-relaxed ${variant === 'cyber' ? 'text-slate-400' : 'text-slate-600 line-clamp-3'}`}>{proj.description}</p>
                        <div className={`text-[10px] font-bold uppercase tracking-wider font-thai ${variant === 'cyber' ? 'text-cyan-600' : 'text-slate-400'} flex items-center gap-1`}>
                            <Code size={10} style={variant === 'modern' ? {color} : {}} />
                            <span style={variant === 'modern' ? { color: `${color}` } : {}}>{proj.technologies}</span>
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
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-white border-b border-white/20 pb-2">
                    {t.education}
                </h2>
                <div className="space-y-4">
                    {education.map(edu => (
                        <div key={edu.id} className="relative">
                            <div className="text-sm font-bold font-thai text-white leading-tight mb-0.5">{edu.degree}</div>
                            <div className="text-xs font-thai text-white/70 mb-1">{edu.institution}</div>
                            <div className="inline-block px-2 py-0.5 bg-white/10 rounded text-[10px] font-mono font-bold text-white/90">{edu.year}</div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return (
        <div className="mb-8">
             <h2 className={`text-lg font-black uppercase tracking-widest mb-5 flex items-center gap-3 font-thai ${variant === 'cyber' ? 'text-cyan-400' : 'text-slate-800'}`} style={variant === 'classic' ? { color } : {}}>
                {variant !== 'minimal' && <div className={`p-1.5 rounded ${variant === 'cyber' ? 'bg-cyan-900/30' : 'text-white'}`} style={variant !== 'cyber' ? { backgroundColor: color } : {}}><GraduationCap size={16} /></div>}
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

const ModernLayout = ({ data, t, color, config, minHeight }: { data: PortfolioData, t: any, color: string, config: LayoutConfig, minHeight?: string }) => {
    const mainSections = config.order.filter(id => ['experience', 'projects', 'about'].includes(id));
    const firstLink = data.links && data.links.length > 0 ? data.links[0] : null;
    
    return (
      <div 
        className="grid grid-cols-[33%_1fr] w-full flex-grow text-slate-800" 
        style={{ 
            minHeight,
            // Background is now handled by the parent container to prevent shrinking issues
        }}
      >
        
        {/* SIDEBAR: Transparent background, relies on parent gradient */}
        <div className="p-8 flex flex-col relative overflow-hidden text-white h-full">
             {/* Decorative Elements - White/Black overlays for texture regardless of bg color */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

             <div className="mb-10 text-center relative z-10">
                 <div className="w-44 h-44 mx-auto rounded-full p-1.5 bg-white/20 mb-6 relative group">
                     <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 bg-black/10 relative">
                        {data.profileImage ? (
                            <img src={data.profileImage} className="w-full h-full object-cover" crossOrigin="anonymous" /> 
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/70"><User size={60} /></div>
                        )}
                     </div>
                     {/* Status Dot - White to pop against custom color */}
                     <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full border-4 border-transparent bg-white shadow-sm"></div>
                 </div>
             </div>

             {/* Sidebar Content */}
             <div className="relative z-10 space-y-10 pb-36">
                {/* Contact */}
                <div>
                     <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-white border-b border-white/20 pb-2">
                        {t.contact}
                     </h3>
                     <div className="space-y-4 text-sm">
                        {data.email && (
                            <div className="flex items-start gap-3 group">
                                <div className="shrink-0 p-1.5 rounded bg-white/10 text-white/80 group-hover:bg-white/20 transition-colors"><Mail size={14} /></div>
                                <div className="font-medium text-white/90 break-all leading-tight pt-1.5">{data.email}</div>
                            </div>
                        )}
                        {data.phone && (
                            <div className="flex items-center gap-3 group">
                                <div className="shrink-0 p-1.5 rounded bg-white/10 text-white/80 group-hover:bg-white/20 transition-colors"><Phone size={14} /></div>
                                <div className="font-medium text-white/90 leading-tight">{data.phone}</div>
                            </div>
                        )}
                        {data.location && (
                            <div className="flex items-center gap-3 group">
                                <div className="shrink-0 p-1.5 rounded bg-white/10 text-white/80 group-hover:bg-white/20 transition-colors"><MapPin size={14} /></div>
                                <div className="font-medium text-white/90 leading-tight">{data.location}</div>
                            </div>
                        )}
                        {data.links?.map(l => (
                            <div key={l.id} className="flex items-center gap-3 group">
                                <div className="shrink-0 p-1.5 rounded bg-white/10 text-white/80 group-hover:bg-white/20 transition-colors">{getLinkIcon(l.platform, 14)}</div>
                                <div className="font-medium text-white/90 leading-tight break-all">{l.url.replace(/^https?:\/\//, '')}</div>
                            </div>
                        ))}
                     </div>
                </div>

                {/* Education in Sidebar */}
                <EducationSection education={data.education} t={t} color={color} variant="modern-sidebar" />

                {/* Skills in Sidebar */}
                <SkillsSection skills={data.skills} t={t} color={color} style="sidebar-clean" />
             </div>

             {/* Footer - Fixed at bottom of sidebar column */}
             <div className="absolute bottom-8 left-0 w-full px-8 z-20">
                 <div className="pt-8 border-t border-white/10 flex flex-col items-center justify-center opacity-80">
                     {firstLink && firstLink.url && (
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-1 rounded"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(firstLink.url.startsWith('http') ? firstLink.url : 'https://' + firstLink.url)}`} alt="QR Code" className="w-12 h-12" crossOrigin="anonymous"/></div>
                            <div className="text-[10px] font-bold text-white/60 leading-tight">
                                SCAN FOR<br/>
                                <span className="text-white uppercase tracking-wider">{firstLink.platform || 'WEB PROFILE'}</span>
                            </div>
                        </div>
                     )}
                 </div>
             </div>
        </div>

        {/* MAIN CONTENT: White Background */}
        <div className="p-12 pt-16 relative">
            
            {/* Header Area */}
            <div className="mb-12 border-b-4 border-slate-100 pb-8">
                <h1 className="text-5xl font-black font-thai text-slate-900 mb-2 tracking-tight uppercase leading-none">
                    {data.fullName}
                </h1>
                <div className="text-xl font-bold font-thai tracking-[0.2em] uppercase flex items-center gap-3" style={{ color: color }}>
                    {data.title}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: `${config.spacing * 1.5}rem` }}>
                
                {/* About Section - Special Styling */}
                {data.about && config.order.includes('about') && (
                     <div>
                        <h2 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-4 font-thai text-slate-800">
                             <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0" style={{ backgroundColor: color }}><User size={16} /></div>
                             <span className="flex-1 font-bold text-slate-800">{t.about}</span>
                        </h2>
                        <p className="text-slate-600 leading-8 font-thai whitespace-pre-wrap text-justify text-base pl-2 border-l-4 border-slate-100">
                            {data.about}
                        </p>
                    </div>
                )}

                {/* Main Dynamic Sections */}
                {mainSections.filter(s => s !== 'about').map(section => {
                    if (section === 'experience') return <ExperienceSection key="exp" experiences={data.experiences} t={t} color={color} variant="modern" />;
                    if (section === 'projects') return <ProjectsSection key="proj" projects={data.projects} t={t} color={color} variant="modern" />;
                    return null;
                })}
            </div>
        </div>
      </div>
    );
 };

const MinimalLayout = ({ data, t, color, config, minHeight }: { data: PortfolioData, t: any, color: string, config: LayoutConfig, minHeight?: string }) => {
    return (
        <div className="w-full flex-grow bg-white p-12 text-slate-900" style={{ minHeight }}>
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
                     if (section === 'about' && data.about) return (<div key="about" className="grid grid-cols-12 gap-6"><div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">About</div><div className="col-span-9 text-lg font-thai font-medium leading-relaxed">{data.about}</div></div>)
                     if (section === 'skills' && data.skills) return (<div key="skills" className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-8"><div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">Skills</div><div className="col-span-9 flex flex-wrap gap-x-6 gap-y-2">{data.skills.split(',').map((s,i) => (<span key={i} className="font-thai font-bold border-b-2 border-transparent hover:border-black transition-colors">{s.trim()}</span>))}</div></div>)
                     if (section === 'experience') return (<div key="exp" className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-8"><div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">Experience</div><div className="col-span-9"><ExperienceSection experiences={data.experiences} t={t} color={color} variant="minimal" /></div></div>)
                     if (section === 'projects') return (<div key="proj" className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-8"><div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">Selected Works</div><div className="col-span-9"><ProjectsSection projects={data.projects} t={t} color={color} variant="grid" /></div></div>)
                     if (section === 'education') return (<div key="edu" className="grid grid-cols-12 gap-6 border-t border-slate-100 pt-8"><div className="col-span-3 text-xs font-black uppercase tracking-widest pt-1">Education</div><div className="col-span-9"><EducationSection education={data.education} t={t} color={color} variant="minimal" /></div></div>)
                    return null;
                })}
            </div>
        </div>
    )
}

const CreativeLayout = ({ data, t, color, config, minHeight }: { data: PortfolioData, t: any, color: string, config: LayoutConfig, minHeight?: string }) => {
    // Split name for dual-tone typography
    const nameParts = data.fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
        <div className="w-full flex-grow bg-white relative overflow-hidden text-slate-900 font-sans h-full" style={{ minHeight }}>
             {/* --- BACKGROUND GEOMETRIC ELEMENTS --- */}
             
             {/* 1. Top Right: Large Soft Circle + Solid Dimensional Circle */}
             <div 
                className="absolute -top-[50%] -right-[50%] rounded-full opacity-5 pointer-events-none mix-blend-multiply blur-[80px]" 
                style={{ width: '200%', paddingBottom: '200%', backgroundColor: color }}
             ></div>
             
             {/* New Solid Dimensional Circle (Replaces Outline Ring) */}
             <div 
                className="absolute -top-[5%] -right-[5%] rounded-full opacity-30 pointer-events-none"
                style={{ 
                    width: '50%', 
                    paddingBottom: '50%', 
                    backgroundColor: color,
                    // Simple dimensional effect using box-shadow
                    boxShadow: 'inset 0 0 100px rgba(255,255,255,0.4)' 
                }}
             ></div>

             {/* 2. Bottom Left: Texture & Shape */}
             <div 
                className="absolute -bottom-[20%] -left-[20%] rounded-full opacity-10 pointer-events-none mix-blend-multiply" 
                style={{ width: '80%', paddingBottom: '80%', backgroundColor: color }}
             ></div>
             {/* Dot Pattern Texture */}
             <div 
                className="absolute bottom-10 left-10 w-48 h-48 opacity-20 pointer-events-none"
                style={{ 
                    backgroundImage: `radial-gradient(${color} 2px, transparent 2px)`, 
                    backgroundSize: '20px 20px' 
                }}
             ></div>


             {/* --- MAIN CONTENT --- */}
             <div className="relative z-10 p-12 h-full flex flex-row gap-16 items-stretch">
                
                {/* --- LEFT COLUMN (40%) --- */}
                <div className="w-[40%] flex flex-col pt-10">
                     
                     {/* Role Badge - Dark Box with White Text */}
                     <div className="inline-block px-4 py-2 mb-6 text-sm font-black uppercase tracking-[0.1em] bg-slate-900 text-white self-start shadow-lg">
                        {data.title}
                     </div>

                     {/* Name (Dual Tone) */}
                     <h1 className="text-[3.5rem] font-black font-thai leading-[0.9] mb-8 break-words tracking-tight">
                        <span className="text-slate-900 block">{firstName}</span>
                        <span style={{ color: color }}>{lastName}</span>
                     </h1>
                     
                     {/* Contact */}
                     <div className="text-sm font-medium text-slate-600 mb-6 flex flex-col gap-3">
                         {data.email && <div className="flex items-center gap-3 group"><div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors"><Mail size={14}/></div>{data.email}</div>}
                         {data.phone && <div className="flex items-center gap-3 group"><div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors"><Phone size={14}/></div>{data.phone}</div>}
                         {data.location && <div className="flex items-center gap-3 group"><div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors"><MapPin size={14}/></div>{data.location}</div>}
                     </div>

                     {/* Social Links - IMPROVED VISIBILITY (Show Text) */}
                     {data.links && data.links.length > 0 && (
                        <div className="flex flex-col gap-3 mb-10 pl-2 border-l-2 border-slate-100 ml-3">
                            {data.links.map(l => (
                                <div key={l.id} className="flex flex-col items-start gap-0.5 group">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        {getLinkIcon(l.platform, 14)} 
                                        <span>{l.platform || 'Link'}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono pl-6 break-all">
                                        {l.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}

                     {/* About */}
                     {data.about && (
                         <div className="mb-10 relative">
                             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">About Me</h3>
                             <p className="font-thai text-slate-600 text-base leading-relaxed text-justify">
                                 {data.about}
                             </p>
                         </div>
                     )}

                     {/* Skills (Tags Style) */}
                     {data.skills && (
                         <div className="mb-12">
                             <h3 className="text-sm font-black font-thai text-slate-900 mb-4 uppercase tracking-wider border-b-2 border-slate-100 pb-2 inline-block">
                                 {t.skills}
                             </h3>
                             <div className="flex flex-wrap gap-2.5">
                                 {data.skills.split(',').map((s, i) => (
                                     <span key={i} 
                                        className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 font-thai hover:bg-white transition-colors"
                                     >
                                         {s.trim()}
                                     </span>
                                 ))}
                             </div>
                         </div>
                     )}
                </div>

                {/* --- RIGHT COLUMN (60%) --- */}
                <div className="w-[60%] relative flex flex-col pt-4">
                    
                    {/* Profile Image (Specific Leaf Shape: Rounded Top-Right & Bottom-Left) */}
                    <div className="flex justify-end mb-16 relative z-20 pr-4">
                         {/* Back Frame */}
                         <div className="absolute top-4 right-4 w-60 h-60 rounded-tr-[4rem] rounded-bl-[4rem] -z-10 opacity-20" style={{ backgroundColor: color }}></div>
                         
                         {/* Image Container */}
                         {data.profileImage ? (
                            <div className="w-60 h-60 bg-white shadow-2xl rounded-tr-[4rem] rounded-bl-[4rem] overflow-hidden relative border-4 border-white">
                                <img src={data.profileImage} className="w-full h-full object-cover" crossOrigin="anonymous"/>
                            </div>
                         ) : (
                             <div className="w-60 h-60 bg-slate-50 border-4 border-white shadow-xl rounded-tr-[4rem] rounded-bl-[4rem] flex items-center justify-center">
                                <User size={64} className="text-slate-300"/>
                             </div>
                         )}
                    </div>

                    <div className="space-y-12 pl-4">
                        
                        {/* Experience */}
                        {data.experiences.length > 0 && (
                            <div>
                                 <h2 className="text-2xl font-black font-thai text-slate-900 mb-8 flex items-center gap-4">
                                     {t.experience}
                                     <div className="h-1 w-12" style={{ backgroundColor: color }}></div>
                                 </h2>
                                 
                                 <div className="space-y-0 relative border-l-2 border-slate-100 ml-2">
                                     {data.experiences.map((exp, i) => (
                                         <div key={exp.id} className="relative pl-8 pb-10 last:pb-0">
                                             {/* Timeline Node */}
                                             <div className="absolute -left-[7px] top-2 w-3.5 h-3.5 rounded-full bg-white border-[3px]" style={{ borderColor: color }}></div>
                                             
                                             <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="text-lg font-bold text-slate-900 leading-tight">{exp.role}</h3>
                                                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{exp.duration}</span>
                                             </div>
                                             
                                             <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: color }}>{exp.company}</div>
                                             
                                             <p className="text-slate-600 text-sm leading-relaxed font-thai">
                                                 {exp.description}
                                             </p>
                                         </div>
                                     ))}
                                 </div>
                            </div>
                        )}

                        {/* Projects (Card Style) */}
                        {data.projects.length > 0 && (
                            <div>
                                 <h2 className="text-2xl font-black font-thai text-slate-900 mb-8 flex items-center gap-4">
                                     {t.projects}
                                     <div className="h-1 w-12" style={{ backgroundColor: color }}></div>
                                 </h2>
                                 
                                 <div className="grid grid-cols-1 gap-4">
                                     {data.projects.map(proj => (
                                         <div key={proj.id} className="bg-white p-6 rounded-lg border-l-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] hover:shadow-md transition-shadow" style={{ borderLeftColor: color }}>
                                             <h3 className="text-lg font-bold text-slate-900 mb-1">{proj.name}</h3>
                                             <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
                                                 <Zap size={10} style={{ color }}/> {proj.technologies}
                                             </div>
                                             <p className="text-slate-600 text-sm leading-relaxed font-thai">{proj.description}</p>
                                         </div>
                                     ))}
                                 </div>
                            </div>
                        )}
                        
                        {/* Education */}
                         {data.education.length > 0 && (
                            <div>
                                 <h2 className="text-xl font-black font-thai text-slate-900 mb-6 flex items-center gap-4 mt-6">
                                     {t.education}
                                     <div className="h-1 w-8 opacity-50" style={{ backgroundColor: color }}></div>
                                 </h2>
                                 <div className="space-y-4">
                                     {data.education.map(edu => (
                                         <div key={edu.id} className="flex justify-between items-center border-b border-slate-50 pb-3">
                                             <div>
                                                 <h3 className="text-base font-bold text-slate-800">{edu.degree}</h3>
                                                 <div className="text-slate-500 text-xs mt-0.5 font-medium">{edu.institution}</div>
                                             </div>
                                             <div className="text-xs font-bold font-mono text-slate-400">{edu.year}</div>
                                         </div>
                                     ))}
                                 </div>
                            </div>
                        )}

                    </div>
                </div>
             </div>
        </div>
    )
}

const CyberLayout = ({ data, t, color, config, minHeight }: { data: PortfolioData, t: any, color: string, config: LayoutConfig, minHeight?: string }) => {
    const neonColor = color === '#000000' ? '#06b6d4' : color;
    return (
        <div className="w-full flex-grow bg-[#05050a] text-blue-50 relative p-10 font-sans" style={{ minHeight }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(${neonColor} 1px, transparent 1px), linear-gradient(90deg, ${neonColor} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
            <div className="relative z-10 flex justify-between items-start mb-12">
                <div className="flex items-center gap-6">
                    {data.profileImage && (
                        <div className="w-24 h-24 relative">
                             <div className="absolute inset-0 rounded-full animate-pulse" style={{ boxShadow: `0 0 20px ${neonColor}` }}></div>
                             <img src={data.profileImage} className="w-full h-full object-cover rounded-full relative z-10 border-2" style={{ borderColor: neonColor }} crossOrigin="anonymous" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-4xl font-bold font-thai uppercase tracking-widest text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{data.fullName}</h1>
                        <div className="inline-block px-2 py-0.5 bg-white/10 border border-white/20 text-xs font-mono" style={{ color: neonColor }}>Running Protocol: {data.title}</div>
                    </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-400 space-y-1"><div>{data.email}</div><div>{data.location}</div></div>
            </div>
            <div className="w-full h-px bg-white/10 mb-8 relative z-10"></div>
            <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: `${config.spacing}rem` }}>
                {config.order.map(section => {
                     if (section === 'about' && data.about) return (<div key="about" className="p-6 bg-white/5 backdrop-blur-sm relative overflow-hidden group"><div className="absolute top-0 left-0 w-1 h-full transition-all group-hover:h-full h-0" style={{ backgroundColor: neonColor }}></div><h3 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-slate-400"><Terminal size={14}/> SYSTEM_LOG: About</h3><p className="font-mono text-sm leading-relaxed text-slate-300 font-thai"> {data.about}</p></div>)
                     if (section === 'skills') return <SkillsSection key="skill" skills={data.skills} t={t} color={neonColor} style="cyber" />;
                     if (section === 'experience') return <ExperienceSection key="exp" experiences={data.experiences} t={t} color={neonColor} variant="cyber" />;
                     if (section === 'projects') return <ProjectsSection key="proj" projects={data.projects} t={t} color={neonColor} variant="cyber" />;
                     if (section === 'education') return <EducationSection key="edu" education={data.education} t={t} color={neonColor} variant="cyber" />;
                     return null;
                })}
            </div>
             <div className="absolute bottom-10 right-10 flex gap-1">{[1,2,3,4].map(i => <div key={i} className="w-16 h-1 bg-white/10"></div>)}</div>
        </div>
    )
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ data, lang, theme, primaryColor, layoutConfig }, ref) => {
  const t = LABELS[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const targetWidth = A4_WIDTH_PX + 48; 
        if (containerWidth < targetWidth) {
           const newScale = containerWidth / targetWidth;
           setScale(newScale);
        } else {
           setScale(1);
        }
      }
    };
    calculateScale();
    const observer = new ResizeObserver(calculateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', calculateScale);
    return () => {
        window.removeEventListener('resize', calculateScale);
        observer.disconnect();
    };
  }, []);

  const scaledContentWidth = A4_WIDTH_PX / layoutConfig.scale;
  const scaledContentHeight = A4_MIN_HEIGHT_PX / layoutConfig.scale;

  const getContainerBackground = () => {
      if (theme === 'modern') {
          // Linear gradient that matches the 33% sidebar column. 
          // Applied to the root container to ensure it always fills the full A4 height.
          return `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor} 33%, white 33%, white 100%)`;
      }
      if (theme === 'cyber') return '#05050a';
      if (theme === 'creative') return 'white'; 
      return 'white';
  };

  return (
    <div ref={containerRef} className="w-full flex justify-center py-8 bg-glass-200 rounded-xl overflow-hidden border border-glass-border transition-all">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          <div ref={ref} id="portfolio-content" className={`text-slate-800 shadow-2xl relative print-container transition-all`}
            style={{ 
                width: `${A4_WIDTH_PX}px`, 
                minHeight: `${A4_MIN_HEIGHT_PX}px`,
                margin: '0 auto', 
                boxSizing: 'border-box',
                transformOrigin: 'top center',
                background: getContainerBackground(),
            }}
          >
            <div style={{ width: `${scaledContentWidth}px`, minHeight: `${scaledContentHeight}px`, transform: `scale(${layoutConfig.scale})`, transformOrigin: 'top left', display: 'flex', flexDirection: 'column' }}>
                {theme === 'modern' && <ModernLayout data={data} t={t} color={primaryColor} config={layoutConfig} minHeight={`${scaledContentHeight}px`} />}
                {theme === 'minimal' && <MinimalLayout data={data} t={t} color={primaryColor} config={layoutConfig} minHeight={`${scaledContentHeight}px`} />}
                {theme === 'creative' && <CreativeLayout data={data} t={t} color={primaryColor} config={layoutConfig} minHeight={`${scaledContentHeight}px`} />}
                {theme === 'cyber' && <CyberLayout data={data} t={t} color={primaryColor} config={layoutConfig} minHeight={`${scaledContentHeight}px`} />}
            </div>
          </div>
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';
export default Preview;
