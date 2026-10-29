/**
 * Gossip Cafe & Restaurant - Interactive Core JavaScript
 * Bardhaman, West Bengal
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      mobileToggle.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close drawer when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // 2. Dynamic Headline Keyword Rotator
  const rotatorEl = document.querySelector('.dynamic-rotator');
  if (rotatorEl) {
    const keywords = [
      'Bardhaman Foodies',
      'Artisanal Pizzas',
      'Charcoal Kebabs',
      'Celebration Feasts',
      'Intimate Gatherings'
    ];
    let currentIndex = 0;

    setInterval(() => {
      rotatorEl.style.opacity = '0';
      rotatorEl.style.transform = 'translateY(-6px)';

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % keywords.length;
        rotatorEl.textContent = keywords[currentIndex];
        rotatorEl.style.opacity = '1';
        rotatorEl.style.transform = 'translateY(0)';
      }, 400);
    }, 3200);
  }

  // 3. Hero Video Play / Pause Toggle
  const heroVideo = document.querySelector('.hero-video');
  const videoControlBtn = document.querySelector('.video-control-btn');

  if (heroVideo && videoControlBtn) {
    videoControlBtn.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play();
        videoControlBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        `;
        videoControlBtn.setAttribute('aria-label', 'Pause video');
      } else {
        heroVideo.pause();
        videoControlBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
        videoControlBtn.setAttribute('aria-label', 'Play video');
      }
    });
  }

  // 4. Animated Count-Up Telemetry Numbers (IntersectionObserver)
  const statElements = document.querySelectorAll('.stat-counter');
  if (statElements.length > 0 && 'IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetNum = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          let count = 0;
          const duration = 1600;
          const stepTime = 20;
          const increment = targetNum / (duration / stepTime);

          const timer = setInterval(() => {
            count += increment;
            if (count >= targetNum) {
              el.textContent = targetNum + suffix;
              clearInterval(timer);
            } else {
              el.textContent = Math.floor(count) + suffix;
            }
          }, stepTime);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    statElements.forEach(el => statObserver.observe(el));
  }

  // 5. Offerings Sticky Filter Rail
  const filterButtons = document.querySelectorAll('.portfolio-filter .filter-btn');
  const dishCards = document.querySelectorAll('.dish-card');

  if (filterButtons.length > 0 && dishCards.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Smooth scroll tab into center of view
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        const filterVal = btn.getAttribute('data-filter');

        dishCards.forEach(card => {
          if (filterVal === 'all' || card.getAttribute('data-category') === filterVal) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 6. Interactive Dining & Celebration Planner Calculator (Zero E-Commerce)
  const guestSlider = document.getElementById('calc-guests');
  const guestDisplay = document.getElementById('calc-guests-val');
  const eventSelect = document.getElementById('calc-event-type');
  const outPlatters = document.getElementById('calc-out-platters');
  const outCourses = document.getElementById('calc-out-courses');
  const outSeating = document.getElementById('calc-out-seating');
  const calcWaBtn = document.getElementById('calc-wa-btn');

  function updateDiningPlan() {
    if (!guestSlider || !outPlatters) return;
    const guests = parseInt(guestSlider.value, 10);
    if (guestDisplay) guestDisplay.textContent = `${guests} Guests`;

    const eventType = eventSelect ? eventSelect.value : 'dinner';

    let platters = Math.ceil(guests / 3);
    let courses = guests > 12 ? '4-Course Chef Spread' : (guests > 6 ? '3-Course Family Feast' : '2-Course Artisanal Meal');
    let seating = guests > 15 ? 'Private VIP Lounge Banqueting' : (guests > 6 ? 'Cozy Extended Family Round' : 'Intimate Cafe Table');

    outPlatters.textContent = `${platters} Signature Platters`;
    outCourses.textContent = courses;
    outSeating.textContent = seating;

    if (calcWaBtn) {
      const msg = `Namaste Gossip! We are planning a ${eventType} gathering for ${guests} guests at your Chandrolok restaurant. We would love to reserve our table and discuss the recommended ${platters} platters and ${courses}. Could you please confirm table availability?`;
      calcWaBtn.href = `https://wa.me/919083277319?text=${encodeURIComponent(msg)}`;
    }
  }

  if (guestSlider) {
    guestSlider.addEventListener('input', updateDiningPlan);
  }
  if (eventSelect) {
    eventSelect.addEventListener('change', updateDiningPlan);
  }
  updateDiningPlan();

  // 7. Generic WhatsApp Enquiry Form Handler
  const inquiryForms = document.querySelectorAll('.wa-inquiry-form');
  inquiryForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value || 'Guest';
      const phone = form.querySelector('[name="phone"]')?.value || '';
      const purpose = form.querySelector('[name="purpose"]')?.value || 'Table Reservation';
      const guests = form.querySelector('[name="guests"]')?.value || '2';
      const notes = form.querySelector('[name="notes"]')?.value || '';

      const text = `Namaste Gossip Team!\n\nI would like to inquire about ${purpose} at your Chandrolok Complex restaurant:\n• Name: ${name}\n• Phone: ${phone}\n• Guests: ${guests}\n• Special Requests: ${notes || 'None'}\n\nPlease let me know your available slots. Thank you!`;

      const targetUrl = `https://wa.me/919083277319?text=${encodeURIComponent(text)}`;
      window.open(targetUrl, '_blank');
    });
  });
});
