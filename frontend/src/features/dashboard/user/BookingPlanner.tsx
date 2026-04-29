import { formatDateTime } from "../../../utils/dates";
import { SlotRecord } from "../../../api/slots";

interface BookingPlannerProps {
    bookingForm: {
        slotId: string;
        startTime: string;
        endTime: string;
    };
    setBookingForm: (updater: (prev: any) => any) => void;
    availableForSelectedWindow: SlotRecord[];
    checkAvailability: () => void;
    onBookSlot: () => void;
    onClearForm: () => void;
}

export default function BookingPlanner({
    bookingForm,
    setBookingForm,
    availableForSelectedWindow,
    checkAvailability,
    onBookSlot,
    onClearForm
}: BookingPlannerProps) {
    return (
        <article className="rounded-3xl border border-white/10 bg-[#0d1f33]/90 p-5 backdrop-blur sm:p-6 hover-premium">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-mint/80">Plan a booking</p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold">Check availability and reserve a slot</h2>
                    <p className="mt-1 text-sm text-slate-300">Start with a time window, preview available slots, then book the one you want.</p>
                </div>

                <button
                    onClick={checkAvailability}
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
                    onClick={onBookSlot}
                    className="rounded-full bg-mint px-5 py-3 text-sm font-semibold text-[#05211d] transition hover:bg-[#57d7cb]"
                >
                    Reserve slot
                </button>
                <button
                    onClick={onClearForm}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                    Clear form
                </button>
            </div>
        </article>
    );
}
