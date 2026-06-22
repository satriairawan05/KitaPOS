// ================================================================
// assets/js/script.js - KitaPOS
// ================================================================

// ===== DATA MENU =====
let menuItems = [
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
let nextId = 10;

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

// ===== FUNGSI FORMAT RUPIAH =====
function formatRupiah(angka) {
    // Ubah angka menjadi string dengan pemisah ribuan
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatRupiahFull(angka) {
    return `Rp ${formatRupiah(angka)}`;
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
document.getElementById('goHomeMobile').addEventListener('click', goHome);
document.getElementById('goHomeFab').addEventListener('click', goHome);

document.getElementById('openCalcDesktop').addEventListener('click', () => calcModal.show());
document.getElementById('openCalcMobile').addEventListener('click', () => calcModal.show());
document.getElementById('openHistoryDesktop').addEventListener('click', () => { renderHistory(); historyModal.show(); });
document.getElementById('openHistoryMobile').addEventListener('click', () => { renderHistory(); historyModal.show(); });

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
                <button class="btn-add" ${disabled} data-id="${item.id}">
                    <i class="bi bi-plus-circle me-1"></i> Tambah
                </button>
            </div>
        `;
    });
    menuGrid.innerHTML = html;

    document.querySelectorAll('.menu-card .btn-add:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function() {
            addToCart(parseInt(this.dataset.id));
        });
    });
}

// ===== CATEGORY FILTER =====
categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        categoryBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.cat;
        renderMenu();
    });
});

// ===== SEARCH =====
searchInput.addEventListener('input', function() {
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
        btn.addEventListener('click', function() {
            removeFromCart(parseInt(this.dataset.id));
        });
    });
    document.querySelectorAll('#mobileCartItems .remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
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
    
    checkoutModal.show();
}

// ===== Payment Method Handler =====
$(document).on('change', '#paymentMethod', function() {
    const method = this.value;
    const total = getCartTotal();
    const paymentInput = document.getElementById('paymentAmount');
    const changeDisplay = document.getElementById('changeDisplay');
    const qrisInfo = document.getElementById('qrisInfo');
    const paymentLabel = document.getElementById('paymentLabel');

    if (method === 'qris') {
        paymentInput.value = total;
        paymentInput.disabled = true;
        paymentLabel.textContent = 'Total Dibayar (QRIS)';
        changeDisplay.style.display = 'none';
        qrisInfo.style.display = 'block';
        document.getElementById('changeAmount').textContent = `Rp ${formatRupiah(0)}`;
    } else {
        paymentInput.value = '';
        paymentInput.disabled = false;
        paymentLabel.textContent = 'Bayar (Rp)';
        changeDisplay.style.display = 'block';
        qrisInfo.style.display = 'none';
        paymentInput.dispatchEvent(new Event('input'));
    }
});

document.getElementById('paymentAmount').addEventListener('input', function() {
    const total = getCartTotal();
    const paid = parseInt(this.value) || 0;
    const change = paid - total;
    const changeEl = document.getElementById('changeAmount');
    if (change >= 0) {
        changeEl.textContent = `Rp ${formatRupiah(change)}`;
        changeEl.style.color = 'var(--pos-accent)';
    } else {
        changeEl.textContent = `Rp ${formatRupiah(Math.abs(change))} (kurang)`;
        changeEl.style.color = '#e74c3c';
    }
});

// ===== CONFIRM CHECKOUT =====
document.getElementById('confirmCheckout').addEventListener('click', function() {
    const total = getCartTotal();
    const method = document.getElementById('paymentMethod').value;
    let paid = parseInt(document.getElementById('paymentAmount').value) || 0;

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
            document.getElementById('paymentAmount').value = total;
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

// ===== RENDER HISTORY =====
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

    let html = '';
    const reversed = [...transactionHistory].reverse();
    reversed.forEach((trx, index) => {
        const itemsList = trx.items.map(item => 
            `${item.name} (${item.qty}×Rp${formatRupiah(item.price)})`
        ).join(', ');
        html += `
            <div class="history-item">
                <div class="header">
                    <span>#${trx.id} - ${trx.timestamp}</span>
                    <span class="text-accent">Rp ${formatRupiah(trx.total)}</span>
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
}

// ===== CLEAR HISTORY =====
document.getElementById('clearHistoryBtn').addEventListener('click', function() {
    if (confirm('Yakin ingin menghapus semua history transaksi?')) {
        transactionHistory = [];
        localStorage.removeItem('transactionHistory');
        renderHistory();
        showToast('🗑️ Semua history telah dihapus');
    }
});

// ===== MANUAL ADD ITEM =====
document.getElementById('manualImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.src = event.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.style.display = 'none';
        preview.src = '#';
    }
});

document.getElementById('saveManualItem').addEventListener('click', function() {
    const name = document.getElementById('manualName').value.trim();
    const price = parseInt(document.getElementById('manualPrice').value);
    const category = document.getElementById('manualCategory').value;
    const status = document.getElementById('manualStatus').value;
    const icon = document.getElementById('manualIcon').value.trim() || '🍽️';
    const imageFile = document.getElementById('manualImage').files[0];
    
    if (!name) {
        showToast('❌ Nama menu wajib diisi!');
        return;
    }
    if (!price || price <= 0) {
        showToast('❌ Harga harus diisi dengan angka positif!');
        return;
    }

    let imageData = null;
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
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

// ===== MOBILE CART TOGGLE =====
function toggleMobileCart(open) {
    if (open) {
        mobileCartSidebar.classList.add('open');
    } else {
        mobileCartSidebar.classList.remove('open');
    }
}

toggleCartBtn.addEventListener('click', () => toggleMobileCart(true));
mobileCartToggle.addEventListener('click', () => toggleMobileCart(true));
closeCartBtn.addEventListener('click', () => toggleMobileCart(false));

document.addEventListener('click', function(e) {
    if (window.innerWidth < 992) {
        const sidebar = mobileCartSidebar;
        const toggle = mobileCartToggle;
        const toggleBtn = toggleCartBtn;
        if (sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target) && !toggleBtn.contains(e.target)) {
                toggleMobileCart(false);
            }
        }
    }
});

// ===== CALCULATOR =====
let calcDisplayModal = document.getElementById('calcDisplayModal');
let calcExpression = '0';
let calcJustEvaluated = false;

function updateCalcDisplayModal() {
    calcDisplayModal.textContent = calcExpression || '0';
}

document.querySelectorAll('#calcModal .calc-btn[data-val]').forEach(btn => {
    btn.addEventListener('click', function() {
        const val = this.dataset.val;
        if (calcJustEvaluated) {
            if (['+', '−', '×', '÷'].includes(val)) {
                calcJustEvaluated = false;
            } else {
                calcExpression = '0';
                calcJustEvaluated = false;
            }
        }
        if (val === '.' && calcExpression.includes('.')) return;
        if (calcExpression === '0' && val !== '.') {
            calcExpression = val;
        } else {
            calcExpression += val;
        }
        updateCalcDisplayModal();
    });
});

document.querySelectorAll('#calcModal .calc-btn.op').forEach(btn => {
    btn.addEventListener('click', function() {
        const op = this.dataset.val;
        const lastChar = calcExpression.slice(-1);
        if (['+', '−', '×', '÷'].includes(lastChar)) {
            calcExpression = calcExpression.slice(0, -1) + op;
        } else {
            calcExpression += op;
        }
        calcJustEvaluated = false;
        updateCalcDisplayModal();
    });
});

document.getElementById('calcEqualsModal').addEventListener('click', function() {
    try {
        let expr = calcExpression;
        expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        const result = Function('"use strict"; return (' + expr + ')')();
        if (typeof result === 'number' && !isNaN(result)) {
            calcExpression = String(Math.round(result * 100) / 100);
            calcJustEvaluated = true;
            updateCalcDisplayModal();
        } else {
            calcExpression = 'Error';
            updateCalcDisplayModal();
            setTimeout(() => { calcExpression = '0'; updateCalcDisplayModal(); }, 800);
        }
    } catch (e) {
        calcExpression = 'Error';
        updateCalcDisplayModal();
        setTimeout(() => { calcExpression = '0'; updateCalcDisplayModal(); }, 800);
    }
});

document.getElementById('calcClearModal').addEventListener('click', function() {
    calcExpression = '0';
    calcJustEvaluated = false;
    updateCalcDisplayModal();
});

document.getElementById('calcBackspaceModal').addEventListener('click', function() {
    if (calcJustEvaluated) {
        calcExpression = '0';
        calcJustEvaluated = false;
    } else if (calcExpression.length > 1) {
        calcExpression = calcExpression.slice(0, -1);
    } else {
        calcExpression = '0';
    }
    updateCalcDisplayModal();
});

document.addEventListener('keydown', function(e) {
    const modalOpen = document.getElementById('calcModal').classList.contains('show');
    if (!modalOpen) return;
    const key = e.key;
    if (key >= '0' && key <= '9') {
        document.querySelector(`#calcModal .calc-btn[data-val="${key}"]`)?.click();
    } else if (key === '.') {
        document.querySelector(`#calcModal .calc-btn[data-val="."]`)?.click();
    } else if (key === '+') {
        document.querySelector(`#calcModal .calc-btn[data-val="+"]`)?.click();
    } else if (key === '-') {
        document.querySelector(`#calcModal .calc-btn[data-val="−"]`)?.click();
    } else if (key === '*') {
        document.querySelector(`#calcModal .calc-btn[data-val="×"]`)?.click();
    } else if (key === '/') {
        document.querySelector(`#calcModal .calc-btn[data-val="÷"]`)?.click();
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

// ================================================================
// ===== INISIALISASI SELECT2 =====
// ================================================================
$(document).ready(function() {
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

    $('#addItemModal').on('shown.bs.modal', function() {
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

    $('#checkoutModal').on('shown.bs.modal', function() {
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

    $('#addItemModal').on('hidden.bs.modal', function() {
        $('#manualCategory, #manualStatus').select2('destroy');
        $('#manualCategory, #manualStatus').select2({
            theme: 'default',
            width: '100%',
            dropdownAutoWidth: true,
            placeholder: 'Pilih...',
            allowClear: false
        });
    });

    $('#checkoutModal').on('hidden.bs.modal', function() {
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

// ===== INIT =====
renderMenu();
updateCartUI();

const storedHistory = localStorage.getItem('transactionHistory');
if (storedHistory) {
    transactionHistory = JSON.parse(storedHistory);
}

window.addEventListener('resize', function() {
    if (window.innerWidth >= 992) {
        mobileCartSidebar.classList.remove('open');
    }
});

console.log('✅ KitaPOS siap!');
console.log('📦 Menu items:', menuItems.length);
console.log('🧮 Kalkulator tampilan rapi & menarik.');
console.log('📱 Mobile-first responsive.');
console.log('❤️ Tema #ED020E');
console.log('💳 Metode pembayaran: Cash & QRIS dengan Select2.');
console.log('📜 History transaksi tersedia.');
console.log('🏠 Tombol Home untuk kembali ke menu utama.');