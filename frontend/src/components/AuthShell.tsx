import { ReactNode } from "react";

interface AuthShellProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-[#f8f5ef] font-body relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ocean/5 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-flare/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            
            <div className="w-full max-w-md bg-white/80 rounded-[2.5rem] shadow-2xl p-8 border border-white/60 backdrop-blur-xl animate-rise-fade relative z-10 hover-premium">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-ink tracking-tight font-heading leading-tight">{title}</h1>
                    <p className="text-slate-500 mt-3 text-sm leading-relaxed">{subtitle}</p>
                </div>
                {children}
            </div>
        </main>
    );
}
