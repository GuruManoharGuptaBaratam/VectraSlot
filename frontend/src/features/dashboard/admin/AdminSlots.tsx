import { AdminSlot, SlotStatus } from "../../../api/admin";

interface AdminSlotsProps {
    slots: AdminSlot[];
    slotDrafts: Record<number, { slotNumber: string; status: SlotStatus }>;
    setSlotDrafts: (updater: (prev: any) => any) => void;
    onUpdate: (slot: AdminSlot, draft: { slotNumber: string; status: SlotStatus }) => Promise<void>;
    onDelete: (slot: AdminSlot) => Promise<void>;
    newSlotNumber: string;
    setNewSlotNumber: (value: string) => void;
    handleCreateSlot: (e: React.FormEvent) => void;
    creatingSlot: boolean;
    loading: boolean;
    slotBreakdown: { available: number; reserved: number; occupied: number };
    totalSlots: number;
}

const SLOT_STATUS_OPTIONS: SlotStatus[] = ["AVAILABLE", "RESERVED", "OCCUPIED"];

export default function AdminSlots({
    slots,
    slotDrafts,
    setSlotDrafts,
    onUpdate,
    onDelete,
    newSlotNumber,
    setNewSlotNumber,
    handleCreateSlot,
    creatingSlot,
    slotBreakdown,
    totalSlots
}: AdminSlotsProps) {
    return (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 backdrop-blur hover-premium">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-heading text-xl">Create Slot</h2>
                        <p className="mt-1 text-sm text-slate-300">Create a new parking slot directly from the admin panel.</p>
                    </div>
                    <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">
                        {slots.length} slots
                    </span>
                </div>

                <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleCreateSlot}>
                    <input
                        type="text"
                        value={newSlotNumber}
                        onChange={(e) => setNewSlotNumber(e.target.value)}
                        placeholder="Example: A-101"
                        disabled={creatingSlot}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-mint/60"
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
                            {slots.map((slot) => {
                                const draft = slotDrafts[slot.id] ?? { slotNumber: slot.slotNumber, status: slot.status };
                                return (
                                    <tr key={slot.id} className="border-t border-white/10">
                                        <td className="px-4 py-3">
                                            <input
                                                value={draft.slotNumber}
                                                onChange={(e) => setSlotDrafts(cur => ({ ...cur, [slot.id]: { ...draft, slotNumber: e.target.value } }))}
                                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-mint/60"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={draft.status}
                                                onChange={(e) => setSlotDrafts(cur => ({ ...cur, [slot.id]: { ...draft, status: e.target.value as SlotStatus } }))}
                                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-mint/60"
                                            >
                                                {SLOT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <button onClick={() => onUpdate(slot, draft)} className="rounded-lg bg-ocean px-3 py-2 text-xs font-semibold text-white">Update</button>
                                                <button onClick={() => onDelete(slot)} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </article>

            <article className="dashboard-appear rounded-3xl border border-white/10 bg-[#0d1f33]/85 p-5 backdrop-blur hover-premium">
                <h2 className="font-heading text-xl">Operations Summary</h2>
                <p className="mt-1 text-sm text-slate-300">Quick state of the parking system.</p>
                <div className="mt-5 space-y-4">
                    {["available", "reserved", "occupied"].map(key => (
                        <div key={key}>
                            <div className="mb-1 flex justify-between text-sm capitalize">
                                <span>{key}</span>
                                <span>{(slotBreakdown as any)[key]}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10">
                                <div
                                    className={`h-2 rounded-full ${key === 'available' ? 'bg-mint' : key === 'reserved' ? 'bg-amber-400' : 'bg-flare'}`}
                                    style={{ width: totalSlots ? `${((slotBreakdown as any)[key] / totalSlots) * 100}%` : "0%" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </article>
        </section>
    );
}
