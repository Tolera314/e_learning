"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, Trash2, CheckCircle2, AlertCircle, Loader2, MousePointer2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface SignatureUploadProps {
  onSuccess?: (url: string) => void;
  initialUrl?: string;
  role?: "ADMIN" | "INSTRUCTOR" | "CEO"; // Allow CEO as per usage
}

export default function SignatureUpload({ onSuccess, initialUrl, role }: SignatureUploadProps) {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(initialUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (initialUrl) setSignatureUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#10b981"; // emerald-500
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [mode]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = async () => {
    if (mode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Check if canvas is empty (basic check)
      const ctx = canvas.getContext("2d");
      const blank = document.createElement("canvas");
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        toast.error("Please draw your signature first");
        return;
      }

      setIsUploading(true);
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const res = await api.post("/signatures/upload", { 
          signatureUrl: dataUrl,
          role: role || "INSTRUCTOR" // Default to instructor if not specified
        });
        setSignatureUrl(res.data.signatureUrl);
        toast.success("Signature saved successfully");
        onSuccess?.(res.data.signatureUrl);
      } catch (error) {
        toast.error("Failed to save signature");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await api.post("/signatures/upload", { 
          signatureUrl: base64,
          role: role || "INSTRUCTOR"
        });
        setSignatureUrl(res.data.signatureUrl);
        toast.success("Signature uploaded successfully");
        onSuccess?.(res.data.signatureUrl);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Digital Signature</h3>
          <p className="text-sm text-gray-500 mt-1">Used for student certificates and official docs.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
           <button 
             onClick={() => setMode("draw")}
             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "draw" ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
           >
             Draw
           </button>
           <button 
             onClick={() => setMode("upload")}
             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "upload" ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
           >
             Upload
           </button>
        </div>
      </div>

      <div className="relative aspect-[3/1] bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {signatureUrl ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full h-full flex items-center justify-center p-8 text-center"
            >
              <img src={signatureUrl} alt="Signature" className="max-h-full object-contain filter dark:invert" />
              <button 
                onClick={() => setSignatureUrl(null)}
                className="absolute top-4 right-4 p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                title="Remove Signature"
              >
                <Trash2 size={16} />
              </button>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-emerald-600">
                <CheckCircle2 size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Signature</span>
              </div>
            </motion.div>
          ) : mode === "draw" ? (
            <motion.div 
              key="draw"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full cursor-crosshair relative"
            >
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                 <button onClick={clearCanvas} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                 <button 
                   onClick={saveSignature} 
                   disabled={isUploading}
                   className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                 >
                   {isUploading ? <Loader2 size={14} className="animate-spin" /> : <MousePointer2 size={14} />}
                   Save Signature
                 </button>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 dark:text-gray-600 text-sm">
                   Sign here with your mouse or touch
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="upload"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                 <Upload size={32} />
              </div>
              <div>
                 <p className="text-sm font-bold text-gray-900 dark:text-white">Upload transparent PNG</p>
                 <p className="text-xs text-gray-400 mt-1">Recommended size: 600x200px (Max 2MB)</p>
              </div>
              <label className="px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all shadow-xl">
                 Browse Files
                 <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={handleFileUpload} />
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex gap-3 border border-blue-100 dark:border-blue-900/30">
         <AlertCircle className="text-blue-600 shrink-0" size={18} />
         <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
           <span className="font-bold block mb-1">Expert Tip:</span>
           For professional certificates, please ensure your signature has a transparent background. You can use online background removal tools if needed.
         </div>
      </div>
    </div>
  );
}
