# Simulator Sistem File Virtual

Proyek ini adalah simulator sistem file yang dibangun menggunakan Electron dan Node.js untuk mendemonstrasikan bagaimana sistem operasi mengelola file dan direktori. Simulator ini menggabungkan antarmuka grafis dengan terminal berbasis perintah untuk operasi file.

## Identitas Kelompok

* **Kelas**: C1
* **Dosen Pengampu**: Dr. Rasim, S.T., M.T.
* **Kelompok**: 10
* **Anggota Kelompok**:
  * Daffa Faiz Restu Oktavian – 2309013
  * Devia Nursa’adah – 2006363
  * Hafsah Hamidah – 2311474
  * Lyan Nazhabil Dzuquwwa – 2308428
  

## Gambaran Umum

Simulator Sistem File menggunakan sistem file virtual dalam memori, bukan sistem file asli komputer Anda. Hal ini memungkinkan eksperimen yang aman tanpa memengaruhi file asli. Aplikasi ini memiliki antarmuka GUI seperti penjelajah file dan antarmuka terminal berbasis perintah, sehingga edukatif untuk memahami konsep manajemen file pada sistem operasi.

## Fitur

- **Sistem File Virtual Dalam Memori**: Semua operasi dilakukan pada sistem file yang disimulasikan
- **Antarmuka Ganda**:
  - GUI grafis dengan navigasi file/folder dan operasi
  - Terminal berbasis perintah untuk menjalankan perintah sistem file
- **Operasi File**:
  - Membuat direktori (`mkdir`)
  - Membuat file (`touch`)
  - Navigasi direktori (`cd`)
  - Menampilkan isi direktori (`ls`)
  - Menghapus file/folder (`rm`)
  - Menampilkan isi file (`cat`)
  - Mengganti nama file/folder (`rename`)
  - Melihat alokasi memori (`visualize` atau `vis`)
- **Strategi Alokasi Memori**:
  - Alokasi kontigu untuk file kecil
  - Alokasi tertaut untuk penyimpanan terfragmentasi
  - Alokasi terindeks untuk file besar
- **Visualisasi Memori**:
  - Representasi grafis blok penyimpanan
  - Blok berwarna berdasarkan jenis alokasi
  - Statistik penggunaan memori dan fragmentasi
  - Detail alokasi file dengan metrik efisiensi
  - Skenario uji untuk berbagai strategi alokasi
- **Representasi Visual**: Ikon untuk membedakan file dan folder

## Struktur Proyek

```
file-management-system/
├── index.html                # Antarmuka HTML utama
├── package.json              # Konfigurasi proyek dan dependensi
├── preload.js                # Mengekspos API Node.js dengan aman ke proses renderer
├── src/
│   ├── main.js               # Proses utama (titik masuk aplikasi)
│   ├── renderer.js           # Proses renderer (logika UI)
│   ├── components/           # Komponen UI
│   │   ├── ActionBar.js      # Komponen tombol aksi
│   │   ├── FileList.js       # Komponen tampilan daftar file
│   │   └── FileOperations.js # Penangan operasi file
│   ├── styles/
│   │   └── main.css          # Gaya aplikasi
│   └── utils/
│       └── virtualFileSystem.js  # Implementasi sistem file dalam memori
└── assets/
    └── icons/                # Ikon UI
        ├── delete.svg
        ├── file.svg
        └── folder.svg
```

## Instalasi

1. Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) di sistem Anda
2. Clone atau unduh repositori ini
3. Buka terminal dan navigasikan ke direktori proyek
4. Instal dependensi:
   ```
   npm install
   ```

## Menjalankan Aplikasi

Untuk memulai Simulator Sistem File:

```
npm start
```

## Cara Menggunakan

### Antarmuka GUI

- **Navigasi**: Klik nama folder untuk masuk ke direktori
- **Kembali**: Gunakan tombol kembali untuk kembali ke direktori induk
- **Refresh**: Klik tombol refresh untuk memperbarui daftar file
- **Hapus**: Gunakan tombol hapus di sebelah file/folder untuk menghapusnya
- **Toggle Terminal**: Buka antarmuka terminal untuk operasi yang lebih lanjut

### Antarmuka Terminal

Terminal mendukung perintah berikut:

- `ls [path]` - Menampilkan file dan direktori
- `cd <path>` - Berpindah direktori (gunakan `..` untuk naik satu level)
- `mkdir <dirname>` - Membuat direktori
- `rm <path>` - Menghapus file atau direktori
- `touch <filename>` - Membuat file kosong
- `nano <filename>` - Membuka file untuk diedit
- `pwd` - Menampilkan path direktori saat ini
- `help` - Menampilkan perintah yang tersedia
- `visualize` atau `vis` - Melihat alokasi memori

### Sistem File Virtual

Aplikasi dimulai dengan struktur direktori contoh yang memuat:
- `/documents/` - File dokumen contoh
- `/pictures/` - File gambar contoh
- `/music/` - File musik contoh

Struktur ini dimuat dalam memori dan tidak memengaruhi sistem file asli Anda.

## Tujuan Edukasi

Simulator ini dirancang untuk mendemonstrasikan bagaimana sistem operasi mengelola file dan direktori. Simulator ini mengilustrasikan konsep seperti:

- Hierarki dan path sistem file
- Operasi file (pembuatan, penghapusan, navigasi)
- Parsing dan eksekusi perintah
- Interaksi antarmuka pengguna dengan sistem file

## Detail Teknis

- **Framework**: Electron.js
- **UI**: HTML, CSS, dan JavaScript
- **Arsitektur**: Menggunakan proses utama dan proses renderer dengan komunikasi IPC
- **Sistem File**: Implementasi dalam memori untuk tujuan edukasi

## Kontribusi

Kontribusi sangat diterima! Silakan buka issue atau kirim pull request untuk peningkatan atau perbaikan bug.

## Lisensi

<<<<<<< HEAD
Proyek ini dilisensikan di bawah Lisensi MIT.
=======
Proyek ini dilisensikan di bawah Lisensi MIT.
>>>>>>> 677bacba6cc2e9afc4bba57f4629d51f2a44488c
