import { Link } from "react-router-dom";

const features = [
    {
        title: "User-first booking flow",
        text: "Find available slots, book a time window, and manage your reservations without losing context.",
    },
    {
        title: "Admin operations board",
        text: "Review users, slots, bookings, and live stats in one place with clear actions for each record.",
    },
    {
        title: "Role-aware access",
        text: "User and admin experiences stay separate so each screen only shows the controls that matter.",
    },
];

function LandingPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(46,196,182,0.2),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(255,107,53,0.18),_transparent_32%),linear-gradient(180deg,_#f2e9dc_0%,_#fcfaf6_38%,_#eef6f7_100%)] px-4 py-6 font-body text-ink sm:px-6 lg:px-8">
            <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)]" />

            <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col justify-center gap-10">
                <header className="flex items-center justify-between gap-4 rounded-full border border-white/60 bg-white/70 px-4 py-3 shadow-card backdrop-blur animate-rise-fade">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ocean">VectraSlot</p>
                        <p className="text-sm text-slate-600">Parking operations made straightforward.</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Link className="rounded-full px-4 py-2 text-ocean transition hover:bg-ocean/10" to="/login">
                            Login
                        </Link>
                        <Link className="rounded-full bg-ink px-4 py-2 text-white transition hover:bg-slate-800" to="/signup">
                            Create account
                        </Link>
                    </div>
                </header>

                <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div className="space-y-6 animate-rise-fade">
                        <span className="inline-flex w-fit items-center rounded-full border border-ocean/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-ocean shadow-sm">
                            Smart parking portal
                        </span>

                        <h1 className="max-w-3xl font-heading text-5xl font-bold leading-[0.98] tracking-[-0.03em] text-ink sm:text-6xl lg:text-7xl">
                            One frontend for drivers and the operations team.
                        </h1>

                        <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                            VectraSlot now includes a clean user experience for booking, browsing slots,
                            and managing reservations, plus a separate admin console for day-to-day
                            operations.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/signup"
                                className="rounded-full bg-flare px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-flare/25 transition hover:-translate-y-1 hover:bg-orange-600 hover:shadow-flare/40"
                            >
                                Get started
                            </Link>
                            <Link
                                to="/login"
                                className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-ink transition hover:border-ocean/30 hover:bg-white hover:-translate-y-1"
                            >
                                I already have an account
                            </Link>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {[
                                ["Fast auth", "Login and signup with role-aware sessions."],
                                ["Live data", "Slots, bookings, and admin records stay in sync."],
                                ["Clear actions", "Every screen keeps the primary action visible."],
                            ].map(([title, text], idx) => (
                                <article 
                                    key={title} 
                                    className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur hover-premium"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <p className="font-semibold text-ink">{title}</p>
                                    <p className="mt-1 text-sm text-slate-600">{text}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="relative animate-rise-fade" style={{ animationDelay: '200ms' }}>
                        <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-mint/25 blur-3xl animate-pulse-slow" />
                        <div className="absolute bottom-10 right-4 h-36 w-36 rounded-full bg-flare/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

                        <article className="relative rounded-[2.5rem] border border-white/20 bg-[#0b1b29] p-8 text-white shadow-2xl backdrop-blur-md hover-premium-dark overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-mint/10 blur-[60px] group-hover:bg-mint/20 transition-all duration-500" />
                            
                            <div className="relative z-10 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-mint font-bold">Live workspace</p>
                                    <h2 className="mt-2 font-heading text-3xl font-semibold leading-tight">Role aware by design</h2>
                                </div>
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-mint font-medium">
                                    Secure session
                                </span>
                            </div>

                            <div className="mt-8 grid gap-4 relative z-10">
                                {features.map((feature, index) => (
                                    <div
                                        key={feature.title}
                                        className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-white/20"
                                        style={{ animationDelay: `${index * 80}ms` }}
                                    >
                                        <p className="font-semibold text-white flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
                                            {feature.title}
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-mint/20 bg-mint/5 p-6 sm:grid-cols-2 relative z-10">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-[0.2em] text-mint/80 font-bold">User path</p>
                                    <p className="text-sm text-slate-300">Book a slot, review your reservations, manage your time window.</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-[0.2em] text-flare/80 font-bold">Admin path</p>
                                    <p className="text-sm text-slate-300">Manage users, slots, bookings, and system metrics.</p>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>
            </section>
        </main>
    );
}

export default LandingPage;