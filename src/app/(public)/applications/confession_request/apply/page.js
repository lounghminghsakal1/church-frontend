"use client";
import Field from '@/components/common_components/FormField';


import { apiPost } from '@/services/axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

// ── Moved outside component to prevent re-creation on every render ──

const Label = ({ children }) => (
  <label className="text-[11px] font-semibold text-muted tracking-wider uppercase">
    {children}
  </label>
);

const inputCls = (error) => `
  w-full px-3.5 py-2.5 rounded-[7px] text-sm text-ink font-[inherit]
  border-[1.5px] outline-none transition-colors box-border bg-white
  focus:border-ink
  ${error ? 'border-ink bg-soft focus:border-ink' : 'border-line'}
`;



// ────────────────────────────────────────────────────────────────────

const ConfessionRequestApplyPage = ({ user }) => {
  const router = useRouter();

  const [cRForm, setcRForm] = useState({
    confession_person_name: "",
    preferred_confession_date_and_time: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!cRForm.confession_person_name.trim()) e.confession_person_name = "Child's name is required";
    if (!cRForm.preferred_confession_date_and_time) e.preferred_confession_date_and_time = "Preferred date & time is required";
    else if (new Date(cRForm.preferred_confession_date_and_time) <= new Date())
      e.preferred_confession_date_and_time = "Preferred date must be in the future";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await apiPost("/user/confession_request", { user, ...cRForm });
      if (res?.status === "success") {
        toast.success("Confession request sent to the priest for review. The priest will contact you shortly.");
      } else {
        throw new Error(res?.message);
      }
    } catch (err) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
      setcRForm({
        confession_person_name: "",
        preferred_confession_date_and_time: "",
      });
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
              Sacrament Request
            </div>
            <div className="text-white font-bold text-base tracking-[0.2px] leading-none">
              Confession Application
            </div>
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        <p className="text-sm text-muted mb-8 leading-relaxed">
          Fill in the details below to submit a Confession request. The priest will review your application
          and reach out to confirm the schedule.
        </p>

        <div className="bg-white rounded-xl border border-line shadow-sm shadow-ink/5 overflow-hidden">

          {/* Section: Confession person Details */}
          <div className="px-7 py-6 border-b border-soft">
            <div className="text-[11px] font-bold text-accent-ink tracking-[1.4px] uppercase mb-5">
              Confession Person's Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Confession Person's Name" error={errors.confession_person_name}>
                <input
                  value={cRForm.confession_person_name}
                  onChange={e => setcRForm(p => ({ ...p, confession_person_name: e.target.value }))}
                  placeholder="Enter confession person's full name"
                  className={inputCls(errors.confession_person_name)}
                />
              </Field>

              <Field label="Preferred Confession Date & Time" error={errors.preferred_confession_date_and_time}>
                <input
                  type="datetime-local"
                  value={cRForm.preferred_confession_date_and_time}
                  onChange={e => setcRForm(p => ({ ...p, preferred_confession_date_and_time: e.target.value }))}
                  className={inputCls(errors.preferred_confession_date_and_time) + " cursor-pointer"}
                />
              </Field>

            </div>
          </div>

          {/* Footer / Submit */}
          <div className="px-7 py-5 bg-background flex items-center justify-between gap-4">
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              By submitting, you agree to be contacted by the parish regarding this request.
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

export default ConfessionRequestApplyPage;