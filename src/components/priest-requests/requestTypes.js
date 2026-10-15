import { Droplets, Cross, HeartHandshake, Heart, BookOpen, HeartPulse, Church, Users } from 'lucide-react';

export const REQUEST_TYPES = [
  { id: 'baptism_requests', title: 'Baptism', description: 'Welcome children into the Church.', icon: Droplets, endpoint: '/priest/baptism_requests', nameKey: 'child_name', dateKey: 'preferred_baptism_date_and_time', dateLabel: 'Preferred baptism' },
  { id: 'eucharist_requests', title: 'Holy Eucharist', description: 'Prepare for First Holy Communion.', icon: Cross, endpoint: '/priest/eucharist_requests', nameKey: 'eucharist_person_name', dateKey: 'preferred_eucharist_date_and_time', dateLabel: 'Preferred Eucharist', familyCard: true },
  { id: 'confession_requests', title: 'Reconciliation', description: 'Arrange time for confession and prayer.', icon: HeartHandshake, endpoint: '/priest/confession_requests', nameKey: 'confession_person_name', dateKey: 'preferred_confession_date_and_time', dateLabel: 'Preferred confession' },
  { id: 'marriage_requests', title: 'Holy Matrimony', description: 'Help couples prepare for married life.', icon: Heart, endpoint: '/priest/marriage_requests', nameKey: 'groom_name', dateKey: 'preferred_marriage_date_and_time', dateLabel: 'Preferred wedding', familyCard: true },
  { id: 'confirmation_requests', title: 'Confirmation', description: 'Guide the next step in a life of faith.', icon: BookOpen, endpoint: '/priest/confirmation_requests', nameKey: 'confirmation_person_name', familyCard: true },
  { id: 'anointing_of_the_sick_requests', title: 'Anointing of the Sick', description: 'Arrange visits and care for the sick.', icon: HeartPulse, endpoint: '/priest/aos_requests', nameKey: 'patient_name', dateKey: 'preferred_visit_date_and_time', dateLabel: 'Preferred visit' },
  { id: 'mass_prayers', title: 'Mass intentions', description: 'Review prayers and Mass intentions.', icon: Church, endpoint: '/priest/mass_prayers', reviewEndpoint: '/priest/mass_prayer_requests', dateKey: 'mass_prayer_date_and_time', dateLabel: 'Requested Mass' },
  { id: 'meeting_requests', title: 'Meetings', description: 'Make time for personal conversations.', icon: Users, endpoint: '/priest/meeting_requests', nameKey: 'person_name', dateKey: 'preferred_meeting_date_and_time', dateLabel: 'Preferred meeting' },
];

export function requestName(request, type) {
  if (type.id === 'marriage_requests') return [request.groom_name, request.bride_name].filter(Boolean).join(' & ') || 'Marriage request';
  return request[type.nameKey] || request.user?.user_name || type.title;
}

export function requestStatus(request) { return request.status || 'pending'; }

export function requestDate(value, dateOnly = false) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return 'Not specified';
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', ...(dateOnly ? {} : { hour: 'numeric', minute: '2-digit' }) }).format(new Date(value));
}

export function requestMediaUrl(path) {
  if (!path || typeof path !== 'string') return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.replaceAll('\\', '/');
  if (/^[a-z][a-z\d+.-]*:/i.test(normalized) || normalized.startsWith('//')) return '';
  return `${(process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')}/${normalized.replace(/^\/+/, '')}`;
}

export function requestFields(request, type) {
  const parents = [request.father_name, request.mother_name].filter(Boolean).join(' & ');
  const fields = [];
  const add = (label, value, options = {}) => fields.push({ label, value: value || 'Not provided', ...options });
  if (['baptism_requests', 'eucharist_requests', 'confirmation_requests'].includes(type.id)) add('Parents', parents);
  if (type.id === 'baptism_requests') {
    add('Child’s name', request.child_name);
    add('Date of birth', requestDate(request.child_date_of_birth, true));
  }
  if (type.id === 'eucharist_requests') add('Receiving First Communion', request.eucharist_person_name);
  if (type.id === 'confirmation_requests') add('Receiving Confirmation', request.confirmation_person_name);
  if (type.id === 'confession_requests') add('Person attending', request.confession_person_name);
  if (type.id === 'marriage_requests') {
    add('Groom', request.groom_name, { secondary: request.groom_location, phone: request.groom_mobile_number });
    add('Bride', request.bride_name, { secondary: request.bride_location, phone: request.bride_mobile_number });
  }
  if (type.id === 'anointing_of_the_sick_requests') {
    add('Patient', request.patient_name, { secondary: request.relationship_to_patient });
    add('Contact number', request.contact_number, { phone: request.contact_number });
    add('Condition', request.patient_condition, { wide: true });
    add('Visit address', request.patient_address, { wide: true });
  }
  if (type.id === 'meeting_requests') {
    add('Person attending', request.person_name);
    add('Purpose of the meeting', request.meeting_purpose, { wide: true });
  }
  if (type.dateKey) add(type.dateLabel, requestDate(request[type.dateKey]));
  return fields;
}
