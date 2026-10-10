/**
 * Telc B2 Kerala Practice App - Main Application Controller
 * Integrates SpeechEngine, TelcExaminer, and AuthManager (Free & Premium tiers)
 */

document.addEventListener('DOMContentLoaded', () => {
  const speech = new SpeechEngine();
  const examiner = new TelcExaminer();
  const auth = new AuthManager();

  // App State
  const state = {
    currentTab: 'examiner',
    langMode: 'trilingual', // 'trilingual', 'ml-only', 'de-only', 'en-only'
    speechRate: 1.0,
    selectedVoiceUri: '',
    
    // Examiner Simulation State
    examPart: 'teil1', // 'teil1', 'teil2', 'teil3'
    selectedTaskIndex: 0,
    transcript: '',
    isListening: false,
    recordedAudioUrl: null,

    // Exam Timer State
    timerSeconds: 180, // Default 3 mins for Teil 1
    timerTotalSeconds: 180,
    timerInterval: null,
    isTimerRunning: false,

    // Redemittel Search query
    redemittelSearch: '',

    // Flashcard Index for NVV
    nvvIndex: 0,
    nvvFlipped: false
  };

  // Persistent Daily Usage Helpers
  function getTodayUsageKey() {
    return 'telc_b2_usage_' + new Date().toISOString().slice(0, 10);
  }

  function getDailyUsage() {
    try {
      return parseInt(localStorage.getItem(getTodayUsageKey()) || '0', 10);
    } catch(e) {
      return 0;
    }
  }

  function incrementDailyUsage() {
    try {
      const count = getDailyUsage() + 1;
      localStorage.setItem(getTodayUsageKey(), count.toString());
      return count;
    } catch(e) {
      return 1;
    }
  }

  // DOM Elements
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const langModeSelect = document.getElementById('langModeSelect');
  const speechRateSelect = document.getElementById('speechRateSelect');
  const voiceSelect = document.getElementById('voiceSelect');
  const userAuthContainer = document.getElementById('userAuthContainer');

  // Modals
  const authModal = document.getElementById('authModal');
  const upgradeModal = document.getElementById('upgradeModal');

  /* ========================================================
     AUTHENTICATION & USER PROFILE WIDGET
     ======================================================== */
  function renderUserAuthWidget() {
    if (!userAuthContainer) return;
    const user = auth.currentUser;

    if (!user) {
      const loginText = state.langMode === 'en-only' ? '👤 Login / Sign Up' : (state.langMode === 'de-only' ? '👤 Anmelden' : '👤 ലോഗിൻ / സൈൻ അപ്പ്');
      userAuthContainer.innerHTML = `
        <button class="btn-auth-login" id="btnOpenLoginModal">
          ${loginText}
        </button>
      `;
      const btn = document.getElementById('btnOpenLoginModal');
      if (btn) btn.addEventListener('click', () => openAuthModal('login'));
    } else {
      const isPrem = user.role === 'premium';
      const unlockText = state.langMode === 'en-only' ? '👑 Unlock VIP' : (state.langMode === 'de-only' ? '👑 Upgrade' : '👑 അൺലോക്ക്');
      userAuthContainer.innerHTML = `
        <div class="user-profile-pill">
          <span class="user-avatar-badge">${isPrem ? '⭐' : '👤'}</span>
          <div class="user-info-text">
            <span class="user-name">${user.name}</span>
            <span class="user-plan-badge ${isPrem ? 'badge-prem' : 'badge-free'}">
              ${isPrem ? 'Premium VIP' : 'Free Tier'}
            </span>
          </div>
          ${!isPrem ? `
            <button class="btn-upgrade-mini" id="btnMiniUpgrade">
              ${unlockText}
            </button>
          ` : ''}
          <button class="btn-logout-mini" id="btnLogoutUser" title="Logout">
            🚪
          </button>
        </div>
      `;

      const btnUpgrade = document.getElementById('btnMiniUpgrade');
      if (btnUpgrade) btnUpgrade.addEventListener('click', openUpgradeModal);

      const btnLogout = document.getElementById('btnLogoutUser');
      if (btnLogout) btnLogout.addEventListener('click', () => {
        auth.logout();
        renderUserAuthWidget();
      });
    }
  }

  window.addEventListener('auth-state-changed', () => {
    renderUserAuthWidget();
    renderExaminerStage();
  });

  // Modal Handlers
  window.openAuthModal = function(tab = 'login') {
    if (authModal) {
      authModal.style.display = 'flex';
      switchAuthTab(tab);
    }
  };

  window.closeAuthModal = function() {
    if (authModal) authModal.style.display = 'none';
  };

  window.openUpgradeModal = function() {
    if (upgradeModal) upgradeModal.style.display = 'flex';
  };

  window.closeUpgradeModal = function() {
    if (upgradeModal) upgradeModal.style.display = 'none';
  };

  // Close modals on outside click or close button
  const btnCloseAuth = document.getElementById('btnCloseAuthModal');
  if (btnCloseAuth) btnCloseAuth.addEventListener('click', closeAuthModal);

  const btnCloseUpgrade = document.getElementById('btnCloseUpgradeModal');
  if (btnCloseUpgrade) btnCloseUpgrade.addEventListener('click', closeUpgradeModal);

  const btnOpenUpgrade = document.getElementById('btnOpenUpgradeModal');
  if (btnOpenUpgrade) btnOpenUpgrade.addEventListener('click', openUpgradeModal);

  const btnContinueFree = document.getElementById('btnContinueFree');
  if (btnContinueFree) btnContinueFree.addEventListener('click', closeUpgradeModal);

  // Tab switching inside Auth Modal
  function switchAuthTab(tab) {
    const btnLogin = document.getElementById('btnAuthTabLogin');
    const btnReg = document.getElementById('btnAuthTabRegister');
    const formLogin = document.getElementById('loginForm');
    const formReg = document.getElementById('registerForm');

    if (tab === 'login') {
      if (btnLogin) btnLogin.classList.add('active');
      if (btnReg) btnReg.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formReg) formReg.style.display = 'none';
    } else {
      if (btnLogin) btnLogin.classList.remove('active');
      if (btnReg) btnReg.classList.add('active');
      if (formLogin) formLogin.style.display = 'none';
      if (formReg) formReg.style.display = 'block';
    }
  }

  const btnAuthTabLogin = document.getElementById('btnAuthTabLogin');
  if (btnAuthTabLogin) btnAuthTabLogin.addEventListener('click', () => switchAuthTab('login'));

  const btnAuthTabRegister = document.getElementById('btnAuthTabRegister');
  if (btnAuthTabRegister) btnAuthTabRegister.addEventListener('click', () => switchAuthTab('register'));

  // Form Submissions
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const pass = document.getElementById('loginPassword').value;
      const res = auth.login(email, pass);
      const errBox = document.getElementById('loginError');

      if (!res.success) {
        if (errBox) {
          errBox.textContent = res.message;
          errBox.style.display = 'block';
        }
      } else {
        if (errBox) errBox.style.display = 'none';
        closeAuthModal();
        renderUserAuthWidget();
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const pass = document.getElementById('regPassword').value;
      const res = auth.register(name, email, pass);
      const errBox = document.getElementById('registerError');

      if (!res.success) {
        if (errBox) {
          errBox.textContent = res.message;
          errBox.style.display = 'block';
        }
      } else {
        if (errBox) errBox.style.display = 'none';
        closeAuthModal();
        renderUserAuthWidget();
      }
    });
  }

  // Promo Code Redemption
  const btnRedeemPromo = document.getElementById('btnRedeemPromo');
  if (btnRedeemPromo) {
    btnRedeemPromo.addEventListener('click', () => {
      const codeInput = document.getElementById('promoCodeInput');
      const feedback = document.getElementById('promoFeedback');
      if (!codeInput || !feedback) return;

      if (!auth.isLoggedIn()) {
        feedback.innerHTML = '<span class="text-error">ദയവായി ആദ്യം ലോഗിൻ ചെയ്യുക (Please login first).</span>';
        setTimeout(() => {
          closeUpgradeModal();
          openAuthModal('login');
        }, 1200);
        return;
      }

      const res = auth.redeemPromoCode(codeInput.value);
      if (res.success) {
        feedback.innerHTML = `<span class="text-success">${res.message}</span>`;
        setTimeout(() => {
          closeUpgradeModal();
          renderUserAuthWidget();
          renderExaminerStage();
        }, 1500);
      } else {
        feedback.innerHTML = `<span class="text-error">${res.message}</span>`;
      }
    });
  }

  /* ========================================================
     VOICES & SPEECH RATE
     ======================================================== */
  function populateVoiceSelect() {
    if (!voiceSelect) return;
    const voices = speech.getGermanVoices();
    voiceSelect.innerHTML = '';
    
    if (voices.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'Standard Deutsche Stimme';
      voiceSelect.appendChild(opt);
      return;
    }

    voices.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      opt.textContent = `${v.name} (${v.lang})`;
      if (i === 0) opt.selected = true;
      voiceSelect.appendChild(opt);
    });
  }

  setTimeout(populateVoiceSelect, 500);
  if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoiceSelect;
  }

  function updateLanguageVisibility() {
    document.body.classList.remove('mode-de-only', 'mode-ml-only', 'mode-trilingual', 'mode-en-only');
    if (state.langMode === 'de-only') {
      document.body.classList.add('mode-de-only');
    } else if (state.langMode === 'ml-only') {
      document.body.classList.add('mode-ml-only');
    } else if (state.langMode === 'en-only') {
      document.body.classList.add('mode-en-only');
    } else {
      document.body.classList.add('mode-trilingual');
    }

    const brandSub = document.querySelector('.brand-text .subtitle');
    if (brandSub) {
      if (state.langMode === 'en-only') {
        brandSub.textContent = 'German B2 Oral Exam Practice (English & German)';
      } else if (state.langMode === 'de-only') {
        brandSub.textContent = 'telc Deutsch B2 Mündliche Prüfung Training (Nur Deutsch)';
      } else {
        brandSub.textContent = 'ജർമ്മൻ B2 വായ്മൊഴി പരീക്ഷാ പരിശീലനം (മലയാളം & English Guidance)';
      }
    }
    renderUserAuthWidget();
  }

  if (langModeSelect) {
    langModeSelect.addEventListener('change', (e) => {
      state.langMode = e.target.value;
      updateLanguageVisibility();
    });
  }

  if (speechRateSelect) {
    speechRateSelect.addEventListener('change', (e) => {
      state.speechRate = parseFloat(e.target.value);
      speech.setRate(state.speechRate);
    });
  }

  if (voiceSelect) {
    voiceSelect.addEventListener('change', (e) => {
      state.selectedVoiceUri = e.target.value;
      speech.setVoice(e.target.value);
    });
  }

  // Navigation Tabs
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      state.currentTab = targetTab;
      
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach(tc => {
        tc.classList.remove('active');
        if (tc.id === `tab-${targetTab}`) {
          tc.classList.add('active');
        }
      });

      if (targetTab === 'teil1') renderTeil1Studio();
      if (targetTab === 'teil2') renderTeil2Studio();
      if (targetTab === 'teil3') renderTeil3Studio();
      if (targetTab === 'redemittel') renderRedemittelTab();
      if (targetTab === 'kerala') renderKeralaTab();
      if (targetTab === 'examiner') renderExaminerStage();
    });
  });

  window.speakGerman = function(text) {
    speech.speak(text);
  };

  /* ========================================================
     1. LIVE TELC EXAMINER SIMULATION (INTERACTIVE)
     ======================================================== */
  const examinerContainer = document.getElementById('examinerStage');

  function renderExaminerStage() {
    if (!examinerContainer) return;

    let currentTaskList = TELC_B2_DATA[state.examPart] || TELC_B2_DATA.teil1;
    let currentTask = currentTaskList[state.selectedTaskIndex] || currentTaskList[0];
    const isPrem = auth.isPremium();

    let html = `
      <div class="examiner-card glass-panel">
        <div class="examiner-header">
          <div class="examiner-profile">
            <div class="examiner-avatar-pulse">
              <span class="avatar-icon">👩‍🏫</span>
              <span class="pulse-ring"></span>
            </div>
            <div>
              <div class="examiner-name-badge">
                <span class="name">${examiner.name}</span>
                <span class="badge telc-badge">telc B2 Prüferin</span>
                ${isPrem ? '<span class="badge badge-prem">⭐ Premium Active</span>' : '<span class="badge badge-free">Free Mode (2/day)</span>'}
              </div>
              <p class="examiner-subtitle">Offizielle Prüfungssimulation • Official Telc B2 Examiner Mode</p>
            </div>
          </div>

          <div class="examiner-controls-top">
            <div class="part-select-group">
              <label><span class="badge-label">Prüfungsteil:</span></label>
              <select id="examPartSelect" class="styled-select">
                <option value="teil1" ${state.examPart === 'teil1' ? 'selected' : ''}>Teil 1: Präsentation (3 Min.)</option>
                <option value="teil2" ${state.examPart === 'teil2' ? 'selected' : ''}>Teil 2: Diskussion (5 Min.)</option>
                <option value="teil3" ${state.examPart === 'teil3' ? 'selected' : ''}>Teil 3: Problemlösung (5 Min.)</option>
              </select>
            </div>

            <div class="task-select-group">
              <label><span class="badge-label">Thema / Aufgabe:</span></label>
              <select id="taskSelect" class="styled-select">
                ${currentTaskList.map((t, i) => `
                  <option value="${i}" ${i === state.selectedTaskIndex ? 'selected' : ''}>
                    ${t.title} ${(!isPrem && i > 1) ? '🔒 (Premium)' : ''}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Authentic Telc Exam Timer Widget -->
            <div class="exam-timer-widget">
              <div class="timer-display-group">
                <span class="timer-icon">⏱️</span>
                <span class="timer-digits" id="examTimerDisplay">${formatTimerDigits(state.timerSeconds)}</span>
                <span class="timer-label-part" id="examTimerLabel">${state.examPart === 'teil1' ? 'Teil 1 (3 Min.)' : 'Teil 2/3 (5 Min.)'}</span>
              </div>
              <div class="timer-action-buttons">
                <button class="btn-timer-ctrl ${state.isTimerRunning ? 'timer-running' : ''}" id="btnToggleTimer">
                  ${state.isTimerRunning ? '⏸️ Pause' : '▶️ Start'}
                </button>
                <button class="btn-timer-ctrl btn-timer-reset" id="btnResetTimer" title="Zeit zurücksetzen">
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Briefing Box with Trilingual Guidance -->
        <div class="task-briefing-box">
          <div class="briefing-header">
            <h4><span class="icon">📋</span> ${currentTask.title}</h4>
            <button class="audio-btn" onclick="speakGerman('${escapeForAttr(currentTask.prompt || currentTask.contextText || currentTask.situation)}')">
              🔊 Vorlesen (Read Task)
            </button>
          </div>
          <p class="de-text task-body">${nl2br(currentTask.prompt || currentTask.contextText || currentTask.situation)}</p>
          ${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? `<div class="ml-box"><span class="lang-tag">മലയാളം വിവർത്തനം:</span><p class="ml-text">${nl2br(currentTask.titleMl || currentTask.contextTextMl || currentTask.situationMl)}</p></div>` : ''}
          <div class="en-box">
            <span class="lang-tag en-tag">English Guidance:</span>
            <p class="en-text">${nl2br(currentTask.titleEn || currentTask.contextTextEn || currentTask.situationEn || '')}</p>
          </div>
        </div>

        <!-- Examiner Speech Bubble -->
        <div class="dialogue-box">
          <div class="examiner-bubble">
            <div class="bubble-meta">
              <strong>${examiner.name} sagt:</strong>
              <button class="small-audio-btn" id="btnSpeakExaminerPrompt">🔊 Hören</button>
            </div>
            <p class="examiner-speech-text" id="examinerSpeechText">
              ${getExaminerIntroSpeech(state.examPart, currentTask)}
            </p>
            <div class="ml-subtext" id="examinerSpeechTextMl">
              ${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? getExaminerIntroSpeechMl(state.examPart, currentTask) : ''}
            </div>
            <div class="en-subtext" id="examinerSpeechTextEn">
              ${getExaminerIntroSpeechEn(state.examPart, currentTask)}
            </div>
          </div>
        </div>

        <!-- Student Input & Speaking Studio -->
        <div class="student-response-panel">
          <div class="response-header">
            <h4><span class="icon">🎙️</span> Ihre Antwort (Your Response${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? ' / നിങ്ങളുടെ മറുപടി' : ''})</h4>
            <div class="recording-controls">
              <button class="btn-primary" id="btnVoiceRecord">
                <span id="micIcon">🎤</span> <span id="micBtnText">Sprechen (Start Mic)</span>
              </button>
              <button class="btn-secondary" id="btnAudioSaveRecord">
                ⏺️ Aufnahme für Analyse (Record Audio)
              </button>
              <button class="btn-sample-insert" id="btnPasteSampleAnswer" title="Musterantwort einfügen">
                💡 Musterantwort (Sample Answer)
              </button>
            </div>
          </div>

          <!-- Microphone Diagnostics & Permission Banner -->
          <div id="micAlertBox" class="mic-alert-box" style="display: none;"></div>

          <div id="listeningIndicator" class="listening-indicator" style="display: none;">
            <div class="sound-wave">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <span class="listening-text" id="liveWaveText">Zuhören... Bitte sprechen Sie auf Deutsch (Listening...)</span>
          </div>

          <div class="input-container">
            <textarea id="userResponseInput" rows="5" placeholder="Sprechen Sie in Ihr Mikrofon oder tippen Sie Ihre Antwort hier ein... (Type or speak your B2 German response here...)"></textarea>
          </div>

          <div class="response-footer">
            <div class="word-counter-badge">
              <span id="responseWordCount">0</span> Wörter (B2 Richtwert: 50-120 Wörter)
            </div>
            <div class="action-buttons">
              <button class="btn-clear" id="btnClearResponse">Löschen</button>
              <button class="btn-evaluate" id="btnEvaluateResponse">
                ⭐ Antworten & Prüfer-Feedback erhalten
              </button>
            </div>
          </div>

          <div id="audioPlaybackBox" class="audio-playback-box" style="display: none;">
            <label>Ihre Audioaufnahme (Listen to your pronunciation):</label>
            <audio id="recordedAudioPlayer" controls></audio>
          </div>
        </div>

        <!-- Feedback & Evaluation Container -->
        <div id="feedbackContainer" class="feedback-container" style="display: none;"></div>

        <!-- Quick B2 Redemittel Drawer -->
        <div class="quick-phrases-drawer">
          <details>
            <summary>💡 Empfohlene B2 Redemittel für dieses Thema (Helpful phrases${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? ' with Malayalam' : ''})</summary>
            <div class="quick-phrases-grid">
              ${getQuickPhrasesForPart(state.examPart)}
            </div>
          </details>
        </div>
      </div>
    `;

    examinerContainer.innerHTML = html;
    attachExaminerListeners(currentTask);
  }

  function getExaminerIntroSpeech(part, task) {
    if (part === 'teil1') {
      return `Guten Tag! Willkommen zum ersten Teil Ihrer mündlichen telc B2 Prüfung. Bitte beginnen Sie nun mit Ihrer Präsentation zum Thema "${task.title}". Sie haben etwa 2 bis 3 Minuten Zeit. Ich höre Ihnen aufmerksam zu.`;
    } else if (part === 'teil2') {
      return `Kommen wir nun zu Teil 2 der Prüfung, der Diskussion. Wir sprechen über das Thema "${task.title}". Bitte stellen Sie Ihre Argumente dar und erklären Sie Ihren Standpunkt.`;
    } else {
      return `Wir beginnen nun mit Teil 3: Gemeinsam etwas planen. Stellen Sie sich vor, wir sind Kollegen. Bitte machen Sie den ersten Vorschlag, wie wir vorgehen sollten.`;
    }
  }

  function getExaminerIntroSpeechMl(part, task) {
    if (part === 'teil1') {
      return `നമസ്കാരം! നിങ്ങളുടെ telc B2 വായ്മൊഴി പരീക്ഷയുടെ ആദ്യ ഭാഗത്തേക്ക് സ്വാഗതം. '${task.titleMl || task.title}' എന്ന വിഷയത്തെക്കുറിച്ച് നിങ്ങളുടെ പ്രസന്റേഷൻ ആരംഭിക്കുക. നിങ്ങൾക്ക് 2-3 മിനിറ്റ് സമയമുണ്ട്.`;
    } else if (part === 'teil2') {
      return `ഇനി രണ്ടാം ഭാഗമായ ചർച്ചയിലേക്ക് (Diskussion) കടക്കാം. '${task.titleMl || task.title}' എന്ന വിഷയത്തെക്കുറിച്ചാണ് ചർച്ച. നിങ്ങളുടെ അനുകൂല/പ്രതികൂല വാദങ്ങൾ അവതരിപ്പിക്കുക.`;
    } else {
      return `മൂന്നാം ഭാഗമായ 'പദ്ധതി ആസൂത്രണം' (Problemlösung). നാം സഹപ്രവർത്തകരാണെന്ന് കരുതുക. പരിപാടി എങ്ങനെ തുടങ്ങാമെന്ന് ആദ്യ നിർദ്ദേശം മുന്നോട്ട് വെക്കുക.`;
    }
  }

  function getExaminerIntroSpeechEn(part, task) {
    if (part === 'teil1') {
      return `Welcome to Part 1 of your telc B2 oral examination. Please start your presentation on the topic "${task.titleEn || task.title}". You have about 2 to 3 minutes. I am listening attentively.`;
    } else if (part === 'teil2') {
      return `Now moving to Part 2: Discussion. We are discussing "${task.titleEn || task.title}". Please present your arguments and explain your point of view.`;
    } else {
      return `Starting Part 3: Joint Problem Solving / Planning. Imagine we are colleagues. Please make the first proposal on how we should proceed.`;
    }
  }

  function getQuickPhrasesForPart(part) {
    const phrases = TELC_B2_DATA.redemittel[part] || TELC_B2_DATA.redemittel.teil1;
    let list = [];
    phrases.forEach(cat => {
      cat.phrases.forEach(p => list.push(p));
    });

    return list.slice(0, 6).map(p => `
      <div class="phrase-mini-card" onclick="insertPhraseToInput('${escapeForAttr(p.de)}')">
        <div class="phrase-de">
          <strong>${p.de}</strong>
          <button class="mini-speak" onclick="event.stopPropagation(); speakGerman('${escapeForAttr(p.de)}')">🔊</button>
        </div>
        <div class="phrase-ml">${p.ml}</div>
        ${p.en ? `<div class="phrase-en">${p.en}</div>` : ''}
      </div>
    `).join('');
  }

  window.insertPhraseToInput = function(phraseText) {
    const input = document.getElementById('userResponseInput');
    if (input) {
      input.value += (input.value ? ' ' : '') + phraseText + ' ';
      input.focus();
      updateWordCount();
    }
  };

  function updateWordCount() {
    const input = document.getElementById('userResponseInput');
    const counter = document.getElementById('responseWordCount');
    if (input && counter) {
      const count = input.value.trim().split(/\s+/).filter(Boolean).length;
      counter.textContent = count;
    }
  }

  function formatTimerDigits(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function resetExamTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.isTimerRunning = false;
    const targetSeconds = state.examPart === 'teil1' ? 180 : 300;
    state.timerSeconds = targetSeconds;
    state.timerTotalSeconds = targetSeconds;
    updateTimerDisplay();
  }

  function toggleExamTimer() {
    if (state.isTimerRunning) {
      if (state.timerInterval) clearInterval(state.timerInterval);
      state.isTimerRunning = false;
      updateTimerDisplay();
    } else {
      if (state.timerSeconds <= 0) {
        state.timerSeconds = state.examPart === 'teil1' ? 180 : 300;
      }
      state.isTimerRunning = true;
      updateTimerDisplay();
      state.timerInterval = setInterval(() => {
        if (state.timerSeconds > 0) {
          state.timerSeconds--;
          updateTimerDisplay();
          if (state.timerSeconds === 0) {
            clearInterval(state.timerInterval);
            state.isTimerRunning = false;
            updateTimerDisplay();
            speech.speak('Die Zeit für diesen Prüfungsteil ist um.');
          }
        }
      }, 1000);
    }
  }

  function updateTimerDisplay() {
    const disp = document.getElementById('examTimerDisplay');
    const btnToggle = document.getElementById('btnToggleTimer');
    const label = document.getElementById('examTimerLabel');
    if (disp) {
      disp.textContent = formatTimerDigits(state.timerSeconds);
      if (state.timerSeconds <= 30 && state.timerSeconds > 0) {
        disp.classList.add('timer-warning-pulse');
      } else {
        disp.classList.remove('timer-warning-pulse');
      }
    }
    if (btnToggle) {
      btnToggle.textContent = state.isTimerRunning ? '⏸️ Pause' : '▶️ Start';
      btnToggle.classList.toggle('timer-running', state.isTimerRunning);
    }
    if (label) {
      label.textContent = state.examPart === 'teil1' ? 'Teil 1 (3 Min.)' : 'Teil 2/3 (5 Min.)';
    }
  }

  function attachExaminerListeners(currentTask) {
    const partSelect = document.getElementById('examPartSelect');
    const taskSelect = document.getElementById('taskSelect');
    const btnToggleTimer = document.getElementById('btnToggleTimer');
    const btnResetTimer = document.getElementById('btnResetTimer');
    const btnSpeakExaminerPrompt = document.getElementById('btnSpeakExaminerPrompt');
    const btnVoiceRecord = document.getElementById('btnVoiceRecord');
    const btnAudioSaveRecord = document.getElementById('btnAudioSaveRecord');
    const btnPasteSampleAnswer = document.getElementById('btnPasteSampleAnswer');
    const userResponseInput = document.getElementById('userResponseInput');
    const btnClearResponse = document.getElementById('btnClearResponse');
    const btnEvaluateResponse = document.getElementById('btnEvaluateResponse');
    const listeningIndicator = document.getElementById('listeningIndicator');
    const liveWaveText = document.getElementById('liveWaveText');
    const micAlertBox = document.getElementById('micAlertBox');

    if (btnToggleTimer) {
      btnToggleTimer.addEventListener('click', toggleExamTimer);
    }

    if (btnResetTimer) {
      btnResetTimer.addEventListener('click', resetExamTimer);
    }

    function showMicAlert(type, message) {
      if (!micAlertBox) return;
      let titleDe = 'Mikrofon-Hinweis';
      let titleMl = 'മൈക്രോഫോൺ സഹായം';
      let desc = '';

      if (type === 'permission_denied') {
        titleDe = 'Mikrofonzugriff blockiert';
        titleMl = 'മൈക്രോഫോൺ അനുമതി തടഞ്ഞിരിക്കുന്നു';
        desc = `
          <p><strong>🇩🇪 Hinweis:</strong> Der Browser hat den Zugriff auf das Mikrofon blockiert. Klicken Sie in der Adressleiste auf das Schlosssymbol 🔒 und wählen Sie <strong>„Zulassen (Allow)“</strong>.</p>
          <p class="mic-alert-ml"><strong>🇮🇳 മലയാളം:</strong> ബ്രൗസറിന്റെ URL ബാറിലുള്ള <strong>ലോക്ക് (🔒) ചിഹ്നത്തിൽ</strong> ക്ലിക്ക് ചെയ്ത് Microphone <strong>'Allow' (അനുമതി)</strong> നൽകുക. അല്ലെങ്കിൽ താഴെയുള്ള ബട്ടൺ വഴി Musterantwort ചേർക്കാം.</p>
          <p class="mic-alert-en"><strong>🇬🇧 English:</strong> Browser microphone access is blocked. Click the lock/tune icon 🔒 in the address bar and enable microphone permissions.</p>
          <div class="mic-alert-actions">
            <button class="btn-alert-action" id="btnAlertInsertSample">💡 Musterantwort einfügen (Use Sample Answer)</button>
          </div>
        `;
      } else if (type === 'no_microphone') {
        titleDe = 'Kein Mikrofon gefunden';
        titleMl = 'മൈക്രോഫോൺ ലഭ്യമല്ല';
        desc = `
          <p><strong>🇩🇪 Hinweis:</strong> Es wurde kein Mikrofon an Ihrem Gerät erkannt. Bitte Headset anschließen oder Text eintippen.</p>
          <p class="mic-alert-ml"><strong>🇮🇳 മലയാളം:</strong> സിസ്റ്റത്തിൽ മൈക്രോഫോൺ കണ്ടെത്താൻ സാധിച്ചില്ല. ഹെഡ്സെറ്റ് ബന്ധിപ്പിക്കുക അല്ലെങ്കിൽ നേരിട്ട് ടൈപ്പ് ചെയ്യുക.</p>
          <div class="mic-alert-actions">
            <button class="btn-alert-action" id="btnAlertInsertSample">💡 Musterantwort einfügen</button>
          </div>
        `;
      } else if (type === 'no_speech') {
        titleDe = 'Keine Sprache erkannt';
        titleMl = 'ശബ്ദം വ്യക്തമായി കേട്ടില്ല';
        desc = `
          <p><strong>🇩🇪 Hinweis:</strong> Es wurde keine deutsche Sprache erkannt. Bitte sprechen Sie näher am Mikrofon und etwas lauter.</p>
          <p class="mic-alert-ml"><strong>🇮🇳 മലയാളം:</strong> സംസാരം റെക്കോർഡ് ആയില്ല. മൈക്കിനടുത്ത് നിന്ന് ഉച്ചത്തിൽ ജർമ്മൻ സംസാരിക്കുക.</p>
        `;
      } else if (type === 'network_error') {
        titleDe = 'Netzwerkfehler Spracherkennung';
        titleMl = 'സ്പീച്ച് സർവീസ് കണക്ഷൻ തടസ്സം';
        desc = `
          <p><strong>🇩🇪 Hinweis:</strong> Der Browser-Spracherkennungsdienst (Google Speech API) konnte nicht kontaktiert werden. Sie können Ihren Text eintippen oder die Musterantwort nutzen.</p>
          <p class="mic-alert-ml"><strong>🇮🇳 മലയാളം:</strong> ഗൂഗിൾ സ്പീച്ച് സെർവർ കണക്ഷൻ പിശക്. നേരിട്ട് ടൈപ്പ് ചെയ്യുകയോ താഴെയുള്ള Musterantwort ഉപയോഗിക്കുകയോ ചെയ്യാം.</p>
          <div class="mic-alert-actions">
            <button class="btn-alert-action" id="btnAlertInsertSample">💡 Musterantwort einfügen</button>
          </div>
        `;
      } else if (type === 'not_supported') {
        titleDe = 'Browser nicht unterstützt';
        titleMl = 'ബ്രൗസർ പിന്തുണ ലഭ്യമല്ല';
        desc = `
          <p><strong>🇩🇪 Hinweis:</strong> Web Speech API wird in diesem Browser nicht unterstützt. Bitte nutzen Sie Google Chrome oder Microsoft Edge.</p>
          <p class="mic-alert-ml"><strong>🇮🇳 മലയാളം:</strong> ദയവായി Google Chrome അല്ലെങ്കിൽ Microsoft Edge ബ്രൗസർ ഉപയോഗിക്കുക.</p>
        `;
      } else {
        titleDe = 'Mikrofon-Status';
        titleMl = 'മൈക്രോഫോൺ വിവരം';
        desc = `<p>${message || 'Ein Audio-Problem ist aufgetreten. Bitte erneut versuchen.'}</p>`;
      }

      micAlertBox.innerHTML = `
        <div class="mic-alert-content">
          <div class="mic-alert-icon">🎙️</div>
          <div class="mic-alert-body">
            <div class="mic-alert-head">
              <strong>${titleDe}</strong> <span class="badge ml-badge">${titleMl}</span>
              <button type="button" class="mic-alert-close" id="btnDismissMicAlert" title="Schließen">✕</button>
            </div>
            ${desc}
          </div>
        </div>
      `;
      micAlertBox.style.display = 'block';

      const btnDismiss = document.getElementById('btnDismissMicAlert');
      if (btnDismiss) {
        btnDismiss.addEventListener('click', () => {
          micAlertBox.style.display = 'none';
        });
      }

      const btnAlertSample = document.getElementById('btnAlertInsertSample');
      if (btnAlertSample && btnPasteSampleAnswer) {
        btnAlertSample.addEventListener('click', () => {
          btnPasteSampleAnswer.click();
        });
      }
    }

    function hideMicAlert() {
      if (micAlertBox) micAlertBox.style.display = 'none';
    }

    if (partSelect) {
      partSelect.addEventListener('change', (e) => {
        state.examPart = e.target.value;
        state.selectedTaskIndex = 0;
        resetExamTimer();
        renderExaminerStage();
      });
    }

    if (taskSelect) {
      taskSelect.addEventListener('change', (e) => {
        const selectedIdx = parseInt(e.target.value, 10);
        // Free tier lock check
        if (!auth.isPremium() && selectedIdx > 1) {
          openUpgradeModal();
          taskSelect.value = state.selectedTaskIndex; // revert
          return;
        }
        state.selectedTaskIndex = selectedIdx;
        resetExamTimer();
        renderExaminerStage();
      });
    }

    if (btnSpeakExaminerPrompt) {
      btnSpeakExaminerPrompt.addEventListener('click', () => {
        const text = document.getElementById('examinerSpeechText').textContent;
        speech.speak(text);
      });
    }

    if (userResponseInput) {
      userResponseInput.addEventListener('input', updateWordCount);
    }

    if (btnClearResponse) {
      btnClearResponse.addEventListener('click', () => {
        userResponseInput.value = '';
        updateWordCount();
        hideMicAlert();
        const feedbackContainer = document.getElementById('feedbackContainer');
        if (feedbackContainer) feedbackContainer.style.display = 'none';
      });
    }

    // Sample Answer Button Handler
    if (btnPasteSampleAnswer) {
      btnPasteSampleAnswer.addEventListener('click', () => {
        let sample = '';
        if (currentTask.examinerQuestions && currentTask.examinerQuestions.length > 0 && currentTask.examinerQuestions[0].sampleAnswer) {
          sample = currentTask.examinerQuestions[0].sampleAnswer;
        } else if (currentTask.tips && currentTask.tips.length > 0) {
          sample = currentTask.tips.join(' ');
        } else if (currentTask.outline && currentTask.outline.length > 0) {
          sample = currentTask.outline.map(o => o.phrase).join(' ');
        } else {
          sample = 'Ich möchte heute über dieses Thema sprechen, weil es in der heutigen Zeit eine sehr wichtige Rolle spielt. Einerseits gibt es zahlreiche Vorteile, andererseits darf man aber auch die damit verbundenen Herausforderungen nicht unterschätzen.';
        }

        userResponseInput.value = sample;
        updateWordCount();
        hideMicAlert();
        userResponseInput.focus();
      });
    }

    // Speech Recognition with Live Interim Feedback
    let sessionBaseText = '';
    let speechSessionFinal = '';

    if (btnVoiceRecord) {
      btnVoiceRecord.addEventListener('click', () => {
        if (!state.isListening) {
          hideMicAlert();
          sessionBaseText = userResponseInput.value.trim();
          speechSessionFinal = '';

          if (liveWaveText) {
            liveWaveText.textContent = 'Verbinde mit Mikrofon... (Listening...)';
          }

          speech.startListening(
            (finalT, interimT) => {
              if (finalT) {
                speechSessionFinal += (speechSessionFinal ? ' ' : '') + finalT.trim();
              }

              let currentText = sessionBaseText;
              if (speechSessionFinal) {
                currentText += (currentText ? ' ' : '') + speechSessionFinal;
              }

              if (interimT) {
                if (liveWaveText) {
                  liveWaveText.textContent = `🎙️ "${interimT}"...`;
                }
              } else {
                if (liveWaveText) {
                  liveWaveText.textContent = 'Zuhören... Bitte sprechen Sie auf Deutsch (Listening...)';
                }
              }

              userResponseInput.value = currentText;
              updateWordCount();
            },
            (status, msg) => {
              if (status === 'listening') {
                state.isListening = true;
                btnVoiceRecord.classList.add('active-recording');
                document.getElementById('micBtnText').textContent = 'Stoppen (Stop Mic)';
                if (listeningIndicator) listeningIndicator.style.display = 'flex';
                if (liveWaveText) {
                  liveWaveText.textContent = 'Zuhören... Bitte sprechen Sie auf Deutsch (Listening...)';
                }
                hideMicAlert();
              } else if (status === 'ended') {
                state.isListening = false;
                btnVoiceRecord.classList.remove('active-recording');
                document.getElementById('micBtnText').textContent = 'Sprechen (Start Mic)';
                if (listeningIndicator) listeningIndicator.style.display = 'none';
              } else if (status === 'permission_denied' || status === 'no_microphone' || status === 'no_speech' || status === 'network_error' || status === 'not_supported' || status === 'error') {
                state.isListening = false;
                btnVoiceRecord.classList.remove('active-recording');
                document.getElementById('micBtnText').textContent = 'Sprechen (Start Mic)';
                if (listeningIndicator) listeningIndicator.style.display = 'none';
                showMicAlert(status, msg);
              }
            }
          );
        } else {
          speech.stopListening();
          state.isListening = false;
          btnVoiceRecord.classList.remove('active-recording');
          document.getElementById('micBtnText').textContent = 'Sprechen (Start Mic)';
          if (listeningIndicator) listeningIndicator.style.display = 'none';
        }
      });
    }

    // Audio Recorder
    if (btnAudioSaveRecord) {
      btnAudioSaveRecord.addEventListener('click', async () => {
        if (!speech.isRecordingAudio) {
          hideMicAlert();
          const ok = await speech.startAudioRecording(
            (url) => {
              const playerBox = document.getElementById('audioPlaybackBox');
              const player = document.getElementById('recordedAudioPlayer');
              if (playerBox && player) {
                player.src = url;
                playerBox.style.display = 'block';
              }
            },
            (err) => {
              showMicAlert('permission_denied', 'Mikrofonaufnahme konnte nicht gestartet werden.');
            }
          );
          if (ok) {
            btnAudioSaveRecord.textContent = '⏹️ Aufnahme stoppen (Stop Recording)';
            btnAudioSaveRecord.classList.add('recording-pulse');
          }
        } else {
          speech.stopAudioRecording();
          btnAudioSaveRecord.textContent = '⏺️ Aufnahme für Analyse (Record Audio)';
          btnAudioSaveRecord.classList.remove('recording-pulse');
        }
      });
    }

    // Evaluation Button with Free Tier Limit Check
    if (btnEvaluateResponse) {
      btnEvaluateResponse.addEventListener('click', () => {
        const text = userResponseInput.value.trim();
        if (!text) {
          alert('Bitte geben Sie zuerst eine Antwort ein oder sprechen Sie ins Mikrofon!');
          return;
        }

        // Daily usage limit for free / guest users (stored in localStorage)
        if (!auth.isPremium()) {
          const usedToday = incrementDailyUsage();
          if (usedToday > 3) {
            alert('നിങ്ങളുടെ ഇന്നത്തെ സൗജന്യ മോക്ക് എക്സാം പരിധി (3/day) കഴിഞ്ഞു. പരിധിയില്ലാതെ പരിശീലിക്കാൻ പ്രീമിയം അൺലോക്ക് ചെയ്യുക (Use Promo: KERALAB2VIP).');
            openUpgradeModal();
            return;
          }
        }

        const result = examiner.evaluateResponse(text, state.examPart, currentTask);
        displayExaminerFeedback(result, currentTask);
      });
    }
  }

  function displayExaminerFeedback(result, currentTask) {
    const container = document.getElementById('feedbackContainer');
    if (!container) return;

    let scoreColor = result.isThemaverfehlung ? 'score-red' : (result.scoreTotal >= 75 ? 'score-green' : (result.scoreTotal >= 60 ? 'score-yellow' : 'score-red'));
    let scoreStatus = result.isThemaverfehlung ? 'THEMAVERFEHLUNG (FAIL)' : (result.scoreTotal >= 60 ? 'B2 BESTANDEN (PASS)' : 'B2 WEITER ÜBEN');

    let html = `
      <div class="feedback-card glass-panel animate-fade-in">
        <div class="feedback-top-header">
          <div class="score-display ${scoreColor}">
            <div class="score-number">${result.scoreTotal}</div>
            <div class="score-denom">/ 100</div>
            <div class="score-status">${scoreStatus}</div>
          </div>

          <div class="ratings-breakdown">
            <h5>telc B2 Bewertungskriterien (Official Grading Criteria)</h5>
            <div class="rubric-bars">
              <div class="rubric-item">
                <div class="rubric-label">
                  <span>Aufgabenbewältigung (Task Fulfillment) ${result.isThemaverfehlung ? '<span class="badge-thema-fail">⚠️ Thema verfehlt</span>' : ''}</span>
                  <strong>${result.ratings.aufgabe}%</strong>
                </div>
                <div class="bar-track"><div class="bar-fill ${result.isThemaverfehlung ? 'bar-fill-fail' : ''}" style="width: ${result.ratings.aufgabe}%"></div></div>
              </div>
              <div class="rubric-item">
                <div class="rubric-label">
                  <span>Ausdrucksfähigkeit (B2 Vocab & NVV)</span>
                  <strong>${result.ratings.ausdruck}%</strong>
                </div>
                <div class="bar-track"><div class="bar-fill" style="width: ${result.ratings.ausdruck}%"></div></div>
              </div>
              <div class="rubric-item">
                <div class="rubric-label">
                  <span>Formale Richtigkeit (Grammar)</span>
                  <strong>${result.ratings.grammatik}%</strong>
                </div>
                <div class="bar-track"><div class="bar-fill" style="width: ${result.ratings.grammatik}%"></div></div>
              </div>
              <div class="rubric-item">
                <div class="rubric-label">
                  <span>Kohärenz & Flüssigkeit (Fluency)</span>
                  <strong>${result.ratings.fluency}%</strong>
                </div>
                <div class="bar-track"><div class="bar-fill" style="width: ${result.ratings.fluency}%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Themaverfehlung Warning Banner -->
        ${result.isThemaverfehlung ? `
          <div class="thema-alert-card">
            <div class="thema-alert-header">
              <span class="thema-alert-icon">⚠️</span>
              <h4>Themaverfehlung erkannt! (Off-Topic${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? ' / വിഷയം മാറിയുള്ള സംസാരം' : ''})</h4>
            </div>
            <p class="thema-alert-de">
              Ihre Antwort geht nicht auf das vorgegebene Thema <strong>„${escapeForAttr(currentTask.title)}“</strong> ein. 
              In der telc B2 Prüfung führt eine Themaverfehlung zu erheblichem Punktabzug bei der <strong>Aufgabenbewältigung (maximal Stufe D)</strong>, wodurch die Prüfung nicht bestanden werden kann.
            </p>
            ${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? `<p class="thema-alert-ml"><strong>🇮🇳 മലയാളം:</strong> നിങ്ങൾ നൽകിയ ഉത്തരം തിരഞ്ഞെടുത്ത വിഷയവുമായി (<strong>${escapeForAttr(currentTask.titleMl || currentTask.title)}</strong>) ബന്ധപ്പെട്ടതല്ല. telc B2 പരീക്ഷയിൽ വിഷയം മാറിയാൽ 'Aufgabenbewältigung'-ൽ മാർക്ക് 20-25% ആയി കുറയുകയും പരീക്ഷയിൽ തോൽക്കുകയും ചെയ്യും.</p>` : ''}
            <p class="thema-alert-en">
              <strong>🇬🇧 English:</strong> Your response failed to address the designated topic. In official Telc B2, staying on topic is strictly required; off-topic responses receive a failing grade in Task Fulfillment.
            </p>
            <div class="thema-matched-tags">
              <span>Erkannte Themen-Begriffe:</span> 
              ${result.matchedTopicKeywords && result.matchedTopicKeywords.length > 0 
                ? result.matchedTopicKeywords.map(k => `<span class="tag tag-matched">✓ ${k}</span>`).join('') 
                : '<span class="tag-none">0 passende Begriffe zum Thema gefunden</span>'}
            </div>
          </div>
        ` : `
          ${result.matchedTopicKeywords && result.matchedTopicKeywords.length > 0 ? `
            <div class="thema-success-banner">
              🎯 <strong>Themenbezug erfüllt:</strong> ${result.matchedTopicKeywords.length} Schlüsselwörter zum Thema erkannt (${result.matchedTopicKeywords.slice(0, 5).join(', ')}).
            </div>
          ` : ''}
        `}

        <!-- Trilingual Examiner Commentary -->
        <div class="examiner-commentary-section">
          <div class="comment-box de-comment">
            <div class="comment-badge">🇩🇪 Prüferkommentar (${examiner.name})</div>
            <p>${result.germanExaminerComment}</p>
            <button class="small-audio-btn" onclick="speakGerman('${escapeForAttr(result.germanExaminerComment)}')">🔊 Vorlesen</button>
          </div>

          ${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? `
            <div class="comment-box ml-comment">
              <div class="comment-badge ml-badge">🇮🇳 മലയാളം വിലയിരുത്തൽ (Malayalam Analysis)</div>
              <p>${result.malayalamFeedback}</p>
            </div>` : ''}

          <div class="comment-box en-comment">
            <div class="comment-badge en-badge">🇬🇧 English Feedback</div>
            <p>${result.englishFeedback}</p>
          </div>
        </div>

        <!-- Detected B2 Elements -->
        <div class="detected-elements-row">
          <div class="element-tag-box">
            <h6>Erkannte B2 Konnektoren (${result.detectedConnectors.length}):</h6>
            <div class="tag-cloud">
              ${result.detectedConnectors.length > 0 
                ? result.detectedConnectors.map(c => `<span class="tag tag-connector">✓ ${c}</span>`).join('') 
                : '<span class="tag-none">Keine Konnektoren erkannt</span>'}
            </div>
          </div>

          <div class="element-tag-box">
            <h6>Nomen-Verb-Verbindungen (${result.detectedNVV.length}):</h6>
            <div class="tag-cloud">
              ${result.detectedNVV.length > 0 
                ? result.detectedNVV.map(n => `<span class="tag tag-nvv">⭐ ${n}</span>`).join('') 
                : '<span class="tag-none">Keine NVV erkannt</span>'}
            </div>
          </div>
        </div>

        <!-- Grammar Alerts -->
        ${result.grammarAlerts.length > 0 ? `
          <div class="grammar-alerts-card">
            <h5>⚠️ Grammatik-Hinweis${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? ' für Malayalam-Sprecher' : ''} (Grammar Alert)</h5>
            ${result.grammarAlerts.map(a => `
              <div class="alert-item">
                <div class="alert-rule"><strong>${a.type}:</strong> ${a.rule}</div>
                ${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? `<div class="alert-ml">${a.ml}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Next Step: Examiner Follow-up Question -->
        ${currentTask.examinerQuestions && currentTask.examinerQuestions.length > 0 ? `
          <div class="follow-up-card">
            <div class="follow-up-header">
              <h5>❓ Offizielle Prüfer-Nachfrage (Examiner Follow-up Question)</h5>
              <span class="badge telc-badge">telc Realität</span>
            </div>
            <p class="follow-up-q">${currentTask.examinerQuestions[0].question}</p>
            ${state.langMode !== 'en-only' && state.langMode !== 'de-only' ? `<div class="ml-subtext">${currentTask.examinerQuestions[0].questionMl}</div>` : ''}
            <div class="sample-answer-toggle">
              <details>
                <summary>💡 Musterantwort anzeigen (Sample B2 Answer)</summary>
                <div class="sample-ans-box">
                  <p class="de-sample"><strong>Musterantwort:</strong> ${currentTask.examinerQuestions[0].sampleAnswer}</p>
                  <p class="ml-sample"><strong>മലയാള അർത്ഥം:</strong> ${currentTask.examinerQuestions[0].sampleAnswerMl}</p>
                  <button class="audio-btn" onclick="speakGerman('${escapeForAttr(currentTask.examinerQuestions[0].sampleAnswer)}')">🔊 Antwort anhören</button>
                </div>
              </details>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    container.innerHTML = html;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
  }

  /* ========================================================
     STUDIOS (TEIL 1, 2, 3)
     ======================================================== */
  function renderTeil1Studio() {
    const container = document.getElementById('teil1Content');
    if (!container) return;

    const topics = TELC_B2_DATA.teil1;
    container.innerHTML = `
      <div class="studio-header">
        <h2>Teil 1: Präsentation (Themen & Struktur)</h2>
        <p class="subtitle">Official telc B2 presentation topics with Malayalam outline & examiner questions (3 Minuten)</p>
      </div>

      <div class="topics-accordion">
        ${topics.map((t, idx) => `
          <div class="topic-card glass-panel">
            <div class="topic-card-header">
              <div class="topic-title-group">
                <h3>${t.title}</h3>
                <span class="title-ml">${t.titleMl}</span>
                ${t.titleEn ? `<span class="title-en">${t.titleEn}</span>` : ''}
              </div>
              <button class="btn-primary" onclick="startMockPart('teil1', ${idx})">
                In Prüfung üben (Practice)
              </button>
            </div>

            <div class="topic-prompt-box">
              <p class="de-text">${nl2br(t.prompt)}</p>
            </div>

            <div class="outline-section">
              <h4>Gliederung & B2 Redemittel (പ്രസന്റേഷൻ ഘടന):</h4>
              <div class="outline-steps">
                ${t.outline.map(step => `
                  <div class="outline-step-item">
                    <div class="step-badge">${step.step}</div>
                    <div class="step-content">
                      <div class="phrase-de">
                        <span>"${step.phrase}"</span>
                        <button class="mini-speak" onclick="speakGerman('${escapeForAttr(step.phrase)}')">🔊</button>
                      </div>
                      <div class="phrase-ml">${step.ml}</div>
                      ${step.en ? `<div class="phrase-en">${step.en}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            ${t.examinerQuestions ? `
              <div class="examiner-qa-section">
                <h4>Häufige Prüferfragen:</h4>
                ${t.examinerQuestions.map(q => `
                  <div class="qa-item">
                    <p class="qa-q"><strong>Prüfer:</strong> ${q.question}</p>
                    <p class="qa-q-ml">${q.questionMl}</p>
                    ${q.questionEn ? `<p class="qa-q-en">${q.questionEn}</p>` : ''}
                    <div class="qa-ans">
                      <p><strong>Musterantwort:</strong> ${q.sampleAnswer}</p>
                      <p class="ml-subtext">${q.sampleAnswerMl}</p>
                      ${q.sampleAnswerEn ? `<p class="en-subtext">${q.sampleAnswerEn}</p>` : ''}
                      <button class="mini-speak" onclick="speakGerman('${escapeForAttr(q.sampleAnswer)}')">🔊 Anhören</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderTeil2Studio() {
    const container = document.getElementById('teil2Content');
    if (!container) return;

    const topics = TELC_B2_DATA.teil2;
    container.innerHTML = `
      <div class="studio-header">
        <h2>Teil 2: Diskussion (Argumentieren & Meinungen)</h2>
        <p class="subtitle">Controversial texts with Pro & Contra arguments and translations (5 Minuten)</p>
      </div>

      <div class="diskussion-grid">
        ${topics.map((t, idx) => `
          <div class="topic-card glass-panel">
            <div class="topic-card-header">
              <div>
                <h3>${t.title}</h3>
                <span class="title-ml">${t.titleMl}</span>
                ${t.titleEn ? `<span class="title-en">${t.titleEn}</span>` : ''}
              </div>
              <button class="btn-primary" onclick="startMockPart('teil2', ${idx})">
                Diskussion üben
              </button>
            </div>

            <div class="context-article-box">
              <div class="article-de">
                <p><strong>Lesetext:</strong> ${t.contextText}</p>
                <button class="mini-speak" onclick="speakGerman('${escapeForAttr(t.contextText)}')">🔊 Text anhören</button>
              </div>
              <div class="article-ml">
                <p><strong>മലയാള സംഗ്രഹം:</strong> ${t.contextTextMl}</p>
              </div>
              ${t.contextTextEn ? `
                <div class="article-en">
                  <p><strong>English Summary:</strong> ${t.contextTextEn}</p>
                </div>
              ` : ''}
            </div>

            <div class="arguments-split">
              <div class="pro-column">
                <h4 class="pro-heading">👍 Pro-Argumente (അനുകൂല വാദങ്ങൾ)</h4>
                <ul>
                  ${t.proArguments.map(arg => `
                    <li>
                      <div class="arg-de">
                        <span>${arg.de}</span>
                        <button class="mini-speak" onclick="speakGerman('${escapeForAttr(arg.de)}')">🔊</button>
                      </div>
                      <div class="arg-ml">${arg.ml}</div>
                      ${arg.en ? `<div class="arg-en">${arg.en}</div>` : ''}
                    </li>
                  `).join('')}
                </ul>
              </div>

              <div class="contra-column">
                <h4 class="contra-heading">👎 Contra-Argumente (പ്രതികൂല വാദങ്ങൾ)</h4>
                <ul>
                  ${t.contraArguments.map(arg => `
                    <li>
                      <div class="arg-de">
                        <span>${arg.de}</span>
                        <button class="mini-speak" onclick="speakGerman('${escapeForAttr(arg.de)}')">🔊</button>
                      </div>
                      <div class="arg-ml">${arg.ml}</div>
                      ${arg.en ? `<div class="arg-en">${arg.en}</div>` : ''}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderTeil3Studio() {
    const container = document.getElementById('teil3Content');
    if (!container) return;

    const topics = TELC_B2_DATA.teil3;
    container.innerHTML = `
      <div class="studio-header">
        <h2>Teil 3: Problemlösung / Gemeinsam planen</h2>
        <p class="subtitle">Authentic workplace & healthcare scenarios with collaborative tasks (5 Minuten)</p>
      </div>

      <div class="planning-scenarios">
        ${topics.map((t, idx) => `
          <div class="topic-card glass-panel">
            <div class="topic-card-header">
              <div>
                <h3>${t.title}</h3>
                <span class="title-ml">${t.titleMl}</span>
                ${t.titleEn ? `<span class="title-en">${t.titleEn}</span>` : ''}
              </div>
              <button class="btn-primary" onclick="startMockPart('teil3', ${idx})">
                Szenario simulieren
              </button>
            </div>

            <div class="situation-box">
              <p class="de-text"><strong>Situation:</strong> ${t.situation}</p>
              <p class="ml-text"><strong>സാഹചര്യം:</strong> ${t.situationMl}</p>
              ${t.situationEn ? `<p class="en-text"><strong>Situation (EN):</strong> ${t.situationEn}</p>` : ''}
            </div>

            <div class="tasks-checklist">
              <h4>Zu planende Aufgaben:</h4>
              <div class="task-check-grid">
                ${t.tasks.map(task => `
                  <div class="task-check-card">
                    <div class="check-icon">📌</div>
                    <div>
                      <div class="task-point-de">${task.point}</div>
                      <div class="task-point-ml">${task.ml}</div>
                      ${task.en ? `<div class="task-point-en">${task.en}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            ${t.dialoguePrompts ? `
              <div class="dialogue-example-box">
                <h4>Beispieldialog:</h4>
                ${t.dialoguePrompts.map(d => `
                  <div class="dialogue-line">
                    <span class="role-badge">${d.role}</span>
                    <div class="line-content">
                      <p class="line-de">${d.text || d.suggestion}</p>
                      <p class="line-ml">${d.ml}</p>
                      ${d.en ? `<p class="line-en">${d.en}</p>` : ''}
                      <button class="mini-speak" onclick="speakGerman('${escapeForAttr(d.text || d.suggestion)}')">🔊</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderRedemittelTab() {
    const container = document.getElementById('redemittelContent');
    if (!container) return;

    container.innerHTML = `
      <div class="studio-header">
        <h2>telc B2 Redemittel & Formulierungshilfen</h2>
        <p class="subtitle">Essential phrases organized by exam parts with native audio, English & Malayalam</p>
      </div>

      <div class="redemittel-toolbar">
        <div class="redemittel-tabs">
          <button class="sub-tab-btn active" onclick="switchRedemittelPart('teil1')">Teil 1: Präsentation</button>
          <button class="sub-tab-btn" onclick="switchRedemittelPart('teil2')">Teil 2: Diskussion</button>
          <button class="sub-tab-btn" onclick="switchRedemittelPart('teil3')">Teil 3: Problemlösung</button>
        </div>

        <div class="redemittel-search-box">
          <input type="text" id="redemittelSearchInput" class="styled-search-input" placeholder="🔍 Redemittel durchsuchen... (Search German, English or Malayalam)" value="${escapeForAttr(state.redemittelSearch)}">
        </div>
      </div>

      <div id="redemittelPartDisplay" class="redemittel-category-list"></div>
    `;

    const searchInput = document.getElementById('redemittelSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.redemittelSearch = e.target.value.toLowerCase().trim();
        const activeSubBtn = document.querySelector('.redemittel-tabs .sub-tab-btn.active');
        const activePart = activeSubBtn ? (activeSubBtn.textContent.includes('Teil 1') ? 'teil1' : (activeSubBtn.textContent.includes('Teil 2') ? 'teil2' : 'teil3')) : 'teil1';
        renderRedemittelCategoryList(activePart);
      });
    }

    renderRedemittelCategoryList('teil1');
  }

  window.switchRedemittelPart = function(part) {
    document.querySelectorAll('.redemittel-tabs .sub-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.toLowerCase().includes(part));
    });
    renderRedemittelCategoryList(part);
  };

  function renderRedemittelCategoryList(part) {
    const container = document.getElementById('redemittelPartDisplay');
    if (!container) return;

    const query = state.redemittelSearch;
    let cats = TELC_B2_DATA.redemittel[part] || [];

    if (query) {
      cats = cats.map(cat => {
        const filteredPhrases = cat.phrases.filter(p => 
          p.de.toLowerCase().includes(query) || 
          (p.en && p.en.toLowerCase().includes(query)) || 
          (p.ml && p.ml.toLowerCase().includes(query))
        );
        return { ...cat, phrases: filteredPhrases };
      }).filter(cat => cat.phrases.length > 0);
    }

    if (cats.length === 0) {
      container.innerHTML = `
        <div class="no-results-card glass-panel">
          <p>🔍 Keine Redemittel für <strong>"${state.redemittelSearch}"</strong> gefunden. Bitte versuchen Sie einen anderen Suchbegriff.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = cats.map(cat => `
      <div class="redemittel-cat-card glass-panel">
        <div class="cat-title">
          <h4>${cat.category}</h4>
        </div>
        <div class="phrases-table">
          ${cat.phrases.map(p => `
            <div class="phrase-row">
              <div class="col-de">
                <strong>${p.de}</strong>
                <button class="mini-speak" onclick="speakGerman('${escapeForAttr(p.de)}')">🔊</button>
              </div>
              <div class="col-en">${p.en || ''}</div>
              <div class="col-ml">${p.ml || ''}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderKeralaTab() {
    const container = document.getElementById('keralaContent');
    if (!container) return;

    const tips = TELC_B2_DATA.keralaTips;
    const nvv = TELC_B2_DATA.nvvList;

    container.innerHTML = `
      <div class="studio-header">
        <h2>Kerala Students' Special B2 Toolkit (കേരള വിദ്യാർത്ഥികൾക്കായി)</h2>
        <p class="subtitle">Common errors made by Malayalam native speakers and high-scoring Nomen-Verb-Verbindungen</p>
      </div>

      <!-- Interactive NVV Flashcard Deck -->
      <div class="nvv-flashcard-section glass-panel">
        <div class="section-title-row">
          <h3>⚡ Nomen-Verb-Verbindungen Flashcard Trainer</h3>
          <span class="badge nvv-badge">Card <span id="cardCounter">1</span> / ${nvv.length}</span>
        </div>

        <div class="flashcard-container" id="nvvFlashcard" onclick="flipNVVCard()" tabindex="0" role="button" aria-label="Flip flashcard">
          <div class="flashcard-inner" id="nvvFlashcardInner">
            <div class="card-front">
              <span class="card-hint">Nomen-Verb-Verbindung (ക്ലിക്ക് ചെയ്ത് അർത്ഥം കാണുക)</span>
              <h2 id="cardNVVText">${nvv[0].nvv}</h2>
              <p class="card-ex" id="cardEx">${nvv[0].ex}</p>
              <button class="audio-btn" onclick="event.stopPropagation(); speakGerman(document.getElementById('cardNVVText').textContent)">🔊 Aussprache</button>
            </div>
            <div class="card-back">
              <span class="card-hint">Bedeutung & Übersetzungen</span>
              <div class="meaning-item"><strong>Einfaches Verb:</strong> <span id="cardVerb">${nvv[0].verb}</span></div>
              <div class="meaning-item"><strong>English:</strong> <span id="cardEn">${nvv[0].en}</span></div>
              <div class="meaning-item ml-highlight"><strong>മലയാളം:</strong> <span id="cardMl">${nvv[0].ml}</span></div>
            </div>
          </div>
        </div>

        <div class="flashcard-nav">
          <button class="btn-secondary" onclick="prevNVVCard()">⬅ Vorherige (Previous)</button>
          <button class="btn-primary" onclick="nextNVVCard()">Nächste Karte (Next) ➡</button>
        </div>
      </div>

      <!-- Kerala Grammar & Word Order Tips -->
      <div class="kerala-grammar-cards">
        <h3>🎯 മലയാളികൾ സാധാരണ വരുത്തുന്ന തെറ്റുകളും പരിഹാരങ്ങളും (Key Tips)</h3>
        <div class="tips-grid">
          ${tips.map(tip => `
            <div class="tip-card glass-panel">
              <h4>${tip.title}</h4>
              <div class="tip-body">
                <p class="tip-ml">${tip.malayalam}</p>
                <p class="tip-en">${tip.english}</p>
              </div>
              <div class="tip-example-box">
                ${tip.example.incorrect ? `<div class="ex-bad">❌ ${tip.example.incorrect}</div>` : ''}
                ${tip.example.correct ? `<div class="ex-good">✔️ ${tip.example.correct}</div>` : ''}
                ${tip.example.simple ? `<div class="ex-simple">A2/B1: ${tip.example.simple}</div>` : ''}
                ${tip.example.b2Level ? `<div class="ex-b2">⭐ B2 Level: ${tip.example.b2Level}</div>` : ''}
                <div class="ex-ml">മലയാളം: ${tip.example.malayalamMeaning}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    updateNVVCard();
  }

  window.flipNVVCard = function() {
    const inner = document.getElementById('nvvFlashcardInner');
    if (inner) inner.classList.toggle('flipped');
  };

  window.nextNVVCard = function() {
    const nvv = TELC_B2_DATA.nvvList;
    state.nvvIndex = (state.nvvIndex + 1) % nvv.length;
    updateNVVCard();
  };

  window.prevNVVCard = function() {
    const nvv = TELC_B2_DATA.nvvList;
    state.nvvIndex = (state.nvvIndex - 1 + nvv.length) % nvv.length;
    updateNVVCard();
  };

  function updateNVVCard() {
    const nvv = TELC_B2_DATA.nvvList;
    const cur = nvv[state.nvvIndex];
    if (!cur) return;

    const inner = document.getElementById('nvvFlashcardInner');
    if (inner) inner.classList.remove('flipped');

    const cardNVVText = document.getElementById('cardNVVText');
    const cardEx = document.getElementById('cardEx');
    const cardVerb = document.getElementById('cardVerb');
    const cardEn = document.getElementById('cardEn');
    const cardMl = document.getElementById('cardMl');
    const counter = document.getElementById('cardCounter');

    if (cardNVVText) cardNVVText.textContent = cur.nvv;
    if (cardEx) cardEx.textContent = `"${cur.ex}"`;
    if (cardVerb) cardVerb.textContent = cur.verb;
    if (cardEn) cardEn.textContent = cur.en;
    if (cardMl) cardMl.textContent = cur.ml;
    if (counter) counter.textContent = state.nvvIndex + 1;
  }

  window.startMockPart = function(part, taskIndex) {
    if (!auth.isPremium() && taskIndex > 1) {
      openUpgradeModal();
      return;
    }

    state.examPart = part;
    state.selectedTaskIndex = taskIndex;
    resetExamTimer();
    
    const examinerTabBtn = document.querySelector('[data-tab="examiner"]');
    if (examinerTabBtn) examinerTabBtn.click();
  };

  function nl2br(str) {
    if (!str) return '';
    return str.replace(/\n/g, '<br>');
  }

  function escapeForAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, "\\'").replace(/\n/g, ' ');
  }

  // Global Keyboard Navigation Shortcuts
  document.addEventListener('keydown', (e) => {
    // ESC closes modals
    if (e.key === 'Escape') {
      closeAuthModal();
      closeUpgradeModal();
    }

    // Flashcard shortcuts when on Kerala tab & not focused on inputs
    const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (!isEditing && state.currentTab === 'kerala') {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextNVVCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevNVVCard();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipNVVCard();
      }
    }
  });

  // Initial Boot
  updateLanguageVisibility();
  renderUserAuthWidget();
  renderExaminerStage();
});
