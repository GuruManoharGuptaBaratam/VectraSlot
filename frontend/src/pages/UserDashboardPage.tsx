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
    getPublicSlots,
    SlotRecord,
    SlotStatus,
} from "../api/slots";
import { AuthUser } from "../types/auth";
import { getAuthToken } from "../utils/authStorage";
import { toLocalDateTimeInput } from "../utils/dates";

// Sub-components
import UserStats from "../features/dashboard/user/UserStats";
import BookingPlanner from "../features/dashboard/user/BookingPlanner";
import SlotBrowser from "../features/dashboard/user/SlotBrowser";
import MyReservations from "../features/dashboard/user/MyReservations";

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
        if (!token) return;
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
            setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const refreshAfterMutation = async (message: string) => {
        await loadData();
        setNotice(message);
        setTimeout(() => setNotice(""), 3000);
    };

    const checkAvailability = async () => {
        if (!token) return;
        if (!bookingForm.startTime || !bookingForm.endTime) {
            setError("Please select both start and end times to check availability.");
            return;
        }
        setLoading(true);
        setError("");
        setAvailabilityChecked(false);
        try {
            const available = slots.filter(s => s.status === 'AVAILABLE'); 
            // Mocking availability logic for now as per original
            setAvailabilitySlots(available);
            setAvailabilityChecked(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to check availability");
        } finally {
            setLoading(false);
        }
    };

    const onBookSlot = async () => {
        if (!token) return;
        if (!bookingForm.slotId || !bookingForm.startTime || !bookingForm.endTime) {
            setError("Incomplete booking information.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await createBooking(token, {
                slotId: Number(bookingForm.slotId),
                startTime: new Date(bookingForm.startTime).toISOString(),
                endTime: new Date(bookingForm.endTime).toISOString(),
            });
            setBookingForm(emptyBookingForm());
            setAvailabilitySlots([]);
            setAvailabilityChecked(false);
            await refreshAfterMutation("Booking created successfully.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    const onUpdateTimes = async (bookingId: number, draft: { startTime: string; endTime: string }) => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            await updateBooking(token, bookingId, {
                startTime: new Date(draft.startTime).toISOString(),
                endTime: new Date(draft.endTime).toISOString(),
            });
            await refreshAfterMutation("Booking times updated.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const onComplete = async (bookingId: number) => {
        if (!token) return;
        if (!window.confirm("Mark as complete?")) return;
        setLoading(true);
        try {
            await completeBooking(token, bookingId);
            await refreshAfterMutation("Booking completed.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Completion failed");
        } finally {
            setLoading(false);
        }
    };

    const onCancel = async (bookingId: number) => {
        if (!token) return;
        if (!window.confirm("Cancel booking?")) return;
        setLoading(true);
        try {
            await cancelBooking(token, bookingId);
            await refreshAfterMutation("Booking cancelled.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Cancellation failed");
        } finally {
            setLoading(false);
        }
    };

    const slotMap = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
    const filteredSlots = useMemo(() => {
        const source = availabilityChecked ? availabilitySlots : slots;
        return source.filter((slot) => {
            const matchesSearch = slot.slotNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = slotFilter === "ALL" || slot.status === slotFilter;
            return matchesSearch && matchesFilter;
        });
    }, [slots, availabilitySlots, availabilityChecked, searchTerm, slotFilter]);

    const activeBookings = useMemo(() => bookings.filter((b) => b.status === "ACTIVE"), [bookings]);
    const upcomingBooking = useMemo(() => {
        return [...activeBookings].sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))[0];
    }, [activeBookings]);

    const bookingStats = useMemo(() => ({
        total: slots.length,
        available: slots.filter((s) => s.status === "AVAILABLE").length,
    }), [slots]);

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#0a1622] font-body text-white user-grid">
            <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 dashboard-appear">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-xl font-bold text-[#05211d] shadow-lg shadow-mint/20">
                            {initialsFromName(user.name)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-heading">
                                Hello, <span className="text-mint">{user.name.split(" ")[0]}</span>
                            </h1>
                            <p className="text-slate-400">Welcome to your driver command center.</p>
                        </div>
                    </div>

                    <button
                        onClick={onLogout}
                        className="rounded-full bg-flare px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 shadow-lg shadow-flare/20"
                    >
                        Log out
                    </button>
                </header>

                <UserStats 
                    bookingStats={bookingStats} 
                    activeBookings={activeBookings} 
                    upcomingBooking={upcomingBooking} 
                    slotMap={slotMap} 
                />

                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <BookingPlanner 
                        bookingForm={bookingForm}
                        setBookingForm={setBookingForm}
                        availableForSelectedWindow={slots.filter(s => s.status === 'AVAILABLE')}
                        checkAvailability={checkAvailability}
                        onBookSlot={onBookSlot}
                        onClearForm={() => {
                            setBookingForm(emptyBookingForm());
                            setAvailabilitySlots([]);
                            setAvailabilityChecked(false);
                            setError("");
                            setNotice("");
                        }}
                    />

                    <SlotBrowser 
                        filteredSlots={filteredSlots}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        slotFilter={slotFilter}
                        setSlotFilter={setSlotFilter}
                        slotTone={slotTone}
                        setBookingForm={setBookingForm}
                        availabilityChecked={availabilityChecked}
                        availabilitySlots={availabilitySlots}
                    />
                </div>

                <MyReservations 
                    bookings={bookings}
                    bookingDrafts={bookingDrafts}
                    setBookingDrafts={setBookingDrafts}
                    slotMap={slotMap}
                    bookingTone={bookingTone}
                    onUpdateTimes={onUpdateTimes}
                    onComplete={onComplete}
                    onCancel={onCancel}
                    loading={loading}
                />

                {notice && (
                    <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 animate-rise-fade">
                        {notice}
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100 animate-rise-fade">
                        {error}
                    </div>
                )}

                <footer className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                    <p className="font-semibold text-white">System Status: Active</p>
                    <p className="mt-1">
                        Use the booking planner to preview available slots. Active reservations can be managed from the dashboard.
                    </p>
                </footer>
            </section>
        </main>
    );
}

export default UserDashboardPage;