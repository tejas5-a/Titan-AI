import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownView } from '../common/MarkdownView';
import {
  Eye,
  UploadCloud,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export function VisionStudio() {
  const { models } = useApp();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Perform deep multi-layer visual analysis: identify structural components, architectural layout, OCR text, and potential defects.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visionModels = models.filter((m) => m.capabilities.vision);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const runVisionAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || isAnalyzing) return;

    setIsAnalyzing(true);
    setResults([]);

    try {
      // Run analysis with Gemini 3.8 Flash (first-class multimodal)
      const res = await fetch('/api/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gemini',
          model: 'gemini-3.8-flash',
          prompt,
          imageBase64: imageUrl,
        }),
      });

      const data = await res.json();
      setResults([
        {
          modelName: 'Gemini 3.8 Flash (Multimodal)',
          provider: 'gemini',
          text: data.text,
          latencyMs: data.latencyMs,
          usage: data.usage,
        },
      ]);
    } catch (e: any) {
      alert('Vision analysis failed: ' + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vision Studio</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multimodal perceptual examination of images, diagrams, architectural schematics, and UI mocks.
          </p>
        </div>
      </div>

      {/* Upload & Prompt Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Dropzone */}
        <div className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center justify-center min-h-[260px] text-center relative overflow-hidden">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          {imageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="max-h-60 max-w-full object-contain rounded-lg"
              />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-amber-500/60 transition-colors"
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click or drag image here
              </div>
              <div className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP up to 20MB</div>
            </div>
          )}
        </div>

        {/* Prompt configuration */}
        <form
          onSubmit={runVisionAnalysis}
          className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Visual Inspection Objective
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should the vision models inspect in this image?"
              className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
            <div className="text-[11px] text-slate-400">
              Eligible Multimodal Models: {visionModels.map((m) => m.name).join(', ')}
            </div>
          </div>

          <button
            type="submit"
            disabled={!imageUrl || isAnalyzing}
            className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Analyzing Image Pixels...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Execute Multimodal Analysis</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((res, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{res.modelName}</span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">{res.latencyMs}ms</span>
              </div>
              <MarkdownView content={res.text} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
