// ================================================================
// assets/js/script.js - KitaPOS with Alpine.js (Refactored)
// Multiple Draft Sessions (Dine In / Take Away)
// ================================================================

document.addEventListener('alpine:init', () => {

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
            let items = this.menuItems;
            if (this.currentCategory !== 'all') {
                items = items.filter(item => item.category === this.currentCategory);
            }
            if (this.searchQuery.trim()) {
                const q = this.searchQuery.trim().toLowerCase();
                items = items.filter(item => item.name.toLowerCase().includes(q));
            }
            return items;
        },

        // ---- DRAFT (sessions) helpers ----
        getTotalSessionsCount() {
            return this.sessions.reduce((sum, s) => sum + s.items.reduce((acc, i) => acc + i.qty, 0), 0);
        },
        getTotalSessionsTotal() {
            return this.sessions.reduce((sum, s) => sum + this.getSessionTotal(s.id), 0);
        },
        getSessionTotal(sessionId) {
            const session = this.sessions.find(s => s.id === sessionId);
            if (!session) return 0;
            return session.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        },
        getDraftQty(id) {
            const session = this.sessions.find(s => s.id === this.activeSessionId);
            if (!session) return 0;
            const item = session.items.find(i => i.id === id);
            return item ? item.qty : 0;
        },
        getDisplayDraftQty(id) {
            const qty = this.getDraftQty(id);
            return qty > 0 ? qty : 1;
        },

        getCartQty(id) {
            const item = this.cart.find(c => c.id === id);
            return item ? item.qty : 0;
        },
        getDisplayQty(id) {
            const qty = this.getCartQty(id);
            return qty > 0 ? qty : 1;
        },

        // ---- CASHIER ----
        setCashier(name, online = true) {
            this.cashierName = name || 'Guest';
            this.isCashierOnline = online;
            localStorage.setItem('cashierName', this.cashierName);
            localStorage.setItem('isCashierOnline', JSON.stringify(this.isCashierOnline));
        },
        loadCashier() {
            const name = localStorage.getItem('cashierName');
            const online = localStorage.getItem('isCashierOnline');
            if (name) this.cashierName = name;
            if (online !== null) this.isCashierOnline = JSON.parse(online);
        },

        // ---- INIT ----
        init() {
            try {
                this.loadCashier();
                const storedOB = localStorage.getItem('openingBalance');
                this.openingBalance = storedOB !== null ? parseInt(storedOB, 10) || 0 : 150000;
                localStorage.setItem('openingBalance', this.openingBalance.toString());

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

                const storedHistory = localStorage.getItem('transactionHistory');
                if (storedHistory) {
                    this.transactionHistory = JSON.parse(storedHistory);
                }
                const savedSize = localStorage.getItem('defaultPrinterSize');
                this.defaultPrinterSize = savedSize || '58mm';
                localStorage.setItem('defaultPrinterSize', this.defaultPrinterSize);

                this.toast = new bootstrap.Toast(document.getElementById('liveToast'), { delay: 2500 });
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
        saveOpeningBalance(value) {
            this.openingBalance = value;
            localStorage.setItem('openingBalance', value.toString());
        },
        saveTransactionHistory() {
            localStorage.setItem('transactionHistory', JSON.stringify(this.transactionHistory));
        },
        saveTransaction(method, total, paid, change, items, discountAmt, discountType, discountValue, subtotal) {
            const now = new Date();
            const timestamp = this.formatTanggalIndonesia(now);
            const transaction = {
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
        showToast(msg) {
            this.toastMessage = msg;
            if (this.toast) this.toast.show();
        },

        // ---- HELPERS ----
        formatRupiah(angka) {
            if (!angka && angka !== 0) return '';
            return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },
        formatPriceInput(event) {
            let value = event.target.value.replace(/\D/g, '');
            if (value === '') {
                event.target.value = '';
                return;
            }
            let number = parseInt(value, 10);
            if (isNaN(number)) {
                event.target.value = '';
                return;
            }
            event.target.value = this.formatRupiah(number);
        },
        parseRupiah(str) {
            if (!str) return 0;
            return parseInt(str.replace(/\D/g, ''), 10) || 0;
        },
        formatTanggalIndonesia(date) {
            const month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            return `${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()} ${hour}:${minute}`;
        },
        formatReceiptLine(leftText, rightText, is80mm = false) {
            const lineLength = is80mm ? 48 : 32;
            let left = leftText.toString();
            let right = rightText.toString();
            let spaceLength = lineLength - left.length - right.length;
            if (spaceLength < 1) {
                left = left.substring(0, lineLength - right.length - 2) + '..';
                spaceLength = 0;
            }
            return left + ' '.repeat(spaceLength) + right;
        },

        // ---- UI NAVIGATION ----
        goHome() {
            this.currentCategory = 'all';
            this.searchQuery = '';
            document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.showToast('🏠 Returned to main menu');
        },
        openCalculator() {
            new bootstrap.Modal(document.getElementById('calcModal')).show();
        },
        openHistory() {
            new bootstrap.Modal(document.getElementById('historyModal')).show();
        },
        toggleMobileCart() {
            this.mobileCartOpen = !this.mobileCartOpen;
        },
        closeMobileCart() {
            this.mobileCartOpen = false;
        },

        // ---- SESSION MANAGEMENT ----
        openNewSessionModal() {
            this.newSessionType = 'dinein';
            this.newSessionTable = '';
            new bootstrap.Modal(document.getElementById('newSessionModal')).show();
        },
        createNewSession() {
            const type = this.newSessionType;
            const table = this.newSessionTable ? parseInt(this.newSessionTable, 10) : null;
            let name = '';
            if (type === 'dinein') {
                if (!table || table < 1) {
                    this.showToast('❌ Masukkan nomor meja yang valid');
                    return;
                }
                name = 'Meja ' + table;
            } else {
                name = 'Take Away';
            }
            const session = {
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
            bootstrap.Modal.getInstance(document.getElementById('newSessionModal')).hide();
            this.showToast('✅ Pesanan baru dibuat: ' + name);
        },
        setActiveSession(id) {
            this.activeSessionId = id;
            this.showToast('🔁 Session aktif: ' + this.sessions.find(s => s.id === id)?.name);
        },
        removeSession(id) {
            if (confirm('Hapus session ini?')) {
                this.sessions = this.sessions.filter(s => s.id !== id);
                if (this.activeSessionId === id) {
                    this.activeSessionId = this.sessions.length > 0 ? this.sessions[0].id : null;
                }
                this.showToast('🗑️ Session dihapus');
            }
        },

        // ---- SESSION DETAIL MODAL ----
        openSessionDetailModal(sessionId) {
            const session = this.sessions.find(s => s.id === sessionId);
            if (!session) {
                this.showToast('❌ Session tidak ditemukan');
                return;
            }
            this.selectedSession = session;
            const modal = new bootstrap.Modal(document.getElementById('sessionDetailModal'));
            modal.show();
        },

        // ---- DRAFT (session) ITEMS ----
        incrementDraftQty(id) {
            if (!this.activeSessionId) {
                this.showToast('❌ Buat pesanan baru terlebih dahulu!');
                this.openNewSessionModal();
                return;
            }
            const session = this.sessions.find(s => s.id === this.activeSessionId);
            if (!session) return;
            const menuItem = this.menuItems.find(i => i.id === id);
            if (!menuItem) return;
            if (menuItem.status === 'out') {
                this.showToast('❌ ' + menuItem.name + ' habis!');
                return;
            }
            const existing = session.items.find(i => i.id === id);
            if (existing) {
                existing.qty += 1;
            } else {
                session.items.push({ ...menuItem, qty: 1 });
            }
            this.showToast('📝 ' + menuItem.name + ' ditambahkan ke ' + session.name);
        },
        decrementDraftQty(id) {
            const session = this.sessions.find(s => s.id === this.activeSessionId);
            if (!session) return;
            const idx = session.items.findIndex(i => i.id === id);
            if (idx === -1) return;
            if (session.items[idx].qty > 1) {
                session.items[idx].qty -= 1;
            } else {
                session.items.splice(idx, 1);
            }
        },
        updateDraftQtyFromInput(id, event) {
            const val = parseInt(event.target.value, 10);
            if (isNaN(val) || val < 0) {
                event.target.value = this.getDisplayDraftQty(id);
                return;
            }
            const session = this.sessions.find(s => s.id === this.activeSessionId);
            if (!session) {
                event.target.value = 1;
                return;
            }
            const idx = session.items.findIndex(i => i.id === id);
            if (idx === -1) {
                if (val > 0) {
                    const menuItem = this.menuItems.find(i => i.id === id);
                    if (menuItem && menuItem.status !== 'out') {
                        session.items.push({ ...menuItem, qty: val });
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
                const menuItem = this.menuItems.find(i => i.id === id);
                if (menuItem && menuItem.status === 'out') {
                    this.showToast('❌ ' + menuItem.name + ' habis!');
                    event.target.value = this.getDisplayDraftQty(id);
                    return;
                }
                session.items[idx].qty = val;
            }
        },

        // ---- CONFIRM SESSION TO CART ----
        confirmSessionToCart(sessionId) {
            const session = this.sessions.find(s => s.id === sessionId);
            if (!session || session.items.length === 0) {
                this.showToast('❌ Session kosong!');
                return;
            }
            // Merge items into cart
            session.items.forEach(item => {
                const existing = this.cart.find(c => c.id === item.id);
                if (existing) {
                    existing.qty += item.qty;
                } else {
                    this.cart.push({ ...item });
                }
            });
            // Remove session
            this.sessions = this.sessions.filter(s => s.id !== sessionId);
            if (this.activeSessionId === sessionId) {
                this.activeSessionId = this.sessions.length > 0 ? this.sessions[0].id : null;
            }
            // Close modal if open
            const detailModal = bootstrap.Modal.getInstance(document.getElementById('sessionDetailModal'));
            if (detailModal) detailModal.hide();
            this.showToast('🛒 ' + session.name + ' dilanjutkan ke Keranjang!');
        },

        // ---- CART OPERATIONS ----
        incrementQty(id) {
            const existing = this.cart.find(c => c.id === id);
            if (existing) {
                const menuItem = this.menuItems.find(i => i.id === id);
                if (menuItem && menuItem.status === 'out') {
                    this.showToast('❌ ' + menuItem.name + ' habis!');
                    return;
                }
                existing.qty += 1;
            } else {
                this.showToast('❌ Item tidak ada di keranjang.');
            }
        },
        decrementQty(id) {
            const idx = this.cart.findIndex(c => c.id === id);
            if (idx === -1) return;
            if (this.cart[idx].qty > 1) {
                this.cart[idx].qty -= 1;
            } else {
                this.cart.splice(idx, 1);
            }
        },
        updateQtyFromInput(id, event) {
            const val = parseInt(event.target.value, 10);
            if (isNaN(val) || val < 0) {
                event.target.value = this.getDisplayQty(id);
                return;
            }
            const idx = this.cart.findIndex(c => c.id === id);
            if (idx === -1) {
                event.target.value = this.getDisplayQty(id);
                this.showToast('❌ Item tidak ada di keranjang.');
                return;
            }
            if (val === 0) {
                this.cart.splice(idx, 1);
            } else {
                const menuItem = this.menuItems.find(i => i.id === id);
                if (menuItem && menuItem.status === 'out') {
                    this.showToast('❌ ' + menuItem.name + ' habis!');
                    event.target.value = this.getDisplayQty(id);
                    return;
                }
                this.cart[idx].qty = val;
            }
        },
        resetTo(id, targetQty) {
            const item = this.cart.find(c => c.id === id);
            if (item && item.qty > targetQty) {
                item.qty = targetQty;
                this.showToast('✅ Qty reset to ' + targetQty);
            }
        },

        // ---- MENU MANAGEMENT ----
        openAddMenu(category = 'food') {
            this.newItem = { name: '', price: '', category: category, status: 'available', icon: category === 'additional' ? '➕' : '🍽️', imagePreview: null, imageData: null };
            setTimeout(() => {
                $('#manualCategory').val(category).trigger('change.select2');
                $('#manualStatus').val('available').trigger('change.select2');
            }, 50);
            new bootstrap.Modal(document.getElementById('addItemModal')).show();
        },
        onCategoryChange() {
            if (this.newItem.category === 'additional') {
                this.newItem.status = 'available';
                this.newItem.icon = '➕';
            } else if (!this.newItem.icon || this.newItem.icon === '➕') {
                this.newItem.icon = '🍽️';
            }
        },
        saveNewItem() {
            const item = {
                id: this.nextId++,
                name: this.newItem.name.trim(),
                price: parseInt(this.newItem.price.replace(/\D/g, ''), 10) || 0,
                category: this.newItem.category,
                status: this.newItem.status,
                icon: this.newItem.icon || '🍽️'
            };
            this.menuItems.push(item);
            bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
            this.showToast('✅ Menu "' + item.name + '" added successfully!');
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) { this.newItem.imagePreview = null; this.newItem.imageData = null; return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                this.newItem.imagePreview = e.target.result;
                this.newItem.imageData = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        handleEditImageUpload(event) {
            const file = event.target.files[0];
            if (!file) { this.editItem.imagePreview = null; this.editItem.imageData = null; return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                this.editItem.imagePreview = e.target.result;
                this.editItem.imageData = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        openEditMenu(id) {
            const item = this.menuItems.find(i => i.id === id);
            if (!item) { this.showToast('❌ Menu not found!'); return; }
            this.editItemId = id;
            this.editItem = { ...item, price: this.formatRupiah(item.price), imagePreview: item.image || null, imageData: null };
            const fileInput = document.getElementById('editImage');
            if (fileInput) fileInput.value = '';
            const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
            modal.show();
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
                $('#editCategory').on('change', (e) => { this.editItem.category = e.target.value; });
                $('#editStatus').on('change', (e) => { this.editItem.status = e.target.value; });
                $('#editCategory').val(this.editItem.category).trigger('change.select2');
                $('#editStatus').val(this.editItem.status).trigger('change.select2');
            }, 100);
        },
        saveEditItem() {
            const id = this.editItemId;
            if (id === null || id === undefined) { this.showToast('❌ No item selected to edit!'); return; }
            const index = this.menuItems.findIndex(i => i.id === id);
            if (index === -1) { this.showToast('❌ Menu not found!'); return; }
            const name = this.editItem.name.trim();
            const rawPrice = this.editItem.price.replace(/\D/g, '');
            const price = parseInt(rawPrice, 10) || 0;
            if (!name) { this.showToast('❌ Menu name is required!'); return; }
            if (price <= 0) { this.showToast('❌ Price must be a positive number!'); return; }
            this.menuItems[index] = {
                ...this.menuItems[index],
                name: name,
                price: price,
                category: this.editItem.category,
                status: this.editItem.status,
                icon: this.editItem.icon || '🍽️',
                image: this.editItem.imageData || this.menuItems[index].image
            };
            // Update sessions & cart
            this.sessions.forEach(session => {
                session.items.forEach(item => {
                    if (item.id === id) {
                        item.name = name;
                        item.price = price;
                        item.icon = this.editItem.icon || '🍽️';
                    }
                });
            });
            this.cart.forEach(item => {
                if (item.id === id) {
                    item.name = name;
                    item.price = price;
                    item.icon = this.editItem.icon || '🍽️';
                }
            });
            bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
            this.editItemId = null;
            this.editItem = { name: '', price: '', category: 'food', status: 'available', icon: '🍽️', imagePreview: null, imageData: null };
            this.showToast('✅ Menu "' + name + '" updated successfully!');
        },

        // ---- OPENING BALANCE ----
        openEditOpeningBalance() {
            this.editOpeningBalance = this.formatRupiah(this.openingBalance);
            new bootstrap.Modal(document.getElementById('editOpeningBalanceModal')).show();
        },
        saveOpeningBalance() {
            this.openingBalance = parseInt(this.editOpeningBalance.replace(/\D/g, ''), 10) || 0;
            this.saveOpeningBalance(this.openingBalance);
            bootstrap.Modal.getInstance(document.getElementById('editOpeningBalanceModal')).hide();
        },

        // ---- CHECKOUT ----
        openCheckout() {
            if (this.cart.length === 0) return;
            this.paymentMethod = 'cash';
            this.paymentAmount = '';
            this.paymentAmountRaw = 0;
            this.changeAmount = 0;
            this.discountType = 'rp';
            this.discountValue = 0;
            this.discountDisplay = '0';
            setTimeout(() => {
                $('#paymentMethod').val('cash').trigger('change.select2');
            }, 50);
            this.handlePaymentMethodChange();
            new bootstrap.Modal(document.getElementById('checkoutModal')).show();
        },
        setQuickPay(val) {
            this.paymentAmountRaw = val;
            this.paymentAmount = this.formatRupiah(val);
            this.updateChange();
        },
        updateChange() {
            try {
                if (this.paymentMethod === 'cash') {
                    // Format payment amount display
                    if (this.paymentAmount) {
                        const raw = this.parseRupiah(this.paymentAmount);
                        this.paymentAmountRaw = raw;
                        // Re-format display with thousand separator
                        if (raw > 0) {
                            this.paymentAmount = this.formatRupiah(raw);
                        }
                    }
                    const total = this.discountedTotal;
                    this.changeAmount = this.paymentAmountRaw - total;
                } else {
                    const total = this.discountedTotal;
                    this.paymentAmount = this.formatRupiah(total);
                    this.paymentAmountRaw = total;
                    this.changeAmount = 0;
                }
            } catch (error) {
                console.error('Error in updateChange:', error);
            }
        },
        handlePaymentMethodChange() {
            try {
                if (this.paymentMethod === 'qris') {
                    const total = this.discountedTotal;
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
        confirmCheckout() {
            try {
                const total = this.discountedTotal;
                const method = this.paymentMethod;
                let paid = this.paymentAmountRaw;
                if (method === 'cash') {
                    if (paid < total) {
                        this.showToast('❌ Payment insufficient!');
                        return;
                    }
                    const change = paid - total;
                    const items = this.cart.map(item => ({
                        name: item.name,
                        qty: item.qty,
                        price: item.price,
                        subtotal: item.price * item.qty
                    }));
                    const transaction = this.saveTransaction('Cash', total, paid, change, items, this.discountAmount, this.discountType, this.discountValue, this.cartTotal);
                    this.showToast('✅ Checkout successful!');
                    this.printStrukMobile(transaction);
                } else {
                    paid = total;
                    this.paymentAmount = this.formatRupiah(paid);
                    this.paymentAmountRaw = paid;
                    const items = this.cart.map(item => ({
                        name: item.name,
                        qty: item.qty,
                        price: item.price,
                        subtotal: item.price * item.qty
                    }));
                    const transaction = this.saveTransaction('QRIS', total, paid, 0, items, this.discountAmount, this.discountType, this.discountValue, this.cartTotal);
                    this.showToast('✅ Checkout successful! Method: QRIS.');
                    this.printStrukMobile(transaction);
                }
                this.cart = [];
                this.mobileCartOpen = false;
                bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
            } catch (error) {
                console.error('Error in confirmCheckout:', error);
                this.showToast('❌ Checkout failed!');
            }
        },
        updateDiscount(event) {
            let raw = event.target.value.replace(/\D/g, '');
            if (this.discountType === 'rp') {
                const val = parseInt(raw, 10) || 0;
                this.discountValue = val;
                this.discountDisplay = this.formatRupiah(val);
                event.target.value = this.formatRupiah(val);
            } else {
                let pct = parseInt(raw, 10) || 0;
                if (pct > 100) pct = 100;
                this.discountValue = pct;
                this.discountDisplay = pct.toString();
                event.target.value = pct.toString();
            }
            this.updateChange();
        },
        reformatDiscountDisplay() {
            if (this.discountType === 'rp') {
                this.discountDisplay = this.formatRupiah(this.discountValue);
            } else {
                this.discountDisplay = this.discountValue.toString();
            }
            this.updateChange();
        },

        // ---- COMPUTED for cart/discount ----
        get cartTotal() {
            return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        },
        get cartCount() {
            return this.cart.reduce((sum, item) => sum + item.qty, 0);
        },
        get discountAmount() {
            const total = this.cartTotal;
            if (this.discountType === 'rp') {
                const val = this.discountValue || 0;
                return Math.min(val, total);
            } else if (this.discountType === 'percent') {
                const pct = Math.min(this.discountValue || 0, 100);
                return total * pct / 100;
            }
            return 0;
        },
        get discountedTotal() {
            return Math.max(this.cartTotal - this.discountAmount, 0);
        },
        get quickPayOptions() {
            const total = this.discountedTotal;
            if (total <= 0) return [0];
            let end = 100000;
            if (total > 100000) {
                end = Math.ceil(total / 100000) * 100000;
                if (end <= total) end += 100000;
            }
            let down = Math.floor(total / 10000) * 10000;
            if (down === total) down = Math.max(0, down - 10000);
            if (total < 50000) down = 50000;
            if (down <= 0) down = 10000;
            let up = Math.ceil(total / 10000) * 10000;
            if (up === total) up = up + 10000;
            if (total < 50000) up = Math.max(down + 10000, 60000);
            if (up <= down) up = down + 10000;
            if (total <= 100000 && up >= end) up = Math.min(end - 10000, Math.ceil((total + end) / 2) / 10000 * 10000);
            if (up <= down) up = down + 10000;
            let others = [down, up, end].filter(v => v > 0 && v !== total);
            others = [...new Set(others)].sort((a, b) => a - b);
            let options = [total, ...others];
            const endIndex = options.indexOf(end);
            if (endIndex !== -1 && endIndex !== options.length - 1) {
                options.splice(endIndex, 1);
                options.push(end);
            }
            return options;
        },

        // ---- HISTORY ----
        deleteTransaction(id) {
            if (confirm('Delete transaction #' + id + '?')) {
                this.transactionHistory = this.transactionHistory.filter(trx => trx.id !== id);
                this.transactionHistory.forEach((trx, index) => trx.id = index + 1);
                this.saveTransactionHistory();
                this.showToast('🗑️ Deleted');
            }
        },
        clearAllTransactions() {
            if (confirm('⚠️ Clear ALL?')) {
                this.transactionHistory = [];
                this.saveTransactionHistory();
                this.showToast('🗑️ All cleared');
            }
        },

        // ---- PRINTER ----
        applyPrinterSize() {
            localStorage.setItem('defaultPrinterSize', this.defaultPrinterSize);
            this.showToast('⚙️ Printer setting: ' + this.defaultPrinterSize);
        },
        setOutle(name, address) {
            this.outletName = name || 'My Fried Chicken';
            this.outletAddress = address || 'Pusat';
        },

        // ---- PRINT ----
        printStrukMobile(transaction) {
            if (!transaction || !transaction.items || transaction.items.length === 0) {
                this.showToast('❌ No transaction data to print!');
                return;
            }
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                this.printStrukWebBluetoothiOS(transaction);
            } else if (/android/i.test(userAgent)) {
                this.printStrukRawBT(transaction);
            } else {
                this.printStrukBrowser(transaction);
            }
        },
        printStrukRawBT(transaction) {
            try {
                const is80mm = this.defaultPrinterSize === '80mm';
                const maxWidth = is80mm ? 48 : 32;
                const encoder = new EscPosEncoder();
                let receipt = encoder.initialize();
                receipt.align('center')
                    .bold(true).text(this.outletName).newline().bold(false)
                    .text(this.outletAddress).newline()
                    .line('-'.repeat(maxWidth));
                receipt.align('left')
                    .text(`Kasir : ${this.cashierName}`).newline()
                    .text(`Waktu : ${this.formatTanggalIndonesia(transaction.timestamp)}`).newline()
                    .text(`No. Struk : #${transaction.id}`).newline()
                    .text(`Bayar : ${transaction.method === 'Cash' ? 'Tunai' : 'QRIS'}`).newline()
                    .line('-'.repeat(maxWidth));
                receipt.align('center')
                    .bold(true).text('LUNAS').newline().bold(false)
                    .line('-'.repeat(maxWidth));
                receipt.align('left')
                    .text('Item'.padEnd(20) + 'Qty'.padStart(6) + 'Total'.padStart(14)).newline()
                    .line('-'.repeat(maxWidth));
                transaction.items.forEach(item => {
                    const name = item.name.substring(0, 20);
                    const qtyStr = item.qty.toString();
                    const subtotalStr = 'Rp' + this.formatRupiah(item.subtotal);
                    const line = name.padEnd(20) + qtyStr.padStart(6) + subtotalStr.padStart(14);
                    receipt.text(line).newline();
                });
                receipt.line('-'.repeat(maxWidth));
                const subtotalStr = 'Rp' + this.formatRupiah(transaction.subtotal);
                receipt.align('right')
                    .text(`Subtotal : ${subtotalStr}`).newline();
                if (transaction.discount && transaction.discount > 0) {
                    const diskonStr = '-Rp' + this.formatRupiah(transaction.discount);
                    receipt.text(`Diskon : ${diskonStr}`).newline();
                }
                const totalQty = transaction.items.reduce((sum, item) => sum + item.qty, 0);
                const totalStr = 'Rp' + this.formatRupiah(transaction.total);
                receipt.bold(true)
                    .text(`Total (${totalQty}) : ${totalStr}`).newline()
                    .bold(false)
                    .line('-'.repeat(maxWidth));
                receipt.text(`Bayar : Rp${this.formatRupiah(transaction.paid)}`).newline()
                    .text(`Kembali : Rp${this.formatRupiah(transaction.change)}`).newline()
                    .line('-'.repeat(maxWidth));
                receipt.align('center')
                    .text('Powered by KitaPOS').newline()
                    .text('Terima kasih').newline()
                    .newline().newline().newline();
                const resultData = receipt.encode();
                let binary = '';
                resultData.forEach(b => binary += String.fromCharCode(b));
                window.location.href = "rawbt:base64," + btoa(binary);
            } catch (error) {
                this.showToast('⚠️ RawBT failed, switching to normal print');
                this.printStrukBrowser(transaction);
            }
        },
        async printStrukWebBluetoothiOS(transaction) {
            if (!navigator.bluetooth) {
                alert("⚠️ iOS BLOCKED!\nOpen KitaPOS using 'Bluefy' browser.");
                return;
            }
            try {
                const is80mm = this.defaultPrinterSize === '80mm';
                const device = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2', '49535343-fe7d-4ae5-8fa9-9fafd205e455']
                });
                const server = await device.gatt.connect();
                const services = await server.getPrimaryServices();
                const characteristics = await services[0].getCharacteristics();
                const characteristic = characteristics.find(c => c.properties.write || c.properties.writeWithoutResponse);
                const encoder = new EscPosEncoder();
                let receipt = encoder.initialize()
                    .align('center')
                    .bold(true).text('KITA POS - PUSAT').newline().bold(false)
                    .line('-'.repeat(is80mm ? 48 : 32))
                    .align('left');
                transaction.items.forEach(item => {
                    const leftStr = `  ${item.qty} x ${this.formatRupiah(item.price)}`;
                    const rightStr = this.formatRupiah(item.subtotal);
                    receipt.text(item.name).newline();
                    receipt.text(this.formatReceiptLine(leftStr, rightStr, is80mm)).newline();
                });
                if (transaction.discount && transaction.discount > 0) {
                    receipt.line('-'.repeat(is80mm ? 48 : 32))
                        .text(this.formatReceiptLine('Diskon', '-Rp ' + this.formatRupiah(transaction.discount), is80mm)).newline();
                }
                receipt.line('-'.repeat(is80mm ? 48 : 32))
                    .text(this.formatReceiptLine('TOTAL', 'Rp ' + this.formatRupiah(transaction.total), is80mm)).newline()
                    .newline().newline().newline();
                const resultData = receipt.encode();
                for (let i = 0; i < resultData.length; i += 50) {
                    await characteristic.writeValue(resultData.slice(i, i + 50));
                    await new Promise(r => setTimeout(r, 20));
                }
                device.gatt.disconnect();
                this.showToast('🖨️ Printed from iPhone!');
            } catch (error) {
                this.showToast('⚠️ Bluetooth failed. Switching to normal print...');
                this.printStrukBrowser(transaction);
            }
        },
        printStrukBrowser(transaction) {
            if (!transaction || !transaction.items || transaction.items.length === 0) return;
            let style = document.getElementById('printPageStyle');
            if (!style) {
                style = document.createElement('style');
                style.id = 'printPageStyle';
                document.head.appendChild(style);
            }
            const paperSize = this.defaultPrinterSize;
            style.innerHTML = `
                @media print {
                    @page { size: ${paperSize} auto; margin: 0; }
                    * { box-sizing: border-box; }
                    body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
                    #strukContainer {
                        display: block !important;
                        width: ${paperSize} !important;
                        max-width: ${paperSize} !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: #fff !important;
                        overflow: hidden !important;
                    }
                    .struk-content {
                        width: ${paperSize} !important;
                        max-width: ${paperSize} !important;
                        margin: 0 auto !important;
                        padding: 2mm 2mm !important;
                        background: #fff !important;
                        font-size: ${paperSize === '58mm' ? '8px' : '12px'} !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        page-break-after: avoid !important;
                    }
                    .struk-content.paper-58mm, .struk-content.paper-80mm {
                        width: ${paperSize} !important;
                        max-width: ${paperSize} !important;
                    }
                    html, body { margin: 0 !important; padding: 0 !important; }
                    body > *:not(#strukContainer) { display: none !important; }
                }
            `;
            const totalQty = transaction.items.reduce((sum, item) => sum + item.qty, 0);
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
            const container = document.getElementById('strukContainer');
            container.style.display = 'block';
            setTimeout(() => window.print(), 400);
            window.onafterprint = () => {
                container.style.display = 'none';
                window.onafterprint = null;
            };
        },

        // ---- CALCULATOR ----
        calcAppend(val) { this.calcExpression += val; this.updateCalcDisplay(); },
        calcClear() { this.calcExpression = ''; this.updateCalcDisplay(); },
        calcBackspace() { this.calcExpression = this.calcExpression.slice(0, -1); this.updateCalcDisplay(); },
        calcEvaluate() {
            try {
                this.calcExpression = eval(this.calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')).toString();
            } catch {
                this.calcExpression = 'Error';
                setTimeout(() => this.calcClear(), 800);
            }
            this.updateCalcDisplay();
        },
        updateCalcDisplay() { this.calcDisplay = this.calcExpression || '0'; },

        // ---- FILTER ----
        setCategory(cat) { this.currentCategory = cat; },
        filterMenu() { }
    });

    // ===== UI COMPONENTS =====
    Alpine.data('navbarComponent', () => ({}));
    Alpine.data('menuGridComponent', () => ({
        init() {
            this.$nextTick(() => {
                this.$store.pos.menuItems.forEach(item => {
                    if (item.category !== 'additional') {
                        this.fetchPexelsImage(item);
                    }
                });
            });
        },
        async fetchPexelsImage(item) {
            if (item.image) return;
            const apiKey = window._env?.PEXELS_API_KEY;
            if (!apiKey) {
                console.warn('Pexels API key not found, using fallback.');
                return;
            }
            const query = encodeURIComponent(item.name);
            const url = `https://api.pexels.com/v1/search?query=${query}`;
            try {
                const response = await fetch(url, { headers: { 'Authorization': apiKey } });
                const data = await response.json();
                if (data.photos && data.photos.length > 0) {
                    item.image = data.photos[0].src.medium;
                } else {
                    item.image = null;
                }
            } catch (error) {
                console.error('Pexels fetch error:', error);
                item.image = null;
            }
        }
    }));
    
    // Draft Sessions Component
    Alpine.data('draftSessionsComponent', () => ({}));
    
    Alpine.data('cartSidebarComponent', () => ({}));
    Alpine.data('mobileCartComponent', () => ({}));
    Alpine.data('checkoutComponent', () => ({}));
    Alpine.data('historyComponent', () => ({}));
    Alpine.data('calculatorComponent', () => ({}));
    Alpine.data('addEditMenuComponent', () => ({}));

    // ===== ROOT =====
    Alpine.data('posApp', () => ({
        init() {
            const store = Alpine.store('pos');

            // ===== SET CASHIER BASED ON TIME =====
            const currentHour = new Date().getHours();
            let cashierName = "May";

            if (currentHour >= 7 && currentHour < 15) {
                cashierName = "May";
            } else if (currentHour >= 15 && currentHour <= 23) {
                cashierName = "Lusiana";
            } else {
                cashierName = "Guest";
            }

            store.setCashier(cashierName, true);

            if (window.KitaPOS?.user) {
                store.setCashier(window.KitaPOS.user.name, window.KitaPOS.user.isOnline);
            } else {
                store.loadCashier();
            }

            if (window.KitaPOS?.outlet) {
                store.setOutle(window.KitaPOS.outlet.name, window.KitaPOS.outlet.address);
            }
            store.init();

            setTimeout(() => {
                $('.select2-custom').select2({ theme: 'default', width: '100%', dropdownAutoWidth: true });
                $('#paymentMethod').on('change', (e) => {
                    const s = Alpine.store('pos');
                    s.paymentMethod = e.target.value;
                    s.handlePaymentMethodChange();
                });
                $('#manualCategory').on('change', (e) => {
                    const s = Alpine.store('pos');
                    s.newItem.category = e.target.value;
                    s.onCategoryChange();
                });
                $('#manualStatus').on('change', (e) => {
                    const s = Alpine.store('pos');
                    s.newItem.status = e.target.value;
                });
            }, 100);
        }
    }));

    console.log('✅ KitaPOS with Alpine.js ready! (Multi-session draft)');
});