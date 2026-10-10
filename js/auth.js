/**
 * Authentication & membership for the telc B2 Kerala app.
 * All accounts, passwords and promo codes are handled by the server (/api/auth).
 * The browser only keeps the signed session token and the public user profile.
 * Note: the role stored here is a display hint. The server decides what a token can do.
 */

const OFFLINE_MSG = 'സെർവറുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല (Cannot reach the server. Check your internet and try again).';

class AuthManager {
  constructor() {
    this.storageKey = 'telc_b2_kerala_auth';
    this.tokenKey = 'telc_b2_kerala_token';
    // Remove data left behind by the old local-only login system.
    try { localStorage.removeItem('telc_b2_kerala_registered_users'); } catch (e) {}
    this.currentUser = this.loadUser();
    if (this.currentUser && this.getToken()) {
      this.refresh();
    } else if (this.currentUser) {
      this.logout(); // old session without a token
    }
  }

  getToken() {
    try { return localStorage.getItem(this.tokenKey); } catch (e) { return null; }
  }

  loadUser() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  saveSession(user, token) {
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    if (token) localStorage.setItem(this.tokenKey, token);
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: user }));
  }

  async api(action, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch('/api/auth?action=' + action, {
      method: body ? 'POST' : 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    let data = {};
    try { data = await res.json(); } catch (e) {}
    return { status: res.status, data };
  }

  // Re-read the user's real role from the server (keeps premium status accurate).
  async refresh() {
    try {
      const { status, data } = await this.api('me');
      if (status === 401) return this.logout();
      if (data.success && data.user) this.saveSession(data.user);
    } catch (e) {
      console.info('Could not refresh account (offline).');
    }
  }

  async register(name, email, password) {
    try {
      const { data } = await this.api('register', { name: name.trim(), email: email.trim().toLowerCase(), password });
      if (data.success && data.user) {
        this.saveSession(data.user, data.token);
        return { success: true, user: data.user, cloudSynced: true };
      }
      return { success: false, message: data.message || OFFLINE_MSG };
    } catch (e) {
      return { success: false, message: OFFLINE_MSG };
    }
  }

  async login(email, password) {
    try {
      const { data } = await this.api('login', { email: email.trim().toLowerCase(), password });
      if (data.success && data.user) {
        this.saveSession(data.user, data.token);
        return { success: true, user: data.user, cloudSynced: true };
      }
      return { success: false, message: data.message || OFFLINE_MSG };
    } catch (e) {
      return { success: false, message: OFFLINE_MSG };
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }));
  }

  // Premium is only granted when the server accepts the code.
  async redeemPromoCode(code) {
    if (!this.currentUser) {
      return { success: false, message: 'Please log in first to activate Premium.' };
    }
    try {
      const { status, data } = await this.api('redeem-promo', { promoCode: code.trim() });
      if (status === 401) {
        this.logout();
        return { success: false, message: 'Your session expired. Please log in again.' };
      }
      if (data.success && data.user) {
        this.saveSession(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'അസാധുവായ പ്രൊമോ കോഡ് (Invalid Promo Code).' };
    } catch (e) {
      return { success: false, message: OFFLINE_MSG };
    }
  }

  async saveExamResult(examData) {
    const token = this.getToken();
    if (!this.currentUser || !token) return null;
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(examData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.info('Cloud exam save skipped (offline).');
    }
    return null;
  }

  isPremium() {
    return !!this.currentUser && this.currentUser.role === 'premium';
  }

  isLoggedIn() {
    return !!this.currentUser;
  }
}

if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
}
