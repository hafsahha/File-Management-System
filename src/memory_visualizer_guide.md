# Visualisasi Memori untuk Sistem Manajemen File

Dokumen ini menjelaskan cara menggunakan Visualisasi Alokasi Memori untuk memahami bagaimana berbagai strategi alokasi penyimpanan file bekerja dalam sistem manajemen file kami.

## Gambaran Umum

Visualizer memori menyediakan representasi grafis tentang bagaimana file disimpan dalam memori menggunakan berbagai strategi alokasi:

1. **Alokasi Kontigu** (Blok Hijau)
   - File disimpan dalam blok-blok yang berurutan
   - Akses berurutan yang cepat
   - Dapat menyebabkan fragmentasi eksternal

2. **Alokasi Tertaut** (Blok Ungu)
   - File disimpan dalam blok-blok yang mungkin tersebar
   - Setiap blok menunjuk ke blok berikutnya
   - Menghilangkan fragmentasi eksternal
   - Akses lebih lambat karena adanya pointer

3. **Alokasi Terindeks** (Blok Biru dengan Blok Indeks Oranye)
   - Menggunakan blok indeks (oranye) untuk menyimpan pointer ke blok data (biru)
   - Menggabungkan kelebihan dari alokasi kontigu dan tertaut
   - Baik untuk akses acak
   - Sedikit lebih banyak overhead karena adanya blok indeks

## Menggunakan Visualisasi Memori

### Operasi Dasar

1. Luncurkan visualizer memori dari aplikasi utama
2. Visualizer akan secara otomatis menampilkan status memori saat ini
3. Klik "Refresh View" untuk memperbarui tampilan secara manual

### Menjalankan Skenario Uji

Tombol "Run Test" akan membuat file uji menggunakan berbagai strategi alokasi:

1. File kecil (1-3 KB) menggunakan alokasi kontigu
2. File sedang (6-7 KB) menggunakan alokasi tertaut (dengan fragmentasi yang disengaja)
3. File besar (8-10 KB) menggunakan alokasi terindeks

Ini memungkinkan Anda mengamati bagaimana setiap strategi alokasi menangani berbagai ukuran file dan kondisi fragmentasi.

### Penyaringan dan Pencarian File

- Gunakan kotak pencarian untuk memfilter file berdasarkan nama atau strategi alokasi
- Urutkan file menggunakan menu dropdown berdasarkan:
  - Nama
  - Ukuran
  - Strategi Alokasi
  - Jumlah Blok yang Digunakan

### Memahami Grid Memori

- Setiap kotak mewakili blok memori 1 KB
- Warna menunjukkan jenis alokasi (lihat legenda)
- Arahkan kursor ke blok untuk informasi detail
- Blok kosong ditampilkan dengan warna putih/abu-abu

### Statistik

Visualizer menunjukkan statistik detail tentang penggunaan memori:

- Total blok dan persentase yang digunakan/kosong
- Persentase fragmentasi
- Rincian penggunaan blok berdasarkan strategi alokasi
- Informasi alokasi per file dan efisiensi

