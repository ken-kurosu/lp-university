/**
 * 産学連携LP - Main JavaScript
 * Rich Interactions & Animations
 */

(function() {
  'use strict';

  // ========================================
  // Configuration
  // ========================================
  const CONFIG = {
    scrollThreshold: 300,
    animationThreshold: 0.15,
    parallaxSpeed: 0.5,
    staggerDelay: 100,
  };

  // ========================================
  // DOM Elements
  // ========================================
  const DOM = {
    topBtn: document.getElementById('topBtn'),
    floatingCta: document.getElementById('floatingCta'),
    scrollIndicator: document.querySelector('.scroll-indicator-section'),
    hero: document.querySelector('.hero'),
    fadeElements: document.querySelectorAll('.fade-in'),
    slideLeftElements: document.querySelectorAll('.slide-in-left'),
    slideRightElements: document.querySelectorAll('.slide-in-right'),
    scaleElements: document.querySelectorAll('.scale-in'),
    benefitCards: document.querySelectorAll('.benefit-card'),
    ctaButtons: document.querySelectorAll('.btn-cta-primary'),
  };

  // ========================================
  // Utility Functions
  // ========================================

  /**
   * Debounce function to limit execution rate
   */
  function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function to limit execution rate
   */
  function throttle(func, limit = 16) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Check if user prefers reduced motion
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ========================================
  // Scroll Animations (Intersection Observer)
  // ========================================
  function initScrollAnimations() {
    if (prefersReducedMotion()) {
      // Immediately show all elements if user prefers reduced motion
      document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in')
        .forEach(el => el.classList.add('visible'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: CONFIG.animationThreshold,
    };

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optionally unobserve after animation triggers
          // animationObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll(
      '.fade-in, .slide-in-left, .slide-in-right, .scale-in'
    );

    animatableElements.forEach(el => {
      animationObserver.observe(el);
    });
  }

  // ========================================
  // Stagger Animation for Benefit Cards
  // ========================================
  function initStaggerAnimation() {
    if (prefersReducedMotion()) return;

    const benefitCards = document.querySelectorAll('.benefit-card');

    const staggerObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add stagger delays
          benefitCards.forEach((card, index) => {
            card.style.transitionDelay = `${index * CONFIG.staggerDelay}ms`;
            setTimeout(() => {
              card.classList.add('visible');
            }, 50);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });

    const benefitsSection = document.getElementById('benefits');
    if (benefitsSection) {
      staggerObserver.observe(benefitsSection);
    }
  }

  // ========================================
  // Parallax Effect (Disabled for Image-only Hero)
  // ========================================
  function initParallax() {
    if (prefersReducedMotion()) return;

    const parallaxSections = document.querySelectorAll('.section--parallax, .cta-section--parallax');
    if (!parallaxSections.length) return;

    function updateParallax() {
      parallaxSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // セクションが画面内にある時のみ処理
        if (rect.bottom < 0 || rect.top > windowHeight) return;

        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const translateY = (scrollProgress - 0.5) * rect.height * CONFIG.parallaxSpeed * 0.5;

        const bg = section.querySelector(':before') || section;
        section.style.setProperty('--parallax-y', `${translateY}px`);
      });
      requestAnimationFrame(updateParallax);
    }

    // CSS変数でtransformを制御
    parallaxSections.forEach(section => {
      const before = window.getComputedStyle(section, '::before');
      if (before.content !== 'none') {
        section.classList.add('parallax-active');
      }
    });

    requestAnimationFrame(updateParallax);
  }

  // ========================================
  // Top Button (Scroll to Top)
  // ========================================
  function initTopButton() {
    const topBtn = DOM.topBtn;
    if (!topBtn) return;

    // Show/hide based on scroll position
    function toggleTopButton() {
      if (window.pageYOffset > CONFIG.scrollThreshold) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
    }

    // Scroll to top on click
    topBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (prefersReducedMotion()) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });

    window.addEventListener('scroll', throttle(toggleTopButton, 100), { passive: true });
  }

  // ========================================
  // Smooth Scroll for Anchor Links
  // ========================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Skip if it's just "#"
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const headerOffset = 0; // Adjust if you have a fixed header
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        if (prefersReducedMotion()) {
          window.scrollTo(0, targetPosition);
        } else {
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ========================================
  // CTA Button Ripple Effect
  // ========================================
  function initRippleEffect() {
    if (prefersReducedMotion()) return;

    DOM.ctaButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      .btn-cta-primary {
        position: relative;
        overflow: hidden;
      }
      .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
      }
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // Typing Effect for Hero Title (Optional)
  // ========================================
  function initTypingEffect() {
    if (prefersReducedMotion()) return;

    // This is optional - uncomment if you want typing effect
    /*
    const titleSub = document.querySelector('.hero__title-sub');
    if (!titleSub) return;

    const text = titleSub.textContent;
    titleSub.textContent = '';
    titleSub.style.visibility = 'visible';

    let i = 0;
    function typeWriter() {
      if (i < text.length) {
        titleSub.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      }
    }

    setTimeout(typeWriter, 500);
    */
  }

  // ========================================
  // Counter Animation for Numbers
  // ========================================
  function initCounterAnimation() {
    if (prefersReducedMotion()) return;

    const counters = document.querySelectorAll('[data-counter]');

    if (counters.length === 0) return;

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const endValue = parseInt(target.getAttribute('data-counter'), 10);
          const duration = 2000;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easeOut * endValue);

            target.textContent = currentValue.toLocaleString();

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          }

          requestAnimationFrame(updateCounter);
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // ========================================
  // Loading Animation
  // ========================================
  function initLoadingAnimation() {
    if (prefersReducedMotion()) {
      document.body.classList.add('loaded');
      return;
    }

    // Add loaded class after DOM is ready
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');
    });

    // Add loading styles
    const style = document.createElement('style');
    style.textContent = `
      body {
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      body.loaded {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // Hover Effects Enhancement
  // ========================================
  function initHoverEffects() {
    // Add 3D tilt effect to cards on hover (desktop only)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion()) {
      DOM.benefitCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
      });
    }
  }

  // ========================================
  // Floating CTA Button
  // ========================================
  function initFloatingCta() {
    const floatingCta = DOM.floatingCta;
    const scrollIndicator = DOM.scrollIndicator;
    const urgencySection = document.getElementById('urgency-cta');

    if (!floatingCta) return;

    function toggleFloatingCta() {
      let triggerPoint = CONFIG.scrollThreshold;

      // スクロールインジケーターがある場合は、その位置を基準にする
      if (scrollIndicator) {
        const rect = scrollIndicator.getBoundingClientRect();
        triggerPoint = rect.bottom + window.pageYOffset;
      }

      // urgency-ctaセクションに到達したら非表示
      if (urgencySection) {
        const urgencyRect = urgencySection.getBoundingClientRect();
        if (urgencyRect.top <= window.innerHeight) {
          floatingCta.classList.remove('visible');
          return;
        }
      }

      if (window.pageYOffset > triggerPoint) {
        floatingCta.classList.add('visible');
      } else {
        floatingCta.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', throttle(toggleFloatingCta, 100), { passive: true });
    // 初期チェック
    toggleFloatingCta();
  }

  // ========================================
  // Scroll Progress Indicator (Optional)
  // ========================================
  function initScrollProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
        z-index: 9999;
        transition: width 0.1s ease;
      }
    `;
    document.head.appendChild(style);

    // Update on scroll
    function updateProgress() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.pageYOffset;
      const progress = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }

    window.addEventListener('scroll', throttle(updateProgress, 16), { passive: true });
  }

  // ========================================
  // Initialize All
  // ========================================
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  }

  function initAll() {
    initLoadingAnimation();
    initScrollAnimations();
    initStaggerAnimation();
    initParallax();
    initTopButton();
    initFloatingCta();
    initSmoothScroll();
    initRippleEffect();
    initCounterAnimation();
    initHoverEffects();
    initScrollProgress();

    console.log('🚀 産学連携LP initialized');
  }

  // Start initialization
  init();

})();
