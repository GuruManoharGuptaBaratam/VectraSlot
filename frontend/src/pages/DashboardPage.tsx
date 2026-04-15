import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AdminBooking,
    AdminSlot,
    AdminStats,
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

type UserDrafts = Record<number, Role>;
type SlotDrafts = Record<number, { slotNumber: string; status: SlotStatus }>;
type BookingDrafts = Record<number, { status: BookingStatus; startTime: string; endTime: string }>;

const STATUS_OPTIONS: BookingStatus[] = ["ACTIVE", "COMPLETED", "CANCELLED"];
const SLOT_STATUS_OPTIONS: SlotStatus[] = ["AVAILABLE", "RESERVED", "OCCUPIED"];

const toLocalInputValue = (value: string) => {
    const date = new Date(value);
    const offsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const sortByDateDesc = (left: string, right: string) => Date.parse(right) - Date.parse(left);

function DashboardPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [slots, setSlots] = useState<AdminSlot[]>([]);
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [userDrafts, setUserDrafts] = useState<UserDrafts>({});
    const [slotDrafts, setSlotDrafts] = useState<SlotDrafts>({});
    const [bookingDrafts, setBookingDrafts] = useState<BookingDrafts>({});
    const [newSlotNumber, setNewSlotNumber] = useState("");
    const [creatingSlot, setCreatingSlot] = useState(false);

    const user = useMemo<AuthUser | null>(() => {
        return getStoredUser();
    }, []);

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
            setSlotDrafts(
                Object.fromEntries(
                    slotsRes.map((entry) => [entry.id, { slotNumber: entry.slotNumber, status: entry.status }])
                )
            );
            setBookingDrafts(
                Object.fromEntries(
                    bookingsRes.map((entry) => [
                        entry.id,
                        {
                            status: entry.status,
                            startTime: toLocalInputValue(entry.startTime),
                            endTime: entry.endTime ? toLocalInputValue(entry.endTime) : ""
                        }
                    ])
                )
            );
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load admin dashboard");
        } finally {
            setLoading(false);
        }
    }, [token, user?.role]);

    useEffect(() => {
        if (user?.role === "ADMIN") {
            refreshDashboard();

            // Auto-refresh data every 5 seconds for real-time updates
            const intervalId = setInterval(() => {
                refreshDashboard();
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [refreshDashboard, user?.role]);

    const onLogout = () => {
        clearAuthSession();
        navigate("/login", { replace: true });
    };

    const runAction = async (action: () => Promise<void>, successMessage: string) => {
        setError("");
        setNotice("");

        try {
            await action();
            setNotice(successMessage);

            // Clear success notice after 3 seconds
            const noticeTimeoutId = setTimeout(() => setNotice(""), 3000);

            // Refresh dashboard after a brief delay to show the success message
            await new Promise((resolve) => setTimeout(resolve, 500));
            await refreshDashboard();

            return () => clearTimeout(noticeTimeoutId);
        } catch (actionError) {
            const errorMessage = actionError instanceof Error ? actionError.message : "Action failed";
            setError(errorMessage);

            // Auto-clear error after 5 seconds if it was a simple error
            const errorTimeoutId = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(errorTimeoutId);
        }
    };

    const handleCreateSlot = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!token) return;

        const trimmedSlot = newSlotNumber.trim();
        if (!trimmedSlot) {
            setError("Slot number is required.");
            return;
        }

        setCreatingSlot(true);
        setError("");
        setNotice("");

        try {
            const response = await createAdminSlot(token, trimmedSlot);
            const createdSlot = response.slot;

            setSlots((current) => {
                const hasSlot = current.some((slot) => slot.id === createdSlot.id);
                return hasSlot ? current : [...current, createdSlot];
            });

            setSlotDrafts((current) => ({
                ...current,
                [createdSlot.id]: {
                    slotNumber: createdSlot.slotNumber,
                    status: createdSlot.status,
                },
            }));

            setStats((current) =>
                current
                    ? {
                        ...current,
                        totalSlots: current.totalSlots + 1,
                        availableSlots:
                            createdSlot.status === "AVAILABLE"
                                ? current.availableSlots + 1
                                : current.availableSlots,
                    }
                    : current,
            );

            setNewSlotNumber("");
            setNotice(`Slot ${trimmedSlot} created successfully.`);

            // Keep UI responsive even if one of the dashboard refresh endpoints fails.
            void refreshDashboard();
        } catch (createError) {
            const message =
                createError instanceof Error && createError.message.trim()
                    ? createError.message
                    : "Failed to create slot. Please try again.";
            setError(message);
        } finally {
            setCreatingSlot(false);
        }
    };

    const initials = user?.name
        ? user.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("")
        : "VS";

    const sortedUsers = useMemo(() => {
        return [...users].sort((left, right) => sortByDateDesc(left.createdAt, right.createdAt));
    }, [users]);

    const sortedSlots = useMemo(() => {
        return [...slots].sort((left, right) => left.slotNumber.localeCompare(right.slotNumber));
    }, [slots]);

    const sortedBookings = useMemo(() => {
        return [...bookings].sort((left, right) => sortByDateDesc(left.createdAt, right.createdAt));
    }, [bookings]);

    const slotBreakdown = useMemo(() => {
        return slots.reduce(
            (accumulator, slot) => {
                if (slot.status === "AVAILABLE") accumulator.available += 1;
                if (slot.status === "RESERVED") accumulator.reserved += 1;
                if (slot.status === "OCCUPIED") accumulator.occupied += 1;
                return accumulator;
            },
            { available: 0, reserved: 0, occupied: 0 }
        );
    }, [slots]);

    const occupancyPercent =
        stats && stats.totalSlots > 0
            ? Math.round(((slotBreakdown.occupied + slotBreakdown.reserved) / stats.totalSlots) * 100)
            : 0;

    const activeBookings = sortedBookings.filter((item) => item.status === "ACTIVE");

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const loadStateLabel = loading ? "Refreshing data..." : "Live data connected";

    if (!user) {
        return (
            <main className="grid min-h-screen place-items-center bg-slate-900 px-4 text-white">
                <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                    <h1 className="font-heading text-2xl">Session not found</h1>
                    <p className="mt-2 text-sm text-slate-300">Please login again to access the dashboard.</p>
                    <button
                        onClick={onLogout}
                        className="mt-4 rounded-xl bg-flare px-4 py-2 text-sm font-semibold text-white"
                    >
                        Back to Login
                    </button>
                </div>
            </main>
        );
    }

    if (user.role !== "ADMIN") {
        return <UserDashboardPage user={user} onLogout={onLogout} />;
    }

    return (
        <main className="admin-grid relative min-h-screen overflow-hidden bg-[#06121e] px-4 py-6 font-body text-white sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(46,196,182,0.2),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,107,53,0.2),transparent_38%)]" />

            <section className="relative mx-auto max-w-7xl space-y-6">
                <header className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 shadow-card backdrop-blur sm:p-7">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-flare via-[#f08d49] to-mint text-lg font-bold text-white shadow-lg">
                                {initials}
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-mint/80">VectraSlot Command Center</p>
                                <h1 className="font-heading text-2xl sm:text-3xl">Admin Operations Dashboard</h1>
                                <p className="mt-1 text-sm text-slate-300">{today}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                                Signed in as {user.email}
                            </p>
                            <button
                                onClick={refreshDashboard}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={onLogout}
                                className="rounded-xl bg-flare px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                    <p>{loadStateLabel}</p>
                    <p>Admin secret is checked by your backend environment, not stored in the UI.</p>
                </div>

                {notice && (
                    <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                        {notice}
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-300/40 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <article className="dashboard-appear rounded-2xl border border-cyan-200/20 bg-cyan-400/10 p-5" style={{ animationDelay: "80ms" }}>
                        <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Total Users</p>
                        <p className="mt-3 text-4xl font-bold">{stats?.totalUsers ?? 0}</p>
                        <p className="mt-2 text-sm text-cyan-50/80">Accounts currently present in the system.</p>
                    </article>

                    <article className="dashboard-appear rounded-2xl border border-mint/25 bg-mint/10 p-5" style={{ animationDelay: "140ms" }}>
                        <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/90">Available Slots</p>
                        <p className="mt-3 text-4xl font-bold">{stats?.availableSlots ?? 0}</p>
                        <p className="mt-2 text-sm text-emerald-50/80">Slots open for immediate booking.</p>
                    </article>

                    <article className="dashboard-appear rounded-2xl border border-orange-200/30 bg-flare/15 p-5" style={{ animationDelay: "200ms" }}>
                        <p className="text-xs uppercase tracking-[0.16em] text-orange-100/90">Total Bookings</p>
                        <p className="mt-3 text-4xl font-bold">{stats?.totalBookings ?? 0}</p>
                        <p className="mt-2 text-sm text-orange-50/85">All bookings across users and slots.</p>
                    </article>

                    <article className="dashboard-appear rounded-2xl border border-violet-200/30 bg-violet-500/15 p-5" style={{ animationDelay: "260ms" }}>
                        <p className="text-xs uppercase tracking-[0.16em] text-violet-100/90">Active Bookings</p>
                        <p className="mt-3 text-4xl font-bold">{stats?.activeBookings ?? activeBookings.length}</p>
                        <p className="mt-2 text-sm text-violet-50/80">Bookings with ACTIVE status.</p>
                    </article>

                    <article className="dashboard-appear rounded-2xl border border-white/20 bg-white/10 p-5" style={{ animationDelay: "320ms" }}>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Occupancy</p>
                        <p className="mt-3 text-4xl font-bold">{occupancyPercent}%</p>
                        <p className="mt-2 text-sm text-slate-300">Reserved plus occupied compared with total slots.</p>
                    </article>
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <article className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 backdrop-blur" style={{ animationDelay: "380ms" }}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-heading text-xl">Create Slot</h2>
                                <p className="mt-1 text-sm text-slate-300">Create a new parking slot directly from the admin panel.</p>
                            </div>
                            <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">
                                {sortedSlots.length} slots
                            </span>
                        </div>

                        <form
                            className="mt-4 flex flex-col gap-3 sm:flex-row"
                            onSubmit={handleCreateSlot}
                        >
                            <input
                                type="text"
                                name="slotNumber"
                                value={newSlotNumber}
                                onChange={(event) => setNewSlotNumber(event.target.value)}
                                placeholder="Example: A-101"
                                disabled={creatingSlot}
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-mint/60 focus:ring-2 focus:ring-mint/20"
                            />
                            <button
                                type="submit"
                                disabled={creatingSlot}
                                className="rounded-xl bg-mint px-5 py-3 text-sm font-semibold text-[#03221e] transition hover:bg-[#58d8cb]"
                            >
                                {creatingSlot ? "Creating..." : "Create Slot"}
                            </button>
                        </form>

                        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3">Slot</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSlots.map((slot) => {
                                        const draft = slotDrafts[slot.id] ?? { slotNumber: slot.slotNumber, status: slot.status };

                                        return (
                                            <tr key={slot.id} className="border-t border-white/10">
                                                <td className="px-4 py-3">
                                                    <input
                                                        value={draft.slotNumber}
                                                        onChange={(event) =>
                                                            setSlotDrafts((current) => ({
                                                                ...current,
                                                                [slot.id]: { ...draft, slotNumber: event.target.value }
                                                            }))
                                                        }
                                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-mint/60"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={draft.status}
                                                        onChange={(event) =>
                                                            setSlotDrafts((current) => ({
                                                                ...current,
                                                                [slot.id]: { ...draft, status: event.target.value as SlotStatus }
                                                            }))
                                                        }
                                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-mint/60"
                                                    >
                                                        {SLOT_STATUS_OPTIONS.map((status) => (
                                                            <option key={status} value={status} className="bg-slate-900">
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                if (!token) return;
                                                                await runAction(async () => {
                                                                    await updateAdminSlot(token, slot.id, {
                                                                        slotNumber: draft.slotNumber.trim(),
                                                                        status: draft.status
                                                                    });
                                                                }, `Slot ${slot.slotNumber} updated.`);
                                                            }}
                                                            className="rounded-lg bg-ocean px-3 py-2 text-xs font-semibold text-white"
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!token) return;
                                                                const confirmed = window.confirm(`Delete slot ${slot.slotNumber}?`);
                                                                if (!confirmed) return;
                                                                await runAction(async () => {
                                                                    await deleteAdminSlot(token, slot.id);
                                                                }, `Slot ${slot.slotNumber} deleted.`);
                                                            }}
                                                            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {sortedSlots.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                                                No slots found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 backdrop-blur" style={{ animationDelay: "440ms" }}>
                        <h2 className="font-heading text-xl">Operations Summary</h2>
                        <p className="mt-1 text-sm text-slate-300">Quick state of the parking system.</p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span>Available</span>
                                    <span>{slotBreakdown.available}</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/10">
                                    <div
                                        className="h-2 rounded-full bg-mint"
                                        style={{
                                            width: stats?.totalSlots ? `${(slotBreakdown.available / stats.totalSlots) * 100}%` : "0%"
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span>Reserved</span>
                                    <span>{slotBreakdown.reserved}</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/10">
                                    <div
                                        className="h-2 rounded-full bg-amber-400"
                                        style={{
                                            width: stats?.totalSlots ? `${(slotBreakdown.reserved / stats.totalSlots) * 100}%` : "0%"
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span>Occupied</span>
                                    <span>{slotBreakdown.occupied}</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/10">
                                    <div
                                        className="h-2 rounded-full bg-flare"
                                        style={{
                                            width: stats?.totalSlots ? `${(slotBreakdown.occupied / stats.totalSlots) * 100}%` : "0%"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                            <p className="font-semibold text-white">System status</p>
                            <p className="mt-1">The admin dashboard is connected to live backend endpoints for users, slots, bookings, and stats.</p>
                        </div>
                    </article>
                </section>

                <section className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 backdrop-blur" style={{ animationDelay: "500ms" }}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-heading text-xl">User Management</h2>
                            <p className="mt-1 text-sm text-slate-300">Promote, demote, or remove users. Avoid changing your own role from this screen.</p>
                        </div>
                        <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">
                            {sortedUsers.length} users
                        </span>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsers.map((entry) => {
                                    const draftRole = userDrafts[entry.id] ?? entry.role;
                                    const isSelf = entry.id === user.id;

                                    return (
                                        <tr key={entry.id} className="border-t border-white/10">
                                            <td className="px-4 py-3 font-semibold text-white">{entry.name}</td>
                                            <td className="px-4 py-3 text-slate-300">{entry.email}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={draftRole}
                                                    disabled={isSelf}
                                                    onChange={(event) =>
                                                        setUserDrafts((current) => ({
                                                            ...current,
                                                            [entry.id]: event.target.value as Role
                                                        }))
                                                    }
                                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-mint/60 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <option value="USER" className="bg-slate-900">USER</option>
                                                    <option value="ADMIN" className="bg-slate-900">ADMIN</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        disabled={isSelf}
                                                        onClick={async () => {
                                                            if (!token) return;
                                                            if (isSelf) {
                                                                setError("You cannot change your own role from the dashboard.");
                                                                return;
                                                            }
                                                            await runAction(async () => {
                                                                await updateAdminUserRole(token, entry.id, draftRole);
                                                            }, `${entry.name} role updated to ${draftRole}.`);
                                                        }}
                                                        className="rounded-lg bg-ocean px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Update Role
                                                    </button>
                                                    <button
                                                        disabled={isSelf}
                                                        onClick={async () => {
                                                            if (!token) return;
                                                            if (isSelf) {
                                                                setError("You cannot delete your own account from the dashboard.");
                                                                return;
                                                            }
                                                            const confirmed = window.confirm(`Delete user ${entry.email}?`);
                                                            if (!confirmed) return;
                                                            await runAction(async () => {
                                                                await deleteAdminUser(token, entry.id);
                                                            }, `${entry.name} deleted.`);
                                                        }}
                                                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {sortedUsers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 backdrop-blur" style={{ animationDelay: "560ms" }}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-heading text-xl">Bookings Management</h2>
                            <p className="mt-1 text-sm text-slate-300">Update booking status or time range, or delete a booking if needed.</p>
                        </div>
                        <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">
                            {sortedBookings.length} bookings
                        </span>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Slot</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Start</th>
                                    <th className="px-4 py-3">End</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedBookings.map((booking) => {
                                    const draft = bookingDrafts[booking.id] ?? {
                                        status: booking.status,
                                        startTime: toLocalInputValue(booking.startTime),
                                        endTime: booking.endTime ? toLocalInputValue(booking.endTime) : ""
                                    };

                                    return (
                                        <tr key={booking.id} className="border-t border-white/10 align-top">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-white">{booking.user.name}</div>
                                                <div className="text-xs text-slate-400">{booking.user.email}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-white">{booking.slot.slotNumber}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={draft.status}
                                                    onChange={(event) =>
                                                        setBookingDrafts((current) => ({
                                                            ...current,
                                                            [booking.id]: { ...draft, status: event.target.value as BookingStatus }
                                                        }))
                                                    }
                                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-mint/60"
                                                >
                                                    {STATUS_OPTIONS.map((status) => (
                                                        <option key={status} value={status} className="bg-slate-900">
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="datetime-local"
                                                    value={draft.startTime}
                                                    onChange={(event) =>
                                                        setBookingDrafts((current) => ({
                                                            ...current,
                                                            [booking.id]: { ...draft, startTime: event.target.value }
                                                        }))
                                                    }
                                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-mint/60"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="datetime-local"
                                                    value={draft.endTime}
                                                    onChange={(event) =>
                                                        setBookingDrafts((current) => ({
                                                            ...current,
                                                            [booking.id]: { ...draft, endTime: event.target.value }
                                                        }))
                                                    }
                                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-mint/60"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            if (!token) return;
                                                            await runAction(async () => {
                                                                await updateAdminBooking(token, booking.id, {
                                                                    status: draft.status,
                                                                    startTime: new Date(draft.startTime).toISOString(),
                                                                    endTime: draft.endTime ? new Date(draft.endTime).toISOString() : null
                                                                });
                                                            }, `Booking ${booking.id} updated.`);
                                                        }}
                                                        className="rounded-lg bg-ocean px-3 py-2 text-xs font-semibold text-white"
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!token) return;
                                                            const confirmed = window.confirm(`Delete booking #${booking.id}?`);
                                                            if (!confirmed) return;
                                                            await runAction(async () => {
                                                                await deleteAdminBooking(token, booking.id);
                                                            }, `Booking ${booking.id} deleted.`);
                                                        }}
                                                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {sortedBookings.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 backdrop-blur" style={{ animationDelay: "620ms" }}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-heading text-xl">Live Operations Snapshot</h2>
                            <p className="mt-1 text-sm text-slate-300">Quick system context for ongoing admin work.</p>
                        </div>
                        <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">
                            {activeBookings.length} active bookings
                        </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {activeBookings.slice(0, 6).map((booking) => (
                            <article key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Slot {booking.slot.slotNumber}</p>
                                <p className="mt-2 text-base font-semibold">{booking.user.name}</p>
                                <p className="text-sm text-slate-300">{booking.user.email}</p>
                                <p className="mt-3 text-xs text-slate-400">
                                    Started: {new Date(booking.startTime).toLocaleString()}
                                </p>
                            </article>
                        ))}

                        {activeBookings.length === 0 && !loading && (
                            <p className="col-span-full rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
                                No active bookings right now.
                            </p>
                        )}
                    </div>
                </section>
            </section>
        </main>
    );
}

export default DashboardPage;
