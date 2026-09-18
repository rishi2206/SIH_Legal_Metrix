const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TOKEN_KEY = 'legalmetrix_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, isForm = false, auth = true } = {}) {
  const headers = {};
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error(
      `Could not reach the backend at ${API_BASE}. Is it running, and is CORS enabled? (${networkErr.message})`
    );
  }

  if (res.status === 401) {
    setToken(null);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const errBody = await res.json();
      message = errBody.message || errBody.error || message;
    } catch {
      // response wasn't JSON — keep default message
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  // ---- Auth ----
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  activateSupervisor: (inviteToken, password) =>
    request('/api/supervisors/activate', {
      method: 'POST',
      body: { inviteToken, password },
      auth: false,
    }),

  // ---- Dashboard ----
  getSupervisorDashboard: () => request('/api/dashboard/supervisor'),
  getAdminDashboard: () => request('/api/dashboard/admin'),

  // ---- History ----
  getSupervisorHistory: () => request('/api/history/supervisor'),
  getAdminHistory: () => request('/api/history/admin'),

  // ---- Inspections ----
  createInspection: (location) =>
    request('/api/inspections', { method: 'POST', body: { location } }),
  getMyInspections: () => request('/api/inspections/my'),
  getInspection: (inspectionId) => request(`/api/inspections/${inspectionId}`),

  // ---- Evidence ----
  getEvidence: (inspectionId) => request(`/api/inspections/${inspectionId}/evidence`),
  uploadEvidence: (inspectionId, file, imageType, productId) => {
    const form = new FormData();
    form.append('file', file);
    form.append('imageType', imageType);
    if (productId) form.append('productId', productId);
    return request(`/api/inspections/${inspectionId}/evidence/upload`, {
      method: 'POST',
      body: form,
      isForm: true,
    });
  },

  // ---- OCR ----
  processInspection: (inspectionId) =>
    request(`/api/inspections/${inspectionId}/process`, { method: 'POST' }),

  // ---- Extraction ----
  extract: (inspectionId) =>
    request(`/api/inspections/${inspectionId}/extract`, { method: 'POST' }),
  getExtraction: (inspectionId) => request(`/api/inspections/${inspectionId}/extraction`),

  // ---- Products ----
  createProduct: (inspectionId, data) =>
    request(`/api/inspections/${inspectionId}/products`, { method: 'POST', body: data }),
  getProducts: (inspectionId) => request(`/api/inspections/${inspectionId}/products`),
  updateProduct: (inspectionId, productId, data) =>
    request(`/api/inspections/${inspectionId}/products/${productId}`, {
      method: 'PUT',
      body: data,
    }),

  // ---- Compliance ----
  validateInspection: (inspectionId) =>
    request(`/api/inspections/${inspectionId}/validate`, { method: 'POST' }),
  getViolations: (inspectionId) => request(`/api/inspections/${inspectionId}/violations`),
  getComplianceResult: (inspectionId) => request(`/api/inspections/${inspectionId}/result`),

  // ---- Reports ----
  generateReport: (inspectionId) =>
    request(`/api/inspections/${inspectionId}/report`, { method: 'POST' }),
  getReports: (inspectionId) => request(`/api/inspections/${inspectionId}/report`),
  downloadReport: async (inspectionId, reportId, filename = 'inspection-report.pdf') => {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(
      `${API_BASE}/api/inspections/${inspectionId}/report/${reportId}/download`,
      { headers }
    );

    if (!res.ok) {
      throw new Error(`Could not download the report (${res.status})`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // ---- Admin ----
  createSupervisor: (data) => request('/api/admin/supervisors', { method: 'POST', body: data }),
  getSupervisors: () => request('/api/admin/supervisors'),
  getSupervisor: (id) => request(`/api/admin/supervisors/${id}`),
  deleteSupervisor: (id) => request(`/api/admin/supervisors/${id}`, { method: 'DELETE' }),
  createManufacturer: (data) => request('/api/admin/manufacturers', { method: 'POST', body: data }),
  getManufacturers: () => request('/api/admin/manufacturers'),
  getManufacturer: (id) => request(`/api/admin/manufacturers/${id}`),
  deleteManufacturer: (id) => request(`/api/admin/manufacturers/${id}`, { method: 'DELETE' }),
};

export { API_BASE };
