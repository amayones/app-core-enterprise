# app-core-enterprise

> **Enterprise-class web application framework** — Ext JS (frontend) + Laravel API (backend) dengan arsitektur modul dinamis dan sistem RBAC.

Aplikasi ini adalah **Sistem Informasi / ERP berbasis modul** yang dirancang untuk pengembangan cepat modul bisnis (Supplier, User, Role, dsb.). Frontend dibangun dengan **Ext JS Classic**, backend dengan **Laravel 13 REST API**, dan database menggunakan **Microsoft SQL Server**.

---

## 🗺️ Struktur Direktori

```
app-core-enterprise/
├── index.html                     # Entry point — memuat Ext JS + config + app.js
├── app.js                         # Ext JS application bootstrap
├── js/
│   ├── config/vconfig.js          # Konfigurasi global (namespace, API URL, judul)
│   └── component/                 # Komponen reusable (COMP.parse, COMP.run, COMP.TipToast)
├── APP/                           # Semua source JS frontend (Ext JS classes)
│   ├── AGLOBAL/                   # Modul infrastruktur global (login, viewport, menu dinamis)
│   └── MODSYSTEM/                 # Modul bisnis (user_login, user_role, menu_example, ...)
│       └── <modul>/              # Tiap modul: <modul>.js, C<modul>.js, GRID<modul>.js, FRM<modul>.js
├── ext/                           # Ext JS SDK (DI-IGNORE, di-install terpisah — lihat Setup)
├── apservice/                     # Laravel 13 backend (API)
│   ├── app/Http/Controllers/      # AuthController, HomeController (dispatch generik)
│   ├── app/Models/                # Mlogin, Mmenu_example, dsb. (convention: M<Modul>)
│   ├── routes/api.php             # Route: POST /login (publik) + POST /{A}/{B} (JWT)
│   ├── config/                    # database.php, jwtcustom.php, dsb.
│   └── .env                       # (DI-IGNORE)
└── .gitignore
```

### Arsitektur Modul (Konvensi)

Setiap modul di‑generate otomatis berdasarkan **konvensi nama** — tidak perlu mendaftarkan route/controller manual:

| Layer | Pola | Contoh |
|-------|------|--------|
| **Frontend (Ext JS)** | `APP.MODSYSTEM.<modul>.<modul>` → `APP/MODSYSTEM/<modul>/<modul>.js` | `menu_example` → `APP/MODSYSTEM/menu_example/menu_example.js` |
| **Backend (Laravel)** | `POST /api/<A>/<B>` → model `App\Models\M<A>`, method `read_data` / `handleAction` | `menu_example/menu_examples` → `Mmenu_example->read_data()` |

Setiap modul terdiri dari 4 file:

| Prefix | File | Peran |
|--------|------|-------|
| *(root)* | `<modul>.js` | View panel (grid + toolbar) |
| `C` | `C<modul>.js` | ViewController (logic, event handler) |
| `GRID` | `GRID<modul>.js` | Grid panel (daftar data) |
| `FRM` | `FRM<modul>.js` | Form window (tambah/edit/hapus) |

---

## 🛠️ Prasyarat

| Kebutuhan | Versi |
|-----------|-------|
| PHP | >= 8.3 |
| Composer | >= 2.x |
| Microsoft SQL Server | 2016+ |
| Ext JS SDK | Classic 7.6+ (atau kompatibel) |
| Web server | Apache 2.4+ / Nginx (atau PHP built-in) |
| Node.js | >= 20 (hanya untuk build Laravel frontend build tooling, opsional) |

---

## ⚙️ Setup & Instalasi

> ⚠️ **Ext JS SDK tidak termasuk di repo** (668 MB). Anda harus meng‑install‑nya secara terpisah agar `index.html` dapat memuat `ext/build/ext-all.js`.

### 1. Clone Repository

```bash
git clone https://github.com/amayones/app-core-enterprise.git
cd app-core-enterprise
```

### 2. Pasang Ext JS SDK (Frontend)

Option A — **Manual download** (direkomendasikan untuk penggunaan lokal):
```bash
# Unduh Ext JS Classic SDK dari portal Sencha,
# lalu ekstrak ke folder ext/
# Pastikan struktur di bawah terpenuhi:
ext/
├── build/
│   ├── ext-all.js
│   └── classic/theme-triton/resources/theme-triton-all.css
└── classic/
```

Option B — **Sencha Cmd** (jika tersedia):
```bash
sencha -sdk /path/ke/ext-js-sdk generate app -name MyApp -path ./ext
```

Setelah terpasang, buka `index.html` di browser dan semuanya harus berjalan.

### 3. Konfigurasi Backend (Laravel API)

```bash
cd apservice

# Install dependencies
composer install

# Salin .env dan generate key
cp .env.example .env
php artisan key:generate

# Jalankan migrasi (buta jika belum ada database)
php artisan migrate
```

### 4. Konfigurasi Environment (`.env`)

Edit file `apservice/.env` dan sesuaikan dengan environment lokal Anda:

```env
APP_URL=http://localhost:83

DB_CONNECTION=sqlsrv
DB_HOST=localhost
DB_PORT=1433
DB_DATABASE=nama_database
DB_USERNAME=user_sqlserver
DB_PASSWORD=password_sqlserver

JWT_SECRET=kunjungan_rahasia_anda
JWT_EXPIRE_MINUTES=480
```

### 5. Jalankan Aplikasi

**Backend (Laravel API):**
```bash
php artisan serve --host=0.0.0.0 --port=83
```

API akan tersedia di `http://localhost:83/api/`.

**Frontend (Ext JS):**
Buka `index.html` langsung di browser (atau layani via web server):
```bash
# Jika pakai live-server atau PHP built-in
php -S localhost:8080
```

Akses: `http://localhost:8080` → Login form muncul otomatis setelah API terhubung.

---

## 📦 Cara Menambah Modul Baru

Karena sistem bersifat **konvensional**, menambah modul baru sangat cepat:

1. **Buat folder modul** frontend:
   ```
   APP/MODSYSTEM/supplier/supplier.js
   APP/MODSYSTEM/supplier/Csupplier.js
   APP/MODSYSTEM/supplier/GRIDsupplier.js
   APP/MODSYSTEM/supplier/FRMsupplier.js
   ```

2. **Buat model backend** (hanya cukup ini!):
   ```php
   // apservice/app/Models/Msupplier.php
   class Msupplier extends BaseModel
   {
       private const TABLE = 'm_supplier';
       private function table() { return DB::connection('sqlsrv')->table(self::TABLE); }
       public function read_data($payload = []) { /* ... */ }
       public function handleAction($method, $payload) { /* ... */ }
   }
   ```

3. **Buat tabel di SQL Server** (`m_supplier`).

4. **Daftarkan di menu dinamis** — hubungi developer untuk menambahkan entry di sistem menu yang di‑load via `/reload`.

> Tidak perlu menulis route atau controller baru! `POST /api/supplier/suppliers` dan `POST /api/supplier/supplier` sudah otomatis ter‑handle oleh `HomeController::general()`.

---

## 🔐 Otentikasi & Keamanan

- **Login:** `POST /api/login` — memverifikasi `m_user` (SQL Server), meng‑encode JWT, menulis ke httpOnly cookie.
- **Akses API:** Semua route kecuali `/login` dilindungi middleware `jwt.cookie`.
- **Cookie flags:** `httpOnly=true`, `secure` otomatis true di production, `SameSite=Lax`.

---

## 🔓 Logout

Setiap viewport dilengkapi **tombol Logout** di header sidebar (kiri atas). Klik → konfirmasi → panggil `POST /api/logout` (hapus JWT cookie) → viewport dihancurkan → kembali ke form login.

---

## 🧪 Testing

```bash
cd apservice
php artisan test
```

---

## 🪄 Teknologi yang Dipakai

| Kategori | Teknologi |
|----------|-----------|
| Frontend | Ext JS 7 (Classic), Triton Theme |
| Backend | Laravel 13, PHP 8.3 |
| API Auth | firebase/php-jwt (JWT cookie) |
| Database | Microsoft SQL Server (sqlsrv) |
| Build Tool | Composer |

---

## 📄 Lisensi

MIT License — lihat file `LICENSE` (jika tersedia).

---

## 🙋 Bantuan

- **Issue:** buka [GitHub Issues](https://github.com/amayones/app-core-enterprise/issues)
- **Dokumentasi modul:** tiap folder modul di `APP/MODSYSTEM/<modul>/` dilengkapi komentar kode.

---

<sub>Dikembangkan untuk kebutuhan enterpise berbasis modul — Indonesia.</sub>
