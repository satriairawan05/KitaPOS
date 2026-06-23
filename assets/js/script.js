// ================================================================
// assets/js/script.js - KitaPOS with Alpine.js
// ================================================================

// Wrap the app to be safe on GitHub Pages (standard Alpine v3)
document.addEventListener('alpine:init', () => {
    Alpine.data('posApp', () => ({
        // ===== STATE =====
        menuItems: [],
        nextId: 1,
        openingBalance: 0,
        cart: [],
        transactionHistory: [],
        currentCategory: 'all',
        searchQuery: '',
        mobileCartOpen: false,
        mobileCartVisible: true,
        toastMessage: 'Notification',
        // Calculator
        calcExpression: '',
        calcResult: '',
        calcJustEvaluated: false,
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
        quickPayOptions: [],
        // Discount
        discountType: 'rp',          // 'rp' or 'percent'
        discountValue: 0,            // raw numeric value (Rp amount or percentage)
        discountDisplay: '0',        // formatted display for input
        // Printer & Cashier
        defaultPrinterSize: '58mm',
        cashierName: 'May',
        // Fallback data for users
        strukData: { id: '', timestamp: '', items: [], total: 0, totalQty: 0, paid: 0, change: 0, method: 'Cash', discount: 0, subtotal: 0 },
        toast: null,

        // ===== COMPUTED =====
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
        // Discount calculations
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

        // ===== INIT =====
        init() {
            const storedOB = localStorage.getItem('openingBalance');
            this.openingBalance = storedOB !== null ? parseInt(storedOB, 10) || 0 : 150000;
            localStorage.setItem('openingBalance', this.openingBalance.toString());

            // Load default menu items
            this.menuItems = [
                { id: 1, name: 'Ayam Geprek', price: 12000, category: 'food', status: 'available', icon: '🍗', image: null },
                { id: 2, name: 'Ayam Geprek Keju', price: 15000, category: 'food', status: 'available', icon: '🧀', image: null },
                { id: 3, name: 'Ayam Lada Hitam', price: 13000, category: 'food', status: 'available', icon: '🍗', image: null },
                { id: 4, name: 'Ayam Saus BBQ', price: 13000, category: 'food', status: 'available', icon: '🍗', image: null },
                { id: 5, name: 'Ayam Keju', price: 15000, category: 'food', status: 'available', icon: '🧀', image: null },
                { id: 6, name: 'Lele Goreng', price: 13000, category: 'food', status: 'available', icon: '🐟', image: null },
                { id: 7, name: 'Ikan Nila Goreng', price: 15000, category: 'food', status: 'available', icon: '🐟', image: null },
                { id: 8, name: 'Ikan Mas Goreng', price: 15000, category: 'food', status: 'available', icon: '🐟', image: null },
                { id: 9, name: 'Kentang Goreng Kecil', price: 8000, category: 'snack', status: 'available', icon: '🍟', image: null },
                { id: 10, name: 'Kentang Goreng Besar', price: 12000, category: 'snack', status: 'available', icon: '🍟', image: null },
                { id: 11, name: 'Nugget Kecil', price: 8000, category: 'snack', status: 'available', icon: '🍘', image: null },
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
            if (storedHistory) this.transactionHistory = JSON.parse(storedHistory);

            const savedSize = localStorage.getItem('defaultPrinterSize');
            if (savedSize) {
                this.defaultPrinterSize = savedSize;
            } else {
                this.defaultPrinterSize = '58mm';
                localStorage.setItem('defaultPrinterSize', '58mm');
            }

            this.toast = new bootstrap.Toast(document.getElementById('liveToast'), { delay: 2500 });
            this.initSelect2();

            if (window.innerWidth >= 992) this.mobileCartVisible = false;

            window.addEventListener('resize', () => {
                if (window.innerWidth >= 992) {
                    this.mobileCartOpen = false;
                    this.mobileCartVisible = false;
                } else {
                    this.mobileCartVisible = true;
                }
            });

            this.updateCalcDisplay();
            console.log('✅ KitaPOS with Alpine.js ready!');
        },

        // ===== SMART CASHIER PRINT MODULE =====
        
        // Helper to format receipt lines (left-right alignment)
        formatReceiptLine(leftText, rightText, is80mm = false) {
            const lineLength = is80mm ? 48 : 32; // 80mm = 48 chars, 58mm = 32 chars
            let left = leftText.toString();
            let right = rightText.toString();
            let spaceLength = lineLength - left.length - right.length;
            
            if (spaceLength < 1) {
                left = left.substring(0, lineLength - right.length - 2) + '..';
                spaceLength = 0;
            }
            return left + ' '.repeat(spaceLength) + right;
        },

        // 1. Device dispatcher
        printStrukMobile(transaction) {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;

            // iPhone/iPad -> Web Bluetooth via Bluefy browser
            if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                this.printStrukWebBluetoothiOS(transaction);
            } 
            // Android -> RawBT app
            else if (/android/i.test(userAgent)) {
                this.printStrukRawBT(transaction);
            } 
            // PC/Laptop -> browser print dialog (auto CSS)
            else {
                this.printStrukBrowser(transaction); 
            }
        },

        // 2. Android: Send data to RawBT app
        printStrukRawBT(transaction) {
            try {
                const is80mm = this.defaultPrinterSize === '80mm';
                const encoder = new EscPosEncoder();
                let receipt = encoder.initialize();
                
                receipt.align('center')
                    .bold(true).text('KITA POS - PUSAT').newline().bold(false)
                    .text('Jl. Raya Sukses No. 123').newline()
                    .line('-'.repeat(is80mm ? 48 : 32))
                    .align('left')
                    .text(`Kasir : ${this.cashierName}`).newline()
                    .text(`No    : #${transaction.id}`).newline()
                    .line('-'.repeat(is80mm ? 48 : 32));

                transaction.items.forEach(item => {
                    const leftStr = `  ${item.qty} x ${this.formatRupiah(item.price)}`;
                    const rightStr = this.formatRupiah(item.subtotal);
                    receipt.text(item.name).newline();
                    receipt.text(this.formatReceiptLine(leftStr, rightStr, is80mm)).newline();
                });

                // Discount line if any
                if (transaction.discount && transaction.discount > 0) {
                    receipt.line('-'.repeat(is80mm ? 48 : 32))
                           .text(this.formatReceiptLine('Diskon', '-Rp ' + this.formatRupiah(transaction.discount), is80mm)).newline();
                }

                receipt.line('-'.repeat(is80mm ? 48 : 32))
                    .text(this.formatReceiptLine('TOTAL', 'Rp ' + this.formatRupiah(transaction.total), is80mm)).newline()
                    .line('-'.repeat(is80mm ? 48 : 32))
                    .align('center').text('Terima kasih').newline()
                    .newline().newline().newline();

                const resultData = receipt.encode();
                let binary = '';
                resultData.forEach(b => binary += String.fromCharCode(b));
                
                // Invoke RawBT intent
                window.location.href = "rawbt:base64," + btoa(binary);
            } catch (error) {
                this.showToast('⚠️ RawBT failed, switching to normal print');
                this.printStrukBrowser(transaction);
            }
        },

        // 3. iPhone: Web Bluetooth print (requires Bluefy browser)
        async printStrukWebBluetoothiOS(transaction) {
            if (!navigator.bluetooth) {
                alert("⚠️ iOS BLOCKED!\nOpen KitaPOS using 'Bluefy' browser (download from App Store) to enable Bluetooth printing.");
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
                this.showToast('🖨️ Successfully printed from iPhone!');
            } catch (error) {
                this.showToast('⚠️ Bluetooth failed. Switching to normal print...');
                this.printStrukBrowser(transaction);
            }
        },

        // 4. PC / Fallback: Browser HTML print (supports dynamic 58/80)
        printStrukBrowser(transaction) {
            if (!transaction || !transaction.items || transaction.items.length === 0) return;
            
            // Inject dynamic CSS for print with correct paper size
            let style = document.getElementById('printPageStyle');
            if (!style) {
                style = document.createElement('style');
                style.id = 'printPageStyle';
                document.head.appendChild(style);
            }
            
            const paperSize = this.defaultPrinterSize; // '58mm' or '80mm'
            // Build CSS rules to force the page size and content width
            style.innerHTML = `
                @media print {
                    @page {
                        size: ${paperSize} auto;
                        margin: 0;
                    }
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }
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
                        font-size: ${paperSize === '58mm' ? '11px' : '14px'} !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        page-break-after: avoid !important;
                    }
                    /* Override any existing width from classes */
                    .struk-content.paper-58mm,
                    .struk-content.paper-80mm {
                        width: ${paperSize} !important;
                        max-width: ${paperSize} !important;
                    }
                    /* Ensure no extra spacing */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    /* Hide all other content */
                    body > *:not(#strukContainer) {
                        display: none !important;
                    }
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
            
            // Give time for DOM update then print
            setTimeout(() => {
                window.print();
            }, 400);
            
            window.onafterprint = () => {
                container.style.display = 'none';
                window.onafterprint = null;
                // Remove the injected style after print to avoid affecting the main page
                // (optional)
            };
        },

        // ===== CART FUNCTIONS =====
        getCartQty(id) {
            const item = this.cart.find(c => c.id === id);
            return item ? item.qty : 0;
        },
        getDisplayQty(id) {
            const qty = this.getCartQty(id);
            return qty > 0 ? qty : 1;
        },
        incrementQty(id) {
            const existing = this.cart.find(c => c.id === id);
            if (existing) existing.qty += 1;
            else {
                const menuItem = this.menuItems.find(i => i.id === id);
                if (menuItem) this.cart.push({ ...menuItem, qty: 1 });
            }
        },
        decrementQty(id) {
            const idx = this.cart.findIndex(c => c.id === id);
            if (idx === -1) return;
            if (this.cart[idx].qty > 1) this.cart[idx].qty -= 1;
            else this.cart.splice(idx, 1);
        },
        updateQtyFromInput(id, event) {
            const val = parseInt(event.target.value, 10);
            if (isNaN(val) || val < 0) {
                event.target.value = this.getDisplayQty(id);
                return;
            }
            if (val === 0) {
                const idx = this.cart.findIndex(c => c.id === id);
                if (idx !== -1) this.cart.splice(idx, 1);
            } else {
                const existing = this.cart.find(c => c.id === id);
                if (existing) existing.qty = val;
                else {
                    const menuItem = this.menuItems.find(i => i.id === id);
                    if (menuItem) this.cart.push({ ...menuItem, qty: val });
                }
            }
        },
        removeFromCart(id) {
            const idx = this.cart.findIndex(c => c.id === id);
            if (idx === -1) return;
            if (this.cart[idx].qty > 1) this.cart[idx].qty -= 1;
            else this.cart.splice(idx, 1);
        },
        resetTo(id, targetQty) {
            const item = this.cart.find(c => c.id === id);
            if (item && item.qty > targetQty) {
                item.qty = targetQty;
                this.showToast('✅ Qty reset to ' + targetQty);
            }
        },

        // ===== CHECKOUT (with discount) =====
        openCheckout() {
            if (this.cart.length === 0) return;
            this.paymentMethod = 'cash';
            this.paymentAmount = '';
            this.paymentAmountRaw = 0;
            this.changeAmount = 0;
            // Reset discount
            this.discountType = 'rp';
            this.discountValue = 0;
            this.discountDisplay = '0';
            this.generateQuickPayOptions();
            const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
            modal.show();
        },
        generateQuickPayOptions() {
            const total = this.discountedTotal;
            let options = [];
            if (total <= 50000) options = [50000, 75000, 100000];
            else if (total <= 100000) options = [100000, 150000, 200000];
            else options = [150000, 200000, 250000];
            options = options.filter(v => v !== total);
            while (options.length < 3) {
                const last = options.length ? options[options.length - 1] : total;
                options.push(last + 50000);
            }
            options = options.slice(0, 3);
            this.quickPayOptions = [total, ...options];
        },
        setQuickPay(val) {
            this.paymentAmountRaw = val;
            this.paymentAmount = this.formatRupiah(val);
            this.updateChange();
        },
        updateChange() {
            const raw = this.parseRupiah(this.paymentAmount);
            this.paymentAmountRaw = raw;
            const total = this.discountedTotal;
            this.changeAmount = raw - total;
        },
        confirmCheckout() {
            const total = this.discountedTotal;
            const method = this.paymentMethod;
            let paid = this.paymentAmountRaw;
            if (method === 'cash') {
                if (paid < total) {
                    this.showToast('❌ Payment insufficient!');
                    return;
                }
                const change = paid - total;
                const transaction = this.saveTransaction('Cash', total, paid, change);
                this.showToast('✅ Checkout successful!');
                this.printStrukMobile(transaction);
            } else {
                paid = total;
                this.paymentAmount = this.formatRupiah(paid);
                this.paymentAmountRaw = paid;
                const transaction = this.saveTransaction('QRIS', total, paid, 0);
                this.showToast('✅ Checkout successful! Method: QRIS.');
                this.printStrukMobile(transaction);
            }
            this.cart = [];
            this.closeMobileCart();
            bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
        },
        saveTransaction(method, total, paid, change) {
            const now = new Date();
            const timestamp = this.formatTanggalIndonesia(now);
            const discountAmt = this.discountAmount;
            const subtotal = this.cartTotal;
            const transaction = {
                id: this.transactionHistory.length + 1,
                timestamp: timestamp,
                items: this.cart.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    subtotal: item.price * item.qty
                })),
                total: total,
                subtotal: subtotal,
                discount: discountAmt,
                discountType: this.discountType,
                discountValue: this.discountValue,
                method: method,
                paid: paid,
                change: change
            };
            this.transactionHistory.push(transaction);
            localStorage.setItem('transactionHistory', JSON.stringify(this.transactionHistory));
            return transaction;
        },

        // ===== DISCOUNT INPUT HANDLING =====
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
            this.generateQuickPayOptions();
            this.updateChange();
        },
        reformatDiscountDisplay() {
            if (this.discountType === 'rp') {
                this.discountDisplay = this.formatRupiah(this.discountValue);
            } else {
                this.discountDisplay = this.discountValue.toString();
            }
            this.generateQuickPayOptions();
            this.updateChange();
        },

        // ===== UTILITY FUNCTIONS =====
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
        setCategory(cat) { this.currentCategory = cat; },
        filterMenu() { },
        goHome() {
            this.currentCategory = 'all';
            this.searchQuery = '';
            document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        toggleMobileCart() { this.mobileCartOpen = !this.mobileCartOpen; },
        closeMobileCart() { this.mobileCartOpen = false; },
        initSelect2() {
            $('.select2-custom').select2({ theme: 'default', width: '100%', dropdownAutoWidth: true });
        },

        // ===== HISTORY =====
        openHistory() { new bootstrap.Modal(document.getElementById('historyModal')).show(); },
        deleteTransaction(id) {
            if (confirm('Delete transaction #' + id + '?')) {
                this.transactionHistory = this.transactionHistory.filter(trx => trx.id !== id);
                this.transactionHistory.forEach((trx, index) => trx.id = index + 1);
                localStorage.setItem('transactionHistory', JSON.stringify(this.transactionHistory));
                this.showToast('🗑️ Deleted');
            }
        },
        clearAllTransactions() {
            if (confirm('⚠️ Clear ALL?')) {
                this.transactionHistory = [];
                localStorage.removeItem('transactionHistory');
                this.showToast('🗑️ All cleared');
            }
        },

        // ===== MENU MANAGEMENT =====
        onCategoryChange() {
            if (this.newItem.category === 'additional') {
                this.newItem.status = 'available'; this.newItem.icon = '➕';
            } else if (!this.newItem.icon || this.newItem.icon === '➕') this.newItem.icon = '🍽️';
        },
        openAddMenu(category = 'food') {
            this.newItem = { name: '', price: '', category: category, status: 'available', icon: category === 'additional' ? '➕' : '🍽️' };
            new bootstrap.Modal(document.getElementById('addItemModal')).show();
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
        },
        openEditMenu(id) {
            const item = this.menuItems.find(i => i.id === id);
            if (!item) return;
            this.editItemId = id;
            this.editItem = { ...item, price: this.formatRupiah(item.price) };
            new bootstrap.Modal(document.getElementById('editItemModal')).show();
        },
        saveEditItem() {
            const id = this.editItemId;
            const index = this.menuItems.findIndex(i => i.id === id);
            this.menuItems[index] = {
                ...this.menuItems[index],
                name: this.editItem.name.trim(),
                price: parseInt(this.editItem.price.replace(/\D/g, ''), 10) || 0,
                category: this.editItem.category,
                status: this.editItem.status,
                icon: this.editItem.icon || '🍽️'
            };
            bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
        },
        openEditOpeningBalance() {
            this.editOpeningBalance = this.formatRupiah(this.openingBalance);
            new bootstrap.Modal(document.getElementById('editOpeningBalanceModal')).show();
        },
        saveOpeningBalance() {
            this.openingBalance = parseInt(this.editOpeningBalance.replace(/\D/g, ''), 10) || 0;
            localStorage.setItem('openingBalance', this.openingBalance.toString());
            bootstrap.Modal.getInstance(document.getElementById('editOpeningBalanceModal')).hide();
        },

        // ===== PRINTER SIZE & TOAST =====
        applyPrinterSize() {
            localStorage.setItem('defaultPrinterSize', this.defaultPrinterSize);
            this.showToast('⚙️ Printer setting: ' + this.defaultPrinterSize);
        },
        showToast(msg) {
            this.toastMessage = msg;
            this.toast.show();
        },

        // ===== CALCULATOR (unchanged) =====
        openCalculator() { new bootstrap.Modal(document.getElementById('calcModal')).show(); },
        calcAppend(val) { this.calcExpression += val; this.updateCalcDisplay(); },
        calcClear() { this.calcExpression = ''; this.updateCalcDisplay(); },
        calcBackspace() { this.calcExpression = this.calcExpression.slice(0, -1); this.updateCalcDisplay(); },
        calcEvaluate() {
            try { this.calcExpression = eval(this.calcExpression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')).toString(); }
            catch { this.calcExpression = 'Error'; setTimeout(() => this.calcClear(), 800); }
            this.updateCalcDisplay();
        },
        updateCalcDisplay() { this.calcDisplay = this.calcExpression || '0'; }
    }));
});