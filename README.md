# Simulator Sistem Berkas Virtual

Proyek ini adalah simulator sistem berkas yang dibangun menggunakan **Electron** dan **Node.js** yang mendemonstrasikan bagaimana sistem operasi mengelola berkas dan direktori. Proyek ini menggabungkan antarmuka pengguna grafis (GUI) dengan terminal baris perintah untuk operasi berkas.

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

Simulator Sistem Berkas ini menggunakan sistem berkas virtual yang ada di memori (in-memory) daripada sistem berkas yang sesungguhnya di komputer. Hal ini memungkinkan eksperimen yang aman tanpa mempengaruhi berkas asli. Aplikasi ini memiliki antarmuka GUI yang mirip dengan file explorer dan antarmuka terminal baris perintah, yang membuatnya cocok untuk pembelajaran konsep manajemen berkas pada sistem operasi.

## Fitur

* **Sistem Berkas Virtual di Memori**: Semua operasi dilakukan pada sistem berkas yang disimulasikan
* **Antarmuka Ganda**:

  * GUI grafis untuk navigasi berkas/folder dan operasi
  * Terminal baris perintah untuk mengeksekusi perintah sistem berkas
* **Operasi Berkas**:

  * Membuat direktori (`mkdir`)
  * Membuat berkas (`touch`)
  * Menavigasi direktori (`cd`)
  * Menampilkan isi direktori (`ls`)
  * Menghapus berkas/folder (`rm`)
  * Menampilkan isi berkas (`cat`)
  * Menampilkan jalur direktori saat ini (`pwd`)
  * Menampilkan teks (`echo`)
* **Representasi Visual**: Ikon untuk membedakan antara berkas dan folder

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
│   │   ├── FileList.js       # Komponen tampilan daftar berkas
│   │   └── FileOperations.js # Penangan operasi berkas
│   ├── styles/
│   │   └── main.css          # Gaya aplikasi
│   └── utils/
│       └── virtualFileSystem.js  # Implementasi sistem berkas dalam memori
└── assets/
    └── icons/                # Ikon UI
        ├── delete.svg
        ├── file.svg
        └── folder.svg
```

## Instalasi

1. Pastikan kamu telah menginstal [Node.js](https://nodejs.org/) di sistemmu
2. Clone atau unduh repositori ini
3. Buka terminal dan navigasikan ke direktori proyek
4. Instal dependensi:

   ```
   npm install
   ```

## Menjalankan Aplikasi

Untuk memulai **Simulator Sistem Berkas**:

```
npm start
```

## Cara Menggunakan

### Antarmuka GUI

* **Navigasi**: Klik pada nama folder untuk menavigasi ke direktori
* **Kembali**: Gunakan tombol kembali untuk kembali ke direktori induk
* **Segarkan**: Klik tombol segarkan untuk memperbarui daftar berkas
* **Hapus**: Gunakan tombol hapus di samping berkas/folder untuk menghapusnya
* **Toggle Terminal**: Buka antarmuka baris perintah untuk operasi lebih lanjut

### Antarmuka Terminal

Terminal mendukung perintah berikut:

* `ls [path]` - Menampilkan berkas dan direktori
* `cd <path>` - Mengubah direktori (gunakan `..` untuk naik satu level)
* `mkdir <dirname>` - Membuat direktori
* `rm <path>` - Menghapus berkas atau direktori
* `touch <filename>` - Membuat berkas kosong
* `cat <filename>` - Menampilkan isi berkas
* `pwd` - Menampilkan jalur direktori saat ini
* `echo <text>` - Menampilkan teks
* `help` - Menampilkan perintah yang tersedia

### Sistem Berkas Virtual

Aplikasi ini dimulai dengan struktur direktori contoh yang berisi:

* `/documents/` - Berkas dokumen contoh
* `/pictures/` - Berkas gambar contoh
* `/music/` - Berkas musik contoh

Struktur ini dimuat di memori dan tidak mempengaruhi sistem berkas asli.

## Tujuan Pendidikan

Simulator ini dirancang untuk mendemonstrasikan bagaimana sistem operasi mengelola berkas dan direktori. Ini mengilustrasikan konsep-konsep seperti:

* Hierarki dan jalur sistem berkas
* Operasi berkas (pembuatan, penghapusan, navigasi)
* Parsing perintah dan eksekusi
* Interaksi antarmuka pengguna dengan sistem berkas

## Detail Teknis

* **Framework**: Electron.js
* **UI**: HTML, CSS, dan JavaScript
* **Arsitektur**: Menggunakan proses utama dan proses renderer dengan komunikasi IPC
* **Sistem Berkas**: Implementasi kustom dalam memori untuk tujuan pendidikan
```

  │   ├── components            # Berisi komponen yang dapat digunakan kembali
  │   │   ├── FileList.js       # Menampilkan daftar berkas dan direktori
  │   │   ├── ActionBar.js      # Berisi tombol untuk operasi berkas
  │   │   └── FileOperations.js  # Logika operasi berkas
  │   ├── utils                 # Fungsi utilitas untuk operasi sistem berkas
  │   │   └── fileSystem.js     # Mengabstraksi interaksi dengan sistem berkas
  │   └── styles                # Gaya untuk aplikasi
  │       └── main.css          # Gaya utama
  ├── assets                    # Berisi aset seperti ikon
  │   └── icons
  │       ├── folder.svg        # Ikon untuk folder
  │       ├── file.svg          # Ikon untuk berkas
  │       └── delete.svg        # Ikon untuk aksi hapus
  ├── index.html                # Berkas HTML utama
  ├── package.json              # Berkas konfigurasi untuk npm
  ├── preload.js                # Mengekspos fungsionalitas Node.js dengan aman
  └── README.md                 # Dokumentasi proyek

```

## Instalasi

1. Clone repositori:
```

git clone <repository-url>
cd file-management-system

```

2. Instal dependensi:
```

npm install

```

3. Mulai aplikasi:
```

npm start

```

## Penggunaan

- Jalankan aplikasi untuk melihat antarmuka manajemen berkas.
- Gunakan bilah aksi untuk membuat direktori, menghapus berkas, dan memperbarui daftar berkas.
- Navigasi melalui sistem berkas menggunakan fungsionalitas yang disediakan.

## Kontribusi

Kontribusi sangat diterima! Silakan buka issue atau kirim pull request untuk peningkatan atau perbaikan bug.

## Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

