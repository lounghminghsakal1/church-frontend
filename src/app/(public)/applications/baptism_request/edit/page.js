"use client";
import Field from '@/components/common_components/FormField';


import LoginSignupModal from '@/components/common_components/LoginSignupModal';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiGet, apiPatch, apiPost } from '@/services/axios';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, X, Save, PlusCircle, MoreVertical, XCircle, Loader2 } from 'lucide-react';

// ── Shared primitives ────────────────────────────────────────────────

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



const SectionHeading = ({ children }) => (
  <div className="text-[11px] font-bold text-accent-ink tracking-[1.4px] uppercase mb-5">
    {children}
  </div>
);

const statusStyles = {
  pending:  { dot: 'bg-accent',  text: 'text-ink',  bg: 'bg-soft',  border: 'border-line',  label: 'Pending'  },
  approved: { dot: 'bg-accent', text: 'text-ink', bg: 'bg-soft', border: 'border-line', label: 'Approved' },
  rejected: { dot: 'bg-accent',    text: 'text-ink',    bg: 'bg-soft',    border: 'border-line',    label: 'Rejected' },
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

// ── Helpers ──────────────────────────────────────────────────────────

const formatDate     = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatDateTime = (v) => v ? new Date(v).toLocaleString('en-IN',  { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// strip to date-only string for <input type="date">
const toDateValue = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

// strip to datetime-local string for <input type="datetime-local">
const toDateTimeValue = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString().slice(0, 16);
};

// ── Card ─────────────────────────────────────────────────────────────

const BapReqCard = ({ bapReq, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cababMenuOpen, setCababMenuOpen] = useState(false);

  const canEdit   = bapReq.status === 'pending';
  const canCancel = bapReq.status === 'pending';

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

  const [bRform, setBRForm] = useState({
    father_name:                     bapReq.father_name                     ?? '',
    mother_name:                     bapReq.mother_name                     ?? '',
    child_name:                      bapReq.child_name                      ?? '',
    child_date_of_birth:             toDateValue(bapReq.child_date_of_birth),
    preferred_baptism_date_and_time: toDateTimeValue(bapReq.preferred_baptism_date_and_time),
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!bRform.father_name.trim())                e.father_name                     = "Father's name is required";
    if (!bRform.mother_name.trim())                e.mother_name                     = "Mother's name is required";
    if (!bRform.child_name.trim())                 e.child_name                      = "Child's name is required";
    if (!bRform.child_date_of_birth)               e.child_date_of_birth             = "Date of birth is required";
    else if (new Date(bRform.child_date_of_birth) >= new Date())
                                                   e.child_date_of_birth             = "Date of birth must be in the past";
    if (!bRform.preferred_baptism_date_and_time)   e.preferred_baptism_date_and_time = "Preferred date & time is required";
    else if (new Date(bRform.preferred_baptism_date_and_time) <= new Date())
                                                   e.preferred_baptism_date_and_time = "Preferred date must be in the future";
    return e;
  };

  const handleCancel = () => {
    setBRForm({
      father_name:                     bapReq.father_name                     ?? '',
      mother_name:                     bapReq.mother_name                     ?? '',
      child_name:                      bapReq.child_name                      ?? '',
      child_date_of_birth:             toDateValue(bapReq.child_date_of_birth),
      preferred_baptism_date_and_time: toDateTimeValue(bapReq.preferred_baptism_date_and_time),
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
      const res = await apiPatch(`/user/baptism_request/${bapReq._id}`, bRform);
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
      const res = await apiPost(`/user/baptism_request/${bapReq._id}/cancel`);
      if (res.status === 'success') {
        toast.success("Request cancelled successfully.");
        onUpdated?.();   // ← refreshes the list immediately
      } else {
        throw new Error(res?.message);
      }
    } catch (err) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setCancelling(false);
    }
  };

  const set = (key) => (e) => setBRForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="bg-white rounded-xl border border-line shadow-sm shadow-ink/5 overflow-hidden">

      {/* Card header */}
      <div className="px-7 py-4 bg-background border-b border-soft flex items-center justify-between gap-4">

        {/* Left: status + meta */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <StatusBadge status={bapReq.status} />
          <span className="text-xs text-muted shrink-0">
            Submitted {formatDate(bapReq.createdAt)}
          </span>
          {bapReq?.priest_response && (
            <span className="text-ink text-xs md:text-sm">
              <span className="font-semibold">Priest Response:</span> {bapReq.priest_response}
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Edit / Save / Cancel edit buttons */}
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-muted hover:text-ink bg-white hover:bg-background border border-line rounded-md px-3 py-1.5 text-xs font-semibold font-[inherit] transition-colors cursor-pointer"
            >
              <Pencil size={11} /> Edit
            </button>
          )}
          {isEditing && (
            <div className='flex flex-col sm:flex-row gap-2'>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-[inherit] border-none transition-colors cursor-pointer ${loading ? 'bg-accent text-white cursor-not-allowed' : 'bg-accent hover:bg-accent text-ink'}`}
              >
                {loading ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 text-muted hover:text-ink bg-white hover:bg-background border border-line rounded-md px-3 py-1.5 text-xs font-semibold font-[inherit] transition-colors cursor-pointer"
              >
                <X size={11} /> Cancel
              </button>
            </div>
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

              {/* Dropdown */}
              {cababMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-44 bg-white border border-line rounded-xl shadow-lg overflow-hidden">
                  {/* Arrow */}
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

      {/* Parent details */}
      <div className="px-7 py-6 border-b border-soft">
        <SectionHeading>Parent Details</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Father's Name" error={errors.father_name}>
            {isEditing
              ? <input value={bRform.father_name} onChange={set('father_name')} placeholder="Enter father's full name" className={inputCls(errors.father_name)} />
              : <span className="text-sm text-ink font-medium">{bapReq.father_name}</span>
            }
          </Field>
          <Field label="Mother's Name" error={errors.mother_name}>
            {isEditing
              ? <input value={bRform.mother_name} onChange={set('mother_name')} placeholder="Enter mother's full name" className={inputCls(errors.mother_name)} />
              : <span className="text-sm text-ink font-medium">{bapReq.mother_name}</span>
            }
          </Field>
        </div>
      </div>

      {/* Child details */}
      <div className="px-7 py-6">
        <SectionHeading>Child Details</SectionHeading>
        <div className="flex flex-col gap-5">
          <Field label="Child's Name" error={errors.child_name}>
            {isEditing
              ? <input value={bRform.child_name} onChange={set('child_name')} placeholder="Enter child's full name" className={inputCls(errors.child_name)} />
              : <span className="text-sm text-ink font-medium">{bapReq.child_name}</span>
            }
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Date of Birth" error={errors.child_date_of_birth}>
              {isEditing
                ? <input type="date" value={bRform.child_date_of_birth} onChange={set('child_date_of_birth')} className={inputCls(errors.child_date_of_birth) + ' cursor-pointer'} />
                : <span className="text-sm text-ink font-medium">{formatDate(bapReq.child_date_of_birth)}</span>
              }
            </Field>
            <Field label="Preferred Baptism Date & Time" error={errors.preferred_baptism_date_and_time}>
              {isEditing
                ? <input type="datetime-local" value={bRform.preferred_baptism_date_and_time} onChange={set('preferred_baptism_date_and_time')} className={inputCls(errors.preferred_baptism_date_and_time) + ' cursor-pointer'} />
                : <span className="text-sm text-ink font-medium">{formatDateTime(bapReq.preferred_baptism_date_and_time)}</span>
              }
            </Field>
          </div>
        </div>
      </div>

    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────

const BaptismRequestEditPage = () => {
  const router = useRouter();
  const { user } = useAuthUser();
  const [allBaptismRequests, setAllBaptismRequests] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchExistingBaptismRequests = async () => {
    try {
      const res = await apiGet("/user/baptism_request");
      if (res.status === "success") setAllBaptismRequests(res.data);
    } catch (err) {
      toast.error("Failed to load baptism requests. "+err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchExistingBaptismRequests(); }, []);

  // if (!user) return <LoginSignupModal />;

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
              Baptism Requests
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {fetching ? (
          <div className="text-sm text-muted py-16 text-center">Loading…</div>

        ) : allBaptismRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-line shadow-sm shadow-ink/5 px-8 py-14 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-background border border-line flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <rect x="7" y="1" width="2" height="14" rx="1" fill="var(--color-accent)"/>
                <rect x="2" y="5" width="12" height="2" rx="1" fill="var(--color-accent)"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink mb-1">No baptism requests yet</p>
              <p className="text-xs text-muted">Submit a new request to get started.</p>
            </div>
            <button
              onClick={() => router.push("/applications/baptism_request/apply")}
              className="mt-2 flex items-center gap-2 bg-accent hover:bg-accent text-ink font-bold text-xs uppercase tracking-[0.8px] px-5 py-2.5 rounded-[7px] transition-colors cursor-pointer border-none font-[inherit]"
            >
              <PlusCircle size={13} />
              Create Request
            </button>
          </div>

        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted leading-relaxed">
                {allBaptismRequests.length} request{allBaptismRequests.length > 1 ? 's' : ''} found. Pending requests can be edited.
              </p>
              <button
                onClick={() => router.push("/applications/baptism_request/apply")}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent text-ink font-bold text-xs uppercase tracking-[0.8px] px-4 py-2 rounded-[7px] transition-colors cursor-pointer border-none font-[inherit]"
              >
                <PlusCircle size={12} />
                New Request
              </button>
            </div>
            {allBaptismRequests.map(bapReq => (
              <BapReqCard
                key={bapReq._id}
                bapReq={bapReq}
                onUpdated={fetchExistingBaptismRequests}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default BaptismRequestEditPage;