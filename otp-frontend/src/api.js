import { auth } from './firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getAuthHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};

// API endpoints
export const getOTP = () => fetchWithAuth('/otp');

export const login = (email, sessionId) => 
  fetchWithAuth('/login', {
    method: 'POST',
    body: JSON.stringify({ email, sessionId })
  });

export const logout = (email) => 
  fetchWithAuth('/logout', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

  export const validateSession = async (email, sessionId) => {
    return fetchWithAuth('/validate-session', {
        method: 'POST',
        body: JSON.stringify({ email, sessionId }),
    });
};

  

  export const getUserData = () => 
    fetchWithAuth('/get-user-data', {
       method: 'POST'
    });

  export const getIdInformation = () =>
    fetchWithAuth('/id-information', {
      method: 'GET',
    });

    