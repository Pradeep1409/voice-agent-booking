"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Phone, PhoneOff, Loader2, User, Bot, Wifi, WifiOff, Activity, Volume2 } from "lucide-react";
import { AudioRecorder, playAudio } from "@/lib/audio";
import AudioVisualizer from "./AudioVisualizer";
import ConversationPanel from "./ConversationPanel";

export default function VoiceAgent() {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [status, setStatus] = useState("System Idle");
    const [volumeLevel, setVolumeLevel] = useState(0);

    const isCallActiveRef = useRef(false);
    const socketRef = useRef<WebSocket | null>(null);
    const recorderRef = useRef<AudioRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isPlayingRef = useRef(false);
    const isProcessingRef = useRef(false);

    // Sync refs with state
    useEffect(() => { isCallActiveRef.current = isCallActive; }, [isCallActive]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);

    const handleStartSpeaking = useCallback(async () => {
        if (isRecording) return;
        setIsRecording(true);
        setStatus("Voice Detected");
        if (!recorderRef.current) recorderRef.current = new AudioRecorder();
        await recorderRef.current.start();
    }, [isRecording]);

    const handleStopSpeaking = useCallback(async () => {
        setIsRecording(false);
        setStatus("Synthesizing Context...");
        setIsProcessing(true);
        if (recorderRef.current) {
            const audioBlob = await recorderRef.current.stop();
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(audioBlob);
            }
        }
    }, []);

    const startVAD = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            let isSpeakingLocal = false;
            const silenceThreshold = 10; // Lowered for better sensitivity
            const silenceDuration = 1200;

            const checkAudio = () => {
                if (!analyserRef.current || !isCallActiveRef.current) return;

                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((p, c) => p + c, 0) / bufferLength;
                setVolumeLevel(volume);

                if (volume > silenceThreshold) {
                    if (!isSpeakingLocal && !isPlayingRef.current && !isProcessingRef.current) {
                        isSpeakingLocal = true;
                        handleStartSpeaking();
                    }
                    if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current);
                        silenceTimeoutRef.current = null;
                    }
                } else {
                    if (isSpeakingLocal && !silenceTimeoutRef.current) {
                        silenceTimeoutRef.current = setTimeout(() => {
                            isSpeakingLocal = false;
                            handleStopSpeaking();
                            silenceTimeoutRef.current = null;
                        }, silenceDuration);
                    }
                }
                requestAnimationFrame(checkAudio);
            };

            checkAudio();
        } catch (err) {
            console.error("VAD initialization failed:", err);
            setStatus("Microphone Access Denied");
        }
    };

    const stopVAD = () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        setVolumeLevel(0);
    };

    const startCall = () => {
        setStatus("Establishing Secure Connection...");
        const socket = new WebSocket("ws://localhost:8000/ws/voice");
        socket.binaryType = "arraybuffer"; // Ensure we get ArrayBuffers, not Blobs

        socket.onopen = () => {
            setStatus("Secure Channel Open");
            setIsCallActive(true);
            startVAD();
        };

        socket.onmessage = async (event) => {
            if (typeof event.data === "string") {
                const data = JSON.parse(event.data);
                if (data.agent_reply) {
                    setMessages(prev => [
                        ...prev,
                        ...(data.user_text ? [{ role: "user", content: data.user_text }] : []),
                        { role: "assistant", content: data.agent_reply }
                    ]);
                    setIsProcessing(false);
                }
            } else {
                // event.data is an ArrayBuffer
                console.log(`-> [Audio] Received buffer: ${event.data.byteLength} bytes`);
                if (event.data.byteLength < 100) {
                    console.warn("-> [Audio] Packet too small, skipping.");
                    return;
                }

                setIsPlaying(true);
                setStatus("Agent Speaking...");
                const audioBlob = new Blob([event.data], { type: "audio/wav" });
                try {
                    await playAudio(audioBlob);
                } catch (err) {
                    console.error("-> [Audio] Playback failed:", err);
                } finally {
                    setIsPlaying(false);
                    setStatus("Listening...");
                }
            }
        };

        socket.onclose = () => endCall();
        socket.onerror = () => {
            setStatus("Network Error");
            endCall();
        };

        socketRef.current = socket;
    };

    const endCall = () => {
        setIsCallActive(false);
        setStatus("Session Ended");
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        stopVAD();
        setIsPlaying(false);
        setIsRecording(false);
        setIsProcessing(false);
    };

    return (
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-10 items-stretch h-[650px]">

            {/* Left Panel: The Call Interface */}
            <div className="flex-[1.2] glass-card rounded-[48px] p-10 flex flex-col items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -z-10 rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-3xl -z-10 rounded-full" />

                <div className="w-full flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100/50 shadow-sm">
                        {isCallActive ? <Activity size={16} className="text-blue-500 animate-pulse" /> : <WifiOff size={16} className="text-slate-300" />}
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 leading-none">{status}</span>
                    </div>
                    {isCallActive && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100/50">
                                <Volume2 size={12} className="text-emerald-500" />
                                <div className="w-12 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-75"
                                        style={{ width: `${Math.min(100, volumeLevel * 3)}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-[10px] font-black tracking-[0.2em] text-emerald-500">LIVE</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full flex flex-col items-center justify-center gap-16">
                    <div className="flex items-center justify-around w-full relative h-48">
                        <div className="flex flex-col items-center gap-6 group">
                            <div className={`relative w-28 h-28 rounded-[38%] flex items-center justify-center border-2 transition-all duration-700 ${isPlaying ? 'border-blue-500 rotate-[360deg] shadow-[0_0_60px_rgba(59,130,246,0.2)] bg-white' : 'border-slate-100 bg-slate-50/50'}`}>
                                <Bot size={44} className={isPlaying ? 'text-blue-500' : 'text-slate-300'} />
                                {isPlaying && <div className="absolute inset-0 rounded-[38%] border border-blue-200 animate-ping opacity-20" />}
                            </div>
                            <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${isPlaying ? 'text-blue-500' : 'text-slate-400'}`}>Agent Svara</span>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 opacity-80 scale-125">
                            <AudioVisualizer isRecording={isRecording} isPlaying={isPlaying} />
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${isRecording ? 'border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.2)] bg-white scale-110' : 'border-slate-100 bg-slate-50/50'}`}>
                                <User size={36} className={isRecording ? 'text-rose-500' : 'text-slate-300'} />
                                {isRecording && <div className="absolute inset-0 rounded-full border border-rose-200 animate-ping opacity-20" />}
                            </div>
                            <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${isRecording ? 'text-rose-500' : 'text-slate-400'}`}>Guest</span>
                        </div>
                    </div>

                    <div className="h-4">
                        {(isRecording || isPlaying || isProcessing) && (
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                                <div className="flex gap-1">
                                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" />
                                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                    {isRecording ? "Capturing..." : isPlaying ? "Streaming..." : "Analyzing..."}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 w-full flex justify-center">
                    {!isCallActive ? (
                        <button onClick={startCall} className="group relative flex flex-col items-center gap-6 transition-all">
                            <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl group-hover:bg-blue-600 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                                <Phone size={40} className="text-white" />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[12px] uppercase font-black tracking-[0.4em] text-slate-900">Initiate Dialogue</span>
                                <span className="text-[9px] text-slate-400 font-bold tracking-[0.1em]">Secure Voice Channel</span>
                            </div>
                        </button>
                    ) : (
                        <button onClick={endCall} className="group relative flex flex-col items-center gap-6 transition-all">
                            <div className="w-20 h-20 bg-rose-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl group-hover:bg-rose-600 group-hover:scale-110 transition-all duration-500">
                                <PhoneOff size={32} className="text-white" />
                            </div>
                            <span className="text-[11px] uppercase font-black tracking-[0.4em] text-rose-500">Terminate</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Right Panel: Transcription History */}
            <div className="flex-1 glass rounded-[48px] p-10 flex flex-col border-white/40 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 flex items-center gap-3">
                        <Activity size={14} className="text-slate-400" />
                        Log Interface
                    </h3>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ConversationPanel messages={messages} />
                </div>
            </div>
        </div>
    );
}


