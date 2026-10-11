"use client";
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
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      {children ? React.cloneElement(children, { ...inputProps, className: 'auth-input' }) : <div className="auth-input-wrap"><input {...inputProps} type={password && show ? 'text' : type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} inputMode={type === 'tel' ? 'numeric' : type === 'email' ? 'email' : undefined} className={`auth-input ${password ? 'has-password-toggle' : ''}`} />{password && <button type="button" className="auth-password-toggle" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</button>}</div>}
      {error && <p id={`${id}-error`} role="alert" className="auth-field-error">{error}</p>}
    </div>
  );
}

export default function LoginSignupModal({ onSuccess, onCancel, onSuccessGoToLink }) {
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
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
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
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', trapFocus); previousFocus?.focus({ preventScroll: true }); };
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
      const response = await apiPost('/auth/user/signup', signupForm);
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
    <div ref={overlayRef} onClick={event => { if (event.target === overlayRef.current) onCancel?.(); }} className="auth-overlay">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className={`auth-dialog ${signingUp ? 'auth-signup' : ''}`}>
        <div className="auth-sheet-handle" aria-hidden="true" />
        <button type="button" onClick={onCancel} aria-label="Close sign-in dialog" className="auth-close"><X size={21} /></button>
        <div className="auth-heading"><span className="auth-brand-mark"><Church size={27} strokeWidth={1.3} /></span><p className="auth-parish">ST. ANTONY’S CHURCH · ILLUPPUR</p><h2 id={titleId}>{signingUp ? 'A place for you.' : 'Welcome to your parish.'}</h2><p id={descriptionId}>{signingUp ? 'Create your account to connect with your parish family.' : 'Sign in to request sacraments, share intentions, and stay connected.'}</p></div>
        <div className="auth-mode-switch" role="group" aria-label="Choose sign in or create account"><button type="button" aria-pressed={!signingUp} onClick={() => switchMode('login')} disabled={loading}>Sign in</button><button type="button" aria-pressed={signingUp} onClick={() => switchMode('signup')} disabled={loading}>Create account</button></div>
        <form className="auth-form" noValidate aria-busy={loading} onSubmit={event => { event.preventDefault(); signingUp ? handleSignup() : handleLogin(); }}>
          {requestError && <p className="auth-request-error" role="alert">{requestError}</p>}
          {signingUp ? <div className="auth-signup-fields">
            <div className="auth-full-width"><Field label="Your name" value={signupForm.user_name} onChange={event => setSignupForm(form => ({ ...form, user_name: event.target.value }))} error={signupErrors.user_name} placeholder="Your full name" autoComplete="name" /></div>
            <Field label="Email address" type="email" value={signupForm.user_email} onChange={event => setSignupForm(form => ({ ...form, user_email: event.target.value }))} error={signupErrors.user_email} placeholder="you@example.com" autoComplete="email" />
            <Field label="Mobile number" type="tel" value={signupForm.user_mobile_number} onChange={event => setSignupForm(form => ({ ...form, user_mobile_number: event.target.value.replace(/\D/g, '').slice(0, 10) }))} error={signupErrors.user_mobile_number} placeholder="10-digit mobile number" autoComplete="tel-national" />
            <Field label="Password" type="password" value={signupForm.user_password} onChange={event => setSignupForm(form => ({ ...form, user_password: event.target.value }))} error={signupErrors.user_password} placeholder="At least 6 characters" autoComplete="new-password" />
            <Field label="Confirm password" type="password" value={signupForm.confirm_user_password} onChange={event => setSignupForm(form => ({ ...form, confirm_user_password: event.target.value }))} error={signupErrors.confirm_user_password} placeholder="Repeat your password" autoComplete="new-password" />
            <div className="auth-full-width"><Field label="Prayer group" error={signupErrors.prayer_group}><select value={signupForm.prayer_group} onChange={event => setSignupForm(form => ({ ...form, prayer_group: event.target.value }))}><option value="">Choose your prayer group</option>{PRAYER_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}</select></Field></div>
          </div> : <div className="auth-login-fields"><Field label="Email address" type="email" value={loginForm.user_email} onChange={event => setLoginForm(form => ({ ...form, user_email: event.target.value }))} error={loginErrors.user_email} placeholder="you@example.com" autoComplete="email" /><Field label="Password" type="password" value={loginForm.user_password} onChange={event => setLoginForm(form => ({ ...form, user_password: event.target.value }))} error={loginErrors.user_password} placeholder="Enter your password" autoComplete="current-password" /></div>}
          <button type="submit" disabled={loading} className="auth-submit">{loading ? <><Loader2 size={18} className="animate-spin" />{signingUp ? 'Creating your account…' : 'Signing you in…'}</> : <>{signingUp ? 'Create my parish account' : 'Sign in to my parish'}<ArrowRight size={18} /></>}</button>
        </form>
        <div className="auth-footer"><p>{signingUp ? 'Already part of our parish online?' : 'New to our parish online?'} <button type="button" disabled={loading} onClick={() => switchMode(signingUp ? 'login' : 'signup')}>{signingUp ? 'Sign in' : 'Join us'}</button></p><span><ShieldCheck size={14} /> Your parish account, in one place.</span></div>
      </div>
    </div>
  );
}
