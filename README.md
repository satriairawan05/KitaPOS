# 🏪 KitaPOS - Point of Sales System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat-square&logo=bootstrap)
![Alpine.js](https://img.shields.io/badge/Alpine.js-3.14-green?style=flat-square&logo=alpine.js)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)

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

1. **Kloning Repositori**
   Buka terminal atau *command prompt*, lalu jalankan perintah berikut:
```bash
   git clone [https://github.com/satriairawan05/KitaPOS.git](https://github.com/satriairawan05/KitaPOS.git)
   cd KitaPOS

Jalankan AplikasiKarena KitaPOS adalah aplikasi front-end berbasis web, Anda memiliki beberapa opsi untuk menjalankannya:Opsi 1: Gunakan ekstensi Live Server di Visual Studio Code.Opsi 2: Buka file index.html secara langsung melalui peramban web (browser) Anda.Opsi 3: Pindahkan folder KitaPOS ke direktori server lokal Anda (seperti htdocs pada XAMPP atau www pada Laragon), lalu akses melalui http://localhost/KitaPOS.Aplikasi siap digunakan! 🎉📖 Panduan PenggunaanAksiPanduan Langkah🍽️ Tambah Menu BaruKlik tombol Tambah pada bilah navigasi (navbar) → Isi formulir data menu → Klik Simpan.✏️ Edit Data MenuKlik ikon ✏️ (Edit) pada kartu menu yang diinginkan → Lakukan perubahan data → Klik Simpan Perubahan.🛒 Proses TransaksiKlik ikon ➕ pada menu pilihan → Item akan masuk ke keranjang → Klik Checkout → Pilih metode pembayaran → Konfirmasi & Selesai.📜 Lihat RiwayatNavigasikan ke menu History di navbar untuk meninjau seluruh catatan transaksi.🧮 Gunakan KalkulatorKlik menu Kalkulator di navbar (pada Desktop) atau ketuk floating button (pada Mobile).🏠 Kembali ke BerandaKlik ikon 🏠 di navbar atau gunakan floating button untuk kembali ke tampilan utama menu.📁 Struktur ProyekPlaintextKitaPOS/
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
🤝 KontribusiKami sangat mengapresiasi dan terbuka terhadap kontribusi dari komunitas! Jika Anda ingin berkontribusi, silakan ikuti alur kerja berikut:Lakukan Fork pada repositori ini.Kloning repositori hasil fork ke mesin lokal Anda.Buat branch baru untuk fitur atau perbaikan Anda (git checkout -b fitur-baru-saya).Lakukan Commit pada perubahan Anda (git commit -m 'Menambahkan fitur XYZ').Push ke branch tersebut (git push origin fitur-baru-saya).Buat Pull Request (PR) di repositori utama GitHub.Panduan Standar KontribusiAspekPanduanGaya KodePastikan format dan gaya penulisan konsisten dengan basis kode yang sudah ada.CommitTulis pesan commit yang deskriptif, ringkas, dan jelas.DokumentasiHarap perbarui file README.md jika perubahan Anda mencakup fitur atau langkah instalasi baru.PengujianPastikan aplikasi berjalan dengan baik dan bebas dari galat (bug) sebelum mengajukan Pull Request.Catatan: Jika Anda menemukan bug atau memiliki ide penambahan fitur, silakan buat laporan pada tab Issues di GitHub terlebih dahulu sebelum menulis kode.📄 LisensiProyek ini didistribusikan di bawah lisensi MIT License. Anda bebas untuk menggunakan, memodifikasi, dan mendistribusikan aplikasi ini, termasuk untuk keperluan komersial. Selengkapnya dapat dilihat pada file LICENSE.👨‍💻 Pengembang & KontakDeuwi Satriya IrawanPengembang utama dan inisiator proyek KitaPOS.