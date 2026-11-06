/* ==========================================================================
   DIGITAL WEDDING CARD - ARIFF & ANIS
   Interactive JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Cover & Audio Logic
  initCoverAndAudio();

  // Initialize Real-Time Countdown Timer
  initCountdownTimer();

  // Initialize Sumbangan Notice & QR Modal Logic
  initSumbanganModal();

  // Initialize RSVP Form Handler
  initRSVPForm();

  // Initialize Back-Button interception for all modals
  initModalBackButton();
});

/* ==========================================================================
   1. COVER TRANSITION & AUDIO CONTROLLER
   ========================================================================== */
function initCoverAndAudio() {
  const btnBuka = document.getElementById('btn-buka');
  const coverOverlay = document.getElementById('buka-cover');
  const bgAudio = document.getElementById('bg-audio');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  let isPlaying = false;
  let synthAudioContext = null;

  // Click 'BUKA' to open wedding card
  if (btnBuka) {
    btnBuka.addEventListener('click', () => {
      coverOverlay.classList.add('fade-out');
      document.body.classList.remove('cover-active');

      // Attempt HTML Audio play
      playAudio();
    });
  }

  // Toggle Audio Play/Pause
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    });
  }

  function playAudio() {
    if (bgAudio && bgAudio.src && !bgAudio.paused) {
      isPlaying = true;
      audioToggleBtn.classList.add('playing');
      return;
    }

    if (bgAudio && bgAudio.src) {
      bgAudio.play()
        .then(() => {
          isPlaying = true;
          audioToggleBtn.classList.add('playing');
          audioToggleBtn.querySelector('i').className = 'fas fa-music';
        })
        .catch(err => {
          console.log('HTML5 Audio play prevented or empty source. Falling back to ambient synth chord audio.');
          playAmbientSynthAudio();
        });
    } else {
      playAmbientSynthAudio();
    }
  }

  function pauseAudio() {
    isPlaying = false;
    audioToggleBtn.classList.remove('playing');
    audioToggleBtn.querySelector('i').className = 'fas fa-volume-mute';

    if (bgAudio) bgAudio.pause();
    if (synthAudioContext && synthAudioContext.state === 'running') {
      synthAudioContext.suspend();
    }
  }

  // Web Audio API Ambient Synthesizer Fallback (Ensures music always plays gracefully)
  function playAmbientSynthAudio() {
    try {
      if (!synthAudioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        synthAudioContext = new AudioContext();

        // Gentle Pentatonic Frequencies (Soft Malay Traditional/Ambient vibe: F#, A, B, C#, E)
        const freqs = [185.00, 220.00, 246.94, 277.18, 329.63];
        freqs.forEach((freq, index) => {
          const osc = synthAudioContext.createOscillator();
          const gain = synthAudioContext.createGain();

          osc.type = 'sine';
          osc.frequency.value = freq;

          // Soft volume
          gain.gain.setValueAtTime(0.015, synthAudioContext.currentTime);

          osc.connect(gain);
          gain.connect(synthAudioContext.destination);
          osc.start();
        });
      } else if (synthAudioContext.state === 'suspended') {
        synthAudioContext.resume();
      }

      isPlaying = true;
      audioToggleBtn.classList.add('playing');
      audioToggleBtn.querySelector('i').className = 'fas fa-music';
    } catch (e) {
      console.log('Web Audio context blocked:', e);
    }
  }
}

/* ==========================================================================
   2. COUNTDOWN TIMER
   ========================================================================== */
function initCountdownTimer() {
  // Target Wedding Date: Disember 30, 2026 11:00:00 AM
  const targetDate = new Date('December 26, 2026 11:00:00').getTime();

  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');

  if (!elDays) return;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      elDays.innerText = '00';
      elHours.innerText = '00';
      elMins.innerText = '00';
      elSecs.innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    elDays.innerText = days < 10 ? '0' + days : days;
    elHours.innerText = hours < 10 ? '0' + hours : hours;
    elMins.innerText = minutes < 10 ? '0' + minutes : minutes;
    elSecs.innerText = seconds < 10 ? '0' + seconds : seconds;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   3. SUMBANGAN MODAL (GIFT -> NOTICE -> REVEAL QR CODE)
   ========================================================================== */
function initSumbanganModal() {
  const sumbanganModalEl = document.getElementById('sumbanganModal');
  const giftView    = document.getElementById('sumbangan-gift-view');
  const noticeView  = document.getElementById('sumbangan-notice-view');
  const qrView      = document.getElementById('sumbangan-qr-view');
  const btnRevealQr = document.getElementById('btn-reveal-qr');
  const pagination  = document.getElementById('sumbangan-pagination');
  const nextBtn     = document.getElementById('sumbangan-next-btn');
  const dots        = document.querySelectorAll('.sumbangan-dot');

  if (!sumbanganModalEl) return;

  function showPage(page) {
    // 0 = gift, 1 = notice, 2 = QR
    giftView.classList.toggle('d-none',   page !== 0);
    noticeView.classList.toggle('d-none', page !== 1);
    qrView.classList.toggle('d-none',     page !== 2);

    // Hide pagination footer on QR page
    pagination.classList.toggle('d-none', page === 2);

    // Update dots (2 dots for pages 0 & 1)
    dots.forEach(dot => dot.classList.remove('active'));
    if (page < 2) dots[page]?.classList.add('active');
  }

  // Reset to gift page every time modal opens
  sumbanganModalEl.addEventListener('show.bs.modal', () => showPage(0));

  // Next arrow: gift -> notice
  nextBtn?.addEventListener('click', () => showPage(1));

  // "Teruskan ke QR" button: notice -> QR
  btnRevealQr?.addEventListener('click', () => showPage(2));
}

/* ==========================================================================
   4. MOBILE BACK BUTTON â€” CLOSE ACTIVE MODAL INSTEAD OF NAVIGATING BACK
   Automatically applies to every Bootstrap modal on the page.
   ========================================================================== */
function initModalBackButton() {
  // Track which modal (if any) pushed a history entry
  let _activeModalEl = null;

  // Listen on all modals
  document.querySelectorAll('.modal').forEach((modalEl) => {
    // On open: push a dummy history state so the back button lands here
    modalEl.addEventListener('show.bs.modal', () => {
      _activeModalEl = modalEl;
      history.pushState({ modalBackGuard: true }, '');
    });

    // On close (by any means: X, backdrop, ESC): consume the state we pushed
    modalEl.addEventListener('hide.bs.modal', () => {
      if (_activeModalEl === modalEl) {
        _activeModalEl = null;
        history.back(); // Remove the dummy entry cleanly
      }
    });
  });

  // Intercept the hardware/browser back button
  window.addEventListener('popstate', () => {
    if (_activeModalEl) {
      // Back was pressed while a modal is open â€” close the modal, don't navigate
      const bsModal = bootstrap.Modal.getInstance(_activeModalEl);
      _activeModalEl = null; // Clear first to prevent hide.bs.modal double-back
      if (bsModal) bsModal.hide();
    }
  });
}

/* ==========================================================================
   4. RSVP FORM (FIRAFORM ENDPOINT INTEGRATION)
   ========================================================================== */
const RSVP_STORAGE_KEY = 'rsvp_submission';

function initRSVPForm() {
  const form = document.getElementById('rsvpForm');
  const alertContainer = document.getElementById('rsvp-alert-container');

  if (!form) return;

  // Pre-fill & lock form if user has already submitted
  restoreRSVPState(form, alertContainer);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Menghantar...';

    const formData = {
      nama: form.nama.value,
      tel: form.tel.value,
      kehadiran: form.kehadiran.value,
      pax_dewasa: form.pax_dewasa.value,
      pax_kanak: form.pax_kanak.value,
      ucapan: form.ucapan ? form.ucapan.value : '',
      timestamp: new Date().toISOString()
    };

    const firaformEndpoint = 'https://a.firaform.com/api/f/rplc5YfVD6AbZp0qkcB5r';

    try {
      // Post to Firaform API
      const response = await fetch(firaformEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        redirect: 'manual'   // stop fetch from following Firaform's redirect (avoids CORS on /form/success)
      });

      // opaqueredirect = Firaform accepted & issued 302 redirect = success
      if (response.type !== 'opaqueredirect' && response.status >= 400) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Save submission to localStorage
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify({ submitted: true, data: formData }));

      // Show success feedback and lock form
      showRSVPAlert('success', 'Terima kasih! RSVP anda telah berjaya dihantar.');
      lockRSVPForm(form);
    } catch (error) {
      console.error('Firaform submission error:', error);
      showRSVPAlert('danger', 'Maaf, ralat berlaku semasa menghantar. Sila cuba lagi.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  function showRSVPAlert(type, message) {
    if (!alertContainer) return;
    alertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show border-0 shadow-sm" role="alert">
        <i class="fas fa-check-circle me-2"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }
}

/* ==========================================================================
   5. RSVP LOCALSTORAGE â€” Restore & lock form if already submitted
   ========================================================================== */
function restoreRSVPState(form, alertContainer) {
  try {
    const saved = localStorage.getItem(RSVP_STORAGE_KEY);
    if (!saved) return;

    const { submitted, data } = JSON.parse(saved);
    if (!submitted || !data) return;

    // Re-populate fields with saved values
    form.nama.value = data.nama || '';
    form.tel.value = data.tel || '';
    form.kehadiran.value = data.kehadiran || '';
    form.pax_dewasa.value = data.pax_dewasa || '1';
    form.pax_kanak.value = data.pax_kanak || '0';

    // Show a soft reminder banner
    if (alertContainer) {
      const date = data.timestamp ? new Date(data.timestamp).toLocaleDateString('ms-MY') : '';
      alertContainer.innerHTML = `
        <div class="alert alert-success border-0 shadow-sm mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2" role="alert">
          <div class="d-flex align-items-center gap-2">
            <i class="fas fa-check-circle fs-5 flex-shrink-0"></i>
            <span class="small">Anda telah menghantar RSVP${date ? ' pada ' + date : ''}.</span>
          </div>
          <button class="btn btn-sm btn-outline-success" id="rsvp-resubmit-btn" type="button">
            <i class="fas fa-redo me-1"></i> Hantar Semula
          </button>
        </div>
      `;

      // Allow re-submission by clearing the saved flag
      document.getElementById('rsvp-resubmit-btn')?.addEventListener('click', () => {
        localStorage.removeItem(RSVP_STORAGE_KEY);
        alertContainer.innerHTML = '';
        unlockRSVPForm(form);
      });
    }

    lockRSVPForm(form);
  } catch (e) {
    console.warn('Could not restore RSVP state:', e);
  }
}

function lockRSVPForm(form) {
  form.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-check me-2"></i> RSVP Dihantar';
  }
}

function unlockRSVPForm(form) {
  form.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i> HANTAR RSVP';
  }
}
