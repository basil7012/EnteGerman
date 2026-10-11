/**
 * Speech Engine: German TTS (Text-to-Speech), Speech Recognition (STT),
 * and Audio Recording for Telc B2 Oral Practice.
 * Enhanced with microphone permission verification and diagnostic event handlers.
 */

class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.selectedVoice = null;
    this.playbackRate = 1.0;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecordingAudio = false;

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const populateVoices = () => {
      const voices = this.synth.getVoices();
      const deVoices = voices.filter(v => v.lang.startsWith('de'));
      if (deVoices.length > 0) {
        this.selectedVoice = deVoices[0];
      }
    };

    populateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = populateVoices;
    }
  }

  getGermanVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices().filter(v => v.lang.startsWith('de'));
  }

  setVoice(voiceUri) {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const found = voices.find(v => v.voiceURI === voiceUri);
    if (found) this.selectedVoice = found;
  }

  setRate(rate) {
    this.playbackRate = parseFloat(rate) || 1.0;
  }

  speak(text, onEnd = null) {
    if (!this.synth) return;
    
    // Ensure synthesizer is unpaused
    this.synth.cancel();
    if (this.synth.paused) {
      this.synth.resume();
    }

    const cleanText = text.replace(/[*#_~]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';

    // Auto-pick German voice if not yet chosen
    if (!this.selectedVoice) {
      const deVoices = this.getGermanVoices();
      if (deVoices.length > 0) this.selectedVoice = deVoices[0];
    }
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.playbackRate;
    utterance.pitch = 1.0;

    this.currentUtterance = utterance;

    if (onEnd) {
      utterance.onend = (e) => {
        this.currentUtterance = null;
        onEnd(e);
      };
    } else {
      utterance.onend = () => {
        this.currentUtterance = null;
      };
    }

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      console.warn('SpeechSynthesis error:', e);
      if (onEnd) onEnd(e);
    };

    this.synth.speak(utterance);
    
    // Fallback unfreeze for Chrome idle bug
    setTimeout(() => {
      if (this.synth && this.synth.paused) {
        this.synth.resume();
      }
    }, 150);
  }

  stopSpeaking() {
    if (this.synth) this.synth.cancel();
  }

  createSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();
    rec.lang = 'de-DE';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    return rec;
  }

  async startListening(onResult, onStatusChange) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onStatusChange) onStatusChange('not_supported', 'Speech Recognition is not supported in this browser. Please use Google Chrome (Android) or Safari (iPhone/iPad).');
      return;
    }

    // Step 1: Explicitly request / check microphone permission via getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release stream so SpeechRecognition can bind to audio input device
        stream.getTracks().forEach(t => t.stop());
      } catch (micErr) {
        console.warn('Microphone permission check returned error:', micErr);
        if (onStatusChange) {
          if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
            onStatusChange('permission_denied', 'Microphone access is blocked. Please allow microphone permissions in your browser settings.');
          } else if (micErr.name === 'NotFoundError' || micErr.name === 'DevicesNotFoundError') {
            onStatusChange('no_microphone', 'No microphone detected on your device. Please connect a headset or mic.');
          } else {
            onStatusChange('error', micErr.message || micErr.name);
          }
        }
        return;
      }
    }

    // Stop any existing session, then keep listening until the user presses Stop.
    this.stopListening();
    this.onResultCb = onResult;
    this.onStatusCb = onStatusChange;
    this.wantListening = true;
    this.quickEnds = 0;
    this.networkRetries = 0;
    this._beginRecognition();
  }

  // Browsers end recognition by themselves after a few seconds of silence.
  // Each time that happens we quietly start a new session, so a pause never stops the mic.
  _beginRecognition() {
    const rec = this.createSpeechRecognition();
    if (!rec) {
      this.wantListening = false;
      if (this.onStatusCb) this.onStatusCb('not_supported');
      return;
    }
    this.recognition = rec;
    this.lastStartAt = Date.now();
    this.isListening = true;

    rec.onstart = () => {
      this.isListening = true;
      if (this.onStatusCb) this.onStatusCb('listening');
    };

    rec.onresult = (event) => {
      this.networkRetries = 0;
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      if (this.onResultCb) this.onResultCb(finalTranscript, interimTranscript);
    };

    rec.onerror = (event) => {
      if (this.recognition !== rec) return;
      console.warn('Speech recognition error event:', event.error);
      // Pauses and short interruptions are normal: onend will restart listening.
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'network' && this.networkRetries < 3) {
        this.networkRetries++;
        return;
      }
      this.wantListening = false;
      this.isListening = false;
      const cb = this.onStatusCb;
      if (!cb) return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        cb('permission_denied', 'Microphone permission blocked. Allow the microphone for this site in your browser settings.');
      } else if (event.error === 'network') {
        cb('network_error', 'Network error connecting to the speech recognition service.');
      } else {
        cb('error', event.error);
      }
    };

    rec.onend = () => {
      if (this.recognition !== rec) return;
      this.isListening = false;

      if (!this.wantListening) {
        if (this.onStatusCb) this.onStatusCb('ended');
        return;
      }

      // Guard against an endless restart loop if the browser keeps ending instantly.
      this.quickEnds = (Date.now() - this.lastStartAt < 700) ? this.quickEnds + 1 : 0;
      if (this.quickEnds >= 4) {
        this.wantListening = false;
        if (this.onStatusCb) this.onStatusCb('error', 'The microphone keeps stopping. Close other apps using the mic and try again.');
        return;
      }

      setTimeout(() => {
        if (!this.wantListening || this.recognition !== rec) return;
        try {
          this._beginRecognition();
        } catch (e) {
          this.wantListening = false;
          if (this.onStatusCb) this.onStatusCb('error', e.message);
        }
      }, 250);
    };

    try {
      rec.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
      this.wantListening = false;
      if (this.onStatusCb) this.onStatusCb('error', e.message);
    }
  }

  stopListening() {
    this.wantListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore already stopped
      }
      this.isListening = false;
    }
  }

  // Audio Recording (Microphone -> Audio Player Blob)
  async startAudioRecording(onRecordedUrl, onError) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : (MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {});

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.isRecordingAudio = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.isRecordingAudio = false;
        stream.getTracks().forEach(track => track.stop());
        if (onRecordedUrl) onRecordedUrl(audioUrl);
      };

      this.mediaRecorder.start();
      return true;
    } catch (err) {
      console.error('Media recording error:', err);
      if (onError) onError(err);
      return false;
    }
  }

  stopAudioRecording() {
    if (this.mediaRecorder && this.isRecordingAudio) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.SpeechEngine = SpeechEngine;
}
