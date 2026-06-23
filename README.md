# 🏪 KitaPOS - Point of Sales System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat-square&logo=bootstrap)
![Alpine.js](https://img.shields.io/badge/Alpine.js-3.14-green?style=flat-square&logo=alpine.js)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/satriairawan05/KitaPOS?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/satriairawan05/KitaPOS?style=flat-square)

**KitaPOS** adalah sistem aplikasi *Point of Sales* (POS) berbasis web yang dirancang khusus untuk mempermudah operasional restoran, kafe, dan berbagai jenis usaha kuliner. Dengan memanfaatkan arsitektur reaktif dari Alpine.js dan desain antarmuka responsif dari Bootstrap 5, KitaPOS memberikan pengalaman pengguna yang cepat, ringan, dan intuitif tanpa mengorbankan performa.

---

## 📋 Daftar Isi

- [Fitur Unggulan](#-fitur-unggulan)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Panduan Instalasi](#-panduan-instalasi)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Struktur Proyek](#-struktur-proyek)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)
- [Pengembang & Kontak](#-pengembang--kontak)

---

## ✨ Fitur Unggulan

| Fitur | Deskripsi |
| :--- | :--- |
| 🍽️ **Manajemen Menu Terpadu** | Penambahan, pembaruan, dan pemfilteran kategori secara dinamis. Dilengkapi manajemen status stok dan pencarian *real-time* dengan kapabilitas reaktif Alpine.js. |
| 🛒 **Keranjang Belanja Dinamis** | Kontrol kuantitas item, perhitungan subtotal dan total otomatis, serta notifikasi berbasis *badge*. Tersedia fitur "Reset to 2" untuk item berjumlah lebih dari dua. |
| 💳 **Sistem Checkout Fleksibel** | Mendukung metode pembayaran Tunai (*Cash*) dan QRIS. Otomatisasi perhitungan kembalian dengan format mata uang Rupiah. Dilengkapi tombol *Quick Pay* untuk transaksi instan. |
| 🧮 **Kalkulator Terintegrasi** | Antarmuka tata letak fisik dengan dukungan format ribuan dan input dari *keyboard*, memudahkan staf kasir dalam perhitungan cepat. |
| 📜 **Riwayat Transaksi** | Dokumentasi lengkap riwayat penjualan, perhitungan *Grand Total* (*Opening Balance* + Total Transaksi), dan manajemen data history (hapus individual/semua). |
| 🖨️ **Dukungan Pencetakan Struk** | Fleksibilitas pencetakan struk transaksi untuk ukuran printer termal 58mm maupun 80mm yang dapat disesuaikan melalui pengaturan. |
| 📱 **Desain Antarmuka Responsif** | Optimalisasi tata letak untuk perangkat desktop dan *mobile*, didukung *floating buttons* dan menu keranjang *slide-up* untuk layar kecil. |
| ⚡ **Performa Reaktif** | Pengelolaan *state* dan logika secara menyeluruh menggunakan Alpine.js, memastikan basis kode JavaScript yang minimalis, terstruktur, dan efisien. |

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Peran & Fungsi |
| :--- | :--- |
| **HTML5 & CSS3** | Struktur kerangka dan penataan gaya dasar antarmuka. |
| **Bootstrap 5.3** | *Framework* CSS utama untuk memastikan desain yang responsif dan modern. |
| **Alpine.js 3.14** | *Framework* JavaScript reaktif untuk menangani *state management* dan interaksi UI. |
| **jQuery & Select2** | Implementasi *dropdown* yang lebih interaktif dan estetis pada elemen modal. |
| **localStorage API** | Penyimpanan basis data sisi klien (katalog menu, riwayat transaksi, saldo awal, dan pengaturan printer). |

---

## 🚀 Panduan Instalasi

Anda dapat menjalankan KitaPOS di mesin lokal Anda dengan mengikuti langkah-langkah berikut:

### 1. Kloning Repositori
Buka terminal atau *command prompt*, lalu jalankan perintah berikut:

```bash
git clone https://github.com/satriairawan05/KitaPOS.git
cd KitaPOS
2. Jalankan Aplikasi
Karena KitaPOS adalah aplikasi front-end berbasis web, Anda memiliki beberapa opsi untuk menjalankannya:

Opsi	Deskripsi
Live Server (VSCode)	Gunakan ekstensi Live Server di Visual Studio Code untuk menjalankan aplikasi secara hot-reload.
Browser Langsung	Buka file index.html secara langsung melalui peramban web (browser) Anda.
Server Lokal	Pindahkan folder KitaPOS ke direktori server lokal Anda (seperti htdocs pada XAMPP atau www pada Laragon), lalu akses melalui http://localhost/KitaPOS.
Aplikasi siap digunakan! 🎉

📖 Panduan Penggunaan
Aksi	Panduan Langkah
🍽️ Tambah Menu Baru	Klik tombol Tambah pada bilah navigasi (navbar) → Isi formulir data menu → Klik Simpan.
✏️ Edit Data Menu	Klik ikon ✏️ (Edit) pada kartu menu yang diinginkan → Lakukan perubahan data → Klik Simpan Perubahan.
🛒 Proses Transaksi	Klik ikon ➕ pada menu pilihan → Item akan masuk ke keranjang → Klik Checkout → Pilih metode pembayaran → Konfirmasi & Selesai.
📜 Lihat Riwayat	Navigasikan ke menu History di navbar untuk meninjau seluruh catatan transaksi.
🧮 Gunakan Kalkulator	Klik menu Kalkulator di navbar (pada Desktop) atau ketuk floating button (pada Mobile).
🏠 Kembali ke Beranda	Klik ikon 🏠 di navbar atau gunakan floating button untuk kembali ke tampilan utama menu.
📁 Struktur Proyek
plaintext
KitaPOS/
├── 📄 index.html             # Berkas utama aplikasi yang memuat antarmuka & Alpine.js
├── 📁 assets/
│   ├── 📁 css/
│   │   └── 🎨 style.css      # Custom CSS (menggunakan tema utama merah #ED020E)
│   ├── 📁 js/
│   │   └── ⚡ script.js      # Logika Alpine app dan fungsi utilitas pendukung
│   └── 📁 data/
│       └── 📊 data.js        # Data dummy/katalog menu bawaan aplikasi
├── 📄 README.md              # Dokumentasi lengkap proyek
└── 📄 LICENSE                # Berkas lisensi (MIT License)
🤝 Kontribusi
Kami sangat mengapresiasi dan terbuka terhadap kontribusi dari komunitas! Jika Anda ingin berkontribusi, silakan ikuti alur kerja berikut:

Fork repositori ini.

Clone repositori hasil fork ke mesin lokal Anda:

bash
git clone https://github.com/username/KitaPOS.git
cd KitaPOS
Buat branch baru untuk fitur atau perbaikan Anda:

bash
git checkout -b fitur-baru-saya
Lakukan commit pada perubahan Anda:

bash
git commit -m 'Menambahkan fitur XYZ'
Push ke branch tersebut:

bash
git push origin fitur-baru-saya
Buat Pull Request di repositori utama GitHub.

📋 Panduan Standar Kontribusi
Aspek	Panduan
Gaya Kode	Pastikan format dan gaya penulisan konsisten dengan basis kode yang sudah ada.
Pesan Commit	Tulis pesan commit yang deskriptif, ringkas, dan jelas.
Dokumentasi	Harap perbarui file README.md jika perubahan Anda mencakup fitur atau langkah instalasi baru.
Pengujian	Pastikan aplikasi berjalan dengan baik dan bebas dari galat (bug) sebelum mengajukan Pull Request.
Catatan: Jika Anda menemukan bug atau memiliki ide penambahan fitur, silakan buat laporan pada tab Issues di GitHub terlebih dahulu sebelum menulis kode.

📄 Lisensi
Proyek ini didistribusikan di bawah lisensi MIT License. Anda bebas untuk menggunakan, memodifikasi, dan mendistribusikan aplikasi ini, termasuk untuk keperluan komersial. Selengkapnya dapat dilihat pada file LICENSE.

👨‍💻 Pengembang & Kontak
Deuwi Satriya Irawan
Pengembang utama dan inisiator proyek KitaPOS.

<p align="center"> <a href="https://github.com/satriairawan05" target="_blank"> <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"> </a> <a href="https://www.linkedin.com/in/satriai418" target="_blank"> <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"> </a> <a href="https://instagram.com/satriai418" target="_blank"> <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"> </a> <a href="https://wa.me/6282253332802" target="_blank"> <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp"> </a> </p>
KitaPOS – Solusi POS Modern untuk Usaha Kuliner Anda.
Dibangun dengan ❤️ oleh tim Kernel of Inventory Talent and Asset.