import { useCallback, useEffect, useMemo, useState } from "react";
import {
    BookingRecord,
    BookingStatus,
    cancelBooking,
    completeBooking,
    createBooking,
    getMyBookings,
    updateBooking,
} from "../api/bookings";
import {
    getAvailableSlots,
    getPublicSlots,
    SlotRecord,
    SlotStatus,
} from "../api/slots";
import { AuthUser } from "../types/auth";
import { getAuthToken } from "../utils/authStorage";
import { formatDateTime, toLocalDateTimeInput } from "../utils/dates";

type SlotFilter = "ALL" | SlotStatus;

interface UserDashboardPageProps {
    user: AuthUser;
    onLogout: () => void;
}

const slotTone: Record<SlotStatus, string> = {
    AVAILABLE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    RESERVED: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    OCCUPIED: "border-rose-400/30 bg-rose-400/10 text-rose-100",
};

const bookingTone: Record<BookingStatus, string> = {
    ACTIVE: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
    COMPLETED: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    CANCELLED: "border-slate-300/20 bg-slate-300/10 text-slate-200",
};

const initialsFromName = (name: string) => {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
};

const emptyBookingForm = () => ({
    slotId: "",
    startTime: "",
    endTime: "",
});

function UserDashboardPage({ user, onLogout }: UserDashboardPageProps) {
    const token = useMemo(() => getAuthToken(), []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [slots, setSlots] = useState<SlotRecord[]>([]);
    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [availabilitySlots, setAvailabilitySlots] = useState<SlotRecord[]>([]);
    const [availabilityChecked, setAvailabilityChecked] = useState(false);
    const [slotFilter, setSlotFilter] = useState<SlotFilter>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [bookingForm, setBookingForm] = useState(emptyBookingForm());
    const [bookingDrafts, setBookingDrafts] = useState<Record<number, { startTime: string; endTime: string }>>({});

    const loadData = useCallback(async () => {
        if (!token) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const [slotData, bookingData] = await Promise.all([getPublicSlots(), getMyBookings(token)]);

            setSlots(slotData);
            setBookings(bookingData);
            setBookingDrafts(
                Object.fromEntries(
                    bookingData.map((booking) => [
                        booking.id,
                        {
                            startTime: toLocalDateTimeInput(booking.startTime),
                            endTime: booking.endTime ? toLocalDateTimeInput(booking.endTime) : "",
                        },
                    ]),
                ),
            );

            setBookingForm((current) =>
                current.slotId || slotData.length === 0
                    ? current
                    : { ...current, slotId: String(slotData[0].id) },
            );
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load your dashboard");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        void loadData();

        // Auto-refresh data every 5 seconds for real-time updates
        const intervalId = setInterval(() => {
            void loadData();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [loadData]);

    const slotMap = useMemo(() => new Map(slots.map((slot) => [slot.id, slot])), [slots]);

    const filteredSlots = useMemo(() => {
        return slots.filter((slot) => {
            const matchesFilter = slotFilter === "ALL" || slot.status === slotFilter;
            const matchesSearch =
                !searchTerm.trim() ||
                slot.slotNumber.toLowerCase().includes(searchTerm.trim().toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [searchTerm, slotFilter, slots]);

    const activeBookings = useMemo(
        () => bookings.filter((booking) => booking.status === "ACTIVE"),
        [bookings],
    );

    const upcomingBooking = useMemo(() => {
        return [...bookings]
            .filter((booking) => booking.status === "ACTIVE")
            .sort((left, right) => Date.parse(left.startTime) - Date.parse(right.startTime))[0];
    }, [bookings]);

    const bookingStats = useMemo(() => {
        return slots.reduce(
            (accumulator, slot) => {
                accumulator.total += 1;
                accumulator[slot.status.toLowerCase() as "available" | "reserved" | "occupied"] += 1;
                return accumulator;
            },
            { total: 0, available: 0, reserved: 0, occupied: 0 },
        );
    }, [slots]);

    const availableForSelectedWindow = availabilityChecked ? availabilitySlots : filteredSlots;

    const initials = initialsFromName(user.name) || "VS";
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const refreshAfterMutation = async (message: string) => {
        setNotice(message);

        // Clear success notice after 3 seconds
        const timeoutId = setTimeout(() => setNotice(""), 3000);

        await loadData();
        setAvailabilitySlots([]);
        setAvailabilityChecked(false);

        return () => clearTimeout(timeoutId);
    };

    const onBookSlot = async () => {
        if (!token) {
            return;
        }

        const slotId = Number(bookingForm.slotId);
        const startTime = bookingForm.startTime;
        const endTime = bookingForm.endTime;

        if (!slotId || !startTime || !endTime) {
            setError("Select a slot and both time fields before booking.");
            // Auto-clear error after 5 seconds
            const errorTimeoutId = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(errorTimeoutId);
        }

        try {
            setLoading(true);
            setError("");
            setNotice("");

            await createBooking(token, {
                slotId,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
            });

            setBookingForm((current) => ({ ...current, startTime: "", endTime: "" }));
            await refreshAfterMutation("Your booking was created successfully.");
        } catch (bookError) {
            const errorMessage = bookError instanceof Error ? bookError.message : "Could not create booking";
            setError(errorMessage);
            // Auto-clear error after 5 seconds
            const errorTimeoutId = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(errorTimeoutId);
        } finally {
            setLoading(false);
        }
    };

    const checkAvailability = async () => {
        if (!bookingForm.startTime || !bookingForm.endTime) {
            setError("Choose a start and end time to check availability.");
            // Auto-clear error after 5 seconds
            const errorTimeoutId = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(errorTimeoutId);
        }

        try {
            setLoading(true);
            setError("");
            setNotice("");

            const slotsForWindow = await getAvailableSlots(
                new Date(bookingForm.startTime).toISOString(),
                new Date(bookingForm.endTime).toISOString(),
            );

            setAvailabilitySlots(slotsForWindow);
            setAvailabilityChecked(true);

            if (slotsForWindow.length > 0) {
                setBookingForm((current) => ({ ...current, slotId: String(slotsForWindow[0].id) }));
            }
        } catch (checkError) {
            const errorMessage = checkError instanceof Error ? checkError.message : "Failed to check availability";
            setError(errorMessage);
            // Auto-clear error after 5 seconds
            const errorTimeoutId = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(errorTimeoutId);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        onLogout();
    };

    if (!token) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#07131f] px-4 text-white">
                <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
                    <h1 className="font-heading text-2xl">Session expired</h1>
                    <p className="mt-2 text-sm text-slate-300">Please sign in again to continue booking slots.</p>
                    <button
                        onClick={handleLogout}
                        className="mt-5 rounded-full bg-flare px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                        Back to Login
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="user-grid relative min-h-screen overflow-hidden bg-[#07131f] px-4 py-6 font-body text-white sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,196,182,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,107,53,0.16),transparent_28%)]" />

            <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
                <header className="rounded-3xl border border-white/10 bg-[#0d1f33]/90 p-5 shadow-card backdrop-blur sm:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-mint to-flare text-lg font-bold text-white shadow-lg shadow-black/20">
                                {initials}
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-mint/80">Driver workspace</p>
                                <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Welcome back, {user.name}</h1>
                                <p className="mt-1 text-sm text-slate-300">{today}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
                                {user.email}
                            </span>
                            <button
                                onClick={() => void loadData()}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={handleLogout}
                                className="rounded-full bg-flare px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        ["Total slots", bookingStats.total.toString(), "All slots currently in the system"],
                        ["Available", bookingStats.available.toString(), "Ready for immediate booking"],
                        ["Active bookings", activeBookings.length.toString(), "Live reservations under your account"],
                        [
                            "Next booking",
                            upcomingBooking ? slotMap.get(upcomingBooking.slotId)?.slotNumber ?? `Slot #${upcomingBooking.slotId}` : "None",
                            upcomingBooking ? formatDateTime(upcomingBooking.startTime) : "No active reservation yet",
                        ],
                    ].map(([title, value, hint]) => (
                        <article key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
                            <p className="mt-3 text-3xl font-bold">{value}</p>
                            <p className="mt-2 text-sm text-slate-300">{hint}</p>
                        </article>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <article className="rounded-3xl border border-white/10 bg-[#0d1f33]/90 p-5 backdrop-blur sm:p-6">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-mint/80">Plan a booking</p>
                                <h2 className="mt-2 font-heading text-2xl font-semibold">Check availability and reserve a slot</h2>
                                <p className="mt-1 text-sm text-slate-300">Start with a time window, preview available slots, then book the one you want.</p>
                            </div>

                            <button
                                onClick={() => void checkAvailability()}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Check availability
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-200">Start time</span>
                                <input
                                    type="datetime-local"
                                    value={bookingForm.startTime}
                                    onChange={(event) => setBookingForm((current) => ({ ...current, startTime: event.target.value }))}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-mint/60"
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-200">End time</span>
                                <input
                                    type="datetime-local"
                                    value={bookingForm.endTime}
                                    onChange={(event) => setBookingForm((current) => ({ ...current, endTime: event.target.value }))}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-mint/60"
                                />
                            </label>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-200">Choose slot</span>
                                <select
                                    value={bookingForm.slotId}
                                    onChange={(event) => setBookingForm((current) => ({ ...current, slotId: event.target.value }))}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-mint/60"
                                >
                                    {availableForSelectedWindow.map((slot) => (
                                        <option key={slot.id} value={slot.id} className="bg-slate-900">
                                            {slot.slotNumber} - {slot.status}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="space-y-2 rounded-2xl border border-mint/20 bg-mint/10 p-4 text-sm text-slate-100">
                                <p className="font-semibold text-white">Selected window</p>
                                <p>{bookingForm.startTime ? formatDateTime(bookingForm.startTime) : "Pick a start time"}</p>
                                <p>{bookingForm.endTime ? formatDateTime(bookingForm.endTime) : "Pick an end time"}</p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                onClick={() => void onBookSlot()}
                                className="rounded-full bg-mint px-5 py-3 text-sm font-semibold text-[#05211d] transition hover:bg-[#57d7cb]"
                            >
                                Reserve slot
                            </button>
                            <button
                                onClick={() => {
                                    setBookingForm(emptyBookingForm());
                                    setAvailabilitySlots([]);
                                    setAvailabilityChecked(false);
                                    setError("");
                                    setNotice("");
                                }}
                                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Clear form
                            </button>
                        </div>
                    </article>

                    <article className="rounded-3xl border border-white/10 bg-[#0d1f33]/90 p-5 backdrop-blur sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-flare/80">Spotlight</p>
                                <h2 className="mt-2 font-heading text-2xl font-semibold">Quick slot browser</h2>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                {filteredSlots.length} results
                            </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search slot number"
                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-mint/60"
                            />

                            <select
                                value={slotFilter}
                                onChange={(event) => setSlotFilter(event.target.value as SlotFilter)}
                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-mint/60"
                            >
                                <option value="ALL" className="bg-slate-900">
                                    All statuses
                                </option>
                                <option value="AVAILABLE" className="bg-slate-900">
                                    AVAILABLE
                                </option>
                                <option value="RESERVED" className="bg-slate-900">
                                    RESERVED
                                </option>
                                <option value="OCCUPIED" className="bg-slate-900">
                                    OCCUPIED
                                </option>
                            </select>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                            {filteredSlots.slice(0, 8).map((slot) => (
                                <article key={slot.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Slot</p>
                                            <p className="mt-1 text-lg font-semibold text-white">{slot.slotNumber}</p>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${slotTone[slot.status]}`}>
                                            {slot.status}
                                        </span>
                                    </div>

                                    <p className="mt-3 text-sm text-slate-300">
                                        {slot.status === "AVAILABLE"
                                            ? "Ready to reserve."
                                            : slot.status === "RESERVED"
                                                ? "Reserved for another active booking."
                                                : "Currently occupied."}
                                    </p>

                                    <button
                                        onClick={() => setBookingForm((current) => ({ ...current, slotId: String(slot.id) }))}
                                        className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                                    >
                                        Use this slot
                                    </button>
                                </article>
                            ))}

                            {availabilityChecked && availabilitySlots.length === 0 && (
                                <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">
                                    No slots are available for the selected time window.
                                </div>
                            )}

                            {!availabilityChecked && filteredSlots.length === 0 && (
                                <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">
                                    No slots match your current search.
                                </div>
                            )}
                        </div>
                    </article>
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#0d1f33]/90 p-5 backdrop-blur sm:p-6">
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
                                startTime: toLocalDateTimeInput(booking.startTime),
                                endTime: booking.endTime ? toLocalDateTimeInput(booking.endTime) : "",
                            };

                            const slotNumber = slotMap.get(booking.slotId)?.slotNumber ?? `Slot #${booking.slotId}`;

                            return (
                                <article key={booking.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
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
                                            disabled={booking.status !== "ACTIVE"}
                                            onClick={async () => {
                                                if (!token) {
                                                    return;
                                                }

                                                try {
                                                    setError("");
                                                    setNotice("");
                                                    setLoading(true);

                                                    await updateBooking(token, booking.id, {
                                                        startTime: new Date(draft.startTime).toISOString(),
                                                        endTime: new Date(draft.endTime).toISOString(),
                                                    });

                                                    await refreshAfterMutation("Booking times updated.");
                                                } catch (updateError) {
                                                    setError(updateError instanceof Error ? updateError.message : "Failed to update booking");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Update times
                                        </button>

                                        <button
                                            disabled={booking.status !== "ACTIVE"}
                                            onClick={async () => {
                                                if (!token) {
                                                    return;
                                                }

                                                const confirmed = window.confirm(`Mark booking #${booking.id} as complete?`);
                                                if (!confirmed) {
                                                    return;
                                                }

                                                try {
                                                    setError("");
                                                    setNotice("");
                                                    setLoading(true);

                                                    await completeBooking(token, booking.id);
                                                    await refreshAfterMutation("Booking marked as complete.");
                                                } catch (completeError) {
                                                    setError(completeError instanceof Error ? completeError.message : "Failed to complete booking");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Complete
                                        </button>

                                        <button
                                            disabled={booking.status === "CANCELLED"}
                                            onClick={async () => {
                                                if (!token) {
                                                    return;
                                                }

                                                const confirmed = window.confirm(`Cancel booking #${booking.id}?`);
                                                if (!confirmed) {
                                                    return;
                                                }

                                                try {
                                                    setError("");
                                                    setNotice("");
                                                    setLoading(true);

                                                    await cancelBooking(token, booking.id);
                                                    await refreshAfterMutation("Booking cancelled.");
                                                } catch (cancelError) {
                                                    setError(cancelError instanceof Error ? cancelError.message : "Failed to cancel booking");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
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

                {notice && (
                    <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                        {notice}
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                    <p className="font-semibold text-white">What happens next</p>
                    <p className="mt-1">
                        Use the booking planner to preview available slots for a time window, then reserve the slot that fits best.
                        Active reservations can be updated, completed, or cancelled from the same screen.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default UserDashboardPage;