"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  Presentation, 
  Sparkles, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Check, 
  AlertCircle,
  FolderOpen,
  Shield,
  FileText,
  Cpu
} from "lucide-react";
import { Button, Select, SelectItem, Input, Textarea, Chip } from "@heroui/react";
import ChatBotLayout from "@/components/ChatbotLayout";
import { RootState } from "@/store";

const STRATEGIST_MODES = [
  { value: "Technical Deep Dive", label: "Technical Deep Dive (Pyramid Structure)" },
  { value: "Executive Summary", label: "Executive Summary (Narrative Arc)" },
  { value: "Developer Reference", label: "Developer Reference (Module Map)" },
];

const VISUAL_THEMES = [
  { value: "Sleek Dark Mode", label: "Sleek Dark Mode (Default)" },
  { value: "Corporate Grid", label: "Corporate Grid (Blue/Slate)" },
  { value: "Sovereign Minimalist", label: "Sovereign Minimalist (Slate/White)" },
];

const AI_MODELS = [
  { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash (Fast)" },
  { value: "gemini-3.1-pro", label: "Gemini 3.1 Pro (Deep)" },
  { value: "claude-fable-5", label: "Claude Fable 5 (Latest)" },
  { value: "claude-sonnet-4.6", label: "Claude Sonnet 4.6 (Precise)" },
  { value: "claude-opus-4.8", label: "Claude Opus 4.8 (High-Stakes)" },
];

export default function SlidesPage() {
  const [title, setTitle] = useState("System Architecture Review");
  const [subtitle, setSubtitle] = useState("Enterprise Swarms & Ingestion Context");
  const [prompt, setPrompt] = useState("");
  const [strategistMode, setStrategistMode] = useState("Technical Deep Dive");
  const [visualStyle, setVisualStyle] = useState("Sleek Dark Mode");
  const [modelId, setModelId] = useState("gemini-3.5-flash");
  const [selectedContext, setSelectedContext] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Pull existing context data from Redux stores to populate context selector
  const repositories = useSelector((state: RootState) => state.system.repositories || []);
  const documents = useSelector((state: RootState) => state.system.documents || []);

  const handleToggleContext = (name: string) => {
    setSelectedContext(prev => 
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/v1/presentation/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          prompt,
          strategistMode,
          visualStyle,
          selectedContext,
          modelId,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate presentation layout");
      
      const data = await response.json();
      if (data.slides) {
        setGeneratedSlides(data.slides);
        setActiveSlideIndex(0);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to build slide structure. Check console logs for detail.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading || generatedSlides.length === 0) return;
    setIsDownloading(true);
    try {
      const response = await fetch("/api/v1/presentation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          visualStyle,
          slides: generatedSlides,
        }),
      });

      if (!response.ok) throw new Error("PowerPoint compilation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, "_")}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to compile PowerPoint.");
    } finally {
      setIsDownloading(false);
    }
  };

  const isDark = visualStyle === "Sleek Dark Mode";
  const currentSlide = generatedSlides[activeSlideIndex];

  // Navigation handlers
  const handlePrev = () => setActiveSlideIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setActiveSlideIndex(prev => Math.min(generatedSlides.length - 1, prev + 1));

  return (
    <ChatBotLayout>
      <div className="flex-grow overflow-y-auto bg-default-50 dark:bg-[#09090C] p-8 font-sans scrollbar-hide w-full h-full flex flex-col items-center">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-160px)] items-stretch">
          
          {/* Left Column: Form Controls */}
          <div className="w-full lg:w-[420px] bg-white dark:bg-[#111116] border border-default-200/50 p-6 rounded-3xl flex flex-col justify-between shrink-0 shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-default-100">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Presentation className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Presentation Swarm</h1>
                  <p className="text-[11px] text-default-500 font-medium">Natively editable PPTX Generation</p>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-default-600 uppercase tracking-wider">Slide Title</label>
                  <Input 
                    classNames={{ inputWrapper: "!bg-default-100 dark:!bg-default-50/5 hover:!bg-default-200/50" }} 
                    placeholder="Enter slide title..."
                    size="sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-default-600 uppercase tracking-wider">Subtitle</label>
                  <Input 
                    classNames={{ inputWrapper: "!bg-default-100 dark:!bg-default-50/5 hover:!bg-default-200/50" }} 
                    placeholder="Enter subtitle..."
                    size="sm"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Context Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-default-600 uppercase tracking-wider">Attach Codebase Context</label>
                <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1 select-none">
                  {repositories.map(repo => (
                    <button
                      key={repo.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                        selectedContext.includes(repo.name) 
                          ? "bg-primary/5 border-primary/40 text-primary" 
                          : "bg-default-50/50 dark:bg-default-50/5 border-default-200/50 text-default-700 hover:bg-default-100"
                      }`}
                      type="button"
                      onClick={() => handleToggleContext(repo.name)}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FolderOpen className="w-3.5 h-3.5 opacity-60" />
                        <span className="truncate">{repo.name}</span>
                      </span>
                      {selectedContext.includes(repo.name) && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                  {documents.map(doc => (
                    <button
                      key={doc.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                        selectedContext.includes(doc.name) 
                          ? "bg-primary/5 border-primary/40 text-primary" 
                          : "bg-default-50/50 dark:bg-default-50/5 border-default-200/50 text-default-700 hover:bg-default-100"
                      }`}
                      type="button"
                      onClick={() => handleToggleContext(doc.name)}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 opacity-60" />
                        <span className="truncate">{doc.name}</span>
                      </span>
                      {selectedContext.includes(doc.name) && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                  {repositories.length === 0 && documents.length === 0 && (
                    <div className="text-[11px] text-default-400 py-3 text-center border border-dashed border-default-200 rounded-xl">
                      No workspace components connected.
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt/Summary input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-default-600 uppercase tracking-wider">Slide Objective Prompt</label>
                <Textarea 
                  classNames={{ inputWrapper: "!bg-default-100 dark:!bg-default-50/5 hover:!bg-default-200/50" }} 
                  minRows={2.5}
                  placeholder="Explain goals (e.g. outline cloud run targets, show secure proxy splits)..."
                  size="sm"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* AI Inference Model Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-default-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-primary" /> Multi-Model Inference Engine
                </label>
                <select
                  className="w-full bg-default-100 dark:bg-[#1C1C24] hover:bg-default-200/50 outline-none text-xs rounded-xl p-2.5 border border-default-200/50 text-default-800"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                >
                  {AI_MODELS.map(model => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  ))}
                </select>
              </div>

              {/* Strategist & Visual Theme Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-default-600 uppercase tracking-wider">Structure</label>
                  <select
                    className="w-full bg-default-100 dark:bg-[#1C1C24] hover:bg-default-200/50 outline-none text-xs rounded-xl p-2.5 border border-default-200/50 text-default-800"
                    value={strategistMode}
                    onChange={(e) => setStrategistMode(e.target.value)}
                  >
                    {STRATEGIST_MODES.map(mode => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-default-600 uppercase tracking-wider">Visual Style</label>
                  <select
                    className="w-full bg-default-100 dark:bg-[#1C1C24] hover:bg-default-200/50 outline-none text-xs rounded-xl p-2.5 border border-default-200/50 text-default-800"
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                  >
                    {VISUAL_THEMES.map(theme => (
                      <option key={theme.value} value={theme.value}>{theme.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-4 border-t border-default-100 flex flex-col gap-3">
              <Button
                className="w-full font-bold bg-primary text-white"
                isLoading={isGenerating}
                radius="xl"
                size="md"
                startContent={!isGenerating && <Sparkles size={14} />}
                onClick={handleGenerate}
              >
                {generatedSlides.length > 0 ? "Regenerate Slides" : "Generate Slide Deck"}
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive Deck Viewer Preview */}
          <div className="flex-grow bg-white dark:bg-[#111116] border border-default-200/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            
            {/* Header / Top Control */}
            <div className="flex items-center justify-between pb-4 border-b border-default-100 w-full mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Slide Deck Preview</span>
                {generatedSlides.length > 0 && (
                  <Chip color="success" size="sm" variant="flat">
                    AI Compiled
                  </Chip>
                )}
              </div>
              {generatedSlides.length > 0 && (
                <Button
                  className="bg-black text-white dark:bg-white dark:text-black font-semibold text-xs h-8 px-4 rounded-xl"
                  isLoading={isDownloading}
                  size="sm"
                  startContent={!isDownloading && <Download size={12} />}
                  onClick={handleDownload}
                >
                  Download PowerPoint
                </Button>
              )}
            </div>

            {/* Slide Body Canvas (16:9 Standard aspect ratio box) */}
            <div className="flex-grow flex items-center justify-center w-full">
              {generatedSlides.length > 0 ? (
                <div 
                  className={`w-full max-w-3xl aspect-[16/9] border rounded-2xl shadow-lg relative p-8 flex flex-col justify-between transition-all duration-300 ${
                    isDark 
                      ? "bg-[#0c0c11] border-[#1e1e2d] text-white" 
                      : "bg-[#f8fafc] border-[#e2e8f0] text-slate-900"
                  }`}
                >
                  {/* Decorative side accent bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" 
                    style={{ 
                      backgroundColor: visualStyle === "Corporate Grid" 
                        ? "#2563EB" 
                        : visualStyle === "Sovereign Minimalist" 
                          ? "#111827" 
                          : "#8B5CF6" 
                    }}
                  />

                  {/* Render Slides layouts dynamically */}
                  {currentSlide.type === "title" && (
                    <div className="my-auto pl-6">
                      <span 
                        className="text-xs font-bold uppercase tracking-wider block mb-2"
                        style={{ 
                          color: visualStyle === "Corporate Grid" 
                            ? "#2563EB" 
                            : visualStyle === "Sovereign Minimalist" 
                              ? "#111827" 
                              : "#8B5CF6" 
                        }}
                      >
                        {currentSlide.tag || strategistMode.toUpperCase()}
                      </span>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-3 max-w-xl leading-tight">
                        {currentSlide.title || title}
                      </h2>
                      <p className="text-md opacity-70 max-w-lg">
                        {currentSlide.subtitle || subtitle}
                      </p>
                    </div>
                  )}

                  {currentSlide.type === "two-column" && (
                    <div className="h-full flex flex-col justify-between pl-4">
                      <h3 className="text-lg font-bold tracking-tight mb-3">{currentSlide.title}</h3>
                      <div className="grid grid-cols-3 gap-4 flex-grow items-stretch">
                        {/* Col 1 */}
                        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${isDark ? "bg-[#13131c]/50 border-white/5" : "bg-white border-slate-200"}`}>
                          <div>
                            <h4 
                              className="text-xs font-bold mb-1.5"
                              style={{ 
                                color: visualStyle === "Corporate Grid" 
                                  ? "#2563EB" 
                                  : visualStyle === "Sovereign Minimalist" 
                                    ? "#111827" 
                                    : "#8B5CF6" 
                              }}
                            >
                              {currentSlide.col1Title}
                            </h4>
                            <p className="text-[11px] opacity-80 leading-relaxed">{currentSlide.col1Content}</p>
                          </div>
                        </div>
                        {/* Col 2 */}
                        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${isDark ? "bg-[#13131c]/50 border-white/5" : "bg-white border-slate-200"}`}>
                          <div>
                            <h4 
                              className="text-xs font-bold mb-1.5"
                              style={{ 
                                color: visualStyle === "Corporate Grid" 
                                  ? "#2563EB" 
                                  : visualStyle === "Sovereign Minimalist" 
                                    ? "#111827" 
                                    : "#8B5CF6" 
                              }}
                            >
                              {currentSlide.col2Title}
                            </h4>
                            <ul className="list-disc pl-3.5 text-[10px] space-y-1.5 opacity-80 leading-relaxed">
                              {Array.isArray(currentSlide.col2Content) && currentSlide.col2Content.map((bullet, i) => (
                                <li key={i}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {/* Col 3: Generated Imagen Visual Asset */}
                        <div className={`rounded-xl border relative overflow-hidden flex items-center justify-center ${isDark ? "bg-[#13131c]/50 border-white/5" : "bg-white border-slate-200"}`}>
                          {currentSlide.image ? (
                            <img 
                              alt="Generated Visual Asset" 
                              className="absolute inset-0 w-full h-full object-cover" 
                              src={currentSlide.image} 
                            />
                          ) : (
                            <span className="text-[10px] text-default-400">Loading visual...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide.type === "context-list" && (
                    <div className="h-full flex flex-col justify-between pl-4">
                      <h3 className="text-lg font-bold tracking-tight mb-3">{currentSlide.title}</h3>
                      <div className="grid grid-cols-3 gap-4 flex-grow items-stretch">
                        <div className="col-span-2 space-y-2.5">
                          {currentSlide.items?.map((item, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center justify-between p-3 rounded-xl border relative overflow-hidden ${
                                isDark ? "bg-[#13131c]/50 border-white/5" : "bg-white border-slate-200"
                              }`}
                            >
                              <div 
                                className="absolute left-0 top-0 bottom-0 w-1" 
                                style={{ 
                                  backgroundColor: visualStyle === "Corporate Grid" 
                                    ? "#2563EB" 
                                    : visualStyle === "Sovereign Minimalist" 
                                      ? "#111827" 
                                      : "#8B5CF6" 
                                }}
                              />
                              <span className="text-[11px] font-bold pl-3 truncate max-w-[280px]">{item}</span>
                              <span className="text-[8px] opacity-60 font-semibold uppercase tracking-wider shrink-0">Active Source</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Col 3: Generated Imagen Visual Asset */}
                        <div className={`rounded-xl border relative overflow-hidden flex items-center justify-center ${isDark ? "bg-[#13131c]/50 border-white/5" : "bg-white border-slate-200"}`}>
                          {currentSlide.image ? (
                            <img 
                              alt="Generated Visual Asset" 
                              className="absolute inset-0 w-full h-full object-cover" 
                              src={currentSlide.image} 
                            />
                          ) : (
                            <span className="text-[10px] text-default-400">Loading visual...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide.type === "bullets-card" && (
                    <div className="h-full flex flex-col justify-between pl-4">
                      <h3 className="text-lg font-bold tracking-tight mb-3">{currentSlide.title}</h3>
                      <div className="grid grid-cols-3 gap-4 flex-grow items-stretch">
                        <div className={`col-span-2 p-4 rounded-xl border ${isDark ? "bg-[#13131c]/50 border-white/5" : "bg-white border-slate-200"}`}>
                          <ul className="list-disc pl-4 text-[11px] space-y-2.5 opacity-90 leading-relaxed">
                            {currentSlide.bullets?.map((bullet, i) => (
                              <li key={i}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Col 3: Generated Imagen Visual Asset */}
                        <div className={`rounded-xl border relative overflow-hidden flex items-center justify-center ${isDark ? "bg-[#13131c]/50 border-white/5" : "bg-white border-slate-200"}`}>
                          {currentSlide.image ? (
                            <img 
                              alt="Generated Visual Asset" 
                              className="absolute inset-0 w-full h-full object-cover" 
                              src={currentSlide.image} 
                            />
                          ) : (
                            <span className="text-[10px] text-default-400">Loading visual...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide.type === "roadmap-steps" && (
                    <div className="h-full flex flex-col justify-between pl-4">
                      <h3 className="text-lg font-bold tracking-tight mb-3">{currentSlide.title}</h3>
                      <div className="grid grid-cols-4 gap-3 flex-grow items-stretch">
                        {currentSlide.steps?.map((step, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-xl border flex flex-col justify-between ${
                              isDark ? "bg-[#13131c]/50 border-white/5" : "bg-white border-slate-200"
                            }`}
                          >
                            <span 
                              className="text-xl font-bold font-mono tracking-tight"
                              style={{ 
                                color: visualStyle === "Corporate Grid" 
                                  ? "#2563EB" 
                                  : visualStyle === "Sovereign Minimalist" 
                                    ? "#111827" 
                                    : "#8B5CF6" 
                              }}
                            >
                              {step.num}
                            </span>
                            <div>
                              <h4 className="text-[10px] font-bold mb-0.5 truncate">{step.title}</h4>
                              <p className="text-[9px] opacity-70 leading-relaxed">{step.desc}</p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Col 4: Generated Imagen Visual Asset */}
                        <div className={`rounded-xl border relative overflow-hidden flex items-center justify-center ${isDark ? "bg-[#13131c]/50 border-white/5" : "bg-white border-slate-200"}`}>
                          {currentSlide.image ? (
                            <img 
                              alt="Generated Visual Asset" 
                              className="absolute inset-0 w-full h-full object-cover" 
                              src={currentSlide.image} 
                            />
                          ) : (
                            <span className="text-[10px] text-default-400">Loading visual...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Brand signature on all slides */}
                  <div className="flex items-center justify-between text-[9px] opacity-50 pl-6 border-t border-white/5 pt-2">
                    <span>Alti Code Studio Presentation Swarm</span>
                    <span>Slide {activeSlideIndex + 1} of {generatedSlides.length}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 select-none">
                  <div className="w-16 h-16 bg-default-100 dark:bg-default-50/5 border border-default-200/50 rounded-2xl flex items-center justify-center mb-4">
                    <Presentation className="w-8 h-8 text-default-400" />
                  </div>
                  <h3 className="text-md font-bold text-default-800 mb-1">Awaiting Generation</h3>
                  <p className="text-xs text-default-500 max-w-sm">
                    Configure your slide options in the left panel and click "Generate Slide Deck" to compile the presentations with Google Vertex AI text and Imagen visuals.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Slider Nav controls */}
            {generatedSlides.length > 0 && (
              <div className="flex items-center justify-between pt-6 border-t border-default-100 w-full mt-6">
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    className="bg-default-100 dark:bg-[#1E1E24] hover:bg-default-200"
                    isDisabled={activeSlideIndex === 0}
                    radius="lg"
                    size="sm"
                    variant="flat"
                    onClick={handlePrev}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    className="bg-default-100 dark:bg-[#1E1E24] hover:bg-default-200"
                    isDisabled={activeSlideIndex === generatedSlides.length - 1}
                    radius="lg"
                    size="sm"
                    variant="flat"
                    onClick={handleNext}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
                <span className="text-xs text-default-500 font-medium">
                  Slide {activeSlideIndex + 1} of {generatedSlides.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
