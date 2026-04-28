import { AdminUser } from "../../../api/admin";
import { Role } from "../../../types/auth";

interface AdminUsersProps {
    users: AdminUser[];
    userDrafts: Record<number, Role>;
    setUserDrafts: (updater: (prev: any) => any) => void;
    onUpdate: (user: AdminUser, draftRole: Role) => Promise<void>;
    onDelete: (user: AdminUser) => Promise<void>;
    currentUserId: number;
}

export default function AdminUsers({
    users,
    userDrafts,
    setUserDrafts,
    onUpdate,
    onDelete,
    currentUserId
}: AdminUsersProps) {
    return (
        <section className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 backdrop-blur hover-premium">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="font-heading text-xl">User Management</h2>
                    <p className="mt-1 text-sm text-slate-300">Promote, demote, or remove users. Avoid changing your own role from this screen.</p>
                </div>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">
                    {users.length} users
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
                        {users.map((entry) => {
                            const draftRole = userDrafts[entry.id] ?? entry.role;
                            const isSelf = entry.id === currentUserId;

                            return (
                                <tr key={entry.id} className="border-t border-white/10">
                                    <td className="px-4 py-3 font-semibold text-white">{entry.name}</td>
                                    <td className="px-4 py-3 text-slate-300">{entry.email}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={draftRole}
                                            disabled={isSelf}
                                            onChange={(event) =>
                                                setUserDrafts((current: any) => ({
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
                                                onClick={() => onUpdate(entry, draftRole)}
                                                className="rounded-lg bg-ocean px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Update
                                            </button>
                                            <button
                                                disabled={isSelf}
                                                onClick={() => onDelete(entry)}
                                                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
