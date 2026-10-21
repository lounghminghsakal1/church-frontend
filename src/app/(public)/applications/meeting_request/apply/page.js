"use client";
import DateTimePicker from '@/components/ui/DateTimePicker';
import { inputClassName } from '@/components/ui/styles';
import Field from '@/components/common_components/FormField';


import { apiPost } from '@/services/axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

// ── Shared primitives ────────────────────────────────────────────────

const Label = ({ children }) => (
  <label className="text-[11px] font-semibold text-muted tracking-wider uppercase">
    {children}
  </label>
);

const inputCls = inputClassName;



// ────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  person_name: "",
  preferred_meeting_date_and_time: "",
  meeting_purpose: "",
};

const MeetingRequestApplyPage = ({ user }) => {
  const router = useRouter();

  const [mRForm, setmRForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setmRForm(p => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!mRForm.person_name.trim())
      e.person_name = "Person's name is required";
    if (!mRForm.meeting_purpose.trim())
      e.meeting_purpose = "Meeting purpose is required";
    if (!mRForm.preferred_meeting_date_and_time)
      e.preferred_meeting_date_and_time = "Preferred date & time is required";
    else if (new Date(mRForm.preferred_meeting_date_and_time) <= new Date())
      e.preferred_meeting_date_and_time = "Preferred date must be in the future";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await apiPost("/user/meeting_request", { user, ...mRForm });
      if (res?.status === "success") {
        toast.success("Meeting request sent to the priest for review. The priest will contact you shortly.");
        setmRForm(EMPTY_FORM);
      } else {
        throw new Error(res?.message);
      }
    } catch (err) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Page header bar */}
      <div className="bg-ink border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/15 border border-white/15 rounded-md px-3 py-1.5 text-xs font-semibold font-[inherit] cursor-pointer shrink-0"
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <div className="h-5 w-px bg-white/20" />
          <div>
            <div className="text-white/80 text-[11px] font-semibold tracking-[1.5px] uppercase leading-none mb-0.5">
              Meeting Request
            </div>
            <div className="text-white font-bold text-base tracking-[0.2px] leading-none">
              Meeting Request Application
            </div>
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        <p className="text-sm text-muted mb-8 leading-relaxed">
          Fill in the details below to submit a meeting request. The priest will reach out to confirm the schedule.
        </p>

        <div className="bg-white rounded-xl border border-line shadow-sm shadow-ink/5 overflow-hidden">

          {/* Section: Person details */}
          <div className="px-5 py-6 sm:px-7 border-b border-soft">
            <div className="text-[11px] font-bold text-accent-ink tracking-[1.4px] uppercase mb-5">
              Person's Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <Field label="Meeting Person's Name" error={errors.person_name}>
                <input
                  value={mRForm.person_name}
                  onChange={set('person_name')}
                  placeholder="Enter meeting person's full name"
                  className={inputCls(errors.person_name)}
                />
              </Field>

              <Field label="Preferred Meeting Date & Time" error={errors.preferred_meeting_date_and_time}>
                <DateTimePicker
                  type="datetime-local"
                  value={mRForm.preferred_meeting_date_and_time}
                  onChange={set('preferred_meeting_date_and_time')}
                  className={inputCls(errors.preferred_meeting_date_and_time) + " cursor-pointer"}
                />
              </Field>

            </div>
          </div>

          {/* Section: Meeting purpose */}
          <div className="px-5 py-6 sm:px-7 border-b border-soft">
            <div className="text-[11px] font-bold text-accent-ink tracking-[1.4px] uppercase mb-5">
              Meeting Purpose
            </div>
            <Field label="Purpose of Meeting" error={errors.meeting_purpose}>
              <textarea
                rows={4}
                value={mRForm.meeting_purpose}
                onChange={set('meeting_purpose')}
                placeholder="Briefly describe the purpose of this meeting request…"
                className={inputCls(errors.meeting_purpose) + " resize-none"}
              />
            </Field>
          </div>

          {/* Footer / Submit */}
          <div className="px-5 py-5 sm:px-7 bg-background flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              By submitting, you agree to be contacted by the parish regarding this meeting request.
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={` shrink-0 px-10 py-2.5 rounded-[7px] font-bold text-sm text-ink border-none uppercase tracking-[0.8px] font-[inherit] transition-colors duration-150 ${loading ? 'bg-accent cursor-not-allowed' : 'bg-accent cursor-pointer hover:bg-accent'} `}
            >
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MeetingRequestApplyPage;
