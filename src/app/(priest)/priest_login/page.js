import { Church } from 'lucide-react';
import PriestLoginForm from './_components/PriestLoginForm';

export default function PriestLoginPage() {
  return <div className="priest-login-card"><span className="priest-login-icon"><Church size={28} strokeWidth={1.3} /></span><p className="eyebrow">PRIEST PORTAL</p><h2>Welcome back, Father.</h2><p className="priest-login-intro">Sign in to manage your availability and care for your parish community.</p><PriestLoginForm /><p className="priest-login-footnote">Your dedicated space for parish administration.</p></div>;
}
