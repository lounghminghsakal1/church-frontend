"use client";

import { useAuthPriest } from "@/hooks/useAuthPriest";
import { apiGet,  } from "@/services/axios";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  RotateCcw,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────
const DAYS = [
  { key: "monday", label: "Mon", full: "Monday" },
  { key: "tuesday", label: "Tue", full: "Tuesday" },
  { key: "wednesday", label: "Wed", full: "Wednesday" },
  { key: "thursday", label: "Thu", full: "Thursday" },
  { key: "friday", label: "Fri", full: "Friday" },
  { key: "saturday", label: "Sat", full: "Saturday" },
  { key: "sunday", label: "Sun", full: "Sunday" },
];

const DEFAULT_SLOT = { start_time: "", end_time: "" };

const buildEmptyAvailability = () =>
  Object.fromEntries(DAYS.map((d) => [d.key, []]));

// ── Helpers ───────────────────────────────────────────────────────
const to24 = (t) => {
  // accepts "HH:MM" or "HH:MM AM/PM"
  if (!t) return null;
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  const [time, meridiem] = t.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem?.toLowerCase() === "pm" && h !== 12) h += 12;
  if (meridiem?.toLowerCase() === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const toDisplay = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const meridiem = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${String(m).padStart(2, "0")} ${meridiem}`;
};

// ── Validation ────────────────────────────────────────────────────
const validateAvailability = (availability) => {
  const errors = {};
  DAYS.forEach(({ key }) => {
    const slots = availability[key] ?? [];
    const slotErrors = [];
    let hasError = false;
    slots.forEach((slot, idx) => {
      const e = {};
      if (!slot.start_time) {
        e.start_time = "Start time required";
        hasError = true;
      }
      if (!slot.end_time) {
        e.end_time = "End time required";
        hasError = true;
      }
      if (slot.start_time && slot.end_time && slot.start_time >= slot.end_time) {
        e.end_time = "End time must be after start time";
        hasError = true;
      }
      // Overlap check within same day
      slots.forEach((other, otherIdx) => {
        if (idx === otherIdx || !other.start_time || !other.end_time) return;
        if (
          slot.start_time < other.end_time &&
          slot.end_time > other.start_time
        ) {
          e.overlap = "Overlaps with another slot";
          hasError = true;
        }
      });
      slotErrors[idx] = e;
    });
    if (hasError) errors[key] = slotErrors;
  });
  return errors;
};

// ── Time input ────────────────────────────────────────────────────
const TimeInput = ({ value, onChange, error, placeholder }) => (
  <div className="flex flex-col gap-1 flex-1 min-w-0">
    <div
      className={`relative flex items-center border rounded-sm bg-white transition-all duration-200
      ${error
        ? "border-rose-400 ring-1 ring-rose-300"
        : "border-[#0F2A4A]/15 focus-within:border-[#C9A84C] focus-within:ring-1 focus-within:ring-[#C9A84C]/30"
      }`}
    >
      <Clock
        size={13}
        className={`absolute left-2.5 flex-shrink-0 ${error ? "text-rose-400" : "text-[#0F2A4A]/30"}`}
      />
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-2 py-2 bg-transparent font-sans text-xs text-[#0F2A4A] outline-none placeholder-[#0F2A4A]/25"
      />
    </div>
    {error && (
      <p className="flex items-center gap-1 text-rose-500 font-sans text-[10px]">
        <AlertCircle size={10} />
        {error}
      </p>
    )}
  </div>
);

// ── Single slot row ───────────────────────────────────────────────
const SlotRow = ({ slot, slotErrors, onUpdate, onRemove }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-start gap-2">
      <TimeInput
        value={slot.start_time}
        onChange={(v) => onUpdate("start_time", v)}
        error={slotErrors?.start_time}
        placeholder="Start"
      />
      <span className="font-sans text-[#0F2A4A]/30 text-xs pt-2.5 flex-shrink-0">—</span>
      <TimeInput
        value={slot.end_time}
        onChange={(v) => onUpdate("end_time", v)}
        error={slotErrors?.end_time}
        placeholder="End"
      />
      <button
        type="button"
        onClick={onRemove}
        className="mt-1.5 w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-sm border border-[#0F2A4A]/10 text-[#0F2A4A]/25 hover:border-rose-300 hover:text-rose-400 hover:bg-rose-50 transition-all duration-200"
        aria-label="Remove slot"
      >
        <Trash2 size={13} />
      </button>
    </div>
    {slotErrors?.overlap && (
      <p className="flex items-center gap-1 text-amber-600 font-sans text-[10px]">
        <AlertCircle size={10} />
        {slotErrors.overlap}
      </p>
    )}
  </div>
);

// ── Day column ────────────────────────────────────────────────────
const DayColumn = ({ day, slots, errors, onAddSlot, onUpdateSlot, onRemoveSlot, activeDay, onSelect }) => {
  const isActive = activeDay === day.key;
  const hasSlots = slots.length > 0;
  const hasError = errors && errors.length > 0 && errors.some((e) => e && Object.keys(e).length > 0);

  return (
    <div
      className={`rounded-sm border transition-all duration-200 overflow-hidden
        ${isActive
          ? "border-[#C9A84C]/50 shadow-md"
          : hasError
          ? "border-rose-300"
          : hasSlots
          ? "border-[#0F2A4A]/20"
          : "border-[#0F2A4A]/8"
        }`}
    >
      {/* Day header */}
      <button
        type="button"
        onClick={() => onSelect(day.key)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all duration-200
          ${isActive
            ? "bg-[#0F2A4A] text-white"
            : hasSlots
            ? "bg-[#0F2A4A]/5 text-[#0F2A4A] hover:bg-[#0F2A4A]/8"
            : "bg-white text-[#0F2A4A]/50 hover:bg-[#0F2A4A]/3"
          }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-sans font-semibold text-xs tracking-wide">{day.full}</span>
          {hasError && <AlertCircle size={11} className="text-rose-400" />}
        </div>
        <span
          className={`font-sans text-[10px] font-medium px-1.5 py-0.5 rounded-sm
            ${isActive
              ? "bg-white/15 text-white"
              : hasSlots
              ? "bg-[#0F2A4A]/10 text-[#0F2A4A]/60"
              : "bg-[#0F2A4A]/5 text-[#0F2A4A]/30"
            }`}
        >
          {slots.length} slot{slots.length !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Slots (visible when active) */}
      {isActive && (
        <div className="p-3 bg-[#F4F6F9]/60 flex flex-col gap-2.5">
          {slots.length === 0 && (
            <p className="font-sans text-[#0F2A4A]/35 text-xs text-center py-2">
              No slots — add one below
            </p>
          )}
          {slots.map((slot, idx) => (
            <SlotRow
              key={idx}
              slot={slot}
              slotErrors={errors?.[idx] ?? {}}
              onUpdate={(field, val) => onUpdateSlot(day.key, idx, field, val)}
              onRemove={() => onRemoveSlot(day.key, idx)}
            />
          ))}
          <button
            type="button"
            onClick={() => onAddSlot(day.key)}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#0F2A4A]/20 rounded-sm text-[#0F2A4A]/40 hover:border-[#C9A84C]/50 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all duration-200 font-sans text-xs"
          >
            <Plus size={12} />
            Add time slot
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────
const EditPriestAvailability = () => {
  const { loggedInPriest } = useAuthPriest();

  const [availability, setAvailability] = useState(buildEmptyAvailability());
  const [originalAvailability, setOriginalAvailability] = useState(null);
  const [activeDay, setActiveDay] = useState("monday");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  // ── Fetch existing availability ───────────────────────────────
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!loggedInPriest?.priest_id) {
        setFetching(false);
        return;
      }
      try {
        setFetching(true);
        const response = await apiGet(
          `/priest/availability/${loggedInPriest.priest_id}`
        );
        if (response?.data) {
          const filled = { ...buildEmptyAvailability(), ...response.data };
          setAvailability(filled);
          setOriginalAvailability(filled);
        }
      } catch (err) {
        // Non-blocking — just start with empty
        console.warn("Could not fetch availability:", err?.message);
      } finally {
        setFetching(false);
      }
    };
    fetchAvailability();
  }, [loggedInPriest?.priest_id]);

  // ── Slot mutations ────────────────────────────────────────────
  const handleAddSlot = useCallback((dayKey) => {
    setAvailability((prev) => ({
      ...prev,
      [dayKey]: [...(prev[dayKey] ?? []), { ...DEFAULT_SLOT }],
    }));
    // Clear errors for this day
    setFieldErrors((prev) => ({ ...prev, [dayKey]: undefined }));
  }, []);

  const handleUpdateSlot = useCallback((dayKey, idx, field, value) => {
    setAvailability((prev) => {
      const updated = [...(prev[dayKey] ?? [])];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, [dayKey]: updated };
    });
    // Clear specific field error
    setFieldErrors((prev) => {
      const dayErrors = [...(prev[dayKey] ?? [])];
      if (dayErrors[idx]) {
        dayErrors[idx] = { ...dayErrors[idx], [field]: undefined, overlap: undefined };
      }
      return { ...prev, [dayKey]: dayErrors };
    });
    setSaved(false);
  }, []);

  const handleRemoveSlot = useCallback((dayKey, idx) => {
    setAvailability((prev) => {
      const updated = [...(prev[dayKey] ?? [])];
      updated.splice(idx, 1);
      return { ...prev, [dayKey]: updated };
    });
    setFieldErrors((prev) => {
      const dayErrors = [...(prev[dayKey] ?? [])];
      dayErrors.splice(idx, 1);
      return { ...prev, [dayKey]: dayErrors };
    });
    setSaved(false);
  }, []);

  // ── Reset ─────────────────────────────────────────────────────
  const handleReset = () => {
    if (originalAvailability) {
      setAvailability(originalAvailability);
      setFieldErrors({});
      setServerError("");
      setSaved(false);
      toast.info("Changes discarded.");
    }
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSave = async () => {
    setServerError("");
    setSaved(false);
    const errors = validateAvailability(availability);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Auto-focus first day with error
      const firstErrDay = Object.keys(errors)[0];
      setActiveDay(firstErrDay);
      toast.error("Please fix the highlighted errors.");
      return;
    }
    try {
      setLoading(true);
      // const response = await apiPut(
      //   `/priest/availability/${loggedInPriest?.priest_id}`,
      //   { availability }
      // );
      if (response?.status === "failure") {
        setServerError(response?.message || "Failed to save. Please try again.");
        return;
      }
      setSaved(true);
      setOriginalAvailability(availability);
      toast.success("Availability saved successfully.");
    } catch (err) {
      setServerError(err?.message || "Something went wrong. Please try again.");
      toast.error(err?.message || "Save error");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────
  if (fetching) {
    return (
      <div className="bg-white rounded-sm border border-[#0F2A4A]/8 p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-[#0F2A4A]/5 rounded-sm animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  // ── Derive summary stats ──────────────────────────────────────
  const totalSlots = Object.values(availability).reduce(
    (acc, slots) => acc + (slots?.length ?? 0),
    0
  );
  const activeDays = Object.values(availability).filter(
    (s) => s?.length > 0
  ).length;

  return (
    <div className="bg-white rounded-sm border border-[#0F2A4A]/8 shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#0F2A4A]/8">
        <div>
          <h3 className="font-serif text-[#0F2A4A] text-sm font-semibold tracking-wide">
            Weekly Availability
          </h3>
          <p className="font-sans text-[#0F2A4A]/40 text-xs mt-0.5">
            {activeDays > 0
              ? `${activeDays} day${activeDays !== 1 ? "s" : ""} · ${totalSlots} total slot${totalSlots !== 1 ? "s" : ""}`
              : "No availability set yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Info badge */}
          <div className="hidden sm:flex items-center gap-1.5 border border-[#0F2A4A]/10 rounded-sm px-2.5 py-1.5">
            <Info size={11} className="text-[#0F2A4A]/35" />
            <span className="font-sans text-[10px] text-[#0F2A4A]/35 tracking-wide">
              Select a day to edit
            </span>
          </div>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mx-5 mt-4 flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-sm px-4 py-3">
          <AlertCircle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-rose-600 font-sans text-sm leading-snug">{serverError}</p>
        </div>
      )}

      {/* Success banner */}
      {saved && !serverError && (
        <div className="mx-5 mt-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-sm px-4 py-3">
          <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-700 font-sans text-sm">
            Availability saved successfully.
          </p>
        </div>
      )}

      {/* Days grid */}
      <div className="p-5 space-y-2">
        {DAYS.map((day) => (
          <DayColumn
            key={day.key}
            day={day}
            slots={availability[day.key] ?? []}
            errors={fieldErrors[day.key]}
            onAddSlot={handleAddSlot}
            onUpdateSlot={handleUpdateSlot}
            onRemoveSlot={handleRemoveSlot}
            activeDay={activeDay}
            onSelect={(k) => setActiveDay((prev) => (prev === k ? null : k))}
          />
        ))}
      </div>

      {/* Gold divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />

      {/* Footer actions */}
      <div className="flex items-center justify-between px-5 py-4">
        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          disabled={loading || !originalAvailability}
          className="flex items-center gap-1.5 font-sans text-xs text-[#0F2A4A]/40 hover:text-[#0F2A4A]/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RotateCcw size={12} />
          Discard changes
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center gap-2.5 bg-[#0F2A4A] hover:bg-[#16376b] disabled:bg-[#0F2A4A]/50 text-white font-sans font-semibold text-xs tracking-wide px-6 py-2.5 rounded-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save Availability"
          )}
        </button>
      </div>
    </div>
  );
};

export default EditPriestAvailability;