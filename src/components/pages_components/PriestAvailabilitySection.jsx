"use client";
import { apiGet } from '@/services/axios';
import { useEffect, useState } from 'react';
import PriestAvailabilityCard from './PriestAvailabilityCard';

export default function PriestAvailabilitySection({ onRequestMeeting }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    let active = true;
    apiGet(`/priest_availability/${process.env.NEXT_PUBLIC_MAIN_PRIEST_ID}`)
      .then(response => {
        if (response?.status === 'failure') throw new Error(response.message);
        if (active) { setData(response.data); setError(false); }
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  return <PriestAvailabilityCard data={data} loading={loading} error={error} now={now} onRetry={() => { setLoading(true); setRetry(value => value + 1); }} onRequestMeeting={onRequestMeeting} />;
}

export const formatDateTime = dateString => {
  if (!dateString || Number.isNaN(new Date(dateString).getTime())) return 'Time to be confirmed';
  return new Date(dateString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};
