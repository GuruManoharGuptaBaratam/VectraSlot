import { SlotRecord, SlotStatus } from "../../../api/slots";

interface SlotBrowserProps {
    filteredSlots: SlotRecord[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    slotFilter: string;
    setSlotFilter: (value: any) => void;
    slotTone: Record<SlotStatus, string>;
    setBookingForm: (updater: (prev: any) => any) => void;
    availabilityChecked: boolean;
    availabilitySlots: SlotRecord[];
}

export default function SlotBrowser({
    filteredSlots,
    searchTerm,
    setSearchTerm,
    slotFilter,
    setSlotFilter,
    slotTone,
    setBookingForm,
    availabilityChecked,
    availabilitySlots
}: SlotBrowserProps) {
    return (
        <article className="rounded-3xl border border-white/10 bg-[#0d1f33]/90 p-5 backdrop-blur sm:p-6 hover-premium">
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
                    onChange={(event) => setSlotFilter(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-mint/60"
                >
                    <option value="ALL" className="bg-slate-900">All statuses</option>
                    <option value="AVAILABLE" className="bg-slate-900">AVAILABLE</option>
                    <option value="RESERVED" className="bg-slate-900">RESERVED</option>
                    <option value="OCCUPIED" className="bg-slate-900">OCCUPIED</option>
                </select>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {filteredSlots.slice(0, 8).map((slot) => (
                    <article key={slot.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 hover-premium">
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
    );
}
