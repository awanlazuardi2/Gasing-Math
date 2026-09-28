/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GasingPedagogy {
  filosofi: string;
  konsepKunci: string;
  tahapKonkret: string;
  tahapAbstrak: string;
  penguatanAbstrak: string;
  kesalahanUmum: string;
  tipsGuru: string;
  gasingExample?: string;
}

export function getGasingPedagogy(operation: string, materialId: string, title: string, code: string): GasingPedagogy {
  const isPenjumlahan = operation === 'PENJUMLAHAN';
  const isPengurangan = operation === 'PENGURANGAN';
  const isPerkalian = operation === 'PERKALIAN';
  const isPembagian = operation === 'PEMBAGIAN';

  // Penjumlahan cases
  if (isPenjumlahan) {
    if (materialId === 'P1' || materialId === 'P2') {
      return {
        filosofi: "Gasing mengajarkan jumlah sebagai benda fisik terlebih dahulu. Kecepatan mencongak di bawah 2 detik dicapai saat anak beralih dari menyusun lidi/menghitung jari secara mekanis ke visualisasi mental kuantitas bilangan.",
        konsepKunci: "Representasi jumlah nyata. Anak melihat 'keutuhan' jumlah tanpa perlu bingung dengan simbol rumit.",
        tahapKonkret: "Gunakan lidi atau buah kelereng. Letakkan 2 kelereng di meja kiri dan 1 kelereng di meja kanan. Minta siswa menyatukannya di tengah sambil menyebut 'dua bergabung dengan satu menjadi TIGA!'. Ganti lidi dengan tepuk tangan berirama untuk melatih refleks motorik.",
        tahapAbstrak: "Menghubungkan lidi fisik dengan simbol angka 2 dan 1. Guru memperlihatkan gambar 2 apel + 1 apel, lalu menggantikannya dengan angka bersurat:\n2 + 1 = 3\nLatih dengan kilat agar anak mengenali pola visual angka.",
        penguatanAbstrak: "Gunakan kartu angka (Flashcard) bolak-balik. Tunjukkan '3 + 2' dan anak harus menyebutkan '5' secara refleks di bawah 2 detik tanpa jeda bergumam.",
        kesalahanUmum: "Siswa dibiarkan menghitung jari satu-persatu sejak awal (menggunakan 'jari berjalan'). Hal ini merusak kecepatan bernalar dan membebani ingatan jangka pendek anak.",
        tipsGuru: "Pujilah anak bukan karena mereka bisa menghitung, melainkan karena kecepatan respons lisan mereka. Berikan 'high five' meriah saat anak merespon cepat!",
        gasingExample: "3 + 2 -> Refleks langsung menyebut 5."
      };
    }

    if (materialId === 'P3') {
      return {
        filosofi: "Konsep 'Pasangan 10' adalah pilar pusat dari seluruh sistem berhitung GASING. Dengan melatih kesadaran anak tentang dua bilangan yang melengkapi satu sama lain membentuk angka sepuluh, anak dapat melakukan penjumlahan puluhan hingga ribuan secara sangat lancar dari depan.",
        konsepKunci: "Setiap bilangan bulat dasar memiliki pasangan sejati yang menghasilkan tepat 10: 9 pasangannya 1, 8 pasangannya 2, 7 pasangannya 3, 6 pasangannya 4, 5 pasangannya 5.",
        tahapKonkret: "Gunakan visual ten-frame (sepuluh kotak telur) atau sepuluh jari tangan. Buka 7 jari tangan, tekuk 3 jari sisanya. Jelaskan bahwa 7 selalu berpasangan dengan 3 untuk membentuk tangan yang utuh (10).",
        tahapAbstrak: "Siswa menuliskan pasangan angka. Misalnya, tulis angka 8 di papan tulis, buat anak berebut menulis angka 2 di sebelahnya. Hubungkan secara langsung dalam bentuk simbol matematika:\n8 + 2 = 10\n4 + 6 = 10",
        penguatanAbstrak: "Game Mencongak Cepat: Guru menyebut angka acak, siswa wajib menyebut pasangannya secara instan. Guru: 'Tujuh!', Siswa: 'Tiga!' (Refleks di bawah 1 detik).",
        kesalahanUmum: "Siswa menghitung manual dari angka besar ke angka kecil, misalnya untuk 8 + 2, mereka menghitung 'sembilan, sepuluh' dengan jari. Ini memperlambat kecepatan hitung.",
        tipsGuru: "Latihlah Pasangan 10 ini setiap hari sebelum masuk materi inti. Ini adalah kunci kemudahan mental anak di tahap-tahap berikutnya.",
        gasingExample: "Pasangan dari 7 adalah 3, karena 7 + 3 = 10."
      };
    }

    if (materialId === 'P4' || materialId === 'P5') {
      return {
        filosofi: "Gasing bekerja dari depan dengan teknik 'Jembatan 10'. Penjumlahan menyeberang angka 10 tidak dipandang sebagai proses bersusun yang rumit, melainkan merupakan proses pelengkapan nilai tempat puluhan terlebih dahulu sebelum menaruh satuannya.",
        konsepKunci: "P = Puluhan, S = Satuan. Menggunakan sisa dari 'Pasangan 10' untuk menentukan nilai tempat satuan.",
        tahapKonkret: "Sediakan dua mangkok. Mangkok pertama berisi 8 lidi, mangkok kedua berisi 5 lidi. Untuk membuat mangkok pertama menjadi 10 (satu ikat puluhan), ambil 2 lidi dari mangkok kedua (karena pasangan 8 adalah 2). Mangkok kedua kini tersisa 3 lidi. Sekarang kita punya 1 ikat puluhan (P = 1) dan 3 lidi satuan (S = 3). Gabungkan menjadi 13.",
        tahapAbstrak: "Gasing bekerja dari DEPAN!\nContoh: 8 + 5\nLangkah 1: Satu puluhan (P = 1) langsung diamankan di depan karena penjumlahan ini menyeberang 10.\nLangkah 2: Cari pasangan 8 yaitu 2. Ambil 2 dari 5, menyisakan 3 satuan (S = 3).\nLangkah 3: Tuliskan hasilnya langsung: 13.",
        penguatanAbstrak: "Siswa dilatih melihat angka 9 + 6 secara mental: '9 pasangannya 1, maka 6 dikurangi 1 adalah 5. Hasilnya langsung 15!'",
        kesalahanUmum: "Guru mengajarkan siswa menjumlahkan dengan menyuruh menyimpan angka besar di mulut dan angka kecil di jari, lalu menghitung maju. Metode konvensional ini melambatkan refleks hitung.",
        tipsGuru: "Tekankan kata 'sisa'. Berapa sisa setelah diambil pasangannya? Latih anak mengucapkan secara ritmis: 'Sembilan tambah enam: satu puluhan diamankan, pasangan sembilan adalah satu, sisa lima, jadi lima belas!'",
        gasingExample: "9 + 5 -> P=1 (diamankan), S=sisa dari 5 setelah diambil pasangan 9 (1) yaitu 4 -> Hasil: 14."
      };
    }

    if (materialId === 'P6') {
      return {
        filosofi: "Pada penjumlahan puluhan tanpa ada jembatan 10, Gasing membiasakan siswa memproses angka terbesar di sebelah kiri (nilai tempat terbesar) terlebih dahulu. Siswa langsung dipindahkan fokusnya ke hasil depan, lalu diikuti dengan menggabungkan hasil di bagian belakang.",
        konsepKunci: "P = Puluhan, S = Satuan. Puluhan tidak berubah karena jumlah satuan tidak melampaui atau sama dengan 10.",
        tahapKonkret: "Sediakan 2 ikat sedotan (masing-masing berisi 10 lidi) dan 3 lidi satuan untuk melambangkan 23. Lalu sediakan lagi 4 lidi satuan. Letakkan lidi satuan bergabung satu sama lain. Ikat puluhannya tetap utuh 2 (20), satuannya menjadi 7. Gabungkan langsung dari depan: 27.",
        tahapAbstrak: "Bekerja dari depan!\nContoh: 23 + 4\nLangkah 1: Lihat puluhannya, yaitu 2 puluhan (P = 2). Pindahkan langsung ke hasil sementara: 2.\nLangkah 2: Jumlahkan satuan (S): 3 + 4 = 7 satuan.\nLangkah 3: Gabungkan langsung di hasil akhir: 27.",
        penguatanAbstrak: "Drill lisan kilat: 'Tiga puluh dua tambah lima?' Anak langsung menyahut dari depan: 'Tiga puluh... TUJUH!' tanpa menggambar corat-coret bersusun di benak mereka.",
        kesalahanUmum: "Siswa bersikeras menulis bersusun ke bawah dan menghitung dari belakang. Ini menghalangi kemampuan mencongak cepat.",
        tipsGuru: "Panggil angka puluhan dengan suara mantap terlebih dahulu untuk membangun kepercayaan diri anak, baru sambung dengan angka satuannya.",
        gasingExample: "34 + 5 -> Puluhan (P) tetap 3, Satuan (S) 4+5=9. Gabungkan: 39."
      };
    }

    if (materialId === 'P7') {
      return {
        filosofi: "Gasing bekerja dari depan! Dalam Metode Gasing, angka kecil bukanlah 'angka simpan' (carry). Angka kecil adalah puluhan tambahan yang akan digabungkan dengan puluhan yang sudah dipindahkan ke depan. Karena itu penempatannya wajib menempel tepat pada hasil sementara (bukan menempel pada operasi penjumlahan).",
        konsepKunci: "P = Puluhan, S = Satuan. Penggabungan nilai tempat dari depan. Kita mengamankan puluhan awal, lalu hasil satuan (yang bernilai belasan) digunakan untuk memperbarui puluhan tersebut secara real-time.",
        tahapKonkret: "Melambangkan 26 menggunakan 2 ikat sedotan puluhan dan 6 batang satuan. Ditambah 7 batang satuan. Kolom satuan menjadi 13 batang (membentuk 1 ikat baru puluhan dan sisa 3 satuan). Siswa memindahkan 2 ikat puluhan awal ke hasil, lalu begitu kolom satuan menjadi 1 ikat baru, ikat tersebut dinamis ditambahkan ke depan menjadi 3 ikat puluhan dan sisa 3 satuan.",
        tahapAbstrak: "Bekerja dari depan dengan Notasi Gasing Asli!\nDilarang menaruh angka kecil sisa di atas operan (misal di atas angka 26).\nContoh: 26 + 7\n- Langkah 1: Amankan puluhannya: 2\n- Langkah 2: Hitung satuan 6 + 7 = 13. Tulis hasil sementara dengan format 2¹3. Perhatikan angka 1 kecil menempel tepat di atas digit satuan hasil sementara, bukan di atas operasi penjumlahan.\n- Langkah 3: Gabungkan depan: 2 + 1 = 3, sehingga menjadi 33.",
        penguatanAbstrak: "Latih anak menulis transisi mental Gasing secara lurus: 26 + 7 = 2¹3 = 33. Penempatan angka kecil wajib berada tepat menempel pada hasil sementara untuk memicu refleks penggabungan langsung dari depan.",
        kesalahanUmum: "Menulis angka kecil carry 1 di atas angka puluhan operan (seperti dalam penjumlahan bersusun konvensional). Hal ini mengganggu alur pikir mencongak horizontal dari kiri ke kanan.",
        tipsGuru: "Posisikan angka kecil menempel pada hasil sementara. Jelaskan bahwa angka kecil tersebut adalah puluhan tambahan dari belakang yang akan segera digabungkan dengan puluhan aman di depannya.",
        gasingExample: "47 + 8 -> 4¹5 -> 55"
      };
    }

    if (materialId === 'P8' || materialId === 'P9' || materialId === 'P10') {
      return {
        filosofi: "Gasing bekerja dari depan! Dalam Metode Gasing, angka kecil bukanlah 'angka simpan' (carry). Angka kecil adalah puluhan tambahan yang akan digabungkan dengan puluhan yang sudah dipindahkan ke depan. Karena itu penempatannya wajib menempel tepat pada hasil sementara (bukan menempel pada operasi penjumlahan).",
        konsepKunci: "R = Ratusan, P = Puluhan, S = Satuan. Penjumlahan sejajar dari depan lalu dinamis digabungkan menggunakan penjumlahan mental horizontal.",
        tahapKonkret: "Sediakan beberapa kardus ratusan, ikat puluhan, dan lidi satuan. Lakukan penjumlahan dengan menggabungkan kardus ratusan dahulu, disusul ikat puluhan, lalu lidi satuan. Siswa menghitung langsung dari kiri.",
        tahapAbstrak: "Bekerja dari depan dengan Notasi Gasing Asli!\nDilarang menempatkan carry kecil sisa di atas operan (misal di atas operan 45 + 38).\nContoh: 45 + 38\n- Langkah 1: Jumlahkan puluhannya: 4 + 3 = 7. Amankan hasil depan ini.\n- Langkah 2: Jumlahkan satunya: 5 + 8 = 13. Tuliskan dalam bentuk notasi Gasing: 7¹3. Angka 1 kecil diletakkan persis menempel di atas digit satuan hasil sementara (bukan di atas operan penjumlahan).\n- Langkah 3: Gabungkan puluhannya sekejap: 7 + 1 = 8. Hasil akhir: 83.",
        penguatanAbstrak: "Latih siswa menuliskan hasil sementara dengan notasi Gasing 7¹3 secara visual. Tekankan bahwa angka kecil menempel erat pada hasil sementara, melambangkan puluhan tambahan yang akan digabungkan ke depannya.",
        kesalahanUmum: "Siswa menulis angka kecil carry 1 di atas angka 4 atau 3 pada operan (seperti penjumlahan bersusun). Ini adalah kesalahan besar karena melanggar kemudahan mental horizontal Gasing.",
        tipsGuru: "Pujilah siswa saat mereka meletakkan angka kecil itu menempel erat pada hasil sementara. Jelaskan bahwa itu adalah puluhan tambahan yang menanti digabungkan.",
        gasingExample: "57 + 26 -> 7¹3 -> 83"
      };
    }

    if (materialId === 'P11' || materialId === 'P12') {
      return {
        filosofi: "Sistem Coret GASING dirancang untuk membebaskan otak anak dari beban memori saat menjumlahkan barisan puluhan angka panjang. Anak tidak perlu mengingat jumlah total yang besar, cukup mengisolasinya menjadi satuan kecil melalui coretan fisik.",
        konsepKunci: "Setiap kali hasil penjumlahan mencapai angka 10 atau lebih, angka tersebut langsung dicoret. Coretan melambangkan 1 Puluhan (P = 1), sementara satuannya diamankan untuk dijumlahkan berikutnya.",
        tahapKonkret: "Sediakan menara balok lego. Setiap kali tinggi menara mencapai 10 balok, robohkan/pisahkan menara tersebut (sebagai lambang 'coret' atau 1 ikat puluhan baru), dan sisa balok ditaruh di bawahnya untuk mulai menumpuk kembali.",
        tahapAbstrak: "Bekerja dari ATAS ke BAWAH!\nContoh: 6 + 7 + 5 + 4\n- 6 + 7 = 13 -> Karena >= 10, coret angka 7. Simpan sisa satuan '3' di otak.\n- 3 (sisa) + 5 = 8.\n- 8 + 4 = 12 -> Karena >= 10, coret angka 4. Simpan sisa satuan '2' di tabel hasil.\n- Hitung jumlah coretan: ada 2 coretan. Jadi puluhannya adalah 2 (P = 2).\n- Gabungkan -> Puluhan = 2, Satuan = 2. Hasil: 22.",
        penguatanAbstrak: "Siswa diajak berlomba mencoret barisan angka di papan tulis secara cepat dengan mata berbinar-binar gembira karena tidak perlu lagi menghitung manual di jari.",
        kesalahanUmum: "Siswa lupa menyimpan sisa satuan di otak dan malah menjumlahkan angka puluhan belasannya secara manual, membuat metode ini kehilangan fungsi efisiensinya.",
        tipsGuru: "Pastikan coretan dilakukan dengan tegas dan miring. Coretan itu adalah tabungan puluhan kita!",
        gasingExample: "8 + 5 (coret sisa 3) + 9 (coret sisa 2) = 22 (ada 2 coretan, sisa akhir 2)."
      };
    }

    // Default return for other addition if any
    return {
      filosofi: "Gasing bekerja dari depan secara progresif. Anak diajak menyederhanakan perhitungan rumit menjadi refleks instan dengan representasi nilai tempat yang logis dan kongkrit.",
      konsepKunci: "P = Puluhan, S = Satuan. Penggabungan nilai tempat dari depan ke belakang.",
      tahapKonkret: "Gunakan manipulatif fisik (lidi, manik-manik, kubus kayu) untuk menunjukkan penggabungan kuantitas nyata sebelum masuk ke simbol abstrak.",
      tahapAbstrak: "Tuliskan simbol matematika secara horizontal. Selalu amankan puluhan di depan terlebih dahulu, lalu hitung satuannya dan gabungkan dari depan.",
      penguatanAbstrak: "Gunakan kartu angka bergambar atau games mencongak lisan berdurasi singkat namun berulang.",
      kesalahanUmum: "Menghitung menggunakan jari berjalan satu demi satu atau mengulangi cara bersusun konvensional dari kanan tanpa bernalar.",
      tipsGuru: "Pujilah proses bernalar anak dan bantu mereka merasa bahwa belajar matematika itu asyik, gampang, dan menyenangkan.",
      gasingExample: `${title}`
    };
  }

  // Pengurangan cases
  if (isPengurangan) {
    if (materialId === 'K1' || materialId === 'K2') {
      return {
        filosofi: "Pengurangan di tahap awal GASING dipahami melalui proses konkret AMBIL ➔ TINGGAL (Take-away). Anak mengamati benda nyata awal, mengambil sebagian, dan langsung melihat sisa kuantitas nyata yang tinggal di hadapan mereka.",
        konsepKunci: "Mengambil kuantitas nyata dan mengamati jumlah yang tinggal. Tanpa jembatan 10 atau relasi pasangan terlebih dahulu.",
        tahapKonkret: "Sediakan batang satuan atau lidi sejumlah bilangan pertama (misal: 5 batang). Minta siswa mengambil sejumlah bilangan kedua (misal: diambil 1 batang). Tanyakan: 'Berapa lidi yang tinggal?'. Siswa mengamati langsung sisa 4 batang lidi yang tinggal.",
        tahapAbstrak: "Beri tahu siswa cara menuliskan apa yang mereka lakukan secara matematis:\nAda 5 lidi, diambil 1, tinggal 4. Simbolnya:\n5 - 1 = 4\nLatih dengan angka lain:\n4 - 2 = 2\n3 - 1 = 2\ndst.",
        penguatanAbstrak: "Menyajikan kuis pendek menggunakan kartu gambar atau tebakan lisan cepat untuk melepaskan ketergantungan anak menghitung satu per satu dengan jari.",
        kesalahanUmum: "Memperkenalkan istilah 'pasangan', 'komplement', 'pasangan 10', atau 'jembatan 10' terlalu dini. Anak juga dilarang keras diajarkan menghitung mundur menggunakan perabaan jari berjalan lambat.",
        tipsGuru: "Penting untuk selalu menggunakan kata: 'Ambil', 'Diambil', 'Tinggal', dan 'Sisa'. Jangan sebut 'Pasangan 10' atau 'Komplement' karena belum saatnya.",
        gasingExample: "5 - 1 = 4 (Ada 5 lidi, diambil 1 lidi, sisa lidi yang tinggal adalah 4)."
      };
    }

    if (materialId === 'K3') {
      return {
        filosofi: "Siswa diajak melihat kartu nilai tempat mana yang diambil: Puluhan tetap (1) dan Satuan berkurang (dikurangi secara langsung).",
        konsepKunci: "Fokus pada kartu Puluhan (P) dan Satuan (S) untuk menentukan sisa tempat.",
        tahapKonkret: "Gunakan kartu nilai tempat berisi 1 Puluhan dan Satuan:\n\n1. Letakkan 1 kartu Puluhan dan 6 kartu Satuan (16).\n2. Adakah kartu Puluhan yang diambil? Tidak ada. Puluhan tetap.\n3. Adakah kartu Satuan yang diambil? Ada. Ambil 3 kartu Satuan dari 6 kartu Satuan.\n4. Tinggal 3 satuan.\n5. Gabungkan kembali: 1 Puluhan dan 3 Satuan menjadi 13.",
        tahapAbstrak: "Simbol Papan Tulis:\n\n16 - 3 = 13\nP S   S   P S\n\nUntuk kasus menukar (misalnya 12 - 5):\n12 - 5 = 7\nP S   S   S",
        penguatanAbstrak: "Mencongak cepat lisan belasan dikurangi satuan tanpa menukar dan dengan menukar di bawah 2 detik.",
        kesalahanUmum: "Menulis coretan pinjam berbelit-belit atau melipat jari mundur satu demi satu.",
        tipsGuru: "Gunakan dialog penuntun lisan kartu Gasing secara konsisten:\n- 'Adakah kartu Puluhan yang mau diambil?'\n- 'Adakah kartu Satuan yang mau diambil?'\n- 'Puluhan tetap.'\n- 'Ambil ... Satuan.'\n- 'Tinggal ... Satuan.'\n- 'Gabungkan kembali.'",
        gasingExample: "16 - 3 = 13\n12 - 5 = 7"
      };
    }

    if (materialId === 'K4') {
      return {
        filosofi: "Pengurangan dasar dari angka 10 dituntaskan sepenuhnya dengan memahami hubungan Pasangan 10 dari angka pengurangnya, sehingga anak tidak perlu menghitung menyusut menggunakan jari.",
        konsepKunci: "Mengurangi angka dari 10 menggunakan visualisasi Pasangan 10 sejati.",
        tahapKonkret: "Sediakan 10 buah benda konkrit (seperti jeruk atau kelereng). Minta siswa mengambil 6 buah jeruk seutuhnya dari wadah di meja. Siswa mengamati sisa jeruk yang masih tinggal adalah 4 jeruk, langsung menghubungkannya dengan konsep pasangan 6 adalah 4.",
        tahapAbstrak: "Simbolkan proses tersebut secara matematis:\n10 - 6 = 4\nKarena siswa sudah sangat mahir tentang Pasangan 10, mereka dapat langsung menjawab pengurangan dari 10 secara instan tanpa larping jari.",
        penguatanAbstrak: "Tebak lisan instan secara acak: '10 - 7? Tiga!' '10 - 2? Delapan!'. Memastikan anak merespons di bawah 1 detik.",
        kesalahanUmum: "Anak diperbolehkan melipat jari mundur secara lambat (buka 10 jari, menekuk satu per satu). Ini dilarang keras di kelas Gasing.",
        tipsGuru: "Selalu ingatkan dan hubungkan pengurangan dari angka 10 ini dengan pelajaran Pasangan 10 pada modul Penjumlahan awal.",
        gasingExample: "10 - 7 = 3 (Pasangan 7 adalah 3, maka sisa yang tinggal adalah 3)."
      };
    }

    if (materialId === 'K5') {
      return {
        filosofi: "Gasing menentang keras istilah 'Meminjam Angka' yang membingungkan secara logika anak. Sebagai gantinya, Gasing menggunakan 'Teknik Pasangan' yang ramah otak. Mengurangi angka belasan berarti menggabungkan satuan awal dengan pasangan dari angka pengurang.",
        konsepKunci: "Tanpa meminjam! Menggunakan Pasangan 10 dari angka pengurang untuk mempercepat kalkulasi.",
        tahapKonkret: "Tempatkan 1 ikat sedotan puluhan (10 lidi) dan 3 lidi satuan (mewakili 13). Kita ingin mengambil 7 lidi. Karena di kolom satuan hanya ada 3 lidi (tidak cukup diambil 7), ambil 7 lidi dari ikat puluhan tersebut. Ikat puluhan terbuka dan tersisa 3 lidi (karena pasangan 7 adalah 3). Gabungkan 3 lidi sisa dari ikat tadi dengan 3 lidi satuan awal. Hasilnya adalah 6 lidi satuan.",
        tahapAbstrak: "Tanpa meminjam angka!\nContoh: 13 - 7\nLangkah 1: Lihat angka yang dikurangi, belasannya diproses (hilang karena dikurangi).\nLangkah 2: Amati satuannya (3) dan angka pengurangnya (7).\nLangkah 3: Cari pasangan dari angka pengurang (7), yaitu 3.\nLangkah 4: Gabungkan satuan awal dengan pasangan tersebut: 3 + 3 = 6.\nHasil Akhir: 6.\n(Sangat gampang, asyik, dan bebas dari beban istilah meminjam!)",
        penguatanAbstrak: "Tolak istilah pinjam. Latih anak melakukan penjumlahan cepat: '14 - 8? Pasangan 8 adalah 2, empat tambah dua sama dengan enam! Hasilnya langsung 6!'",
        kesalahanUmum: "Siswa diajarkan mencoret angka puluhan di atas kertas dengan garis miring lalu menulis angka kecil di atasnya untuk meminjam, yang sering berakhir dengan coretan kuadrat berantakan.",
        tipsGuru: "Latih jembatan penjumlahan dasar anak agar saat mereka menggabungkan sisa satuan dengan pasangan pengurang, refleksnya instan.",
        gasingExample: "15 - 8 -> S=5, pasangan 8 adalah 2. S+2 -> 5+2 = 7."
      };
    }

    if (materialId === 'K6' || materialId === 'K7' || materialId === 'K8') {
      return {
        filosofi: "Gasing bekerja dari depan! Pada pengurangan multi-digit, kita mengurangkan nilai tempat terbesar di sebelah kiri terlebih dahulu (Puluhan bertemu Puluhan, Ratusan bertemu Ratusan). Jika angka di belakangnya lebih kecil dari pengurang, kita kurangi angka depan hasil sebanyak satu angka *di awal*.",
        konsepKunci: "R = Ratusan, P = Puluhan, S = Satuan. Penyesuaian nilai depan sebelum melihat belakang.",
        tahapKonkret: "Sediakan ikat puluhan dan lidi satuan. Letakkan 5 ikat puluhan dan 4 satuan (54). Ingin dikurangi 2 ikat puluhan dan 8 satuan (28). Kurangkan ikat puluhannya terlebih dahulu: 5 ikat - 2 ikat = 3 ikat. Tapi lidi satuan di belakang (4) tidak cukup dikurangi 8. Maka siswa langsung mengorbankan 1 ikat puluhan hasil sehingga puluhannya kini sudah pasti menjadi 2 (P = 2). Sisa satuan dicari dengan teknik pasangan.",
        tahapAbstrak: "Bekerja dari depan!\nContoh: 54 - 28\nLangkah 1: Kurangkan Puluhan -> 5 - 2 = 3. Tapi lirik ke belakang: 4 lebih kecil dari 8. Maka hasil puluhannya langsung dikurangi 1 di awal: P = 2.\nLangkah 2: Cari pasangan 8 (pengurang satuan) yaitu 2. Gabungkan dengan satuan awal (4): 4 + 2 = 6 (S = 6).\nLangkah 3: Gabungkan langsung hasilnya: 26.\n(Anak menuliskan angka puluhan 2 langsung tanpa menunggu kalkulasi belakang selesai!)",
        penguatanAbstrak: "Latih mencongak lisan dari depan: 'Tujuh puluh dua kurang tiga puluh delapan?' Anak berpikir: '7-3=4, karena belakang 2 < 8, kurangi satu jadi tiga puluh... pasangan 8 adalah 2, gabung dengan 2 jadi empat. Tiga puluh empat!'",
        kesalahanUmum: "Siswa menghitung satu-persatu dari belakang dengan cara mencoret-coret bersusun ke bawah secara mekanis lambat.",
        tipsGuru: "Posisikan melirik kanan sebagai kebiasaan reflek di awal sebelum siswa menulis angka puluhannya.",
        gasingExample: "83 - 47 -> P: 8-4=4 -> kurangi 1 karena 3<7 menjadi 3. S: 3 + pasangan 7(3) = 6. Hasil: 36."
      };
    }

    return {
      filosofi: "Pengurangan Gasing menghilangkan mitos rumit tentang cara meminjam angka. Pengurangan didekatkan sebagai pemahaman logis melengkapi bilangan.",
      konsepKunci: "P = Puluhan, S = Satuan. Pengurangan dari depan dengan metode lirik kanan taktis.",
      tahapKonkret: "Gunakan lidi satuan dan ikat puluhan untuk memperagakan pembongkaran kelompok puluh secara visual.",
      tahapAbstrak: "Tuliskan angka mendatar, kurangkan bagian depannya, sesuaikan hasilnya jika satuan belakang memerlukan jembatan, lalu tuliskan langsung.",
      penguatanAbstrak: "Drill flashcard lisan secara intensif 5-10 menit per sesi guna melatih refleks menjawab.",
      kesalahanUmum: "Mengadopsi coret-coret pinjam mundur konvensional yang menyulitkan siswa memproses hitungan di luar kepala.",
      tipsGuru: "Pastikan pelajaran Pasangan 10 tertanam sangat kuat karena seluruh trik pengurangan Gasing bertumpu pada hal tersebut.",
      gasingExample: `${title}`
    };
  }

  // Perkalian cases
  if (isPerkalian) {
    if (materialId === 'X0' || materialId === 'X3' || materialId === 'X8') {
      return {
        filosofi: "Perkalian dalam GASING tidak boleh sekadar dihafalkan mati seperti nanyian tanpa dasar. Perkalian dipahami secara logis sebagai konsep 'Wadah dan Isi'. Pemahaman visual atas makna fisik ini membantu anak merasionalkan operasi matematika.",
        konsepKunci: "Wadah x Isi. Perkalian A x B berarti ada sebanyak 'A' buah wadah, di mana masing-masing wadah berisi 'B' buah benda.",
        tahapKonkret: "Sediakan 3 gelas plastik (wadah) di atas meja. Masukkan masing-masing 2 buah permen (isi) ke dalam setiap gelas. Minta anak menghitung seluruh permen: 'Dua ditambah dua ditambah dua sama dengan ENAM!'. Jelaskan ini ditulis sebagai 3 x 2 = 6 (3 wadah kali 2 isi).",
        tahapAbstrak: "Menuliskan gambar ke dalam bentuk simbol penjumlahan berulang:\n3 x 2 = 2 + 2 + 2 = 6\nLakukan sebaliknya: jika ada 4 + 4 + 4, minta anak menuliskan bentuk perkaliannya (3 wadah x 4 isi = 3 x 4).",
        penguatanAbstrak: "Drill instan visual wadah: Tunjukkan kotak kosong dan isi kelereng secara cepat untuk memicu otomatisasi hitung kelipatan.",
        kesalahanUmum: "Guru terbalik mengajarkan arti antara 3 x 2 dengan 2 x 3. Meskipun hasilnya sama-sama 6 secara komutatif, artinya secara fisik bertolak belakang (misalnya dosis obat dokter: 3 kali sehari 1 sendok berbeda total dengan 1 kali sehari 3 sendok).",
        tipsGuru: "Selalu tekankan kalimat 'Wadahnya ada berapa? Isinya ada berapa?' sebelum menulis lambang kali.",
        gasingExample: "4 x 3 -> Ada 4 wadah masing-masing berisi 3 benda -> 3 + 3 + 3 + 3 = 12."
      };
    }

    if (materialId === 'X1') {
      return {
        filosofi: "Perkalian 1 adalah landasan identitas perkalian. Dengan memahami bahwa mengalikan dengan satu berarti meletakkan zat isi ke dalam wadah tunggal atau wadah berisi satu lidi, siswa melihat bahwa nilainya tidak berubah.",
        konsepKunci: "Bilangan × 1 = Bilangan itu sendiri. Konsep identitas perkalian.",
        tahapKonkret: "Sediakan beberapa mangkuk. Masukkan 1 lidi ke setiap mangkuk. 'Jika ada 4 mangkuk yang masing-masing berisi 1 lidi, berapa jumlah lidi seluruhnya?'. Siswa menghitung: '1, 2, 3, 4!'. Ditulis: 4 × 1 = 4.",
        tahapAbstrak: "Menyebutkan perkalian angka apa saja dengan 1 secara spontan di papan tulis: 5 × 1 = 5, 12 × 1 = 12, 100 × 1 = 100.",
        penguatanAbstrak: "Drill lisan cepat: 'Sepuluh kali satu?', 'Satu juta kali satu?' untuk memantapkan kesimpulan bahwa bilangan apa pun dikalikan 1 menghasilkan dirinya sendiri.",
        kesalahanUmum: "Siswa bingung dan menganggap perkalian 1 menghasilkan angka 1 (misalnya 5 × 1 = 1 karena salah menyimpulkan pola).",
        tipsGuru: "Tegaskan kalimat: 'Berapa kali pun dikalikan satu, angkanya tetap sama!'",
        gasingExample: "7 × 1 = 7. Ada 7 wadah masing-masing berisi 1 benda."
      };
    }

    if (materialId === 'X4') {
      return {
        filosofi: "Gasing memanfaatkan penemuan pola numerik ajaib untuk menyederhanakan perkalian angka besar seperti angka 9. Menggunakan metode 'Jembatan 10' atau trik jari tangan, anak dapat mencongak hasil perkalian 9 seketika mirip kalkulator.",
        konsepKunci: "Trik Jembatan 10 untuk Perkalian 9: Nilai puluhan hasil selalu kurang satu dari angka pengali, dan nilai satuannya adalah pasangan 10 dari angka pengali tersebut.",
        tahapKonkret: "Gunakan 10 jari tangan terbuka dari kiri ke kanan (nomor 1 sampai 10). Untuk menghitung 9 x 4, lipat jari keempat Anda dari kiri. Amati hasilnya: di sebelah kiri jari yang terlipat ada 3 jari (mewakili 30), dan di sebelah kanan ada 6 jari (mewakili 6). Satukan menjadi 36!",
        tahapAbstrak: "Gunakan rumus mental jembatan 10!\nContoh: 9 x 7\nLangkah 1: Tentukan puluhan hasil -> Kurangkan angka pengalinya dengan satu: 7 - 1 = 6 (Puluhan = 6).\nLangkah 2: Tentukan satuan hasil -> Cari pasangan 10 dari angka pengali tersebut: Pasangan 7 adalah 3 (Satuan = 3).\nLangkah 3: Tuliskan hasilnya langsung: 63.",
        penguatanAbstrak: "Tanya beruntun: 'Sembilan kali delapan?', Siswa berpikir: '8 kurang 1 adalah 7, pasangan 8 adalah 2. Tujuh puluh dua!'",
        kesalahanUmum: "Siswa menjumlahkan angka 9 secara berulang-ulang di kertas secara lambat (9+9+9...) yang rawan salah hitung di tengah jalan.",
        tipsGuru: "Praktekkan trik melipat jari ini sebagai selingan game interaktif yang seru di kelas.",
        gasingExample: "9 x 6 -> Puluhan: 6-1 = 5. Satuan: pasangan 6 adalah 4. Hasil: 54."
      };
    }

    if (materialId === 'X7') {
      return {
        filosofi: "Perkalian bilangan yang sama (angka kembar) untuk 1–9 merupakan tonggak penting penguasaan tabel perkalian dasar sebelum melangkah ke kombinasi angka lainnya.",
        konsepKunci: "Perkalian Bilangan Sama 1–9: a × a (1 × 1 hingga 9 × 9).",
        tahapKonkret: "Gunakan benda konkret (kancing/balok) yang disusun membentuk formasi bujur sangkar/persegi (misalnya 4 baris dan 4 kolom = 16 benda). Anak melihat visualisasi bentuk simetris yang bertambah secara teratur.",
        tahapAbstrak: "Menghubungkan formasi tersebut dengan simbol matematika: 3 × 3 = 9, 6 × 6 = 36, 7 × 7 = 49, 8 × 8 = 64, 9 × 9 = 81.",
        penguatanAbstrak: "Drill tanya jawab cepat angka kembar: 'Tujuh kali tujuh?', 'Delapan kali delapan?', 'Sembilan kali sembilan?'.",
        kesalahanUmum: "Siswa sering terkecoh antara perkalian bilangan sama dengan penjumlahan (misalnya mengira 3 × 3 = 6 atau 4 × 4 = 8).",
        tipsGuru: "Ingatkan siswa bahwa perkalian bilangan yang sama selalu menghasilkan luas bidang bujur sangkar dengan jumlah yang berlipat secara teratur.",
        gasingExample: "6 × 6 = 36, 7 × 7 = 49, 8 × 8 = 64, 9 × 9 = 81"
      };
    }

    if (materialId === 'X12' || materialId === 'X13' || materialId === 'X20') {
      return {
        filosofi: "Gasing bekerja dari depan! Pada perkalian puluhan dengan satuan, kita tidak perlu melakukan perkalian bersusun ke bawah yang kaku. Kita mengalikan dari depan (nilai tempat puluhan terbesar), mengamankannya, lalu menggabungkannya dengan hasil perkalian satuan di belakang.",
        konsepKunci: "P = Puluhan, S = Satuan. Penggabungan bertahap dari kiri ke kanan secara langsung.",
        tahapKonkret: "Gunakan balok nilai tempat. Letakkan 2 ikat puluhan (20) dan 4 satuan (24). Kita ingin mengalikan dengan 3. Kalikan puluhannya dulu: 2 ikat puluhan dikali 3 menjadi 6 ikat puluhan (60). Kalikan satuannya: 4 satuan dikalikan 3 menjadi 12 satuan (1 ikat baru dan sisa 2 satuan). Gabungkan: 6 ikat + 1 ikat = 7 ikat puluhan, sisa 2 satuan. Hasilnya 72.",
        tahapAbstrak: "Bekerja dari depan!\nContoh: 24 x 6\nLangkah 1: Kalikan Puluhan -> 2 x 6 = 12 puluhan (120). Simpan nilai 12 di depan.\nLangkah 2: Kalikan Satuan -> 4 x 6 = 24.\nLangkah 3: Gabungkan dari depan -> Tambahkan angka puluhan 12 dengan angka puluhan dari satuan (2): 12 + 2 = 14 puluhan. Taruh satuan (4) di ujung kanan.\nHasil Akhir: 144.\n(Siswa tidak perlu mencoret-coret dari belakang!)",
        penguatanAbstrak: "Latih mencongak lisan: 'Tiga belas kali empat?' -> '10x4=40, 3x4=12. 40+12 = lima puluh dua!'",
        kesalahanUmum: "Terjebak pada cara bersusun konvensional di kertas yang lambat dan membebani ingatan visual anak.",
        tipsGuru: "Biasakan anak melafalkan pembagian langkah mental ini dengan bersuara lantang agar langkahnya tertata rapi di otak.",
        gasingExample: "35 x 4 -> Depan: 3x4 = 12. Belakang: 5x4 = 20. Gabung: 12 + 2 = 14, taruh 0 -> Hasil: 140."
      };
    }

    if (materialId === 'X14' || materialId === 'X15' || materialId === 'X16' || materialId === 'X21' || materialId === 'X22') {
      return {
        filosofi: "Untuk perkalian dua angka dengan dua angka, Gasing menggunakan 'Metode Bintang' (Stitch) yang legendaris. Metode ini membuang tiga baris pengerjaan bersusun konvensional yang melelahkan, menggantinya dengan satu baris pengerjaan melirik langsung dari depan.",
        konsepKunci: "R = Ratusan, P = Puluhan, S = Satuan. Metode Stitch: Kiri x Kiri, Silang Tengah (Stitch), Kanan x Kanan.",
        tahapKonkret: "Gunakan petak garis transparan atau kartu panah untuk melukiskan jalinan tali perkalian silang (kiri ke kiri, silang, kanan ke kanan) agar siswa memahami secara koordinat visual alur angka mengalir.",
        tahapAbstrak: "Metode Bintang (Bekerja dari DEPAN!):\nContoh: 12 x 13\nLangkah 1: Bagian Depan (Ratusan) -> Kiri x Kiri = 1 x 1 = 1.\nLangkah 2: Bagian Tengah (Puluhan) -> Silang Tengah = (1 x 3) + (2 x 1) = 3 + 2 = 5.\nLangkah 3: Bagian Belakang (Satuan) -> Kanan x Kanan = 2 x 3 = 6.\nGabungkan langsung dari depan ke belakang: 156.\nJika ada hasil belasan di tengah atau belakang, langsung masukkan angkanya sebagai tambahan di nilai tempat depannya secara dinamis.",
        penguatanAbstrak: "Drill pola stitch di papan tulis dengan menggambar busur bintang kecil di atas soal horizontal agar anak terbiasa melirik silang secara otomatis.",
        kesalahanUmum: "Salah menjumlahkan perkalian silang tengah karena terburu-buru atau kebingungan membedakan mana angka pengali kiri dan kanan.",
        tipsGuru: "Sebut metode ini dengan nama 'Trik Jahit' atau 'Stitch Bintang' agar terdengar asyik dan menantang bagi kreativitas anak.",
        gasingExample: "23 x 12 -> Depan: 2x1=2. Tengah: (2x2)+(3x1)=7. Belakang: 3x2=6. Hasil: 276."
      };
    }

    return {
      filosofi: "Perkalian adalah jembatan penjumlahan cepat berpola terstruktur. Gasing berfokus pada visualisasi makna fisik perkalian (wadah-isi) sebelum mengasah refleks.",
      konsepKunci: "Wadah x Isi. Menggunakan representasi spasial dan matematika horizontal dari kiri ke kanan.",
      tahapKonkret: "Sediakan gelas plastik dan kelereng untuk mensimulasikan wadah kuantitas fisik yang berulang seimbang.",
      tahapAbstrak: "Tuliskan dalam bentuk mendatar menggunakan pola penyatuan angka dari depan untuk menjaga keselarasan berpikir kiri-ke-kanan.",
      penguatanAbstrak: "Drill lisan interaktif berkelompok dan kuis tebak angka kilat di bawah waktu 2 detik.",
      kesalahanUmum: "Menyuruh anak menghafalkan tabel perkalian 1 s.d 10 tanpa mengaitkannya dengan logika penjumlahan berulang fisik.",
      tipsGuru: "Buatlah pengulangan terasa asyik melalui nyanyian ritmis, tepuk tangan berpola, atau permainan kartu angka di kelas.",
      gasingExample: `${title}`
    };
  }

  // Pembagian cases
  if (isPembagian) {
    if (materialId === 'B1') {
      return {
        filosofi: "Pembagian sejati diajarkan asyik sebagai perluasan alami dari konsep perkalian. Sebelum menggunakan simbol bagi, siswa harus mahir menemukan faktor perkalian yang hilang agar secara logis memahami hubungan bolak-balik antara perkalian dan pembagian.",
        konsepKunci: "Perkalian dan pembagian adalah pasangan. Menemukan faktor yang hilang (faktor tersembunyi).",
        tahapKonkret: "Sediakan sekelompok lidi atau kartu satuan Gasing. Guru memegang 24 lidi dan menatanya ke dalam 8 kelompok sama rata. Siswa diminta menebak berapa isi tiap kelompok dengan mencocokkan ingatan tabel perkalian: '8 kali berapa sama dengan 24?' Siswa menjawab '3'.",
        tahapAbstrak: "Menuliskan persamaan perkalian rumpang:\n8 × □ = 24\nKetika anak tahu bahwa angkanya adalah 3, guru menjelaskan bahwa '24 dibagi 8 sama dengan 3'. Belum mengenalkan simbol pembagian secara dominan, melainkan memperkuat refleks pasangan.",
        penguatanAbstrak: "Drill lisan cepat: '8 kali berapa supaya jadi 24?' -> '3!' 'Maka 24 dibagi 8 adalah...' -> '3!'",
        kesalahanUmum: "Langsung menyodorkan simbol titik dua (:) atau tanda bagi (÷) dan menyuruh anak menghafalkan tabel pembagian tanpa mendasarkannya pada refleks perkalian yang sudah dikuasai.",
        tipsGuru: "Selalu pancing anak dengan pertanyaan perkalian pembantu: 'X kali berapa agar menghasilkan Y?' sebelum menyebutkan kata bagi.",
        gasingExample: "8 × □ = 24 (siswa menjawab 3, sehingga 24 : 8 = 3)"
      };
    }

    if (materialId === 'B2') {
      return {
        filosofi: "Pembagian dasar adalah proses membagi suatu kuantitas secara adil dan merata kepada beberapa kelompok target, sehingga setiap kelompok menerima jumlah yang tepat sama besar (tanpa sisa).",
        konsepKunci: "Membagi adil dan merata, tanpa sisa.",
        tahapKonkret: "Gunakan kartu satuan Gasing atau lidi. Guru menyediakan 12 kartu satuan dan berkata kita akan membagikannya ke 3 kelompok. Bagikan kartu satu-satu secara adil dan merata sampai habis. Setiap kelompok mendapatkan tepat 4 kartu.",
        tahapAbstrak: "Simbolkan proses membagi adil tadi secara tertulis:\n12 ÷ 3 = 4\nTunjukkan juga fakta hubungannya dengan perkalian:\n3 × 4 = 12\nJadi:\n12 ÷ 3 = 4.",
        penguatanAbstrak: "Drill mencongak cepat di bawah 2 detik untuk pembagian dasar 1-100 tanpa sisa.",
        kesalahanUmum: "Menghafalkan tabel pembagian secara mekanis tanpa mengerti bahwa pembagian itu adalah proses membagi merata sampai habis.",
        tipsGuru: "Gunakan visualisasi pembagian kartu satuan atau lidi untuk membuktikan pembagian adil tersebut.",
        gasingExample: "12 ÷ 3 = 4 karena 3 × 4 = 12"
      };
    }

    if (materialId === 'B3') {
      return {
        filosofi: "Memperluas pemahaman pembagian dasar ke nilai tempat puluhan, ratusan, atau ribuan secara langsung tanpa perlu teknik bersusun (porogapit), melainkan memanfaatkan hubungan pola angka.",
        konsepKunci: "Hubungan nilai tempat puluhan/ratusan dalam pembagian.",
        tahapKonkret: "Gunakan kartu puluhan (P) dan satuan (S). Untuk 240 ÷ 8, kita memiliki 24 kartu puluhan. Jika 24 kartu puluhan dibagi ke 8 kelompok, setiap kelompok mendapat 3 puluhan (30).",
        tahapAbstrak: "Menuliskan pola hubungan:\n24 ÷ 8 = 3\nMaka:\n240 ÷ 8 = 30\n(24 puluhan dibagi 8 adalah 3 puluhan = 30).",
        penguatanAbstrak: "Latih mencongak mental cepat dengan menambahkan nol di belakang hasil bagi dasar.",
        kesalahanUmum: "Menggunakan pembagian bersusun panjang ke bawah hanya untuk membagi kelipatan sepuluh sederhana.",
        tipsGuru: "Ingatkan siswa untuk memisahkan sementara angka nol, lakukan pembagian dasar, lalu pasangkan kembali angka nol sesuai nilai tempat.",
        gasingExample: "240 ÷ 8 = 30 karena 24 ÷ 8 = 3"
      };
    }

    if (materialId === 'B4') {
      return {
        filosofi: "Mengenalkan konsep sisa secara intuitif melalui pencarian kelipatan pembagi terdekat yang berada di bawah angka utama.",
        konsepKunci: "Mengenal konsep sisa, kelipatan terdekat di bawah angka utama.",
        tahapKonkret: "Gunakan 13 lidi atau kartu satuan. Bagikan ke 3 kelompok secara adil. Setiap kelompok mendapat 4 lidi, dan bersisa 1 lidi di tangan yang tidak bisa dibagi rata.",
        tahapAbstrak: "Langkah berpikir:\nKelipatan 3 terdekat di bawah 13 adalah 12.\nLakukan pengurangan: 13 - 12 = 1 (sisa).\nJadi:\n13 ÷ 3 = 4 sisa 1",
        penguatanAbstrak: "Drill cepat: '17 bagi 5?' Siswa menjawab: '3 sisa 2' karena kelipatan 5 terdekat di bawah 17 adalah 15.",
        kesalahanUmum: "Mengajari anak membagi angka yang menghasilkan desimal atau pecahan di tahap awal perkenalan sisa.",
        tipsGuru: "Selalu tanyakan kelipatan pembagi terdekat di bawah angka yang dibagi terlebih dahulu.",
        gasingExample: "13 ÷ 3 = 4 sisa 1 (karena kelipatan 3 terdekat di bawah 13 adalah 12)"
      };
    }

    if (materialId === 'B5') {
      return {
        filosofi: "Membagi bilangan yang lebih besar (puluhan atau ratusan) dari depan satu per satu. Sisa pembagian dari nilai tempat depan digabungkan ke angka berikutnya.",
        konsepKunci: "Pembagian sekuensial dari depan (kiri ke kanan), penggabungan sisa ke belakang.",
        tahapKonkret: "Untuk 73 ÷ 4. Ada 7 kartu puluhan dan 3 kartu satuan. Bagikan 7 puluhan ke 4 kelompok, masing-masing mendapat 1 puluhan sisa 3 puluhan. 3 puluhan sisa ditukar menjadi 30 satuan, digabung dengan 3 satuan menjadi 33 satuan. 33 satuan dibagi 4 kelompok mendapat 8 satuan sisa 1 satuan. Jadi hasil 18 sisa 1.",
        tahapAbstrak: "Bekerja dari depan:\n73 ÷ 4\n- 7 ÷ 4 dapat 1 sisa 3.\n- Gabungkan sisa 3 ke angka berikutnya menjadi 33.\n- 33 ÷ 4 dapat 8 sisa 1.\n- Hasil akhir: 18 sisa 1.",
        penguatanAbstrak: "Latih mencongak horizontal dari kiri ke kanan dengan menuliskan angka sisa kecil di antara digit soal.",
        kesalahanUmum: "Kembali menggunakan porogapit bersusun yang lambat dan rentan salah hitung tempat.",
        tipsGuru: "Pastikan anak lancar menuliskan sisa kecil di atas atau di samping angka pembagi berikutnya.",
        gasingExample: "73 ÷ 4 = 18 sisa 1"
      };
    }

    if (materialId === 'B6') {
      return {
        filosofi: "Tahap akhir pembagian Gasing dengan pembagi dua angka (belasan/puluhan) diselesaikan secara efisien menggunakan pasangan perkalian dan estimasi nilai tempat.",
        konsepKunci: "Pembagi dua angka, estimasi perkalian cepat.",
        tahapKonkret: "Sediakan 156 kelereng/kartu. Kelompokkan ke dalam set berisi 13 (pembagi). Hitung berapa set 13 yang dapat dibentuk sampai habis.",
        tahapAbstrak: "Gunakan pasangan perkalian atau nilai tempat:\n156 ÷ 13\n- Lihat depan: 15 ÷ 13 dapat 1 sisa 2.\n- Gabungkan sisa 2 ke angka belakang menjadi 26.\n- 26 ÷ 13 dapat 2.\n- Hasil akhir: 12.",
        penguatanAbstrak: "Drill perkalian belasan (11-20) untuk membantu kecepatan estimasi pembagi dua angka.",
        kesalahanUmum: "Melakukan coret-coret tebak perkalian acak yang sangat panjang di pinggir kertas.",
        tipsGuru: "Ajari anak melakukan estimasi cepat dengan melihat angka satuan pembagi dan angka satuan yang dibagi.",
        gasingExample: "156 ÷ 13 = 12"
      };
    }

    return {
      filosofi: "Pembagian Gasing adalah kelanjutan wajar dari otomatisasi perkalian. Dengan memproses angka dari kiri ke kanan, anak dapat melakukan kalkulasi mental secara instan.",
      konsepKunci: "Kebalikan dari perkalian. Pembagian horizontal dengan pemindahan sisa mental.",
      tahapKonkret: "Gunakan lidi ikat (puluhan) dan lidi satuan untuk memperagakan proses pembagian adil dan transfer sisa.",
      tahapAbstrak: "Tuliskan pembagian secara horizontal. Bagi nilai tempat terbesar terlebih dahulu, bawa sisanya sebagai tambahan nilai puluhan untuk tempat berikutnya.",
      penguatanAbstrak: "Latih kemampuan mendominasi tabel perkalian dasar agar anak bisa menebak hasil bagi di bawah 2 detik.",
      kesalahanUmum: "Memaksa anak menulis porogapit bersusun panjang ke bawah untuk angka-angka sederhana yang bisa dicongak mental.",
      tipsGuru: "Yakinkan anak bahwa membagi itu sama gampangnya dengan menguji kebalikan perkalian yang menyenangkan.",
      gasingExample: `${title}`
    };
  }

  // Backup default return
  return {
    filosofi: "Gasing bekerja dari depan secara progresif. Matematika disajikan secara Gampang, Asyik, dan Menyenangkan.",
    konsepKunci: "P = Puluhan, S = Satuan. Penggabungan nilai tempat dari depan ke belakang.",
    tahapKonkret: "Gunakan lidi atau benda fisik untuk menunjukkan kuantitas nyata yang digabungkan.",
    tahapAbstrak: "Tuliskan operasi secara horizontal dan tunjukkan alur penentuan angka dari nilai tempat terbesar langsung.",
    penguatanAbstrak: "Melatih refleks di bawah 2 detik dengan drill rutin terstruktur.",
    kesalahanUmum: "Terjebak menghitung mundur atau bersusun konvensional dari arah kanan.",
    tipsGuru: "Beri apresiasi tinggi pada kecepatan dan kecermatan bernalar mental anak.",
    gasingExample: ""
  };
}
