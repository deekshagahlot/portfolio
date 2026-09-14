import './hover.js'

class Portfolio {
  constructor() {
    this.mx = 0; this.my = 0; this.clean = false;
    this.onMove = this.onMove.bind(this);
  }

  componentDidMount() {
    const root = document.querySelector('[data-root="1"]');
    if (!root) return;
    this.root = root;
    root.querySelectorAll('[data-strip]').forEach(el => {
      el.addEventListener('mouseenter', () => { el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 16px 34px rgba(120,104,72,0.20)'; });
      el.addEventListener('mouseleave', () => { el.style.transform = 'none'; el.style.boxShadow = '0 10px 26px rgba(120,104,72,0.12)'; });
    });
    this.objs = Array.from(root.querySelectorAll('[data-obj]'));
    this.collageText = root.querySelector('[data-collage-text]');
    this.cleanText = root.querySelector('[data-clean-text]');
    this.tip = root.querySelector('[data-tip]');
    this.grid = root.querySelector('[data-grid]');

    if (this.props.showGrid === false && this.grid) this.grid.style.opacity = '0';

    root.querySelectorAll('[data-mode]').forEach(b => {
      b.addEventListener('click', () => this.setMode(b.dataset.mode === 'clean'));
    });

    window.addEventListener('mousemove', this.onMove, { passive: true });

    root.querySelectorAll('[data-card]').forEach(card => {
      const zoom = card.querySelector('[data-zoom]');
      const arrow = card.querySelector('[data-arrow]');
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-6px)';
        if (zoom) zoom.style.transform = 'scale(1.06)';
        if (arrow) arrow.style.transform = 'translate(3px,-3px) rotate(0deg) scale(1.08)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        if (zoom) zoom.style.transform = 'scale(1)';
        if (arrow) arrow.style.transform = 'none';
      });
    });

    const reveals = Array.from(root.querySelectorAll('[data-reveal]'));
    reveals.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .8s ease ' + ((i % 4) * 70) + 'ms, transform .9s cubic-bezier(.2,.8,.2,1) ' + ((i % 4) * 70) + 'ms';
    });
    this.reveals = reveals;
    this.checkReveals = () => {
      if (!this.reveals || !this.reveals.length) return;
      const h = window.innerHeight || 800;
      this.reveals = this.reveals.filter(el => {
        const r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > -80) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          return false;
        }
        return true;
      });
    };
    this.hint = root.querySelector('[data-hint]');
    this.autoClean = () => {
      if (!this.clean && window.scrollY > 140) {
        this._silent = true;
        this.setMode(true);
        this._silent = false;
      }
    };
    window.addEventListener('scroll', this.autoClean, { passive: true });
    window.addEventListener('scroll', this.checkReveals, { passive: true });
    window.addEventListener('resize', this.checkReveals, { passive: true });
    this.checkReveals();
    requestAnimationFrame(this.checkReveals);
    this._revealT = setTimeout(() => {
      this.checkReveals();
      this._revealT2 = setTimeout(() => {
        (this.reveals || []).forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
        this.reveals = [];
      }, 2500);
    }, 400);

    this.modal = root.querySelector('[data-journal-modal]');
    this.sheet = root.querySelector('[data-journal-sheet]');
    this.leftPage = root.querySelector('[data-page="left"]');
    this.rightPage = root.querySelector('[data-page="right"]');
    this.toggleJournal = open => {
      if (!this.modal) return;
      this.modal.style.opacity = open ? '1' : '0';
      this.modal.style.pointerEvents = open ? 'auto' : 'none';
      this.sheet.style.transform = open ? 'scale(1) translateY(0) rotate(-2.2deg)' : 'scale(0.94) translateY(10px) rotate(-2.2deg)';
      clearTimeout(this._lockT);
      if (open) {
        this._lockY = window.scrollY;
        const b = document.body.style;
        b.position = 'fixed';
        b.top = -this._lockY + 'px';
        b.left = '0';
        b.right = '0';
        b.width = '100%';
        this.playOpenSound();
      } else if (this._lockY != null) {
        const b = document.body.style;
        b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = '';
        const y = this._lockY;
        this._lockY = null;
        const prev = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
        document.documentElement.style.scrollBehavior = prev;
      }
      if (this.leftPage) {
        this.leftPage.style.transition = open
          ? 'transform .75s cubic-bezier(.25,.9,.25,1) .12s, box-shadow .75s ease .12s'
          : 'transform .45s cubic-bezier(.4,0,.7,.2), box-shadow .45s ease';
        this.leftPage.style.transform = open ? 'rotateY(0deg)' : 'rotateY(-105deg)';
        this.leftPage.style.boxShadow = open ? '8px 0 24px rgba(30,26,20,0.10)' : '8px 0 24px rgba(30,26,20,0)';
      }
      if (!open && this.turnPage) this.turnPage(false);
      if (this.rightPage) {
        this.rightPage.style.transition = open ? 'opacity .5s ease .38s' : 'opacity .2s ease';
        this.rightPage.style.opacity = open ? '1' : '0';
      }
    };
    root.querySelectorAll('[data-journal-open]').forEach(el => {
      el.addEventListener('click', () => this.toggleJournal(true));
    });
    this.spread2 = root.querySelector('[data-spread="2"]');
    this.nextBtn = root.querySelector('[data-journal-next]');
    this.closeBtn = root.querySelector('[data-journal-close]');
    this.leaf = root.querySelector('[data-leaf]');
    this.turnPage = (fwd) => {
      if (!this.spread2) return;
      this._page2 = fwd;
      this.spread2.style.opacity = fwd ? '1' : '0';
      if (this.leaf) {
        clearTimeout(this._leafT);
        this.leaf.style.transition = fwd
          ? 'transform .85s cubic-bezier(.3,.85,.3,1), opacity .3s ease .62s'
          : 'transform .85s cubic-bezier(.3,.85,.3,1), opacity .2s ease';
        this.leaf.style.opacity = fwd ? '0' : '0';
        if (fwd) {
          this.leaf.style.opacity = '1';
          this.leaf.style.transform = 'rotateY(-176deg)';
          this._leafT = setTimeout(() => { this.leaf.style.opacity = '0'; }, 30);
        } else {
          this.leaf.style.transition = 'transform .85s cubic-bezier(.3,.85,.3,1), opacity .2s ease';
          this.leaf.style.opacity = '1';
          this.leaf.style.transform = 'rotateY(0deg)';
          this._leafT = setTimeout(() => { this.leaf.style.opacity = '0'; }, 700);
        }
      }
      this.nextBtn.style.opacity = fwd ? '0' : '1';
      this.nextBtn.style.pointerEvents = fwd ? 'none' : 'auto';
      this.closeBtn.style.opacity = fwd ? '1' : '0';
      this.closeBtn.style.pointerEvents = fwd ? 'auto' : 'none';
      if (this.backBtn) {
        this.backBtn.style.opacity = fwd ? '1' : '0';
        this.backBtn.style.pointerEvents = fwd ? 'auto' : 'none';
      }
      const th = this.root.querySelector('[data-turn-hint]');
      if (th) { th.style.transition = 'opacity .3s ease'; th.style.opacity = fwd ? '0' : '1'; }
    };
    this.backBtn = root.querySelector('[data-journal-back]');
    this.nextBtn.addEventListener('click', () => this.turnPage(true));
    this.sheet.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      if (!this._page2) this.turnPage(true);
    });
    if (this.backBtn) this.backBtn.addEventListener('click', () => this.turnPage(false));
    this.closeBtn.addEventListener('click', () => this.toggleJournal(false));
    this.modal.addEventListener('click', e => { if (e.target === this.modal) this.toggleJournal(false); });
    this.onKey = e => { if (e.key === 'Escape') this.toggleJournal(false); };
    window.addEventListener('keydown', this.onKey);

    this.paint();
    const hash = (window.location.hash || '').slice(1);
    if (hash) {
      const jump = () => {
        const target = root.querySelector('#' + hash) || document.getElementById(hash);
        if (!target) return;
        const el = document.scrollingElement || document.documentElement;
        const prev = el.style.scrollBehavior;
        el.style.scrollBehavior = 'auto';
        el.scrollTop = target.getBoundingClientRect().top + el.scrollTop;
        el.style.scrollBehavior = prev;
      };
      requestAnimationFrame(jump);
      setTimeout(jump, 120);
      setTimeout(jump, 600);
      window.addEventListener('load', jump, { once: true });
    }
    if (this.props.curtainIntro) this.runCurtain();
    if (this.props.startClean || this.props.curtainIntro) this.setMode(true);
    this._mounted = true;
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMove);
    if (this.checkReveals) {
      window.removeEventListener('scroll', this.checkReveals);
      window.removeEventListener('resize', this.checkReveals);
      window.removeEventListener('scroll', this.autoClean);
    }
    clearTimeout(this._revealT); clearTimeout(this._revealT2);
    if (this.onKey) window.removeEventListener('keydown', this.onKey);
  }

  onMove(e) {
    this.mx = (e.clientX / window.innerWidth - 0.5) * 2;
    this.my = (e.clientY / window.innerHeight - 0.5) * 2;
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = null; this.paint(); });
  }

  audio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this._ac = this._ac || new AC();
      if (this._ac.state === 'suspended') this._ac.resume();
      return this._ac;
    } catch (e) { return null; }
  }

  noise(ac, dur, shape) {
    const buf = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate * dur)), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * shape(i / d.length);
    const src = ac.createBufferSource();
    src.buffer = buf;
    return src;
  }

  // one paper rustle: noise burst swept through a bandpass
  rustle(ac, at, dur, f0, f1, vol) {
    const src = this.noise(ac, dur, t => Math.pow(Math.sin(Math.PI * Math.min(1, t)), 1.4));
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(f0, at);
    bp.frequency.exponentialRampToValueAtTime(f1, at + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(bp).connect(g).connect(ac.destination);
    src.start(at);
  }

  playOpenSound() {
    const ac = this.audio();
    if (!ac) return;
    const t = ac.currentTime;
    this.rustle(ac, t, 0.34, 900, 2600, 0.16);
    this.rustle(ac, t + 0.19, 0.3, 1200, 3200, 0.13);
    this.rustle(ac, t + 0.4, 0.26, 800, 2200, 0.1);
  }

  playCleanSound() {
    const ac = this.audio();
    if (!ac) return;
    const t = ac.currentTime;
    // sweeping brush-off, then a soft settle chime
    const src = this.noise(ac, 0.7, x => Math.pow(1 - x, 1.6) * Math.min(1, x * 14));
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.7;
    bp.frequency.setValueAtTime(2800, t);
    bp.frequency.exponentialRampToValueAtTime(500, t + 0.7);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    src.connect(bp).connect(g).connect(ac.destination);
    src.start(t);
    const osc = ac.createOscillator();
    const og = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t + 0.42);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.72);
    og.gain.setValueAtTime(0, t + 0.42);
    og.gain.linearRampToValueAtTime(0.05, t + 0.48);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    osc.connect(og).connect(ac.destination);
    osc.start(t + 0.42);
    osc.stop(t + 1);
  }

  runCurtain() {
    const wrap = this.root.querySelector('[data-curtain]');
    if (!wrap) return;
    const left = wrap.querySelector('[data-curtain-panel="left"]');
    const right = wrap.querySelector('[data-curtain-panel="right"]');
    const toggles = this.root.querySelector('[data-mode]');
    if (toggles && toggles.parentElement) toggles.parentElement.style.display = 'none';
    wrap.style.display = 'block';
    left.style.transform = 'translateX(0)';
    right.style.transform = 'translateX(0)';
    setTimeout(() => {
      left.style.transform = 'translateX(-101%)';
      right.style.transform = 'translateX(101%)';
    }, 650);
    setTimeout(() => { wrap.style.display = 'none'; }, 3300);
  }

  setMode(clean) {
    if (this.clean === clean) return;
    this.clean = clean;
    const on = this.root.querySelector('[data-mode="clean"]');
    const off = this.root.querySelector('[data-mode="collage"]');
    const surface = '#FBF8F0';
    const ink = '#6E6858';
    const onInk = '#FBF8F0';
    on.style.background = clean ? '#9D7A54' : surface;
    on.style.borderColor = clean ? '#2F4B7A' : 'transparent';
    on.querySelector('[data-icon]').setAttribute('fill', clean ? onInk : ink);
    off.style.background = clean ? surface : '#9D7A54';
    off.querySelector('[data-icon]').setAttribute('fill', clean ? ink : onInk);

    this.collageText.style.transition = clean
      ? 'opacity .3s ease'
      : 'opacity .55s ease .3s';
    this.collageText.style.opacity = clean ? '0' : '1';
    this.cleanText.style.transition = clean
      ? 'opacity .7s ease .35s, transform .8s cubic-bezier(.2,.8,.2,1) .35s'
      : 'opacity .22s ease, transform .3s ease';
    this.cleanText.style.opacity = clean ? '1' : '0';
    this.cleanText.style.transform = clean ? 'translateY(0)' : 'translateY(8px)';
    if (this.grid && this.props.showGrid !== false) this.grid.style.opacity = clean ? '0' : '0.9';

    if (clean && this._mounted && !this._silent) this.playCleanSound();
    if (this.hint) this.hint.style.opacity = clean ? '0' : '1';
    if (!this.lines) this.lines = this.root.querySelector('[data-lines]');
    if (this.lines) this.lines.style.opacity = clean ? '0' : '1';
    this.tip.textContent = clean ? 'Clean mode on' : 'Chaos mode on';
    this.tip.style.opacity = '1';
    this.tip.style.transform = 'translateY(0)';
    clearTimeout(this._tipT);
    this._tipT = setTimeout(() => { this.tip.style.opacity = '0'; this.tip.style.transform = 'translateY(6px)'; }, 1100);

    this.paint();
  }

  paint() {
    if (!this.objs) return;
    const clean = this.clean;
    this.objs.forEach(el => {
      const d = el.dataset;
      const rot = parseFloat(d.rot) || 0;
      const depth = parseFloat(d.depth) || 1;
      const delay = parseFloat(d.delay) || 0;
      const keep = d.keep === '1';
      const c = (d.clean || '0,0,0').split(',').map(Number);
      const px = this.mx * depth * -0.5;
      const py = this.my * depth * -0.4;
      const tx = clean ? c[0] : 0;
      const ty = clean ? c[1] : 0;
      const tr = clean ? c[2] : 0;
      el.style.transitionDelay = (clean ? delay : delay * 0.6) + 'ms';
      el.style.transform = 'translate(' + (tx + px) + 'vw,' + (ty + py) + 'vw) rotate(' + (rot + tr) + 'deg)';
      el.style.opacity = clean && !keep ? '0' : '1';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new Portfolio()
  page.props = {
    curtainIntro: false,
    startClean: false,
    showGrid: true,
  }
  page.componentDidMount()
})
