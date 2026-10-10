/**
 * 100% Free Authentication & Membership System for Telc B2 Kerala App
 * - Supports Guest, Free (Normal), and Premium tiers
 * - Works offline/in-browser via LocalStorage
 * - Ready for Supabase / Firebase free tier integration (50,000 free users)
 * - Allows early testing promo codes to grant Premium access
 */

class AuthManager {
  constructor() {
    this.storageKey = 'telc_b2_kerala_auth';
    this.usersKey = 'telc_b2_kerala_registered_users';
    this.currentUser = this.loadUser();
    this.initDefaultUsers();
  }

  initDefaultUsers() {
    let users = this.getAllUsers();
    
    // Check if anisha@gmail.com exists; if not or if old demo exists, update or add it
    const anishaUser = {
      id: 'demo-free',
      name: 'Anisha',
      email: 'anisha@gmail.com',
      password: 'password123',
      role: 'free',
      created_at: new Date().toISOString()
    };

    if (users.length === 0) {
      users = [
        anishaUser,
        {
          id: 'demo-premium',
          name: 'Rahul Kurian',
          email: 'rahul@demo.com',
          password: 'password123',
          role: 'premium',
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    } else {
      // Migrate if old anjali account exists or ensure anisha@gmail.com is present
      const oldIdx = users.findIndex(u => u.email === 'anjali@demo.com' || u.id === 'demo-free');
      if (oldIdx !== -1) {
        users[oldIdx].name = 'Anisha';
        users[oldIdx].email = 'anisha@gmail.com';
        localStorage.setItem(this.usersKey, JSON.stringify(users));
      } else if (!users.some(u => u.email === 'anisha@gmail.com')) {
        users.unshift(anishaUser);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
      }

      // Update current active session if it was anjali
      if (this.currentUser && (this.currentUser.email === 'anjali@demo.com' || this.currentUser.id === 'demo-free')) {
        this.currentUser.name = 'Anisha';
        this.currentUser.email = 'anisha@gmail.com';
        this.saveSession(this.currentUser);
      }
    }
  }

  getAllUsers() {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  loadUser() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  saveSession(user) {
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: user }));
  }

  async register(name, email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Try Vercel Postgres API first
    try {
      const res = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password: password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          this.saveSession(data.user);
          return { success: true, user: data.user, cloudSynced: true };
        } else if (!data.success) {
          return { success: false, message: data.message };
        }
      }
    } catch (apiErr) {
      console.info('Vercel API offline or local mode, using LocalStorage fallback.');
    }

    // LocalStorage Fallback
    const users = this.getAllUsers();
    if (users.some(u => u.email === cleanEmail)) {
      return { success: false, message: 'ഈ ഇമെയിലിൽ ഇതിനകം ഒരു അക്കൗണ്ട് നിലവിലുണ്ട് (Email already registered).' };
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      password: password,
      role: 'free',
      mockExamsUsedToday: 0,
      joinedAt: new Date().toLocaleDateString()
    };

    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    this.saveSession(newUser);
    return { success: true, user: newUser, cloudSynced: false };
  }

  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    // Try Vercel Postgres API first
    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          this.saveSession(data.user);
          return { success: true, user: data.user, cloudSynced: true };
        } else if (!data.success) {
          return { success: false, message: data.message };
        }
      }
    } catch (apiErr) {
      console.info('Vercel API offline or local mode, using LocalStorage fallback.');
    }

    // LocalStorage Fallback
    const users = this.getAllUsers();
    const user = users.find(u => u.email === cleanEmail && u.password === password);

    if (!user) {
      return { success: false, message: 'ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ് തെറ്റാണ് (Invalid email or password).' };
    }

    this.saveSession(user);
    return { success: true, user: user, cloudSynced: false };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey);
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }));
  }

  // Activate Premium with Free Promo Code (Vercel Postgres & LocalStorage)
  async redeemPromoCode(code) {
    if (!this.currentUser) {
      return { success: false, message: 'Please log in first to activate Premium.' };
    }

    const cleanCode = code.trim().toUpperCase();

    // Try Vercel Postgres API first
    try {
      const res = await fetch('/api/auth?action=redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.currentUser.id, promoCode: cleanCode })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          this.saveSession(data.user);
          return { success: true, message: data.message };
        } else if (!data.success) {
          return { success: false, message: data.message };
        }
      }
    } catch (apiErr) {
      console.info('Vercel API offline, using local promo redemption.');
    }

    // LocalStorage Fallback
    const validCodes = ['KERALAB2VIP', 'TELC2026', 'NURSEGERMANY', 'FREEB2'];
    if (validCodes.includes(cleanCode)) {
      this.currentUser.role = 'premium';
      this.currentUser.premiumPlan = 'Founding Member (Free Access)';
      
      const users = this.getAllUsers();
      const idx = users.findIndex(u => u.id === this.currentUser.id);
      if (idx !== -1) {
        users[idx].role = 'premium';
        localStorage.setItem(this.usersKey, JSON.stringify(users));
      }

      this.saveSession(this.currentUser);
      return { 
        success: true, 
        message: '🎉 അഭിനന്ദനങ്ങൾ! പ്രീമിയം ആക്സസ് വിജയകരമായി അൺലോക്ക് ചെയ്തു! (Premium Plan Unlocked Successfully!)' 
      };
    } else {
      return { 
        success: false, 
        message: 'അസാധുവായ പ്രൊമോ കോഡ് (Invalid Promo Code). Try code: KERALAB2VIP' 
      };
    }
  }

  async saveExamResult(examData) {
    if (!this.currentUser) return null;
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.currentUser.id,
          ...examData
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.info('Cloud exam save bypassed in local mode');
    }
    return null;
  }

  isPremium() {
    return this.currentUser && this.currentUser.role === 'premium';
  }

  isLoggedIn() {
    return !!this.currentUser;
  }
}

if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
}
