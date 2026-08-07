"use client";

import React, { useRef, useState } from "react";
import { Sparkles, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { FadeIn, GradientBlob } from "@/components/animations/Animations";

export function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <div className="relative rounded-[2.5rem] overflow-hidden border border-pink-200/80 shadow-2xl shadow-purple-500/10 group">
            {/* HTML5 Lifestyle Video */}
            <div className="relative aspect-[16/9] w-full bg-purple-950">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1600"
              >
                <source
                  src="https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-enjoying-a-party-41566-large.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>

              {/* Soft Pink/Purple Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/70 via-purple-950/20 to-transparent pointer-events-none" />

              {/* Floating Content Card */}
              <div className="absolute bottom-8 left-8 right-8 sm:right-auto sm:max-w-md p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/60 shadow-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Authentic Connections
                </div>
                <h3 className="text-2xl font-extrabold text-purple-950 mb-2">
                  Experience Genuine Moments
                </h3>
                <p className="text-xs sm:text-sm text-purple-900/70 leading-relaxed mb-4">
                  From shared laughter at cafes to quiet movie nights and weekend retreats, see how our verified companions elevate everyday life.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md hover:bg-pink-600 transition-colors"
                    aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-white/80 border border-pink-200 text-purple-950 flex items-center justify-center shadow-sm hover:bg-pink-50 transition-colors"
                    aria-label={isMuted ? "Unmute Video" : "Mute Video"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
