// Interactive Portfolio Engine for Alexander Bogolepov
document.addEventListener('DOMContentLoaded', () => {
  // Lucide Icons Initialization
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // ─── 1. Custom Video Player ──────────────────────────────────────
  const video = document.getElementById('heroVideo');
  const playBtn = document.getElementById('videoPlayBtn');
  const muteBtn = document.getElementById('videoMuteBtn');
  const progressBar = document.getElementById('videoProgress');
  const progressBarWrapper = document.getElementById('progressBarWrapper');
  const timeDisplay = document.getElementById('videoTime');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const replayIcon = document.getElementById('replayIcon');
  const replayOverlay = document.getElementById('videoReplayOverlay');
  const volumeIcon = document.getElementById('volumeIcon');
  const muteIcon = document.getElementById('muteIcon');

  function updateVideoUI(state) {
    if (state === 'playing') {
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      if (replayIcon) replayIcon.classList.add('hidden');
      if (replayOverlay) replayOverlay.classList.add('hidden');
    } else if (state === 'paused') {
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (replayIcon) replayIcon.classList.add('hidden');
      if (replayOverlay) replayOverlay.classList.add('hidden');
    } else if (state === 'ended') {
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (replayIcon) replayIcon.classList.remove('hidden');
      if (replayOverlay) replayOverlay.classList.remove('hidden');
    }
  }

  if (video && playBtn) {
    // Explicitly guarantee NO looping
    video.loop = false;
    video.removeAttribute('loop');

    // Attempt muted autoplay once on load
    video.muted = true;
    video.play().then(() => {
      updateVideoUI('playing');
    }).catch(() => {
      // Autoplay prevented by browser - show play button
      updateVideoUI('paused');
    });

    function togglePlayOrReplay() {
      // If ended or near the end, replay from start
      if (video.ended || (video.duration && video.currentTime >= video.duration - 0.2)) {
        video.currentTime = 0;
        video.play();
        updateVideoUI('playing');
      } else if (video.paused) {
        video.play();
        updateVideoUI('playing');
      } else {
        video.pause();
        updateVideoUI('paused');
      }
    }

    playBtn.addEventListener('click', togglePlayOrReplay);
    if (replayOverlay) {
      replayOverlay.addEventListener('click', togglePlayOrReplay);
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        if (video.muted) {
          volumeIcon.classList.add('hidden');
          muteIcon.classList.remove('hidden');
        } else {
          volumeIcon.classList.remove('hidden');
          muteIcon.classList.add('hidden');
        }
      });
    }

    video.addEventListener('timeupdate', () => {
      if (progressBar && video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percent}%`;
        
        const curSec = Math.floor(video.currentTime);
        const durSec = Math.floor(video.duration);
        if (timeDisplay) {
          timeDisplay.textContent = `00:${curSec < 10 ? '0' : ''}${curSec} / 00:${durSec < 10 ? '0' : ''}${durSec}`;
        }

        // Hard stop guard: guarantee the video stops at the end and NEVER loops
        if (video.currentTime >= video.duration - 0.15) {
          video.pause();
          if (progressBar) progressBar.style.width = '100%';
          updateVideoUI('ended');
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });

    // When video ends: STOP (no loop), show replay button & overlay
    video.addEventListener('ended', () => {
      video.pause();
      if (progressBar) progressBar.style.width = '100%';
      const durSec = Math.floor(video.duration || 10);
      if (timeDisplay) {
        timeDisplay.textContent = `00:${durSec < 10 ? '0' : ''}${durSec} / 00:${durSec < 10 ? '0' : ''}${durSec}`;
      }
      updateVideoUI('ended');
      if (window.lucide) window.lucide.createIcons();
    });

    video.addEventListener('pause', () => {
      if (!video.ended && (video.duration ? video.currentTime < video.duration - 0.2 : true)) {
        updateVideoUI('paused');
      }
    });

    video.addEventListener('play', () => {
      updateVideoUI('playing');
    });

    if (progressBarWrapper) {
      progressBarWrapper.addEventListener('click', (e) => {
        if (!video.duration) return;
        const rect = progressBarWrapper.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * video.duration;
        video.currentTime = newTime;
        video.play();
        updateVideoUI('playing');
      });
    }
  }

  // ─── 2. Interactive Department Tabs ─────────────────────────────
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(targetId) {
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.id === `tab-${targetId}`) {
        content.classList.remove('hidden');
        content.classList.add('animate-fadeIn');
      } else {
        content.classList.add('hidden');
        content.classList.remove('animate-fadeIn');
      }
    });

    // Re-initialize any dynamic icons inside tab
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.dataset.tab;
      switchTab(target);
      window.location.hash = target;
    });
  });

  // Handle URL hash on load
  if (window.location.hash) {
    const hash = window.location.hash.replace('#', '');
    if (document.getElementById(`tab-${hash}`)) {
      switchTab(hash);
    }
  }

  // ─── 3. Interactive AI Agent n8n Error Simulator ─────────────────
  const scenarioBtns = document.querySelectorAll('.sim-btn');
  const terminalLogs = document.getElementById('terminalOutput');
  const simSpinner = document.getElementById('simSpinner');

  async function runSimulation(scenario) {
    if (!terminalLogs) return;

    // Reset view
    if (simSpinner) simSpinner.classList.remove('hidden');
    terminalLogs.innerHTML = `
      <div class="text-cyan-400 flex items-center gap-2 mb-2">
        <span class="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span>[00:00:001] AI Agent Supervisor listening on n8n error webhook...</span>
      </div>
      <div class="text-slate-400 mb-1">[00:00:042] INCOMING ERROR INTERCEPTED. Parsing execution JSON payload...</div>
    `;

    try {
      const response = await fetch('/api/simulate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const resData = await response.json();
      const data = resData.data;

      setTimeout(() => {
        if (simSpinner) simSpinner.classList.add('hidden');

        terminalLogs.innerHTML = `
          <div class="text-rose-400 font-bold mb-2 flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400"></i>
            <span>INCIDENT CAUGHT: ${data.title}</span>
          </div>
          <div class="text-slate-300 text-xs font-mono bg-slate-900/80 p-2 rounded border border-rose-500/30 mb-3">
            <div><span class="text-slate-500">Workflow:</span> <span class="text-amber-300">${data.workflow}</span></div>
            <div><span class="text-slate-500">Raw Error:</span> <span class="text-rose-300">${data.error}</span></div>
            <div><span class="text-slate-500">Root Cause:</span> <span class="text-slate-200">${data.rootCause}</span></div>
          </div>
          <div class="text-cyan-300 font-semibold mb-1 flex items-center gap-2">
            <i data-lucide="cpu" class="w-4 h-4 text-cyan-400"></i>
            <span>Autonomous AI Agent Diagnosis (${data.latency}):</span>
          </div>
          <div class="text-slate-300 text-xs mb-3 italic pl-6 border-l-2 border-cyan-500/50">
            "${data.aiDiagnosis}"
          </div>
          <div class="text-emerald-400 font-semibold mb-1 flex items-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
            <span>Automated Self-Healing Actions Executed:</span>
          </div>
          <ul class="text-xs text-slate-300 space-y-1 mb-3 pl-6 list-disc list-inside">
            ${data.actionTaken.map(act => `<li class="text-emerald-200">${act}</li>`).join('')}
          </ul>
          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-800 font-mono">
            <span class="text-slate-400">Affected Leads: <b class="text-white">${data.leadsAffected}</b> | Recovered: <b class="text-emerald-400">${data.leadsRecovered} (100%)</b></span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">${data.recoveryStatus}</span>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
      }, 550);

    } catch (err) {
      if (simSpinner) simSpinner.classList.add('hidden');
      terminalLogs.innerHTML += `
        <div class="text-amber-400 mt-2">Error during simulation: ${err.message}. Showing cached recovery trace.</div>
      `;
    }
  }

  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioBtns.forEach(b => b.classList.remove('bg-cyan-500/20', 'border-cyan-500'));
      btn.classList.add('bg-cyan-500/20', 'border-cyan-500');
      const scenario = btn.dataset.scenario;
      runSimulation(scenario);
    });
  });

  // Run initial simulation on load
  if (scenarioBtns.length > 0) {
    runSimulation('rate_limit');
  }

  // ─── 4. Interactive CDP Mode Selector ────────────────────────────
  const cdpToggles = document.querySelectorAll('.cdp-toggle-btn');
  const cdpCards = document.querySelectorAll('.cdp-panel-card');

  cdpToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const mode = toggle.dataset.cdpMode;
      cdpToggles.forEach(t => t.classList.remove('bg-cyan-500', 'text-slate-950', 'active'));
      toggle.classList.add('bg-cyan-500', 'text-slate-950', 'active');

      cdpCards.forEach(card => {
        if (card.dataset.cdpTarget === mode) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
      if (window.lucide) window.lucide.createIcons();
    });
  });

  // ─── 5. Architecture Node Modal / Inspector ─────────────────────
  const archNodes = document.querySelectorAll('.arch-node');
  const modal = document.getElementById('archModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTech = document.getElementById('modalTech');
  const modalResilience = document.getElementById('modalResilience');
  const closeModalBtn = document.getElementById('closeArchModal');

  const nodeSpecs = {
    'traffic': {
      title: 'Global Traffic Ingestion & CAPI / MAPI AdTech Rails',
      desc: 'Captures paid and organic clicks from Meta, Google Ads, TikTok Ads, Telegram channels, and direct campaigns across 90+ countries. Ingests leads through automated MAPI (Marketing API) lead forms and synchronizes conversion feedback via CAPI.',
      tech: 'Meta CAPI, Meta MAPI, Google Ads API, TikTok Events API, GTM, GA4 Measurement Protocol, UTM/fbclid/gclid parser',
      resilience: 'Server-side CAPI event deduplication (event_id), cookie preservation (fbp/fbc), automated lookalike cohort sync via MAPI.'
    },
    'compulse': {
      title: 'Compulse.cc Continuous Tracking & Pixel Guard',
      desc: 'Alexander\'s custom-engineered 24/7 attribution assurance engine. Simulates real user sessions with Playwright to verify that tags, pixels, and CAPI webhooks fire correctly without dropping parameters.',
      tech: 'Python, Playwright Headless Browser, Meta API, GA4 Measurement Protocol, TikTok Events API, Mattermost Webhooks',
      resilience: 'Automated hourly health probes, synthetic transaction testing, zero ad-budget burn alerts.'
    },
    'queue': {
      title: 'Custom Rate Limiter & Webhook Gateway',
      desc: 'Under massive advertising spikes (20,000+ concurrent leads), generic queues struggled to handle asymmetric downstream rate limits (CRM strict 7 req/s vs WAPI/WhatsApp 40 req/s vs Accounting APIs), causing queue backpressure stalls. Alexander built a dedicated Custom Rate Limiter Gateway that receives webhooks from n8n, buffers them in Redis token buckets, prioritizes hot sales leads, and smoothly distributes traffic to downstream services with zero drops.',
      tech: 'Custom Dispatcher Microservice, Redis Token Bucket & Sorted Sets, Dynamic Jitter Backoff, High-Concurrency Pacing',
      resilience: 'Isolated multi-tenant destination queues, zero HTTP 429 CRM lockouts, automated dead-letter retry.'
    },
    'n8n': {
      title: 'Self-Hosted n8n Production Cluster (CAPI • MAPI • WAPI)',
      desc: 'Expert workflow orchestration forged by having made, debugged, and resolved every conceivable failure mode in high-load production (memory exhaustion in loop nodes, infinite execution cycles, unhandled null schema drifts, race conditions across webhook workers, and non-idempotent duplicate writes). Orchestrates the complete CAPI (Conversions), MAPI (Marketing), and WAPI (WhatsApp Business) pipeline across 100+ critical production pipelines.',
      tech: 'n8n 1.x & 2.x, CAPI • MAPI • WAPI Orchestration, Docker Swarm / Compose, PostgreSQL, Custom TypeScript code nodes, Redis Workers',
      resilience: 'Strict idempotency keys, sub-workflow error isolation, dead-letter queues (DLQ), stream chunking to eliminate worker OOM crashes.'
    },
    'crm_cdp': {
      title: 'Enterprise CRM + Custom Widgets & Scalable CDP',
      desc: 'Master customer record layer featuring custom embedded CRM UI widgets (1-click checkout generation, live settlement status from Stripe / Xendit / Mercado Pago, and contract generator). When CRM mailing limits are capped, audience segments and drip sequences scale via dedicated CDP pipelines.',
      tech: 'Enterprise CRM API v4, Custom JS Widgets, Multi-Gateway Payment Rails, Kommo Architecture, Standalone CDP Platform',
      resilience: 'Rate-limited request queuing (7 req/sec throttle), bidirectional entity synchronization, contact deduplication.'
    },
    'widgets_accounting': {
      title: 'Global & LatAm Payment Rails (Stripe, Xendit, Mercado Pago / dLocal) & Xero',
      desc: 'Unified multi-currency payment infrastructure connecting global (Stripe), Southeast Asia (Xendit - QRIS, Virtual Accounts, e-wallets), and Latin America (Mercado Pago / dLocal - PIX, Boleto, SPEI, OXXO) directly to CRM deal pipelines. Embedded widgets allow sales reps to generate localized payment links and observe real-time bank settlement verification, while closed transactions automatically trigger accounting ledger entries in Xero.',
      tech: 'Stripe API & Webhooks, Xendit API, Mercado Pago SDK, dLocal Gateway, Xero API, Redis Webhook Idempotency',
      resilience: 'Cryptographic webhook signature verification (HMAC), asynchronous voucher clearance polling, zero duplicate charge guarantees.'
    },
    'ai_monitor': {
      title: 'Autonomous AI Agent Error Interceptor',
      desc: 'Continuous monitoring bot parsing all n8n execution errors, evaluating failure criticality, executing self-healing retry routines, and alerting on Mattermost/Telegram with Root Cause Analysis.',
      tech: 'LLM Orchestration, n8n Internal API, Mattermost Webhooks, JSON diff analyzer',
      resilience: 'Proactive error containment, automated hot-patch proposals for schema drifts, 99.98% pipeline uptime.'
    }
  };

  archNodes.forEach(node => {
    node.addEventListener('click', () => {
      const id = node.dataset.nodeId;
      const spec = nodeSpecs[id];
      if (spec && modal) {
        modalTitle.textContent = spec.title;
        modalDesc.textContent = spec.desc;
        modalTech.textContent = spec.tech;
        modalResilience.textContent = spec.resilience;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    });
  });

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  }

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });

  // ─── Scroll Reveal Animations ─────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal-init');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('reveal-visible'));
  }
});
