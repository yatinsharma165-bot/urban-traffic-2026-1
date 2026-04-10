/* ===== Main App Orchestrator ===== */
document.addEventListener('DOMContentLoaded', () => {

  // === Navigation ===
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      navLinks.classList.remove('mobile-open');
    });
  });

  // Active section highlighting
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // === Scroll Animations ===
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-header, .card, .stat-card, .logic-card, .about-feature').forEach(el => {
    observer.observe(el);
  });

  // === Initialize Modules ===
  let mapInitialized = false;

  TrafficEngine.subscribe((data) => {
    // Initialize map on first data
    if (!mapInitialized) {
      Dashboard.initMap(data.roads);
      mapInitialized = true;
    }

    // Update all sections
    Dashboard.updateMapMarkers(data.roads);
    Dashboard.updateStats(data.summary);
    Dashboard.updateSignalPanel(data.roads);
    Dashboard.updateRecommendations(data.roads);
    Monitoring.updateRoadCards(data.roads);
    Monitoring.updateAlerts(data.roads);
    Signals.updateTrafficLights(data.roads);
    Signals.updateMetrics(data.summary);
    DataTable.render(data.roads);
  });

  // Start traffic engine
  TrafficEngine.start(3000);

  // Initialize charts
  Monitoring.initCharts();

  // Initialize table search
  DataTable.initSearch();

  // === Contact Form ===
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button');
      btn.textContent = 'Message Sent! ✓';
      btn.style.background = 'var(--gradient-accent)';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        contactForm.reset();
      }, 2500);
    });
  }

  // Update timestamp
  setInterval(() => {
    const el = document.getElementById('last-update');
    if (el) el.textContent = new Date().toLocaleTimeString();
  }, 1000);
});
