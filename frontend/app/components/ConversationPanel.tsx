"use client";

import React from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ConversationPanelProps {
    messages: Message[];
}

export default function ConversationPanel({ messages }: ConversationPanelProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div
            ref={scrollRef}
            className="w-full space-y-6 max-h-full overflow-y-auto pr-4 custom-scrollbar scroll-smooth"
        >
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-16 h-16 rounded-[30%] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-slate-200 animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.3em]">Transmission Buffer</p>
                        <p className="text-slate-300 text-[9px] font-bold tracking-[0.1em]">ENCRYPTED & SECURE</p>
                    </div>
                </div>
            )}
            {messages.map((msg, i) => (
                <div
                    key={i}
                    className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"
                        } animate-in fade-in slide-in-from-bottom-4 duration-500`}
                >
                    <div className="flex items-center gap-2 px-1">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">
                            {msg.role === "user" ? "Client" : "System Agent"}
                        </span>
                        <div className={`w-1 h-1 rounded-full ${msg.role === 'user' ? 'bg-blue-400' : 'bg-slate-300'}`} />
                    </div>
                    <div
                        className={`max-w-[90%] rounded-3xl p-5 text-sm leading-relaxed shadow-xl border ${msg.role === "user"
                            ? "bg-slate-900 border-slate-800 text-slate-100 rounded-tr-none shadow-slate-200/50"
                            : "bg-white border-slate-100 text-slate-700 rounded-tl-none shadow-slate-200/50"
                            }`}
                    >
                        <p className="font-medium tracking-tight">
                            {msg.content}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

