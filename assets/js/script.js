// ================================================================
// assets/js/script.js - KitaPOS
// Main application logic for Point of Sales system
// ================================================================

// ===== CURRENCY FORMATTER =====
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

// ===== FORMAT TANGGAL INDONESIA =====
function formatTanggalIndonesia(date) {
    const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const hari = date.getDate();
    const bulanIndex = date.getMonth();
    const tahun = date.getFullYear();
    const jam = String(date.getHours()).padStart(2, '0');
    const menit = String(date.getMinutes()).padStart(2, '0');
    const detik = String(date.getSeconds()).padStart(2, '0');
    return hari + ' ' + bulan[bulanIndex] + ' ' + tahun + ', ' + jam + '.' + menit + '.' + detik;
}

// ===== MENU DATA =====
let menuItems = [];
let nextId = 1;

// ===== OPENING BALANCE =====
let openingBalance = 0;

function loadOpeningBalance() {
    const stored = localStorage.getItem('openingBalance');
    if (stored !== null) {
        openingBalance = parseInt(stored, 10) || 0;
    } else {
        openingBalance = 150000;
        localStorage.setItem('openingBalance', openingBalance.toString());
    }
    updateOpeningBalanceUI();
}

function saveOpeningBalance(value) {
    openingBalance = value;
    localStorage.setItem('openingBalance', value.toString());
    updateOpeningBalanceUI();
    showToast('✅ Opening balance updated: Rp ' + formatRupiah(value));
}

function updateOpeningBalanceUI() {
    const displayEl = document.getElementById('openingBalanceDisplay');
    const mobileDisplayEl = document.getElementById('mobileOpeningBalanceDisplay');
    const formatted = 'Rp ' + formatRupiah(openingBalance);
    if (displayEl) displayEl.textContent = formatted;
    if (mobileDisplayEl) mobileDisplayEl.textContent = formatted;
}

// ===== LOAD MENU DATA =====
function loadMenuData() {
    if (typeof defaultMenuData !== 'undefined' && defaultMenuData.length > 0) {
        menuItems = defaultMenuData;
        const maxId = Math.max(...menuItems.map(item => item.id));
        nextId = maxId + 1;
        renderMenu();
        updateCartUI();
        console.log('✅ Menu data loaded from data.js:', menuItems.length, 'items');
    } else {
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
let cart = [];

// ===== TRANSACTION HISTORY =====
let transactionHistory = [];

// ===== DOM REFERENCES =====
const menuGrid = document.getElementById('menuGrid');
const menuEmpty = document.getElementById('menuEmpty');
const searchInputDesktop = document.getElementById('searchMenuDesktop');
const searchInputMobile = document.getElementById('searchMenuMobile');
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

// ===== QUICK PAY BUTTONS =====
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
        recommendations = [50000, 75000, 100000];
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
    html += '<button class="quick-pay-btn btn-exact" data-value="' + exact + '">Exact</button>';
    recommendations.forEach(function (val) {
        html += '<button class="quick-pay-btn" data-value="' + val + '">Rp ' + formatRupiah(val) + '</button>';
    });
    html += '</div>';

    container.innerHTML = html;

    container.querySelectorAll('.quick-pay-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var value = parseInt(this.dataset.value);
            var paymentInput = document.getElementById('paymentAmount');
            paymentInput.value = formatRupiah(value);
            paymentInput.dispatchEvent(new Event('input'));

            container.querySelectorAll('.quick-pay-btn').forEach(function (b) { b.classList.remove('active-btn'); });
            this.classList.add('active-btn');
        });
    });
}

// ===== GO HOME =====
function goHome() {
    categoryBtns.forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.btn-cat[data-cat="all"]').classList.add('active');
    currentCategory = 'all';
    if (searchInputDesktop) searchInputDesktop.value = '';
    if (searchInputMobile) searchInputMobile.value = '';
    searchQuery = '';
    renderMenu();
    document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('🏠 Returned to main menu');
}

// ===== EVENT LISTENERS =====
document.getElementById('goHomeDesktop').addEventListener('click', goHome);
document.getElementById('goHomeFab').addEventListener('click', goHome);
document.getElementById('openCalcDesktop').addEventListener('click', function () { calcModal.show(); });
document.getElementById('openCalcMobile').addEventListener('click', function () { calcModal.show(); });
document.getElementById('openHistoryDesktop').addEventListener('click', function () {
    renderHistory();
    historyModal.show();
});
document.getElementById('openHistoryMobile').addEventListener('click', function () {
    renderHistory();
    historyModal.show();
});

// ===== EDIT OPENING BALANCE =====
document.getElementById('editOpeningBalanceDesktop').addEventListener('click', function () {
    openEditOpeningBalanceModal();
});
document.getElementById('editOpeningBalanceMobile').addEventListener('click', function () {
    openEditOpeningBalanceModal();
});

function openEditOpeningBalanceModal() {
    var input = document.getElementById('editOpeningBalanceInput');
    input.value = formatRupiah(openingBalance);
    var modal = new bootstrap.Modal(document.getElementById('editOpeningBalanceModal'));
    modal.show();
    input.addEventListener('input', function () {
        formatRupiahInput(this);
    });
}

document.getElementById('saveOpeningBalance').addEventListener('click', function () {
    var input = document.getElementById('editOpeningBalanceInput');
    var raw = input.value.replace(/\D/g, '');
    var value = parseInt(raw, 10) || 0;
    if (value < 0) {
        showToast('❌ Opening balance cannot be negative!');
        return;
    }
    saveOpeningBalance(value);
    bootstrap.Modal.getInstance(document.getElementById('editOpeningBalanceModal')).hide();
});

// Toast setup
var toastEl = document.getElementById('liveToast');
var toast = new bootstrap.Toast(toastEl, { delay: 2500 });
var toastMsg = document.getElementById('toastMessage');

// ===== RENDER MENU =====
var currentCategory = 'all';
var searchQuery = '';

function renderMenu() {
    var filtered = menuItems;
    if (currentCategory !== 'all') {
        filtered = filtered.filter(function (item) { return item.category === currentCategory; });
    }
    if (searchQuery.trim()) {
        var q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(function (item) { return item.name.toLowerCase().includes(q); });
    }

    if (filtered.length === 0) {
        menuGrid.innerHTML = '';
        menuEmpty.style.display = 'flex';
        menuEmpty.classList.remove('d-none');
        return;
    }
    menuEmpty.style.display = 'none';
    menuEmpty.classList.add('d-none');

    var html = '';
    filtered.forEach(function (item) {
        var statusMap = {
            available: { label: '✅ Available', cls: 'available' },
            low: { label: '⚠️ Low Stock', cls: 'low' },
            out: { label: '❌ Out of Stock', cls: 'out' }
        };
        var st = statusMap[item.status] || statusMap.out;
        var disabled = item.status === 'out' ? 'disabled' : '';

        var imageHtml = item.image ?
            '<img src="' + item.image + '" alt="' + item.name + '" width="100%" height="100%" loading="lazy" />' :
            '<span class="no-image">' + (item.icon || '🍽️') + '</span>';

        html += `
            <div class="menu-card" data-id="${item.id}">
                <div class="menu-img">${imageHtml}</div>
                <div class="menu-name" title="${item.name}">${item.name}</div>
                <div class="menu-price">Rp ${formatRupiah(item.price)}</div>
                <span class="menu-status ${st.cls}">${st.label}</span>
                <div class="menu-actions">
                    <button class="btn-action btn-add-action" ${disabled} data-id="${item.id}" title="Add to cart">
                        <i class="bi bi-plus"></i>
                    </button>
                    <button class="btn-action btn-edit-action" data-id="${item.id}" title="Edit menu">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            </div>
        `;
    });
    menuGrid.innerHTML = html;

    document.querySelectorAll('.menu-card .btn-add-action:not([disabled])').forEach(function (btn) {
        btn.addEventListener('click', function () {
            addToCart(parseInt(this.dataset.id));
        });
    });

    document.querySelectorAll('.menu-card .btn-edit-action').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = parseInt(this.dataset.id);
            openEditMenu(id);
        });
    });
}

// ===== CATEGORY FILTER =====
categoryBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
        categoryBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentCategory = this.dataset.cat;
        renderMenu();
    });
});

// ===== SEARCH =====
function handleSearchInput() {
    searchQuery = this.value;
    renderMenu();
}
if (searchInputDesktop) {
    searchInputDesktop.addEventListener('input', handleSearchInput);
}
if (searchInputMobile) {
    searchInputMobile.addEventListener('input', handleSearchInput);
}

// ===== CART FUNCTIONS =====
function addToCart(id) {
    var item = menuItems.find(function (i) { return i.id === id; });
    if (!item || item.status === 'out') {
        showToast('Menu not available!');
        return;
    }
    var existing = cart.find(function (c) { return c.id === id; });
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    showToast('✅ ' + item.name + ' added to cart');
}

function removeFromCart(id) {
    var idx = cart.findIndex(function (c) { return c.id === id; });
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
    return cart.reduce(function (sum, item) { return sum + (item.price * item.qty); }, 0);
}

function getCartCount() {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
}

function updateCartUI() {
    requestAnimationFrame(function () {
        var total = getCartTotal();
        var count = getCartCount();
        var totalStr = 'Rp ' + formatRupiah(total);

        cartItemsEl.innerHTML = cart.length === 0 ?
            '<div class="cart-empty"><i class="bi bi-basket"></i>No items yet</div>' :
            cart.map(function (item) {
                return `
                    <div class="cart-item">
                        <span>${item.icon || '🍽️'} ${item.name} <span class="qty">×${item.qty}</span></span>
                        <span>
                            Rp ${formatRupiah(item.price * item.qty)}
                            <button class="remove-btn" data-id="${item.id}"><i class="bi bi-dash-circle"></i></button>
                        </span>
                    </div>
                `;
            }).join('');

        cartTotalEl.textContent = totalStr;
        cartCountEl.textContent = count;
        desktopCartCount.textContent = count;
        checkoutBtn.disabled = count === 0;

        mobileCartItems.innerHTML = cart.length === 0 ?
            '<div class="cart-empty"><i class="bi bi-basket"></i>No items yet</div>' :
            cart.map(function (item) {
                return `
                    <div class="cart-item">
                        <span>${item.icon || '🍽️'} ${item.name} <span class="qty">×${item.qty}</span></span>
                        <span>
                            Rp ${formatRupiah(item.price * item.qty)}
                            <button class="remove-btn" data-id="${item.id}"><i class="bi bi-dash-circle"></i></button>
                        </span>
                    </div>
                `;
            }).join('');

        mobileCartTotal.textContent = totalStr;
        mobileCartCount.textContent = count;
        mobileCartBadge.textContent = count;
        mobileCartBadge2.textContent = count;
        mobileCartCountTop.textContent = count;
        document.getElementById('mobileCheckoutBtn').disabled = count === 0;

        document.querySelectorAll('.cart-item .remove-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                removeFromCart(parseInt(this.dataset.id));
            });
        });
        document.querySelectorAll('#mobileCartItems .remove-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                removeFromCart(parseInt(this.dataset.id));
            });
        });
    });
}

// ===== CHECKOUT =====
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
document.getElementById('mobileCheckoutBtn').addEventListener('click', openCheckout);

function openCheckout() {
    if (cart.length === 0) return;
    var total = getCartTotal();
    var summaryEl = document.getElementById('checkoutSummary');
    var html = `
        <p class="fw-600 mb-2">Ordered items:</p>
        ${cart.map(function (item) {
        return `
                <div class="item-row">
                    <span>${item.icon || '🍽️'} ${item.name} × ${item.qty}</span>
                    <span>Rp ${formatRupiah(item.price * item.qty)}</span>
                </div>
            `;
    }).join('')}
        <div class="total-row">
            <span>Total</span>
            <span>Rp ${formatRupiah(total)}</span>
        </div>
    `;
    summaryEl.innerHTML = html;
    document.getElementById('checkoutGrandTotal').textContent = 'Rp ' + formatRupiah(total);

    var $paymentMethod = $('#paymentMethod');
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

// ===== PAYMENT METHOD =====
$(document).on('change', '#paymentMethod', function () {
    var method = this.value;
    var total = getCartTotal();
    var paymentInput = document.getElementById('paymentAmount');
    var changeDisplay = document.getElementById('changeDisplay');
    var qrisInfo = document.getElementById('qrisInfo');
    var paymentLabel = document.getElementById('paymentLabel');

    if (method === 'qris') {
        paymentInput.value = formatRupiah(total);
        paymentInput.disabled = true;
        paymentLabel.textContent = 'Total Paid (QRIS)';
        changeDisplay.style.display = 'none';
        qrisInfo.style.display = 'block';
        document.getElementById('changeAmount').textContent = 'Rp ' + formatRupiah(0);
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

// ===== PAYMENT INPUT FORMAT =====
document.getElementById('paymentAmount').addEventListener('input', function (e) {
    var start = this.selectionStart;
    var end = this.selectionEnd;
    var length = this.value.length;

    formatRupiahInput(this);

    var newLength = this.value.length;
    this.setSelectionRange(newLength, newLength);

    var rawValue = this.value.replace(/\D/g, '');
    var paid = parseInt(rawValue) || 0;
    var total = getCartTotal();
    var change = paid - total;
    var changeEl = document.getElementById('changeAmount');
    if (change >= 0) {
        changeEl.textContent = 'Rp ' + formatRupiah(change);
        changeEl.style.color = 'var(--pos-accent)';
    } else {
        changeEl.textContent = 'Rp ' + formatRupiah(Math.abs(change)) + ' (insufficient)';
        changeEl.style.color = '#e74c3c';
    }

    var quickButtons = document.querySelectorAll('.quick-pay-btn');
    quickButtons.forEach(function (btn) {
        btn.classList.remove('active-btn');
        if (parseInt(btn.dataset.value) === paid) {
            btn.classList.add('active-btn');
        }
    });
});

// ===== CONFIRM CHECKOUT =====
document.getElementById('confirmCheckout').addEventListener('click', function() {
    var total = getCartTotal();
    var method = document.getElementById('paymentMethod').value;
    var rawValue = document.getElementById('paymentAmount').value.replace(/\D/g, '');
    var paid = parseInt(rawValue) || 0;

    if (method === 'cash') {
        if (paid < total) {
            showToast('❌ Payment insufficient!');
            return;
        }
        var change = paid - total;
        var transaction = saveTransaction('Cash', total, paid, change);
        showToast('✅ Checkout successful! Method: Cash. Change: Rp ' + formatRupiah(change));
        printStruk(transaction);
    } else {
        if (paid !== total) {
            paid = total;
            document.getElementById('paymentAmount').value = formatRupiah(total);
        }
        var transaction = saveTransaction('QRIS', total, paid, 0);
        showToast('✅ Checkout successful! Method: QRIS. Total: Rp ' + formatRupiah(total));
        printStruk(transaction);
    }

    clearCart();
    checkoutModal.hide();
    mobileCartSidebar.classList.remove('open');
});

// ===== SAVE TRANSACTION =====
function saveTransaction(method, total, paid, change) {
    var now = new Date();
    var timestamp = formatTanggalIndonesia(now);
    var transaction = {
        id: transactionHistory.length + 1,
        timestamp: timestamp,
        items: cart.map(function(item) {
            return {
                name: item.name,
                qty: item.qty,
                price: item.price,
                subtotal: item.price * item.qty
            };
        }),
        total: total,
        method: method,
        paid: paid,
        change: change
    };
    transactionHistory.push(transaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    return transaction;
}

// ===== PRINT RECEIPT =====
function printStruk(transaction) {
    if (!transaction || !transaction.items || transaction.items.length === 0) {
        showToast('❌ No transaction data to print!');
        return;
    }

    var container = document.getElementById('strukContainer');
    if (!container) {
        showToast('❌ Print container not found!');
        return;
    }

    // Fill receipt data
    document.getElementById('strukKasir').textContent = 'Admin';
    document.getElementById('strukWaktu').textContent = transaction.timestamp;
    document.getElementById('strukId').textContent = '#' + transaction.id;
    document.getElementById('strukMethod').textContent = transaction.method === 'Cash' ? 'Tunai' : 'QRIS';

    var totalQty = transaction.items.reduce(function(sum, item) {
        return sum + item.qty;
    }, 0);

    var tbody = document.getElementById('strukItemList');
    tbody.innerHTML = '';
    transaction.items.forEach(function(item) {
        var tr = document.createElement('tr');
        var pricePerItem = formatRupiah(item.price);
        var subtotal = formatRupiah(item.subtotal);
        tr.innerHTML = '<td style="text-align:left;">' + item.name + '</td>' +
                       '<td style="text-align:center;">' + pricePerItem + ' x ' + item.qty + '</td>' +
                       '<td style="text-align:right;">' + subtotal + '</td>';
        tbody.appendChild(tr);
    });

    document.getElementById('strukSubtotal').textContent = 'Rp' + formatRupiah(transaction.total);
    document.getElementById('strukTotalQty').textContent = totalQty;
    document.getElementById('strukTotal').textContent = 'Rp' + formatRupiah(transaction.total);
    document.getElementById('strukBayar').textContent = 'Rp' + formatRupiah(transaction.paid);
    document.getElementById('strukKembali').textContent = 'Rp' + formatRupiah(transaction.change);

    var strukContent = container.querySelector('.struk-content');
    if (strukContent) {
        strukContent.classList.remove('paper-58mm', 'paper-80mm');
        var size = localStorage.getItem('defaultPrinterSize') || '58mm';
        strukContent.classList.add('paper-' + size);
    }

    container.style.display = 'block';

    setTimeout(function() {
        window.print();
    }, 300);

    window.onafterprint = function() {
        container.style.display = 'none';
        window.onafterprint = null;
    };
}

// ===== DELETE SINGLE TRANSACTION =====
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete transaction #' + id + '?')) {
        transactionHistory = transactionHistory.filter(function (trx) { return trx.id !== id; });
        transactionHistory.forEach(function (trx, index) {
            trx.id = index + 1;
        });
        localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
        renderHistory();
        showToast('🗑️ Transaction #' + id + ' has been deleted');
    }
}

// ===== CLEAR ALL TRANSACTIONS =====
function clearAllTransactions() {
    if (confirm('⚠️ Are you sure you want to delete ALL transactions? This cannot be undone!')) {
        transactionHistory = [];
        localStorage.removeItem('transactionHistory');
        renderHistory();
        showToast('🗑️ All transactions have been cleared');
    }
}

// ===== RENDER HISTORY =====
function renderHistory() {
    var container = document.getElementById('historyContent');
    var stored = localStorage.getItem('transactionHistory');
    if (stored) {
        transactionHistory = JSON.parse(stored);
    }

    var totalTransactions = transactionHistory.reduce(function (sum, trx) { return sum + trx.total; }, 0);
    var grandTotal = openingBalance + totalTransactions;

    var html = '';

    html += `
        <div class="history-opening-balance">
            <div class="d-flex justify-content-between align-items-center">
                <span class="label"><i class="bi bi-wallet2 me-2"></i>Opening Balance</span>
                <span class="total">Rp ${formatRupiah(openingBalance)}</span>
            </div>
        </div>
    `;

    html += `
        <div class="history-total-transactions">
            <div class="d-flex justify-content-between align-items-center">
                <span class="label"><i class="bi bi-receipt me-2"></i>Total Transactions</span>
                <span class="total">Rp ${formatRupiah(totalTransactions)}</span>
            </div>
        </div>
    `;

    html += `
        <div class="history-grand-total">
            <div class="d-flex justify-content-between align-items-center">
                <span class="label"><i class="bi bi-cash-stack me-2"></i>Grand Total</span>
                <span class="total">Rp ${formatRupiah(grandTotal)}</span>
            </div>
        </div>
        <hr />
    `;

    if (transactionHistory.length === 0) {
        html += `
            <div class="history-empty">
                <i class="bi bi-inbox"></i>
                <p>No transactions yet</p>
            </div>
        `;
        container.innerHTML = html;
        return;
    }

    var reversed = [...transactionHistory].reverse();
    reversed.forEach(function (trx) {
        var itemsList = trx.items.map(function (item) {
            return item.name + ' (' + item.qty + '×Rp' + formatRupiah(item.price) + ')';
        }).join(', ');
        html += `
            <div class="history-item" data-id="${trx.id}">
                <div class="header">
                    <span>#${trx.id} - ${trx.timestamp}</span>
                    <div class="history-actions">
                        <span class="text-accent">Rp ${formatRupiah(trx.total)}</span>
                        <button class="print-history-btn" data-transaction='${JSON.stringify(trx).replace(/'/g, "&#39;")}' title="Print receipt">
                            <i class="bi bi-printer"></i>
                        </button>
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

    container.querySelectorAll('.print-history-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var transactionData = this.dataset.transaction;
            if (transactionData) {
                try {
                    var transaction = JSON.parse(transactionData);
                    printStruk(transaction);
                } catch (e) {
                    showToast('❌ Error printing receipt');
                    console.error('Print error:', e);
                }
            }
        });
    });

    container.querySelectorAll('.delete-history-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = parseInt(this.dataset.id);
            deleteTransaction(id);
        });
    });
}

// ===== EVENT LISTENER UNTUK TOMBOL CANCEL & CLEAR ALL =====
document.getElementById('cancelHistoryBtn').addEventListener('click', function() {
    historyModal.hide();
});

document.getElementById('clearAllHistoryBtn').addEventListener('click', function() {
    clearAllTransactions();
});

// ===== MANUAL ADD ITEM =====
document.getElementById('manualImage').addEventListener('change', function (e) {
    var file = e.target.files[0];
    var previewContainer = document.getElementById('imagePreviewContainer');
    var preview = document.getElementById('imagePreview');

    if (file) {
        var reader = new FileReader();
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
    formatRupiahInput(this);
});

document.getElementById('editImage').addEventListener('change', function (e) {
    var file = e.target.files[0];
    var preview = document.getElementById('editImagePreview');
    if (file) {
        var reader = new FileReader();
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

document.getElementById('editPrice').addEventListener('input', function (e) {
    formatRupiahInput(this);
});

document.getElementById('saveManualItem').addEventListener('click', function () {
    var name = document.getElementById('manualName').value.trim();
    var rawPrice = document.getElementById('manualPrice').value.replace(/\D/g, '');
    var price = parseInt(rawPrice) || 0;
    var category = document.getElementById('manualCategory').value;
    var status = document.getElementById('manualStatus').value;
    var icon = document.getElementById('manualIcon').value.trim() || '🍽️';
    var imageFile = document.getElementById('manualImage').files[0];

    if (!name) {
        showToast('❌ Menu name is required!');
        return;
    }
    if (price <= 0) {
        showToast('❌ Price must be a positive number!');
        return;
    }

    var imageData = null;
    if (imageFile) {
        var reader = new FileReader();
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
    var newItem = {
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
    showToast('✅ Menu "' + name + '" has been added successfully!');
    document.getElementById('addItemForm').reset();
    document.getElementById('manualIcon').value = '🍽️';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreview').src = '#';
}

// ===== EDIT MENU =====
function openEditMenu(id) {
    var item = menuItems.find(function (i) { return i.id === id; });
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

    var preview = document.getElementById('editImagePreview');
    if (item.image) {
        preview.src = item.image;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
        preview.src = '#';
    }
    document.getElementById('editImage').value = '';

    var editModal = new bootstrap.Modal(document.getElementById('editItemModal'));
    editModal.show();

    setTimeout(function () {
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

document.getElementById('saveEditItem').addEventListener('click', function () {
    var id = parseInt(document.getElementById('editItemId').value);
    var name = document.getElementById('editName').value.trim();
    var rawPrice = document.getElementById('editPrice').value.replace(/\D/g, '');
    var price = parseInt(rawPrice) || 0;
    var category = document.getElementById('editCategory').value;
    var status = document.getElementById('editStatus').value;
    var icon = document.getElementById('editIcon').value.trim() || '🍽️';
    var imageFile = document.getElementById('editImage').files[0];

    if (!name) {
        showToast('❌ Menu name is required!');
        return;
    }
    if (price <= 0) {
        showToast('❌ Price must be a positive number!');
        return;
    }

    var index = menuItems.findIndex(function (i) { return i.id === id; });
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

        cart.forEach(function (cartItem) {
            if (cartItem.id === id) {
                cartItem.name = name;
                cartItem.price = price;
                cartItem.icon = icon;
            }
        });

        renderMenu();
        updateCartUI();
        bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
        showToast('✅ Menu "' + name + '" has been updated successfully!');
    }

    if (imageFile) {
        var reader = new FileReader();
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
    if (mobileCartSidebar.classList.contains('open')) {
        mobileCartToggle.style.display = 'none';
    } else {
        mobileCartToggle.style.display = 'flex';
    }
}

toggleCartBtn.addEventListener('click', toggleMobileCart);
mobileCartToggle.addEventListener('click', toggleMobileCart);
closeCartBtn.addEventListener('click', function() {
    mobileCartSidebar.classList.remove('open');
    mobileCartToggle.style.display = 'flex';
});

document.addEventListener('click', function (e) {
    if (window.innerWidth < 992) {
        var sidebar = mobileCartSidebar;
        var toggle = mobileCartToggle;
        var toggleBtn = toggleCartBtn;
        if (sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
                mobileCartToggle.style.display = 'flex';
            }
        }
    }
});

window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) {
        mobileCartSidebar.classList.remove('open');
        mobileCartToggle.style.display = 'none';
    } else {
        if (!mobileCartSidebar.classList.contains('open')) {
            mobileCartToggle.style.display = 'flex';
        } else {
            mobileCartToggle.style.display = 'none';
        }
    }
});

// ===== CALCULATOR =====
var calcDisplayModal = document.getElementById('calcDisplayModal');
var calcExpression = '';
var calcResult = '';
var calcJustEvaluated = false;

function formatThousand(numStr) {
    var parts = numStr.split('.');
    var integerPart = parts[0];
    var decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    var formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formatted + decimalPart;
}

function updateCalcDisplayModal() {
    if (!calcExpression) {
        calcDisplayModal.textContent = '0';
        return;
    }
    var displayText = calcExpression;
    if (['+', '−', '×', '÷'].includes(displayText.slice(-1))) {
        calcDisplayModal.textContent = displayText;
        return;
    }
    var tokens = displayText.split(/([+\−×÷])/);
    var formattedTokens = tokens.map(function (token) {
        if (['+', '−', '×', '÷'].includes(token)) return token;
        var num = parseFloat(token);
        if (!isNaN(num) && token !== '') {
            return formatThousand(token);
        }
        return token;
    });
    calcDisplayModal.textContent = formattedTokens.join('');
}

function appendToExpression(value) {
    if (calcJustEvaluated) {
        if (['+', '−', '×', '÷'].includes(value)) {
            calcExpression = calcResult + value;
        } else {
            calcExpression = value;
        }
        calcJustEvaluated = false;
    } else {
        var lastChar = calcExpression.slice(-1);
        if (value === '.') {
            var lastNum = calcExpression.split(/[+\−×÷]/).pop();
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

document.querySelectorAll('#calcModal .calc-btn[data-val]').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var val = this.dataset.val;
        appendToExpression(val);
    });
});

document.getElementById('calcClearModal').addEventListener('click', function () {
    calcExpression = '';
    calcResult = '';
    calcJustEvaluated = false;
    updateCalcDisplayModal();
});

document.getElementById('calcBackspaceModal').addEventListener('click', function () {
    if (calcJustEvaluated) {
        calcExpression = '';
        calcJustEvaluated = false;
    } else {
        calcExpression = calcExpression.slice(0, -1);
    }
    updateCalcDisplayModal();
});

document.getElementById('calcEqualsModal').addEventListener('click', function () {
    try {
        var expr = calcExpression;
        expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        var result = Function('"use strict"; return (' + expr + ')')();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
            var rounded = Math.round(result * 100) / 100;
            var resultStr = rounded.toString();
            calcResult = resultStr;
            calcExpression = resultStr;
            calcJustEvaluated = true;
            updateCalcDisplayModal();
        } else {
            calcExpression = 'Error';
            updateCalcDisplayModal();
            setTimeout(function () {
                calcExpression = '';
                updateCalcDisplayModal();
            }, 800);
        }
    } catch (e) {
        calcExpression = 'Error';
        updateCalcDisplayModal();
        setTimeout(function () {
            calcExpression = '';
            updateCalcDisplayModal();
        }, 800);
    }
});

updateCalcDisplayModal();

document.addEventListener('keydown', function (e) {
    var modalOpen = document.getElementById('calcModal').classList.contains('show');
    if (!modalOpen) return;
    var key = e.key;
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
    var startYear = 2026;
    var currentYear = new Date().getFullYear();
    var footerYearEl = document.getElementById('footerYear');
    if (currentYear === startYear) {
        footerYearEl.textContent = startYear + '';
    } else {
        footerYearEl.textContent = startYear + ' - ' + currentYear;
    }
}

// ===== SYSTEM SETTING: PRINTER SIZE MANAGEMENT =====
let defaultPrinterSize = '58mm';

function loadPrinterSetting() {
    const savedSize = localStorage.getItem('defaultPrinterSize');
    if (savedSize) {
        defaultPrinterSize = savedSize;
    } else {
        defaultPrinterSize = '58mm';
        localStorage.setItem('defaultPrinterSize', '58mm');
    }
    
    if (defaultPrinterSize === '80mm') {
        const radio80 = document.getElementById('size80');
        if (radio80) radio80.checked = true;
    } else {
        const radio58 = document.getElementById('size58');
        if (radio58) radio58.checked = true;
    }
    applyReceiptLayoutClass();
}

function applyReceiptLayoutClass() {
    const strukContent = document.querySelector('#strukContainer .struk-content');
    if (!strukContent) return;

    if (defaultPrinterSize === '80mm') {
        strukContent.classList.remove('paper-58mm');
        strukContent.classList.add('paper-80mm');
    } else {
        strukContent.classList.remove('paper-80mm');
        strukContent.classList.add('paper-58mm');
    }
}

document.addEventListener('change', function(e) {
    if (e.target && e.target.name === 'printerSizeSetting') {
        defaultPrinterSize = e.target.value;
        localStorage.setItem('defaultPrinterSize', defaultPrinterSize);
        applyReceiptLayoutClass();
        showToast('⚙️ Printer setting updated to: ' + defaultPrinterSize);
    }
});

loadPrinterSetting();

// ================================================================
// ===== SELECT2 INITIALIZATION =====
// ================================================================
$(document).ready(function () {
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
var historyModalEl = document.getElementById('historyModal');
if (historyModalEl) {
    historyModalEl.addEventListener('show.bs.modal', function () {
        if (window.innerWidth < 992) {
            var toggleBtn = document.getElementById('mobileCartToggle');
            if (toggleBtn) toggleBtn.style.display = 'none';
        }
    });
    historyModalEl.addEventListener('hidden.bs.modal', function () {
        if (window.innerWidth < 992) {
            var toggleBtn = document.getElementById('mobileCartToggle');
            if (!mobileCartSidebar.classList.contains('open')) {
                if (toggleBtn) toggleBtn.style.display = 'flex';
            }
        } else {
            var toggleBtn = document.getElementById('mobileCartToggle');
            if (toggleBtn) toggleBtn.style.display = 'none';
        }
    });
}

// ===== INITIALIZATION =====
updateFooterYear();
loadOpeningBalance();
loadMenuData();

var storedHistory = localStorage.getItem('transactionHistory');
if (storedHistory) {
    transactionHistory = JSON.parse(storedHistory);
}

window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) {
        mobileCartSidebar.classList.remove('open');
    }
});

console.log('✅ KitaPOS ready!');
console.log('📱 Mobile-first responsive.');
console.log('❤️ Theme: #ED020E');
console.log('📜 Menu data from assets/data/data.js');
console.log('🏷️ Footer: Kernel of Inventory Talent and Asset');
console.log('📊 Grand Total = Opening Balance + Total Transactions');