import { AdminStats as StatsData } from "../../../api/admin";

interface AdminStatsProps {
    stats: StatsData | null;
}

export default function AdminStats({ stats }: AdminStatsProps) {
    if (!stats) return null;

    const cards = [
        { label: "Total Users", value: stats.totalUsers },
        { label: "Total Slots", value: stats.totalSlots },
        { label: "Active Bookings", value: stats.activeBookings },
        { label: "Available Slots", value: stats.availableSlots },
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <article key={card.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur hover-premium">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                    <p className="mt-3 text-3xl font-bold">{card.value}</p>
                </article>
            ))}
        </section>
    );
}
