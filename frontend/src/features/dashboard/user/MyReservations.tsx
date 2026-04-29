import { BookingRecord, BookingStatus } from "../../../api/bookings";
import { SlotRecord } from "../../../api/slots";
import { formatDateTime } from "../../../utils/dates";

interface MyReservationsProps {
    bookings: BookingRecord[];
    bookingDrafts: Record<number, { startTime: string; endTime: string }>;
    setBookingDrafts: (updater: (prev: any) => any) => void;
    slotMap: Map<number, SlotRecord>;
    bookingTone: Record<BookingStatus, string>;
    onUpdateTimes: (bookingId: number, draft: { startTime: string; endTime: string }) => Promise<void>;
    onComplete: (bookingId: number) => Promise<void>;
    onCancel: (bookingId: number) => Promise<void>;
    loading: boolean;
}

export default function MyReservations({
    bookings,
    bookingDrafts,
    setBookingDrafts,
    slotMap,
    bookingTone,
    onUpdateTimes,
    onComplete,
    onCancel,
    loading
}: MyReservationsProps) {
    return (
        <section className="rounded-3xl border border-white/10 bg-[#0d1f33]/90 p-5 backdrop-blur sm:p-6 hover-premium">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-mint/80">Your reservations</p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold">Manage upcoming and active bookings</h2>
                    <p className="mt-1 text-sm text-slate-300">Update time windows, complete trips, or cancel when plans change.</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {bookings.length} total bookings
                </span>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {bookings.map((booking) => {
                    const draft = bookingDrafts[booking.id] ?? {
                        startTime: booking.startTime,
                        endTime: booking.endTime || "",
                    };

                    const slotNumber = slotMap.get(booking.slotId)?.slotNumber ?? `Slot #${booking.slotId}`;

                    return (
                        <article key={booking.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 hover-premium">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{slotNumber}</p>
                                    <h3 className="mt-1 text-xl font-semibold text-white">Booking #{booking.id}</h3>
                                    <p className="mt-1 text-sm text-slate-300">Created {formatDateTime(booking.createdAt)}</p>
                                </div>

                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${bookingTone[booking.status]}`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Start time</span>
                                    <input
                                        type="datetime-local"
                                        value={draft.startTime}
                                        onChange={(event) =>
                                            setBookingDrafts((current) => ({
                                                ...current,
                                                [booking.id]: { ...draft, startTime: event.target.value },
                                            }))
                                        }
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-mint/60"
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.16em] text-slate-400">End time</span>
                                    <input
                                        type="datetime-local"
                                        value={draft.endTime}
                                        onChange={(event) =>
                                            setBookingDrafts((current) => ({
                                                ...current,
                                                [booking.id]: { ...draft, endTime: event.target.value },
                                            }))
                                        }
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-mint/60"
                                    />
                                </label>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    disabled={booking.status !== "ACTIVE" || loading}
                                    onClick={() => onUpdateTimes(booking.id, draft)}
                                    className="rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Update times
                                </button>

                                <button
                                    disabled={booking.status !== "ACTIVE" || loading}
                                    onClick={() => onComplete(booking.id)}
                                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Complete
                                </button>

                                <button
                                    disabled={booking.status === "CANCELLED" || loading}
                                    onClick={() => onCancel(booking.id)}
                                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </article>
                    );
                })}

                {bookings.length === 0 && !loading && (
                    <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300">
                        You have no bookings yet. Create your first reservation above.
                    </div>
                )}
            </div>
        </section>
    );
}
