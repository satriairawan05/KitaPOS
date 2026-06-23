// ================================================================
// assets/js/script.js - KitaPOS with Alpine.js
// ================================================================

function posApp() {
    return {
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
        // Printer
        defaultPrinterSize: '58mm',
        // Struk data
        strukData: { id: '', timestamp: '', items: [], total: 0, totalQty: 0, paid: 0, change: 0, method: 'Cash' },
        // Toast
        toast: null,

        // 1. TAMBAHKAN STATE KASIR (Bisa diganti dinamis dari database nanti)
        cashierName: 'Deuwi Satriya',

        // ... (state lama lainnya biarkan saja) ...

        // 2. BUAT FUNGSI HELPER UNTUK RATA KIRI-KANAN (SPACING)
        // Printer 58mm biasanya memuat 32 karakter per baris.
        // Fungsi ini mengatur agar teks kiri dan kanan sejajar, dipisah spasi.
        formatReceiptLine(leftText, rightText, lineLength = 32) {
            let left = leftText.toString();
            let right = rightText.toString();
            let spaceLength = lineLength - left.length - right.length;

            if (spaceLength < 1) {
                // Jika teks terlalu panjang, potong bagian kiri
                left = left.substring(0, lineLength - right.length - 2) + '..';
                spaceLength = 0;
            }
            return left + ' '.repeat(spaceLength) + right;
        },

        // 3. FUNGSI BARU KHUSUS CETAK KE PRINTER THERMAL VIA WEBUSB
        async printStrukThermal(transaction) {
            if (!transaction || !transaction.items || transaction.items.length === 0) {
                this.showToast('❌ No transaction data to print!');
                return;
            }

            try {
                // A. Meminta akses USB (Browser akan memunculkan popup pilih printer)
                // Catatan: Ini hanya berjalan di Google Chrome / Edge berbasis Chromium
                const device = await navigator.usb.requestDevice({ filters: [] });
                await device.open();
                await device.selectConfiguration(1);
                await device.claimInterface(0);

                // B. Inisialisasi Encoder
                const encoder = new EscPosEncoder();
                let receipt = encoder.initialize();

                // C. Menyusun Header Struk
                receipt
                    .align('center')
                    .bold(true).text('KITA POS - PUSAT').newline().bold(false)
                    .text('Jl. Raya Sukses No. 123').newline()
                    .line('--------------------------------') // 32 Karakter untuk 58mm

                    // D. Menyusun Informasi Transaksi
                    .align('left')
                    .text(`Kasir : ${this.cashierName}`).newline()
                    .text(`Waktu : ${transaction.timestamp}`).newline()
                    .text(`No    : #${transaction.id}`).newline()
                    .text(`Bayar : ${transaction.method === 'Cash' ? 'Tunai' : 'QRIS'}`).newline()
                    .line('--------------------------------');

                // E. Melakukan Looping Data Item yang Dinamis
                transaction.items.forEach(item => {
                    // Baris 1: Nama Item
                    receipt.text(item.name).newline();

                    // Baris 2: Qty x Harga   ==========   Subtotal
                    const leftStr = `  ${item.qty} x ${this.formatRupiah(item.price)}`;
                    const rightStr = this.formatRupiah(item.subtotal);
                    receipt.text(this.formatReceiptLine(leftStr, rightStr)).newline();
                });

                // F. Menyusun Total Belanja
                receipt
                    .line('--------------------------------')
                    .text(this.formatReceiptLine('Subtotal', 'Rp ' + this.formatRupiah(transaction.total))).newline()
                    .bold(true)
                    .text(this.formatReceiptLine('TOTAL', 'Rp ' + this.formatRupiah(transaction.total))).newline()
                    .bold(false)
                    .line('--------------------------------');

                // G. Menyusun Pembayaran & Kembalian (Khusus Cash)
                if (transaction.method === 'Cash') {
                    receipt.text(this.formatReceiptLine('Tunai', 'Rp ' + this.formatRupiah(transaction.paid))).newline();
                    receipt.text(this.formatReceiptLine('Kembali', 'Rp ' + this.formatRupiah(transaction.change))).newline();
                } else {
                    receipt.text(this.formatReceiptLine('QRIS', 'Rp ' + this.formatRupiah(transaction.paid))).newline();
                }

                // H. Menyusun Footer
                receipt
                    .align('center')
                    .line('--------------------------------')
                    .text('Powered by KitaPOS').newline()
                    .text('Terima kasih atas kunjungan Anda').newline()
                    .newline()
                    .newline()
                    .newline()
                    .cut(); // Perintah otomatis memotong kertas

                // I. Mengirim data ke Printer USB
                const result = receipt.encode();
                const endpointNumber = device.configuration.interfaces[0].alternate.endpoints[0].endpointNumber;
                await device.transferOut(endpointNumber, result);

                this.showToast('🖨️ Struk berhasil dicetak!');

            } catch (error) {
                console.error("Print error:", error);
                // Jika gagal (misal user batal pilih USB), fallback ke print browser biasa
                this.showToast('⚠️ Gagal via USB, mengalihkan ke Print Browser...');
                this.printStruk(transaction);
            }
        },

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

        // ===== INIT =====
        init() {
            const storedOB = localStorage.getItem('openingBalance');
            this.openingBalance = storedOB !== null ? parseInt(storedOB, 10) || 0 : 150000;
            localStorage.setItem('openingBalance', this.openingBalance.toString());

            if (typeof defaultMenuData !== 'undefined' && defaultMenuData.length > 0) {
                this.menuItems = defaultMenuData;
                this.nextId = Math.max(...this.menuItems.map(item => item.id)) + 1;
            } else {
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
            }

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
            this.initSelect2();

            if (window.innerWidth >= 992) {
                this.mobileCartVisible = false;
            }

            window.addEventListener('resize', () => {
                if (window.innerWidth >= 992) {
                    this.mobileCartOpen = false;
                    this.mobileCartVisible = false;
                } else {
                    this.mobileCartVisible = true;
                }
            });

            document.addEventListener('click', (e) => {
                if (window.innerWidth < 992 && this.mobileCartOpen) {
                    const sidebar = document.getElementById('mobileCartSidebar');
                    const toggle = document.getElementById('mobileCartToggle');
                    const toggleBtn = document.getElementById('toggleCartMobile');
                    if (!sidebar.contains(e.target) && !toggle.contains(e.target) && !toggleBtn.contains(e.target)) {
                        this.closeMobileCart();
                    }
                }
            });

            this.updateCalcDisplay();
            console.log('✅ KitaPOS with Alpine.js ready!');
        },

        // ===== CART QTY HELPERS =====
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
            if (existing) {
                existing.qty += 1;
            } else {
                const menuItem = this.menuItems.find(i => i.id === id);
                if (menuItem) {
                    this.cart.push({ ...menuItem, qty: 1 });
                }
            }
            this.updateCartUI();
        },
        decrementQty(id) {
            const idx = this.cart.findIndex(c => c.id === id);
            if (idx === -1) return;
            if (this.cart[idx].qty > 1) {
                this.cart[idx].qty -= 1;
            } else {
                this.cart.splice(idx, 1);
            }
            this.updateCartUI();
        },
        updateQtyFromInput(id, event) {
            const val = parseInt(event.target.value, 10);
            if (isNaN(val) || val < 0) {
                event.target.value = this.getDisplayQty(id);
                return;
            }
            if (val === 0) {
                const idx = this.cart.findIndex(c => c.id === id);
                if (idx !== -1) {
                    this.cart.splice(idx, 1);
                }
            } else {
                const existing = this.cart.find(c => c.id === id);
                if (existing) {
                    existing.qty = val;
                } else {
                    const menuItem = this.menuItems.find(i => i.id === id);
                    if (menuItem) {
                        this.cart.push({ ...menuItem, qty: val });
                    }
                }
            }
            this.updateCartUI();
        },

        // ===== SELECT2 =====
        initSelect2() {
            $('.select2-custom').select2({
                theme: 'default',
                width: '100%',
                dropdownAutoWidth: true,
                placeholder: 'Select...',
                allowClear: false
            });
            $('#addItemModal').on('shown.bs.modal', () => {
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
            $('#editItemModal').on('shown.bs.modal', () => {
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
            $('#checkoutModal').on('shown.bs.modal', () => {
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
        },

        // ===== CURRENCY =====
        formatRupiah(angka) {
            if (!angka && angka !== 0) return '';
            return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },
        formatPriceInput(event) {
            // Hanya format tampilan, tidak mengubah nilai asli
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
            return parseInt(str.replace(/\D/g, ''), 10) || 0;
        },

        // ===== CATEGORY & SEARCH =====
        setCategory(cat) {
            this.currentCategory = cat;
        },
        filterMenu() { },
        goHome() {
            this.currentCategory = 'all';
            this.searchQuery = '';
            document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.showToast('🏠 Returned to main menu');
        },

        // ===== OPENING BALANCE =====
        openEditOpeningBalance() {
            this.editOpeningBalance = this.formatRupiah(this.openingBalance);
            const modal = new bootstrap.Modal(document.getElementById('editOpeningBalanceModal'));
            modal.show();
        },
        saveOpeningBalance() {
            const raw = this.editOpeningBalance.replace(/\D/g, '');
            const value = parseInt(raw, 10) || 0;
            if (value < 0) {
                this.showToast('❌ Opening balance cannot be negative!');
                return;
            }
            this.openingBalance = value;
            localStorage.setItem('openingBalance', value.toString());
            bootstrap.Modal.getInstance(document.getElementById('editOpeningBalanceModal')).hide();
            this.showToast('✅ Opening balance updated: Rp ' + this.formatRupiah(value));
        },

        // ===== CART (legacy) =====
        addToCart(id) {
            const item = this.menuItems.find(i => i.id === id);
            if (!item || item.status === 'out') {
                this.showToast('Menu not available!');
                return;
            }
            const existing = this.cart.find(c => c.id === id);
            if (existing) {
                existing.qty += 1;
            } else {
                this.cart.push({ ...item, qty: 1 });
            }
            this.showToast('✅ ' + item.name + ' added to cart');
        },
        removeFromCart(id) {
            const idx = this.cart.findIndex(c => c.id === id);
            if (idx === -1) return;
            if (this.cart[idx].qty > 1) {
                this.cart[idx].qty -= 1;
            } else {
                this.cart.splice(idx, 1);
            }
        },
        resetTo(id, targetQty) {
            const item = this.cart.find(c => c.id === id);
            if (item && item.qty > targetQty) {
                item.qty = targetQty;
                this.showToast('✅ ' + item.name + ' quantity reset to ' + targetQty);
            }
        },

        // ===== UPDATE CART UI =====
        updateCartUI() {
            // Tidak perlu diimplementasikan karena Alpine reactive
            // Hanya untuk trigger update jika ada method yang membutuhkan
        },

        // ===== MOBILE CART =====
        toggleMobileCart() {
            this.mobileCartOpen = !this.mobileCartOpen;
            if (this.mobileCartOpen) {
                document.getElementById('mobileCartToggle').style.display = 'none';
            } else {
                if (!document.querySelector('.modal-backdrop')) {
                    document.getElementById('mobileCartToggle').style.display = 'flex';
                }
            }
        },
        closeMobileCart() {
            this.mobileCartOpen = false;
            if (!document.querySelector('.modal-backdrop')) {
                document.getElementById('mobileCartToggle').style.display = 'flex';
            }
        },

        // ===== CHECKOUT =====
        openCheckout() {
            if (this.cart.length === 0) return;
            this.paymentMethod = 'cash';
            this.paymentAmount = '';
            this.paymentAmountRaw = 0;
            this.changeAmount = 0;
            this.generateQuickPayOptions();
            const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
            modal.show();
        },
        generateQuickPayOptions() {
            const total = this.cartTotal;
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
            this.paymentAmount = this.formatRupiah(val);
            this.paymentAmountRaw = val;
            this.updateChange();
        },
        updateChange() {
            const raw = this.parseRupiah(this.paymentAmount);
            this.paymentAmountRaw = raw;
            const total = this.cartTotal;
            this.changeAmount = raw - total;
        },
        confirmCheckout() {
            const total = this.cartTotal;
            const method = this.paymentMethod;
            let paid = this.paymentAmountRaw;
            if (method === 'cash') {
                if (paid < total) {
                    this.showToast('❌ Payment insufficient!');
                    return;
                }
                const change = paid - total;
                const transaction = this.saveTransaction('Cash', total, paid, change);
                this.showToast('✅ Checkout successful! Method: Cash. Change: Rp ' + this.formatRupiah(change));

                // UBAH BAGIAN INI
                this.printStrukThermal(transaction);

            } else {
                paid = total;
                this.paymentAmount = this.formatRupiah(paid);
                const transaction = this.saveTransaction('QRIS', total, paid, 0);
                this.showToast('✅ Checkout successful! Method: QRIS. Total: Rp ' + this.formatRupiah(total));

                // UBAH BAGIAN INI
                this.printStrukThermal(transaction);
            }
            this.cart = [];
            this.closeMobileCart();
            bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
        },
        saveTransaction(method, total, paid, change) {
            const now = new Date();
            const timestamp = this.formatTanggalIndonesia(now);
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
                method: method,
                paid: paid,
                change: change
            };
            this.transactionHistory.push(transaction);
            localStorage.setItem('transactionHistory', JSON.stringify(this.transactionHistory));
            return transaction;
        },

        // ===== FORMAT TANGGAL =====
        formatTanggalIndonesia(date) {
            const month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const day = date.getDate();
            const monthIndex = date.getMonth();
            const year = date.getFullYear();
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            const second = String(date.getSeconds()).padStart(2, '0');
            return day + ' ' + month[monthIndex] + ' ' + year + ', ' + hour + '.' + minute + '.' + second;
        },

        // ===== PRINT STRUK =====
        printStruk(transaction) {
            if (!transaction || !transaction.items || transaction.items.length === 0) {
                this.showToast('❌ No transaction data to print!');
                return;
            }
            const totalQty = transaction.items.reduce((sum, item) => sum + item.qty, 0);
            this.strukData = {
                id: transaction.id,
                timestamp: transaction.timestamp,
                items: transaction.items,
                total: transaction.total,
                totalQty: totalQty,
                paid: transaction.paid,
                change: transaction.change,
                method: transaction.method
            };
            const container = document.getElementById('strukContainer');
            container.style.display = 'block';
            setTimeout(() => {
                window.print();
            }, 300);
            window.onafterprint = () => {
                container.style.display = 'none';
                window.onafterprint = null;
            };
        },

        // ===== HISTORY =====
        openHistory() {
            const modal = new bootstrap.Modal(document.getElementById('historyModal'));
            modal.show();
        },
        deleteTransaction(id) {
            if (confirm('Are you sure you want to delete transaction #' + id + '?')) {
                this.transactionHistory = this.transactionHistory.filter(trx => trx.id !== id);
                this.transactionHistory.forEach((trx, index) => trx.id = index + 1);
                localStorage.setItem('transactionHistory', JSON.stringify(this.transactionHistory));
                this.showToast('🗑️ Transaction #' + id + ' has been deleted');
            }
        },
        clearAllTransactions() {
            if (confirm('⚠️ Are you sure you want to delete ALL transactions? This cannot be undone!')) {
                this.transactionHistory = [];
                localStorage.removeItem('transactionHistory');
                this.showToast('🗑️ All transactions have been cleared');
            }
        },

        // ===== CALCULATOR =====
        openCalculator() {
            const modal = new bootstrap.Modal(document.getElementById('calcModal'));
            modal.show();
        },
        calcAppend(value) {
            if (this.calcJustEvaluated) {
                if (['+', '−', '×', '÷'].includes(value)) {
                    this.calcExpression = this.calcResult + value;
                } else {
                    this.calcExpression = value;
                }
                this.calcJustEvaluated = false;
            } else {
                const lastChar = this.calcExpression.slice(-1);
                if (value === '.') {
                    const lastNum = this.calcExpression.split(/[+\−×÷]/).pop();
                    if (lastNum && lastNum.includes('.')) return;
                }
                if (['+', '−', '×', '÷'].includes(value) && ['+', '−', '×', '÷'].includes(lastChar)) {
                    this.calcExpression = this.calcExpression.slice(0, -1) + value;
                    this.updateCalcDisplay();
                    return;
                }
                this.calcExpression += value;
            }
            this.updateCalcDisplay();
        },
        calcClear() {
            this.calcExpression = '';
            this.calcResult = '';
            this.calcJustEvaluated = false;
            this.updateCalcDisplay();
        },
        calcBackspace() {
            if (this.calcJustEvaluated) {
                this.calcExpression = '';
                this.calcJustEvaluated = false;
            } else {
                this.calcExpression = this.calcExpression.slice(0, -1);
            }
            this.updateCalcDisplay();
        },
        calcEvaluate() {
            try {
                let expr = this.calcExpression;
                expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
                const result = Function('"use strict"; return (' + expr + ')')();
                if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                    const rounded = Math.round(result * 100) / 100;
                    const resultStr = rounded.toString();
                    this.calcResult = resultStr;
                    this.calcExpression = resultStr;
                    this.calcJustEvaluated = true;
                    this.updateCalcDisplay();
                } else {
                    this.calcExpression = 'Error';
                    this.updateCalcDisplay();
                    setTimeout(() => {
                        this.calcExpression = '';
                        this.updateCalcDisplay();
                    }, 800);
                }
            } catch (e) {
                this.calcExpression = 'Error';
                this.updateCalcDisplay();
                setTimeout(() => {
                    this.calcExpression = '';
                    this.updateCalcDisplay();
                }, 800);
            }
        },
        updateCalcDisplay() {
            if (!this.calcExpression) {
                this.calcDisplay = '0';
                return;
            }
            let displayText = this.calcExpression;
            if (['+', '−', '×', '÷'].includes(displayText.slice(-1))) {
                this.calcDisplay = displayText;
                return;
            }
            const tokens = displayText.split(/([+\−×÷])/);
            const formattedTokens = tokens.map(token => {
                if (['+', '−', '×', '÷'].includes(token)) return token;
                const num = parseFloat(token);
                if (!isNaN(num) && token !== '') {
                    return this.formatThousand(token);
                }
                return token;
            });
            this.calcDisplay = formattedTokens.join('');
        },
        formatThousand(numStr) {
            const parts = numStr.split('.');
            const integerPart = parts[0];
            const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
            const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            return formatted + decimalPart;
        },

        // ===== ADD/EDIT MENU =====
        onCategoryChange() {
            if (this.newItem.category === 'additional') {
                this.newItem.status = 'available';
                this.newItem.icon = '➕';
                this.newItem.imageData = null;
                this.newItem.imagePreview = null;
                document.getElementById('manualImage').value = '';
            } else {
                if (!this.newItem.icon || this.newItem.icon === '➕') {
                    this.newItem.icon = '🍽️';
                }
            }
        },
        openAddMenu(category = 'food') {
            this.newItem = {
                name: '',
                price: '',
                category: category,
                status: 'available',
                icon: category === 'additional' ? '➕' : '🍽️',
                imagePreview: null,
                imageData: null
            };
            document.getElementById('manualImage').value = '';
            const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
            modal.show();
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.newItem.imagePreview = e.target.result;
                    this.newItem.imageData = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                this.newItem.imagePreview = null;
                this.newItem.imageData = null;
            }
        },
        saveNewItem() {
            const name = this.newItem.name.trim();
            const rawPrice = this.newItem.price.replace(/\D/g, '');
            const price = parseInt(rawPrice, 10) || 0;
            if (!name) {
                this.showToast('❌ Menu name is required!');
                return;
            }
            if (price <= 0) {
                this.showToast('❌ Price must be a positive number!');
                return;
            }
            const item = {
                id: this.nextId++,
                name: name,
                price: price,
                category: this.newItem.category,
                status: this.newItem.status,
                icon: this.newItem.icon || '🍽️',
                image: this.newItem.imageData || null
            };
            this.menuItems.push(item);
            bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
            this.showToast('✅ Menu "' + name + '" has been added successfully!');
        },
        openEditMenu(id) {
            const item = this.menuItems.find(i => i.id === id);
            if (!item) {
                this.showToast('❌ Menu not found!');
                return;
            }
            this.editItemId = id;
            this.editItem = {
                name: item.name,
                price: this.formatRupiah(item.price),
                category: item.category,
                status: item.status,
                icon: item.icon || '🍽️',
                imagePreview: item.image || null,
                imageData: item.image || null
            };
            const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
            modal.show();
        },
        handleEditImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.editItem.imagePreview = e.target.result;
                    this.editItem.imageData = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                this.editItem.imagePreview = this.editItem.imageData || null;
            }
        },
        saveEditItem() {
            const id = this.editItemId;
            const name = this.editItem.name.trim();
            const rawPrice = this.editItem.price.replace(/\D/g, '');
            const price = parseInt(rawPrice, 10) || 0;
            if (!name) {
                this.showToast('❌ Menu name is required!');
                return;
            }
            if (price <= 0) {
                this.showToast('❌ Price must be a positive number!');
                return;
            }
            const index = this.menuItems.findIndex(i => i.id === id);
            if (index === -1) {
                this.showToast('❌ Menu not found!');
                return;
            }
            this.menuItems[index] = {
                ...this.menuItems[index],
                name: name,
                price: price,
                category: this.editItem.category,
                status: this.editItem.status,
                icon: this.editItem.icon || '🍽️',
                image: this.editItem.imageData || null
            };
            this.cart.forEach(cartItem => {
                if (cartItem.id === id) {
                    cartItem.name = name;
                    cartItem.price = price;
                    cartItem.icon = this.editItem.icon || '🍽️';
                }
            });
            bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
            this.showToast('✅ Menu "' + name + '" has been updated successfully!');
        },

        // ===== PRINTER SIZE =====
        applyPrinterSize() {
            localStorage.setItem('defaultPrinterSize', this.defaultPrinterSize);
            this.showToast('⚙️ Printer setting updated to: ' + this.defaultPrinterSize);
        },

        // ===== TOAST =====
        showToast(msg) {
            this.toastMessage = msg;
            this.toast.show();
        }
    };
}