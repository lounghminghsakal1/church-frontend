"use client";
import DateTimePicker from '@/components/ui/DateTimePicker';
import { inputClassName } from '@/components/ui/styles';
import Field from '@/components/common_components/FormField';


import { useAuthUser } from '@/hooks/useAuthUser';
import { apiGet, apiPatch, apiPost } from '@/services/axios';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, X, Save, PlusCircle, Loader2, XCircle, MoreVertical } from 'lucide-react';

// ── Shared primitives ────────────────────────────────────────────────

const Label = ({ children }) => (
  <label className="text-[11px] font-semibold text-muted tracking-wider uppercase">
    {children}
  </label>
);

const inputCls = inputClassName;



const SectionHeading = ({ children }) => (
  <div className="text-[11px] font-bold text-accent-ink tracking-[1.4px] uppercase mb-5">
    {children}
  </div>
);

const statusStyles = {
  pending:  { dot: 'bg-accent',   text: 'text-ink',   bg: 'bg-soft',   border: 'border-line',   label: 'Pending'  },
  approved: { dot: 'bg-accent', text: 'text-ink', bg: 'bg-soft', border: 'border-line', label: 'Approved' },
  rejected: { dot: 'bg-accent',     text: 'text-ink',     bg: 'bg-soft',     border: 'border-line',     label: 'Rejected' },
  cancelled: { dot: 'bg-ink',    text: 'text-ink',    bg: 'bg-soft',    border: 'border-line',    label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const s = statusStyles[status] ?? statusStyles.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const UrgentBadge = ({ urgent }) => {
  if (!urgent) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-soft text-ink border-line">
      <span className="w-1.5 h-1.5 rounded-full bg-ink" />
      Urgent
    </span>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────

const formatDate     = (v) => v ? new Date(v).toLocaleDateString('en-IN',  { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatDateTime = (v) => v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const toDateTimeValue = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString().slice(0, 16);
};

// ── Card ─────────────────────────────────────────────────────────────

const AnointingOfTheSickReqCard = ({ aosReq, onUpdated }) => {
  const [isEditing,    setIsEditing]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [cancelling,   setCancelling]   = useState(false);
  const [cababMenuOpen, setCababMenuOpen] = useState(false);

  const canEdit   = aosReq.status === 'pending';
  const canCancel = aosReq.status === 'pending';

  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!cababMenuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setCababMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cababMenuOpen]);

  const [form, setForm] = useState({
    patient_name:                   aosReq.patient_name                   ?? '',
    patient_condition:              aosReq.patient_condition              ?? '',
    patient_address:                aosReq.patient_address                ?? '',
    contact_number:                 aosReq.contact_number                 ?? '',
    is_urgent:                      aosReq.is_urgent                      ?? false,
    relationship_to_patient:        aosReq.relationship_to_patient        ?? '',
    preferred_visit_date_and_time:  toDateTimeValue(aosReq.preferred_visit_date_and_time),
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.patient_name.trim())      e.patient_name      = "Patient's name is required";
    if (!form.patient_condition.trim()) e.patient_condition = "Patient's condition is required";
    if (!form.patient_address.trim())   e.patient_address   = "Patient's address is required";

    if (!form.contact_number.trim()) e.contact_number = "Contact number is required";
    else if (!/^\d{10}$/.test(form.contact_number.trim()))
      e.contact_number = "Enter a valid 10-digit contact number";

    if (form.preferred_visit_date_and_time && new Date(form.preferred_visit_date_and_time) <= new Date())
      e.preferred_visit_date_and_time = "Preferred date must be in the future";

    return e;
  };

  const handleCancel = () => {
    setForm({
      patient_name:                   aosReq.patient_name                   ?? '',
      patient_condition:              aosReq.patient_condition              ?? '',
      patient_address:                aosReq.patient_address                ?? '',
      contact_number:                 aosReq.contact_number                 ?? '',
      is_urgent:                      aosReq.is_urgent                      ?? false,
      relationship_to_patient:        aosReq.relationship_to_patient        ?? '',
      preferred_visit_date_and_time:  toDateTimeValue(aosReq.preferred_visit_date_and_time),
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await apiPatch(`/user/aos_request/${aosReq._id}`, form);
      if (res.status === 'success') {
        toast.success("Request updated successfully.");
        setIsEditing(false);
        onUpdated?.();
      } else {
        throw new Error(res?.message);
      }
    } catch (err) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setCababMenuOpen(false);
    setCancelling(true);
    try {
      const res = await apiPost(`/user/aos_request/${aosReq._id}/cancel`);
      if (res.status === 'success') {
        toast.success("Request cancelled successfully.");
        onUpdated?.();
      } else {
        throw new Error(res?.message);
      }
    } catch (err) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setCancelling(false);
    }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));
  const setContact = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value.replace(/\D/g, '').slice(0, 10) }));

  return (
    <div className="bg-white rounded-xl border border-line shadow-sm shadow-ink/5 overflow-hidden">

      {/* Card header */}
      <div className="px-5 py-4 sm:px-7 bg-background border-b border-soft flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">

        {/* Left: status + meta */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <StatusBadge status={aosReq.status} />
          <UrgentBadge urgent={isEditing ? form.is_urgent : aosReq.is_urgent} />
          <span className="text-xs text-muted shrink-0">
            Submitted {formatDate(aosReq.createdAt)}
          </span>
          {aosReq?.priest_response && (
            <span className="text-ink text-xs md:text-sm">
              <span className="font-semibold">Priest Response:</span> {aosReq.priest_response}
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">

          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-muted hover:text-ink bg-white hover:bg-background border border-line rounded-md px-3 py-1.5 text-xs font-semibold font-[inherit] transition-colors cursor-pointer"
            >
              <Pencil size={11} /> Edit
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 text-muted hover:text-ink bg-white hover:bg-background border border-line rounded-md px-3 py-1.5 text-xs font-semibold font-[inherit] transition-colors cursor-pointer"
              >
                <X size={11} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-[inherit] border-none transition-colors cursor-pointer ${loading ? 'bg-accent text-white cursor-not-allowed' : 'bg-accent hover:bg-accent text-ink'}`}
              >
                {loading ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          )}

          {/* Kebab menu */}
          {canCancel && !isEditing && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setCababMenuOpen(prev => !prev)}
                disabled={cancelling}
                className={`w-7 h-7 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${cababMenuOpen
                    ? 'bg-ink border-ink text-white'
                    : 'bg-white border-line text-muted hover:text-ink hover:bg-background'} disabled:opacity-40`}
              >
                {cancelling
                  ? <Loader2 size={13} className="animate-spin" />
                  : <MoreVertical size={13} />}
              </button>

              {cababMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-44 bg-white border border-line rounded-xl shadow-lg overflow-hidden">
                  <div className="absolute -top-1.5 right-2.5 w-3 h-3 bg-white border-l border-t border-line rotate-45" />
                  <div className="py-1">
                    <button
                      onClick={handleCancelRequest}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-ink hover:bg-soft transition-colors cursor-pointer font-[inherit]"
                    >
                      <XCircle size={13} className="shrink-0" />
                      Cancel request
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Patient details */}
      <div className="px-5 py-6 sm:px-7 border-b border-soft">
        <SectionHeading>Patient Details</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Patient's Name" error={errors.patient_name}>
            {isEditing
              ? <input value={form.patient_name} onChange={set('patient_name')} placeholder="Enter patient's full name" className={inputCls(errors.patient_name)} />
              : <span className="text-sm text-ink font-medium">{aosReq.patient_name || '—'}</span>
            }
          </Field>
          <Field label="Relationship to Patient" error={errors.relationship_to_patient}>
            {isEditing
              ? <input value={form.relationship_to_patient} onChange={set('relationship_to_patient')} placeholder="e.g. Son, Daughter, Spouse" className={inputCls(errors.relationship_to_patient)} />
              : <span className="text-sm text-ink font-medium">{aosReq.relationship_to_patient || '—'}</span>
            }
          </Field>
          <Field label="Patient's Condition" error={errors.patient_condition}>
            {isEditing
              ? <input value={form.patient_condition} onChange={set('patient_condition')} placeholder="Briefly describe the condition" className={inputCls(errors.patient_condition)} />
              : <span className="text-sm text-ink font-medium">{aosReq.patient_condition || '—'}</span>
            }
          </Field>
          <Field label="Contact Number" error={errors.contact_number}>
            {isEditing
              ? <input value={form.contact_number} onChange={setContact('contact_number')} placeholder="Enter contact number" inputMode="numeric" className={inputCls(errors.contact_number)} />
              : <span className="text-sm text-ink font-medium">{aosReq.contact_number || '—'}</span>
            }
          </Field>
          <div className="sm:col-span-2">
            <Field label="Patient's Address" error={errors.patient_address}>
              {isEditing
                ? <input value={form.patient_address} onChange={set('patient_address')} placeholder="Enter the patient's full address" className={inputCls(errors.patient_address)} />
                : <span className="text-sm text-ink font-medium">{aosReq.patient_address || '—'}</span>
              }
            </Field>
          </div>
        </div>
      </div>

      {/* Visit details */}
      <div className="px-5 py-6 sm:px-7">
        <SectionHeading>Visit Details</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 items-start">
          <Field label="Preferred Visit Date & Time (optional)" error={errors.preferred_visit_date_and_time}>
            {isEditing
              ? <DateTimePicker type="datetime-local" value={form.preferred_visit_date_and_time} onChange={set('preferred_visit_date_and_time')} className={inputCls(errors.preferred_visit_date_and_time) + ' cursor-pointer'} />
              : <span className="text-sm text-ink font-medium">{formatDateTime(aosReq.preferred_visit_date_and_time)}</span>
            }
          </Field>

          <div className="flex flex-col gap-1.5">
            <Label>Is this urgent?</Label>
            {isEditing ? (
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, is_urgent: !p.is_urgent }))}
                className="flex items-center gap-3 cursor-pointer select-none mt-1"
              >
                <span
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${form.is_urgent ? 'bg-accent' : 'bg-line/60'}`}
                >
                  <span
                    className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-200 ${form.is_urgent ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </span>
                <span className={`text-sm font-semibold ${form.is_urgent ? 'text-ink' : 'text-muted'}`}>
                  {form.is_urgent ? 'Yes, urgent' : 'No, not urgent'}
                </span>
              </button>
            ) : (
              <span className="text-sm text-ink font-medium mt-1">
                {aosReq.is_urgent ? 'Yes, urgent' : 'No, not urgent'}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────

const AnointingOfTheSickRequestEditPage = () => {
  const router = useRouter();
  const { user } = useAuthUser();
  const [allAosRequests, setAllAosRequests] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchAosRequests = async () => {
    try {
      const res = await apiGet("/user/aos_request");
      if (res.status === "success") setAllAosRequests(res.data);
      else throw new Error(res?.message);
    } catch (err) {
      toast.error(err.message ?? "Failed to load anointing of the sick requests.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchAosRequests(); }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Page header */}
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
              Anointing of the Sick Requests
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {fetching ? (
          <div className="text-sm text-muted py-16 text-center">Loading…</div>

        ) : allAosRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-line shadow-sm shadow-ink/5 px-8 py-14 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-background border border-line flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <rect x="7" y="1" width="2" height="14" rx="1" fill="var(--color-accent)"/>
                <rect x="2" y="5" width="12" height="2" rx="1" fill="var(--color-accent)"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink mb-1">No anointing of the sick requests yet</p>
              <p className="text-xs text-muted">Submit a new request to get started.</p>
            </div>
            <button
              onClick={() => router.push("/applications/anointing_of_the_sick_request/apply")}
              className="mt-2 flex items-center gap-2 bg-accent hover:bg-accent text-ink font-bold text-xs uppercase tracking-[0.8px] px-5 py-2.5 rounded-[7px] transition-colors cursor-pointer border-none font-[inherit]"
            >
              <PlusCircle size={13} />
              Create Request
            </button>
          </div>

        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-stretch justify-between gap-3 mb-1 sm:flex-row sm:items-center">
              <p className="text-sm text-muted leading-relaxed">
                {allAosRequests.length} request{allAosRequests.length > 1 ? 's' : ''} found. Pending requests can be edited.
              </p>
              <button
                onClick={() => router.push("/applications/anointing_of_the_sick_request/apply")}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent text-ink font-bold text-xs uppercase tracking-[0.8px] px-4 py-2 rounded-[7px] transition-colors cursor-pointer border-none font-[inherit]"
              >
                <PlusCircle size={12} />
                New Request
              </button>
            </div>
            {allAosRequests.map(aosReq => (
              <AnointingOfTheSickReqCard
                key={aosReq._id}
                aosReq={aosReq}
                onUpdated={fetchAosRequests}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AnointingOfTheSickRequestEditPage;
