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
   3. SUMBANGAN MODAL (NOTICE -> REVEAL QR CODE)
   ========================================================================== */
function initSumbanganModal() {
  const sumbanganModalEl = document.getElementById('sumbanganModal');
  const noticeView = document.getElementById('sumbangan-notice-view');
  const qrView = document.getElementById('sumbangan-qr-view');
  const btnRevealQr = document.getElementById('btn-reveal-qr');

  if (!sumbanganModalEl) return;

  // Reset to Notice View every time the modal is opened
  sumbanganModalEl.addEventListener('show.bs.modal', () => {
    if (noticeView && qrView) {
      noticeView.classList.remove('d-none');
      qrView.classList.add('d-none');
    }
  });

  // Reveal QR view on clicking 'Teruskan' / Proceed
  if (btnRevealQr) {
    btnRevealQr.addEventListener('click', () => {
      noticeView.classList.add('d-none');
      qrView.classList.remove('d-none');
    });
  }
}

/* ==========================================================================
   4. RSVP FORM (FIRAFORM ENDPOINT INTEGRATION)
   ========================================================================== */
function initRSVPForm() {
  const form = document.getElementById('rsvpForm');
  const alertContainer = document.getElementById('rsvp-alert-container');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Menghantar...';

    const formData = {
      nama: form.nama.value,
      kehadiran: form.kehadiran.value,
      pax: form.pax.value,
      ucapan: form.ucapan.value,
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

      // Show success feedback
      showRSVPAlert('success', 'Terima kasih! RSVP dan ucapan anda telah berjaya dihantar.');
      form.reset();
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
