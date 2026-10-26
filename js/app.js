/**
 * TANDOOR BAR - MODERN INDIAN GASTRONOMY
 * Interactive Application Logic & State Management
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCart();
  initReservations();
  initNavigation();
  initAboutInteractions();
  initInteractiveMenu();
  initGalleryPage();
  initLocationsPage();
  initScrollReveal();
  init3DTilt();
  initGallerySpotlight();
  initHero3DTurntable();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Light / Dark Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('noodlebar-theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('noodlebar-theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;
  
  if (theme === 'dark') {
    toggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <span class="sr-only">Switch to light theme</span>
    `;
  } else {
    toggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
      <span class="sr-only">Switch to dark theme</span>
    `;
  }
}

/* --------------------------------------------------------------------------
   2. Cart & Bag State Management (Global)
   -------------------------------------------------------------------------- */
let cartItems = [
  {
    id: 'tandoori-wings',
    name: 'Charred Tandoori Wings',
    price: 650,
    qty: 1,
    img: 'assets/images/tandoori_chicken_hero.jpg'
  },
  {
    id: 'butter-chicken',
    name: 'Old Delhi Butter Chicken',
    price: 750,
    qty: 1,
    img: 'assets/images/butter_chicken_delhi.jpg'
  }
];

function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const modalOverlay = document.getElementById('modalOverlay');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', () => {
      closeCart();
      closeModal();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cartItems.length === 0) {
        showToast('Your bag is empty!');
        return;
      }
      closeCart();
      showSuccessModal(
        'Order Received!',
        'Your pickup order has been sent to Bandra West Flagship tandoor kitchen. Estimated prep time is 20-25 minutes.',
        'ORDER #' + Math.floor(100000 + Math.random() * 900000)
      );
      cartItems = [];
      renderCart();
    });
  }

  renderCart();
}

function openCart() {
  const cartDrawer = document.getElementById('cartDrawer');
  const modalOverlay = document.getElementById('modalOverlay');
  if (cartDrawer && modalOverlay) {
    cartDrawer.classList.add('open');
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCart() {
  const cartDrawer = document.getElementById('cartDrawer');
  const modalOverlay = document.getElementById('modalOverlay');
  if (cartDrawer && modalOverlay) {
    cartDrawer.classList.remove('open');
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function addToCart(item) {
  const existing = cartItems.find(i => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ ...item, qty: 1 });
  }
  renderCart();
  showToast(`Added "${item.name}" to your bag`);

  // Micro-interaction: Spring bounce on cart badge
  const cartDockBtn = document.querySelector('.cart-dock-btn') || document.getElementById('cartBtn');
  if (cartDockBtn) {
    cartDockBtn.classList.remove('bouncing');
    void cartDockBtn.offsetWidth; // Force CSS reflow
    cartDockBtn.classList.add('bouncing');
    setTimeout(() => cartDockBtn.classList.remove('bouncing'), 700);
  }
}

function changeQty(id, delta) {
  const item = cartItems.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cartItems = cartItems.filter(i => i.id !== id);
  }
  renderCart();
}

function renderCart() {
  const countBadge = document.getElementById('cartCountBadge');
  const itemsContainer = document.getElementById('cartDrawerItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');

  const totalCount = cartItems.reduce((acc, cur) => acc + cur.qty, 0);
  if (countBadge) {
    countBadge.textContent = totalCount;
    countBadge.style.display = totalCount > 0 ? 'flex' : 'none';
  }

  if (!itemsContainer) return;

  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; color: var(--color-text-muted);">
        <p style="font-weight: 600; font-size: 1rem; margin-bottom: 8px;">Your bag is empty</p>
        <p style="font-size: 0.875rem;">Explore our menu and add your favorite dishes.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (totalEl) totalEl.textContent = '₹0';
    return;
  }

  itemsContainer.innerHTML = cartItems.map(item => `
    <article class="cart-item-row" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-details">
        <div>
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-price">₹${item.price.toLocaleString('en-IN')} each</span>
        </div>
        <div class="cart-qty-controls">
          <button type="button" class="qty-btn" onclick="changeQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <span class="qty-num">${item.qty}</span>
          <button type="button" class="qty-btn" onclick="changeQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
          <span style="margin-left: auto; font-weight: 700; font-size: 0.9375rem; color: var(--color-gold);">
            ₹${(item.price * item.qty).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </article>
  `).join('');

  const subtotal = cartItems.reduce((acc, cur) => acc + (cur.price * cur.qty), 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
}

window.changeQty = changeQty;
window.openCart = openCart;
window.addToCart = addToCart;

/* --------------------------------------------------------------------------
   3. Streamlined Table Reservation System (Minimal Questions)
   -------------------------------------------------------------------------- */
let bookingState = {
  guests: '2 Guests',
  date: 'Tonight',
  time: '8:00 PM',
  location: 'Bandra West Flagship, Mumbai'
};

function initReservations() {
  const form = document.getElementById('reservationForm');
  const closeSuccessBtn = document.getElementById('closeModalBtn');
  const reserveTriggers = document.querySelectorAll('.trigger-reserve-modal, #navReserveBtn');
  const guestPills = document.querySelectorAll('#guestPillGroup .booking-pill');
  const datePills = document.querySelectorAll('#datePillGroup .booking-pill:not(.date-picker-pill)');
  const customDateInput = document.getElementById('reserveDateInput');
  const datePickerLabel = document.getElementById('datePickerLabel');
  const timeCards = document.querySelectorAll('#timeSlotGroup .booking-time-card');
  const locationSelect = document.getElementById('reserveLocation');
  const btnSummary = document.getElementById('btnDynamicSummary');

  function updateButtonSummary() {
    if (!btnSummary) return;
    const guestShort = bookingState.guests.replace(' Guests', '').replace(' Guest', '');
    btnSummary.textContent = `Confirm Table for ${guestShort} • ${bookingState.time} ${bookingState.date}`;
  }

  // 1. Party Size Selection
  guestPills.forEach(pill => {
    pill.addEventListener('click', () => {
      guestPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-checked', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-checked', 'true');
      bookingState.guests = pill.dataset.value || pill.textContent.trim();
      updateButtonSummary();
    });
  });

  // 2. Date Selection
  datePills.forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#datePillGroup .booking-pill').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-checked', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-checked', 'true');
      bookingState.date = pill.dataset.value || pill.textContent.trim();
      if (datePickerLabel) datePickerLabel.textContent = 'Custom Date 📅';
      updateButtonSummary();
    });
  });

  // Custom Date Picker Handler
  if (customDateInput) {
    customDateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        document.querySelectorAll('#datePillGroup .booking-pill').forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-checked', 'false');
        });
        const dateObj = new Date(e.target.value);
        const options = { month: 'short', day: 'numeric' };
        const formatted = dateObj.toLocaleDateString('en-IN', options);
        bookingState.date = formatted;
        if (datePickerLabel) datePickerLabel.textContent = `${formatted} 📅`;
        const pickerPill = customDateInput.closest('.date-picker-pill');
        if (pickerPill) {
          pickerPill.classList.add('active');
          pickerPill.setAttribute('aria-checked', 'true');
        }
        updateButtonSummary();
      }
    });
  }

  // 3. Time Selection
  timeCards.forEach(card => {
    card.addEventListener('click', () => {
      timeCards.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');
      bookingState.time = card.dataset.time || card.querySelector('.time-hour').textContent.trim();
      updateButtonSummary();
    });
  });

  // Location Dropdown Handling (Custom Dropdown + Select Sync)
  const dropdownWrap = document.getElementById('locationDropdownWrap');
  const dropdownBtn = document.getElementById('locationDropdownBtn');
  const dropdownItems = document.querySelectorAll('.custom-dropdown-item');
  const selectedText = document.getElementById('locationSelectedText');

  if (dropdownBtn && dropdownWrap) {
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownWrap.classList.toggle('open');
      dropdownBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    dropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownItems.forEach(i => {
          i.classList.remove('active');
          i.setAttribute('aria-selected', 'false');
        });
        item.classList.add('active');
        item.setAttribute('aria-selected', 'true');

        const val = item.dataset.value;
        const label = item.dataset.label || item.querySelector('.city-name').textContent.trim();
        
        bookingState.location = val;
        if (selectedText) selectedText.textContent = label;
        if (locationSelect) locationSelect.value = val;

        dropdownWrap.classList.remove('open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!dropdownWrap.contains(e.target)) {
        dropdownWrap.classList.remove('open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (locationSelect) {
    locationSelect.addEventListener('change', (e) => {
      bookingState.location = e.target.value;
    });
  }

  // Triggers (Nav & Floating links)
  reserveTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const section = document.getElementById('reservations');
      if (section) {
        e.preventDefault();
        section.scrollIntoView({ behavior: 'smooth' });
      } else {
        e.preventDefault();
        showReservationQuickModal();
      }
    });
  });

  // Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = locationSelect ? locationSelect.value : bookingState.location;
      const code = 'TB-' + Math.floor(100000 + Math.random() * 900000);

      showSuccessModal(
        'Table Reserved!',
        `Your table at Tandoor Bar (${location}) is reserved for ${bookingState.guests} on ${bookingState.date} at ${bookingState.time}.`,
        code,
        {
          location,
          date: bookingState.date,
          time: bookingState.time,
          guests: bookingState.guests,
          seating: 'Prime Clay Oven Dining Table'
        }
      );
    });
  }

  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', closeModal);
  }
}

function showReservationQuickModal() {
  const code = 'TB-' + Math.floor(100000 + Math.random() * 900000);
  showSuccessModal(
    'Table Reserved!',
    'Your table at Tandoor Bar (Bandra West Flagship) is reserved for 2 Guests tonight at 8:00 PM.',
    code,
    { location: 'Bandra West Flagship, Mumbai', date: 'Tonight', time: '8:00 PM', guests: '2 Guests', seating: 'Prime Clay Oven Dining Table' }
  );
}

function showSuccessModal(title, message, code, details) {
  const modalBox = document.getElementById('successModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const titleEl = document.getElementById('modalTitle');
  const descEl = document.getElementById('modalDesc');
  const ticketEl = document.getElementById('modalTicket');

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = message;

  if (ticketEl) {
    if (details) {
      ticketEl.innerHTML = `
        <div class="booking-ticket-row"><strong>Reservation Code:</strong> <span>${code}</span></div>
        <div class="booking-ticket-row"><strong>Location:</strong> <span>${details.location}</span></div>
        <div class="booking-ticket-row"><strong>Time:</strong> <span>${details.date} at ${details.time}</span></div>
        <div class="booking-ticket-row"><strong>Party Size:</strong> <span>${details.guests}</span></div>
        <div class="booking-ticket-row"><strong>Seating:</strong> <span>${details.seating}</span></div>
      `;
      ticketEl.style.display = 'block';
    } else {
      ticketEl.innerHTML = `<div class="booking-ticket-row"><strong>Reference:</strong> <span>${code}</span></div>`;
      ticketEl.style.display = 'block';
    }
  }

  if (modalBox && modalOverlay) {
    modalBox.classList.add('open');
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modalBox = document.getElementById('successModal');
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalBox) modalBox.classList.remove('open');
  if (modalOverlay) modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* --------------------------------------------------------------------------
   4. Page-Specific Interactions: About (Slurp Stanza)
   -------------------------------------------------------------------------- */
function initAboutInteractions() {
  const slurpLines = document.querySelectorAll('.slurp-line');
  slurpLines.forEach(line => {
    line.addEventListener('mouseenter', () => {
      slurpLines.forEach(l => l.classList.remove('active'));
      line.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   5. Page-Specific Interactions: Interactive Editorial Menu (Modern Indian)
   -------------------------------------------------------------------------- */
const MENU_DATA = {
  'to-start': {
    name: 'Chaat & Crunch',
    idx: '01',
    thumb: 'assets/images/tandoori_chicken_hero.jpg',
    badge: 'STREET REFINED',
    dishes: [
      {
        id: 'truffle-dahi-puri',
        name: 'Truffle Dahi Puri',
        price: 450,
        desc: 'Crisp semolina puris, whipped yogurt, winter black truffle oil, and date-tamarind glaze.',
        isVeg: true,
        isClayOven: false,
        isSignature: true,
        spice: '🌶️ Mild',
        badge: 'House Special',
        img: 'assets/images/tartare_dish.jpg',
        tags: ['🌱 Pure Veg', '⭐ Signatures', 'Truffle Oil']
      },
      {
        id: 'avocado-papdi-chaat',
        name: 'Avocado Papdi Chaat',
        price: 490,
        desc: 'Hass avocado mash, heirloom potato crisps, ruby pomegranate pearls, and sweet mint foam.',
        isVeg: true,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Cold Crushed',
        img: 'assets/images/menu_thumb_tostart.jpg',
        tags: ['🌱 Pure Veg', 'Fresh Crushed', 'Mint Foam']
      },
      {
        id: 'gunpowder-calamari',
        name: 'Gunpowder Spiced Calamari',
        price: 620,
        desc: 'Flash-fried coastal squid tossed in podi gunpowder masala with crisp curry leaf aioli.',
        isVeg: false,
        isClayOven: false,
        isSignature: true,
        spice: '🌶️🌶️ Medium',
        badge: 'Coastal Crisp',
        img: 'assets/images/wings_art.jpg',
        tags: ['🍗 Non-Veg', 'Coastal Seafood', 'Curry Leaf']
      },
      {
        id: 'amritsari-crispy-fish',
        name: 'Amritsari Crispy Fish',
        price: 680,
        desc: 'Ajwain-spiced river sole fillet fried in light gram flour crust with mooli lacquer.',
        isVeg: false,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️🌶️ Medium',
        badge: 'Heritage Classic',
        img: 'assets/images/event_fish.jpg',
        tags: ['🍗 Non-Veg', 'River Sole', 'Ajwain Spiced']
      },
      {
        id: 'dahi-ke-kebab',
        name: 'Dahi Ke Kebab & Mint Foam',
        price: 520,
        desc: 'Silky hung curd croquettes infused with green cardamom, roasted pine nuts, and mint foam.',
        isVeg: true,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Silky Texture',
        img: 'assets/images/tartare_dish.jpg',
        tags: ['🌱 Pure Veg', 'Cardamom Hung Curd', 'Pine Nuts']
      }
    ]
  },
  'tandoor': {
    name: 'The Clay Oven',
    idx: '02',
    thumb: 'assets/images/tandoori_chicken_hero.jpg',
    badge: '🔥 900°F CLAY OVEN',
    dishes: [
      {
        id: 'charred-tandoori-wings',
        name: 'Charred Tandoori Wings',
        price: 650,
        desc: 'Clay-oven charred chicken wings basted in smoky Kashmiri chilli glaze and spiced hung yogurt.',
        isVeg: false,
        isClayOven: true,
        isSignature: true,
        spice: '🌶️🌶️ Medium',
        badge: 'Charcoal Smoked',
        img: 'assets/images/wings_art.jpg',
        tags: ['🍗 Non-Veg', '🔥 Clay Oven', '⭐ Signatures']
      },
      {
        id: 'kashmiri-lamb-seekh',
        name: 'Kashmiri Lamb Seekh Kebab',
        price: 890,
        desc: 'Hand-minced grass-fed lamb seasoned with royal cumin, fresh mint paste, and clarified butter.',
        isVeg: false,
        isClayOven: true,
        isSignature: true,
        spice: '🌶️🌶️ Medium',
        badge: 'Chef Masterpiece',
        img: 'assets/images/lamb_chops.jpg',
        tags: ['🍗 Non-Veg', '🔥 Clay Oven', '⭐ Signatures']
      },
      {
        id: 'bhatti-malai-chicken',
        name: 'Bhatti Malai Chicken Tikka',
        price: 720,
        desc: 'Tender chicken morsels steeped in clotted malai cream, green cardamom, and smoked cheese.',
        isVeg: false,
        isClayOven: true,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Melt-In-Mouth',
        img: 'assets/images/tandoori_chicken_hero.jpg',
        tags: ['🍗 Non-Veg', '🔥 Clay Oven', 'Malai Cream']
      },
      {
        id: 'smoked-ghee-tiger-prawns',
        name: 'Smoked Ghee Tiger Prawns',
        price: 1150,
        desc: 'Jumbo bay prawns skewered over charcoal, basted with turmeric-infused A2 cultured ghee.',
        isVeg: false,
        isClayOven: true,
        isSignature: true,
        spice: '🌶️🌶️ Medium',
        badge: 'Bay of Bengal',
        img: 'assets/images/event_fish.jpg',
        tags: ['🍗 Non-Veg', '🔥 Clay Oven', '⭐ Signatures']
      },
      {
        id: 'burnt-garlic-paneer-tikka',
        name: 'Burnt Garlic Paneer Tikka',
        price: 590,
        desc: 'Artisanal malai paneer, fire-blistered sweet peppers, mustard marinade, roasted garlic crust.',
        isVeg: true,
        isClayOven: true,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Clay Oven Classic',
        img: 'assets/images/tandoori_chicken_hero.jpg',
        tags: ['🌱 Pure Veg', '🔥 Clay Oven', 'Artisanal Paneer']
      }
    ]
  },
  'biryani': {
    name: 'Royal Dum Biryani',
    idx: '03',
    thumb: 'assets/images/royal_dum_biryani.jpg',
    badge: '👑 ROYAL DUM RECIPE',
    dishes: [
      {
        id: 'hyderabadi-dum-gosht',
        name: 'Royal Hyderabadi Dum Gosht',
        price: 980,
        desc: 'Prime tender lamb shanks layered with aged Daawat basmati, saffron dew, and sealed in dough.',
        isVeg: false,
        isClayOven: false,
        isSignature: true,
        spice: '🌶️🌶️🌶️ Hot',
        badge: 'Nizami Secret',
        img: 'assets/images/royal_dum_biryani.jpg',
        tags: ['🍗 Non-Veg', '👑 Royal Dum', '⭐ Signatures']
      },
      {
        id: 'awadhi-murgh-dum-biryani',
        name: 'Awadhi Murgh Dum Biryani',
        price: 850,
        desc: 'Lucknowi chicken gently cooked in fragrant yakhni broth, rose water dew, and kewra attar.',
        isVeg: false,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Lucknow Heritage',
        img: 'assets/images/royal_dum_biryani.jpg',
        tags: ['🍗 Non-Veg', 'Awadhi Yakhni', 'Kewra Dew']
      },
      {
        id: 'kathal-shiitake-biryani',
        name: 'Kathal & Shiitake Subz Biryani',
        price: 690,
        desc: 'Tender baby jackfruit, wild forest shiitake, caramelized shallots, mint-infused basmati.',
        isVeg: true,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️🌶️ Medium',
        badge: 'Earthy & Rich',
        img: 'assets/images/royal_dum_biryani.jpg',
        tags: ['🌱 Pure Veg', 'Forest Shiitake', 'Kathal Dum']
      },
      {
        id: 'saffron-jeera-pulao',
        name: 'Saffron Jeera Pulao',
        price: 350,
        desc: 'Kashmiri Mogra saffron, tempered royal cumin seeds, golden raisins, and toasted cashews.',
        isVeg: true,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Fragrant Side',
        img: 'assets/images/royal_dum_biryani.jpg',
        tags: ['🌱 Pure Veg', 'Kashmiri Saffron', 'Mild Grain']
      }
    ]
  },
  'curries': {
    name: 'Heritage Curries',
    idx: '04',
    thumb: 'assets/images/butter_chicken_delhi.jpg',
    badge: '✨ 24-HR SLOW SIMMERED',
    dishes: [
      {
        id: 'old-delhi-butter-chicken',
        name: 'Old Delhi Butter Chicken',
        price: 750,
        desc: 'Smoked tandoori chicken pulled into a velvety reduction of vine-ripened tomatoes, kasoori methi, and white butter.',
        isVeg: false,
        isClayOven: true,
        isSignature: true,
        spice: '🌶️ Mild',
        badge: 'Daryaganj 1947',
        img: 'assets/images/butter_chicken_delhi.jpg',
        tags: ['🍗 Non-Veg', 'White Butter', '⭐ Signatures']
      },
      {
        id: 'dal-makhani-24hr',
        name: '24-Hour Dal Makhani',
        price: 590,
        desc: 'Black urad lentils slow-simmered over smoldering charcoal for 24 hours with churned dairy butter.',
        isVeg: true,
        isClayOven: false,
        isSignature: true,
        spice: '🌶️ Mild',
        badge: 'Signature Dal',
        img: 'assets/images/butter_chicken_delhi.jpg',
        tags: ['🌱 Pure Veg', '24h Simmered', '⭐ Signatures']
      },
      {
        id: 'slow-braised-rogan-josh',
        name: 'Slow-Braised Rogan Josh',
        price: 950,
        desc: 'Himalayan lamb shanks braised in Kashmiri cockscomb flower herb, dried ginger, and cold-pressed mustard oil.',
        isVeg: false,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️🌶️ Medium',
        badge: 'Kashmir Valley',
        img: 'assets/images/lamb_chops.jpg',
        tags: ['🍗 Non-Veg', 'Ratan Jot Spice', 'Lamb Shank']
      },
      {
        id: 'malabar-coconut-tiger-prawn',
        name: 'Malabar Coconut Tiger Prawn',
        price: 920,
        desc: 'Coastal bay prawns simmered in fresh coconut milk, green mango shards, and toasted mustard seeds.',
        isVeg: false,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️🌶️ Medium',
        badge: 'Kerala Coast',
        img: 'assets/images/event_fish.jpg',
        tags: ['🍗 Non-Veg', 'Raw Mango', 'Coconut Milk']
      },
      {
        id: 'paneer-lababdar',
        name: 'Paneer Lababdar & Charred Peppers',
        price: 640,
        desc: 'Fresh cottage cheese cubes in a spiced onion-cashew veloute with fire-blistered sweet peppers.',
        isVeg: true,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Creamy Velvety',
        img: 'assets/images/butter_chicken_delhi.jpg',
        tags: ['🌱 Pure Veg', 'Cashew Veloute', 'Charred Peppers']
      }
    ]
  },
  'breads': {
    name: 'Breads & Sides',
    idx: '05',
    thumb: 'assets/images/butter_chicken_delhi.jpg',
    badge: '🔥 HOT FROM TANDOOR',
    dishes: [
      {
        id: 'truffle-cheddar-kulcha',
        name: 'Truffle Cheddar Kulcha',
        price: 280,
        desc: 'Leavened flatbread stuffed with aged English cheddar, finished with winter black truffle glaze.',
        isVeg: true,
        isClayOven: true,
        isSignature: true,
        spice: '🌶️ Mild',
        badge: 'Gourmet Bread',
        img: 'assets/images/butter_chicken_delhi.jpg',
        tags: ['🌱 Pure Veg', '🔥 Clay Oven', 'Aged Cheddar']
      },
      {
        id: 'smoked-garlic-herb-naan',
        name: 'Smoked Garlic & Herb Naan',
        price: 160,
        desc: 'Fluffy teardrop bread charred on clay walls, brushed with clarified butter, roasted garlic, and coriander.',
        isVeg: true,
        isClayOven: true,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Clay Oven Classic',
        img: 'assets/images/butter_chicken_delhi.jpg',
        tags: ['🌱 Pure Veg', '🔥 Clay Oven', 'Burnt Garlic']
      },
      {
        id: 'desi-ghee-laccha-paratha',
        name: 'Flaky Desi Ghee Laccha Paratha',
        price: 180,
        desc: 'Multi-layered crispy whole wheat bread folded with A2 desi ghee and toasted fenugreek.',
        isVeg: true,
        isClayOven: true,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Golden Crispy',
        img: 'assets/images/butter_chicken_delhi.jpg',
        tags: ['🌱 Pure Veg', '🔥 Clay Oven', 'Multi-Layered']
      },
      {
        id: 'burani-garlic-raita',
        name: 'Burani Garlic & Cumin Raita',
        price: 190,
        desc: 'Chilled creamy yogurt infused with golden fried garlic slices and stone-ground roasted cumin.',
        isVeg: true,
        isClayOven: false,
        isSignature: false,
        spice: '🌶️ Mild',
        badge: 'Cooling Dip',
        img: 'assets/images/tartare_dish.jpg',
        tags: ['🌱 Pure Veg', 'Fried Garlic', 'Stone Ground Cumin']
      }
    ]
  },
  'dessert': {
    name: 'Mithai & Desserts',
    idx: '06',
    thumb: 'assets/images/royal_dum_biryani.jpg',
    badge: '🍨 ROYAL INDULGENCE',
    dishes: [
      {
        id: 'saffron-pistachio-kulfi',
        name: 'Saffron Pistachio Kulfi Pop',
        price: 340,
        desc: 'Traditional slow-reduced milk kulfi on a stick with Iranian pistachios and edible 24k silver vark.',
        isVeg: true,
        isClayOven: false,
        isSignature: true,
        spice: 'Sweet',
        badge: 'Classic Chilled',
        img: 'assets/images/royal_dum_biryani.jpg',
        tags: ['🌱 Pure Veg', '24k Silver Vark', 'Pistachio Churn']
      },
      {
        id: 'old-monk-gulab-jamun-cheesecake',
        name: 'Old Monk Gulab Jamun Cheesecake',
        price: 480,
        desc: 'Baked Philadelphia cheesecake infused with dark rum-soaked gulab jamuns and cardamom crumble.',
        isVeg: true,
        isClayOven: false,
        isSignature: true,
        spice: 'Sweet',
        badge: 'Modern Fusion',
        img: 'assets/images/royal_dum_biryani.jpg',
        tags: ['🌱 Pure Veg', 'Dark Rum Soak', '⭐ Signatures']
      },
      {
        id: 'cardamom-shrikhand-tart',
        name: 'Cardamom Shrikhand Tart',
        price: 390,
        desc: 'Flaky shortcrust pastry filled with saffron-whipped hung yogurt and crushed candied almonds.',
        isVeg: true,
        isClayOven: false,
        isSignature: false,
        spice: 'Sweet',
        badge: 'Crisp & Tangy',
        img: 'assets/images/tartare_dish.jpg',
        tags: ['🌱 Pure Veg', 'Almond Praline', 'Saffron Churned']
      },
      {
        id: 'filter-coffee-gelato',
        name: 'Filter Coffee Chocolate Gelato',
        price: 360,
        desc: 'Chikmagalur roasted dark chicory coffee churned with 70% single-origin Mysore cocoa.',
        isVeg: true,
        isClayOven: false,
        isSignature: false,
        spice: 'Sweet',
        badge: 'Artisanal Batch',
        img: 'assets/images/interior.jpg',
        tags: ['🌱 Pure Veg', 'Mysore Dark Cocoa', 'Chikmagalur Roast']
      }
    ]
  }
};

let activeMenuCategory = 'to-start';
let activeMenuFilter = 'all';
let activeMenuSearch = '';
let currentSpotlightDish = null;

function initInteractiveMenu() {
  const catButtons = document.querySelectorAll('.menu-cat-btn');
  const filterChips = document.querySelectorAll('.menu-filter-chip');
  const searchInput = document.getElementById('menuSearchInput');
  const spotlightAddBtn = document.getElementById('spotlightAddBtn');

  // Category switching (Click & Hover)
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const catKey = btn.getAttribute('data-cat');
      selectMenuCategory(catKey);
    });

    btn.addEventListener('mouseenter', () => {
      // Optional subtle pre-switch on desktop hover if no active text search
      if (!activeMenuSearch) {
        const catKey = btn.getAttribute('data-cat');
        selectMenuCategory(catKey);
      }
    });
  });

  // Dietary filter chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-checked', 'true');
      activeMenuFilter = chip.getAttribute('data-filter') || 'all';
      renderMenuDishes();
    });
  });

  // Live real-time search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeMenuSearch = e.target.value.trim().toLowerCase();
      renderMenuDishes();
    });
  }

  // Spotlight Add to Bag button
  if (spotlightAddBtn) {
    spotlightAddBtn.addEventListener('click', () => {
      if (currentSpotlightDish) {
        addToCart({
          id: currentSpotlightDish.id,
          name: currentSpotlightDish.name,
          price: currentSpotlightDish.price,
          img: currentSpotlightDish.img
        });
      }
    });
  }

  // Initial render
  selectMenuCategory('to-start');
}

function selectMenuCategory(catKey) {
  if (!MENU_DATA[catKey]) return;
  activeMenuCategory = catKey;

  const catButtons = document.querySelectorAll('.menu-cat-btn');
  catButtons.forEach(b => {
    const isSelected = b.getAttribute('data-cat') === catKey;
    b.classList.toggle('active', isSelected);
    b.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  renderMenuDishes();
}

function renderMenuDishes() {
  const container = document.getElementById('menuSubitemsContainer');
  if (!container) return;

  // Determine dish pool:
  // If search query is present, search across the entire menu!
  let pool = [];
  if (activeMenuSearch) {
    Object.keys(MENU_DATA).forEach(cat => {
      pool.push(...MENU_DATA[cat].dishes);
    });
    // Filter by search query
    pool = pool.filter(d => {
      const nameMatch = d.name.toLowerCase().includes(activeMenuSearch);
      const descMatch = d.desc.toLowerCase().includes(activeMenuSearch);
      const tagMatch = d.tags.some(t => t.toLowerCase().includes(activeMenuSearch));
      return nameMatch || descMatch || tagMatch;
    });
  } else {
    pool = [...(MENU_DATA[activeMenuCategory]?.dishes || [])];
  }

  // Apply dietary filter chip
  if (activeMenuFilter === 'veg') {
    pool = pool.filter(d => d.isVeg === true);
  } else if (activeMenuFilter === 'nonveg') {
    pool = pool.filter(d => d.isVeg === false);
  } else if (activeMenuFilter === 'tandoor') {
    pool = pool.filter(d => d.isClayOven === true);
  } else if (activeMenuFilter === 'signature') {
    pool = pool.filter(d => d.isSignature === true);
  }

  // If empty results, render helpful empty state
  if (pool.length === 0) {
    container.innerHTML = `
      <div class="menu-empty-state">
        <h4>No matching dishes found</h4>
        <p>No culinary items match your current selection.</p>
        <button type="button" class="btn-outline" onclick="resetMenuFilters()">Clear Filters & Search</button>
      </div>
    `;
    return;
  }

  // Render dish cards
  container.innerHTML = pool.map((dish, idx) => {
    const vegClass = dish.isVeg ? 'veg' : 'nonveg';
    const vegTitle = dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian';
    const isSelected = currentSpotlightDish && currentSpotlightDish.id === dish.id;

    return `
      <article class="menu-dish-card ${isSelected ? 'active-spotlight' : ''}" 
               data-dish-id="${dish.id}"
               tabindex="0"
               onmouseenter="handleDishHover('${dish.id}')"
               onclick="handleDishHover('${dish.id}')"
               onkeydown="if(event.key === 'Enter') handleDishHover('${dish.id}')"
               style="animation: menuSubitemSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.04}s both;">
        
        <span class="dish-food-type-icon ${vegClass}" title="${vegTitle}" aria-label="${vegTitle}"></span>

        <div class="menu-dish-main-info">
          <div class="dish-title-row">
            <h4 class="dish-title">${dish.name}</h4>
            <span class="dish-spice-meter" title="Spice level">${dish.spice}</span>
            ${dish.badge ? `<span class="dish-badge-pill">${dish.badge}</span>` : ''}
          </div>
        </div>

        <div class="menu-dish-action-col">
          <span class="dish-price-tag">₹${dish.price.toLocaleString('en-IN')}</span>
          <button type="button" 
                  class="dish-add-bag-btn" 
                  onclick="handleDishAdd(event, '${dish.id}')" 
                  aria-label="Add ${dish.name} to bag">
            + Add
          </button>
        </div>

      </article>
    `;
  }).join('');

  // Update spotlight card with either current spotlight dish or the first visible dish
  const activeStillVisible = pool.find(d => currentSpotlightDish && d.id === currentSpotlightDish.id);
  if (activeStillVisible) {
    updateSpotlightDisplay(activeStillVisible);
  } else if (pool[0]) {
    updateSpotlightDisplay(pool[0]);
  }
}

function handleDishHover(dishId) {
  let found = null;
  Object.keys(MENU_DATA).forEach(cat => {
    const d = MENU_DATA[cat].dishes.find(item => item.id === dishId);
    if (d) found = d;
  });

  if (found) {
    updateSpotlightDisplay(found);

    // Highlight card
    document.querySelectorAll('.menu-dish-card').forEach(card => {
      card.classList.toggle('active-spotlight', card.getAttribute('data-dish-id') === dishId);
    });
  }
}

function updateSpotlightDisplay(dish) {
  currentSpotlightDish = dish;

  const spotlightImg = document.getElementById('spotlightImg');
  const spotlightBadge = document.getElementById('spotlightBadge');
  const spotlightTitle = document.getElementById('spotlightTitle');
  const spotlightPrice = document.getElementById('spotlightPrice');
  const spotlightDesc = document.getElementById('spotlightDesc');
  const spotlightTags = document.getElementById('spotlightTags');
  const spotlightBtnPrice = document.getElementById('spotlightBtnPrice');

  if (spotlightImg) {
    spotlightImg.src = dish.img;
    spotlightImg.alt = dish.name;
  }
  if (spotlightBadge) {
    spotlightBadge.textContent = dish.badge ? `⭐ ${dish.badge.toUpperCase()}` : (dish.isClayOven ? '🔥 900°F CLAY OVEN' : '👑 ROYAL DUM RECIPE');
  }
  if (spotlightTitle) spotlightTitle.textContent = dish.name;
  if (spotlightPrice) spotlightPrice.textContent = `₹${dish.price.toLocaleString('en-IN')}`;
  if (spotlightDesc) spotlightDesc.textContent = dish.desc;
  
  if (spotlightTags) {
    spotlightTags.innerHTML = dish.tags.map(t => `<span class="dish-pill-tag">${t}</span>`).join('');
  }
  if (spotlightBtnPrice) {
    spotlightBtnPrice.textContent = `₹${dish.price.toLocaleString('en-IN')}`;
  }
}

function handleDishAdd(event, dishId) {
  if (event) {
    event.stopPropagation();
  }

  let dish = null;
  Object.keys(MENU_DATA).forEach(cat => {
    const d = MENU_DATA[cat].dishes.find(item => item.id === dishId);
    if (d) dish = d;
  });

  if (!dish) return;

  addToCart({
    id: dish.id,
    name: dish.name,
    price: dish.price,
    img: dish.img
  });

  // Button micro-interaction
  const targetBtn = event?.currentTarget;
  if (targetBtn) {
    const originalText = targetBtn.textContent;
    targetBtn.textContent = '✓ Added';
    targetBtn.classList.add('added-anim');
    setTimeout(() => {
      targetBtn.textContent = originalText;
      targetBtn.classList.remove('added-anim');
    }, 1200);
  }
}

function resetMenuFilters() {
  activeMenuSearch = '';
  activeMenuFilter = 'all';

  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) searchInput.value = '';

  const filterChips = document.querySelectorAll('.menu-filter-chip');
  filterChips.forEach(chip => {
    const isAll = chip.getAttribute('data-filter') === 'all';
    chip.classList.toggle('active', isAll);
    chip.setAttribute('aria-checked', isAll ? 'true' : 'false');
  });

  renderMenuDishes();
}

window.handleDishHover = handleDishHover;
window.handleDishAdd = handleDishAdd;
window.resetMenuFilters = resetMenuFilters;



/* --------------------------------------------------------------------------
   7. Interactive Photo Gallery & Fullscreen Animated Lightbox
   -------------------------------------------------------------------------- */
const GALLERY_DATA = {
  bandra: [
    {
      id: 'b-1',
      cat: 'hearth',
      title: 'Clay Tandoori Flames',
      tag: '🔥 900°F Live Fire',
      desc: 'Ancient clay tandoor glowing at peak embers for high-heat flash-charring.',
      src: 'assets/images/tandoori_chicken_hero.jpg',
      alt: 'Tandoori chicken smoking over glowing clay hearth'
    },
    {
      id: 'b-2',
      cat: 'bar',
      title: 'Kokum Gin Mist',
      tag: '🍸 Botanical Bar',
      desc: 'Slow-distilled coastal kokum gin with smoked citrus peel and mountain sage.',
      src: 'assets/images/gallery_bar1.jpg',
      alt: 'Artisanal cocktail with citrus garnish on dark bar table'
    },
    {
      id: 'b-3',
      cat: 'interior',
      title: 'The Brass Sanctum',
      tag: '🏮 Dining Space',
      desc: 'Architectural charred teakwood panels and hand-beaten warm copper fixtures.',
      src: 'assets/images/interior.jpg',
      alt: 'Atmospheric moody dining hall with amber illumination'
    },
    {
      id: 'b-4',
      cat: 'hearth',
      title: 'Dum Biryani Seal Unveiled',
      tag: '🔥 Royal Feast',
      desc: 'Unsealing saffron purdah dough over aged basmati and slow-braised mutton.',
      src: 'assets/images/royal_dum_biryani.jpg',
      alt: 'Fragrant Dum Biryani topped with crisp onions and fresh mint'
    },
    {
      id: 'b-5',
      cat: 'bar',
      title: 'Saffron Old Fashioned',
      tag: '🍸 Barrel Infusion',
      desc: 'Aged Indian single malt rested with Kashmiri saffron threads and jaggery bitters.',
      src: 'assets/images/gallery_bar2.jpg',
      alt: 'Golden cocktail glass on dark bar surface'
    },
    {
      id: 'b-6',
      cat: 'interior',
      title: 'Private Sommelier Vault',
      tag: '🏮 Wine Cellar',
      desc: 'Curated cellars holding biodynamic vintage pours from Nashik to Bordeaux.',
      src: 'assets/images/wine_pouring.jpg',
      alt: 'Sommelier pouring red wine into crystal glass'
    }
  ],
  delhi: [
    {
      id: 'd-1',
      cat: 'hearth',
      title: 'Old Delhi Mutton Chops',
      tag: '🔥 Charred Ribs',
      desc: 'Tender lamb chops crusted with crushed coriander seed and smoky black cardamom.',
      src: 'assets/images/lamb_chops.jpg',
      alt: 'Grilled spiced lamb chops with herb garnish'
    },
    {
      id: 'd-2',
      cat: 'bar',
      title: 'Smoked Tamarind Mezcal',
      tag: '🍸 Smoke & Agave',
      desc: 'Oaxacan mezcal stirred with roasted tamarind pulp and Himalayan black salt.',
      src: 'assets/images/gallery_bar3.jpg',
      alt: 'Artisanal smoky cocktail in lowball glass'
    },
    {
      id: 'd-3',
      cat: 'hearth',
      title: 'Velvet Butter Chicken Pan',
      tag: '🔥 Heirloom Gravy',
      desc: 'Slow-simmered vine tomatoes, churned white makkhan, and hand-rubbed kasuri methi.',
      src: 'assets/images/butter_chicken_delhi.jpg',
      alt: 'Rich butter chicken in traditional copper serving dish'
    },
    {
      id: 'd-4',
      cat: 'interior',
      title: 'Imperial Courtyard Lounge',
      tag: '🏮 Heritage Dining',
      desc: 'Mughal arched stone lattice with soft lantern glows and quiet banquettes.',
      src: 'assets/images/interior.jpg',
      alt: 'Dining interior with intimate table lighting'
    },
    {
      id: 'd-5',
      cat: 'hearth',
      title: 'Master Chef Live Plating',
      tag: '🔥 Precision Pass',
      desc: 'Precision micro-greens and gold leaf delicate garnishing at the chef counter.',
      src: 'assets/images/chef_plating.jpg',
      alt: 'Chef carefully garnishing culinary creation'
    },
    {
      id: 'd-6',
      cat: 'bar',
      title: 'Cardamom Highball',
      tag: '🍸 Herb Clarified',
      desc: 'Clarified tonic, green cardamom tincture, and crushed kaffir lime leaf.',
      src: 'assets/images/gallery_bar4.jpg',
      alt: 'Highball cocktail sparkling under bar light'
    }
  ],
  bengaluru: [
    {
      id: 'blr-1',
      cat: 'interior',
      title: 'Garden Canopy Atrium',
      tag: '🏮 Glass Atrium',
      desc: 'Living fern walls beneath open glass skylights in Bengaluru’s lush evening air.',
      src: 'assets/images/interior.jpg',
      alt: 'Lush dining atrium with greenery and warm pendant lamps'
    },
    {
      id: 'blr-2',
      cat: 'hearth',
      title: 'Curry Leaf Charred Sea Bass',
      tag: '🔥 Coastal Hearth',
      desc: 'Fresh coastal sea bass wrapped in banana leaf and flash-seared over wood coals.',
      src: 'assets/images/event_fish.jpg',
      alt: 'Seared fish on dark ceramic platter'
    },
    {
      id: 'blr-3',
      cat: 'bar',
      title: 'Byadgi Chilli Sour',
      tag: '🍸 Spiced Botanical',
      desc: 'Infused Byadgi pepper distillate balanced with fresh Nagpur sweet lime foam.',
      src: 'assets/images/gallery_bar1.jpg',
      alt: 'Craft cocktail with foam top'
    },
    {
      id: 'blr-4',
      cat: 'hearth',
      title: 'Glazed Kashmiri Hot Wings',
      tag: '🔥 Signature Glaze',
      desc: 'Crispy fried wings tossed in smoked Kashmiri chilli honey and toasted sesame.',
      src: 'assets/images/wings_art.jpg',
      alt: 'Glazed chicken wings on artistic slate'
    },
    {
      id: 'blr-5',
      cat: 'hearth',
      title: 'Truffle Wagyu Kebab Tartare',
      tag: '🔥 Raw & Fire',
      desc: 'Hand-cut tenderloin with smoked mustard oil emulsion and shaved black truffle.',
      src: 'assets/images/tartare_dish.jpg',
      alt: 'Gourmet tartare dish elegantly plated'
    },
    {
      id: 'blr-6',
      cat: 'bar',
      title: 'Nightcap Cold Brew Toddy',
      tag: '🍸 Estate Roast',
      desc: 'Chikmagalur dark roast cold brew infused with spiced rum and star anise.',
      src: 'assets/images/gallery_bar2.jpg',
      alt: 'Dark cocktail served in rocks glass'
    }
  ]
};

function initGalleryPage() {
  const strip = document.getElementById('galleryStrip');
  const locBtns = document.querySelectorAll('.gallery-loc-btn');
  const catChips = document.querySelectorAll('.gallery-filter-chip');
  const prevBtn = document.getElementById('galleryPrevBtn');
  const nextBtn = document.getElementById('galleryNextBtn');
  const progressFill = document.getElementById('galleryProgressFill');
  const counterEl = document.getElementById('galleryCounter');

  // Lightbox elements
  const lightboxModal = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxBadge = document.getElementById('lightboxBadge');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  if (!strip) return;

  let currentLoc = 'bandra';
  let currentCat = 'all';
  let activeItems = [];
  let currentLightboxIdx = 0;
  let lastFocusedCard = null;

  // Render photo cards into strip
  function renderGallery() {
    const rawItems = GALLERY_DATA[currentLoc] || GALLERY_DATA.bandra;
    activeItems = currentCat === 'all' 
      ? rawItems 
      : rawItems.filter(item => item.cat === currentCat);

    if (activeItems.length === 0) {
      strip.innerHTML = `
        <div class="gallery-empty-state" style="padding: 40px; color: #8E8E93; text-align: center; width: 100%;">
          <p style="font-size: 1.125rem; margin-bottom: 8px;">No photographs found for this filter.</p>
          <button type="button" class="btn btn-secondary btn-sm" id="galleryResetFilterBtn">Show All Photos</button>
        </div>
      `;
      const resetBtn = document.getElementById('galleryResetFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          currentCat = 'all';
          catChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-cat') === 'all'));
          renderGallery();
        });
      }
      updateIndicator(0, 0);
      return;
    }

    strip.innerHTML = activeItems.map((item, idx) => `
      <article 
        class="gallery-card-item gallery-card-animated" 
        data-index="${idx}" 
        tabindex="0" 
        role="button" 
        aria-label="View photo: ${item.title}"
        style="animation-delay: ${idx * 60}ms;"
      >
        <img src="${item.src}" alt="${item.alt}" loading="lazy" />
        <div class="gallery-card-overlay">
          <span class="gallery-card-tag">${item.tag}</span>
          <div class="gallery-card-bottom-info">
            <h3 class="gallery-card-title">${item.title}</h3>
            <p class="gallery-card-desc">${item.desc}</p>
            <span class="gallery-card-zoom-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              Expand Photo
            </span>
          </div>
        </div>
      </article>
    `).join('');

    // Attach card click & keyboard handlers
    const cards = strip.querySelectorAll('.gallery-card-item');
    cards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        if (isDraggingCard) return;
        cards.forEach(c => c.classList.remove('expanded'));
        card.classList.add('expanded');
        openLightbox(idx, card);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx, card);
        }
      });
    });

    // Reset scroll smoothly to start
    strip.scrollTo({ left: 0, behavior: 'smooth' });
    updateIndicator(0, activeItems.length);
  }

  // Update Progress Track & Counter
  function updateIndicator(scrollLeft, total) {
    if (!counterEl || !progressFill || total === 0) return;
    const maxScroll = Math.max(1, strip.scrollWidth - strip.clientWidth);
    const progress = Math.min(100, Math.max(15, (strip.scrollLeft / maxScroll) * 100));
    progressFill.style.width = `${progress}%`;

    const approxCardWidth = 320;
    const currentCardNum = Math.min(total, Math.max(1, Math.round(strip.scrollLeft / approxCardWidth) + 1));
    const pad = (n) => String(n).padStart(2, '0');
    counterEl.textContent = `${pad(currentCardNum)} / ${pad(total)}`;
  }

  // Scroll event on strip to update counter & progress bar in real time
  let isScrollDebounced = false;
  strip.addEventListener('scroll', () => {
    if (!isScrollDebounced) {
      window.requestAnimationFrame(() => {
        updateIndicator(strip.scrollLeft, activeItems.length);
        isScrollDebounced = false;
      });
      isScrollDebounced = true;
    }
  }, { passive: true });

  // Carousel Arrow Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      strip.scrollBy({ left: -340, behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      strip.scrollBy({ left: 340, behavior: 'smooth' });
    });
  }

  // Drag-to-scroll interaction for desktop mouse
  let isPointerDown = false;
  let startX = 0;
  let scrollStartX = 0;
  let isDraggingCard = false;

  strip.addEventListener('mousedown', (e) => {
    isPointerDown = true;
    isDraggingCard = false;
    startX = e.pageX - strip.offsetLeft;
    scrollStartX = strip.scrollLeft;
    strip.style.cursor = 'grabbing';
    strip.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPointerDown) return;
    const x = e.pageX - strip.offsetLeft;
    const walk = (x - startX);
    if (Math.abs(walk) > 6) {
      isDraggingCard = true;
    }
    strip.scrollLeft = scrollStartX - walk;
  });

  window.addEventListener('mouseup', () => {
    if (isPointerDown) {
      isPointerDown = false;
      strip.style.cursor = '';
      strip.style.removeProperty('user-select');
      setTimeout(() => { isDraggingCard = false; }, 50);
    }
  });

  // Location selector switchers
  locBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      locBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentLoc = btn.getAttribute('data-loc') || 'bandra';
      renderGallery();
      showToast(`Archive updated: ${btn.textContent.trim()}`);
    });
  });

  // Filter Category Chips
  catChips.forEach(chip => {
    chip.addEventListener('click', () => {
      catChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCat = chip.getAttribute('data-cat') || 'all';
      renderGallery();
    });
  });

  /* Lightbox Logic */
  function openLightbox(idx, triggerEl) {
    if (!lightboxModal || !activeItems[idx]) return;
    currentLightboxIdx = idx;
    lastFocusedCard = triggerEl;
    updateLightboxContent();
    lightboxModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lightboxCloseBtn?.focus();
  }

  function updateLightboxContent() {
    const item = activeItems[currentLightboxIdx];
    if (!item) return;

    if (lightboxImg) {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
    }
    if (lightboxBadge) lightboxBadge.textContent = item.tag;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxDesc) lightboxDesc.textContent = item.desc;
    if (lightboxCounter) {
      lightboxCounter.textContent = `Photo ${currentLightboxIdx + 1} of ${activeItems.length}`;
    }
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lastFocusedCard) {
      lastFocusedCard.focus();
    }
  }

  function nextLightbox() {
    if (activeItems.length === 0) return;
    currentLightboxIdx = (currentLightboxIdx + 1) % activeItems.length;
    updateLightboxContent();
  }

  function prevLightbox() {
    if (activeItems.length === 0) return;
    currentLightboxIdx = (currentLightboxIdx - 1 + activeItems.length) % activeItems.length;
    updateLightboxContent();
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevLightbox);

  // Keyboard navigation for Lightbox
  window.addEventListener('keydown', (e) => {
    if (!lightboxModal || lightboxModal.hasAttribute('hidden')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      nextLightbox();
    } else if (e.key === 'ArrowLeft') {
      prevLightbox();
    }
  });

  // Initial render
  renderGallery();
}

/* --------------------------------------------------------------------------
   8. Page-Specific Interactions: Locations Directory
   -------------------------------------------------------------------------- */
function initLocationsPage() {
  const rows = document.querySelectorAll('.chain-numbered-row');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      rows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   9. Global Mobile Navigation & Header Scroll
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.style.display === 'flex';
      if (isOpen) {
        navMenu.style.display = '';
      } else {
        navMenu.style.display = 'flex';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.flexDirection = 'column';
        navMenu.style.backgroundColor = 'var(--color-bg)';
        navMenu.style.padding = '24px';
        navMenu.style.boxShadow = 'var(--shadow-md)';
        navMenu.style.borderBottom = '1px solid var(--color-border)';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   10. Toast Notification
   -------------------------------------------------------------------------- */
let toastTimeout;
function showToast(msg) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/* --------------------------------------------------------------------------
   11. Scroll-Driven Reveal Observer
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.section-block, .hero-featured-card, .chef-visionary-split, .events-main-card-grid, .concept-cards-row, .reveal-on-scroll');

  if (!('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  targets.forEach(t => {
    t.classList.add('reveal-on-scroll');
    observer.observe(t);
  });
}

/* --------------------------------------------------------------------------
   12. 3D Tilt Micro-Interactions (Hero Card & Visuals)
   -------------------------------------------------------------------------- */
function init3DTilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const tiltTargets = document.querySelectorAll('.hero-featured-card, .chef-large-portrait-wrap, .chef-action-thumb-wrap');

  tiltTargets.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      // If pointer is over the hero 3D turntable, yield fine 3D control to the turntable container
      if (card.classList.contains('hero-featured-card') && e.target.closest('.hero-3d-turntable-container')) {
        return;
      }
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateY = (x * 6).toFixed(2);
      const rotateX = (-y * 6).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
    });
  });
}

/* --------------------------------------------------------------------------
   13. Gallery Interactive Ambient Spotlight
   -------------------------------------------------------------------------- */
function initGallerySpotlight() {
  const gallery = document.querySelector('.gallery-dark-section');
  if (!gallery) return;

  let spotlight = gallery.querySelector('.gallery-dark-spotlight');
  if (!spotlight) {
    spotlight = document.createElement('div');
    spotlight.className = 'gallery-dark-spotlight';
    gallery.appendChild(spotlight);
  }

  gallery.addEventListener('mousemove', (e) => {
    const rect = gallery.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlight.style.left = `${x}px`;
    spotlight.style.top = `${y}px`;
  });
}

/* --------------------------------------------------------------------------
   14. Hero 3D Multi-Angle Video Turntable (Hover-Driven Perspective)
   -------------------------------------------------------------------------- */
function initHero3DTurntable() {
  const container = document.getElementById('heroFoodFigure');
  const scene = document.getElementById('hero3DScene');
  const glare = document.getElementById('heroHearthGlare');
  const angleLabel = document.getElementById('heroAngleLabel');
  const stepPips = document.querySelectorAll('.hero-perspective-steps .step-pip');
  const angleImages = document.querySelectorAll('.hero-angle-img');

  if (!container || !scene || !angleImages.length) return;

  const ANGLES = [
    {
      idx: 0,
      badge: '01',
      title: '45° HERO ISOMETRIC',
      rotateX: 12,
      rotateY: -10,
      scale: 1.03,
      translateZ: 18,
      glareX: 38,
      glareY: 42
    },
    {
      idx: 1,
      badge: '02',
      title: '90° TOP-DOWN PRESENTATION',
      rotateX: 28,
      rotateY: 0,
      scale: 1.10,
      translateZ: 24,
      glareX: 50,
      glareY: 35
    },
    {
      idx: 2,
      badge: '03',
      title: '15° MACRO SIZZLE CLOSE-UP',
      rotateX: 6,
      rotateY: 16,
      scale: 1.14,
      translateZ: 28,
      glareX: 65,
      glareY: 55
    },
    {
      idx: 3,
      badge: '04',
      title: '900°F CLAY HEARTH SKEWER',
      rotateX: 10,
      rotateY: -16,
      scale: 1.07,
      translateZ: 20,
      glareX: 42,
      glareY: 60
    }
  ];

  let currentIdx = 0;
  let mouseTiltX = 0;
  let mouseTiltY = 0;

  function updateTransform(extraTiltX = 0, extraTiltY = 0) {
    const angle = ANGLES[currentIdx];
    const totalRotateX = (angle.rotateX + mouseTiltY + extraTiltY).toFixed(2);
    const totalRotateY = (angle.rotateY + mouseTiltX + extraTiltX).toFixed(2);
    const scale = angle.scale;
    const tz = angle.translateZ;

    scene.style.transform = `perspective(1200px) rotateX(${totalRotateX}deg) rotateY(${totalRotateY}deg) scale(${scale}) translateZ(${tz}px)`;

    if (glare) {
      const gx = Math.min(90, Math.max(10, angle.glareX + (mouseTiltX * 1.5)));
      const gy = Math.min(90, Math.max(10, angle.glareY + (mouseTiltY * 1.5)));
      glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 220, 150, 0.55) 0%, rgba(255, 120, 50, 0.2) 35%, transparent 70%)`;
    }
  }

  function setAngle(idx) {
    if (idx < 0) idx = ANGLES.length - 1;
    if (idx >= ANGLES.length) idx = 0;
    currentIdx = idx;
    const angle = ANGLES[currentIdx];

    // Crossfade active image in the stack
    angleImages.forEach((img, i) => {
      const isActive = i === currentIdx;
      img.classList.toggle('active', isActive);
      img.setAttribute('aria-hidden', !isActive);
    });

    // Update step pips indicator
    stepPips.forEach((pip, i) => {
      pip.classList.toggle('active', i === currentIdx);
    });

    // Update HUD status label
    if (angleLabel) {
      angleLabel.textContent = `${angle.badge} • ${angle.title}`;
    }

    // Apply 3D perspective & lighting
    updateTransform();
  }

  // Hover interaction: moving across the card smoothly shifts perspective & 3D tilt
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const xPct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const yPct = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));

    // Map horizontal position to the 4 perspective angles (0 to 3)
    const targetIdx = Math.min(3, Math.max(0, Math.floor(xPct * 4)));
    if (targetIdx !== currentIdx) {
      setAngle(targetIdx);
    }

    // Dynamic 3D gyro tilt and specular lighting
    mouseTiltX = (xPct - 0.5) * 20;
    mouseTiltY = -(yPct - 0.5) * 18;

    updateTransform();
  });

  container.addEventListener('mouseenter', (e) => {
    scene.style.transition = 'transform 0.15s ease-out';
    const rect = container.getBoundingClientRect();
    const xPct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const targetIdx = Math.min(3, Math.max(0, Math.floor(xPct * 4)));
    setAngle(targetIdx);
  });

  container.addEventListener('mouseleave', () => {
    mouseTiltX = 0;
    mouseTiltY = 0;
    scene.style.transition = 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)';
    // Smoothly return to the signature Hero angle on mouse leave
    setAngle(0);
  });

  // Click on the food figure advances to the next perspective
  container.addEventListener('click', () => {
    setAngle((currentIdx + 1) % ANGLES.length);
  });

  // Touch support for mobile dragging/scrubbing
  container.addEventListener('touchmove', (e) => {
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const xPct = Math.min(1, Math.max(0, (touch.clientX - rect.left) / rect.width));
    const targetIdx = Math.min(3, Math.max(0, Math.floor(xPct * 4)));
    if (targetIdx !== currentIdx) {
      setAngle(targetIdx);
    }
  }, { passive: true });

  // Keyboard accessibility
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setAngle((currentIdx + 1) % ANGLES.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setAngle((currentIdx - 1 + ANGLES.length) % ANGLES.length);
    }
  });

  // Initialize with Angle 0 (Hero 45°)
  setAngle(0);
}

