"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { recordActivity } from "@/lib/api";

interface VideoPlayerProps {
  id: string; // Add ID prop for activity tracking
  src: string;
  onProgress: (percent: number, time: number) => void;
  onComplete: () => void;
  initialTime?: number;
}

export default function CourseVideoPlayer({ id, src, onProgress, onComplete, initialTime = 0 }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastLoggedTime = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState("1080p");
  const [showSettings, setShowSettings] = useState(false);

  const controlsTimeout = useRef<any>(null);

  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const progress = (currentTime / videoRef.current.duration) * 100;

      setProgress(progress);
      onProgress(progress, currentTime);

      // Throttled logging (every 30 seconds or significant progress)
      if (currentTime - lastLoggedTime.current > 30) {
        recordActivity('WATCH_VIDEO', undefined, {
          lessonId: id,
          progress: Math.floor(progress),
          timestamp: currentTime
        });
        lastLoggedTime.current = currentTime;
      }

      if (progress >= 98) onComplete();
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden group shadow-2xl ring-8 ring-white dark:ring-white/5"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        playsInline
      />

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-8"
          >
            {/* TOP BAR */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">HD {quality}</div>
                <div className="text-white">
                  <p className="text-xs font-bold opacity-60">Currently Watching</p>
                  <p className="text-sm font-black">1.1 Basic Concepts of Calculus</p>
                </div>
              </div>
              <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all">
                <Bookmark size={20} />
              </button>
            </div>

            {/* CENTER PLAY BUTTON */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-24 h-24 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40"
              >
                {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
              </motion.button>
            </div>

            {/* BOTTOM CONTROLS */}
            <div className="space-y-6">
              {/* PROGRESS BAR */}
              <div className="group/progress relative h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute top-0 left-0 h-full w-full opacity-0 hover:opacity-100 transition-opacity flex items-center">
                  {/* Seek preview logic could go here */}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-white">
                    <button onClick={() => skip(-10)} className="hover:text-emerald-400 transition-colors"><RotateCcw size={22} /></button>
                    <button onClick={togglePlay} className="hover:text-emerald-400 transition-colors">{isPlaying ? <Pause size={28} /> : <Play size={28} />}</button>
                    <button onClick={() => skip(10)} className="hover:text-emerald-400 transition-colors"><RotateCw size={22} /></button>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <button onClick={() => setIsMuted(!isMuted)} className="hover:text-emerald-400 transition-colors">
                      {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                    </button>
                    <input
                      type="range"
                      min="0" max="1" step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20 accent-emerald-500"
                    />
                  </div>
                  <span className="text-white text-xs font-bold font-mono">
                    {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(videoRef.current?.duration || 0)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {[0.5, 1, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          if (videoRef.current) videoRef.current.playbackRate = speed;
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${playbackSpeed === speed ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                  <button className="p-2 text-white hover:text-emerald-400 transition-colors"><Settings size={20} /></button>
                  <button className="p-2 text-white hover:text-emerald-400 transition-colors"><Maximize size={20} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
