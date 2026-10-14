import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownView } from '../common/MarkdownView';
import {
  Eye,
  UploadCloud,
  Clock,
  CheckCircle2,
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
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Claude Style Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Vision Studio</h2>
          <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
            Multimodal perceptual examination of images, diagrams, architectural schematics, and UI mocks.
          </p>
        </div>
      </div>

      {/* Upload & Prompt Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Upload Dropzone */}
        <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 flex flex-col items-center justify-center min-h-[260px] text-center relative overflow-hidden shadow-xs">
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
                className="max-h-60 max-w-full object-contain rounded-xl"
              />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-[#181716]/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full border-2 border-dashed border-[#ded7cb] dark:border-[#383530] rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-[#c25e2e] dark:hover:border-[#d97757] transition-colors"
            >
              <UploadCloud className="w-10 h-10 text-[#8c857b] mb-2" />
              <div className="font-serif text-xs font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                Click or drag image here
              </div>
              <div className="text-[11px] text-[#8c857b] mt-1 font-mono">PNG, JPG, WebP up to 20MB</div>
            </div>
          )}
        </div>

        {/* Prompt configuration */}
        <form
          onSubmit={runVisionAnalysis}
          className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 flex flex-col justify-between space-y-4 shadow-xs"
        >
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a8377] dark:text-[#8f887f]">
              Visual Inspection Objective
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should the vision models inspect in this image?"
              className="w-full text-xs rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] p-3 text-[#1f1e1d] dark:text-[#ede8e1] focus:outline-hidden focus:ring-2 focus:ring-[#c25e2e]/30 focus:border-[#c25e2e]"
            />
            <div className="text-[11px] text-[#8c857b]">
              Eligible Multimodal Models: {visionModels.map((m) => m.name).join(', ')}
            </div>
          </div>

          <button
            type="submit"
            disabled={!imageUrl || isAnalyzing}
            className="w-full py-2.5 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] disabled:opacity-40 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
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
              className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">{res.modelName}</span>
                </div>
                <span className="font-mono text-[#8c857b] text-[11px]">{res.latencyMs}ms</span>
              </div>
              <MarkdownView content={res.text} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
