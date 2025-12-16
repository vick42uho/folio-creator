
import React, { useState, useRef } from 'react';
import { INITIAL_DATA, PortfolioData, Language, LABELS, ThemeOption, LayoutConfig } from './types';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { Download, FileText, LayoutTemplate, Languages, Sparkles, Palette, Monitor, Zap, PenTool, Terminal, ArrowUp, ArrowDown, ZoomIn, Maximize, Image as ImageIcon, ChevronDown, ChevronUp, FileOutput, Wand2, Loader2, QrCode, Lock, CheckCircle, X, Upload, Coffee, Heart } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { suggestDesign } from './services/geminiService';

const PRESET_COLORS = [
  '#06b6d4', // Cyan (Default)
  '#2563eb', // Blue
  '#7c3aed', // Violet
  '#e11d48', // Rose
  '#10b981', // Emerald
  '#d97706', // Amber
  '#0f172a', // Slate/Dark
];

// --- CONFIGURATION ---
// ใส่เบอร์ TrueMoney Wallet หรือ PromptPay ของคุณที่นี่ (เช่น '0812345678')
const MERCHANT_ID = '0924452492'; 
const PAYMENT_AMOUNT = 2.00;

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData>(INITIAL_DATA);
  const [lang, setLang] = useState<Language>(Language.TH);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDesignOpen, setIsDesignOpen] = useState(true);
  const [isDesigning, setIsDesigning] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<ThemeOption>('modern');
  const [primaryColor, setPrimaryColor] = useState<string>('#06b6d4');
  
  // Layout State
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
      order: ['about', 'experience', 'projects', 'skills', 'education'],
      scale: 1,
      spacing: 1.5
  });
  
  // --- PAYMENT STATE ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pdf' | 'png' | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);

  const t = LABELS[lang];

  const toggleLanguage = () => {
    setLang(prev => prev === Language.TH ? Language.EN : Language.TH);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
      const newOrder = [...layoutConfig.order];
      if (direction === 'up' && index > 0) {
          [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      } else if (direction === 'down' && index < newOrder.length - 1) {
          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      }
      setLayoutConfig({ ...layoutConfig, order: newOrder });
  };

  const handleMagicDesign = async () => {
     if (!data.title) return;
     setIsDesigning(true);
     const result = await suggestDesign(data.title, data.skills);
     if (result) {
         setTheme(result.theme);
         setPrimaryColor(result.color);
     }
     setIsDesigning(false);
  };

  // --- DOWNLOAD & PAYMENT INTERCEPTORS ---

  const initiateDownload = (type: 'pdf' | 'png') => {
      setPendingAction(type);
      setSlipImage(null); // Reset slip
      setShowPaymentModal(true);
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setSlipImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handlePaymentConfirm = async () => {
      // REMOVED CHECK: if (!slipImage) ...
      // "Up to the user" means we let them pass regardless.

      setIsProcessingPayment(true);
      // Simulate nice delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      
      // Execute the pending action
      if (pendingAction === 'pdf') {
          actualDownloadPDF();
      } else if (pendingAction === 'png') {
          actualDownloadPNG();
      }
      setPendingAction(null);
  };

  const actualDownloadPDF = async () => {
    setIsGenerating(true);
    // Slight delay to allow UI to settle to avoid glitch
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const element = document.getElementById('portfolio-content');
        if (!element) throw new Error("Content not found");

        // 1. Generate High-Res Image using html-to-image
        // Using pixelRatio 2.5 ensures text remains crisp even when rasterized
        const imgDataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2.5,
            cacheBust: true,
            backgroundColor: theme === 'cyber' ? '#05050a' : '#ffffff'
        });

        // 2. Initialize jsPDF (A4)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgDataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // 3. Add Image to PDF
        pdf.addImage(imgDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // 4. Save
        pdf.save(`${data.fullName.replace(/\s+/g, '_')}_Resume.pdf`);

    } catch (err) {
        console.error("PDF Generation failed", err);
        alert("Could not generate PDF automatically. Please try the PNG download instead.");
    } finally {
        setIsGenerating(false);
    }
  };

  const actualDownloadPNG = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const element = document.getElementById('portfolio-content');
      if (!element) throw new Error("Content not found");

      const dataUrl = await toPng(element, {
         quality: 1.0,
         pixelRatio: 2, 
         cacheBust: true,
         backgroundColor: theme === 'cyber' ? '#05050a' : '#ffffff',
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${data.fullName.replace(/\s+/g, '_')}_Portfolio.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("PNG Generation failed", err);
      alert("Could not generate PNG. Browser security might be blocking cross-origin images.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-10 font-sans text-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-glass-200 backdrop-blur-md border-b border-glass-border no-print shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-blue-200 to-cyan-200 font-thai tracking-wide drop-shadow-sm">
              Folio Creator
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-glass-input p-1 rounded-lg flex mr-4 border border-glass-border lg:hidden">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'editor' ? 'bg-cyan-500/20 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.1)] border border-cyan-500/30' : 'text-blue-300 hover:text-blue-100'}`}
                >
                  <span className="flex items-center gap-2">
                    <LayoutTemplate size={16} /> {t.editor}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-cyan-500/20 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.1)] border border-cyan-500/30' : 'text-blue-300 hover:text-blue-100'}`}
                >
                  <span className="flex items-center gap-2">
                    <FileText size={16} /> {t.preview}
                  </span>
                </button>
             </div>

            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-medium border border-glass-border text-cyan-100"
            >
              <Languages size={18} />
              {lang}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Editor Section */}
          <div className={`w-full lg:w-1/2 transition-all duration-300 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            <Editor data={data} onChange={setData} lang={lang} />
          </div>

          {/* Preview Section & Design Controls */}
          <div className={`w-full lg:w-1/2 flex flex-col items-center ${activeTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="w-full flex flex-col items-center gap-4">
               
               {/* Design Toolbar - Now Collapsible Accordion */}
               <div className="w-full max-w-[794px] bg-glass-100 backdrop-blur-xl rounded-2xl border border-glass-border shadow-lg no-print flex flex-col transition-all overflow-hidden">
                  <button 
                    onClick={() => setIsDesignOpen(!isDesignOpen)}
                    className="w-full p-4 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors"
                  >
                     <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-2">
                        <Monitor size={14}/> Design & Layout
                     </span>
                     {isDesignOpen ? <ChevronUp size={16} className="text-blue-300"/> : <ChevronDown size={16} className="text-blue-300"/>}
                  </button>
                  
                  {isDesignOpen && (
                  <div className="p-5 flex flex-col gap-6 border-t border-glass-border/30">
                      
                      {/* NEW: Magic Design Button */}
                      <button 
                         onClick={handleMagicDesign}
                         disabled={isDesigning || !data.title}
                         className="w-full py-3 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 hover:border-cyan-400 rounded-xl flex items-center justify-center gap-2 text-cyan-100 font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                      >
                         {isDesigning ? <Loader2 size={18} className="animate-spin"/> : <Wand2 size={18} className="text-cyan-300"/>}
                         <div className="flex flex-col items-start leading-none gap-1">
                            <span>{t.magicDesign}</span>
                            <span className="text-[10px] text-cyan-200/70 font-normal normal-case">{isDesigning ? t.applyingDesign : t.magicDesignDesc}</span>
                         </div>
                      </button>

                      {/* Theme Selector */}
                      <div>
                        <div className="text-xs font-bold text-blue-300/70 mb-3 uppercase tracking-wider flex items-center gap-1">
                            Select Layout
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => setTheme('modern')} className={`p-2 rounded-lg border transition-all text-xs font-medium flex flex-col items-center gap-2 ${theme === 'modern' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100' : 'bg-glass-input border-transparent text-slate-400'}`}>
                                <Monitor size={18} /> Modern
                            </button>
                            <button onClick={() => setTheme('minimal')} className={`p-2 rounded-lg border transition-all text-xs font-medium flex flex-col items-center gap-2 ${theme === 'minimal' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100' : 'bg-glass-input border-transparent text-slate-400'}`}>
                                <FileOutput size={18} /> Resume (Clean)
                            </button>
                            <button onClick={() => setTheme('creative')} className={`p-2 rounded-lg border transition-all text-xs font-medium flex flex-col items-center gap-2 ${theme === 'creative' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100' : 'bg-glass-input border-transparent text-slate-400'}`}>
                                <PenTool size={18} /> Creative
                            </button>
                            <button onClick={() => setTheme('cyber')} className={`p-2 rounded-lg border transition-all text-xs font-medium flex flex-col items-center gap-2 ${theme === 'cyber' ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-100 shadow-[0_0_10px_rgba(232,121,249,0.3)]' : 'bg-glass-input border-transparent text-slate-400'}`}>
                                <Terminal size={18} /> Secret
                            </button>
                        </div>
                      </div>

                      {/* Layout & Color Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Scale & Spacing */}
                          <div>
                              <div className="text-xs font-bold text-blue-300/70 mb-3 uppercase tracking-wider flex items-center gap-1">
                                    <Maximize size={12}/> {t.layoutSettings}
                              </div>
                              <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs text-blue-300 mb-1">
                                            <span className="flex items-center gap-1"><ZoomIn size={12}/> {t.scale}</span>
                                            <span>{Math.round(layoutConfig.scale * 100)}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0.8" max="1.2" step="0.05"
                                            value={layoutConfig.scale}
                                            onChange={(e) => setLayoutConfig({...layoutConfig, scale: parseFloat(e.target.value)})}
                                            className="w-full h-1 bg-glass-input rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-blue-300 mb-1">
                                            <span className="flex items-center gap-1"><ArrowUp size={12}/> {t.spacing}</span>
                                            <span>{layoutConfig.spacing}x</span>
                                        </div>
                                        <input 
                                            type="range" min="1" max="4" step="0.5"
                                            value={layoutConfig.spacing}
                                            onChange={(e) => setLayoutConfig({...layoutConfig, spacing: parseFloat(e.target.value)})}
                                            className="w-full h-1 bg-glass-input rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                        />
                                    </div>
                              </div>
                          </div>

                          {/* Color & Reorder */}
                          <div>
                              <div className="text-xs font-bold text-blue-300/70 mb-3 uppercase tracking-wider flex items-center gap-1">
                                    <Palette size={12}/> Colors & Order
                              </div>
                              <div className="flex gap-2 flex-wrap items-center mb-4">
                                    {PRESET_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setPrimaryColor(c)}
                                            className={`w-6 h-6 rounded-full border transition-all ${primaryColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input 
                                        type="color" value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 p-0"
                                    />
                                </div>
                                
                                {/* Simple Reorder Buttons */}
                                <div className="bg-glass-input p-2 rounded-lg border border-glass-border">
                                    <div className="text-[10px] text-blue-300 mb-2 uppercase">{t.reorder}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {layoutConfig.order.map((section, idx) => (
                                            <div key={section} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-xs text-blue-100 border border-white/10">
                                                <span className="capitalize">{section}</span>
                                                <div className="flex flex-col">
                                                    <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="hover:text-cyan-400 disabled:opacity-30"><ArrowUp size={8}/></button>
                                                    <button onClick={() => moveSection(idx, 'down')} disabled={idx === layoutConfig.order.length - 1} className="hover:text-cyan-400 disabled:opacity-30"><ArrowDown size={8}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                          </div>
                      </div>
                  </div>
                  )}

               </div>

               {/* PDF Action Bar */}
               <div className="w-full max-w-[794px] flex justify-between items-center bg-glass-100 backdrop-blur-md p-3 rounded-xl border border-glass-border mb-4 no-print shadow-xl">
                  <span className="text-sm text-cyan-200 pl-2">Preview (A4)</span>
                  <div className="flex gap-2">
                     <button
                        onClick={() => initiateDownload('png')}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-glass-input hover:bg-white/10 text-cyan-100 px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 border border-glass-border"
                      >
                        {isGenerating ? (
                          <>...</>
                        ) : (
                          <>
                            <ImageIcon size={18} />
                            {t.generatePNG}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => initiateDownload('pdf')}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-cyan-900/20 transition-all active:scale-95 disabled:opacity-50 border border-cyan-400/20"
                      >
                        {isGenerating ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Download size={18} />
                            {t.generatePDF}
                          </>
                        )}
                      </button>
                  </div>
               </div>
               
               {/* The Actual Preview Component */}
               <Preview 
                  data={data} 
                  lang={lang} 
                  theme={theme} 
                  primaryColor={primaryColor} 
                  layoutConfig={layoutConfig}
                  ref={previewRef} 
               />
            </div>
          </div>
        </div>

        {/* --- PAYMENT MODAL --- */}
        {showPaymentModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#0f172a] border border-glass-border p-6 rounded-2xl w-full max-w-sm relative shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
                    
                    <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <Heart size={32} className="text-pink-400 fill-pink-400" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 text-center">
                        {t.paymentRequired}
                    </h3>
                    <p className="text-slate-300 text-sm mb-4 text-center px-2 font-thai leading-relaxed">
                        {t.paymentDesc}
                    </p>

                    {/* QR Code MOCK */}
                    <div className="bg-white p-4 rounded-xl mb-4 flex flex-col items-center shadow-lg border-2 border-pink-500/30 w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-400"></div>
                        <div className="w-full flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                            {/* UPDATED: Uses reliable Wikimedia Thumbnail URL */}
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/c/c5/PromptPay-logo.png" 
                                className="h-8 object-contain" 
                                alt="PromptPay" 
                            />
                            <span className="text-sm font-bold text-slate-800">{t.price}</span>
                        </div>
                        
                        {/* Real PromptPay QR API - Still using fixed 5 baht for easier scanning, but text says up to you */}
                        <img 
                            src={`https://promptpay.io/${MERCHANT_ID}/${PAYMENT_AMOUNT}.png`} 
                            className="w-40 h-40 object-contain mix-blend-multiply" 
                            alt="Scan to Pay"
                        />
                        
                        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">{t.scanToPay}</p>
                    </div>

                    {/* Slip Upload */}
                    <div className="w-full mb-2">
                        <input 
                            type="file" 
                            ref={slipInputRef} 
                            onChange={handleSlipUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button 
                            onClick={() => slipInputRef.current?.click()}
                            className={`w-full py-2.5 border border-dashed rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${slipImage ? 'border-green-500/50 bg-green-500/10 text-green-300' : 'border-slate-600 hover:border-pink-400/50 hover:bg-pink-400/5 text-slate-400 hover:text-pink-200'}`}
                        >
                            {slipImage ? (
                                <><CheckCircle size={14}/> {t.slipAttached}</>
                            ) : (
                                <><Upload size={14}/> {t.uploadSlip}</>
                            )}
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-4 text-center w-full px-4">
                         {t.slipHint}
                    </p>

                    <button 
                        onClick={handlePaymentConfirm}
                        disabled={isProcessingPayment}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-400 hover:to-orange-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-pink-900/20 active:scale-95"
                    >
                        {isProcessingPayment ? (
                            <>
                                <Loader2 size={18} className="animate-spin"/>
                                {t.checkingPayment}
                            </>
                        ) : (
                            <>
                                <Coffee size={18} />
                                {t.confirmPayment}
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
