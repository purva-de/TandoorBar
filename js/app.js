/**
 * TANDOOR BAR - CLIENT APPLICATION SCRIPT
 * Interactive video synchronization, reservations, dining bag, and theme controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. Theme Management (Light Cream / Dark Hearth)
  // =========================================================================
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlElement = document.documentElement;

  function initTheme() {
    const savedTheme = localStorage.getItem('tandoor_theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('tandoor_theme', nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Night Hearth' : 'Day Cream'} theme`);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  initTheme();

  // =========================================================================
  // 2. Toast Notification Utility
  // =========================================================================
  const toastEl = document.getElementById('toastNotification');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  // =========================================================================
  // 3. Mobile Navigation Drawer
  // =========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
      mobileNav.setAttribute('aria-hidden', !isOpen);
    });

    // Close when clicking mobile links
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // =========================================================================
  // 4. Hero Section Video & Controls
  // =========================================================================
  const heroVideo = document.getElementById('heroVideo');
  const videoPlayPauseBtn = document.getElementById('videoPlayPauseBtn');
  const videoAudioBtn = document.getElementById('videoAudioBtn');
  const videoStatusText = document.getElementById('videoStatusText');
  const audioStatusText = document.getElementById('audioStatusText');

  if (heroVideo && videoPlayPauseBtn) {
    const playIcon = videoPlayPauseBtn.querySelector('.play-icon');
    const pauseIcon = videoPlayPauseBtn.querySelector('.pause-icon');

    videoPlayPauseBtn.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play().then(() => {
          if (playIcon) playIcon.style.display = 'none';
          if (pauseIcon) pauseIcon.style.display = 'block';
          if (videoStatusText) videoStatusText.textContent = 'Live Scene';
        }).catch(() => {});
      } else {
        heroVideo.pause();
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (videoStatusText) videoStatusText.textContent = 'Paused';
      }
    });
  }

  if (heroVideo && videoAudioBtn) {
    const muteIcon = videoAudioBtn.querySelector('.mute-icon');
    const unmuteIcon = videoAudioBtn.querySelector('.unmute-icon');

    videoAudioBtn.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      if (heroVideo.muted) {
        if (muteIcon) muteIcon.style.display = 'block';
        if (unmuteIcon) unmuteIcon.style.display = 'none';
        if (audioStatusText) audioStatusText.textContent = 'Muted';
      } else {
        if (muteIcon) muteIcon.style.display = 'none';
        if (unmuteIcon) unmuteIcon.style.display = 'block';
        if (audioStatusText) audioStatusText.textContent = 'Sound On';
        showToast('Video audio unmuted');
      }
    });
  }

  // Hero carousel dots
  const heroDots = document.querySelectorAll('.hero-bottom-status .dot');
  heroDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      heroDots.forEach(d => {
        d.classList.remove('active');
        d.setAttribute('aria-selected', 'false');
      });
      dot.classList.add('active');
      dot.setAttribute('aria-selected', 'true');

      // Seek video to different chapters
      const times = [0.0, 5.0, 8.5];
      if (heroVideo) {
        heroVideo.currentTime = times[index] || 0;
        heroVideo.play().catch(() => {});
      }
    });
  });

  // =========================================================================
  // 5. Our Process Interactive Video Controller
  // =========================================================================
  const processVideo = document.getElementById('processVideo');
  const processStepChips = document.querySelectorAll('.step-chip');
  const processDots = document.querySelectorAll('.process-dots-bar .p-dot');
  const processProgressFill = document.getElementById('processProgressFill');
  const currentStepBadgeText = document.getElementById('currentStepBadgeText');

  const processStages = [
    { name: 'Step 01 • Hand-Pounded Spice Infusion', time: 0.5, pct: '20%' },
    { name: 'Step 02 • Sautéed Golden Onions & Whole Spices', time: 3.2, pct: '40%' },
    { name: 'Step 03 • Fragrant Basmati Rice Simmer', time: 5.0, pct: '60%' },
    { name: 'Step 04 • The Art of Saffron Dum Layering', time: 6.8, pct: '80%' },
    { name: 'Step 05 • Royal Dum Handi Unsealing', time: 8.5, pct: '100%' }
  ];

  function setProcessStep(index) {
    const stage = processStages[index];
    if (!stage) return;

    // Update chips
    processStepChips.forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.getAttribute('data-step')) === index);
    });

    // Update bottom dots
    processDots.forEach((dot, dIdx) => {
      dot.classList.toggle('active', dIdx === index);
    });

    // Update label & progress bar
    if (currentStepBadgeText) currentStepBadgeText.textContent = stage.name;
    if (processProgressFill) processProgressFill.style.width = stage.pct;

    // Seek and play video
    if (processVideo) {
      processVideo.currentTime = stage.time;
      processVideo.play().catch(() => {});
    }
  }

  processStepChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const stepIndex = parseInt(chip.getAttribute('data-step'), 10);
      setProcessStep(stepIndex);
    });
  });

  processDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      setProcessStep(index < processStages.length ? index : 0);
    });
  });

  // Start process video playing muted
  if (processVideo) {
    processVideo.play().catch(() => {});
    // Keep progress bar in sync during loop
    processVideo.addEventListener('timeupdate', () => {
      if (!processVideo.duration) return;
      const progress = (processVideo.currentTime / processVideo.duration) * 100;
      if (processProgressFill) processProgressFill.style.width = `${progress}%`;
    });
  }

  // =========================================================================
  // 6. Menu Filter Tabs
  // =========================================================================
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuCards = document.querySelectorAll('.menu-card');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      menuTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filterCat = tab.getAttribute('data-cat');
      menuCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (filterCat === 'all' || cardCat === filterCat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 7. Shopping Bag / Cart State & Actions
  // =========================================================================
  let cart = [
    { id: 'dish-1', title: 'Royal Awadhi Dum Biryani', price: 28, qty: 1, img: 'assets/crops/signature_pot_crop.jpg' },
    { id: 'dish-2', title: 'Charcoal Tandoori Chicken', price: 24, qty: 1, img: 'assets/images/tandoori_chicken_hero.jpg' }
  ];

  const headerCartCount = document.getElementById('headerCartCount');
  const drawerCartCount = document.getElementById('drawerCartCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTotal = document.getElementById('cartTotal');
  const cartDrawer = document.getElementById('cartDrawer');
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal > 0 ? 4.50 : 0;
    const finalTotal = subtotal + tax;

    if (headerCartCount) headerCartCount.textContent = totalItems;
    if (drawerCartCount) drawerCartCount.textContent = `${totalItems} item${totalItems === 1 ? '' : 's'}`;
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${finalTotal.toFixed(2)}`;

    // Render cart items
    if (cartItemsList) {
      if (cart.length === 0) {
        cartItemsList.innerHTML = `
          <div style="text-align: center; padding: 40px 16px; color: var(--color-text-muted);">
            <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 8px;">Your dining bag is empty</p>
            <p style="font-size: 0.875rem;">Explore our curated menu and add royal hearth specialties.</p>
          </div>
        `;
      } else {
        cartItemsList.innerHTML = cart.map(item => `
          <div class="cart-item-card" data-id="${item.id}">
            <img src="${item.img}" alt="${item.title}" class="cart-item-thumb" />
            <div class="cart-item-info">
              <h4 class="cart-item-title">${item.title}</h4>
              <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
            </div>
            <div class="cart-qty-ctrl">
              <button type="button" class="qty-btn btn-qty-minus" aria-label="Decrease quantity" data-id="${item.id}">−</button>
              <span class="qty-val" style="font-size: 0.875rem; font-weight: 600;">${item.qty}</span>
              <button type="button" class="qty-btn btn-qty-plus" aria-label="Increase quantity" data-id="${item.id}">+</button>
            </div>
          </div>
        `).join('');

        // Attach quantity handlers
        cartItemsList.querySelectorAll('.btn-qty-minus').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const item = cart.find(i => i.id === id);
            if (item) {
              if (item.qty > 1) {
                item.qty -= 1;
              } else {
                cart = cart.filter(i => i.id !== id);
              }
              updateCartUI();
            }
          });
        });

        cartItemsList.querySelectorAll('.btn-qty-plus').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const item = cart.find(i => i.id === id);
            if (item) {
              item.qty += 1;
              updateCartUI();
            }
          });
        });
      }
    }
  }

  function addToCart(dish) {
    const existing = cart.find(i => i.id === dish.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...dish, qty: 1 });
    }
    updateCartUI();
    showToast(`Added "${dish.title}" to your dining bag`);
  }

  // Wire Add to Bag buttons on menu cards
  document.querySelectorAll('.btn-sm-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const dish = {
        id: btn.getAttribute('data-id'),
        title: btn.getAttribute('data-title'),
        price: parseFloat(btn.getAttribute('data-price')),
        img: btn.getAttribute('data-img')
      };
      addToCart(dish);
    });
  });

  // Signature Dish "Order Dish" button
  const orderSignatureBtn = document.getElementById('orderSignatureBtn');
  if (orderSignatureBtn) {
    orderSignatureBtn.addEventListener('click', () => {
      addToCart({
        id: 'dish-1',
        title: 'Royal Awadhi Dum Biryani',
        price: 28,
        img: 'assets/crops/signature_pot_crop.jpg'
      });
      openCart();
    });
  }

  function openCart() {
    if (cartDrawer) {
      cartDrawer.classList.add('open');
      cartDrawer.setAttribute('aria-hidden', 'false');
    }
  }

  function closeCart() {
    if (cartDrawer) {
      cartDrawer.classList.remove('open');
      cartDrawer.setAttribute('aria-hidden', 'true');
    }
  }

  if (openCartBtn) openCartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartDrawer) {
    cartDrawer.addEventListener('click', (e) => {
      if (e.target === cartDrawer) closeCart();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Your dining bag is empty');
        return;
      }
      showToast('Redirecting to secure hearth checkout...');
      setTimeout(() => {
        alert('Thank you for ordering with Tandoor Bar! Your order has been placed with the hearth kitchen.');
        cart = [];
        updateCartUI();
        closeCart();
      }, 800);
    });
  }

  updateCartUI();

  // =========================================================================
  // 8. Reservations Modal Flow
  // =========================================================================
  const reservationModal = document.getElementById('reservationModal');
  const reservationForm = document.getElementById('reservationForm');
  const reservationSuccess = document.getElementById('reservationSuccess');
  const closeReservationBtn = document.getElementById('closeReservationBtn');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const resSuccessMsg = document.getElementById('resSuccessMsg');
  const resBookingRef = document.getElementById('resBookingRef');

  // Trigger buttons that open reservations
  const resTriggers = [
    document.getElementById('headerBookBtn'),
    document.getElementById('heroReserveBtn'),
    document.getElementById('mobileBookBtn'),
    document.getElementById('processBookBtn'),
    document.getElementById('aboutBookBtn'),
    document.getElementById('mainBookTableBtn')
  ];

  function openReservationModal() {
    if (reservationModal) {
      reservationModal.classList.add('open');
      reservationModal.setAttribute('aria-hidden', 'false');
      // Set default date to today
      const dateInput = document.getElementById('resDate');
      if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
      }
    }
  }

  function closeReservationModal() {
    if (reservationModal) {
      reservationModal.classList.remove('open');
      reservationModal.setAttribute('aria-hidden', 'true');
      // Reset form view after delay
      setTimeout(() => {
        if (reservationForm) reservationForm.style.display = 'flex';
        if (reservationSuccess) reservationSuccess.style.display = 'none';
      }, 300);
    }
  }

  resTriggers.forEach(btn => {
    if (btn) btn.addEventListener('click', openReservationModal);
  });

  if (closeReservationBtn) closeReservationBtn.addEventListener('click', closeReservationModal);
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeReservationModal);
  if (reservationModal) {
    reservationModal.addEventListener('click', (e) => {
      if (e.target === reservationModal) closeReservationModal();
    });
  }

  if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('resName').value;
      const guests = document.getElementById('resGuests').value;
      const date = document.getElementById('resDate').value;
      const time = document.getElementById('resTime').value;

      const randomRef = 'TB-' + Math.floor(1000 + Math.random() * 9000);

      if (resBookingRef) resBookingRef.textContent = `#${randomRef}`;
      if (resSuccessMsg) {
        resSuccessMsg.textContent = `Honored ${name}, your table for ${guests} on ${date} at ${time} is confirmed.`;
      }

      reservationForm.style.display = 'none';
      if (reservationSuccess) reservationSuccess.style.display = 'block';
      showToast(`Reservation confirmed: #${randomRef}`);
    });
  }

  // =========================================================================
  // 9. Full Film Cinema Modal
  // =========================================================================
  const videoFilmModal = document.getElementById('videoFilmModal');
  const openFilmModalBtn = document.getElementById('openFilmModalBtn');
  const viewDishVideoBtn = document.getElementById('viewDishVideoBtn');
  const closeFilmModalBtn = document.getElementById('closeFilmModalBtn');
  const cinemaVideo = document.getElementById('cinemaVideo');

  function openCinemaFilm(startTime = 0) {
    if (videoFilmModal && cinemaVideo) {
      videoFilmModal.classList.add('open');
      videoFilmModal.setAttribute('aria-hidden', 'false');
      cinemaVideo.currentTime = startTime;
      cinemaVideo.play().catch(() => {});
    }
  }

  function closeCinemaFilm() {
    if (videoFilmModal && cinemaVideo) {
      cinemaVideo.pause();
      videoFilmModal.classList.remove('open');
      videoFilmModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openFilmModalBtn) openFilmModalBtn.addEventListener('click', () => openCinemaFilm(0));
  if (viewDishVideoBtn) viewDishVideoBtn.addEventListener('click', () => openCinemaFilm(8.5));
  if (closeFilmModalBtn) closeFilmModalBtn.addEventListener('click', closeCinemaFilm);
  if (videoFilmModal) {
    videoFilmModal.addEventListener('click', (e) => {
      if (e.target === videoFilmModal) closeCinemaFilm();
    });
  }

  // =========================================================================
  // 10. Search Modal
  // =========================================================================
  const searchModal = document.getElementById('searchModal');
  const openSearchBtn = document.getElementById('openSearchBtn');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchInput = document.getElementById('searchInput');
  const searchResultsList = document.getElementById('searchResultsList');

  const searchableDishes = [
    { title: 'Royal Awadhi Dum Biryani', cat: 'Biryani', price: '$28', desc: 'Saffron milk, aged basmati, succulent chicken handi' },
    { title: 'Charcoal Tandoori Chicken', cat: 'Tandoor', price: '$24', desc: '900°F clay oven roasted with Kashmiri spices' },
    { title: 'Old Delhi Butter Chicken', cat: 'Curry', price: '$26', desc: 'Velvety tomato reduction with hand-pulled tandoori chicken' },
    { title: 'Peshawari Lamb Chops', cat: 'Tandoor', price: '$32', desc: 'Massaged with green papaya and black cardamom' },
    { title: 'Truffle Garlic Butter Naan', cat: 'Breads', price: '$8', desc: 'Slapped on clay walls, brushed with cultured ghee' },
    { title: 'Kacchi Hyderabadi Biryani', cat: 'Biryani', price: '$30', desc: 'Slow coals, tender lamb layered with parboiled basmati' },
    { title: 'Secret Spice Blend', cat: 'Ingredients', price: 'House Craft', desc: '18 hand-toasted heirloom spices stone ground' }
  ];

  function openSearch() {
    if (searchModal && searchInput) {
      searchModal.classList.add('open');
      searchModal.setAttribute('aria-hidden', 'false');
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 100);
      renderSearchResults('');
    }
  }

  function closeSearch() {
    if (searchModal) {
      searchModal.classList.remove('open');
      searchModal.setAttribute('aria-hidden', 'true');
    }
  }

  function renderSearchResults(query) {
    if (!searchResultsList) return;
    const cleanQuery = query.toLowerCase().trim();

    if (!cleanQuery) {
      searchResultsList.innerHTML = `
        <p class="search-hint">Try searching: <em>Biryani</em>, <em>Tandoori</em>, <em>Lamb</em>, <em>Butter Chicken</em>, <em>Naan</em></p>
      `;
      return;
    }

    const matches = searchableDishes.filter(d => 
      d.title.toLowerCase().includes(cleanQuery) ||
      d.desc.toLowerCase().includes(cleanQuery) ||
      d.cat.toLowerCase().includes(cleanQuery)
    );

    if (matches.length === 0) {
      searchResultsList.innerHTML = `<p style="padding: 16px; color: var(--color-text-muted);">No dishes found for "${query}".</p>`;
    } else {
      searchResultsList.innerHTML = matches.map(m => `
        <div style="padding: 12px 8px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-family: var(--font-serif); font-size: 1rem; color: var(--color-text);">${m.title}</h4>
            <p style="font-size: 0.8125rem; color: var(--color-text-muted);">${m.desc}</p>
          </div>
          <span style="font-weight: 700; color: var(--color-gold); font-size: 0.9375rem;">${m.price}</span>
        </div>
      `).join('');
    }
  }

  if (openSearchBtn) openSearchBtn.addEventListener('click', openSearch);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  // Keyboard shortcut: '/' opens search, 'Escape' closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') {
      closeReservationModal();
      closeCart();
      closeCinemaFilm();
      closeSearch();
      closeAccountModal();
    }
  });

  // =========================================================================
  // 11. Account / Log In Modal
  // =========================================================================
  const accountModal = document.getElementById('accountModal');
  const openAccountBtn = document.getElementById('openAccountBtn');
  const closeAccountBtn = document.getElementById('closeAccountBtn');
  const accountForm = document.getElementById('accountForm');

  function openAccountModal() {
    if (accountModal) {
      accountModal.classList.add('open');
      accountModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeAccountModal() {
    if (accountModal) {
      accountModal.classList.remove('open');
      accountModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openAccountBtn) openAccountBtn.addEventListener('click', openAccountModal);
  if (closeAccountBtn) closeAccountBtn.addEventListener('click', closeAccountModal);
  if (accountModal) {
    accountModal.addEventListener('click', (e) => {
      if (e.target === accountModal) closeAccountModal();
    });
  }

  if (accountForm) {
    accountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('accEmail').value;
      showToast(`Welcome back to the Hearth Club, ${email.split('@')[0]}!`);
      closeAccountModal();
    });
  }

  // =========================================================================
  // 12. Newsletter Submission
  // =========================================================================
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Subscribed! Tasting invites sent to ${input.value}`);
        input.value = '';
      }
    });
  }

  // =========================================================================
  // 13. Active Nav Highlight on Scroll
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => navObserver.observe(section));

  // "Learn More" in layering section jumps to process
  const layeringLearnBtn = document.getElementById('layeringLearnBtn');
  if (layeringLearnBtn) {
    layeringLearnBtn.addEventListener('click', () => {
      setProcessStep(3);
      document.getElementById('process').scrollIntoView({ behavior: 'smooth' });
    });
  }

  const viewSpiceDetailsBtn = document.getElementById('viewSpiceDetailsBtn');
  if (viewSpiceDetailsBtn) {
    viewSpiceDetailsBtn.addEventListener('click', () => {
      setProcessStep(0);
      document.getElementById('process').scrollIntoView({ behavior: 'smooth' });
    });
  }

  console.log('Tandoor Bar experience initialized with Gemini video showcase.');
});
