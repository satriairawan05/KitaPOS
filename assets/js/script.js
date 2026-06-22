// ================================================================
// assets/js/script.js - KitaPOS
// Main application logic for Point of Sales system
// ================================================================

// ===== CURRENCY FORMATTER =====
// Format number as Indonesian Rupiah (with thousand separators)
function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Format input field value as Rupiah while typing
function formatRupiahInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === '') {
        input.value = '';
        return;
    }
    let number = parseInt(value, 10);
    if (isNaN(number)) {
        input.value = '';
        return;
    }
    input.value = formatRupiah(number);
}

// ===== MENU DATA =====
// Array to hold all menu items
let menuItems = [];
// Auto-increment ID for new items
let nextId = 1;

// ===== LOAD MENU DATA =====
// Load menu data from global variable defaultMenuData (from data.js) or use fallback data
function loadMenuData() {
    // Check if defaultMenuData is available (loaded from data.js)
    if (typeof defaultMenuData !== 'undefined' && defaultMenuData.length > 0) {
        menuItems = defaultMenuData;
        const maxId = Math.max(...menuItems.map(item => item.id));
        nextId = maxId + 1;
        renderMenu();
        updateCartUI();
        console.log('✅ Menu data loaded from data.js:', menuItems.length, 'items');
    } else {
        // Fallback data if data.js not found
        menuItems = [
            { id: 1, name: 'Nasi Goreng', price: 25000, category: 'food', status: 'available', icon: '🍚', image: null },
    { id: 2, name: 'Mie Goreng', price: 22000, category: 'food', status: 'available', icon: '🍜', image: null },
    { id: 3, name: 'Ayam Geprek', price: 28000, category: 'food', status: 'low', icon: '🍗', image: null },
    { id: 4, name: 'Es Teh Manis', price: 8000, category: 'drink', status: 'available', icon: '🧋', image: null },
    { id: 5, name: 'Es Jeruk', price: 10000, category: 'drink', status: 'available', icon: '🍊', image: null },
    { id: 6, name: 'Kopi Hitam', price: 12000, category: 'drink', status: 'out', icon: '☕', image: null },
    { id: 7, name: 'Pisang Goreng', price: 15000, category: 'snack', status: 'available', icon: '🍌', image: null },
    { id: 8, name: 'Kentang Goreng', price: 18000, category: 'snack', status: 'available', icon: '🥔', image: null },
    { id: 9, name: 'Roti Bakar', price: 14000, category: 'snack', status: 'low', icon: '🍞', image: null }
        ];
        nextId = 10;
        renderMenu();
        updateCartUI();
        console.log('⚠️ Using fallback data (data.js not found)');
    }
}

// ===== CART =====
// Shopping cart array
let cart = [];

// ===== TRANSACTION HISTORY =====
// Array to store completed transactions
let transactionHistory = [];

// ===== DOM REFERENCES =====
// Cache DOM elements for better performance
const menuGrid = document.getElementById('menuGrid');
const menuEmpty = document.getElementById('menuEmpty');
const searchInput = document.getElementById('searchMenu');
const categoryBtns = document.querySelectorAll('.btn-cat');

const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartItemCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const mobileCartItems = document.getElementById('mobileCartItems');
const mobileCartTotal = document.getElementById('mobileCartTotal');
const mobileCartCount = document.getElementById('mobileCartItemCount');
const mobileCartBadge = document.getElementById('mobileCartBadge');
const mobileCartBadge2 = document.getElementById('mobileCartBadge2');
const mobileCartCountTop = document.getElementById('mobileCartCount');
const desktopCartCount = document.getElementById('desktopCartCount');

const mobileCartSidebar = document.getElementById('mobileCartSidebar');
const toggleCartBtn = document.getElementById('toggleCartMobile');
const closeCartBtn = document.getElementById('closeMobileCart');
const mobileCartToggle = document.getElementById('mobileCartToggle');

// Bootstrap modal instances
const addItemModal = new bootstrap.Modal(document.getElementById('addItemModal'));
const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
const calcModal = new bootstrap.Modal(document.getElementById('calcModal'));
const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));

// ===== QUICK PAY BUTTONS =====
// Generate quick payment amount buttons based on total
function generateQuickPayButtons(total) {
    const container = document.getElementById('quickPayButtons');
    if (!container) return;

    if (total === 0) {
        container.innerHTML = '';
        return;
    }

    let recommendations = [];
    let exact = total;

    // Determine suggested payment amounts
    if (total <= 50000) {
        recommendations = [50000, 70000, 100000];
    } else if (total <= 100000) {
        recommendations = [100000, 150000, 200000];
    } else {
        recommendations = [150000, 200000, 250000];
    }

    recommendations = recommendations.filter(val => val !== total);
    while (recommendations.length < 3) {
        let last = recommendations.length > 0 ? recommendations[recommendations.length - 1] : total;
        recommendations.push(last + 50000);
    }
    recommendations = recommendations.slice(0, 3);

    let html = '<div class="d-flex flex-wrap gap-2">';
    html += `<button class="quick-pay-btn btn-exact" data-value="${exact}">Exact</button>`;
    recommendations.forEach(val => {
        html += `<button class="quick-pay-btn" data-value="${val}">Rp ${formatRupiah(val)}</button>`;
    });
    html += '</div>';

    container.innerHTML = html;

    container.querySelectorAll('.quick-pay-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const value = parseInt(this.dataset.value);
            const paymentInput = document.getElementById('paymentAmount');
            paymentInput.value = formatRupiah(value);
            paymentInput.dispatchEvent(new Event('input'));

            container.querySelectorAll('.quick-pay-btn').forEach(b => b.classList.remove('active-btn'));
            this.classList.add('active-btn');
        });
    });
}

// ===== GO HOME FUNCTION =====
// Reset filters and scroll to top of menu
function goHome() {
    categoryBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.btn-cat[data-cat="all"]').classList.add('active');
    currentCategory = 'all';
    searchInput.value = '';
    searchQuery = '';
    renderMenu();
    document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('🏠 Returned to main menu');
}

// ===== EVENT LISTENERS FOR NAVIGATION =====
document.getElementById('goHomeDesktop').addEventListener('click', goHome);
document.getElementById('goHomeFab').addEventListener('click', goHome);
document.getElementById('openCalcDesktop').addEventListener('click', () => calcModal.show());
document.getElementById('openCalcMobile').addEventListener('click', () => calcModal.show());
document.getElementById('openHistoryDesktop').addEventListener('click', () => {
    renderHistory();
    historyModal.show();
});
document.getElementById('openHistoryMobile').addEventListener('click', () => {
    renderHistory();
    historyModal.show();
});

// Toast notification setup
const toastEl = document.getElementById('liveToast');
const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
const toastMsg = document.getElementById('toastMessage');

// ===== RENDER MENU =====
// Current category filter (all, makanan, minuman, cemilan)
let currentCategory = 'all';
// Current search query
let searchQuery = '';

// Render menu items based on current filters
function renderMenu() {
    let filtered = menuItems;
    if (currentCategory !== 'all') {
        filtered = filtered.filter(item => item.category === currentCategory);
    }
    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(item => item.name.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
        menuGrid.innerHTML = '';
        menuEmpty.classList.remove('d-none');
        return;
    }
    menuEmpty.classList.add('d-none');

    let html = '';
    filtered.forEach(item => {
        const statusMap = {
            available: { label: '✅ Available', cls: 'available' },
            low: { label: '⚠️ Low Stock', cls: 'low' },
            out: { label: '❌ Out of Stock', cls: 'out' }
        };
        const st = statusMap[item.status] || statusMap.out;
        const disabled = item.status === 'out' ? 'disabled' : '';

        const imageHtml = item.image ?
            `<img src="${item.image}" alt="${item.name}" />` :
            `<span class="no-image">${item.icon || '🍽️'}</span>`;

        html += `
            <div class="menu-card" data-id="${item.id}">
                <div class="menu-img">${imageHtml}</div>
                <div class="menu-name" title="${item.name}">${item.name}</div>
                <div class="menu-price">Rp ${formatRupiah(item.price)}</div>
                <span class="menu-status ${st.cls}">${st.label}</span>
                <div class="menu-actions">
                    <button class="btn-action btn-add-action" ${disabled} data-id="${item.id}" title="Add to cart">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                    <button class="btn-action btn-edit-action" data-id="${item.id}" title="Edit menu">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            </div>
        `;
    });
    menuGrid.innerHTML = html;

    // Attach event listeners to "Add" buttons
    document.querySelectorAll('.menu-card .btn-add-action:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function () {
            addToCart(parseInt(this.dataset.id));
        });
    });

    // Attach event listeners to "Edit" buttons
    document.querySelectorAll('.menu-card .btn-edit-action').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            openEditMenu(id);
        });
    });
}

// ===== CATEGORY FILTER =====
categoryBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        categoryBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.cat;
        renderMenu();
    });
});

// ===== SEARCH =====
searchInput.addEventListener('input', function () {
    searchQuery = this.value;
    renderMenu();
});

// ===== CART FUNCTIONS =====
// Add item to cart
function addToCart(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item || item.status === 'out') {
        showToast('Menu not available!');
        return;
    }
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    showToast(`✅ ${item.name} added to cart`);
}

// Remove one quantity of item from cart
function removeFromCart(id) {
    const idx = cart.findIndex(c => c.id === id);
    if (idx === -1) return;
    if (cart[idx].qty > 1) {
        cart[idx].qty -= 1;
    } else {
        cart.splice(idx, 1);
    }
    updateCartUI();
}

// Clear entire cart
function clearCart() {
    cart = [];
    updateCartUI();
}

// Calculate total price of cart
function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// Calculate total quantity of items in cart
function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

// Update all cart UI elements (desktop and mobile)
function updateCartUI() {
    const total = getCartTotal();
    const count = getCartCount();
    const totalStr = `Rp ${formatRupiah(total)}`;

    // Desktop cart items
    cartItemsEl.innerHTML = cart.length === 0 ?
        `<div class="cart-empty"><i class="bi bi-basket"></i>No items yet</div>` :
        cart.map(item => `
            <div class="cart-item">
                <span>${item.icon || '🍽️'} ${item.name} <span class="qty">×${item.qty}</span></span>
                <span>
                    Rp ${formatRupiah(item.price * item.qty)}
                    <button class="remove-btn" data-id="${item.id}"><i class="bi bi-dash-circle"></i></button>
                </span>
            </div>
        `).join('');

    cartTotalEl.textContent = totalStr;
    cartCountEl.textContent = count;
    desktopCartCount.textContent = count;
    checkoutBtn.disabled = count === 0;

    // Mobile cart items
    mobileCartItems.innerHTML = cart.length === 0 ?
        `<div class="cart-empty"><i class="bi bi-basket"></i>No items yet</div>` :
        cart.map(item => `
            <div class="cart-item">
                <span>${item.icon || '🍽️'} ${item.name} <span class="qty">×${item.qty}</span></span>
                <span>
                    Rp ${formatRupiah(item.price * item.qty)}
                    <button class="remove-btn" data-id="${item.id}"><i class="bi bi-dash-circle"></i></button>
                </span>
            </div>
        `).join('');

    mobileCartTotal.textContent = totalStr;
    mobileCartCount.textContent = count;
    mobileCartBadge.textContent = count;
    mobileCartBadge2.textContent = count;
    mobileCartCountTop.textContent = count;
    document.getElementById('mobileCheckoutBtn').disabled = count === 0;

    // Attach remove event listeners to all remove buttons
    document.querySelectorAll('.cart-item .remove-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            removeFromCart(parseInt(this.dataset.id));
        });
    });
    document.querySelectorAll('#mobileCartItems .remove-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            removeFromCart(parseInt(this.dataset.id));
        });
    });
}

// ===== CHECKOUT =====
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
document.getElementById('mobileCheckoutBtn').addEventListener('click', openCheckout);

// Open checkout modal with order summary
function openCheckout() {
    if (cart.length === 0) return;
    const total = getCartTotal();
    const summaryEl = document.getElementById('checkoutSummary');
    let html = `
        <p class="fw-600 mb-2">Ordered items:</p>
        ${cart.map(item => `
            <div class="item-row">
                <span>${item.icon || '🍽️'} ${item.name} × ${item.qty}</span>
                <span>Rp ${formatRupiah(item.price * item.qty)}</span>
            </div>
        `).join('')}
        <div class="total-row">
            <span>Total</span>
            <span>Rp ${formatRupiah(total)}</span>
        </div>
    `;
    summaryEl.innerHTML = html;
    document.getElementById('checkoutGrandTotal').textContent = `Rp ${formatRupiah(total)}`;

    const $paymentMethod = $('#paymentMethod');
    $paymentMethod.val('cash').trigger('change');

    document.getElementById('paymentAmount').value = '';
    document.getElementById('changeAmount').textContent = 'Rp 0';
    document.getElementById('paymentAmount').disabled = false;
    document.getElementById('paymentLabel').textContent = 'Pay (IDR)';
    document.getElementById('qrisInfo').style.display = 'none';
    document.getElementById('changeDisplay').style.display = 'block';

    generateQuickPayButtons(total);

    checkoutModal.show();
}

// ===== PAYMENT METHOD HANDLER =====
$(document).on('change', '#paymentMethod', function () {
    const method = this.value;
    const total = getCartTotal();
    const paymentInput = document.getElementById('paymentAmount');
    const changeDisplay = document.getElementById('changeDisplay');
    const qrisInfo = document.getElementById('qrisInfo');
    const paymentLabel = document.getElementById('paymentLabel');

    if (method === 'qris') {
        paymentInput.value = formatRupiah(total);
        paymentInput.disabled = true;
        paymentLabel.textContent = 'Total Paid (QRIS)';
        changeDisplay.style.display = 'none';
        qrisInfo.style.display = 'block';
        document.getElementById('changeAmount').textContent = `Rp ${formatRupiah(0)}`;
        document.getElementById('quickPayButtons').innerHTML = '';
    } else {
        paymentInput.value = '';
        paymentInput.disabled = false;
        paymentLabel.textContent = 'Pay (IDR)';
        changeDisplay.style.display = 'block';
        qrisInfo.style.display = 'none';
        generateQuickPayButtons(total);
        paymentInput.dispatchEvent(new Event('input'));
    }
});

// ===== RUPIAH FORMAT ON PAYMENT INPUT =====
document.getElementById('paymentAmount').addEventListener('input', function (e) {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const length = this.value.length;

    formatRupiahInput(this);

    const newLength = this.value.length;
    this.setSelectionRange(newLength, newLength);

    const rawValue = this.value.replace(/\D/g, '');
    const paid = parseInt(rawValue) || 0;
    const total = getCartTotal();
    const change = paid - total;
    const changeEl = document.getElementById('changeAmount');
    if (change >= 0) {
        changeEl.textContent = `Rp ${formatRupiah(change)}`;
        changeEl.style.color = 'var(--pos-accent)';
    } else {
        changeEl.textContent = `Rp ${formatRupiah(Math.abs(change))} (insufficient)`;
        changeEl.style.color = '#e74c3c';
    }

    const quickButtons = document.querySelectorAll('.quick-pay-btn');
    quickButtons.forEach(btn => {
        btn.classList.remove('active-btn');
        if (parseInt(btn.dataset.value) === paid) {
            btn.classList.add('active-btn');
        }
    });
});

// ===== CONFIRM CHECKOUT =====
document.getElementById('confirmCheckout').addEventListener('click', function () {
    const total = getCartTotal();
    const method = document.getElementById('paymentMethod').value;
    const rawValue = document.getElementById('paymentAmount').value.replace(/\D/g, '');
    let paid = parseInt(rawValue) || 0;

    if (method === 'cash') {
        if (paid < total) {
            showToast('❌ Payment insufficient!');
            return;
        }
        const change = paid - total;
        saveTransaction('Cash', total, paid, change);
        showToast(`✅ Checkout successful! Method: Cash. Change: Rp ${formatRupiah(change)}`);
    } else {
        if (paid !== total) {
            paid = total;
            document.getElementById('paymentAmount').value = formatRupiah(total);
        }
        saveTransaction('QRIS', total, paid, 0);
        showToast(`✅ Checkout successful! Method: QRIS. Total: Rp ${formatRupiah(total)}`);
    }

    clearCart();
    checkoutModal.hide();
    mobileCartSidebar.classList.remove('open');
});

// ===== SAVE TRANSACTION =====
// Save completed transaction to localStorage
function saveTransaction(method, total, paid, change) {
    const now = new Date();
    const timestamp = now.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const transaction = {
        id: transactionHistory.length + 1,
        timestamp: timestamp,
        items: cart.map(item => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
            subtotal: item.price * item.qty
        })),
        total: total,
        method: method,
        paid: paid,
        change: change
    };
    transactionHistory.push(transaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
}

// ===== DELETE SINGLE TRANSACTION =====
function deleteTransaction(id) {
    if (confirm(`Are you sure you want to delete transaction #${id}?`)) {
        transactionHistory = transactionHistory.filter(trx => trx.id !== id);
        transactionHistory.forEach((trx, index) => {
            trx.id = index + 1;
        });
        localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
        renderHistory();
        showToast(`🗑️ Transaction #${id} has been deleted`);
    }
}

// ===== RENDER HISTORY =====
// Render transaction history with grand total at top
function renderHistory() {
    const container = document.getElementById('historyContent');
    const stored = localStorage.getItem('transactionHistory');
    if (stored) {
        transactionHistory = JSON.parse(stored);
    }

    if (transactionHistory.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <i class="bi bi-inbox"></i>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }

    // Calculate grand total
    const grandTotal = transactionHistory.reduce((sum, trx) => sum + trx.total, 0);

    let html = '';

    // Grand total at the top
    html += `
        <div class="history-grand-total">
            <div class="d-flex justify-content-between align-items-center">
                <span class="label"><i class="bi bi-cash-stack me-2"></i>Grand Total</span>
                <span class="total">Rp ${formatRupiah(grandTotal)}</span>
            </div>
        </div>
        <hr />
    `;

    // Display transactions in reverse chronological order (newest first)
    const reversed = [...transactionHistory].reverse();
    reversed.forEach((trx) => {
        const itemsList = trx.items.map(item =>
            `${item.name} (${item.qty}×Rp${formatRupiah(item.price)})`
        ).join(', ');
        html += `
            <div class="history-item" data-id="${trx.id}">
                <div class="header">
                    <span>#${trx.id} - ${trx.timestamp}</span>
                    <div class="history-actions">
                        <span class="text-accent">Rp ${formatRupiah(trx.total)}</span>
                        <button class="delete-history-btn" data-id="${trx.id}" title="Delete transaction">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="detail">
                    <span><i class="bi bi-tag"></i> ${trx.method}</span>
                    <span><i class="bi bi-cash-stack"></i> Paid: Rp ${formatRupiah(trx.paid)}</span>
                    ${trx.method === 'Cash' ? `<span><i class="bi bi-arrow-return-left"></i> Change: Rp ${formatRupiah(trx.change)}</span>` : ''}
                </div>
                <div class="detail" style="font-size:0.8rem;color:#888;">
                    <i class="bi bi-list-ul"></i> ${itemsList}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.delete-history-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.dataset.id);
            deleteTransaction(id);
        });
    });
}

// ===== CLEAR ALL HISTORY =====
document.getElementById('clearHistoryBtn').addEventListener('click', function () {
    if (confirm('Are you sure you want to clear all transaction history?')) {
        transactionHistory = [];
        localStorage.removeItem('transactionHistory');
        renderHistory();
        showToast('🗑️ All history has been cleared');
    }
});

// ===== MANUAL ADD ITEM =====
// Preview uploaded image for new item
document.getElementById('manualImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imagePreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.style.display = 'none';
        preview.src = '#';
    }
});

// Format price input for new item
document.getElementById('manualPrice').addEventListener('input', function (e) {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const length = this.value.length;

    formatRupiahInput(this);

    const newLength = this.value.length;
    this.setSelectionRange(newLength, newLength);
});

// Preview image for edit item
document.getElementById('editImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('editImagePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            preview.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
        preview.src = '#';
    }
});

// Format price input for edit item
document.getElementById('editPrice').addEventListener('input', function (e) {
    formatRupiahInput(this);
});

// Save new menu item
document.getElementById('saveManualItem').addEventListener('click', function () {
    const name = document.getElementById('manualName').value.trim();
    const rawPrice = document.getElementById('manualPrice').value.replace(/\D/g, '');
    const price = parseInt(rawPrice) || 0;
    const category = document.getElementById('manualCategory').value;
    const status = document.getElementById('manualStatus').value;
    const icon = document.getElementById('manualIcon').value.trim() || '🍽️';
    const imageFile = document.getElementById('manualImage').files[0];

    if (!name) {
        showToast('❌ Menu name is required!');
        return;
    }
    if (price <= 0) {
        showToast('❌ Price must be a positive number!');
        return;
    }

    let imageData = null;
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (event) {
            imageData = event.target.result;
            saveNewItem(name, price, category, status, icon, imageData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveNewItem(name, price, category, status, icon, null);
    }
});

// Helper to save new item and update UI
function saveNewItem(name, price, category, status, icon, imageData) {
    const newItem = {
        id: nextId++,
        name: name,
        price: price,
        category: category,
        status: status,
        icon: icon,
        image: imageData
    };
    menuItems.push(newItem);
    renderMenu();
    addItemModal.hide();
    showToast(`✅ Menu "${name}" has been added successfully!`);
    document.getElementById('addItemForm').reset();
    document.getElementById('manualIcon').value = '🍽️';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreview').src = '#';
}

// ===== EDIT MENU =====
// Open edit modal with selected item data
function openEditMenu(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) {
        showToast('❌ Menu not found!');
        return;
    }

    document.getElementById('editItemId').value = item.id;
    document.getElementById('editName').value = item.name;
    document.getElementById('editPrice').value = formatRupiah(item.price);
    document.getElementById('editCategory').value = item.category;
    document.getElementById('editStatus').value = item.status;
    document.getElementById('editIcon').value = item.icon || '🍽️';

    const preview = document.getElementById('editImagePreview');
    if (item.image) {
        preview.src = item.image;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
        preview.src = '#';
    }
    document.getElementById('editImage').value = '';

    const editModal = new bootstrap.Modal(document.getElementById('editItemModal'));
    editModal.show();

    // Re-initialize Select2 for dropdowns inside modal
    setTimeout(() => {
        $('#editCategory, #editStatus').select2('destroy');
        $('#editCategory, #editStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownParent: $('#editItemModal'),
            dropdownAutoWidth: true,
            placeholder: 'Select...',
            allowClear: false
        });
    }, 100);
}

// Save edited item
document.getElementById('saveEditItem').addEventListener('click', function () {
    const id = parseInt(document.getElementById('editItemId').value);
    const name = document.getElementById('editName').value.trim();
    const rawPrice = document.getElementById('editPrice').value.replace(/\D/g, '');
    const price = parseInt(rawPrice) || 0;
    const category = document.getElementById('editCategory').value;
    const status = document.getElementById('editStatus').value;
    const icon = document.getElementById('editIcon').value.trim() || '🍽️';
    const imageFile = document.getElementById('editImage').files[0];

    if (!name) {
        showToast('❌ Menu name is required!');
        return;
    }
    if (price <= 0) {
        showToast('❌ Price must be a positive number!');
        return;
    }

    const index = menuItems.findIndex(i => i.id === id);
    if (index === -1) {
        showToast('❌ Menu not found!');
        return;
    }

    function applyEdit(imageData) {
        menuItems[index] = {
            ...menuItems[index],
            name: name,
            price: price,
            category: category,
            status: status,
            icon: icon,
            image: imageData !== undefined ? imageData : menuItems[index].image
        };

        // Update cart items if they exist
        cart.forEach(cartItem => {
            if (cartItem.id === id) {
                cartItem.name = name;
                cartItem.price = price;
                cartItem.icon = icon;
            }
        });

        renderMenu();
        updateCartUI();
        bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
        showToast(`✅ Menu "${name}" has been updated successfully!`);
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (event) {
            applyEdit(event.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        applyEdit();
    }
});

// Reset manual price field when add modal opens
$('#addItemModal').on('shown.bs.modal', function () {
    document.getElementById('manualPrice').value = '';
});

// ===== MOBILE CART TOGGLE =====
// Toggle mobile cart sidebar visibility
function toggleMobileCart() {
    mobileCartSidebar.classList.toggle('open');
}

// Event listeners for opening/closing mobile cart
toggleCartBtn.addEventListener('click', toggleMobileCart);
mobileCartToggle.addEventListener('click', toggleMobileCart);
closeCartBtn.addEventListener('click', toggleMobileCart);

// Close mobile cart when clicking outside
document.addEventListener('click', function (e) {
    if (window.innerWidth < 992) {
        const sidebar = mobileCartSidebar;
        const toggle = mobileCartToggle;
        const toggleBtn = toggleCartBtn;
        if (sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    }
});

// ===== CALCULATOR =====
// Calculator with thousand separators (e.g., 50000 -> 50.000)
let calcDisplayModal = document.getElementById('calcDisplayModal');
let calcExpression = '';        // expression as string (unformatted)
let calcResult = '';            // last result (unformatted)
let calcJustEvaluated = false;

// Format number with thousand separators
function formatThousand(numStr) {
    let parts = numStr.split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    let formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formatted + decimalPart;
}

// Update calculator display with formatting
function updateCalcDisplayModal() {
    if (!calcExpression) {
        calcDisplayModal.textContent = '0';
        return;
    }
    let displayText = calcExpression;
    // If expression ends with operator, show as-is
    if (['+', '−', '×', '÷'].includes(displayText.slice(-1))) {
        calcDisplayModal.textContent = displayText;
        return;
    }
    // Split by operators, format numbers, then join back
    let tokens = displayText.split(/([+\−×÷])/);
    let formattedTokens = tokens.map(token => {
        if (['+', '−', '×', '÷'].includes(token)) return token;
        let num = parseFloat(token);
        if (!isNaN(num) && token !== '') {
            return formatThousand(token);
        }
        return token;
    });
    calcDisplayModal.textContent = formattedTokens.join('');
}

// Append a value to the expression
function appendToExpression(value) {
    if (calcJustEvaluated) {
        if (['+', '−', '×', '÷'].includes(value)) {
            calcExpression = calcResult + value;
        } else {
            calcExpression = value;
        }
        calcJustEvaluated = false;
    } else {
        const lastChar = calcExpression.slice(-1);
        // Prevent multiple dots or consecutive operators
        if (value === '.') {
            let lastNum = calcExpression.split(/[+\−×÷]/).pop();
            if (lastNum && lastNum.includes('.')) return;
        }
        if (['+', '−', '×', '÷'].includes(value) && ['+', '−', '×', '÷'].includes(lastChar)) {
            calcExpression = calcExpression.slice(0, -1) + value;
            updateCalcDisplayModal();
            return;
        }
        calcExpression += value;
    }
    updateCalcDisplayModal();
}

// Event listeners for number and decimal buttons
document.querySelectorAll('#calcModal .calc-btn[data-val]').forEach(btn => {
    btn.addEventListener('click', function () {
        const val = this.dataset.val;
        appendToExpression(val);
    });
});

// Clear button
document.getElementById('calcClearModal').addEventListener('click', function () {
    calcExpression = '';
    calcResult = '';
    calcJustEvaluated = false;
    updateCalcDisplayModal();
});

// Backspace button
document.getElementById('calcBackspaceModal').addEventListener('click', function () {
    if (calcJustEvaluated) {
        calcExpression = '';
        calcJustEvaluated = false;
    } else {
        calcExpression = calcExpression.slice(0, -1);
    }
    updateCalcDisplayModal();
});

// Equals button
document.getElementById('calcEqualsModal').addEventListener('click', function () {
    try {
        let expr = calcExpression;
        expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        const result = Function('"use strict"; return (' + expr + ')')();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
            let rounded = Math.round(result * 100) / 100;
            let resultStr = rounded.toString();
            calcResult = resultStr;
            calcExpression = resultStr;
            calcJustEvaluated = true;
            updateCalcDisplayModal();
        } else {
            calcExpression = 'Error';
            updateCalcDisplayModal();
            setTimeout(() => {
                calcExpression = '';
                updateCalcDisplayModal();
            }, 800);
        }
    } catch (e) {
        calcExpression = 'Error';
        updateCalcDisplayModal();
        setTimeout(() => {
            calcExpression = '';
            updateCalcDisplayModal();
        }, 800);
    }
});

// Initialize calculator display
updateCalcDisplayModal();

// Keyboard support for calculator
document.addEventListener('keydown', function (e) {
    const modalOpen = document.getElementById('calcModal').classList.contains('show');
    if (!modalOpen) return;
    const key = e.key;
    if (key >= '0' && key <= '9') {
        appendToExpression(key);
    } else if (key === '.') {
        appendToExpression('.');
    } else if (key === '+') {
        appendToExpression('+');
    } else if (key === '-') {
        appendToExpression('−');
    } else if (key === '*') {
        appendToExpression('×');
    } else if (key === '/') {
        appendToExpression('÷');
    } else if (key === 'Enter' || key === '=') {
        document.getElementById('calcEqualsModal').click();
    } else if (key === 'Backspace') {
        document.getElementById('calcBackspaceModal').click();
    } else if (key === 'Escape') {
        document.getElementById('calcClearModal').click();
    }
});

// ===== TOAST =====
// Show toast notification
function showToast(msg) {
    toastMsg.textContent = msg;
    toast.show();
}

// ===== UPDATE FOOTER YEAR =====
// Update footer copyright year
function updateFooterYear() {
    const startYear = 2026;
    const currentYear = new Date().getFullYear();
    const footerYearEl = document.getElementById('footerYear');
    if (currentYear === startYear) {
        footerYearEl.textContent = `${startYear}`;
    } else {
        footerYearEl.textContent = `${startYear} - ${currentYear}`;
    }
}

// ================================================================
// ===== SELECT2 INITIALIZATION =====
// ================================================================
$(document).ready(function () {
    // Initialize all Select2 dropdowns
    function initSelect2() {
        $('.select2-custom').select2({
            theme: 'default',
            width: '100%',
            dropdownAutoWidth: true,
            placeholder: 'Select...',
            allowClear: false
        });
    }

    initSelect2();

    // Reinitialize Select2 inside modals when they open
    $('#addItemModal').on('shown.bs.modal', function () {
        $('#manualCategory, #manualStatus').select2('destroy');
        $('#manualCategory, #manualStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownParent: $('#addItemModal'),
            dropdownAutoWidth: true,
            placeholder: 'Select...',
            allowClear: false
        });
    });

    $('#editItemModal').on('shown.bs.modal', function () {
        $('#editCategory, #editStatus').select2('destroy');
        $('#editCategory, #editStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownParent: $('#editItemModal'),
            dropdownAutoWidth: true,
            placeholder: 'Select...',
            allowClear: false
        });
    });

    $('#editItemModal').on('hidden.bs.modal', function () {
        $('#editCategory, #editStatus').select2('destroy');
        $('#editCategory, #editStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownAutoWidth: true,
            placeholder: 'Select...',
            allowClear: false
        });
    });

    $('#checkoutModal').on('shown.bs.modal', function () {
        $('#paymentMethod').select2('destroy');
        $('#paymentMethod').select2({
            theme: 'default',
            width: '100%',
            dropdownParent: $('#checkoutModal'),
            dropdownAutoWidth: true,
            placeholder: 'Select...',
            allowClear: false
        });
    });

    $('#addItemModal').on('hidden.bs.modal', function () {
        $('#manualCategory, #manualStatus').select2('destroy');
        $('#manualCategory, #manualStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownAutoWidth: true,
            placeholder: 'Select...',
            allowClear: false
        });
    });

    $('#checkoutModal').on('hidden.bs.modal', function () {
        $('#paymentMethod').select2('destroy');
        $('#paymentMethod').select2({
            theme: 'default',
            width: '100%',
            dropdownAutoWidth: true,
            placeholder: 'Select...',
            allowClear: false
        });
    });
});

// ===== HIDE CART TOGGLE WHEN HISTORY IS OPEN =====
const historyModalEl = document.getElementById('historyModal');
if (historyModalEl) {
    historyModalEl.addEventListener('show.bs.modal', function() {
        if (window.innerWidth < 992) {
            const toggleBtn = document.getElementById('mobileCartToggle');
            if (toggleBtn) toggleBtn.style.display = 'none';
        }
    });
    historyModalEl.addEventListener('hidden.bs.modal', function() {
        if (window.innerWidth < 992) {
            const toggleBtn = document.getElementById('mobileCartToggle');
            if (toggleBtn) toggleBtn.style.display = 'flex';
        } else {
            const toggleBtn = document.getElementById('mobileCartToggle');
            if (toggleBtn) toggleBtn.style.display = 'none';
        }
    });
}

// ===== INITIALIZATION =====
// Run on page load
updateFooterYear();
loadMenuData();

// Load transaction history from localStorage
const storedHistory = localStorage.getItem('transactionHistory');
if (storedHistory) {
    transactionHistory = JSON.parse(storedHistory);
}

// Reset mobile cart when resizing to desktop
window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) {
        mobileCartSidebar.classList.remove('open');
    }
});

console.log('✅ KitaPOS ready!');
console.log('📱 Mobile-first responsive.');
console.log('❤️ Theme: #ED020E');
console.log('📜 Menu data from assets/data/data.json');
console.log('🏷️ Footer: Kernel of Inventory Talent and Asset');
console.log('📊 Grand Total at top of history');