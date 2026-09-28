# Rencana Implementasi: Animasi Visual Konkret Trik GASING (P1 - P4)

Rencana ini merancang visualisasi animasi dinamis pada modal **Trik GASING** di arena latihan flashcard, menggantikan tampilan statis menjadi peragaan konkret yang bergerak hidup (*life-like card motion*). Siswa dapat melihat kartu benar-benar bergeser menyatu (P1-P3) dan bertransformasi/bertukar nilai tempat (P4).

---

## 1. Konsep & Keputusan Utama (Hasil Klarifikasi)

> [!IMPORTANT]
> **Keputusan Interaksi & Ritme Animasi yang Diterapkan:**
> 1. **Pemicu Animasi**: Otomatis berjalan (*auto-play*) seketika anak menekan tombol langkah berikutnya (Langkah 1 ➔ Langkah 2), tanpa membebani anak dengan tombol kontrol berlebih.
> 2. **Kecepatan & Ritme**: Halus (*smooth ease-in-out* 700ms - 1000ms) dengan jeda santai agar mata anak dapat melacak pergerakan kartu dengan nyaman tanpa merasa terburu-buru.
> 3. **Tombol Putar Ulang (*Replay*)**: Disediakan tombol kecil 🔁 *Putar Ulang* jika anak ingin melihat kembali pergeseran kartu.

---

## 2. Rincian Desain Animasi per Materi (P1 - P4)

### A. Materi P1 & P2: Penjumlahan Bilangan 1 Digit (Konkret ➔ Penggabungan)
* **Langkah 1 (Terpisah)**: Kelompok kartu Satuan kiri ($a$) dan kelompok kartu Satuan kanan ($b$) berada di wadah masing-masing dengan jarak pemisah.
* **Langkah 2 (Animasi Penggabungan Konkret)**:
  * Kelompok kiri meluncur ke tengah ke arah kanan (`translateX`), kelompok kanan meluncur ke tengah ke arah kiri.
  * Begitu bertemu di tengah, kedua kelompok melebur ke dalam satu wadah besar dengan efek pantulan lembut (*gentle bounce*).
  * Angka total menyala terang dengan warna ceria dan suara gelembung (*pop sound*).

### B. Materi P3: Mengenal Bilangan 10 (9 + 1 = 10 Satuan ➔ 1 Puluhan)
* **Langkah 1**: 9 kartu Satuan `[ S ]` ditambah 1 kartu Satuan `[ S ]`.
* **Langkah 2 (Penggabungan & Transformasi)**:
  * 1 kartu meluncur masuk menggenapkan barisan menjadi 10 kartu `[ S ]`.
  * Saat penukaran: 10 kartu `[ S ]` mengerut (*scale down*) ke titik tengah, lalu muncul kilau lembut bersalin rupa menjadi **1 kartu Puluhan hijau `[ P ]`** (*pop-in scale 1.1 ➔ 1.0*).

### C. Materi P4: Penjumlahan 10 dengan Bilangan 1 Angka ($10 + n = 1n$)
* **Langkah 1 (Kuantitas Awal)**:
  * 10 kartu Satuan `[ S ]` di kiri $+ n$ kartu Satuan `[ S ]` di kanan.
  * Teks pemandu menuntun anak: *"10 satuan + n satuan = (10+n) satuan. Kumpulan 10 satuan ini bisa kita tukar jadi 1 puluhan! ✨"*
* **Langkah 2 (Animasi Penukaran Nilai Tempat & Berdampingan)**:
  * 10 kartu `[ S ]` di kiri berputar lembut dan menyusut ke tengah wadah, lalu berubah wujud menjadi **1 kartu Puluhan hijau `[ P ]`**.
  * Sisa $n$ kartu Satuan tetap berada di samping kanannya.
  * Puluhan `[ P ]` dan Satuan `[ S ]` berbaris rapi membentuk format nilai tempat puluhan & satuan dengan teks bunyi belasan yang menyala.

---

## 3. Arsitektur Komponen & Alur Data

```
┌─────────────────────────────────────────────────────────────┐
│                 PracticeFlashcardArena                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Modal Trik GASING                  │  │
│  │                                                       │  │
│  │   Langkah 1: Konkret Awal                             │  │
│  │      │                                                │  │
│  │      ▼ (Klik 'Lanjut' / 'Yuk Tukar')                 │  │
│  │   Langkah 2: GasingMergeVisualizer                    │  │
│  │      ├─ State: 'merging' (0 - 800ms)                  │  │
│  │      ├─ State: 'exchanging' (P4: morph S -> P)       │  │
│  │      └─ State: 'merged' (Selesai, highlight hasil)    │  │
│  │      │                                                │  │
│  │      ▼ (Klik 'Lihat Angka')                           │  │
│  │   Langkah 3: Abstrak Simbolik                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Langkah-Langkah Pengerjaan

1. **Sub-Komponen Kartu Bergerak (`GasingAnimatedCards`)**:
   * Memanfaatkan kelas animasi Tailwind & CSS Keyframes murni (`translate`, `scale`, `opacity`, `transition-all duration-700 ease-out`) yang ringan, responsif mobile, dan tidak memerlukan dependensi eksternal tambahan.
2. **State Mesin Animasi pada Hint Level 2**:
   * Penambahan state fasa animasi (`animationPhase: 'start' | 'merging' | 'done'`) yang terpicu saat membuka level 2, lengkap dengan tombol 🔁 Putar Ulang.
3. **Efek Suara Audio Lembut**:
   * Menyelaraskan efek bunyi `playBubblePop()` pada saat kartu bertemu atau bertukar kartu agar pengalaman belajar terasa menyenangkan (*rewarding feedback*).
4. **Verifikasi & Uji Responsivitas**:
   * Memastikan animasi tetap rapi dan tidak meluap (*overflow*) pada layar HP sempit (viewport 360px - 412px).
