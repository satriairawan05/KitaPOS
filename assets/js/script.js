// ================================================================
// assets/js/script.js - KitaPOS with Alpine.js (Refactored)
// Each component has its own logic, store for shared data only
// ================================================================

document.addEventListener('alpine:init', () => {

    // ================================================================
    // 1. ALPINE STORE - Shared State Only
    // ================================================================
    Alpine.store('pos', {
        // ---- SHARED STATE ----
        menuItems: [],
        nextId: 1,
        openingBalance: 0,
        cart: [],
        transactionHistory: [],
        currentCategory: 'all',
        searchQuery: '',
        mobileCartOpen: false,
        toastMessage: 'Notification',

        // Calculator state
        calcExpression: '',
        calcDisplay: '0',

        // New/Edit item state
        newItem: { name: '', price: '', category: 'food', status: 'available', icon: '🍽️', imagePreview: null, imageData: null },
        editItemId: null,
        editItem: { name: '', price: '', category: 'food', status: 'available', icon: '🍽️', imagePreview: null, imageData: null },
        editOpeningBalance: '',

        // Checkout state
        paymentMethod: 'cash',
        paymentAmount: '',
        paymentAmountRaw: 0,
        changeAmount: 0,
        discountType: 'rp',
        discountValue: 0,
        discountDisplay: '0',

        // Printer & Cashier
        defaultPrinterSize: '58mm',
        cashierName: 'May',
        strukData: { id: '', timestamp: '', items: [], total: 0, totalQty: 0, paid: 0, change: 0, method: 'Cash', discount: 0, subtotal: 0 },

        toast: null,

        // ---- COMPUTED (shared) ----
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
        get cartCount() {
            return this.cart.reduce((sum, item) => sum + item.qty, 0);
        },
        get cartTotal() {
            return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        },
        get totalTransactions() {
            return this.transactionHistory.reduce((sum, trx) => sum + trx.total, 0);
        },
        get grandTotal() {
            return this.openingBalance + this.totalTransactions;
        },
        get footerYear() {
            const start = 2026;
            const now = new Date().getFullYear();
            return now === start ? start : start + ' - ' + now;
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
        get showMobileCart() {
            return window.innerWidth < 992 && this.cartCount > 0;
        },

        // ---- SHARED HELPERS (formatting) ----
        formatRupiah(angka) {
            if (!angka && angka !== 0) return '';
            return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },
        formatPriceInput(event) {
            let value = event.target.value.replace(/\D/g, '');
            if (value === '') { event.target.value = ''; return; }
            let number = parseInt(value, 10);
            if (isNaN(number)) { event.target.value = ''; return; }
            event.target.value = this.formatRupiah(number);
        },
        parseRupiah(str) { return parseInt(str.replace(/\D/g, ''), 10) || 0; },
        formatTanggalIndonesia(date) {
            const month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            return `${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()} ${hour}:${minute}`;
        },

        // ---- SHARED INIT ----
        init() {
            try {
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
                if (savedSize) {
                    this.defaultPrinterSize = savedSize;
                } else {
                    this.defaultPrinterSize = '58mm';
                    localStorage.setItem('defaultPrinterSize', '58mm');
                }

                this.toast = new bootstrap.Toast(document.getElementById('liveToast'), { delay: 2500 });

                console.log('✅ KitaPOS Store ready!');
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
            this.toast.show();
        }
    });

    // ================================================================
    // 2. NAVBAR COMPONENT
    // ================================================================
    Alpine.data('navbarComponent', () => ({
        init() {
            // No additional init needed
        },
        goHome() {
            const store = Alpine.store('pos');
            store.currentCategory = 'all';
            store.searchQuery = '';
            document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
            store.showToast('🏠 Returned to main menu');
        },
        openCalculator() {
            new bootstrap.Modal(document.getElementById('calcModal')).show();
        },
        openHistory() {
            new bootstrap.Modal(document.getElementById('historyModal')).show();
        },
        toggleMobileCart() {
            const store = Alpine.store('pos');
            store.mobileCartOpen = !store.mobileCartOpen;
        }
    }));

    // ================================================================
    // 3. MENU GRID COMPONENT
    // ================================================================
    Alpine.data('menuGridComponent', () => ({
        getCartQty(id) {
            const store = Alpine.store('pos');
            const item = store.cart.find(c => c.id === id);
            return item ? item.qty : 0;
        },
        getDisplayQty(id) {
            const qty = this.getCartQty(id);
            return qty > 0 ? qty : 1;
        },
        incrementQty(id) {
            const store = Alpine.store('pos');
            const menuItem = store.menuItems.find(i => i.id === id);
            if (!menuItem) return;
            if (menuItem.status === 'out') {
                store.showToast('❌ ' + menuItem.name + ' is out of stock!');
                return;
            }
            const existing = store.cart.find(c => c.id === id);
            if (existing) existing.qty += 1;
            else {
                store.cart.push({ ...menuItem, qty: 1 });
            }
        },
        decrementQty(id) {
            const store = Alpine.store('pos');
            const idx = store.cart.findIndex(c => c.id === id);
            if (idx === -1) return;
            if (store.cart[idx].qty > 1) store.cart[idx].qty -= 1;
            else store.cart.splice(idx, 1);
        },
        updateQtyFromInput(id, event) {
            const store = Alpine.store('pos');
            const val = parseInt(event.target.value, 10);
            if (isNaN(val) || val < 0) {
                event.target.value = this.getDisplayQty(id);
                return;
            }
            if (val === 0) {
                const idx = store.cart.findIndex(c => c.id === id);
                if (idx !== -1) store.cart.splice(idx, 1);
            } else {
                const existing = store.cart.find(c => c.id === id);
                if (existing) existing.qty = val;
                else {
                    const menuItem = store.menuItems.find(i => i.id === id);
                    if (menuItem) store.cart.push({ ...menuItem, qty: val });
                }
            }
        },
        openEditMenu(id) {
            const store = Alpine.store('pos');
            const item = store.menuItems.find(i => i.id === id);
            if (!item) {
                store.showToast('❌ Menu not found!');
                return;
            }
            store.editItemId = id;
            store.editItem = {
                ...item,
                price: store.formatRupiah(item.price),
                imagePreview: item.image || null,
                imageData: null
            };
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

                $('#editCategory').on('change', (e) => { store.editItem.category = e.target.value; });
                $('#editStatus').on('change', (e) => { store.editItem.status = e.target.value; });

                $('#editCategory').val(store.editItem.category).trigger('change.select2');
                $('#editStatus').val(store.editItem.status).trigger('change.select2');
            }, 100);
        },
        saveEditItem() {
            const store = Alpine.store('pos');
            const id = store.editItemId;
            if (id === null || id === undefined) {
                store.showToast('❌ No item selected to edit!');
                return;
            }
            const index = store.menuItems.findIndex(i => i.id === id);
            if (index === -1) {
                store.showToast('❌ Menu not found!');
                return;
            }

            const name = store.editItem.name.trim();
            const rawPrice = store.editItem.price.replace(/\D/g, '');
            const price = parseInt(rawPrice, 10) || 0;

            if (!name) {
                store.showToast('❌ Menu name is required!');
                return;
            }
            if (price <= 0) {
                store.showToast('❌ Price must be a positive number!');
                return;
            }

            store.menuItems[index] = {
                ...store.menuItems[index],
                name: name,
                price: price,
                category: store.editItem.category,
                status: store.editItem.status,
                icon: store.editItem.icon || '🍽️',
                image: store.editItem.imageData || store.menuItems[index].image
            };

            store.cart.forEach(cartItem => {
                if (cartItem.id === id) {
                    cartItem.name = name;
                    cartItem.price = price;
                    cartItem.icon = store.editItem.icon || '🍽️';
                }
            });

            bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();

            store.editItemId = null;
            store.editItem = { name: '', price: '', category: 'food', status: 'available', icon: '🍽️', imagePreview: null, imageData: null };

            store.showToast('✅ Menu "' + name + '" updated successfully!');
        }
    }));

    // ================================================================
    // 4. CART SIDEBAR COMPONENT
    // ================================================================
    Alpine.data('cartSidebarComponent', () => ({
        removeFromCart(id) {
            const store = Alpine.store('pos');
            const idx = store.cart.findIndex(c => c.id === id);
            if (idx === -1) return;
            if (store.cart[idx].qty > 1) store.cart[idx].qty -= 1;
            else store.cart.splice(idx, 1);
        },
        resetTo(id, targetQty) {
            const store = Alpine.store('pos');
            const item = store.cart.find(c => c.id === id);
            if (item && item.qty > targetQty) {
                item.qty = targetQty;
                store.showToast('✅ Qty reset to ' + targetQty);
            }
        },
        openCheckout() {
            const store = Alpine.store('pos');
            if (store.cart.length === 0) return;
            store.paymentMethod = 'cash';
            store.paymentAmount = '';
            store.paymentAmountRaw = 0;
            store.changeAmount = 0;
            store.discountType = 'rp';
            store.discountValue = 0;
            store.discountDisplay = '0';

            setTimeout(() => {
                $('#paymentMethod').val('cash').trigger('change.select2');
            }, 50);

            store.handlePaymentMethodChange();
            const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
            modal.show();
        },
        handlePaymentMethodChange() {
            const store = Alpine.store('pos');
            try {
                if (store.paymentMethod === 'qris') {
                    const total = store.discountedTotal;
                    store.paymentAmount = store.formatRupiah(total);
                    store.paymentAmountRaw = total;
                    store.changeAmount = 0;
                } else {
                    store.paymentAmount = '';
                    store.paymentAmountRaw = 0;
                    store.changeAmount = 0;
                }
            } catch (error) {
                console.error('Error in handlePaymentMethodChange:', error);
            }
        }
    }));

    // ================================================================
    // 5. MOBILE CART COMPONENT (similar to sidebar)
    // ================================================================
    Alpine.data('mobileCartComponent', () => ({
        removeFromCart(id) {
            const store = Alpine.store('pos');
            const idx = store.cart.findIndex(c => c.id === id);
            if (idx === -1) return;
            if (store.cart[idx].qty > 1) store.cart[idx].qty -= 1;
            else store.cart.splice(idx, 1);
        },
        resetTo(id, targetQty) {
            const store = Alpine.store('pos');
            const item = store.cart.find(c => c.id === id);
            if (item && item.qty > targetQty) {
                item.qty = targetQty;
                store.showToast('✅ Qty reset to ' + targetQty);
            }
        },
        openCheckout() {
            const store = Alpine.store('pos');
            if (store.cart.length === 0) return;
            store.paymentMethod = 'cash';
            store.paymentAmount = '';
            store.paymentAmountRaw = 0;
            store.changeAmount = 0;
            store.discountType = 'rp';
            store.discountValue = 0;
            store.discountDisplay = '0';

            setTimeout(() => {
                $('#paymentMethod').val('cash').trigger('change.select2');
            }, 50);

            store.handlePaymentMethodChange();
            const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
            modal.show();
        }
    }));

    // ================================================================
    // 6. CHECKOUT COMPONENT
    // ================================================================
    Alpine.data('checkoutComponent', () => ({
        setQuickPay(val) {
            const store = Alpine.store('pos');
            store.paymentAmountRaw = val;
            store.paymentAmount = store.formatRupiah(val);
            this.updateChange();
        },
        updateChange() {
            const store = Alpine.store('pos');
            try {
                if (store.paymentMethod === 'cash') {
                    const raw = store.parseRupiah(store.paymentAmount);
                    store.paymentAmountRaw = raw;
                    const total = store.discountedTotal;
                    store.changeAmount = raw - total;
                } else {
                    const total = store.discountedTotal;
                    store.paymentAmount = store.formatRupiah(total);
                    store.paymentAmountRaw = total;
                    store.changeAmount = 0;
                }
            } catch (error) {
                console.error('Error in updateChange:', error);
            }
        },
        confirmCheckout() {
            const store = Alpine.store('pos');
            try {
                const total = store.discountedTotal;
                const method = store.paymentMethod;
                let paid = store.paymentAmountRaw;
                if (method === 'cash') {
                    if (paid < total) {
                        store.showToast('❌ Payment insufficient!');
                        return;
                    }
                    const change = paid - total;
                    const items = store.cart.map(item => ({
                        name: item.name,
                        qty: item.qty,
                        price: item.price,
                        subtotal: item.price * item.qty
                    }));
                    const transaction = store.saveTransaction('Cash', total, paid, change, items, store.discountAmount, store.discountType, store.discountValue, store.cartTotal);
                    store.showToast('✅ Checkout successful!');
                    this.printStrukMobile(transaction);
                } else {
                    paid = total;
                    store.paymentAmount = store.formatRupiah(paid);
                    store.paymentAmountRaw = paid;
                    const items = store.cart.map(item => ({
                        name: item.name,
                        qty: item.qty,
                        price: item.price,
                        subtotal: item.price * item.qty
                    }));
                    const transaction = store.saveTransaction('QRIS', total, paid, 0, items, store.discountAmount, store.discountType, store.discountValue, store.cartTotal);
                    store.showToast('✅ Checkout successful! Method: QRIS.');
                    this.printStrukMobile(transaction);
                }
                store.cart = [];
                store.mobileCartOpen = false;
                bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
            } catch (error) {
                console.error('Error in confirmCheckout:', error);
                store.showToast('❌ Checkout failed!');
            }
        },
        printStrukMobile(transaction) {
            const store = Alpine.store('pos');
            if (!transaction || !transaction.items || transaction.items.length === 0) {
                store.showToast('❌ No transaction data to print!');
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
        // --- Print methods (keep from original) ---
        printStrukRawBT(transaction) {
            const store = Alpine.store('pos');
            try {
                const is80mm = store.defaultPrinterSize === '80mm';
                const encoder = new EscPosEncoder();
                let receipt = encoder.initialize();
                receipt.align('center')
                    .bold(true).text('KITA POS - PUSAT').newline().bold(false)
                    .text('Jl. Raya Sukses No. 123').newline()
                    .line('-'.repeat(is80mm ? 48 : 32))
                    .align('left')
                    .text(`Kasir : ${store.cashierName}`).newline()
                    .text(`No    : #${transaction.id}`).newline()
                    .line('-'.repeat(is80mm ? 48 : 32));

                transaction.items.forEach(item => {
                    const leftStr = `  ${item.qty} x ${store.formatRupiah(item.price)}`;
                    const rightStr = store.formatRupiah(item.subtotal);
                    receipt.text(item.name).newline();
                    receipt.text(store.formatReceiptLine(leftStr, rightStr, is80mm)).newline();
                });

                if (transaction.discount && transaction.discount > 0) {
                    receipt.line('-'.repeat(is80mm ? 48 : 32))
                        .text(store.formatReceiptLine('Diskon', '-Rp ' + store.formatRupiah(transaction.discount), is80mm)).newline();
                }

                receipt.line('-'.repeat(is80mm ? 48 : 32))
                    .text(store.formatReceiptLine('TOTAL', 'Rp ' + store.formatRupiah(transaction.total), is80mm)).newline()
                    .line('-'.repeat(is80mm ? 48 : 32))
                    .align('center').text('Terima kasih').newline()
                    .newline().newline().newline();

                const resultData = receipt.encode();
                let binary = '';
                resultData.forEach(b => binary += String.fromCharCode(b));
                window.location.href = "rawbt:base64," + btoa(binary);
            } catch (error) {
                store.showToast('⚠️ RawBT failed, switching to normal print');
                this.printStrukBrowser(transaction);
            }
        },
        async printStrukWebBluetoothiOS(transaction) {
            const store = Alpine.store('pos');
            if (!navigator.bluetooth) {
                alert("⚠️ iOS BLOCKED!\nOpen KitaPOS using 'Bluefy' browser.");
                return;
            }
            try {
                const is80mm = store.defaultPrinterSize === '80mm';
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
                    const leftStr = `  ${item.qty} x ${store.formatRupiah(item.price)}`;
                    const rightStr = store.formatRupiah(item.subtotal);
                    receipt.text(item.name).newline();
                    receipt.text(store.formatReceiptLine(leftStr, rightStr, is80mm)).newline();
                });

                if (transaction.discount && transaction.discount > 0) {
                    receipt.line('-'.repeat(is80mm ? 48 : 32))
                        .text(store.formatReceiptLine('Diskon', '-Rp ' + store.formatRupiah(transaction.discount), is80mm)).newline();
                }

                receipt.line('-'.repeat(is80mm ? 48 : 32))
                    .text(store.formatReceiptLine('TOTAL', 'Rp ' + store.formatRupiah(transaction.total), is80mm)).newline()
                    .newline().newline().newline();

                const resultData = receipt.encode();
                for (let i = 0; i < resultData.length; i += 50) {
                    await characteristic.writeValue(resultData.slice(i, i + 50));
                    await new Promise(r => setTimeout(r, 20));
                }
                device.gatt.disconnect();
                store.showToast('🖨️ Printed from iPhone!');
            } catch (error) {
                store.showToast('⚠️ Bluetooth failed. Switching to normal print...');
                this.printStrukBrowser(transaction);
            }
        },
        printStrukBrowser(transaction) {
            const store = Alpine.store('pos');
            if (!transaction || !transaction.items || transaction.items.length === 0) return;

            let style = document.getElementById('printPageStyle');
            if (!style) {
                style = document.createElement('style');
                style.id = 'printPageStyle';
                document.head.appendChild(style);
            }
            const paperSize = store.defaultPrinterSize;
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
                        font-size: ${paperSize === '58mm' ? '6px' : '11px'} !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        page-break-after: avoid !important;
                    }
                    .struk-content.paper-58mm,
                    .struk-content.paper-80mm {
                        width: ${paperSize} !important;
                        max-width: ${paperSize} !important;
                    }
                    html, body { margin: 0 !important; padding: 0 !important; }
                    body > *:not(#strukContainer) { display: none !important; }
                }
            `;

            const totalQty = transaction.items.reduce((sum, item) => sum + item.qty, 0);
            store.strukData = {
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
        handlePaymentMethodChange() {
            const store = Alpine.store('pos');
            try {
                if (store.paymentMethod === 'qris') {
                    const total = store.discountedTotal;
                    store.paymentAmount = store.formatRupiah(total);
                    store.paymentAmountRaw = total;
                    store.changeAmount = 0;
                } else {
                    store.paymentAmount = '';
                    store.paymentAmountRaw = 0;
                    store.changeAmount = 0;
                }
            } catch (error) {
                console.error('Error in handlePaymentMethodChange:', error);
            }
        }
    }));

    // ================================================================
    // 7. HISTORY COMPONENT
    // ================================================================
    Alpine.data('historyComponent', () => ({
        deleteTransaction(id) {
            const store = Alpine.store('pos');
            if (confirm('Delete transaction #' + id + '?')) {
                store.transactionHistory = store.transactionHistory.filter(trx => trx.id !== id);
                store.transactionHistory.forEach((trx, index) => trx.id = index + 1);
                store.saveTransactionHistory();
                store.showToast('🗑️ Deleted');
            }
        },
        clearAllTransactions() {
            const store = Alpine.store('pos');
            if (confirm('⚠️ Clear ALL?')) {
                store.transactionHistory = [];
                store.saveTransactionHistory();
                store.showToast('🗑️ All cleared');
            }
        },
        printStrukMobile(transaction) {
            const store = Alpine.store('pos');
            if (!transaction || !transaction.items || transaction.items.length === 0) {
                store.showToast('❌ No transaction data to print!');
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
        // Reuse print methods from checkout component or call global
        printStrukRawBT(transaction) {
            // Reuse from checkout
            const checkout = Alpine.data('checkoutComponent')();
            checkout.printStrukRawBT(transaction);
        },
        printStrukWebBluetoothiOS(transaction) {
            const checkout = Alpine.data('checkoutComponent')();
            checkout.printStrukWebBluetoothiOS(transaction);
        },
        printStrukBrowser(transaction) {
            const checkout = Alpine.data('checkoutComponent')();
            checkout.printStrukBrowser(transaction);
        }
    }));

    // ================================================================
    // 8. CALCULATOR COMPONENT
    // ================================================================
    Alpine.data('calculatorComponent', () => ({
        calcAppend(val) {
            const store = Alpine.store('pos');
            store.calcExpression += val;
            this.updateCalcDisplay();
        },
        calcClear() {
            const store = Alpine.store('pos');
            store.calcExpression = '';
            this.updateCalcDisplay();
        },
        calcBackspace() {
            const store = Alpine.store('pos');
            store.calcExpression = store.calcExpression.slice(0, -1);
            this.updateCalcDisplay();
        },
        calcEvaluate() {
            const store = Alpine.store('pos');
            try {
                store.calcExpression = eval(store.calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')).toString();
            } catch {
                store.calcExpression = 'Error';
                setTimeout(() => this.calcClear(), 800);
            }
            this.updateCalcDisplay();
        },
        updateCalcDisplay() {
            const store = Alpine.store('pos');
            store.calcDisplay = store.calcExpression || '0';
        }
    }));

    // ================================================================
    // 9. ADD/EDIT MENU COMPONENT
    // ================================================================
    Alpine.data('addEditMenuComponent', () => ({
        onCategoryChange() {
            const store = Alpine.store('pos');
            if (store.newItem.category === 'additional') {
                store.newItem.status = 'available';
                store.newItem.icon = '➕';
            } else if (!store.newItem.icon || store.newItem.icon === '➕') {
                store.newItem.icon = '🍽️';
            }
        },
        openAddMenu(category = 'food') {
            const store = Alpine.store('pos');
            store.newItem = { name: '', price: '', category: category, status: 'available', icon: category === 'additional' ? '➕' : '🍽️' };
            setTimeout(() => {
                $('#manualCategory').val(category).trigger('change.select2');
                $('#manualStatus').val('available').trigger('change.select2');
            }, 50);
            new bootstrap.Modal(document.getElementById('addItemModal')).show();
        },
        saveNewItem() {
            const store = Alpine.store('pos');
            const item = {
                id: store.nextId++,
                name: store.newItem.name.trim(),
                price: parseInt(store.newItem.price.replace(/\D/g, ''), 10) || 0,
                category: store.newItem.category,
                status: store.newItem.status,
                icon: store.newItem.icon || '🍽️'
            };
            store.menuItems.push(item);
            bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
            store.showToast('✅ Menu "' + item.name + '" added successfully!');
        },
        handleImageUpload(event) {
            const store = Alpine.store('pos');
            const file = event.target.files[0];
            if (!file) {
                store.newItem.imagePreview = null;
                store.newItem.imageData = null;
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                store.newItem.imagePreview = e.target.result;
                store.newItem.imageData = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        handleEditImageUpload(event) {
            const store = Alpine.store('pos');
            const file = event.target.files[0];
            if (!file) {
                store.editItem.imagePreview = null;
                store.editItem.imageData = null;
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                store.editItem.imagePreview = e.target.result;
                store.editItem.imageData = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }));

    // ================================================================
    // 10. ROOT COMPONENT (initialize store)
    // ================================================================
    Alpine.data('posApp', () => ({
        init() {
            Alpine.store('pos').init();
            // Init select2 and bridge events
            setTimeout(() => {
                // Select2 init for all .select2-custom
                $('.select2-custom').select2({ theme: 'default', width: '100%', dropdownAutoWidth: true });

                // Bridge jQuery -> Alpine for payment method
                $('#paymentMethod').on('change', (e) => {
                    const store = Alpine.store('pos');
                    store.paymentMethod = e.target.value;
                    store.handlePaymentMethodChange();
                });

                $('#manualCategory').on('change', (e) => {
                    const store = Alpine.store('pos');
                    store.newItem.category = e.target.value;
                    store.onCategoryChange();
                });

                $('#manualStatus').on('change', (e) => {
                    const store = Alpine.store('pos');
                    store.newItem.status = e.target.value;
                });
            }, 100);

            // Watch window resize for mobile cart
            window.addEventListener('resize', () => {});
        }
    }));

    console.log('✅ KitaPOS with Alpine.js (Refactored into components) ready!');
});