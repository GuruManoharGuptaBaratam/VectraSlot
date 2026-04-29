import { formatDateTime } from "../../../utils/dates";
import { SlotRecord } from "../../../api/slots";
import { BookingRecord } from "../../../api/bookings";

interface UserStatsProps {
    bookingStats: {
        total: number;
        available: number;
    };
    activeBookings: BookingRecord[];
    upcomingBooking: BookingRecord | undefined;
    slotMap: Map<number, SlotRecord>;
}

export default function UserStats({ 
    bookingStats, 
    activeBookings, 
    upcomingBooking, 
    slotMap 
}: UserStatsProps) {
    const stats = [
        ["Total slots", bookingStats.total.toString(), "All slots currently in the system"],
        ["Available", bookingStats.available.toString(), "Ready for immediate booking"],
        ["Active bookings", activeBookings.length.toString(), "Live reservations under your account"],
        [
            "Next booking",
            upcomingBooking ? slotMap.get(upcomingBooking.slotId)?.slotNumber ?? `Slot #${upcomingBooking.slotId}` : "None",
            upcomingBooking ? formatDateTime(upcomingBooking.startTime) : "No active reservation yet",
        ],
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([title, value, hint]) => (
                <article key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur hover-premium">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
                    <p className="mt-3 text-3xl font-bold">{value}</p>
                    <p className="mt-2 text-sm text-slate-300">{hint}</p>
                </article>
            ))}
        </section>
    );
}
