/**
 * La Casa Del Helado — Main Module
 * Scroll effects, nav behavior, mobile menu, utilities.
 */

// ─── Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initScrollReveal();
  initNavScroll();
  initMobileMenu();
});

// ─── Scroll reveal
function initScrollReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─── Nav shadow on scroll
function initNavScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 4px 20px rgba(200,122,148,0.12)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });
}

// ─── Mobile menu
function initMobileMenu() {
  const btn  = document.getElementById('mobileMenuBtn');
  const menu = document.getElementById('mobileMenu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);

    const icon = btn.querySelector('[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', isOpen ? 'menu' : 'x');
      lucide.createIcons();
    }
  });
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.add('hidden');
  const icon = document.querySelector('#mobileMenuBtn [data-lucide]');
  if (icon) {
    icon.setAttribute('data-lucide', 'menu');
    lucide.createIcons();
  }
}

// ─── Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
