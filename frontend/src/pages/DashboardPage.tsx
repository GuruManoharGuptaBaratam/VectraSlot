import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AdminBooking,
    AdminSlot,
    AdminStats as StatsData,
    AdminUser,
    BookingStatus,
    createAdminSlot,
    deleteAdminBooking,
    deleteAdminSlot,
    deleteAdminUser,
    getAdminBookings,
    getAdminSlots,
    getAdminStats,
    getAdminUsers,
    SlotStatus,
    updateAdminBooking,
    updateAdminSlot,
    updateAdminUserRole
} from "../api/admin";
import { AuthUser, Role } from "../types/auth";
import { clearAuthSession, getAuthToken, getStoredUser } from "../utils/authStorage";
import UserDashboardPage from "./UserDashboardPage";

// Sub-components
import AdminStats from "../features/dashboard/admin/AdminStats";
import AdminUsers from "../features/dashboard/admin/AdminUsers";
import AdminSlots from "../features/dashboard/admin/AdminSlots";
import AdminBookings from "../features/dashboard/admin/AdminBookings";

type UserDrafts = Record<number, Role>;
type SlotDrafts = Record<number, { slotNumber: string; status: SlotStatus }>;
type BookingDrafts = Record<number, { status: BookingStatus; startTime: string; endTime: string }>;

const toLocalInputValue = (value: string) => {
    const date = new Date(value);
    const offsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const sortByDateDesc = (left: string, right: string) => Date.parse(right) - Date.parse(left);

function formatDateTime(isoString: string) {
    return new Date(isoString).toLocaleString();
}

function DashboardPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [stats, setStats] = useState<StatsData | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [slots, setSlots] = useState<AdminSlot[]>([]);
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [userDrafts, setUserDrafts] = useState<UserDrafts>({});
    const [slotDrafts, setSlotDrafts] = useState<SlotDrafts>({});
    const [bookingDrafts, setBookingDrafts] = useState<BookingDrafts>({});
    const [newSlotNumber, setNewSlotNumber] = useState("");
    const [creatingSlot, setCreatingSlot] = useState(false);

    const user = useMemo<AuthUser | null>(() => getStoredUser(), []);
    const token = useMemo(() => getAuthToken(), []);

    const refreshDashboard = useCallback(async () => {
        if (!token || user?.role !== "ADMIN") return;
        setLoading(true);
        setError("");
        try {
            const [statsRes, usersRes, slotsRes, bookingsRes] = await Promise.all([
                getAdminStats(token),
                getAdminUsers(token),
                getAdminSlots(token),
                getAdminBookings(token)
            ]);
            setStats(statsRes);
            setUsers(usersRes);
            setSlots(slotsRes);
            setBookings(bookingsRes);
            setUserDrafts(Object.fromEntries(usersRes.map((entry) => [entry.id, entry.role])));
            setSlotDrafts(Object.fromEntries(slotsRes.map((entry) => [entry.id, { slotNumber: entry.slotNumber, status: entry.status }])));
            setBookingDrafts(Object.fromEntries(bookingsRes.map((entry) => [entry.id, { status: entry.status, startTime: toLocalInputValue(entry.startTime), endTime: entry.endTime ? toLocalInputValue(entry.endTime) : "" }])));
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load admin dashboard");
        } finally {
            setLoading(false);
        }
    }, [token, user?.role]);

    useEffect(() => {
        if (user?.role === "ADMIN") void refreshDashboard();
    }, [user?.role, refreshDashboard]);

    const onLogout = () => {
        clearAuthSession();
        navigate("/login", { replace: true });
    };

    const runAction = async (action: () => Promise<void>, successMessage: string) => {
        setLoading(true);
        setError("");
        setNotice("");
        try {
            await action();
            await refreshDashboard();
            setNotice(successMessage);
            setTimeout(() => setNotice(""), 3000);
        } catch (actionError) {
            setError(actionError instanceof Error ? actionError.message : "Action failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async (event: FormEvent) => {
        event.preventDefault();
        if (!token || !newSlotNumber.trim()) return;
        setCreatingSlot(true);
        await runAction(async () => {
            await createAdminSlot(token, newSlotNumber.trim());
            setNewSlotNumber("");
        }, "New slot created.");
        setCreatingSlot(false);
    };

    const sortedUsers = useMemo(() => [...users].sort((a, b) => a.id - b.id), [users]);
    const sortedSlots = useMemo(() => [...slots].sort((a, b) => a.id - b.id), [slots]);
    const sortedBookings = useMemo(() => [...bookings].sort((a, b) => sortByDateDesc(a.createdAt, b.createdAt)), [bookings]);

    const slotBreakdown = useMemo(() => ({
        available: slots.filter((s) => s.status === "AVAILABLE").length,
        reserved: slots.filter((s) => s.status === "RESERVED").length,
        occupied: slots.filter((s) => s.status === "OCCUPIED").length
    }), [slots]);

    if (!user) return null;
    if (user.role === "USER") return <UserDashboardPage user={user} onLogout={onLogout} />;

    const loadStateLabel = loading ? "Synchronizing with cloud..." : "All systems nominal.";

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#0a1622] font-body text-white admin-grid">
            <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 dashboard-appear">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-flare text-xl font-bold text-white shadow-lg shadow-flare/20">
                            {user.name[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-heading">
                                Admin <span className="text-flare">Console</span>
                            </h1>
                            <p className="text-slate-400">Manage infrastructure, access, and operations.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <p className="text-right text-xs leading-tight text-slate-400">Signed in as {user.email}</p>
                            <button onClick={refreshDashboard} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Refresh</button>
                            <button onClick={onLogout} className="rounded-xl bg-flare px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500">Log out</button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                    <p>{loadStateLabel}</p>
                    <p>Admin secret is checked by your backend environment.</p>
                </div>

                {notice && <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{notice}</div>}
                {error && <div className="rounded-2xl border border-red-300/40 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>}

                <AdminStats stats={stats} />

                <AdminSlots 
                    slots={sortedSlots}
                    slotDrafts={slotDrafts}
                    setSlotDrafts={setSlotDrafts}
                    onUpdate={async (slot, draft) => {
                        if (!token) return;
                        await runAction(async () => {
                            await updateAdminSlot(token, slot.id, { slotNumber: draft.slotNumber.trim(), status: draft.status });
                        }, `Slot ${slot.slotNumber} updated.`);
                    }}
                    onDelete={async (slot) => {
                        if (!token) return;
                        if (!window.confirm(`Delete slot ${slot.slotNumber}?`)) return;
                        await runAction(async () => { await deleteAdminSlot(token, slot.id); }, `Slot ${slot.slotNumber} deleted.`);
                    }}
                    newSlotNumber={newSlotNumber}
                    setNewSlotNumber={setNewSlotNumber}
                    handleCreateSlot={handleCreateSlot}
                    creatingSlot={creatingSlot}
                    loading={loading}
                    slotBreakdown={slotBreakdown}
                    totalSlots={slots.length}
                />

                <AdminUsers 
                    users={sortedUsers}
                    userDrafts={userDrafts}
                    setUserDrafts={setUserDrafts}
                    onUpdate={async (u, draftRole) => {
                        if (!token) return;
                        await runAction(async () => { await updateAdminUserRole(token, u.id, draftRole); }, `User ${u.name} role updated.`);
                    }}
                    onDelete={async (u) => {
                        if (!token) return;
                        if (!window.confirm(`Remove user ${u.name}?`)) return;
                        await runAction(async () => { await deleteAdminUser(token, u.id); }, `User ${u.name} removed.`);
                    }}
                    currentUserId={user.id}
                />

                <AdminBookings 
                    bookings={sortedBookings}
                    bookingDrafts={bookingDrafts}
                    setBookingDrafts={setBookingDrafts}
                    onUpdate={async (b, draft) => {
                        if (!token) return;
                        await runAction(async () => {
                            await updateAdminBooking(token, b.id, {
                                status: draft.status,
                                startTime: new Date(draft.startTime).toISOString(),
                                endTime: draft.endTime ? new Date(draft.endTime).toISOString() : null
                            });
                        }, `Booking #${b.id} updated.`);
                    }}
                    onDelete={async (b) => {
                        if (!token) return;
                        if (!window.confirm(`Delete booking #${b.id}?`)) return;
                        await runAction(async () => { await deleteAdminBooking(token, b.id); }, `Booking #${b.id} removed.`);
                    }}
                    formatDateTime={formatDateTime}
                    toLocalInputValue={toLocalInputValue}
                />
            </section>
        </main>
    );
}

export default DashboardPage;
