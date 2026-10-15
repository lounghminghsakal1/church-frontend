'use client';
import { inputClasses, buttonClassName } from '@/components/ui/styles';
import { useAuthPriest } from '@/hooks/useAuthPriest';
import { apiPost } from '@/services/axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import Field from '@/components/common_components/FormField';

export default function PriestLoginForm() {
  const [loginForm, setLoginForm] = useState({ priest_email: 'eugine@gmail.com', priest_password: 'Eugine@123' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setLoggedInPriest } = useAuthPriest();
  const change = field => event => {
    setLoginForm(form => ({ ...form, [field]: event.target.value }));
    setErrors(previous => ({ ...previous, [field]: '' }));
    setServerError('');
  };
  const submit = async event => {
    event.preventDefault();
    if (loading) return;
    const validation = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.priest_email)) validation.priest_email = 'Enter a valid email address.';
    if (!loginForm.priest_password) validation.priest_password = 'Enter your password.';
    else if (loginForm.priest_password.length < 6) validation.priest_password = 'Use at least 6 characters.';
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setServerError('');
    setLoading(true);
    try {
      const response = await apiPost('/auth/priest', loginForm);
      if (response?.status !== 'success') throw new Error(response?.message || 'Unable to sign in. Please try again.');
      setLoggedInPriest(response.data);
      toast.success('Welcome back, Father.');
      router.push('/priest_dashboard');
    } catch (error) { setServerError(error.message || 'Unable to sign in. Please try again.'); }
    finally { setLoading(false); }
  };
  return <form className="mt-7 flex flex-col gap-5" noValidate onSubmit={submit} aria-busy={loading}>
    {serverError && <p data-testid="request-error" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{serverError}</p>}
    <Field label="Priest email address" error={errors.priest_email}><input className={inputClasses} type="email" value={loginForm.priest_email} onChange={change('priest_email')} autoComplete="username" inputMode="email" placeholder="priest@church.org" /></Field>
    <div className="relative"><Field label="Password" error={errors.priest_password}><input className={`${inputClasses} pr-14`} type={showPassword ? 'text' : 'password'} value={loginForm.priest_password} onChange={change('priest_password')} autoComplete="current-password" placeholder="Enter your password" /></Field><button type="button" className="absolute right-1 bottom-1 grid size-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-navy" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
    <button type="submit" className={buttonClassName("primary", "w-full")} disabled={loading}>{loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : <>Enter priest portal <ArrowRight size={18} /></>}</button>
  </form>;
}
