# Student Management System — Phase 2 Live Coding (XAMPP Edition)

Panduan praktik membangun aplikasi CRUD mahasiswa menggunakan **XAMPP (MariaDB/MySQL-compatible) + phpMyAdmin + Node.js + Express + Sequelize + HTML/CSS/Vanilla JavaScript**.

> Catatan penting: XAMPP umumnya membundel MariaDB sebagai pengganti MySQL. MariaDB kompatibel dengan protokol dan driver MySQL untuk praktik dasar ini. Di materi kelas, sebut secara akurat: "MariaDB yang disertakan dalam XAMPP, kompatibel dengan MySQL". Sequelize dapat mengaksesnya melalui dialect `mysql`.

## 1. Hasil akhir

Peserta akan membuat aplikasi Student Management System yang dapat digunakan melalui browser untuk:

- Melihat daftar mahasiswa (Read).
- Menambahkan mahasiswa (Create).
- Mengubah data mahasiswa (Update).
- Menghapus data mahasiswa (Delete).
- Memeriksa isi database melalui phpMyAdmin.
- Membuktikan data tetap tersimpan setelah backend direstart.

## 2. Teknologi dan fungsi

| Teknologi | Fungsi |
|---|---|
| XAMPP Control Panel | Mengelola service lokal, terutama Apache dan MySQL/MariaDB |
| MariaDB dari XAMPP | Database relasional untuk menyimpan data |
| phpMyAdmin | Antarmuka web untuk membuat database, tabel, dan memeriksa data |
| Node.js + Express | Menjalankan backend REST API |
| Sequelize | ORM yang menghubungkan model JavaScript dengan database |
| HTML | Struktur halaman |
| CSS | Tampilan halaman |
| Vanilla JavaScript | Interaksi browser, `fetch()`, JSON, dan manipulasi DOM |
| Postman | Menguji endpoint REST API |

**Penting:** XAMPP bukan database. phpMyAdmin juga bukan database. XAMPP adalah paket lingkungan lokal; MariaDB adalah database engine; phpMyAdmin adalah alat administrasinya. Node.js tidak membutuhkan Apache untuk menjalankan Express.

## 3. Prasyarat

Sebelum kelas:

1. Install XAMPP.
2. Buka XAMPP Control Panel.
3. Start **MySQL**. Start Apache jika ingin menyajikan frontend melalui `http://localhost`.
4. Buka `http://localhost/phpmyadmin`.
5. Pastikan Node.js dan npm tersedia:
   ```bash
   node -v
   npm -v
   ```
6. Siapkan project backend Node.js + Express dan Postman.
7. Pastikan port database diketahui. Default XAMPP biasanya `3306`; jika berubah, gunakan port yang terlihat pada konfigurasi XAMPP.

### Jika MySQL XAMPP tidak bisa Start

- Periksa apakah service MySQL/MariaDB lain sudah menggunakan port `3306`.
- Tutup service database lain yang tidak diperlukan atau ubah port XAMPP dengan arahan tutor.
- Jangan menjalankan dua database server pada port yang sama.
- Pastikan peserta menggunakan host dan port yang sama pada Sequelize.

## 4. Membuat database melalui phpMyAdmin

1. Start MySQL dari XAMPP Control Panel.
2. Buka `http://localhost/phpmyadmin`.
3. Pilih **New**.
4. Buat database bernama `student_management`.
5. Pilih collation `utf8mb4_general_ci` jika tersedia.
6. Klik database tersebut untuk memastikan database berhasil dibuat.

Untuk kelas, gunakan database lokal latihan. Jangan memakai database produksi atau data pribadi.

## 5. ERD dan struktur tabel

ERD sederhana untuk proyek ini menggunakan satu entitas utama: `students`.

```text
+--------------------------------+
|            STUDENTS            |
+--------------------------------+
| PK  id                         |
| UQ  student_number             |
|     full_name                  |
| UQ  email                      |
|     major                      |
|     createdAt                  |
|     updatedAt                  |
+--------------------------------+
```

Keterangan:
- Entity: `students`.
- Attribute: `student_number`, `full_name`, `email`, `major`.
- Primary Key (PK): `id`, identitas unik setiap record.
- Unique (UQ): `student_number` dan `email` tidak boleh duplikat.
- Foreign Key: belum diperlukan karena proyek awal hanya menggunakan satu tabel.

### Opsi membuat tabel

**Rekomendasi kelas: gunakan Sequelize migration** agar struktur tabel tercatat di project dan dapat dibuat ulang secara konsisten.

Alternatif untuk demonstrasi SQL manual di phpMyAdmin:

```sql
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_number VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  major VARCHAR(100) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

Jangan membuat tabel manual lalu menjalankan migration yang juga membuat tabel `students`. Pilih salah satu alur. Jika memakai Sequelize `timestamps: true`, Sequelize secara default menggunakan kolom `createdAt` dan `updatedAt`.

## 6. Konfigurasi koneksi Sequelize

Contoh `.env` untuk konfigurasi lokal XAMPP:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=student_management
DB_USER=root
DB_PASSWORD=
```

Password kosong hanya berlaku jika instalasi lokal XAMPP peserta memang menggunakan konfigurasi default tanpa password. Jika root diberi password, isi `DB_PASSWORD` dengan password lokal tersebut.

Contoh konfigurasi Sequelize:

```js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false
  }
);

module.exports = sequelize;
```

Untuk praktik kelas, gunakan akun database lokal. Jangan pernah mengunggah password atau file `.env` ke Git. Tambahkan `.env` ke `.gitignore`.

## 7. Kontrak REST API

Frontend yang disediakan mengharapkan endpoint berikut:

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/students` | Mengambil daftar mahasiswa |
| POST | `/api/students` | Menambah mahasiswa |
| PUT | `/api/students/:id` | Memperbarui mahasiswa |
| DELETE | `/api/students/:id` | Menghapus mahasiswa |

Contoh request body POST/PUT:

```json
{
  "student_number": "2026001",
  "full_name": "Alya Putri",
  "email": "alya@example.com",
  "major": "Informatika"
}
```

Contoh response GET yang direkomendasikan:

```json
{
  "data": [
    {
      "id": 1,
      "student_number": "2026001",
      "full_name": "Alya Putri",
      "email": "alya@example.com",
      "major": "Informatika"
    }
  ]
}
```

Jika nama endpoint, nama field, atau format response backend berbeda, sesuaikan kontrak backend atau konstanta/fungsi di `frontend/index.html`.

## 8. Menjalankan backend

1. Pastikan MySQL XAMPP sudah Start.
2. Pastikan database `student_management` sudah dibuat.
3. Jalankan migration Sequelize sesuai konfigurasi project.
4. Jalankan server Express, misalnya:
   ```bash
   npm run dev
   ```
5. Pastikan terminal menunjukkan backend aktif pada port `3000`.
6. Uji GET `/api/students` melalui Postman sebelum membuka frontend.

Contoh URL API yang digunakan frontend:

```text
http://localhost:3000/api/students
```

## 9. Menjalankan frontend melalui Apache XAMPP

Agar frontend memiliki origin yang konsisten dan tidak dibuka sebagai `file://`:

1. Salin folder `frontend` dari kit ini.
2. Tempelkan ke folder `C:\xampp\htdocs\student-management\`.
3. Pastikan file berada di:
   ```text
   C:\xampp\htdocs\student-management\index.html
   ```
4. Start **Apache** pada XAMPP Control Panel.
5. Buka browser:
   ```text
   http://localhost/student-management/
   ```

Backend Express tetap berjalan sendiri pada `http://localhost:3000`. Apache hanya menyajikan file frontend; Apache tidak menjalankan Node.js.

### CORS

Karena frontend `http://localhost` dan backend `http://localhost:3000` memiliki port berbeda, backend harus mengizinkan origin frontend. Contoh konfigurasi Express untuk latihan:

```js
const cors = require("cors");

app.use(cors({
  origin: "http://localhost"
}));
```

Jika menggunakan port Apache non-default atau virtual host, sesuaikan origin dengan alamat frontend yang benar. Untuk production, batasi origin sesuai domain aplikasi.

## 10. Konfigurasi URL frontend

Di `frontend/index.html`, cari:

```js
const API_BASE_URL = "http://localhost:3000/api";
const STUDENTS_ENDPOINT = `${API_BASE_URL}/students`;
```

Ubah jika backend memakai host atau port berbeda.

## 11. Panduan live coding tutor — 120 menit

| Menit | Materi dan demo | Hasil |
|---|---|---|
| 0–10 | Review GET, POST, PUT, DELETE dan status code | Peserta mengingat konsep REST API |
| 10–20 | XAMPP, MariaDB, phpMyAdmin, Node.js, PHP | Peserta membedakan fungsi tools |
| 20–30 | Alur browser → API → Sequelize → database; ERD | Peserta memahami arsitektur dan tabel |
| 30–45 | Start MySQL XAMPP, buat database di phpMyAdmin | Database siap |
| 45–60 | Konfigurasi Sequelize, model dan migration | Tabel `students` terbentuk |
| 60–75 | Uji endpoint CRUD di Postman | Backend terverifikasi |
| 75–85 | Buka dan jelaskan HTML/CSS/JavaScript | Peserta mengenali bagian UI |
| 85–95 | Live coding GET dengan `fetch()` | Daftar mahasiswa tampil |
| 95–103 | Live coding POST | Form menambah data |
| 103–110 | Live coding PUT dan DELETE | Edit dan hapus berfungsi |
| 110–115 | Periksa data di phpMyAdmin dan restart backend | Persistence terbukti |
| 115–120 | Exit ticket | Pemahaman diperiksa |

**Saran tutor:** siapkan starter backend dan dependency sebelum kelas. Waktu 120 menit terlalu singkat jika peserta harus menginstal semua tools dan membangun backend dari nol. HTML final disediakan sebagai target; ajarkan bagian JavaScript/fetch secara bertahap.

## 12. Urutan live coding frontend

### GET — membaca data

```js
const response = await fetch("http://localhost:3000/api/students");
const result = await response.json();
console.log(result.data);
```

### POST — menambah data

```js
const student = {
  student_number: "2026002",
  full_name: "Bima Pratama",
  email: "bima@example.com",
  major: "Informatika"
};

const response = await fetch("http://localhost:3000/api/students", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(student)
});
```

### PUT — mengubah data

```js
await fetch("http://localhost:3000/api/students/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    student_number: "2026001",
    full_name: "Alya Putri Updated",
    email: "alya@example.com",
    major: "Sistem Informasi"
  })
});
```

### DELETE — menghapus data

```js
await fetch("http://localhost:3000/api/students/1", {
  method: "DELETE"
});
```

Setelah operasi berhasil, panggil kembali fungsi GET untuk memperbarui tabel browser.

## 13. Troubleshooting

| Masalah | Pemeriksaan |
|---|---|
| MySQL XAMPP gagal Start | Port 3306 bentrok dengan service database lain |
| `ECONNREFUSED` | MySQL belum berjalan atau host/port salah |
| `Access denied for user` | Username/password database tidak cocok |
| `Unknown database` | Database belum dibuat atau nama DB salah |
| `Failed to fetch` | Backend, URL, CORS, dan port |
| `404 Not Found` | Endpoint atau route Express salah |
| `400 Bad Request` | Request body atau validasi salah |
| `409 Conflict` | Nomor mahasiswa/email sudah terpakai |
| `500 Internal Server Error` | Periksa log backend, model, migration, dan query |
| Data tidak tampil | Periksa struktur JSON dan nama field |
| Data hilang setelah restart | Pastikan data disimpan di database, bukan array memori |

## 14. Exit ticket

1. Apa perbedaan XAMPP, MariaDB, dan phpMyAdmin?
2. Apakah Node.js membutuhkan Apache untuk menjalankan Express?
3. Apa fungsi Sequelize?
4. Apa fungsi Primary Key dan Unique?
5. Mengapa browser tidak mengakses database secara langsung?
6. Apa fungsi `fetch()`?
7. Mengapa data tetap ada setelah backend direstart?

## 15. Checklist keberhasilan

- [ ] MySQL/MariaDB XAMPP aktif.
- [ ] phpMyAdmin dapat dibuka.
- [ ] Database `student_management` tersedia.
- [ ] Model dan migration Sequelize sesuai.
- [ ] GET menampilkan daftar mahasiswa.
- [ ] POST menambah mahasiswa.
- [ ] PUT mengubah mahasiswa.
- [ ] DELETE menghapus mahasiswa.
- [ ] Validasi input berjalan.
- [ ] Data terlihat di phpMyAdmin.
- [ ] Frontend dapat diakses melalui Apache.
- [ ] Data tetap ada setelah backend direstart.

---

**Batasan starter:** `frontend/index.html` adalah frontend siap pakai. Operasi CRUD tetap memerlukan backend Express yang berjalan dan mengikuti kontrak API di atas.
