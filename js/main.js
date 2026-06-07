AOS.init({
    duration: 680,
    once: true,
    offset: 55
});

/* NAVBAR SCROLL & ACTIVE LINK  */
window.addEventListener('scroll', function() {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
    document.getElementById('btt').classList.toggle('show', window.scrollY > 300);
    document.querySelectorAll('section[id]').forEach(function(sec) {
        var top = sec.offsetTop - 110,
            bot = top + sec.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bot) {
            document.querySelectorAll('.nav-link').forEach(function(l) {
                l.classList.remove('active');
            });
            var lnk = document.querySelector('.nav-link[href="#' + sec.id + '"]');
            if (lnk) lnk.classList.add('active');
        }
    });
});

/*  SMOOTH SCROLL + MOBILE NAV CLOSE  */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var t = document.querySelector(href);
        if (t) {
            e.preventDefault();
            // Close Bootstrap mobile navbar if open
            var navCollapse = document.getElementById('navmenu');
            if (navCollapse && navCollapse.classList.contains('show')) {
                var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                } else {
                    navCollapse.classList.remove('show');
                }
            }
            // Scroll after slight delay to let navbar close
            setTimeout(function() {
                window.scrollTo({
                    top: t.offsetTop - 78,
                    behavior: 'smooth'
                });
            }, 50);
        }
    });
});


var searchOv = document.getElementById('searchOv');

document.getElementById('navSearchBtn').addEventListener('click', function() {
    searchOv.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function() {
        document.getElementById('searchInput').focus();
    }, 220);
});

document.getElementById('searchClose').addEventListener('click', closeSearch);

// Close when clicking backdrop
searchOv.addEventListener('click', function(e) {
    if (e.target === searchOv) closeSearch();
});

function closeSearch() {
    searchOv.classList.remove('open');
    document.body.style.overflow = '';
}

// Category buttons inside search box
document.querySelectorAll('.sovcat').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sovcat').forEach(function(b) {
            b.classList.remove('active');
        });
        this.classList.add('active');
        var f = this.getAttribute('data-cat');
        closeSearch();
        setTimeout(function() {
            filterMenu(f);
            document.getElementById('menu').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    });
});

// Trending tags fill the search input
document.querySelectorAll('.sovtrend .ttag').forEach(function(t) {
    t.addEventListener('click', function() {
        document.getElementById('searchInput').value = this.textContent.trim();
        document.getElementById('searchInput').focus();
    });
});


$(document).ready(function() {
	$('.magnific_popup').magnificPopup({
	  disableOn: 700,
	  type: 'iframe',
	  mainClass: 'mfp-fade',
	  removalDelay: 160,
	  preloader: false,
	  fixedContentPos: false,
	  disableOn: 300
	});	
});


function filterMenu(cat) {
    // sync filter buttons
    document.querySelectorAll('.filtbtn').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-f') === cat);
    });
    // sync category cards
    document.querySelectorAll('.catcard').forEach(function(c) {
        c.classList.toggle('active', c.getAttribute('data-filter') === cat);
    });
    // show/hide menu cards
    document.querySelectorAll('.mwrap').forEach(function(w) {
        var c = w.getAttribute('data-c');
        if (cat === 'all' || c === cat) {
            w.classList.remove('gone');
            w.style.opacity = '0';
            w.style.transform = 'translateY(16px)';
            setTimeout(function() {
                w.style.transition = 'opacity .38s,transform .38s';
                w.style.opacity = '1';
                w.style.transform = 'translateY(0)';
            }, 60);
        } else {
            w.classList.add('gone');
        }
    });
}

// Filter buttons
document.querySelectorAll('.filtbtn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        filterMenu(this.getAttribute('data-f'));
    });
});

// Category section cards â†’ scroll + filter
document.querySelectorAll('.catcard').forEach(function(card) {
    card.addEventListener('click', function() {
        var f = this.getAttribute('data-filter');
        window.scrollTo({
            top: document.getElementById('menu').offsetTop - 80,
            behavior: 'smooth'
        });
        setTimeout(function() {
            filterMenu(f);
        }, 480);
    });
});


var menuPop = document.getElementById('menuPop');
var mpQty = 1;
var currentCartItem = null;
var cart = [];
var CART_KEY = 'magicMugCart';
var cartDrawer = document.getElementById('cartDrawer');
var cartOverlay = document.getElementById('cartOverlay');
var checkoutMode = false;
var orderConfirmed = false;
var couponCode = '';
var couponDiscount = 0;
var couponStatus = '';
var COUPONS = {
    'MAGIC10': 10,
    'MUG20': 20,
    'FOOD5': 5
};
var MENU_PRICE_KEY = 'magicMugMenuPrices';
var SHOP_STATUS_KEY = 'magicMugShopStatus';
var ORDERS_KEY = 'magicMugOrders';

function getMenuPriceOverrides() {
    try {
        return JSON.parse(localStorage.getItem(MENU_PRICE_KEY) || '{}');
    } catch (e) {
        return {};
    }
}

function getShopStatus() {
    return localStorage.getItem(SHOP_STATUS_KEY) || 'open';
}

function saveShopStatus(status) {
    localStorage.setItem(SHOP_STATUS_KEY, status);
    updateShopStatusBadge();
}

function updateShopStatusBadge() {
    var badge = document.getElementById('shopStatusBadge');
    if (!badge) return;
    var open = getShopStatus() === 'open';
    badge.querySelector('span').textContent = open ? 'Shop is open for orders today' : 'Shop is currently closed';
    badge.style.background = open ? 'rgba(74, 222, 128, 0.14)' : 'rgba(248, 113, 113, 0.14)';
    badge.style.borderColor = open ? 'rgba(74, 222, 128, 0.35)' : 'rgba(248, 113, 113, 0.35)';
    badge.style.color = open ? '#d1fae5' : '#fee2e2';
    badge.querySelector('.hbi').style.background = open ? 'rgba(74, 222, 128, 0.18)' : 'rgba(248, 113, 113, 0.18)';
    badge.querySelector('.hbi').style.color = open ? '#bbf7d0' : '#fecaca';
}

function applyMenuPriceOverrides() {
    var overrides = getMenuPriceOverrides();
    document.querySelectorAll('.mcard').forEach(function(card) {
        var key = slugify(card.getAttribute('data-title') || '');
        var price = overrides[key];
        if (price && !isNaN(price)) {
            var old = card.getAttribute('data-old');
            card.setAttribute('data-price', '$' + Number(price).toFixed(2));
            var priceBox = card.querySelector('.mprice');
            if (priceBox) {
                priceBox.innerHTML = '$' + Number(price).toFixed(2) + (old ? ' <small>' + old + '</small>' : '');
            }
        }
    });
}

function saveOrder(order) {
    var orders = [];
    try {
        orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    } catch (e) {}
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 25)));
}

function resetCheckoutState() {
    checkoutMode = false;
    orderConfirmed = false;
    couponCode = '';
    couponDiscount = 0;
    couponStatus = '';
}

function openMenuPop(card) {
    var img = card.getAttribute('data-img');
    var title = card.getAttribute('data-title');
    var cat = card.getAttribute('data-cat');
    var price = card.getAttribute('data-price');
    var old = card.getAttribute('data-old');
    var rating = parseFloat(card.getAttribute('data-rating'));
    var reviews = card.getAttribute('data-reviews');
    var cal = card.getAttribute('data-cal');
    var time = card.getAttribute('data-time');
    var desc = card.getAttribute('data-desc');
    var tags = card.getAttribute('data-tags') || '';

    document.getElementById('mpImg').setAttribute('src', img);
    document.getElementById('mpCat').textContent = cat;
    document.getElementById('mpTitle').textContent = title;

    var full = Math.round(rating),
        empty = 5 - full;
    document.getElementById('mpStars').innerHTML =
        '<i class="fas fa-star"></i>'.repeat(full) + 'â˜†'.repeat(empty) +
        ' <span style="color:#bbb;font-size:.78rem;">' + rating + ' (' + reviews + ' reviews)</span>';

    document.getElementById('mpDesc').textContent = desc;

    document.getElementById('mpPrice').innerHTML =
        price + (old ? '<small style="color:#ccc;text-decoration:line-through;margin-left:8px;font-size:1rem;">' + old + '</small>' : '');

    document.getElementById('mpMeta').innerHTML =
        '<div class="mpm"><div class="mpmv">' + cal + ' kcal</div><div class="mpml">Calories</div></div>' +
        '<div class="mpm"><div class="mpmv">' + time + ' min</div><div class="mpml">Prep Time</div></div>' +
        '<div class="mpm"><div class="mpmv">' + rating + '/5</div><div class="mpml">Rating</div></div>';

    document.getElementById('mpTags').innerHTML =
        tags.split(',').filter(Boolean).map(function(t) {
            return '<span class="mptag">' + t.trim() + '</span>';
        }).join('');

    currentCartItem = {
        id: slugify(title),
        title: title,
        category: cat,
        price: parsePrice(price),
        image: img
    };

    mpQty = 1;
    document.getElementById('mpQnum').textContent = 1;
    document.getElementById('mpAddCart').innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
    document.getElementById('mpAddCart').style.background = '';

    menuPop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Card click open popup
document.querySelectorAll('.mcard').forEach(function(card) {
    card.addEventListener('click', function() {
        openMenuPop(this);
    });
});

// + button  open popup (stop propagation to avoid double firing)
document.querySelectorAll('.madd').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        openMenuPop(this.closest('.mcard'));
    });
});

// Heart toggle (no popup)
document.querySelectorAll('.mhrt').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var ico = this.querySelector('i');
        ico.classList.toggle('far');
        ico.classList.toggle('fas');
        this.style.color = ico.classList.contains('fas') ? 'var(--primary)' : '#ccc';
    });
});

// Close popup
document.getElementById('mpClose').addEventListener('click', closeMenuPop);
menuPop.addEventListener('click', function(e) {
    if (e.target === this) closeMenuPop();
});

function closeMenuPop() {
    menuPop.classList.remove('open');
    document.body.style.overflow = '';
}

// Qty +/-
document.getElementById('mpPlus').addEventListener('click', function() {
    document.getElementById('mpQnum').textContent = ++mpQty;
});
document.getElementById('mpMinus').addEventListener('click', function() {
    if (mpQty > 1) document.getElementById('mpQnum').textContent = --mpQty;
});

// Add to cart button
document.getElementById('mpAddCart').addEventListener('click', function() {
    if (!currentCartItem) return;
    addCartItem(currentCartItem, mpQty);
    this.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
    this.style.background = 'linear-gradient(135deg,var(--green),#1a4a35)';
    var self = this;
    setTimeout(function() {
        closeMenuPop();
        self.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        self.style.background = '';
    }, 1000);
});

function slugify(text) {
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-');
}

function parsePrice(value) {
    var num = parseFloat(value.toString().replace(/[^0-9\.]/g, ''));
    return isNaN(num) ? 0 : num;
}

function formatPrice(value) {
    return '$' + value.toFixed(2);
}

function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch (e) {
        cart = [];
    }
    applyMenuPriceOverrides();
    updateShopStatusBadge();
    renderCartDrawer();
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCartDrawer();
}

function updateCartCount() {
    var count = cart.reduce(function(total, item) {
        return total + item.quantity;
    }, 0);
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cdCount').textContent = count + ' item' + (count === 1 ? '' : 's');
}

function calculateTotals() {
    var subtotal = cart.reduce(function(total, item) {
        return total + item.price * item.quantity;
    }, 0);
    var discount = couponDiscount ? subtotal * (couponDiscount / 100) : 0;
    var total = Math.max(0, subtotal - discount);
    return {
        subtotal: subtotal,
        discount: discount,
        total: total
    };
}

function renderCartDrawer() {
    updateCartCount();
    var body = '';
    var totals = calculateTotals();
    if (orderConfirmed) {
        body = '<div class="cd-checkout-header"><strong>Order Confirmed</strong><p class="cd-payment-note">Thank you! Your order has been placed successfully.</p></div>' +
            '<div class="cd-summary">' +
            '  <div class="cd-summary-row"><span>Order total</span><strong>' + formatPrice(totals.total) + '</strong></div>' +
            (couponCode ? '<div class="cd-summary-row"><span>Coupon applied</span><strong>' + couponCode + '</strong></div>' : '') +
            '  <div class="cd-summary-row"><span>Items</span><strong>' + cart.reduce(function(total, item) { return total + item.quantity; }, 0) + '</strong></div>' +
            '</div>' +
            '<div class="cd-field"><p class="cd-payment-note">A confirmation email will be sent shortly.</p></div>';
        document.getElementById('cdBody').innerHTML = body;
        document.getElementById('cdFooterLabel').textContent = 'Order Receipt';
        document.getElementById('cdTotal').textContent = formatPrice(totals.total);
        document.getElementById('cdClear').classList.add('d-none');
        document.getElementById('cdCheckout').classList.add('d-none');
        document.getElementById('cdBack').classList.add('d-none');
        document.getElementById('cdPay').classList.add('d-none');
        document.getElementById('cdDone').classList.remove('d-none');
        return;
    }
    if (checkoutMode) {
        body = '<div class="cd-checkout-header"><strong>Checkout & payment</strong><p class="cd-payment-note">Enter your details and apply a coupon for savings.</p></div>' +
            '<div class="cd-field cd-coupon-row">' +
            '  <div>' +
            '    <label for="cdCouponInput">Coupon code</label>' +
            '    <input type="text" id="cdCouponInput" placeholder="Enter code e.g. MAGIC10" value="' + couponCode + '">' +
            '  </div>' +
            '  <button class="btn btn-outline-secondary" id="cdApplyCoupon" type="button">Apply</button>' +
            '</div>' +
            '<div class="cd-coupon-status" id="cdCouponStatus">' + (couponStatus || 'Valid coupons: MAGIC10, MUG20, FOOD5') + '</div>' +
            '<div class="cd-summary">' +
            '  <div class="cd-summary-row"><span>Subtotal</span><strong>' + formatPrice(totals.subtotal) + '</strong></div>' +
            (couponDiscount ? '<div class="cd-summary-row"><span>Discount (' + couponCode + ')</span><strong>-' + formatPrice(totals.discount) + '</strong></div>' : '') +
            '  <div class="cd-summary-row total-row"><span>Total due</span><strong>' + formatPrice(totals.total) + '</strong></div>' +
            '</div>' +
            '<div class="cd-field"><label for="cdName">Full name</label><input type="text" id="cdName" placeholder="John Doe"></div>' +
            '<div class="cd-field"><label for="cdEmail">Email address</label><input type="email" id="cdEmail" placeholder="john@example.com"></div>' +
            '<div class="cd-field"><label for="cdPhone">Phone number</label><input type="tel" id="cdPhone" placeholder="(555) 123-4567"></div>' +
            '<div class="cd-field"><label for="cdCard">Card number</label><input type="text" id="cdCard" placeholder="1234 5678 9012 3456"></div>' +
            '<div class="cd-field"><label for="cdExpiry">Expiry / CVC</label><input type="text" id="cdExpiry" placeholder="MM/YY  CVC"></div>';
        document.getElementById('cdBody').innerHTML = body;
        document.getElementById('cdFooterLabel').textContent = 'Total due';
        document.getElementById('cdTotal').textContent = formatPrice(totals.total);
        document.getElementById('cdClear').classList.add('d-none');
        document.getElementById('cdCheckout').classList.add('d-none');
        document.getElementById('cdBack').classList.remove('d-none');
        document.getElementById('cdPay').classList.remove('d-none');
        return;
    }

    if (!cart.length) {
        body = '<div class="cd-empty">Your cart is empty. Add some tasty items.</div>';
    } else {
        body = cart.map(function(item) {
            return '<div class="cart-item" data-id="' + item.id + '">' +
                '<div class="ci-thumb"><img src="' + item.image + '" alt="' + item.title + '"></div>' +
                '<div class="ci-info">' +
                '  <div class="ci-top">' +
                '    <div>' +
                '      <div class="ci-title">' + item.title + '</div>' +
                '      <div class="ci-cat">' + item.category + '</div>' +
                '    </div>' +
                '    <div class="ci-price">' + formatPrice(item.price * item.quantity) + '</div>' +
                '  </div>' +
                '  <div class="ci-qty">' +
                '    <button type="button" class="ci-qty-btn" data-action="minus">-</button>' +
                '    <span>' + item.quantity + '</span>' +
                '    <button type="button" class="ci-qty-btn" data-action="plus">+</button>' +
                '    <button type="button" class="ci-remove">Remove</button>' +
                '  </div>' +
                '</div>' +
                '</div>';
        }).join('');
    }
    document.getElementById('cdBody').innerHTML = body;
    document.getElementById('cdFooterLabel').textContent = 'Total';
    document.getElementById('cdTotal').textContent = formatPrice(totals.subtotal);
    document.getElementById('cdClear').classList.remove('d-none');
    document.getElementById('cdCheckout').classList.remove('d-none');
    document.getElementById('cdBack').classList.add('d-none');
    document.getElementById('cdPay').classList.add('d-none');
    document.getElementById('cdDone').classList.add('d-none');
}

function addCartItem(item, quantity) {
    var existing = cart.find(function(entry) {
        return entry.id === item.id;
    });
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: item.id,
            title: item.title,
            category: item.category,
            price: item.price,
            image: item.image,
            quantity: quantity
        });
    }
    saveCart();
}

function updateCartItem(id, quantity) {
    var item = cart.find(function(entry) {
        return entry.id === id;
    });
    if (!item) return;
    if (quantity < 1) {
        removeCartItem(id);
        return;
    }
    item.quantity = quantity;
    saveCart();
}

function removeCartItem(id) {
    cart = cart.filter(function(entry) {
        return entry.id !== id;
    });
    saveCart();
}

function openCartDrawer() {
    resetCheckoutState();
    renderCartDrawer();
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
    resetCheckoutState();
}

function showCheckout() {
    if (!cart.length) {
        alert('Your cart is empty. Add items before checkout.');
        return;
    }
    checkoutMode = true;
    renderCartDrawer();
}

function goBackToCart() {
    checkoutMode = false;
    couponStatus = '';
    renderCartDrawer();
}

function applyCoupon() {
    var input = document.getElementById('cdCouponInput');
    if (!input) return;
    var code = input.value.trim().toUpperCase();
    if (!code) {
        couponStatus = 'Enter a coupon code to apply.';
        couponCode = '';
        couponDiscount = 0;
        renderCartDrawer();
        return;
    }
    var amount = COUPONS[code] || 0;
    if (!amount) {
        couponStatus = 'That coupon code is not valid.';
        couponCode = '';
        couponDiscount = 0;
    } else {
        couponCode = code;
        couponDiscount = amount;
        couponStatus = 'Coupon applied: ' + amount + '% off your order!';
    }
    renderCartDrawer();
}

function handlePayment() {
    var name = document.getElementById('cdName')?.value.trim();
    var email = document.getElementById('cdEmail')?.value.trim();
    var phone = document.getElementById('cdPhone')?.value.trim();
    var card = document.getElementById('cdCard')?.value.trim();
    var expiry = document.getElementById('cdExpiry')?.value.trim();
    if (!name || !email || !phone || !card || !expiry) {
        alert('Please complete all payment fields before submitting.');
        return;
    }
    var totals = calculateTotals();
    var paymentSummary = 'Payment completed!\n' +
        'Name: ' + name + '\n' +
        'Total amount: ' + formatPrice(totals.total) + '\n' +
        (couponCode ? 'Coupon: ' + couponCode + '\n' : '');
    saveOrder({
        id: 'MM' + Date.now().toString().slice(-6),
        name: name,
        email: email,
        phone: phone,
        items: cart.map(function(item) {
            return { title: item.title, quantity: item.quantity, price: item.price };
        }),
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
        coupon: couponCode || 'None',
        createdAt: new Date().toLocaleString()
    });
    // show order modal with summary
    var orderId = 'MM' + Date.now().toString().slice(-6);
    showOrderModal({
        id: orderId,
        name: name,
        email: email,
        total: totals.total
    });
    // clear cart but keep a record in modal
    cart = [];
    resetCheckoutState();
    saveCart();
    closeCartDrawer();
}

if (document.querySelector('.cartfl')) {
    document.querySelector('.cartfl').addEventListener('click', openCartDrawer);
}
if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartDrawer);
}
if (document.getElementById('cartClose')) {
    document.getElementById('cartClose').addEventListener('click', closeCartDrawer);
}
if (document.getElementById('cdClear')) {
    document.getElementById('cdClear').addEventListener('click', function() {
        cart = [];
        resetCheckoutState();
        saveCart();
        openCartDrawer();
    });
}
if (document.getElementById('cdCheckout')) {
    document.getElementById('cdCheckout').addEventListener('click', function() {
        showCheckout();
    });
}
if (document.getElementById('cdBack')) {
    document.getElementById('cdBack').addEventListener('click', function() {
        goBackToCart();
    });
}
if (document.getElementById('cdPay')) {
    document.getElementById('cdPay').addEventListener('click', function() {
        handlePayment();
    });
}
if (document.getElementById('cdDone')) {
    document.getElementById('cdDone').addEventListener('click', function() {
        closeCartDrawer();
    });
}
if (document.getElementById('cdBody')) {
    document.getElementById('cdBody').addEventListener('click', function(e) {
        var removeButton = e.target.closest('.ci-remove');
        if (removeButton) {
            var item = removeButton.closest('.cart-item');
            if (item) removeCartItem(item.dataset.id);
            return;
        }
        var qtyButton = e.target.closest('.ci-qty-btn');
        if (qtyButton) {
            var item = qtyButton.closest('.cart-item');
            if (!item) return;
            var id = item.dataset.id;
            var current = cart.find(function(entry) {
                return entry.id === id;
            });
            if (!current) return;
            var action = qtyButton.dataset.action;
            if (action === 'minus') {
                updateCartItem(id, current.quantity - 1);
            } else if (action === 'plus') {
                updateCartItem(id, current.quantity + 1);
            }
            return;
        }
        var applyButton = e.target.closest('#cdApplyCoupon');
        if (applyButton) {
            applyCoupon();
            return;
        }
    });
}

loadCart();

// Order modal functions (show after payment)
function showOrderModal(o) {
    var modal = document.getElementById('orderModal');
    if (!modal) return;
    document.getElementById('omOrderId').textContent = o.id || '-';
    document.getElementById('omName').textContent = o.name || '-';
    document.getElementById('omEmail').textContent = o.email || '-';
    document.getElementById('omTotal').textContent = formatPrice(o.total || 0);
    document.getElementById('omMessage').textContent = 'Thank you, ' + (o.name || '') + '! Your order is confirmed.';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
    var modal = document.getElementById('orderModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

var omClose = document.getElementById('omClose');
if (omClose) omClose.addEventListener('click', closeOrderModal);
var omContinue = document.getElementById('omContinue');
if (omContinue) omContinue.addEventListener('click', closeOrderModal);

document.getElementById('resBtn').addEventListener('click', function() {
    var btn = this;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    btn.disabled = true;
    setTimeout(function() {
        btn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Reservation';
        btn.disabled = false;
        var ok = document.getElementById('resOk');
        ok.style.display = 'block';
        ok.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 1500);
});


document.getElementById('ctcBtn').addEventListener('click', function() {
    var btn = this;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    setTimeout(function() {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.disabled = false;
        var ok = document.getElementById('ctcOk');
        ok.style.display = 'block';
        ok.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 1500);
});


var galPop = document.getElementById('galPop');
var galData = [];
var galIdx = 0;

document.querySelectorAll('.gitem').forEach(function(item) {
    galData.push({
        img: item.getAttribute('data-gimg'),
        title: item.getAttribute('data-gtitle'),
        desc: item.getAttribute('data-gdesc')
    });
    item.addEventListener('click', function() {
        openGal(parseInt(this.getAttribute('data-gi')));
    });
});

function openGal(i) {
    galIdx = i;
    var g = galData[i];
    document.getElementById('gpImg').setAttribute('src', g.img);
    document.getElementById('gpTitle').textContent = g.title;
    document.getElementById('gpDesc').innerHTML = g.desc;
    galPop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

document.getElementById('gpClose').addEventListener('click', closeGal);
galPop.addEventListener('click', function(e) {
    if (e.target === this) closeGal();
});

function closeGal() {
    galPop.classList.remove('open');
    document.body.style.overflow = '';
}

document.getElementById('gpPrev').addEventListener('click', function() {
    openGal((galIdx - 1 + galData.length) % galData.length);
});
document.getElementById('gpNext').addEventListener('click', function() {
    openGal((galIdx + 1) % galData.length);
});

/*  ESC key closes everything */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSearch();
        closeMenuPop();
        closeGal();
        if (cartDrawer && cartDrawer.classList.contains('open')) {
            closeCartDrawer();
        }
        if (typeof $.magnificPopup !== 'undefined') $.magnificPopup.close();
    }
});


new Swiper('.tesSwiper', {
    slidesPerView: 1,
    spaceBetween: 22,
    loop: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    breakpoints: {
        640: {
            slidesPerView: 2
        },
        1024: {
            slidesPerView: 3
        }
    }
});


var cH = 8,
    cM = 45,
    cS = 30;
setInterval(function() {
    cS--;
    if (cS < 0) {
        cS = 59;
        cM--;
    }
    if (cM < 0) {
        cM = 59;
        cH--;
    }
    if (cH < 0) {
        cH = 8;
        cM = 45;
        cS = 30;
    }
    document.getElementById('cdH').textContent = String(cH).padStart(2, '0');
    document.getElementById('cdM').textContent = String(cM).padStart(2, '0');
    document.getElementById('cdS').textContent = String(cS).padStart(2, '0');
}, 1000);

/* â”€â”€ NEWSLETTER â”€â”€ */
document.getElementById('nlBtn').addEventListener('click', function() {
    var email = document.getElementById('nlEmail').value;
    if (email && email.includes('@')) {
        var btn = this;
        btn.textContent = 'Subscribed!';
        btn.style.background = '#4ade80';
        btn.style.color = '#222';
        document.getElementById('nlEmail').value = '';
        setTimeout(function() {
            btn.textContent = 'Subscribe';
            btn.style.background = '';
            btn.style.color = '';
        }, 3000);
    }
});

/*  NUMBER COUNTER ANIMATION*/
var numAnimated = false;
window.addEventListener('scroll', function() {
    var hero = document.getElementById('hero');
    if (!numAnimated && hero && window.scrollY > hero.offsetHeight - 300) {
        numAnimated = true;
        document.querySelectorAll('.snum').forEach(function(el) {
            var txt = el.textContent;
            var num = parseInt(txt);
            var suf = txt.replace(/[0-9]/g, '');
            if (isNaN(num)) return;
            var start = 0;
            var step = Math.ceil(num / 55);
            var iv = setInterval(function() {
                start += step;
                if (start >= num) {
                    start = num;
                    clearInterval(iv);
                }
                el.textContent = start + suf;
            }, 1400 / 55);
        });
    }
});