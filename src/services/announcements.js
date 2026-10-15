import axios from 'axios';

// The application's configured base URL already includes /api.
const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, withCredentials: true });

export async function announcementRequest(path, { method = 'GET', data, role = 'priest' } = {}) {
  try {
    const response = await client.request({ url: path, method, data, withCredentials: role !== 'public' });
    if (response.data?.status !== 'success') throw new Error(response.data?.message || 'Unexpected server response. Please try again.');
    return response.data.data;
  } catch (cause) {
    const status = cause.response?.status;
    const error = new Error(cause.response?.data?.message || (cause.response ? 'The server could not complete this request. Please try again.' : cause.message));
    error.status = status;
    error.auth = role !== 'public' && (status === 401 || status === 403);
    // Protected announcement middleware also reports missing/expired sessions as 400/404.
    if (role !== 'public' && (status === 400 || status === 404)) {
      try {
        const session = await client.get(`/auth/${role}/me`);
        error.auth = session.data?.status !== 'success' || !session.data?.data;
      } catch (sessionError) {
        const sessionStatus = sessionError.response?.status;
        if ([400, 401, 403, 404].includes(sessionStatus)) error.auth = true;
        else {
          error.status = sessionStatus || 503;
          error.message = 'Unable to verify your session. Please try again.';
        }
      }
    }
    if (error.auth) error.message = `Please sign in${role === 'priest' ? ' as a priest' : ''} to continue.`;
    throw error;
  }
}

export async function uploadAnnouncementImage(file) {
  if (!['image/png', 'image/jpeg'].includes(file.type)) throw new Error('Choose a PNG or JPEG image.');
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('Choose a non-empty image of 5 MiB or less.');
  const data = new FormData();
  data.append('file', file);
  data.append('media_context', 'announcement');
  data.append('media_type', 'image');
  return announcementRequest('/uploads/s3', { method: 'POST', data });
}
