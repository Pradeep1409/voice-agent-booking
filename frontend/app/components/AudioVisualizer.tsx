"use client";

import React from "react";

interface AudioVisualizerProps {
    isRecording: boolean;
    isPlaying: boolean;
}

export default function AudioVisualizer({ isRecording, isPlaying }: AudioVisualizerProps) {
    return (
        <div className="flex items-center justify-center gap-[4px] h-20 w-full px-2">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-500 ${isRecording
                        ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        : isPlaying
                            ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            : "bg-slate-200/40 h-1.5"
                        }`}
                    style={{
                        height: isRecording || isPlaying
                            ? `${15 + (Math.sin((i / 20) * Math.PI) * 60)}%`
                            : "6px",
                        animation: isRecording || isPlaying ? `waveform-premium 1s cubic-bezier(0.4, 0, 0.2, 1) infinite` : 'none',
                        animationDelay: `${i * 0.08}s`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes waveform-premium {
                    0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
                    50% { transform: scaleY(1.2); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

