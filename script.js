/* ============================================================
   IWILLCOACH.COM — SCRIPT.JS
   Handles: Nav scroll, mobile menu, reveal animations,
            stat counters, testimonial carousel, contact form
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. STICKY HEADER =====
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }


  // ===== 2. MOBILE HAMBURGER MENU =====
  const hamburger = document.getElementById('hamburger');
  const mainNav   = document.getElementById('main-nav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      // Animate hamburger → X
      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });

    // Close menu when a nav link is clicked
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(s => {
          s.style.transform = '';
          s.style.opacity   = '';
        });
      });
    });
  }


  // ===== 3. HERO CONTENT REVEAL ON LOAD =====
  // Stagger the hero's .reveal elements on first paint
  const heroReveals = document.querySelectorAll('.hero .reveal');
  heroReveals.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 200 + i * 150);
  });


  // ===== 4. SCROLL REVEAL (IntersectionObserver) =====
  const revealEls = document.querySelectorAll('.reveal:not(.hero .reveal)');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay) : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));


  // ===== 5. ANIMATED STAT COUNTERS =====
  const statItems = document.querySelectorAll('.stat-item');
  let statsStarted = false;

  const runCounters = () => {
    statItems.forEach((item, index) => {
      const target   = parseInt(item.dataset.count, 10);
      const el       = document.getElementById(`stat-${index}`);
      if (!el) return;

      const duration = 1800;
      const step     = 16; // ~60fps
      const increment = target / (duration / step);
      let current = 0;

      const timer = setInterval(() => {
        current = Math.min(current + increment, target);
        el.textContent = Math.floor(current);
        if (current >= target) {
          el.textContent = target;
          clearInterval(timer);
        }
      }, step);
    });
  };

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsStarted) {
      statsStarted = true;
      runCounters();
    }
  }, { threshold: 0.3 });

  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip) statsObserver.observe(statsStrip);


  // ===== 6. TESTIMONIALS CAROUSEL =====
  const track   = document.getElementById('testimonials-track');
  const dots    = document.querySelectorAll('.testi-dots .dot');
  let currentDot = 0;

  const isMobile = () => window.innerWidth < 768;
  const isTablet = () => window.innerWidth < 1024;

  const getVisibleCount = () => {
    if (isMobile())  return 1;
    if (isTablet())  return 2;
    return 4; // all visible on desktop — no scroll needed
  };

  const updateDots = (index) => {
    dots.forEach(d => d.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');
    currentDot = index;
  };

  const scrollToCard = (index) => {
    if (!track) return;
    const cards       = track.querySelectorAll('.testimonial-card');
    const visibleCount = getVisibleCount();
    if (visibleCount >= cards.length) return; // no scroll needed

    const cardWidth   = cards[0].offsetWidth + 24; // gap
    track.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    updateDots(index);
  };

  dots.forEach(dot => {
    dot.addEventListener('click', () => scrollToCard(parseInt(dot.dataset.index, 10)));
  });

  // Auto-advance testimonials on smaller screens
  let autoPlay;
  const startAutoPlay = () => {
    autoPlay = setInterval(() => {
      if (!isMobile() && !isTablet()) return; // skip on desktop
      const cards       = track ? track.querySelectorAll('.testimonial-card') : [];
      const visibleCount = getVisibleCount();
      const maxIndex    = Math.max(0, cards.length - visibleCount);
      const next = currentDot >= maxIndex ? 0 : currentDot + 1;
      scrollToCard(next);
    }, 4000);
  };

  const stopAutoPlay = () => clearInterval(autoPlay);

  if (track) {
    startAutoPlay();
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);
    track.addEventListener('touchstart',  stopAutoPlay, { passive: true });
  }


  // ===== 7. CONTACT FORM =====
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple validation
      const required = contactForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#e05252';
          valid = false;
        }
        if (field.type === 'email' && field.value && !field.value.includes('@')) {
          field.style.borderColor = '#e05252';
          valid = false;
        }
      });

      if (!valid) return;

      // Simulate submission (replace with fetch() to your backend / Formspree)
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled    = true;

      setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled    = false;
        if (formSuccess) {
          formSuccess.style.display = 'block';
          setTimeout(() => formSuccess.style.display = 'none', 5000);
        }
      }, 1200);

      /*
        TO CONNECT A REAL BACKEND:
        Replace the setTimeout above with:

        fetch('https://formspree.io/f/YOUR_FORM_ID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
        })
        .then(res => res.json())
        .then(() => { ... show success ... })
        .catch(() => { ... show error ... });
      */
    });

    // Real-time field reset on input
    contactForm.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('input', () => field.style.borderColor = '');
    });
  }


  // ===== 8. SMOOTH ANCHOR SCROLL (accounting for fixed header) =====
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 80;
      const top     = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ===== 9. ACTIVE NAV HIGHLIGHTING =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a:not(.nav-cta)');

  const highlightNav = () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${section.id}`
            ? 'var(--green-accent)'
            : '';
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });


  // ===== 10. GALLERY SLOTS: "Add your own image" hint =====
  document.querySelectorAll('.gallery-slot').forEach(slot => {
    slot.setAttribute('title', 'Replace background with your own photo');
  });

});
