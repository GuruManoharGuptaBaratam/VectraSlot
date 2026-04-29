import { AdminBooking, BookingStatus } from "../../../api/admin";

interface AdminBookingsProps {
    bookings: AdminBooking[];
    bookingDrafts: Record<number, { status: BookingStatus; startTime: string; endTime: string }>;
    setBookingDrafts: (updater: (prev: any) => any) => void;
    onUpdate: (booking: AdminBooking, draft: any) => Promise<void>;
    onDelete: (booking: AdminBooking) => Promise<void>;
    formatDateTime: (iso: string) => string;
    toLocalInputValue: (iso: string) => string;
}

const STATUS_OPTIONS: BookingStatus[] = ["ACTIVE", "COMPLETED", "CANCELLED"];

export default function AdminBookings({
    bookings,
    bookingDrafts,
    setBookingDrafts,
    onUpdate,
    onDelete,
    formatDateTime,
    toLocalInputValue
}: AdminBookingsProps) {
    return (
        <section className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 backdrop-blur hover-premium">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="font-heading text-xl">Booking Logs</h2>
                    <p className="mt-1 text-sm text-slate-300">Live feed of all reservations. Manage time windows and trip completion.</p>
                </div>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">
                    {bookings.length} total records
                </span>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {bookings.map((booking) => {
                    const draft = bookingDrafts[booking.id] ?? {
                        status: booking.status,
                        startTime: toLocalInputValue(booking.startTime),
                        endTime: booking.endTime ? toLocalInputValue(booking.endTime) : ""
                    };

                    return (
                        <article key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover-premium">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Record #{booking.id}</p>
                                    <h3 className="mt-1 text-lg font-semibold text-white">
                                        User {booking.user.name} • Slot {booking.slot.slotNumber}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-300">Created {formatDateTime(booking.createdAt)}</p>
                                </div>
                                <select
                                    value={draft.status}
                                    onChange={(event) =>
                                        setBookingDrafts((current: any) => ({
                                            ...current,
                                            [booking.id]: { ...draft, status: event.target.value as BookingStatus }
                                        }))
                                    }
                                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white outline-none focus:border-mint/60"
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status} className="bg-slate-900">
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Start Time</span>
                                    <input
                                        type="datetime-local"
                                        value={draft.startTime}
                                        onChange={(event) =>
                                            setBookingDrafts((current: any) => ({
                                                ...current,
                                                [booking.id]: { ...draft, startTime: event.target.value }
                                            }))
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-mint/60"
                                    />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.16em] text-slate-400">End Time</span>
                                    <input
                                        type="datetime-local"
                                        value={draft.endTime}
                                        onChange={(event) =>
                                            setBookingDrafts((current: any) => ({
                                                ...current,
                                                [booking.id]: { ...draft, endTime: event.target.value }
                                            }))
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-mint/60"
                                    />
                                </label>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    onClick={() => onUpdate(booking, draft)}
                                    className="rounded-lg bg-ocean px-3 py-2 text-xs font-semibold text-white"
                                >
                                    Sync Changes
                                </button>
                                <button
                                    onClick={() => onDelete(booking)}
                                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
                                >
                                    Force Delete
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
