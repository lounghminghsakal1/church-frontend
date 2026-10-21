'use client';
import { inputClasses, buttonClassName } from '@/components/ui/styles';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiPost } from '@/services/axios';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useId } from 'react';
import { Church, X, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const PRAYER_GROUPS = ['St.Antony prayer group', 'St.Mary prayer group', 'Vellai mariyal prayer group'];

function getLoginErrors(form) {
  const errors = {};
  if (!form.user_email.trim()) errors.user_email = 'Enter your email address';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.user_email)) errors.user_email = 'Enter a valid email address';
  if (!form.user_password) errors.user_password = 'Enter your password';
  return errors;
}

function getSignupErrors(form) {
  const errors = getLoginErrors(form);
  if (!form.user_name.trim()) errors.user_name = 'Enter your name';
  if (form.user_password && form.user_password.length < 6) errors.user_password = 'Use at least 6 characters';
  if (!form.confirm_user_password) errors.confirm_user_password = 'Confirm your password';
  else if (form.user_password !== form.confirm_user_password) errors.confirm_user_password = 'Passwords must match';
  if (!/^\d{10}$/.test(form.user_mobile_number)) errors.user_mobile_number = 'Enter a 10-digit mobile number';
  if (!form.prayer_group) errors.prayer_group = 'Choose your prayer group';
  return errors;
}

function Field({ label, type = 'text', value, onChange, error, placeholder, autoComplete, children }) {
  const [show, setShow] = useState(false);
  const id = useId();
  const password = type === 'password';
  const inputProps = { id, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined };
  return (
    <div className="flex min-w-0 flex-col gap-2 [&>label]:text-sm [&>label]:font-semibold [&>label]:text-muted">
      <label htmlFor={id}>{label}</label>
      {children ? React.cloneElement(children, { ...inputProps, className: inputClasses }) : <div className="relative"><input {...inputProps} type={password && show ? 'text' : type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} inputMode={type === 'tel' ? 'numeric' : type === 'email' ? 'email' : undefined} className={`${inputClasses} ${password ? "pr-14" : ''}`} />{password && <button type="button" className="absolute top-1 right-1 grid size-11 place-items-center rounded-lg text-muted hover:bg-soft hover:text-ink" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</button>}</div>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-ink">{error}</p>}
    </div>
  );
}

export default function LoginSignupModal({ onSuccess, onCancel, onSuccessGoToLink }) {
  useBodyScrollLock();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [loginForm, setLoginForm] = useState({ user_email: '', user_password: '' });
  const [signupForm, setSignupForm] = useState({ user_name: '', user_email: '', user_password: '', confirm_user_password: '', user_mobile_number: '', prayer_group: '' });
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const { setUser } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    const close = event => { if (event.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [onCancel]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const focusTarget = window.matchMedia('(min-width: 701px)').matches ? dialogRef.current?.querySelector('input') : dialogRef.current?.querySelector('.auth-close');
    focusTarget?.focus({ preventScroll: true });
    const trapFocus = event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled), input, select, a[href]')].filter(element => element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', trapFocus);
    return () => { document.removeEventListener('keydown', trapFocus); previousFocus?.focus({ preventScroll: true }); };
  }, []);

  function switchMode(next) {
    setMode(next);
    setLoginErrors({});
    setSignupErrors({});
    setRequestError('');
  }

  const handleLogin = async () => {
    if (loading) return;
    const errors = getLoginErrors(loginForm);
    if (Object.keys(errors).length) { setLoginErrors(errors); return; }
    setLoginErrors({});
    setRequestError('');
    setLoading(true);
    try {
      const response = await apiPost('/auth/user/login', loginForm);
      if (response.status !== 'success') throw new Error(response.message ?? 'Unable to sign in. Please try again.');
      setUser(response.data);
      toast.success('Welcome back to your parish.');
      onSuccess?.();
      if (onSuccessGoToLink) router.push(onSuccessGoToLink);
    } catch (error) {
      setRequestError(error.response?.data?.message ?? error.message ?? 'Unable to sign in. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (loading) return;
    const errors = getSignupErrors(signupForm);
    if (Object.keys(errors).length) { setSignupErrors(errors); return; }
    setSignupErrors({});
    setRequestError('');
    setLoading(true);
    try {
      const signupPayload = {...signupForm};
      delete signupPayload.confirm_user_password; 
      const response = await apiPost('/auth/user/signup', signupPayload);
      if (response.status !== 'success') throw new Error(response.message ?? response.data?.message ?? 'Unable to create your account. Please try again.');
      toast.success('Account created! Sign in to continue.');
      switchMode('login');
      setLoginForm({ user_email: response.data?.user_email ?? signupForm.user_email, user_password: '' });
    } catch (error) {
      setRequestError(error.response?.data?.message ?? error.message ?? 'Unable to create your account. Please try again.');
    } finally { setLoading(false); }
  };

  const signingUp = mode === 'signup';
  return (
    <div ref={overlayRef} onClick={event => { if (event.target === overlayRef.current) onCancel?.(); }} className="fixed inset-0 z-[9999] flex items-end justify-center bg-ink/50 pt-3 backdrop-blur-sm md:items-center md:p-6">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className={`relative max-h-[calc(100dvh-12px)] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-white px-6 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] shadow-2xl md:max-h-[calc(100dvh-48px)] md:rounded-2xl md:p-9 ${signingUp ? 'md:max-w-xl' : 'md:max-w-lg'}`}>
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
        <button type="button" onClick={onCancel} aria-label="Close sign-in dialog" className="absolute top-4 right-4 grid size-11 place-items-center rounded-xl bg-soft text-muted transition-colors hover:bg-soft hover:text-ink"><X size={21} /></button>
        <div className="pt-1 text-center [&>h2]:font-serif [&>h2]:text-3xl [&>h2]:tracking-tight [&>p:last-child]:mx-auto [&>p:last-child]:mt-3 [&>p:last-child]:max-w-sm [&>p:last-child]:text-sm [&>p:last-child]:leading-7 [&>p:last-child]:text-muted"><span className="mx-auto mb-4 grid h-14 w-12 place-items-center rounded-t-3xl rounded-b-xl border border-accent/30 bg-accent/10 text-accent-ink"><Church size={27} strokeWidth={1.3} /></span><p className="mb-3 text-[9px] font-semibold tracking-widest text-accent-ink">ST. ANTONY’S CHURCH · ILLUPPUR</p><h2 id={titleId}>{signingUp ? 'A place for you.' : 'Welcome to your parish.'}</h2><p id={descriptionId}>{signingUp ? 'Create your account to connect with your parish family.' : 'Sign in to request sacraments, share intentions, and stay connected.'}</p></div>
        <div className="my-6 flex gap-1 rounded-xl border border-ink/5 bg-soft p-1 [&>button]:min-h-11 [&>button]:flex-1 [&>button]:rounded-lg [&>button]:text-sm [&>button]:font-semibold [&>button]:text-muted [&>button[aria-pressed=true]]:bg-white [&>button[aria-pressed=true]]:text-ink [&>button[aria-pressed=true]]:shadow-sm" role="group" aria-label="Choose sign in or create account"><button type="button" aria-pressed={!signingUp} onClick={() => switchMode('login')} disabled={loading}>Sign in</button><button type="button" aria-pressed={signingUp} onClick={() => switchMode('signup')} disabled={loading}>Create account</button></div>
        <form className="flex flex-col gap-5" noValidate aria-busy={loading} onSubmit={event => { event.preventDefault(); signingUp ? handleSignup() : handleLogin(); }}>
          {requestError && <p data-testid="request-error" className="mb-5 rounded-xl border border-line bg-soft p-4 text-sm text-ink" role="alert">{requestError}</p>}
          {signingUp ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="col-span-full"><Field label="Your name" value={signupForm.user_name} onChange={event => setSignupForm(form => ({ ...form, user_name: event.target.value }))} error={signupErrors.user_name} placeholder="Your full name" autoComplete="name" /></div>
            <Field label="Email address" type="email" value={signupForm.user_email} onChange={event => setSignupForm(form => ({ ...form, user_email: event.target.value }))} error={signupErrors.user_email} placeholder="you@example.com" autoComplete="email" />
            <Field label="Mobile number" type="tel" value={signupForm.user_mobile_number} onChange={event => setSignupForm(form => ({ ...form, user_mobile_number: event.target.value.replace(/\D/g, '').slice(0, 10) }))} error={signupErrors.user_mobile_number} placeholder="10-digit mobile number" autoComplete="tel-national" />
            <Field label="Password" type="password" value={signupForm.user_password} onChange={event => setSignupForm(form => ({ ...form, user_password: event.target.value }))} error={signupErrors.user_password} placeholder="At least 6 characters" autoComplete="new-password" />
            <Field label="Confirm password" type="password" value={signupForm.confirm_user_password} onChange={event => setSignupForm(form => ({ ...form, confirm_user_password: event.target.value }))} error={signupErrors.confirm_user_password} placeholder="Repeat your password" autoComplete="new-password" />
            <div className="col-span-full"><Field label="Prayer group" error={signupErrors.prayer_group}><select value={signupForm.prayer_group} onChange={event => setSignupForm(form => ({ ...form, prayer_group: event.target.value }))}><option value="">Choose your prayer group</option>{PRAYER_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}</select></Field></div>
          </div> : <div className="flex flex-col gap-4"><Field label="Email address" type="email" value={loginForm.user_email} onChange={event => setLoginForm(form => ({ ...form, user_email: event.target.value }))} error={loginErrors.user_email} placeholder="you@example.com" autoComplete="email" /><Field label="Password" type="password" value={loginForm.user_password} onChange={event => setLoginForm(form => ({ ...form, user_password: event.target.value }))} error={loginErrors.user_password} placeholder="Enter your password" autoComplete="current-password" /></div>}
          <button type="submit" disabled={loading} className={buttonClassName("primary", "w-full")}>{loading ? <><Loader2 size={18} className="animate-spin" />{signingUp ? 'Creating your account…' : 'Signing you in…'}</> : <>{signingUp ? 'Create my parish account' : 'Sign in to my parish'}<ArrowRight size={18} /></>}</button>
        </form>
        <div className="mt-5 text-center [&>p]:text-xs [&>p]:text-muted [&_button]:min-h-11 [&_button]:px-1 [&_button]:font-semibold [&_button]:text-ink [&_button]:underline [&_button]:underline-offset-4 [&>span]:mt-3 [&>span]:flex [&>span]:items-center [&>span]:justify-center [&>span]:gap-1.5 [&>span]:border-t [&>span]:border-ink/10 [&>span]:pt-4 [&>span]:text-xs [&>span]:text-muted"><p>{signingUp ? 'Already part of our parish online?' : 'New to our parish online?'} <button type="button" disabled={loading} onClick={() => switchMode(signingUp ? 'login' : 'signup')}>{signingUp ? 'Sign in' : 'Join us'}</button></p><span><ShieldCheck size={14} /> Your parish account, in one place.</span></div>
      </div>
    </div>
  );
}
