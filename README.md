# 🏪 KitaPOS - Point of Sales System

![KitaPOS](https://img.shields.io/badge/KitaPOS-v1.0-red?style=for-the-badge)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=for-the-badge&logo=bootstrap)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**KitaPOS** adalah aplikasi **Point of Sales (POS)** berbasis web yang dirancang khusus untuk **restoran dan usaha kuliner**. Dengan tampilan **responsif mobile-first** dan tema merah elegan, aplikasi ini siap membantu Anda mengelola transaksi penjualan dengan mudah, cepat, dan profesional.

---

## 📸 Tampilan Aplikasi

| Desktop View | Mobile View |
|--------------|-------------|
| Tampilan desktop dengan sidebar cart | Tampilan mobile dengan floating buttons |

> **Catatan:** Screenshot akan ditambahkan pada rilis berikutnya.

---

## ✨ Fitur Unggulan

### 1. 🍽️ Manajemen Menu
- Daftar menu ditampilkan dalam bentuk **card** dengan gambar atau emoji
- **Filter Kategori**: Makanan, Minuman, Cemilan
- **Pencarian menu** secara real-time
- **Status Stok**: Tersedia (✅), Stok Menipis (⚠️), Habis (❌) dengan visual badge
- **Tambah Menu Manual** dengan:
  - Nama menu
  - Harga (format Rupiah otomatis)
  - Kategori
  - Status stok
  - Upload gambar dengan preview
  - Emoji sebagai fallback
- **Edit Menu** yang sudah ada (ubah nama, harga, kategori, status, gambar, atau emoji)

### 2. 🛒 Keranjang Belanja
- Sidebar di desktop, slide-up panel di mobile
- Tambah/kurangi jumlah item dengan tombol **+** dan **-**
- Menampilkan subtotal per item dan total keseluruhan
- Badge notifikasi jumlah item di navbar
- Tombol **Checkout** untuk memproses pembayaran

### 3. 💳 Checkout & Pembayaran
- Ringkasan pesanan sebelum checkout
- **2 Metode Pembayaran:**
  - **💵 Cash**: Input nominal bayar, hitung kembalian otomatis
  - **📱 QRIS**: Total otomatis terisi, tidak perlu input manual
- Format Rupiah pada semua nilai (contoh: `Rp 50.000`, `Rp 100.000`)
- Validasi pembayaran (cash tidak boleh kurang)
- Tombol pintar **"Pas"** dan rekomendasi nominal untuk memudahkan input

### 4. 🧮 Kalkulator Terintegrasi
- Modal kalkulator dengan layout fisik (C, ⌫, ÷, ×, −, +)
- **Format ribuan otomatis**: `50000` → `50.000`, `100000` → `100.000`, `1000000` → `1.000.000`
- Dapat diakses dari navbar (desktop) atau floating button (mobile)
- Support keyboard (angka, operator, Enter, Backspace, Escape)

### 5. 📜 History Transaksi
- Menyimpan semua transaksi yang telah selesai
- **Detail transaksi**:
  - Nomor transaksi & waktu
  - Daftar item (nama, jumlah, harga)
  - Total pembayaran
  - Metode pembayaran
  - Jumlah bayar & kembalian (untuk Cash)
- **Grand Total** di bagian atas untuk ringkasan pendapatan
- Penyimpanan lokal menggunakan **localStorage** (data tetap ada setelah refresh)
- Hapus semua history dengan konfirmasi
- Hapus transaksi individual dengan tombol trash

### 6. 🏠 Tombol Home / Menu Utama
- Reset filter kategori ke "Semua"
- Kosongkan input pencarian
- Scroll halus ke bagian atas menu
- Tersedia di:
  - Navbar (desktop)
  - Navbar (mobile)
  - Floating button (mobile)

### 7. 📱 Mobile-First Responsive
- Tampilan optimal di semua ukuran layar
- **Desktop**: Sidebar cart di sebelah kanan
- **Mobile**: Cart slide-down dari atas, floating buttons
- **Floating Buttons** di mobile:
  - Kalkulator (kanan bawah, atas)
  - Home (kanan bawah, bawah)
  - Keranjang (tengah bawah)

### 8. 🎨 Tema & UI/UX
- **Warna utama**: `#ED020E` (merah elegan)
- **Aksen**: `#ffc107` (kuning) untuk highlight
- **Select2** untuk dropdown yang stylish
- **Toast notification** untuk feedback aksi
- **Modal** yang elegan untuk semua form
- **Animasi transisi** yang halus

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Deskripsi |
|-----------|-----------|
| **HTML5** | Struktur halaman |
| **CSS3** | Styling dengan tema `#ED020E` |
| **Bootstrap 5.3** | Framework CSS responsive |
| **Bootstrap Icons** | Library ikon |
| **JavaScript (ES6)** | Logika aplikasi |
| **jQuery** | Dependency untuk Select2 |
| **Select2** | Dropdown yang stylish |
| **localStorage** | Penyimpanan history transaksi |

---

## 📁 Struktur File
KitaPOS/
├── index.html # Halaman utama
├── assets/
│ ├── css/
│ │ └── style.css # Custom CSS (tema #ED020E)
│ ├── js/
│ │ └── script.js # JavaScript utama
│ └── data/
│ └── data.json # Data menu contoh
└── README.md # Dokumentasi ini

text

---

## 🚀 Cara Menggunakan

### 1. Menambahkan Menu
- Klik tombol **"Tambah"** di navbar
- Isi form:
  - **Nama menu** (wajib)
  - **Harga** (wajib)
  - **Kategori**
  - **Status stok**
  - **Upload gambar** (opsional)
  - **Emoji** (fallback jika gambar tidak ada)
- Klik **"Simpan Menu"**

### 2. Mengedit Menu
- Klik tombol **✏️ (edit)** pada kartu menu yang ingin diubah
- Ubah data sesuai kebutuhan
- Klik **"Simpan Perubahan"**

### 3. Melakukan Transaksi
- Klik tombol **➕ (tambah)** atau **"Tambah"** pada menu yang ingin dipesan
- Item akan masuk ke keranjang (lihat sidebar/panel)
- Jika perlu, tambah/kurangi jumlah dengan tombol **-**
- Klik **"Checkout"**
- Pilih metode pembayaran:
  - **Cash**: Masukkan nominal bayar, lihat kembalian
  - **QRIS**: Total otomatis terisi
- Klik **"Konfirmasi & Selesai"**

### 4. Melihat History
- Klik tombol **"History"** di navbar
- Modal akan menampilkan semua transaksi yang pernah dilakukan
- **Grand Total** otomatis terhitung di bagian atas
- Klik tombol **🗑️** untuk menghapus transaksi individual
- Klik **"Hapus Semua"** untuk membersihkan semua history (dengan konfirmasi)

### 5. Menggunakan Kalkulator
- **Desktop**: Klik tombol **"Kalkulator"** di navbar
- **Mobile**: Klik floating button kalkulator di kanan bawah
- Gunakan tombol atau keyboard untuk menghitung
- Angka otomatis diformat dengan pemisah ribuan

### 6. Kembali ke Menu Utama
- **Desktop**: Klik ikon rumah 🏠 di navbar
- **Mobile**: Klik ikon rumah di navbar atau floating button kiri bawah

---

## 🎯 Fitur Detail

### Format Rupiah
Semua nilai uang secara otomatis diformat dengan pemisah ribuan:
- `25000` → `Rp 25.000`
- `100000` → `Rp 100.000`
- `1500000` → `Rp 1.500.000`

### Status Stok

| Status | Badge | Deskripsi |
|--------|-------|-----------|
| **Tersedia** | ✅ Tersedia (hijau) | Menu dapat dipesan |
| **Stok Menipis** | ⚠️ Stok Menipis (kuning) | Stok hampir habis |
| **Habis** | ❌ Habis (merah) | Menu tidak dapat dipesan |

### Metode Pembayaran

| Metode | Fitur |
|--------|-------|
| **Cash** | Input nominal, hitung kembalian, validasi |
| **QRIS** | Total otomatis, tanpa input manual |

---

## 🔧 Integrasi dengan Laravel

Jika Anda ingin mengintegrasikan **KitaPOS** dengan **Laravel**, ikuti langkah-langkah berikut:

### 1. Pindahkan File ke Struktur Laravel
resources/views/pos/index.blade.php # Ganti nama index.html
public/assets/css/style.css # Pindahkan ke public/assets/css/
public/assets/js/script.js # Pindahkan ke public/assets/js/
public/assets/data/data.json # Pindahkan ke public/assets/data/

text

### 2. Ubah Ekstensi `.html` menjadi `.blade.php`

Ganti `index.html` menjadi `index.blade.php` dan letakkan di `resources/views/pos/`.

### 3. Siapkan Controller dan Route

```php
// routes/web.php
Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
Route::post('/api/transactions', [PosController::class, 'store'])->name('pos.store');
Route::get('/api/menus', [PosController::class, 'getMenus'])->name('pos.menus');
php
// app/Http/Controllers/PosController.php
<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;

class PosController extends Controller
{
    public function index()
    {
        $menus = Menu::all();
        return view('pos.index', compact('menus'));
    }

    public function getMenus()
    {
        return response()->json(Menu::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'method' => 'required|string',
            'total' => 'required|numeric',
            'paid' => 'required|numeric',
            'change' => 'required|numeric',
            'items' => 'required|array'
        ]);

        $transaction = Transaction::create([
            'method' => $request->method,
            'total' => $request->total,
            'paid' => $request->paid,
            'change' => $request->change,
        ]);

        foreach ($request->items as $item) {
            TransactionItem::create([
                'transaction_id' => $transaction->id,
                'name' => $item['name'],
                'qty' => $item['qty'],
                'price' => $item['price'],
                'subtotal' => $item['price'] * $item['qty'],
            ]);
        }

        return response()->json(['success' => true, 'transaction' => $transaction]);
    }
}

### 4. Buat Model dan Migration
bash
php artisan make:model Menu -m
php artisan make:model Transaction -m
php artisan make:model TransactionItem -m
Migration Menu:

php
Schema::create('menus', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->integer('price');
    $table->string('category');
    $table->string('status')->default('available');
    $table->string('icon')->nullable();
    $table->string('image')->nullable();
    $table->timestamps();
});
Migration Transaction:

php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->string('method');
    $table->integer('total');
    $table->integer('paid');
    $table->integer('change')->default(0);
    $table->timestamps();
});
Migration TransactionItem:

php
Schema::create('transaction_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
    $table->string('name');
    $table->integer('qty');
    $table->integer('price');
    $table->integer('subtotal');
    $table->timestamps();
});

### 5. Modifikasi JavaScript untuk Gunakan API
Ubah fungsi loadMenuData():

javascript
async function loadMenuData() {
    try {
        const response = await fetch('/api/menus');
        const data = await response.json();
        menuItems = data.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            status: item.status,
            icon: item.icon,
            image: item.image
        }));
        renderMenu();
        updateCartUI();
    } catch (error) {
        console.error('Error loading menus:', error);
        // fallback ke data default
    }
}
Ubah fungsi saveTransaction():

javascript
function saveTransaction(method, total, paid, change) {
    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
            method: method,
            total: total,
            paid: paid,
            change: change,
            items: cart.map(item => ({
                name: item.name,
                qty: item.qty,
                price: item.price
            }))
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Refresh history
            loadHistoryFromDatabase();
        }
    })
    .catch(error => console.error('Error:', error));
}

### 6. Tambahkan CSRF Token di Blade
blade
<meta name="csrf-token" content="{{ csrf_token() }}">

### 7. Siapkan Seeder untuk Data Awal
bash
php artisan make:seeder MenuSeeder
php
// database/seeders/MenuSeeder.php
public function run()
{
    Menu::create([
        'name' => 'Nasi Goreng',
        'price' => 25000,
        'category' => 'makanan',
        'status' => 'available',
        'icon' => '🍚'
    ]);
    // Tambahkan data lainnya...
}
📝 Catatan Penting
Data Menu saat ini disimpan di data.json atau hardcoded di script.js

History disimpan di localStorage (akan hilang jika clear browser)

Gambar disimpan sebagai base64 (untuk demo, tidak untuk production)

Untuk production, gunakan upload file ke server dan simpan path-nya

Data.json harus berada di assets/data/data.json untuk loading awal

🤝 Kontribusi
Kami sangat terbuka untuk kontribusi! Silakan:

Fork repository ini

Buat branch fitur baru (git checkout -b fitur-keren)

Commit perubahan Anda (git commit -m 'Menambahkan fitur keren')

Push ke branch (git push origin fitur-keren)

Buat Pull Request

📄 Lisensi
MIT License - Bebas digunakan untuk keperluan apapun, termasuk komersial.

👨‍💻 Author
Deuwi Satriya Irawan

https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white
https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white
https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white
https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white