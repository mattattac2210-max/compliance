import type { ContentTranslations } from "./types";

export const idContent: ContentTranslations = {
  gates: [
    {
      layerLabel: "Prasyarat",
      title: "Badan Hukum — PT PMA",
      subtitle: "Pendirian perusahaan harus selesai sebelum pengajuan izin apa pun",
      rolePillText: "Penyimpanan dokumen saja",
      dscvrRole: "Peran DSCVR — Penyimpanan Dokumen",
      dscvrRoleDesc: "DSCVR menyimpan akta pendirian perusahaan, persetujuan SK Kemenkumham, NPWP badan, dan konfirmasi bank. Pendirian PT PMA memerlukan notaris Indonesia berlisensi — DSCVR tidak memberikan saran mengenai struktur atau hukum perusahaan.",
      alerts: [
        {
          content: "<strong>Risiko paparan regulasi.</strong> Menggunakan warga negara Indonesia untuk memegang saham atas nama pemilik asing membawa risiko regulasi yang signifikan bagi kedua belah pihak dan telah menghadapi peningkatan pengawasan sejak 2024. PT PMA dengan kepemilikan asing 100% adalah struktur terdokumentasi berisiko rendah untuk KBLI 55193.",
        },
      ],
      infoBlocks: [
        {
          title: "Langkah yang Diselesaikan Secara Eksternal",
          content: "",
          items: [
            "Reservasi nama perusahaan melalui AHU",
            "Akta Pendirian yang dinotariskan",
            "Persetujuan Kementerian — SK Kemenkumham",
            "NPWP Badan (nomor pokok wajib pajak)",
            "Rekening bank + modal disetor IDR 2,5 miliar",
          ],
        },
        {
          title: "Perkiraan Jangka Waktu & Biaya",
          content: "Perkiraan 4\u20138 minggu dari akta hingga NIB + rekening bank. Biaya profesional: perkiraan IDR 30\u201380 juta. Biaya bervariasi tergantung penyedia. Modal disetor minimum: IDR 2,5 miliar (BKPM Reg 5/2025).",
        },
      ],
      portals: [
        { label: "AHU Online — Company Name & Deed" },
        { label: "OSS RBA — Business Registration" },
        { label: "DJP — Corporate NPWP" },
      ],
    },
    {
      layerLabel: "Lapisan Satu — Struktural",
      title: "Dokumentasi Zonasi — KKPR",
      subtitle: "Dokumentasi zonasi yang hilang atau belum diverifikasi membahayakan semua tahapan selanjutnya",
      rolePillText: "Unggah dokumen + peta",
      dscvrRole: "Peran DSCVR — Unggah Dokumen & Pelacakan Status",
      dscvrRoleDesc: "DSCVR menyimpan sertifikat KKPR, mencatat klasifikasi zona yang dilaporkan operator, dan menandai ketika perubahan KBLI mungkin memerlukan KKPR baru. DSCVR tidak menentukan status zona hukum — itu berada pada konsultan berlisensi dan DPMPTSP terkait.",
      alerts: [
        {
          content: "Pasar termasuk Canggu dan Pererenan mengandung zona merah muda (pariwisata) dan kuning (perumahan) dalam jarak dekat. Status zona harus diverifikasi pada tingkat bidang tanah individu, bukan pada tingkat kelurahan atau jalan.",
        },
      ],
      zones: [
        { name: "Merah Muda", status: "\u2191 Pariwisata — lanjutkan" },
        { name: "Oranye", status: "\u2191 Campuran — bersyarat" },
        { name: "Merah", status: "\u2191 Komersial — layak" },
        { name: "Kuning", status: "\u2193 Perumahan — risiko tinggi" },
        { name: "Hijau", status: "\u2193 Pertanian — risiko tinggi" },
        { name: "Konservasi", status: "\u2193 Konservasi — risiko tinggi" },
      ],
      infoBlocks: [
        {
          title: "KKPR — Apa Itu",
          content: "Sertifikat kesesuaian zonasi melalui OSS \u2192 DPMPTSP. Mengonfirmasi penggunaan lahan sesuai dengan KBLI yang dinyatakan. Perkiraan jangka waktu: 2\u20136 minggu. Tanpa biaya permohonan pemerintah. OSS memeriksa silang RDTR secara otomatis saat pengajuan.",
        },
        {
          title: "Catatan Risiko Konversi Zona",
          content: "Layanan yang menjanjikan konversi zonasi pertanian atau perumahan menghadapi hambatan regulasi yang signifikan dan jangka waktu yang panjang tanpa hasil yang dijamin. Saran hukum independen direkomendasikan sebelum melanjutkan atas dasar ini.",
        },
      ],
      portals: [
        { label: "GISTARU Bali — Official Zone Map" },
        { label: "OSS RBA — KKPR Application" },
        { label: "RDTR ATR/BPN — National Spatial Reference" },
      ],
    },
    {
      layerLabel: "Lapisan Dua — Struktural",
      title: "Perizinan Usaha — NIB + KBLI",
      subtitle: "NIB harus mencapai status Terverifikasi — status Terbit saja tidak lolos verifikasi OTA",
      rolePillText: "Pelacakan masa berlaku izin",
      dscvrRole: "Peran DSCVR — Pemantauan Status NIB",
      dscvrRoleDesc: "DSCVR menyimpan sertifikat NIB, melacak status yang ditampilkan (Terbit / Terverifikasi / Ditangguhkan), dan memberi peringatan ketika dokumen pendukung verifikasi mendekati masa berlaku. DSCVR tidak mengajukan ke OSS atau memberikan saran tentang pemilihan KBLI — konsultasikan dengan spesialis pendaftaran usaha berlisensi.",
      alerts: [
        {
          content: "<strong>Persyaratan konsistensi identitas.</strong> Nama badan hukum yang terdaftar di OSS harus cocok dengan nama akun di setiap listing OTA secara tepat. Ketidakcocokan — bahkan format minor — memicu kegagalan verifikasi terlepas dari status izin yang mendasarinya.",
        },
      ],
      infoBlocks: [
        {
          title: "Kode KBLI yang Relevan",
          content: "",
          items: [
            "<strong>55193</strong> — Villa (komersial, dengan staf, 4+ kamar tidur)",
            "<strong>55194</strong> — Pondok Wisata (skala homestay lebih kecil)",
            "<strong>55199</strong> — Kategori umum: OSS semakin sering menandai untuk villa komersial besar. Tinjau dengan pendaftar.",
          ],
        },
        {
          title: "KBLI 2025 — Catatan Transisi",
          content: "BPS menerbitkan KBLI 2025 pada Desember 2025, menggantikan KBLI 2020. Masa transisi berlaku untuk pendaftaran yang sudah ada. Operator harus mengonfirmasi status dengan konsultan OSS mereka. DSCVR akan menandai ini sebagai peristiwa pelacakan.",
        },
      ],
      portals: [
        { label: "OSS RBA — NIB Application & Status" },
        { label: "BPS — KBLI 2025 Classification" },
        { label: "BKPM — Investment Coordinating Board" },
      ],
    },
    {
      layerLabel: "Lapisan Tiga — Struktural",
      title: "Kepatuhan Bangunan — PBG + SLF",
      subtitle: "Masa berlaku SLF habis adalah penyebab paling umum perubahan mendadak status NIB — siklus perpanjangan 5 tahun",
      rolePillText: "Pengingat inspeksi",
      dscvrRole: "Peran DSCVR — Pelacakan Masa Berlaku + Pengingat Perpanjangan",
      dscvrRoleDesc: "DSCVR menyimpan sertifikat SLF, melacak tanggal kedaluwarsa, dan mengeluarkan peringatan pada 90 / 60 / 30 / 14 hari sebelum masa berlaku habis. Perpanjangan memerlukan Pengkaji Teknis berlisensi dan pengajuan ke DPMPTSP — DSCVR tidak mengelola proses tersebut.",
      alerts: [
        {
          content: "Sebagian besar stok villa Bali sebelum 2021 memiliki PBG atau IMB dengan <strong>fungsi Perumahan</strong> — pemblokir perizinan struktural yang paling umum. Perubahan memerlukan gambar as-built dari insinyur berlisensi. Perkiraan biaya: IDR 10\u201350 juta. Perkiraan jangka waktu: 4\u201312 minggu.",
        },
      ],
      infoBlocks: [
        {
          title: "Persyaratan Fungsi PBG",
          content: "Harus tertulis: <strong>Komersial / Pariwisata / Non-Perumahan</strong>. Fungsi perumahan memblokir TDUP dan status NIB Terverifikasi. Diajukan atau diubah melalui SIMBG. IMB yang diterbitkan sebelum 2021 harus ditinjau.",
        },
        {
          title: "Perpanjangan SLF — Perkiraan Jangka Waktu",
          content: "SLF komersial berlaku <strong>5 tahun</strong>. Persiapkan 8\u201312 minggu untuk siklus perpanjangan penuh: Pengkaji Teknis, persiapan pra-inspeksi, inspeksi formal, remediasi apa pun, pemrosesan DPMPTSP (perkiraan 14\u201345 hari).",
        },
      ],
      portals: [
        { label: "SIMBG — PBG & SLF Submission" },
        { label: "OSS RBA — Building Compliance" },
        { label: "DPMPTSP Badung — Permit Office" },
      ],
    },
    {
      layerLabel: "Lapisan Empat — Alur Operasional",
      title: "Pajak — PB1 / NPWPD / PPh",
      subtitle: "Dimulai bersamaan dengan penerbitan NIB — bukan setelah kepatuhan bangunan",
      rolePillText: "Kalender pelaporan + penyimpanan",
      dscvrRole: "Peran DSCVR — Kalender Pelaporan + Penyimpanan Dokumen",
      dscvrRoleDesc: "DSCVR memelihara kalender kewajiban pajak, menyimpan pendaftaran NPWPD dan konfirmasi pelaporan SPTPD. DSCVR tidak menyiapkan laporan, memberikan saran tentang posisi pajak, atau menafsirkan hukum pajak. Gunakan jasa konsultan pajak Indonesia berlisensi.",
      alerts: [
        {
          content: "<strong>Risiko pencocokan data (CoreTax, aktif sejak Januari 2025).</strong> Sistem CoreTax Indonesia dilaporkan mencocokkan silang pendapatan pemesanan OTA terhadap pelaporan PB1. Perbedaan signifikan dapat menimbulkan perhatian audit. Konfirmasi cakupan pembagian data OTA dengan konsultan pajak Anda.",
        },
      ],
      infoBlocks: [
        {
          title: "PB1 Bulanan — Badung",
          content: "",
          items: [
            "Daftarkan NPWPD melalui e-Palapa (Badung)",
            "Pungut 10% PB1 dari setiap tamu — labelkan sebagai pajak daerah, bukan PPN",
            "Laporkan SPTPD paling lambat tanggal 20 bulan berikutnya",
            "Setor melalui BPD Bali atau Virtual Account",
          ],
        },
        {
          title: "Tenggat Waktu Tahunan Utama",
          content: "",
          items: [
            "<strong>30 April</strong> — SPT Tahunan (badan)",
            "<strong>Tanggal 15 bulanan</strong> — angsuran PPh 25",
            "<strong>Tanggal 20 bulanan</strong> — PPh 21 / 23 / 26",
            "<strong>Tanggal 10 bulanan</strong> — iuran BPJS",
          ],
        },
      ],
      portals: [
        { label: "e-Palapa Badung — NPWPD & SPTPD" },
        { label: "DJP Online — PPh Filing" },
        { label: "CoreTax — Tax Administration" },
        { label: "Bapenda Badung — Regional Revenue" },
      ],
    },
    {
      layerLabel: "Lapisan Lima — Alur Operasional",
      title: "Staf & Kepatuhan Ketenagakerjaan",
      subtitle: "Berjalan bersamaan — tidak menunggu penyelesaian tahap bangunan atau pajak",
      rolePillText: "Pelacakan izin + kontrak",
      dscvrRole: "Peran DSCVR — Profil Staf + Pelacakan Masa Berlaku Izin",
      dscvrRoleDesc: "DSCVR memelihara profil setiap karyawan, menyimpan pendaftaran BPJS, kontrak kerja, dan dokumen KITAS dengan peringatan masa berlaku. DSCVR tidak memberikan saran tentang hukum ketenagakerjaan, permohonan imigrasi, atau perhitungan iuran.",
      alerts: [
        {
          content: "<strong>Risiko paparan KITAS.</strong> Warga negara asing yang mengelola operasi villa tanpa Investor KITAS yang valid membawa risiko imigrasi yang signifikan — peningkatan perhatian penegakan hukum di Bali sejak 2024. Perkiraan biaya: IDR 3\u20138 juta per tahun melalui BKPM atau agen berlisensi.",
        },
      ],
      infoBlocks: [
        {
          title: "Tarif Indikatif BPJS",
          content: "",
          items: [
            "Kesehatan: <strong>4%</strong> pemberi kerja + 1% pekerja (berlaku batas maksimum)",
            "Ketenagakerjaan: sekitar <strong>6,24\u20137,74%</strong> total pemberi kerja (bervariasi berdasarkan kelas risiko)",
            "Batas waktu pembayaran: tanggal 10 setiap bulan",
            "Daftarkan dalam 30 hari setelah perekrutan",
          ],
        },
        {
          title: "THR — Lebaran 2026",
          content: "Bonus wajib satu bulan gaji untuk semua karyawan. Batas waktu hukum indikatif: 7 hari sebelum Lebaran (perkiraan ~22 Maret 2026). Berlaku untuk semua staf tanpa memandang jabatan. Konfirmasi tanggal pasti setiap tahun.",
        },
      ],
      portals: [
        { label: "eDabu — BPJS Kesehatan" },
        { label: "SIPP Online — BPJamsostek" },
        { label: "Ditjen Imigrasi — KITAS" },
        { label: "BKPM — Investor KITAS" },
      ],
    },
    {
      layerLabel: "Lapisan Enam — Alur Operasional",
      title: "Keselamatan Operasional — Standar Berkelanjutan",
      subtitle: "Permenpar 6/2025 mewajibkan SOP tertulis — perpustakaan tugas dengan stempel waktu adalah buktinya",
      rolePillText: "Pelaksanaan tugas + log",
      dscvrRole: "Peran DSCVR — Pelaksanaan Tugas + Log Bukti",
      dscvrRoleDesc: "Di sinilah DSCVR paling terintegrasi secara operasional. Tugas berulang, daftar periksa yang diselesaikan, dan foto dengan stempel waktu PoP menghasilkan jejak bukti yang berfungsi sebagai catatan SOP yang diwajibkan berdasarkan Permenpar 6/2025.",
      alerts: [
        {
          content: "Permenpar 6/2025 mewajibkan SOP terdokumentasi untuk check-in, check-out, housekeeping, pemeliharaan, dan tanggap darurat. Perpustakaan tugas dengan stempel waktu penyelesaian merupakan bukti SOP terdokumentasi selama inspeksi.",
        },
      ],
      infoBlocks: [
        {
          title: "Tugas Keselamatan Berulang",
          content: "",
          items: [
            "<strong>Bulanan:</strong> Pemeriksaan segel dan pengukur alat pemadam kebakaran",
            "<strong>Dua kali seminggu:</strong> Kimia kolam renang (Cl 1\u20133ppm, pH 7,2\u20137,8)",
            "<strong>Triwulanan:</strong> Foto rambu pintu darurat KELUAR",
            "<strong>Tahunan:</strong> Servis penuh alat pemadam kebakaran + sertifikat",
          ],
        },
        {
          title: "Keselarasan Inspeksi SLF",
          content: "Perpanjangan SLF menginspeksi struktural, elektrikal, kebakaran, pipa, kolam, dan ventilasi. Properti yang menjalankan log tugas keselamatan DSCVR aktif lebih siap untuk persiapan pra-inspeksi, memunculkan masalah berulang sebelum inspeksi formal dipicu.",
        },
      ],
      portals: [
        { label: "JDIH Kemenparekraf — Permenpar 6/2025" },
        { label: "Dinas Damkar Badung — Fire Safety" },
      ],
    },
    {
      layerLabel: "Lapisan Tujuh — Gerbang Verifikasi",
      title: "Verifikasi OTA — Kepatuhan Platform",
      subtitle: "Batas waktu 31 Maret 2026 — memerlukan semua tahapan sebelumnya dalam kondisi teratur",
      rolePillText: "Pemeriksaan kepatuhan",
      dscvrRole: "Peran DSCVR — Penilaian Kesiapan",
      dscvrRoleDesc: "DSCVR mencocokkan silang semua dokumen yang diunggah terhadap persyaratan verifikasi OTA dan menghasilkan laporan kesiapan. DSCVR tidak mengajukan permohonan verifikasi atau menjamin persetujuan OTA — operator mengelola pengajuan di sisi platform secara langsung.",
      alerts: [
        {
          content: "<strong>Batas waktu 31 Maret 2026.</strong> Platform OTA (Airbnb, Booking.com, Agoda, Traveloka) diharapkan mulai menegakkan persyaratan verifikasi Permenparekraf. Listing yang tidak patuh berisiko penangguhan atau penghapusan.",
        },
      ],
      infoBlocks: [
        {
          title: "Persyaratan Verifikasi OTA",
          content: "",
          items: [
            "NIB dalam status Terverifikasi (bukan hanya Terbit)",
            "TDUP atau Sertifikat Standar Usaha aktif",
            "Nama badan hukum cocok dengan akun OTA secara tepat",
            "Semua dokumen pendukung masih berlaku (tidak kedaluwarsa)",
            "Pendaftaran pajak aktif (NPWP, NPWPD)",
          ],
        },
        {
          title: "Jadwal Penegakan",
          content: "Penegakan di sisi platform diharapkan dimulai secara bertahap setelah 31 Maret 2026. Tindakan awal dapat mencakup pemberitahuan peringatan, pengurangan visibilitas, pembatasan pemesanan, atau penangguhan penuh. Jadwal dan tingkat keparahan bervariasi per platform.",
        },
      ],
      portals: [
        { label: "Airbnb — Host Compliance" },
        { label: "Booking.com — Partner Hub" },
        { label: "Kemenparekraf — Tourism Registry" },
      ],
    },
  ],
  auditSections: [
    {
      title: "Badan Hukum & Perizinan",
      items: [
        { title: "Akta PT PMA terdaftar dan disetujui", desc: "Surat persetujuan SK Kemenkumham tersimpan dengan nama perusahaan yang sesuai" },
        { title: "NIB diterbitkan dan dalam status Terverifikasi", desc: "Periksa dasbor OSS — status 'Terbit' saja tidak memenuhi persyaratan OTA" },
        { title: "Kode KBLI sesuai dengan operasi aktual", desc: "55193 untuk villa komersial, 55194 untuk homestay — tinjau dengan pendaftar" },
        { title: "Sertifikat zonasi KKPR diunggah", desc: "Mengonfirmasi bidang tanah berada di zona pariwisata yang diizinkan (merah muda, oranye, atau merah)" },
        { title: "Nama badan hukum cocok dengan akun OTA", desc: "Kecocokan karakter per karakter secara tepat diperlukan di semua listing platform" },
      ],
    },
    {
      title: "Bangunan & Keselamatan",
      items: [
        { title: "PBG menunjukkan fungsi Komersial / Pariwisata", desc: "Fungsi perumahan memblokir TDUP — perubahan diperlukan melalui SIMBG" },
        { title: "SLF masih berlaku dan tidak dalam 90 hari menjelang kedaluwarsa", desc: "Siklus perpanjangan 5 tahun — persiapkan 8-12 minggu untuk proses perpanjangan penuh" },
        { title: "Alat pemadam kebakaran diservis dan disegel", desc: "Pemeriksaan visual bulanan + servis penuh tahunan dengan sertifikat" },
        { title: "Kimia kolam renang dalam rentang aman", desc: "Klorin 1-3ppm, pH 7,2-7,8 — pengujian dua kali seminggu diperlukan" },
        { title: "Rambu pintu darurat (KELUAR) difoto", desc: "Bukti foto triwulanan untuk catatan kepatuhan SOP" },
      ],
    },
    {
      title: "Pajak & Ketenagakerjaan",
      items: [
        { title: "NPWPD terdaftar di Bapenda", desc: "Diperlukan untuk pemungutan dan pelaporan PB1 (pajak pariwisata daerah)" },
        { title: "PB1 dilaporkan paling lambat tanggal 20 setiap bulan", desc: "10% dipungut dari tamu — laporkan SPTPD melalui e-Palapa Badung" },
        { title: "BPJS Kesehatan terdaftar untuk semua staf", desc: "4% pemberi kerja + 1% pekerja — daftarkan dalam 30 hari setelah perekrutan" },
        { title: "BPJS Ketenagakerjaan terdaftar untuk semua staf", desc: "Sekitar 6,24-7,74% pemberi kerja — batas waktu pembayaran tanggal 10 bulanan" },
        { title: "KITAS pemilik asing masih berlaku", desc: "Investor KITAS melalui BKPM — peningkatan penegakan di Bali sejak 2024" },
        { title: "THR dialokasikan untuk Lebaran 2026", desc: "Satu bulan gaji — perkiraan batas waktu ~22 Maret 2026" },
      ],
    },
  ],
  guideCards: [
    {
      title: "Verifikasi Zonasi",
      role: "Konsultan Berlisensi",
      desc: "Verifikasi klasifikasi zona bidang tanah Anda pada tingkat plot individu menggunakan GISTARU Bali. Zona merah muda (pariwisata), oranye (campuran), dan merah (komersial) layak untuk operasi pariwisata.",
      links: [{ label: "GISTARU Bali" }],
    },
    {
      title: "Permohonan NIB",
      role: "Pendaftar Usaha",
      desc: "Ajukan NIB melalui OSS RBA dengan kode KBLI yang benar. Pastikan NIB mencapai status 'Terverifikasi' — 'Terbit' saja tidak cukup untuk persyaratan verifikasi OTA.",
      links: [{ label: "OSS RBA" }],
    },
    {
      title: "Peninjauan Izin Bangunan",
      role: "Insinyur Berlisensi",
      desc: "Tinjau klasifikasi fungsi PBG. Bangunan sebelum 2021 mungkin memiliki IMB dengan fungsi Perumahan — perubahan ke fungsi Komersial/Pariwisata diperlukan melalui SIMBG sebelum pengajuan TDUP.",
      links: [{ label: "SIMBG" }],
    },
    {
      title: "Pendaftaran Pajak",
      role: "Konsultan Pajak",
      desc: "Daftarkan NPWPD di Bapenda untuk pemungutan PB1. Siapkan akses CoreTax untuk kewajiban pajak nasional. Pelaporan SPTPD bulanan dan angsuran PPh triwulanan adalah persyaratan berkelanjutan.",
      links: [{ label: "e-Palapa Badung" }, { label: "DJP Online" }],
    },
    {
      title: "Kepatuhan Staf",
      role: "HR / Imigrasi",
      desc: "Daftarkan semua staf di BPJS Kesehatan dan Ketenagakerjaan dalam 30 hari setelah perekrutan. Operator asing memerlukan Investor KITAS melalui BKPM. Bonus THR harus dialokasikan sebelum Lebaran.",
      links: [{ label: "eDabu" }, { label: "SIPP Online" }],
    },
    {
      title: "Kesiapan OTA",
      role: "Operasional",
      desc: "Cocokkan silang semua dokumen kepatuhan terhadap persyaratan platform OTA. Pastikan nama badan hukum cocok di semua listing. Target: semua dokumen berlaku dan diunggah sebelum 31 Maret 2026.",
      links: [{ label: "Kemenparekraf" }],
    },
  ],
  timelineItems: [
    { week: "Minggu 1\u20132", title: "Badan Hukum & Dasar", desc: "Selesaikan pendirian PT PMA, dapatkan NPWP badan, buka rekening bank dengan modal disetor" },
    { week: "Minggu 2\u20134", title: "Zonasi & Perizinan", desc: "Verifikasi status zona, ajukan KKPR, mulai permohonan NIB melalui OSS RBA" },
    { week: "Minggu 3\u20136", title: "Kepatuhan Bangunan", desc: "Tinjau fungsi PBG, mulai perubahan jika diperlukan, mulai proses SLF dengan Pengkaji Teknis" },
    { week: "Minggu 4\u20138", title: "Pengaturan Pajak & Ketenagakerjaan", desc: "Daftarkan NPWPD, siapkan CoreTax, daftarkan staf di BPJS, dapatkan KITAS jika berlaku" },
    { week: "Minggu 6\u201310", title: "Standar Operasional", desc: "Buat perpustakaan tugas keselamatan berulang, mulai pengumpulan bukti SOP melalui DSCVR" },
    { week: "Minggu 8\u201312", title: "Verifikasi OTA", desc: "Cocokkan silang semua dokumen, ajukan verifikasi platform, selesaikan ketidaksesuaian apa pun" },
    { week: "Paling lambat 31 Mar 2026", title: "Target Kepatuhan Penuh", desc: "Semua tujuh tahapan selesai, dokumen berlaku, listing OTA terverifikasi dan terlindungi" },
  ],
};
