import { ReactNode } from "react";

interface AuthShellProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

function AuthShell({ title, subtitle, children }: AuthShellProps) {
    return (
        <main className="relative min-h-screen overflow-hidden bg-sand px-4 py-10 font-body sm:px-6 lg:px-8">
            <div className="absolute -top-32 -left-28 h-72 w-72 rounded-full bg-flare/30 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-ocean/20 blur-3xl" />

            <section className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
                <div className="space-y-5">
                    <p className="inline-flex items-center rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ocean shadow-sm">
                        VectraSlot Access Portal
                    </p>
                    <h1 className="font-heading text-4xl font-bold leading-tight text-ink sm:text-5xl">
                        Park Smarter. Enter Faster.
                    </h1>
                    <p className="max-w-lg text-base text-slate-700 sm:text-lg">
                        Authenticate with the same secure backend powering your role-based parking operations.
                    </p>
                </div>

                <div className="w-full rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur md:p-8">
                    <h2 className="font-heading text-3xl font-semibold text-ink">{title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
                    <div className="mt-6">{children}</div>
                </div>
            </section>
        </main>
    );
}

export default AuthShell;
