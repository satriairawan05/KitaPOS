KitaPOS - Point of Sales System
https://img.shields.io/badge/KitaPOS-v1.0-red?style=for-the-badge&logo=pos&logoColor=white
https://img.shields.io/badge/Bootstrap-5.3-purple?style=for-the-badge&logo=bootstrap
https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript
https://img.shields.io/badge/License-MIT-green?style=for-the-badge

KitaPOS adalah aplikasi Point of Sales (POS) berbasis web yang dirancang khusus untuk restoran dan usaha kuliner. Dengan tampilan responsif mobile-first dan tema merah elegan, aplikasi ini siap membantu Anda mengelola transaksi penjualan dengan mudah dan cepat.

📸 Screenshot
Desktop View	Mobile View
Tampilan desktop dengan sidebar cart	Tampilan mobile dengan floating buttons
✨ Fitur Unggulan
1. 🍽️ Manajemen Menu
Daftar Menu ditampilkan dalam bentuk card dengan gambar/emoji

Filter Kategori: Makanan, Minuman, Cemilan

Pencarian menu secara real-time

Status Stok: Tersedia, Stok Menipis, Habis (dengan visual badge)

Tambah Menu Manual dengan:

Nama menu

Harga (format Rupiah otomatis)

Kategori

Status stok

Upload gambar dengan preview

Emoji sebagai fallback

2. 🛒 Keranjang Belanja
Sidebar di desktop, slide-up panel di mobile

Tambah/kurangi jumlah item dengan tombol + dan -

Menampilkan subtotal per item dan total keseluruhan

Badge notifikasi jumlah item di navbar

3. 💳 Checkout & Pembayaran
Ringkasan pesanan sebelum checkout

2 Metode Pembayaran:

💵 Cash: Input nominal bayar, hitung kembalian otomatis

📱 QRIS: Total otomatis terisi, tidak perlu input manual

Format Rupiah pada semua nilai (Rp 50.000, Rp 100.000)

Validasi pembayaran (cash tidak boleh kurang)

4. 🧮 Kalkulator Terintegrasi
Modal kalkulator dengan layout fisik

Tombol: C, ⌫, ÷, ×, −, +

Dapat diakses dari navbar (desktop) atau floating button (mobile)

Support keyboard (angka, operator, Enter, Backspace, Escape)

5. 📜 History Transaksi
Menyimpan semua transaksi yang telah selesai

Detail transaksi:

Nomor transaksi & waktu

Daftar item (nama, jumlah, harga)

Total pembayaran

Metode pembayaran

Jumlah bayar & kembalian (untuk Cash)

Penyimpanan lokal menggunakan localStorage (data tetap ada setelah refresh)

Hapus semua history dengan konfirmasi

6. 🏠 Tombol Home / Menu Utama
Reset filter kategori ke "Semua"

Kosongkan input pencarian

Scroll halus ke bagian atas menu

Tersedia di:

Navbar (desktop)

Navbar (mobile)

Floating button (mobile)

7. 📱 Mobile-First Responsive
Tampilan optimal di semua ukuran layar

Desktop: Sidebar cart di sebelah kanan

Mobile: Cart slide-up dari bawah, floating buttons

Floating Buttons di mobile:

Kalkulator (atas)

Home (bawah)

Keranjang (tengah bawah)

8. 🎨 Tema & UI/UX
Warna utama: #ED020E (merah)

Aksen: #ffc107 (kuning) untuk highlight

Select2 untuk dropdown yang stylish

Toast notification untuk feedback aksi

Modal yang elegan untuk semua form

🛠️ Teknologi yang Digunakan
Teknologi	Deskripsi
HTML5	Struktur halaman
CSS3	Styling dengan tema #ED020E
Bootstrap 5.3	Framework CSS responsive
Bootstrap Icons	Library ikon
JavaScript (ES6)	Logika aplikasi
jQuery	Dependency untuk Select2
Select2	Dropdown yang stylish
localStorage	Penyimpanan history transaksi
📁 Struktur File
text
KitaPOS/
├── index.html              # Halaman utama
├── assets/
│   ├── css/
│   │   └── style.css      # Custom CSS (tema #ED020E)
│   └── js/
│       └── script.js      # JavaScript utama
└── README.md              # Dokumentasi ini
🚀 Cara Menggunakan
1. Menambahkan Menu
Klik tombol "Tambah" di navbar

Isi form:

Nama menu (wajib)

Harga (wajib)

Kategori

Status stok

Upload gambar (opsional)

Emoji (fallback jika gambar tidak ada)

Klik "Simpan Menu"

2. Melakukan Transaksi
Klik "Tambah" pada menu yang ingin dipesan

Item akan masuk ke keranjang (lihat sidebar/panel)

Jika perlu, tambah/kurangi jumlah dengan tombol - di keranjang

Klik "Checkout"

Pilih metode pembayaran:

Cash: Masukkan nominal bayar, lihat kembalian

QRIS: Total otomatis terisi

Klik "Konfirmasi & Selesai"

3. Melihat History
Klik tombol "History" di navbar

Modal akan menampilkan semua transaksi yang pernah dilakukan

Klik "Hapus Semua" untuk membersihkan history (dengan konfirmasi)

4. Menggunakan Kalkulator
Desktop: Klik tombol "Kalkulator" di navbar

Mobile: Klik floating button kalkulator di kanan bawah

Gunakan tombol atau keyboard untuk menghitung

5. Kembali ke Menu Utama
Desktop: Klik ikon rumah di navbar

Mobile: Klik ikon rumah di navbar atau floating button kiri bawah

🎯 Fitur Detail
Format Rupiah
Semua nilai uang secara otomatis diformat dengan pemisah ribuan:

25000 → Rp 25.000

100000 → Rp 100.000

1500000 → Rp 1.500.000

Status Stok
Status	Badge	Deskripsi
Tersedia	✅ Tersedia (hijau)	Menu dapat dipesan
Stok Menipis	⚠️ Stok Menipis (kuning)	Stok hampir habis
Habis	❌ Habis (merah)	Menu tidak dapat dipesan
Metode Pembayaran
Metode	Fitur
Cash	Input nominal, hitung kembalian, validasi
QRIS	Total otomatis, tanpa input manual
🔧 Integrasi dengan Laravel
Jika Anda ingin mengintegrasikan dengan Laravel:

1. Pindahkan File
text
resources/views/pos/index.blade.php  # index.html
public/assets/css/style.css          # assets/css/style.css
public/assets/js/script.js           # assets/js/script.js
2. Ganti Data Menu dengan Blade
blade
<!-- Di index.blade.php -->
<script>
    let menuItems = @json($menus);
</script>
3. Ganti localStorage dengan Database
Modifikasi fungsi saveTransaction() untuk menyimpan ke database via AJAX:

javascript
function saveTransaction(method, total, paid, change) {
    $.ajax({
        url: '/api/transactions',
        method: 'POST',
        data: {
            method: method,
            total: total,
            paid: paid,
            change: change,
            items: cart
        },
        success: function() {
            // Refresh history
        }
    });
}
4. Simpan History ke Database
Buat model Transaction dan TransactionItem untuk menyimpan data.

📝 Catatan
Data Menu saat ini bersifat statis (hardcoded di script.js)

History disimpan di localStorage (akan hilang jika clear browser)

Gambar disimpan sebagai base64 (untuk demo, tidak untuk production)

Untuk production, gunakan upload file ke server dan simpan path-nya

🤝 Kontribusi
Silakan fork repository ini dan buat pull request untuk perbaikan atau fitur baru.

📄 Lisensi
MIT License - bebas digunakan untuk keperluan apapun.

👨‍💻 Author
Deuwi Satriya Irawan