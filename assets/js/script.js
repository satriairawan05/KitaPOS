// ================================================================
// assets/js/script.js - KitaPOS
// ================================================================

// ===== FORMAT RUPIAH =====
function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

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

// ===== DATA MENU (dari JSON) =====
let menuItems = [];
let nextId = 1;

// ===== LOAD DATA DARI JSON =====
function loadMenuData() {
    $.ajax({
        url: 'assets/data/data.json',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            menuItems = data;
            if (menuItems.length > 0) {
                const maxId = Math.max(...menuItems.map(item => item.id));
                nextId = maxId + 1;
            }
            renderMenu();
            updateCartUI();
            console.log('✅ Data menu loaded dari JSON:', menuItems.length, 'item');
        },
        error: function(xhr, status, error) {
            console.error('❌ Gagal load data.json:', error);
            // Gunakan data default
            menuItems = [
                { id: 1, name: 'Nasi Goreng', price: 25000, category: 'makanan', status: 'available', icon: '🍚', image: null },
                { id: 2, name: 'Mie Goreng', price: 22000, category: 'makanan', status: 'available', icon: '🍜', image: null },
                { id: 3, name: 'Ayam Geprek', price: 28000, category: 'makanan', status: 'low', icon: '🍗', image: null },
                { id: 4, name: 'Es Teh Manis', price: 8000, category: 'minuman', status: 'available', icon: '🧋', image: null },
                { id: 5, name: 'Es Jeruk', price: 10000, category: 'minuman', status: 'available', icon: '🍊', image: null },
                { id: 6, name: 'Kopi Hitam', price: 12000, category: 'minuman', status: 'out', icon: '☕', image: null },
                { id: 7, name: 'Pisang Goreng', price: 15000, category: 'cemilan', status: 'available', icon: '🍌', image: null },
                { id: 8, name: 'Kentang Goreng', price: 18000, category: 'cemilan', status: 'available', icon: '🥔', image: null },
                { id: 9, name: 'Roti Bakar', price: 14000, category: 'cemilan', status: 'low', icon: '🍞', image: null }
            ];
            nextId = 10;
            renderMenu();
            updateCartUI();
            showToast('⚠️ Menggunakan data default (data.json tidak ditemukan)');
        }
    });
}

// ===== CART =====
let cart = [];

// ===== HISTORY TRANSAKSI =====
let transactionHistory = [];

// ===== DOM REFS =====
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

const addItemModal = new bootstrap.Modal(document.getElementById('addItemModal'));
const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
const calcModal = new bootstrap.Modal(document.getElementById('calcModal'));
const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));

// ===== GENERATE QUICK PAY BUTTONS =====
function generateQuickPayButtons(total) {
    const container = document.getElementById('quickPayButtons');
    if (!container) return;

    if (total === 0) {
        container.innerHTML = '';
        return;
    }

    let recommendations = [];
    let exact = total;

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
    html += `<button class="quick-pay-btn btn-exact" data-value="${exact}">Pas</button>`;
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

// ===== FUNGSI GO HOME =====
function goHome() {
    categoryBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.btn-cat[data-cat="all"]').classList.add('active');
    currentCategory = 'all';
    searchInput.value = '';
    searchQuery = '';
    renderMenu();
    document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('🏠 Kembali ke menu utama');
}

// ===== EVENT LISTENER =====
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

const toastEl = document.getElementById('liveToast');
const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
const toastMsg = document.getElementById('toastMessage');

// ===== RENDER MENU =====
let currentCategory = 'all';
let searchQuery = '';

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
            available: { label: '✅ Tersedia', cls: 'available' },
            low: { label: '⚠️ Stok Menipis', cls: 'low' },
            out: { label: '❌ Habis', cls: 'out' }
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
                    <button class="btn-action btn-add-action" ${disabled} data-id="${item.id}" title="Tambah ke keranjang">
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

    document.querySelectorAll('.menu-card .btn-add-action:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function () {
            addToCart(parseInt(this.dataset.id));
        });
    });

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
function addToCart(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item || item.status === 'out') {
        showToast('Menu tidak tersedia!');
        return;
    }
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    showToast(`✅ ${item.name} ditambahkan ke keranjang`);
}

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

function clearCart() {
    cart = [];
    updateCartUI();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
    const total = getCartTotal();
    const count = getCartCount();
    const totalStr = `Rp ${formatRupiah(total)}`;

    cartItemsEl.innerHTML = cart.length === 0 ?
        `<div class="cart-empty"><i class="bi bi-basket"></i>Belum ada item</div>` :
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

    mobileCartItems.innerHTML = cart.length === 0 ?
        `<div class="cart-empty"><i class="bi bi-basket"></i>Belum ada item</div>` :
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

function openCheckout() {
    if (cart.length === 0) return;
    const total = getCartTotal();
    const summaryEl = document.getElementById('checkoutSummary');
    let html = `
        <p class="fw-600 mb-2">Item yang dipesan:</p>
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
    document.getElementById('paymentLabel').textContent = 'Bayar (Rp)';
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
        paymentLabel.textContent = 'Total Dibayar (QRIS)';
        changeDisplay.style.display = 'none';
        qrisInfo.style.display = 'block';
        document.getElementById('changeAmount').textContent = `Rp ${formatRupiah(0)}`;
        document.getElementById('quickPayButtons').innerHTML = '';
    } else {
        paymentInput.value = '';
        paymentInput.disabled = false;
        paymentLabel.textContent = 'Bayar (Rp)';
        changeDisplay.style.display = 'block';
        qrisInfo.style.display = 'none';
        generateQuickPayButtons(total);
        paymentInput.dispatchEvent(new Event('input'));
    }
});

// ===== EVENT FORMAT RUPIAH PADA INPUT BAYAR =====
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
        changeEl.textContent = `Rp ${formatRupiah(Math.abs(change))} (kurang)`;
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
            showToast('❌ Pembayaran kurang!');
            return;
        }
        const change = paid - total;
        saveTransaction('Cash', total, paid, change);
        showToast(`✅ Checkout berhasil! Metode: Cash. Kembalian: Rp ${formatRupiah(change)}`);
    } else {
        if (paid !== total) {
            paid = total;
            document.getElementById('paymentAmount').value = formatRupiah(total);
        }
        saveTransaction('QRIS', total, paid, 0);
        showToast(`✅ Checkout berhasil! Metode: QRIS. Total: Rp ${formatRupiah(total)}`);
    }

    clearCart();
    checkoutModal.hide();
    mobileCartSidebar.classList.remove('open');
});

// ===== SAVE TRANSACTION =====
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
    if (confirm(`Yakin ingin menghapus transaksi #${id}?`)) {
        transactionHistory = transactionHistory.filter(trx => trx.id !== id);
        transactionHistory.forEach((trx, index) => {
            trx.id = index + 1;
        });
        localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
        renderHistory();
        showToast(`🗑️ Transaksi #${id} telah dihapus`);
    }
}

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
                <p>Belum ada transaksi</p>
            </div>
        `;
        return;
    }

    // Hitung Grand Total
    const grandTotal = transactionHistory.reduce((sum, trx) => sum + trx.total, 0);

    let html = '';

    // ===== GRAND TOTAL DI ATAS (sebelum daftar transaksi) =====
    html += `
        <div class="history-grand-total">
            <div class="d-flex justify-content-between align-items-center">
                <span class="label"><i class="bi bi-cash-stack me-2"></i>Grand Total</span>
                <span class="total">Rp ${formatRupiah(grandTotal)}</span>
            </div>
        </div>
        <hr />
    `;

    // Tampilkan transaksi dari yang terbaru (reverse)
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
                        <button class="delete-history-btn" data-id="${trx.id}" title="Hapus transaksi">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="detail">
                    <span><i class="bi bi-tag"></i> ${trx.method}</span>
                    <span><i class="bi bi-cash-stack"></i> Bayar: Rp ${formatRupiah(trx.paid)}</span>
                    ${trx.method === 'Cash' ? `<span><i class="bi bi-arrow-return-left"></i> Kembali: Rp ${formatRupiah(trx.change)}</span>` : ''}
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
    if (confirm('Yakin ingin menghapus semua history transaksi?')) {
        transactionHistory = [];
        localStorage.removeItem('transactionHistory');
        renderHistory();
        showToast('🗑️ Semua history telah dihapus');
    }
});

// ===== MANUAL ADD ITEM =====
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

document.getElementById('manualPrice').addEventListener('input', function (e) {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const length = this.value.length;

    formatRupiahInput(this);

    const newLength = this.value.length;
    this.setSelectionRange(newLength, newLength);
});

// Preview gambar edit
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

// Format harga edit
document.getElementById('editPrice').addEventListener('input', function (e) {
    formatRupiahInput(this);
});

document.getElementById('saveManualItem').addEventListener('click', function () {
    const name = document.getElementById('manualName').value.trim();
    const rawPrice = document.getElementById('manualPrice').value.replace(/\D/g, '');
    const price = parseInt(rawPrice) || 0;
    const category = document.getElementById('manualCategory').value;
    const status = document.getElementById('manualStatus').value;
    const icon = document.getElementById('manualIcon').value.trim() || '🍽️';
    const imageFile = document.getElementById('manualImage').files[0];

    if (!name) {
        showToast('❌ Nama menu wajib diisi!');
        return;
    }
    if (price <= 0) {
        showToast('❌ Harga harus diisi dengan angka positif!');
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
    showToast(`✅ Menu "${name}" berhasil ditambahkan!`);
    document.getElementById('addItemForm').reset();
    document.getElementById('manualIcon').value = '🍽️';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreview').src = '#';
}

function openEditMenu(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) {
        showToast('❌ Menu tidak ditemukan!');
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

    setTimeout(() => {
        $('#editCategory, #editStatus').select2('destroy');
        $('#editCategory, #editStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownParent: $('#editItemModal'),
            dropdownAutoWidth: true,
            placeholder: 'Pilih...',
            allowClear: false
        });
    }, 100);
}

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
        showToast('❌ Nama menu wajib diisi!');
        return;
    }
    if (price <= 0) {
        showToast('❌ Harga harus diisi dengan angka positif!');
        return;
    }

    const index = menuItems.findIndex(i => i.id === id);
    if (index === -1) {
        showToast('❌ Menu tidak ditemukan!');
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

        // Perbarui juga item di keranjang jika ada
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
        showToast(`✅ Menu "${name}" berhasil diperbarui!`);
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

$('#addItemModal').on('shown.bs.modal', function () {
    document.getElementById('manualPrice').value = '';
});

// ===== MOBILE CART TOGGLE =====
function toggleMobileCart() {
    mobileCartSidebar.classList.toggle('open');
}

// Event listener untuk tombol di navbar (ikon keranjang)
toggleCartBtn.addEventListener('click', toggleMobileCart);

// Event listener untuk tombol floating bawah
mobileCartToggle.addEventListener('click', toggleMobileCart);

// Event listener untuk tombol close (×)
closeCartBtn.addEventListener('click', toggleMobileCart);

// Tutup keranjang jika klik di luar area
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
// ===== CALCULATOR dengan format ribuan =====
let calcDisplayModal = document.getElementById('calcDisplayModal');
let calcExpression = '';        // ekspresi sebagai string (tanpa format)
let calcResult = '';            // hasil terakhir (string angka tanpa format)
let calcJustEvaluated = false;

// Fungsi untuk memformat angka dengan pemisah ribuan (contoh: 50000 → 50.000)
function formatThousand(numStr) {
    let parts = numStr.split('.');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    let formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formatted + decimalPart;
}

// Fungsi untuk memperbarui tampilan dengan format ribuan
function updateCalcDisplayModal() {
    if (!calcExpression) {
        calcDisplayModal.textContent = '0';
        return;
    }
    let displayText = calcExpression;
    // Jika ekspresi berakhir dengan operator, tampilkan apa adanya
    if (['+', '−', '×', '÷'].includes(displayText.slice(-1))) {
        calcDisplayModal.textContent = displayText;
        return;
    }
    // Pecah berdasarkan operator, format angka, lalu gabung kembali
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

// Fungsi untuk menambahkan nilai ke ekspresi
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
        // Cegah multiple titik atau operator berurutan
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

// Event listener untuk tombol angka dan titik
document.querySelectorAll('#calcModal .calc-btn[data-val]').forEach(btn => {
    btn.addEventListener('click', function () {
        const val = this.dataset.val;
        appendToExpression(val);
    });
});

// Event listener untuk tombol operator (karena tombol operator juga punya data-val, sudah tertangani di atas)
// Tapi kita tetap pertahankan yang lama untuk kompatibilitas, tapi kita bisa biarkan saja karena sudah ditangani

// Tombol C (Clear)
document.getElementById('calcClearModal').addEventListener('click', function () {
    calcExpression = '';
    calcResult = '';
    calcJustEvaluated = false;
    updateCalcDisplayModal();
});

// Tombol ⌫ (Backspace)
document.getElementById('calcBackspaceModal').addEventListener('click', function () {
    if (calcJustEvaluated) {
        calcExpression = '';
        calcJustEvaluated = false;
    } else {
        calcExpression = calcExpression.slice(0, -1);
    }
    updateCalcDisplayModal();
});

// Tombol = 
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

// Inisialisasi display
updateCalcDisplayModal();

// Keyboard support (tetap seperti sebelumnya)
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
function showToast(msg) {
    toastMsg.textContent = msg;
    toast.show();
}

// ===== UPDATE FOOTER YEAR =====
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
// ===== INISIALISASI SELECT2 =====
// ================================================================
$(document).ready(function () {
    function initSelect2() {
        $('.select2-custom').select2({
            theme: 'default',
            width: '100%',
            dropdownAutoWidth: true,
            placeholder: 'Pilih...',
            allowClear: false
        });
    }

    initSelect2();

    $('#addItemModal').on('shown.bs.modal', function () {
        $('#manualCategory, #manualStatus').select2('destroy');
        $('#manualCategory, #manualStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownParent: $('#addItemModal'),
            dropdownAutoWidth: true,
            placeholder: 'Pilih...',
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
            placeholder: 'Pilih...',
            allowClear: false
        });
    });

    $('#editItemModal').on('hidden.bs.modal', function () {
        $('#editCategory, #editStatus').select2('destroy');
        $('#editCategory, #editStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownAutoWidth: true,
            placeholder: 'Pilih...',
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
            placeholder: 'Pilih...',
            allowClear: false
        });
    });

    $('#addItemModal').on('hidden.bs.modal', function () {
        $('#manualCategory, #manualStatus').select2('destroy');
        $('#manualCategory, #manualStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownAutoWidth: true,
            placeholder: 'Pilih...',
            allowClear: false
        });
    });

    $('#checkoutModal').on('hidden.bs.modal', function () {
        $('#paymentMethod').select2('destroy');
        $('#paymentMethod').select2({
            theme: 'default',
            width: '100%',
            dropdownAutoWidth: true,
            placeholder: 'Pilih...',
            allowClear: false
        });
    });
});

const historyModalEl = document.getElementById('historyModal');
historyModal.addEventListener('show.bs.modal', function () {
    if (window.innerWidth < 992) {
        document.getElementById('mobileCartToggle').style.display = 'none';
    }
});
historyModal.addEventListener('hidden.bs.modal', function () {
    if (window.innerWidth < 992) {
        document.getElementById('mobileCartToggle').style.display = 'flex';
    } else {
        // Pastikan di desktop tombol tetap tersembunyi (default)
        document.getElementById('mobileCartToggle').style.display = 'none';
    }
});

// ===== INIT =====
updateFooterYear();
loadMenuData();

const storedHistory = localStorage.getItem('transactionHistory');
if (storedHistory) {
    transactionHistory = JSON.parse(storedHistory);
}

window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) {
        mobileCartSidebar.classList.remove('open');
    }
});

console.log('✅ KitaPOS siap!');
console.log('📱 Mobile-first responsive.');
console.log('❤️ Tema #ED020E');
console.log('📜 Data menu dari assets/data/data.json');
console.log('🏷️ Footer: Kernel of Inventory Talent and Asset');
console.log('📊 Grand Total di bagian bawah history');