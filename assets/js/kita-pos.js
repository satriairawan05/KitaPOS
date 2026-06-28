// ================================================================
// assets/js/kita-pos.js - KitaPOS with Alpine.js (Refactored)
// Multiple Draft Sessions (Dine In / Take Away)
// Cross-browser compatible
// ================================================================

console.log('🚀 KitaPOS script.js loaded successfully!');

document.addEventListener('alpine:init', function() {
    console.log('⚡ Alpine.js initialized!');

    Alpine.store('pos', {
        // ---- STATE ----
        menuItems: [],
        nextId: 1,
        openingBalance: 0,

        // multiple draft sessions
        sessions: [],
        activeSessionId: null,
        selectedSession: null,   // for detail modal

        cart: [],
        transactionHistory: [],
        currentCategory: 'all',
        searchQuery: '',
        mobileCartOpen: false,
        toastMessage: 'Notification',

        // Cashier
        cashierName: 'Guest',
        isCashierOnline: false,

        // Outlet
        outletName: 'My Fried Chicken',
        outletAddress: 'Pusat',

        // Calculator
        calcExpression: '',
        calcDisplay: '0',

        // New/Edit item
        newItem: { name: '', price: '', category: 'food', status: 'available', icon: '🍽️', imagePreview: null, imageData: null },
        editItemId: null,
        editItem: { name: '', price: '', category: 'food', status: 'available', icon: '🍽️', imagePreview: null, imageData: null },
        editOpeningBalance: '',

        // Checkout
        paymentMethod: 'cash',
        paymentAmount: '',
        paymentAmountRaw: 0,
        changeAmount: 0,
        discountType: 'rp',
        discountValue: 0,
        discountDisplay: '0',

        // Printer
        defaultPrinterSize: '58mm',
        strukData: { id: '', timestamp: '', items: [], total: 0, totalQty: 0, paid: 0, change: 0, method: 'Cash', discount: 0, subtotal: 0 },

        toast: null,

        // New session modal
        newSessionType: 'dinein',
        newSessionTable: '',

        // ---- COMPUTED ----
        get filteredMenu() {
            var items = this.menuItems;
            if (this.currentCategory !== 'all') {
                items = items.filter(function(item) { return item.category === this.currentCategory; }.bind(this));
            }
            if (this.searchQuery.trim()) {
                var q = this.searchQuery.trim().toLowerCase();
                items = items.filter(function(item) { return item.name.toLowerCase().indexOf(q) !== -1; });
            }
            return items;
        },

        // ---- DRAFT (sessions) helpers ----
        getTotalSessionsCount: function() {
            return this.sessions.reduce(function(sum, s) {
                return sum + s.items.reduce(function(acc, i) { return acc + i.qty; }, 0);
            }, 0);
        },
        getTotalSessionsTotal: function() {
            return this.sessions.reduce(function(sum, s) {
                return sum + this.getSessionTotal(s.id);
            }.bind(this), 0);
        },
        getSessionTotal: function(sessionId) {
            var session = this.sessions.find(function(s) { return s.id === sessionId; });
            if (!session) return 0;
            return session.items.reduce(function(sum, item) { return sum + (item.price * item.qty); }, 0);
        },
        getDraftQty: function(id) {
            var session = this.sessions.find(function(s) { return s.id === this.activeSessionId; }.bind(this));
            if (!session) return 0;
            var item = session.items.find(function(i) { return i.id === id; });
            return item ? item.qty : 0;
        },
        getDisplayDraftQty: function(id) {
            var qty = this.getDraftQty(id);
            return qty > 0 ? qty : 1;
        },

        getCartQty: function(id) {
            var item = this.cart.find(function(c) { return c.id === id; });
            return item ? item.qty : 0;
        },
        getDisplayQty: function(id) {
            var qty = this.getCartQty(id);
            return qty > 0 ? qty : 1;
        },

        // ---- CASHIER ----
        setCashier: function(name, online) {
            if (online === undefined) online = true;
            this.cashierName = name || 'Guest';
            this.isCashierOnline = online;
            try {
                localStorage.setItem('cashierName', this.cashierName);
                localStorage.setItem('isCashierOnline', JSON.stringify(this.isCashierOnline));
            } catch (e) {
                // localStorage not available
            }
        },
        loadCashier: function() {
            try {
                var name = localStorage.getItem('cashierName');
                var online = localStorage.getItem('isCashierOnline');
                if (name) this.cashierName = name;
                if (online !== null) this.isCashierOnline = JSON.parse(online);
            } catch (e) {
                // localStorage not available
            }
        },

        // ---- INIT ----
        init: function() {
            try {
                this.loadCashier();
                var storedOB = null;
                try {
                    storedOB = localStorage.getItem('openingBalance');
                } catch (e) {}
                this.openingBalance = storedOB !== null ? parseInt(storedOB, 10) || 0 : 150000;
                try {
                    localStorage.setItem('openingBalance', this.openingBalance.toString());
                } catch (e) {}

                this.menuItems = [
                    { id: 1, name: 'Ayam Geprek', price: 12000, category: 'food', status: 'available', icon: '🍗', image: null },
                    { id: 2, name: 'Ayam Geprek Keju', price: 15000, category: 'food', status: 'available', icon: '🧀', image: null },
                    { id: 3, name: 'Ayam Lada Hitam', price: 13000, category: 'food', status: 'available', icon: '🍗', image: null },
                    { id: 4, name: 'Ayam Saus BBQ', price: 13000, category: 'food', status: 'available', icon: '🍗', image: null },
                    { id: 5, name: 'Ayam Keju', price: 15000, category: 'food', status: 'available', icon: '🧀', image: null },
                    { id: 6, name: 'Lele Goreng', price: 13000, category: 'food', status: 'out', icon: '🐟', image: null },
                    { id: 7, name: 'Nila Goreng', price: 15000, category: 'food', status: 'available', icon: '🐟', image: null },
                    { id: 8, name: 'Mas Goreng', price: 15000, category: 'food', status: 'low', icon: '🐟', image: null },
                    { id: 9, name: 'Kentang Goreng Kecil', price: 8000, category: 'snack', status: 'low', icon: '🍟', image: null },
                    { id: 10, name: 'Kentang Goreng Besar', price: 12000, category: 'snack', status: 'available', icon: '🍟', image: null },
                    { id: 11, name: 'Nugget Kecil', price: 8000, category: 'snack', status: 'low', icon: '🍘', image: null },
                    { id: 12, name: 'Nugget Besar', price: 12000, category: 'snack', status: 'available', icon: '🍘', image: null },
                    { id: 13, name: 'Es Teh', price: 5000, category: 'drink', status: 'available', icon: '🧊', image: null },
                    { id: 14, name: 'Es Teh Manis', price: 5000, category: 'drink', status: 'available', icon: '🧋', image: null },
                    { id: 15, name: 'Es Jeruk', price: 8000, category: 'drink', status: 'available', icon: '🍊', image: null },
                    { id: 16, name: 'Kopi Hitam', price: 10000, category: 'drink', status: 'available', icon: '☕', image: null },
                    { id: 17, name: 'Saus BBQ', price: 5000, category: 'additional', status: 'available', icon: '➕', image: null },
                    { id: 18, name: 'Saus Lada Hitam', price: 5000, category: 'additional', status: 'available', icon: '➕', image: null },
                    { id: 19, name: 'Saus Keju', price: 5000, category: 'additional', status: 'available', icon: '➕', image: null },
                    { id: 20, name: 'Chili Oil', price: 5000, category: 'additional', status: 'available', icon: '🌶️', image: null }
                ];
                this.nextId = 21;

                try {
                    var storedHistory = localStorage.getItem('transactionHistory');
                    if (storedHistory) {
                        this.transactionHistory = JSON.parse(storedHistory);
                    }
                } catch (e) {}
                
                try {
                    var savedSize = localStorage.getItem('defaultPrinterSize');
                    this.defaultPrinterSize = savedSize || '58mm';
                    localStorage.setItem('defaultPrinterSize', this.defaultPrinterSize);
                } catch (e) {}

                var toastEl = document.getElementById('liveToast');
                if (toastEl && typeof bootstrap !== 'undefined' && bootstrap.Toast) {
                    this.toast = new bootstrap.Toast(toastEl, { delay: 2500 });
                }
                console.log('✅ KitaPOS Store ready!');
                console.log('👤 Cashier:', this.cashierName, '| Online:', this.isCashierOnline);
            } catch (error) {
                console.error('❌ Error during initialization:', error);
                if (this.menuItems.length === 0) {
                    this.menuItems = [{ id: 1, name: 'Ayam Geprek', price: 12000, category: 'food', status: 'available', icon: '🍗', image: null }];
                    this.nextId = 2;
                }
            }
        },

        // ---- SAVE/LOAD ----
        saveOpeningBalance: function(value) {
            this.openingBalance = value;
            try {
                localStorage.setItem('openingBalance', value.toString());
            } catch (e) {}
        },
        saveTransactionHistory: function() {
            try {
                localStorage.setItem('transactionHistory', JSON.stringify(this.transactionHistory));
            } catch (e) {}
        },
        saveTransaction: function(method, total, paid, change, items, discountAmt, discountType, discountValue, subtotal) {
            var now = new Date();
            var timestamp = this.formatTanggalIndonesia(now);
            var transaction = {
                id: this.transactionHistory.length + 1,
                timestamp: timestamp,
                items: items,
                total: total,
                subtotal: subtotal,
                discount: discountAmt,
                discountType: discountType,
                discountValue: discountValue,
                method: method,
                paid: paid,
                change: change
            };
            this.transactionHistory.push(transaction);
            this.saveTransactionHistory();
            return transaction;
        },
        showToast: function(msg) {
            this.toastMessage = msg;
            if (this.toast) {
                try {
                    this.toast.show();
                } catch (e) {}
            }
        },

        // ---- HELPERS ----
        formatRupiah: function(angka) {
            if (!angka && angka !== 0) return '';
            return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },
        formatPriceInput: function(event) {
            var value = event.target.value.replace(/\D/g, '');
            if (value === '') {
                event.target.value = '';
                return;
            }
            var number = parseInt(value, 10);
            if (isNaN(number)) {
                event.target.value = '';
                return;
            }
            event.target.value = this.formatRupiah(number);
        },
        parseRupiah: function(str) {
            if (!str) return 0;
            return parseInt(str.replace(/\D/g, ''), 10) || 0;
        },
        formatTanggalIndonesia: function(date) {
            var month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            var hour = String(date.getHours()).padStart(2, '0');
            var minute = String(date.getMinutes()).padStart(2, '0');
            return date.getDate() + ' ' + month[date.getMonth()] + ' ' + date.getFullYear() + ' ' + hour + ':' + minute;
        },
        formatReceiptLine: function(leftText, rightText, is80mm) {
            if (is80mm === undefined) is80mm = false;
            var lineLength = is80mm ? 48 : 32;
            var left = leftText.toString();
            var right = rightText.toString();
            var spaceLength = lineLength - left.length - right.length;
            if (spaceLength < 1) {
                left = left.substring(0, lineLength - right.length - 2) + '..';
                spaceLength = 0;
            }
            return left + ' '.repeat(spaceLength) + right;
        },

        // ---- UI NAVIGATION ----
        goHome: function() {
            this.currentCategory = 'all';
            this.searchQuery = '';
            var el = document.getElementById('mainContent');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            this.showToast('🏠 Returned to main menu');
        },
        openCalculator: function() {
            var el = document.getElementById('calcModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                new bootstrap.Modal(el).show();
            }
        },
        openHistory: function() {
            var el = document.getElementById('historyModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                new bootstrap.Modal(el).show();
            }
        },
        toggleMobileCart: function() {
            this.mobileCartOpen = !this.mobileCartOpen;
        },
        closeMobileCart: function() {
            this.mobileCartOpen = false;
        },

        // ---- SESSION MANAGEMENT ----
        openNewSessionModal: function() {
            this.newSessionType = 'dinein';
            this.newSessionTable = '';
            var el = document.getElementById('newSessionModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                new bootstrap.Modal(el).show();
            }
        },
        createNewSession: function() {
            var type = this.newSessionType;
            var table = this.newSessionTable ? parseInt(this.newSessionTable, 10) : null;
            var name = '';
            if (type === 'dinein') {
                if (!table || table < 1) {
                    this.showToast('❌ Masukkan nomor meja yang valid');
                    return;
                }
                name = 'Meja ' + table;
            } else {
                name = 'Take Away';
            }
            var session = {
                id: Date.now(),
                name: name,
                type: type,
                table: table,
                typeLabel: type === 'dinein' ? '🍽️ Dine In' : '🛍️ Take Away',
                items: [],
                createdAt: new Date().toISOString()
            };
            this.sessions.push(session);
            this.activeSessionId = session.id;
            var el = document.getElementById('newSessionModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                var modal = bootstrap.Modal.getInstance(el);
                if (modal) modal.hide();
            }
            this.showToast('✅ Pesanan baru dibuat: ' + name);
            console.log('📦 Session created:', session);
        },
        setActiveSession: function(id) {
            this.activeSessionId = id;
            var session = this.sessions.find(function(s) { return s.id === id; });
            this.showToast('🔁 Session aktif: ' + (session ? session.name : 'unknown'));
        },
        removeSession: function(id) {
            if (confirm('Hapus session ini?')) {
                this.sessions = this.sessions.filter(function(s) { return s.id !== id; });
                if (this.activeSessionId === id) {
                    this.activeSessionId = this.sessions.length > 0 ? this.sessions[0].id : null;
                }
                this.showToast('🗑️ Session dihapus');
                console.log('🗑️ Session removed:', id);
            }
        },

        // ---- SESSION DETAIL MODAL ----
        openSessionDetailModal: function(sessionId) {
            console.log('🔍 Opening detail for session:', sessionId);
            var session = this.sessions.find(function(s) { return s.id === sessionId; });
            if (!session) {
                this.showToast('❌ Session tidak ditemukan');
                console.error('Session not found:', sessionId);
                return;
            }
            this.selectedSession = session;
            console.log('📋 Selected session:', this.selectedSession);
            var el = document.getElementById('sessionDetailModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                new bootstrap.Modal(el).show();
            } else {
                console.error('Modal element #sessionDetailModal not found');
                this.showToast('❌ Modal tidak ditemukan');
            }
        },

        // ---- DRAFT (session) ITEMS ----
        incrementDraftQty: function(id) {
            if (!this.activeSessionId) {
                this.showToast('❌ Buat pesanan baru terlebih dahulu!');
                this.openNewSessionModal();
                return;
            }
            var session = this.sessions.find(function(s) { return s.id === this.activeSessionId; }.bind(this));
            if (!session) {
                this.showToast('❌ Session tidak ditemukan');
                return;
            }
            var menuItem = this.menuItems.find(function(i) { return i.id === id; });
            if (!menuItem) {
                this.showToast('❌ Menu tidak ditemukan');
                return;
            }
            if (menuItem.status === 'out') {
                this.showToast('❌ ' + menuItem.name + ' habis!');
                return;
            }
            var existing = session.items.find(function(i) { return i.id === id; });
            if (existing) {
                existing.qty += 1;
            } else {
                session.items.push({ id: menuItem.id, name: menuItem.name, price: menuItem.price, qty: 1, icon: menuItem.icon });
            }
            this.showToast('📝 ' + menuItem.name + ' ditambahkan ke ' + session.name);
        },
        decrementDraftQty: function(id) {
            var session = this.sessions.find(function(s) { return s.id === this.activeSessionId; }.bind(this));
            if (!session) return;
            var idx = -1;
            for (var i = 0; i < session.items.length; i++) {
                if (session.items[i].id === id) { idx = i; break; }
            }
            if (idx === -1) return;
            if (session.items[idx].qty > 1) {
                session.items[idx].qty -= 1;
            } else {
                session.items.splice(idx, 1);
            }
        },
        updateDraftQtyFromInput: function(id, event) {
            var val = parseInt(event.target.value, 10);
            if (isNaN(val) || val < 0) {
                event.target.value = this.getDisplayDraftQty(id);
                return;
            }
            var session = this.sessions.find(function(s) { return s.id === this.activeSessionId; }.bind(this));
            if (!session) {
                event.target.value = 1;
                return;
            }
            var idx = -1;
            for (var i = 0; i < session.items.length; i++) {
                if (session.items[i].id === id) { idx = i; break; }
            }
            if (idx === -1) {
                if (val > 0) {
                    var menuItem = this.menuItems.find(function(i) { return i.id === id; });
                    if (menuItem && menuItem.status !== 'out') {
                        session.items.push({ id: menuItem.id, name: menuItem.name, price: menuItem.price, qty: val, icon: menuItem.icon });
                    } else {
                        this.showToast('❌ Item tidak tersedia');
                        event.target.value = this.getDisplayDraftQty(id);
                    }
                } else {
                    event.target.value = this.getDisplayDraftQty(id);
                }
                return;
            }
            if (val === 0) {
                session.items.splice(idx, 1);
            } else {
                var menuItem = this.menuItems.find(function(i) { return i.id === id; });
                if (menuItem && menuItem.status === 'out') {
                    this.showToast('❌ ' + menuItem.name + ' habis!');
                    event.target.value = this.getDisplayDraftQty(id);
                    return;
                }
                session.items[idx].qty = val;
            }
        },

        // ---- CONFIRM SESSION TO CART ----
        confirmSessionToCart: function(sessionId) {
            var session = this.sessions.find(function(s) { return s.id === sessionId; });
            if (!session || session.items.length === 0) {
                this.showToast('❌ Session kosong!');
                return;
            }
            // Merge items into cart
            session.items.forEach(function(item) {
                var existing = this.cart.find(function(c) { return c.id === item.id; });
                if (existing) {
                    existing.qty += item.qty;
                } else {
                    this.cart.push({ id: item.id, name: item.name, price: item.price, qty: item.qty, icon: item.icon });
                }
            }.bind(this));
            // Remove session
            this.sessions = this.sessions.filter(function(s) { return s.id !== sessionId; });
            if (this.activeSessionId === sessionId) {
                this.activeSessionId = this.sessions.length > 0 ? this.sessions[0].id : null;
            }
            // Close modal if open
            var el = document.getElementById('sessionDetailModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                var modal = bootstrap.Modal.getInstance(el);
                if (modal) modal.hide();
            }
            this.showToast('🛒 ' + session.name + ' dilanjutkan ke Keranjang!');
            console.log('🛒 Session confirmed to cart:', session.name);
        },

        // ---- CART OPERATIONS ----
        incrementQty: function(id) {
            var existing = this.cart.find(function(c) { return c.id === id; });
            if (existing) {
                var menuItem = this.menuItems.find(function(i) { return i.id === id; });
                if (menuItem && menuItem.status === 'out') {
                    this.showToast('❌ ' + menuItem.name + ' habis!');
                    return;
                }
                existing.qty += 1;
            } else {
                this.showToast('❌ Item tidak ada di keranjang.');
            }
        },
        decrementQty: function(id) {
            var idx = -1;
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === id) { idx = i; break; }
            }
            if (idx === -1) return;
            if (this.cart[idx].qty > 1) {
                this.cart[idx].qty -= 1;
            } else {
                this.cart.splice(idx, 1);
            }
        },
        updateQtyFromInput: function(id, event) {
            var val = parseInt(event.target.value, 10);
            if (isNaN(val) || val < 0) {
                event.target.value = this.getDisplayQty(id);
                return;
            }
            var idx = -1;
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === id) { idx = i; break; }
            }
            if (idx === -1) {
                event.target.value = this.getDisplayQty(id);
                this.showToast('❌ Item tidak ada di keranjang.');
                return;
            }
            if (val === 0) {
                this.cart.splice(idx, 1);
            } else {
                var menuItem = this.menuItems.find(function(i) { return i.id === id; });
                if (menuItem && menuItem.status === 'out') {
                    this.showToast('❌ ' + menuItem.name + ' habis!');
                    event.target.value = this.getDisplayQty(id);
                    return;
                }
                this.cart[idx].qty = val;
            }
        },
        resetTo: function(id, targetQty) {
            var item = this.cart.find(function(c) { return c.id === id; });
            if (item && item.qty > targetQty) {
                item.qty = targetQty;
                this.showToast('✅ Qty reset to ' + targetQty);
            }
        },

        // ---- MENU MANAGEMENT ----
        openAddMenu: function(category) {
            if (category === undefined) category = 'food';
            this.newItem = { name: '', price: '', category: category, status: 'available', icon: category === 'additional' ? '➕' : '🍽️', imagePreview: null, imageData: null };
            setTimeout(function() {
                if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
                    $('#manualCategory').val(category).trigger('change.select2');
                    $('#manualStatus').val('available').trigger('change.select2');
                }
            }, 50);
            var el = document.getElementById('addItemModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                new bootstrap.Modal(el).show();
            }
        },
        onCategoryChange: function() {
            if (this.newItem.category === 'additional') {
                this.newItem.status = 'available';
                this.newItem.icon = '➕';
            } else if (!this.newItem.icon || this.newItem.icon === '➕') {
                this.newItem.icon = '🍽️';
            }
        },
        saveNewItem: function() {
            var item = {
                id: this.nextId++,
                name: this.newItem.name.trim(),
                price: parseInt(this.newItem.price.replace(/\D/g, ''), 10) || 0,
                category: this.newItem.category,
                status: this.newItem.status,
                icon: this.newItem.icon || '🍽️'
            };
            this.menuItems.push(item);
            var el = document.getElementById('addItemModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                var modal = bootstrap.Modal.getInstance(el);
                if (modal) modal.hide();
            }
            this.showToast('✅ Menu "' + item.name + '" added successfully!');
        },
        handleImageUpload: function(event) {
            var file = event.target.files[0];
            if (!file) { this.newItem.imagePreview = null; this.newItem.imageData = null; return; }
            var reader = new FileReader();
            reader.onload = function(e) {
                this.newItem.imagePreview = e.target.result;
                this.newItem.imageData = e.target.result;
            }.bind(this);
            reader.readAsDataURL(file);
        },
        handleEditImageUpload: function(event) {
            var file = event.target.files[0];
            if (!file) { this.editItem.imagePreview = null; this.editItem.imageData = null; return; }
            var reader = new FileReader();
            reader.onload = function(e) {
                this.editItem.imagePreview = e.target.result;
                this.editItem.imageData = e.target.result;
            }.bind(this);
            reader.readAsDataURL(file);
        },
        openEditMenu: function(id) {
            var item = this.menuItems.find(function(i) { return i.id === id; });
            if (!item) { this.showToast('❌ Menu not found!'); return; }
            this.editItemId = id;
            this.editItem = { 
                id: item.id, 
                name: item.name, 
                price: item.price, 
                category: item.category, 
                status: item.status, 
                icon: item.icon || '🍽️',
                imagePreview: item.image || null, 
                imageData: null 
            };
            var fileInput = document.getElementById('editImage');
            if (fileInput) fileInput.value = '';
            var el = document.getElementById('editItemModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                var modal = new bootstrap.Modal(el);
                modal.show();
            }
            setTimeout(function() {
                if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
                    $('#editCategory, #editStatus').select2('destroy');
                    $('#editCategory, #editStatus').select2({
                        theme: 'default',
                        width: '100%',
                        dropdownParent: $('#editItemModal'),
                        dropdownAutoWidth: true,
                        placeholder: 'Select...',
                        allowClear: false
                    });
                    $('#editCategory').on('change', function(e) { this.editItem.category = e.target.value; }.bind(this));
                    $('#editStatus').on('change', function(e) { this.editItem.status = e.target.value; }.bind(this));
                    $('#editCategory').val(this.editItem.category).trigger('change.select2');
                    $('#editStatus').val(this.editItem.status).trigger('change.select2');
                }
            }.bind(this), 100);
        },
        saveEditItem: function() {
            var id = this.editItemId;
            if (id === null || id === undefined) { this.showToast('❌ No item selected to edit!'); return; }
            var index = -1;
            for (var i = 0; i < this.menuItems.length; i++) {
                if (this.menuItems[i].id === id) { index = i; break; }
            }
            if (index === -1) { this.showToast('❌ Menu not found!'); return; }
            var name = this.editItem.name.trim();
            var rawPrice = this.editItem.price.replace(/\D/g, '');
            var price = parseInt(rawPrice, 10) || 0;
            if (!name) { this.showToast('❌ Menu name is required!'); return; }
            if (price <= 0) { this.showToast('❌ Price must be a positive number!'); return; }
            this.menuItems[index] = {
                id: this.menuItems[index].id,
                name: name,
                price: price,
                category: this.editItem.category,
                status: this.editItem.status,
                icon: this.editItem.icon || '🍽️',
                image: this.editItem.imageData || this.menuItems[index].image
            };
            // Update sessions & cart
            this.sessions.forEach(function(session) {
                session.items.forEach(function(item) {
                    if (item.id === id) {
                        item.name = name;
                        item.price = price;
                        item.icon = this.editItem.icon || '🍽️';
                    }
                }.bind(this));
            }.bind(this));
            this.cart.forEach(function(item) {
                if (item.id === id) {
                    item.name = name;
                    item.price = price;
                    item.icon = this.editItem.icon || '🍽️';
                }
            }.bind(this));
            var el = document.getElementById('editItemModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                var modal = bootstrap.Modal.getInstance(el);
                if (modal) modal.hide();
            }
            this.editItemId = null;
            this.editItem = { name: '', price: '', category: 'food', status: 'available', icon: '🍽️', imagePreview: null, imageData: null };
            this.showToast('✅ Menu "' + name + '" updated successfully!');
        },

        // ---- OPENING BALANCE ----
        openEditOpeningBalance: function() {
            this.editOpeningBalance = this.formatRupiah(this.openingBalance);
            var el = document.getElementById('editOpeningBalanceModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                new bootstrap.Modal(el).show();
            }
        },
        saveOpeningBalance: function() {
            this.openingBalance = parseInt(this.editOpeningBalance.replace(/\D/g, ''), 10) || 0;
            this.saveOpeningBalance(this.openingBalance);
            var el = document.getElementById('editOpeningBalanceModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                var modal = bootstrap.Modal.getInstance(el);
                if (modal) modal.hide();
            }
        },

        // ---- CHECKOUT ----
        openCheckout: function() {
            if (this.cart.length === 0) return;
            this.paymentMethod = 'cash';
            this.paymentAmount = '';
            this.paymentAmountRaw = 0;
            this.changeAmount = 0;
            this.discountType = 'rp';
            this.discountValue = 0;
            this.discountDisplay = '0';
            setTimeout(function() {
                if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
                    $('#paymentMethod').val('cash').trigger('change.select2');
                }
            }, 50);
            this.handlePaymentMethodChange();
            var el = document.getElementById('checkoutModal');
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                new bootstrap.Modal(el).show();
            }
        },
        setQuickPay: function(val) {
            this.paymentAmountRaw = val;
            this.paymentAmount = this.formatRupiah(val);
            this.updateChange();
        },
        updateChange: function() {
            try {
                if (this.paymentMethod === 'cash') {
                    if (this.paymentAmount) {
                        var raw = this.parseRupiah(this.paymentAmount);
                        this.paymentAmountRaw = raw;
                        if (raw > 0) {
                            this.paymentAmount = this.formatRupiah(raw);
                        }
                    }
                    var total = this.discountedTotal;
                    this.changeAmount = this.paymentAmountRaw - total;
                } else {
                    var total = this.discountedTotal;
                    this.paymentAmount = this.formatRupiah(total);
                    this.paymentAmountRaw = total;
                    this.changeAmount = 0;
                }
            } catch (error) {
                console.error('Error in updateChange:', error);
            }
        },
        handlePaymentMethodChange: function() {
            try {
                if (this.paymentMethod === 'qris') {
                    var total = this.discountedTotal;
                    this.paymentAmount = this.formatRupiah(total);
                    this.paymentAmountRaw = total;
                    this.changeAmount = 0;
                } else {
                    this.paymentAmount = '';
                    this.paymentAmountRaw = 0;
                    this.changeAmount = 0;
                }
            } catch (error) {
                console.error('Error in handlePaymentMethodChange:', error);
            }
        },
        confirmCheckout: function() {
            try {
                var total = this.discountedTotal;
                var method = this.paymentMethod;
                var paid = this.paymentAmountRaw;
                if (method === 'cash') {
                    if (paid < total) {
                        this.showToast('❌ Payment insufficient!');
                        return;
                    }
                    var change = paid - total;
                    var items = this.cart.map(function(item) {
                        return { name: item.name, qty: item.qty, price: item.price, subtotal: item.price * item.qty };
                    });
                    var transaction = this.saveTransaction('Cash', total, paid, change, items, this.discountAmount, this.discountType, this.discountValue, this.cartTotal);
                    this.showToast('✅ Checkout successful!');
                    this.printStrukMobile(transaction);
                } else {
                    paid = total;
                    this.paymentAmount = this.formatRupiah(paid);
                    this.paymentAmountRaw = paid;
                    var items = this.cart.map(function(item) {
                        return { name: item.name, qty: item.qty, price: item.price, subtotal: item.price * item.qty };
                    });
                    var transaction = this.saveTransaction('QRIS', total, paid, 0, items, this.discountAmount, this.discountType, this.discountValue, this.cartTotal);
                    this.showToast('✅ Checkout successful! Method: QRIS.');
                    this.printStrukMobile(transaction);
                }
                this.cart = [];
                this.mobileCartOpen = false;
                var el = document.getElementById('checkoutModal');
                if (el && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    var modal = bootstrap.Modal.getInstance(el);
                    if (modal) modal.hide();
                }
            } catch (error) {
                console.error('Error in confirmCheckout:', error);
                this.showToast('❌ Checkout failed!');
            }
        },
        updateDiscount: function(event) {
            var raw = event.target.value.replace(/\D/g, '');
            if (this.discountType === 'rp') {
                var val = parseInt(raw, 10) || 0;
                this.discountValue = val;
                this.discountDisplay = this.formatRupiah(val);
                event.target.value = this.formatRupiah(val);
            } else {
                var pct = parseInt(raw, 10) || 0;
                if (pct > 100) pct = 100;
                this.discountValue = pct;
                this.discountDisplay = pct.toString();
                event.target.value = pct.toString();
            }
            this.updateChange();
        },
        reformatDiscountDisplay: function() {
            if (this.discountType === 'rp') {
                this.discountDisplay = this.formatRupiah(this.discountValue);
            } else {
                this.discountDisplay = this.discountValue.toString();
            }
            this.updateChange();
        },

        // ---- COMPUTED for cart/discount ----
        get cartTotal() {
            return this.cart.reduce(function(sum, item) { return sum + (item.price * item.qty); }, 0);
        },
        get cartCount() {
            return this.cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
        },
        get discountAmount() {
            var total = this.cartTotal;
            if (this.discountType === 'rp') {
                var val = this.discountValue || 0;
                return Math.min(val, total);
            } else if (this.discountType === 'percent') {
                var pct = Math.min(this.discountValue || 0, 100);
                return total * pct / 100;
            }
            return 0;
        },
        get discountedTotal() {
            return Math.max(this.cartTotal - this.discountAmount, 0);
        },
        get quickPayOptions() {
            var total = this.discountedTotal;
            if (total <= 0) return [0];
            var end = 100000;
            if (total > 100000) {
                end = Math.ceil(total / 100000) * 100000;
                if (end <= total) end += 100000;
            }
            var down = Math.floor(total / 10000) * 10000;
            if (down === total) down = Math.max(0, down - 10000);
            if (total < 50000) down = 50000;
            if (down <= 0) down = 10000;
            var up = Math.ceil(total / 10000) * 10000;
            if (up === total) up = up + 10000;
            if (total < 50000) up = Math.max(down + 10000, 60000);
            if (up <= down) up = down + 10000;
            if (total <= 100000 && up >= end) up = Math.min(end - 10000, Math.ceil((total + end) / 2) / 10000 * 10000);
            if (up <= down) up = down + 10000;
            var others = [down, up, end].filter(function(v) { return v > 0 && v !== total; });
            others = Array.from(new Set(others)).sort(function(a, b) { return a - b; });
            var options = [total].concat(others);
            var endIndex = options.indexOf(end);
            if (endIndex !== -1 && endIndex !== options.length - 1) {
                options.splice(endIndex, 1);
                options.push(end);
            }
            return options;
        },

        // ---- HISTORY ----
        deleteTransaction: function(id) {
            if (confirm('Delete transaction #' + id + '?')) {
                this.transactionHistory = this.transactionHistory.filter(function(trx) { return trx.id !== id; });
                this.transactionHistory.forEach(function(trx, index) { trx.id = index + 1; });
                this.saveTransactionHistory();
                this.showToast('🗑️ Deleted');
            }
        },
        clearAllTransactions: function() {
            if (confirm('⚠️ Clear ALL?')) {
                this.transactionHistory = [];
                this.saveTransactionHistory();
                this.showToast('🗑️ All cleared');
            }
        },

        // ---- PRINTER ----
        applyPrinterSize: function() {
            try {
                localStorage.setItem('defaultPrinterSize', this.defaultPrinterSize);
            } catch (e) {}
            this.showToast('⚙️ Printer setting: ' + this.defaultPrinterSize);
        },
        setOutle: function(name, address) {
            this.outletName = name || 'My Fried Chicken';
            this.outletAddress = address || 'Pusat';
        },

        // ---- PRINT ----
        printStrukMobile: function(transaction) {
            if (!transaction || !transaction.items || transaction.items.length === 0) {
                this.showToast('❌ No transaction data to print!');
                return;
            }
            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                this.printStrukWebBluetoothiOS(transaction);
            } else if (/android/i.test(userAgent)) {
                this.printStrukRawBT(transaction);
            } else {
                this.printStrukBrowser(transaction);
            }
        },
        printStrukRawBT: function(transaction) {
            try {
                var is80mm = this.defaultPrinterSize === '80mm';
                var maxWidth = is80mm ? 48 : 32;
                var encoder = new EscPosEncoder();
                var receipt = encoder.initialize();
                receipt.align('center')
                    .bold(true).text(this.outletName).newline().bold(false)
                    .text(this.outletAddress).newline()
                    .line('-'.repeat(maxWidth));
                receipt.align('left')
                    .text('Kasir : ' + this.cashierName).newline()
                    .text('Waktu : ' + this.formatTanggalIndonesia(transaction.timestamp)).newline()
                    .text('No. Struk : #' + transaction.id).newline()
                    .text('Bayar : ' + (transaction.method === 'Cash' ? 'Tunai' : 'QRIS')).newline()
                    .line('-'.repeat(maxWidth));
                receipt.align('center')
                    .bold(true).text('LUNAS').newline().bold(false)
                    .line('-'.repeat(maxWidth));
                receipt.align('left')
                    .text('Item'.padEnd(20) + 'Qty'.padStart(6) + 'Total'.padStart(14)).newline()
                    .line('-'.repeat(maxWidth));
                transaction.items.forEach(function(item) {
                    var name = item.name.substring(0, 20);
                    var qtyStr = item.qty.toString();
                    var subtotalStr = 'Rp' + this.formatRupiah(item.subtotal);
                    var line = name.padEnd(20) + qtyStr.padStart(6) + subtotalStr.padStart(14);
                    receipt.text(line).newline();
                }.bind(this));
                receipt.line('-'.repeat(maxWidth));
                var subtotalStr = 'Rp' + this.formatRupiah(transaction.subtotal);
                receipt.align('right')
                    .text('Subtotal : ' + subtotalStr).newline();
                if (transaction.discount && transaction.discount > 0) {
                    var diskonStr = '-Rp' + this.formatRupiah(transaction.discount);
                    receipt.text('Diskon : ' + diskonStr).newline();
                }
                var totalQty = transaction.items.reduce(function(sum, item) { return sum + item.qty; }, 0);
                var totalStr = 'Rp' + this.formatRupiah(transaction.total);
                receipt.bold(true)
                    .text('Total (' + totalQty + ') : ' + totalStr).newline()
                    .bold(false)
                    .line('-'.repeat(maxWidth));
                receipt.text('Bayar : Rp' + this.formatRupiah(transaction.paid)).newline()
                    .text('Kembali : Rp' + this.formatRupiah(transaction.change)).newline()
                    .line('-'.repeat(maxWidth));
                receipt.align('center')
                    .text('Powered by KitaPOS').newline()
                    .text('Terima kasih').newline()
                    .newline().newline().newline();
                var resultData = receipt.encode();
                var binary = '';
                resultData.forEach(function(b) { binary += String.fromCharCode(b); });
                window.location.href = 'rawbt:base64,' + btoa(binary);
            } catch (error) {
                this.showToast('⚠️ RawBT failed, switching to normal print');
                this.printStrukBrowser(transaction);
            }
        },
        printStrukWebBluetoothiOS: function(transaction) {
            if (!navigator.bluetooth) {
                alert("⚠️ iOS BLOCKED!\nOpen KitaPOS using 'Bluefy' browser.");
                return;
            }
            try {
                var is80mm = this.defaultPrinterSize === '80mm';
                navigator.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2', '49535343-fe7d-4ae5-8fa9-9fafd205e455']
                }).then(function(device) {
                    return device.gatt.connect();
                }).then(function(server) {
                    return server.getPrimaryServices();
                }).then(function(services) {
                    return services[0].getCharacteristics();
                }).then(function(characteristics) {
                    var characteristic = characteristics.find(function(c) {
                        return c.properties.write || c.properties.writeWithoutResponse;
                    });
                    var encoder = new EscPosEncoder();
                    var receipt = encoder.initialize()
                        .align('center')
                        .bold(true).text('KITA POS - PUSAT').newline().bold(false)
                        .line('-'.repeat(is80mm ? 48 : 32))
                        .align('left');
                    transaction.items.forEach(function(item) {
                        var leftStr = '  ' + item.qty + ' x ' + this.formatRupiah(item.price);
                        var rightStr = this.formatRupiah(item.subtotal);
                        receipt.text(item.name).newline();
                        receipt.text(this.formatReceiptLine(leftStr, rightStr, is80mm)).newline();
                    }.bind(this));
                    if (transaction.discount && transaction.discount > 0) {
                        receipt.line('-'.repeat(is80mm ? 48 : 32))
                            .text(this.formatReceiptLine('Diskon', '-Rp ' + this.formatRupiah(transaction.discount), is80mm)).newline();
                    }
                    receipt.line('-'.repeat(is80mm ? 48 : 32))
                        .text(this.formatReceiptLine('TOTAL', 'Rp ' + this.formatRupiah(transaction.total), is80mm)).newline()
                        .newline().newline().newline();
                    var resultData = receipt.encode();
                    var chunkSize = 50;
                    var promises = [];
                    for (var i = 0; i < resultData.length; i += chunkSize) {
                        var chunk = resultData.slice(i, i + chunkSize);
                        promises.push(characteristic.writeValue(chunk).then(function() {
                            return new Promise(function(resolve) {
                                setTimeout(resolve, 20);
                            });
                        }));
                    }
                    return Promise.all(promises).then(function() {
                        device.gatt.disconnect();
                        this.showToast('🖨️ Printed from iPhone!');
                    }.bind(this));
                }.bind(this)).catch(function(error) {
                    this.showToast('⚠️ Bluetooth failed. Switching to normal print...');
                    this.printStrukBrowser(transaction);
                }.bind(this));
            } catch (error) {
                this.showToast('⚠️ Bluetooth failed. Switching to normal print...');
                this.printStrukBrowser(transaction);
            }
        },
        printStrukBrowser: function(transaction) {
            if (!transaction || !transaction.items || transaction.items.length === 0) return;
            var style = document.getElementById('printPageStyle');
            if (!style) {
                style = document.createElement('style');
                style.id = 'printPageStyle';
                document.head.appendChild(style);
            }
            var paperSize = this.defaultPrinterSize;
            style.innerHTML = '\n                @media print {\n                    @page { size: ' + paperSize + ' auto; margin: 0; }\n                    * { box-sizing: border-box; }\n                    body { margin: 0 !important; padding: 0 !important; background: #fff !important; }\n                    #strukContainer {\n                        display: block !important;\n                        width: ' + paperSize + ' !important;\n                        max-width: ' + paperSize + ' !important;\n                        margin: 0 auto !important;\n                        padding: 0 !important;\n                        background: #fff !important;\n                        overflow: hidden !important;\n                    }\n                    .struk-content {\n                        width: ' + paperSize + ' !important;\n                        max-width: ' + paperSize + ' !important;\n                        margin: 0 auto !important;\n                        padding: 2mm 2mm !important;\n                        background: #fff !important;\n                        font-size: ' + (paperSize === '58mm' ? '8px' : '12px') + ' !important;\n                        box-sizing: border-box !important;\n                        page-break-inside: avoid !important;\n                        page-break-after: avoid !important;\n                    }\n                    .struk-content.paper-58mm, .struk-content.paper-80mm {\n                        width: ' + paperSize + ' !important;\n                        max-width: ' + paperSize + ' !important;\n                    }\n                    html, body { margin: 0 !important; padding: 0 !important; }\n                    body > *:not(#strukContainer) { display: none !important; }\n                }\n            ';
            var totalQty = transaction.items.reduce(function(sum, item) { return sum + item.qty; }, 0);
            this.strukData = {
                id: transaction.id,
                timestamp: transaction.timestamp,
                items: transaction.items,
                total: transaction.total,
                totalQty: totalQty,
                paid: transaction.paid,
                change: transaction.change,
                method: transaction.method,
                discount: transaction.discount || 0,
                subtotal: transaction.subtotal || transaction.total + (transaction.discount || 0)
            };
            var container = document.getElementById('strukContainer');
            container.style.display = 'block';
            setTimeout(function() {
                window.print();
            }, 400);
            window.onafterprint = function() {
                container.style.display = 'none';
                window.onafterprint = null;
            };
        },

        // ---- CALCULATOR ----
        calcAppend: function(val) { this.calcExpression += val; this.updateCalcDisplay(); },
        calcClear: function() { this.calcExpression = ''; this.updateCalcDisplay(); },
        calcBackspace: function() { this.calcExpression = this.calcExpression.slice(0, -1); this.updateCalcDisplay(); },
        calcEvaluate: function() {
            try {
                this.calcExpression = eval(this.calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')).toString();
            } catch (e) {
                this.calcExpression = 'Error';
                setTimeout(function() { this.calcClear(); }.bind(this), 800);
            }
            this.updateCalcDisplay();
        },
        updateCalcDisplay: function() { this.calcDisplay = this.calcExpression || '0'; },

        // ---- FILTER ----
        setCategory: function(cat) { this.currentCategory = cat; },
        filterMenu: function() { }
    });

    // ===== UI COMPONENTS =====
    Alpine.data('navbarComponent', function() { return {}; });
    Alpine.data('menuGridComponent', function() {
        return {
            init: function() {
                this.$nextTick(function() {
                    var items = this.$store.pos.menuItems;
                    items.forEach(function(item) {
                        if (item.category !== 'additional') {
                            this.fetchPexelsImage(item);
                        }
                    }.bind(this));
                }.bind(this));
            },
            fetchPexelsImage: function(item) {
                if (item.image) return;
                var apiKey = window._env && window._env.PEXELS_API_KEY ? window._env.PEXELS_API_KEY : null;
                if (!apiKey) {
                    console.warn('Pexels API key not found, using fallback.');
                    return;
                }
                var query = encodeURIComponent(item.name);
                var url = 'https://api.pexels.com/v1/search?query=' + query;
                fetch(url, { headers: { 'Authorization': apiKey } })
                    .then(function(response) { return response.json(); })
                    .then(function(data) {
                        if (data.photos && data.photos.length > 0) {
                            item.image = data.photos[0].src.medium;
                        } else {
                            item.image = null;
                        }
                    })
                    .catch(function(error) {
                        console.error('Pexels fetch error:', error);
                        item.image = null;
                    });
            }
        };
    });
    
    // Draft Sessions Component
    Alpine.data('draftSessionsComponent', function() { return {}; });
    
    Alpine.data('cartSidebarComponent', function() { return {}; });
    Alpine.data('mobileCartComponent', function() { return {}; });
    Alpine.data('checkoutComponent', function() { return {}; });
    Alpine.data('historyComponent', function() { return {}; });
    Alpine.data('calculatorComponent', function() { return {}; });
    Alpine.data('addEditMenuComponent', function() { return {}; });

    // ===== ROOT =====
    Alpine.data('posApp', function() {
        return {
            init: function() {
                var store = Alpine.store('pos');

                // ===== SET CASHIER BASED ON TIME =====
                var currentHour = new Date().getHours();
                var cashierName = 'May';

                if (currentHour >= 8 && currentHour < 16) {
                    cashierName = 'Sintia';
                } else if (currentHour >= 16 && currentHour <= 24) {
                    cashierName = 'Aprilia';
                } else {
                    cashierName = 'Indah';
                }

                store.setCashier(cashierName, true);

                if (window.KitaPOS && window.KitaPOS.user) {
                    store.setCashier(window.KitaPOS.user.name, window.KitaPOS.user.isOnline);
                } else {
                    store.loadCashier();
                }

                if (window.KitaPOS && window.KitaPOS.outlet) {
                    store.setOutle(window.KitaPOS.outlet.name, window.KitaPOS.outlet.address);
                }
                store.init();

                setTimeout(function() {
                    if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
                        $('.select2-custom').select2({ theme: 'bootstrap-5', width: '100%', dropdownAutoWidth: true });
                        
                        $('#paymentMethod').on('change', function(e) {
                            var s = Alpine.store('pos');
                            s.paymentMethod = e.target.value;
                            s.handlePaymentMethodChange();
                        });
                        $('#manualCategory').on('change', function(e) {
                            var s = Alpine.store('pos');
                            s.newItem.category = e.target.value;
                            s.onCategoryChange();
                        });
                        $('#manualStatus').on('change', function(e) {
                            var s = Alpine.store('pos');
                            s.newItem.status = e.target.value;
                        });
                    }
                }, 100);
            }
        };
    });

    console.log('✅ KitaPOS with Alpine.js ready! (Multi-session draft)');
});