import type { TermTranslation, GuideTranslation, SequenceStep } from "@shared/schema";

export const termTranslationsMap: Record<string, { uk: TermTranslation; id: TermTranslation }> = {
  "wet-signature": {
    uk: {
      term: "Мокрий підпис",
      tags: ["Підписи", "Документи"],
      plainDefinition: "Фізичний підпис, зроблений ручкою на друкованому документі (не цифровий підпис).",
      whyItMatters: [
        "Багато державних установ Індонезії вимагають паперові підписи для верифікації",
        "Цифрові підписи можуть бути відхилені для певних офіційних подань"
      ],
      typicalProcessSteps: [
        "Завантажте/експортуйте форму або документ (PDF)",
        "Роздрукуйте його",
        "Підпишіть ручкою (директор/уповноважена особа)",
        "За потреби поставте печатку компанії",
        "Відскануйте або сфотографуйте чітко",
        "Завантажте до DSCVR та прикріпіть до відповідного елемента комплаєнсу"
      ],
      whatToStore: [
        "Скан підписаного PDF",
        "Фото сторінки з підписом за потреби"
      ],
      commonPitfalls: [
        "Скани низької якості, які важко прочитати",
        "Відсутня сторінка з підписом",
        "Неправильна уповноважена особа (має бути уповноважений директор)"
      ]
    },
    id: {
      term: "Tanda Tangan Basah",
      tags: ["Tanda Tangan", "Dokumen"],
      plainDefinition: "Tanda tangan fisik yang dibubuhkan dengan pena di atas dokumen cetak (bukan tanda tangan digital).",
      whyItMatters: [
        "Banyak kantor pemerintah Indonesia mensyaratkan tanda tangan basah untuk verifikasi",
        "Tanda tangan digital dapat ditolak untuk pengajuan resmi tertentu"
      ],
      typicalProcessSteps: [
        "Unduh/ekspor formulir atau dokumen (PDF)",
        "Cetak dokumen tersebut",
        "Tanda tangani dengan pena (direktur/penandatangan resmi)",
        "Bubuhkan stempel perusahaan jika diperlukan",
        "Pindai atau foto dengan jelas",
        "Unggah ke DSCVR dan lampirkan pada item kepatuhan yang relevan"
      ],
      whatToStore: [
        "Hasil pindai PDF yang sudah ditandatangani",
        "Foto halaman tanda tangan jika diperlukan"
      ],
      commonPitfalls: [
        "Hasil pindai berkualitas rendah yang sulit dibaca",
        "Halaman tanda tangan tidak disertakan",
        "Penandatangan yang salah (harus direktur yang berwenang)"
      ]
    }
  },
  "company-stamp-chop": {
    uk: {
      term: "Печатка компанії",
      tags: ["Підписи", "Документи"],
      plainDefinition: "Печатка або штамп компанії, що використовується для засвідчення офіційних документів, виданих підприємством.",
      whyItMatters: [
        "Часто вимагається державними органами для підтвердження того, що документи офіційно видані підприємством",
        "Може вимагатися разом із підписами на контрактах та поданнях"
      ],
      typicalProcessSteps: [
        "Роздрукуйте документ",
        "Поставте печатку у вказаному місці (зазвичай біля підпису)",
        "Відскануйте та завантажте"
      ],
      whatToStore: [
        "Скан документа з печаткою",
        "Фотодоказ за потреби"
      ],
      commonPitfalls: [
        "Використання неправильної печатки (наприклад, зі старою назвою компанії)",
        "Печатка поверх ключового тексту, що робить його нечитабельним"
      ]
    },
    id: {
      term: "Cap / Stempel Perusahaan",
      tags: ["Tanda Tangan", "Dokumen"],
      plainDefinition: "Cap atau stempel perusahaan yang digunakan untuk mengesahkan dokumen resmi yang dikeluarkan oleh perusahaan.",
      whyItMatters: [
        "Sering diminta oleh instansi pemerintah untuk mengonfirmasi bahwa dokumen resmi dikeluarkan oleh perusahaan",
        "Mungkin diperlukan bersamaan dengan tanda tangan pada kontrak dan pengajuan"
      ],
      typicalProcessSteps: [
        "Cetak dokumen",
        "Bubuhkan stempel di tempat yang ditentukan (biasanya di dekat tanda tangan)",
        "Pindai dan unggah"
      ],
      whatToStore: [
        "Hasil pindai dokumen yang sudah distempel",
        "Bukti foto jika diperlukan"
      ],
      commonPitfalls: [
        "Menggunakan stempel yang salah (misalnya nama perusahaan lama)",
        "Membubuhkan stempel di atas teks penting sehingga tidak terbaca"
      ]
    }
  },
  "notarised-document": {
    uk: {
      term: "Нотаріально засвідчений документ",
      tags: ["Документи", "Юридичне"],
      plainDefinition: "Документ, який був перевірений та засвідчений ліцензованим нотаріусом.",
      whyItMatters: [
        "Використовується для підтвердження особи, підписів та автентичності документів",
        "Вимагається для багатьох офіційних подань, включаючи створення компанії та операції з нерухомістю"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Нотаріально засвідчена копія (PDF)",
        "Квитанція або реєстраційний номер, якщо видано"
      ],
      commonPitfalls: [
        "Плутанина між нотаріально засвідченою та завіреною копією — це різні речі",
        "Використання прострочених або неправильних версій документів"
      ]
    },
    id: {
      term: "Dokumen Notaris",
      tags: ["Dokumen", "Hukum"],
      plainDefinition: "Dokumen yang telah diverifikasi dan disahkan oleh notaris berlisensi.",
      whyItMatters: [
        "Digunakan untuk mengonfirmasi identitas, tanda tangan, dan keaslian dokumen",
        "Diperlukan untuk banyak pengajuan resmi termasuk pendirian perusahaan dan transaksi properti"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Salinan yang disahkan notaris (PDF)",
        "Tanda terima atau nomor referensi jika diterbitkan"
      ],
      commonPitfalls: [
        "Salah membedakan dokumen notaris dengan salinan yang dilegalisir — keduanya berbeda",
        "Menggunakan versi dokumen yang sudah kedaluwarsa atau tidak tepat"
      ]
    }
  },
  "legalised-copy": {
    uk: {
      term: "Легалізована копія",
      tags: ["Документи", "Юридичне"],
      plainDefinition: "Копія, яка була офіційно засвідчена уповноваженим органом або нотаріусом як точна та достовірна копія оригіналу.",
      whyItMatters: [
        "Деякі державні заявки вимагають легалізовані копії замість оригіналів",
        "Забезпечує офіційну гарантію того, що копія відповідає оригінальному документу"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Скан легалізованого PDF",
        "Підтверджуюча квитанція від органу, що здійснив легалізацію"
      ],
      commonPitfalls: [
        "Завантаження звичайної фотокопії замість належно легалізованої копії"
      ]
    },
    id: {
      term: "Salinan Legalisir",
      tags: ["Dokumen", "Hukum"],
      plainDefinition: "Salinan yang telah diverifikasi secara resmi oleh pejabat berwenang atau notaris sebagai salinan yang benar dan akurat dari dokumen asli.",
      whyItMatters: [
        "Beberapa pengajuan pemerintah mensyaratkan salinan yang dilegalisir sebagai pengganti dokumen asli",
        "Memberikan jaminan resmi bahwa salinan tersebut sesuai dengan dokumen asli"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Hasil pindai PDF yang dilegalisir",
        "Tanda terima pendukung dari pejabat yang melegalisir"
      ],
      commonPitfalls: [
        "Mengunggah fotokopi biasa alih-alih salinan yang dilegalisir dengan benar"
      ]
    }
  },
  "certified-copy": {
    uk: {
      term: "Засвідчена копія",
      tags: ["Документи"],
      plainDefinition: "Копія, підписана та/або скріплена печаткою уповноваженою особою, що підтверджує її відповідність оригінальному документу.",
      whyItMatters: [
        "Часто приймається замість оригіналів, коли оригінали не вимагаються",
        "Дешевше та швидше за нотаріальне засвідчення для багатьох рутинних подань"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Скан засвідченої копії (PDF)",
        "Дані особи, що засвідчила (ім'я, посада, дата)"
      ],
      commonPitfalls: [
        "Відсутні дані особи, що засвідчила, або дата на копії"
      ]
    },
    id: {
      term: "Salinan Tersertifikasi",
      tags: ["Dokumen"],
      plainDefinition: "Salinan yang ditandatangani dan/atau distempel oleh pejabat berwenang yang menyatakan bahwa salinan tersebut sesuai dengan dokumen asli.",
      whyItMatters: [
        "Sering diterima sebagai pengganti dokumen asli jika dokumen asli tidak diperlukan",
        "Lebih murah dan lebih cepat daripada notarisasi untuk banyak pengajuan rutin"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Hasil pindai salinan tersertifikasi (PDF)",
        "Detail pihak yang mengesahkan (nama, jabatan, tanggal)"
      ],
      commonPitfalls: [
        "Detail pihak yang mengesahkan atau tanggal tidak tercantum pada salinan"
      ]
    }
  },
  "oss-online-single-submission": {
    uk: {
      term: "OSS (Єдине онлайн-подання)",
      tags: ["OSS", "Дозволи"],
      plainDefinition: "Онлайн-портал Індонезії, що використовується для реєстрації бізнесу та управління певними дозволами та ліцензіями.",
      whyItMatters: [
        "Багато реєстрацій та ліцензій починаються тут — це центральний державний реєстр",
        "Необхідний для NIB, вибору KBLI та різних заявок на дозволи"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Знімки екрану підтвердження подання",
        "PDF-файли з порталу OSS",
        "Реєстраційні номери"
      ],
      commonPitfalls: [
        "Втрата облікових даних для входу на портал OSS",
        "Незаповнені поля, що призводять до відхилень або затримок"
      ]
    },
    id: {
      term: "OSS (Pengajuan Tunggal Daring)",
      tags: ["OSS", "Perizinan"],
      plainDefinition: "Portal daring Indonesia yang digunakan untuk mendaftarkan usaha dan mengelola perizinan serta lisensi tertentu.",
      whyItMatters: [
        "Banyak pendaftaran dan perizinan dimulai di sini — ini adalah catatan resmi pemerintah pusat",
        "Diperlukan untuk NIB, pemilihan KBLI, dan berbagai pengajuan perizinan"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Tangkapan layar konfirmasi pengajuan",
        "Keluaran PDF dari portal OSS",
        "Nomor pendaftaran"
      ],
      commonPitfalls: [
        "Kehilangan kredensial login portal OSS",
        "Kolom yang tidak lengkap sehingga menyebabkan penolakan atau keterlambatan"
      ]
    }
  },
  "nib-business-identification-number": {
    uk: {
      term: "NIB (Номер ідентифікації бізнесу)",
      tags: ["OSS", "Дозволи"],
      plainDefinition: "Основний ідентифікаційний номер бізнесу, що видається через портал OSS після успішної реєстрації.",
      whyItMatters: [
        "Часто вимагається перед отриманням інших дозволів, податковою реєстрацією та операційними кроками",
        "Є основним ідентифікатором бізнесу для взаємодії з державними органами"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Сертифікат NIB (PDF)",
        "Сторінка підтвердження OSS"
      ],
      commonPitfalls: [
        "Неправильні дані категорії бізнесу, введені під час реєстрації",
        "Невідповідність даних компанії між NIB та іншими документами"
      ]
    },
    id: {
      term: "NIB (Nomor Induk Berusaha)",
      tags: ["OSS", "Perizinan"],
      plainDefinition: "Nomor identitas usaha utama yang diterbitkan melalui portal OSS setelah pendaftaran berhasil.",
      whyItMatters: [
        "Sering diperlukan sebelum mengurus perizinan lain, pendaftaran pajak, dan langkah operasional",
        "Berfungsi sebagai identitas usaha utama untuk interaksi dengan pemerintah"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Sertifikat NIB (PDF)",
        "Halaman konfirmasi OSS"
      ],
      commonPitfalls: [
        "Data kategori usaha yang salah dimasukkan saat pendaftaran",
        "Ketidaksesuaian data perusahaan antara NIB dan dokumen lainnya"
      ]
    }
  },
  "kbli": {
    uk: {
      term: "KBLI",
      tags: ["OSS", "Дозволи"],
      plainDefinition: "Стандартні коди класифікації видів діяльності бізнесу в Індонезії, що визначають, чим займається підприємство.",
      whyItMatters: [
        "Обраний код KBLI впливає на те, які ліцензії та дозволи застосовуються до вашого бізнесу",
        "Неправильний вибір KBLI може означати відсутність необхідних дозволів або потребу в повторній реєстрації"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Запис вибору KBLI з OSS",
        "Файл рекомендацій консультанта (за наявності)"
      ],
      commonPitfalls: [
        "Вибір неправильного KBLI та необхідність повторної реєстрації"
      ]
    },
    id: {
      term: "KBLI",
      tags: ["OSS", "Perizinan"],
      plainDefinition: "Kode klasifikasi kegiatan usaha standar Indonesia yang mengkategorikan jenis kegiatan suatu usaha.",
      whyItMatters: [
        "Kode KBLI yang dipilih memengaruhi perizinan dan lisensi apa saja yang berlaku untuk usaha Anda",
        "Pemilihan KBLI yang salah dapat menyebabkan perizinan yang diperlukan terlewat atau harus mendaftar ulang"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Catatan pemilihan KBLI dari OSS",
        "File rekomendasi konsultan (jika ada)"
      ],
      commonPitfalls: [
        "Memilih KBLI yang salah sehingga harus mengulang proses pendaftaran"
      ]
    }
  },
  "pbg-building-approval": {
    uk: {
      term: "PBG (Будівельний дозвіл)",
      tags: ["Дозволи", "Будівництво"],
      plainDefinition: "Дозвіл на будівництво, необхідний для будівництва, реновації або зміни функції/статусу будівлі.",
      whyItMatters: [
        "Необхідний для законного дозволу на будівництво та отримання подальших сертифікатів, таких як SLF",
        "Робота без PBG може призвести до штрафів або примусового закриття"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Документи дозволу PBG",
        "Подані технічні креслення",
        "Примітки інспекції"
      ],
      commonPitfalls: [
        "Відсутність технічних креслень у заявці",
        "Припущення, що старі дозволи на будівництво (IMB) все ще дійсні — PBG замінив IMB"
      ]
    },
    id: {
      term: "PBG (Persetujuan Bangunan)",
      tags: ["Perizinan", "Bangunan"],
      plainDefinition: "Persetujuan atau izin bangunan yang diperlukan untuk pembangunan, renovasi, atau perubahan fungsi/status bangunan.",
      whyItMatters: [
        "Diperlukan untuk persetujuan bangunan yang sah dan sertifikat turunan seperti SLF",
        "Beroperasi tanpa PBG dapat mengakibatkan denda atau penutupan paksa"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Dokumen persetujuan PBG",
        "Gambar teknis yang diajukan",
        "Catatan inspeksi"
      ],
      commonPitfalls: [
        "Gambar teknis tidak disertakan dalam pengajuan",
        "Menganggap izin bangunan lama (IMB) masih berlaku — PBG telah menggantikan IMB"
      ]
    }
  },
  "slf-building-function-certificate": {
    uk: {
      term: "SLF (Сертифікат функції будівлі)",
      tags: ["Дозволи", "Будівництво"],
      plainDefinition: "Сертифікат, що підтверджує придатність будівлі для її призначеної функції та безпеку для експлуатації.",
      whyItMatters: [
        "Часто вимагається для комерційної діяльності, страхування та аудитів комплаєнсу",
        "Може вимагати періодичного поновлення (зазвичай кожні 5 років)"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Сертифікат SLF (PDF)",
        "Звіти інспекцій",
        "Нагадування та дати поновлення"
      ],
      commonPitfalls: [
        "Закінчення терміну дії SLF без поновлення",
        "Відсутність доказів інспекції, необхідних для поновлення"
      ]
    },
    id: {
      term: "SLF (Sertifikat Laik Fungsi)",
      tags: ["Perizinan", "Bangunan"],
      plainDefinition: "Sertifikat yang menyatakan bahwa bangunan layak untuk fungsi yang dimaksudkan dan aman untuk ditempati.",
      whyItMatters: [
        "Sering diperlukan untuk operasional komersial, asuransi, dan audit kepatuhan",
        "Mungkin memerlukan perpanjangan berkala (biasanya setiap 5 tahun)"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "Sertifikat SLF (PDF)",
        "Laporan inspeksi",
        "Pengingat dan tanggal perpanjangan"
      ],
      commonPitfalls: [
        "Membiarkan SLF kedaluwarsa tanpa perpanjangan",
        "Bukti inspeksi yang diperlukan untuk perpanjangan tidak tersedia"
      ]
    }
  },
  "zoning-certificate": {
    uk: {
      term: "Сертифікат зонування",
      tags: ["Дозволи", "Зонування"],
      plainDefinition: "Офіційний документ, що підтверджує дозволену класифікацію використання землі для конкретної ділянки.",
      whyItMatters: [
        "Визначає, які види діяльності юридично дозволені на цій ділянці",
        "Вимагається перед поданням заявки на дозволи на будівництво або операційні дозволи"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "PDF сертифіката зонування",
        "Документація KKPR",
        "Карта або посилання на ділянку"
      ],
      commonPitfalls: [
        "Припущення, що усного підтвердження достатньо — завжди отримуйте письмову документацію",
        "Неперевірка того, чи було зонування нещодавно змінено"
      ]
    },
    id: {
      term: "Sertifikat Zonasi",
      tags: ["Perizinan", "Zonasi"],
      plainDefinition: "Dokumen resmi yang menyatakan klasifikasi penggunaan lahan yang diizinkan untuk properti atau bidang tanah tertentu.",
      whyItMatters: [
        "Menentukan kegiatan apa saja yang secara hukum diizinkan di atas lahan tersebut",
        "Diperlukan sebelum mengajukan izin bangunan atau izin operasional"
      ],
      typicalProcessSteps: null,
      whatToStore: [
        "PDF sertifikat zonasi",
        "Dokumentasi KKPR",
        "Peta atau referensi bidang tanah"
      ],
      commonPitfalls: [
        "Menganggap konfirmasi lisan sudah cukup — selalu dapatkan dokumentasi tertulis",
        "Tidak memeriksa apakah zonasi telah direklasifikasi baru-baru ini"
      ]
    }
  },
  "banjar": {
    uk: {
      term: "Банджар",
      tags: ["Спільнота", "Балі"],
      plainDefinition: "Традиційна балійська громадська організація, що керує місцевими справами, церемоніями та взаємними зобов'язаннями у сусідстві.",
      whyItMatters: [
        "Оператори вілл на Балі повинні підтримувати добрі стосунки з місцевим банджаром",
        "Внески та участь у банджарі є соціально обов'язковими"
      ],
      typicalProcessSteps: null,
      whatToStore: ["Записи про знайомство з банджаром", "Квитанції внесків", "Нотатки зустрічей"],
      commonPitfalls: ["Ігнорування зобов'язань банджару", "Непвідвідування обов'язкових церемоній"]
    },
    id: {
      term: "Banjar",
      tags: ["Komunitas", "Bali"],
      plainDefinition: "Organisasi komunitas tradisional Bali yang mengatur urusan lokal, upacara, dan kewajiban bersama di lingkungan.",
      whyItMatters: [
        "Operator vila di Bali diharapkan menjaga hubungan baik dengan banjar lokal",
        "Kontribusi dan partisipasi banjar wajib secara sosial"
      ],
      typicalProcessSteps: null,
      whatToStore: ["Catatan perkenalan banjar", "Bukti kontribusi", "Catatan rapat"],
      commonPitfalls: ["Mengabaikan kewajiban banjar", "Tidak menghadiri upacara atau rapat yang diwajibkan"]
    }
  },
  "bpjs": {
    uk: {
      term: "BPJS (Соціальне страхування)",
      tags: ["Персонал", "Комплаєнс"],
      plainDefinition: "Обов'язкова програма соціального страхування Індонезії, що охоплює медичне страхування та трудові виплати для всіх працівників.",
      whyItMatters: [
        "Усі роботодавці повинні реєструвати персонал у BPJS Kesehatan та Ketenagakerjaan",
        "Недотримання може призвести до штрафів та санкцій"
      ],
      typicalProcessSteps: [
        "Зареєструватися як роботодавець у BPJS",
        "Зареєструвати кожного працівника в обох програмах",
        "Сплачувати щомісячні внески до 10-го та 15-го числа",
        "Повідомляти про зміни персоналу протягом 7 днів"
      ],
      whatToStore: ["Свідоцтва реєстрації BPJS", "Квитанції щомісячних платежів", "Членські картки працівників"],
      commonPitfalls: ["Затримка щомісячних платежів", "Нереєстрація нових працівників вчасно"]
    },
    id: {
      term: "BPJS (Jaminan Sosial)",
      tags: ["Staf", "Kepatuhan"],
      plainDefinition: "Program jaminan sosial wajib Indonesia yang mencakup asuransi kesehatan dan manfaat ketenagakerjaan untuk semua pekerja.",
      whyItMatters: [
        "Semua pemberi kerja wajib mendaftarkan staf di BPJS Kesehatan dan Ketenagakerjaan",
        "Ketidakpatuhan dapat mengakibatkan denda dan sanksi"
      ],
      typicalProcessSteps: [
        "Mendaftar sebagai pemberi kerja di BPJS",
        "Mendaftarkan setiap karyawan di kedua program",
        "Membayar iuran bulanan sebelum tanggal 10 dan 15",
        "Melaporkan perubahan staf dalam 7 hari"
      ],
      whatToStore: ["Sertifikat pendaftaran BPJS", "Bukti pembayaran bulanan", "Kartu anggota karyawan"],
      commonPitfalls: ["Keterlambatan pembayaran bulanan", "Tidak mendaftarkan karyawan baru tepat waktu"]
    }
  },
  "coretax": {
    uk: {
      term: "CoreTax",
      tags: ["Податки", "Цифрові"],
      plainDefinition: "Нова інтегрована система податкового адміністрування Індонезії, що замінює старі портали DJP Online.",
      whyItMatters: [
        "Усі податкові подання переходять на CoreTax",
        "CoreTax змінює управління податковими ідентифікаторами (NPWP) та поданнями"
      ],
      typicalProcessSteps: null,
      whatToStore: ["Облікові дані CoreTax", "Підтвердження подань", "Реєстраційні документи"],
      commonPitfalls: ["Використання застарілого DJP Online", "Неоновлення даних компанії"]
    },
    id: {
      term: "CoreTax",
      tags: ["Pajak", "Digital"],
      plainDefinition: "Sistem administrasi pajak terintegrasi baru Indonesia yang menggantikan portal DJP Online lama.",
      whyItMatters: [
        "Semua pelaporan pajak beralih ke CoreTax",
        "CoreTax mengubah cara pengelolaan NPWP dan pelaporan secara digital"
      ],
      typicalProcessSteps: null,
      whatToStore: ["Kredensial login CoreTax", "Konfirmasi pelaporan", "Dokumen registrasi"],
      commonPitfalls: ["Menggunakan DJP Online yang sudah usang", "Tidak memperbarui data perusahaan"]
    }
  },
  "hgb": {
    uk: {
      term: "HGB (Hak Guna Bangunan)",
      tags: ["Нерухомість", "Юридичні"],
      plainDefinition: "Обмежене в часі право на будівництво та використання землі в Індонезії, зазвичай на 20–30 років з можливістю продовження.",
      whyItMatters: [
        "Більшість операцій вілл з іноземним володінням тримають землю під HGB — воно закінчується і потребує продовження",
        "Прострочений HGB може поставити під загрозу весь бізнес"
      ],
      typicalProcessSteps: [
        "Перевірити сертифікат HGB на дату закінчення",
        "Розпочати процес оновлення за 1–2 роки до закінчення",
        "Подати заявку на оновлення в BPN",
        "Сплатити збори та податки",
        "Отримати оновлений сертифікат"
      ],
      whatToStore: ["Сертифікат HGB", "Квитанції заявки на оновлення", "Кореспонденція з BPN"],
      commonPitfalls: ["Затримка з початком оновлення", "Невідстеження дати закінчення"]
    },
    id: {
      term: "HGB (Hak Guna Bangunan)",
      tags: ["Properti", "Hukum"],
      plainDefinition: "Hak terbatas waktu untuk membangun dan menggunakan tanah di Indonesia, biasanya diberikan untuk 20-30 tahun dan dapat diperpanjang.",
      whyItMatters: [
        "Sebagian besar operasi vila asing memegang tanah di bawah HGB — masa berlakunya habis dan harus diperpanjang",
        "HGB yang kedaluwarsa dapat membahayakan seluruh operasi"
      ],
      typicalProcessSteps: [
        "Periksa sertifikat HGB untuk tanggal kedaluwarsa",
        "Mulai proses perpanjangan 1-2 tahun sebelum kedaluwarsa",
        "Ajukan perpanjangan ke BPN",
        "Bayar biaya dan pajak",
        "Terima sertifikat HGB yang diperbarui"
      ],
      whatToStore: ["Sertifikat HGB", "Bukti pengajuan perpanjangan", "Korespondensi BPN"],
      commonPitfalls: ["Menunggu terlalu lama untuk memulai perpanjangan", "Tidak melacak tanggal kedaluwarsa"]
    }
  },
  "kitas": {
    uk: {
      term: "KITAS (Дозвіл на тимчасове перебування)",
      tags: ["Персонал", "Імміграція"],
      plainDefinition: "Тимчасовий дозвіл на проживання для іноземців, які працюють або перебувають в Індонезії, зазвичай на 1–2 роки.",
      whyItMatters: [
        "Іноземний персонал повинен мати дійсний KITAS для легальної роботи",
        "Прострочений KITAS означає нелегальну роботу з ризиком депортації"
      ],
      typicalProcessSteps: [
        "Отримати IMTA через спонсорство роботодавця",
        "Подати заявку на KITAS через імміграцію",
        "Пройти біометрику та співбесіду",
        "Отримати картку KITAS",
        "Продовжити до закінчення терміну"
      ],
      whatToStore: ["Скан картки KITAS", "Лист схвалення IMTA", "Сторінки паспорта зі штампом"],
      commonPitfalls: ["Пропуск дедлайнів продовження", "Непочинання процесу вчасно"]
    },
    id: {
      term: "KITAS (Izin Tinggal Terbatas)",
      tags: ["Staf", "Imigrasi"],
      plainDefinition: "Izin tinggal sementara bagi warga negara asing yang bekerja atau tinggal di Indonesia, biasanya berlaku 1-2 tahun.",
      whyItMatters: [
        "Staf asing harus memiliki KITAS yang valid untuk bekerja secara legal",
        "KITAS yang kedaluwarsa berarti bekerja secara ilegal dengan risiko deportasi"
      ],
      typicalProcessSteps: [
        "Mendapatkan IMTA melalui sponsor pemberi kerja",
        "Mengajukan KITAS melalui imigrasi",
        "Menyelesaikan biometrik dan wawancara",
        "Menerima kartu KITAS",
        "Memperpanjang sebelum kedaluwarsa"
      ],
      whatToStore: ["Scan kartu KITAS", "Surat persetujuan IMTA", "Halaman paspor dengan stempel"],
      commonPitfalls: ["Melewatkan tenggat perpanjangan", "Tidak memulai proses cukup awal"]
    }
  },
  "pb1": {
    uk: {
      term: "PB1 (Податок на готелі/житло)",
      tags: ["Податки", "Операції"],
      plainDefinition: "Місцевий податок на послуги розміщення (включаючи вілли), що стягується з гостей та щомісяця перераховується до місцевого уряду.",
      whyItMatters: [
        "Оператори вілл повинні збирати PB1 з гостей та подавати/сплачувати щомісяця",
        "Недотримання може призвести до штрафів та операційних обмежень"
      ],
      typicalProcessSteps: [
        "Зареєструватися в місцевій податковій службі",
        "Збирати податок з гостей (зазвичай 10%)",
        "Подавати SPTPD щомісяця до 20-го",
        "Сплачувати зібраний податок"
      ],
      whatToStore: ["Квитанції подання SPTPD", "Підтвердження щомісячних платежів", "Свідоцтво податкової реєстрації"],
      commonPitfalls: ["Несплата гостями", "Затримка подання"]
    },
    id: {
      term: "PB1 (Pajak Hotel/Akomodasi)",
      tags: ["Pajak", "Operasi"],
      plainDefinition: "Pajak daerah atas jasa akomodasi (termasuk vila) yang dikenakan kepada tamu dan disetor setiap bulan ke pemerintah daerah.",
      whyItMatters: [
        "Operator vila wajib memungut PB1 dari tamu dan melaporkan/membayar setiap bulan",
        "Ketidakpatuhan dapat mengakibatkan denda dan pembatasan operasional"
      ],
      typicalProcessSteps: [
        "Mendaftar di kantor pajak daerah (BPPD/Bapenda)",
        "Memungut pajak dari tamu (biasanya 10%)",
        "Melaporkan SPTPD bulanan sebelum tanggal 20",
        "Membayar pajak yang terkumpul"
      ],
      whatToStore: ["Bukti pelaporan SPTPD", "Bukti pembayaran bulanan", "Sertifikat registrasi pajak"],
      commonPitfalls: ["Tidak memungut dari tamu", "Keterlambatan pelaporan"]
    }
  },
  "pkwt": {
    uk: {
      term: "PKWT (Строковий трудовий договір)",
      tags: ["Персонал", "Юридичні"],
      plainDefinition: "Строковий трудовий договір в Індонезії для тимчасової або проектної роботи з визначеними датами початку та закінчення.",
      whyItMatters: [
        "Більшість персоналу вілл наймається за контрактами PKWT",
        "Контракти PKWT мають законні обмеження на тривалість"
      ],
      typicalProcessSteps: [
        "Скласти PKWT індонезійською мовою (обов'язково за законом)",
        "Включити обов'язкові умови",
        "Зареєструвати в місцевому управлінні праці протягом 7 днів",
        "Відстежувати дати продовження"
      ],
      whatToStore: ["Підписані контракти PKWT", "Квитанції реєстрації", "Записи про продовження"],
      commonPitfalls: ["Контракт не індонезійською мовою", "Перевищення максимальної тривалості"]
    },
    id: {
      term: "PKWT (Perjanjian Kerja Waktu Tertentu)",
      tags: ["Staf", "Hukum"],
      plainDefinition: "Kontrak kerja waktu tertentu di Indonesia untuk pekerjaan sementara atau berbasis proyek dengan tanggal mulai dan berakhir yang ditentukan.",
      whyItMatters: [
        "Sebagian besar staf vila dipekerjakan dengan kontrak PKWT",
        "Kontrak PKWT memiliki batas hukum pada durasi dan perpanjangan"
      ],
      typicalProcessSteps: [
        "Menyusun PKWT dalam Bahasa Indonesia (wajib hukum)",
        "Menyertakan ketentuan wajib",
        "Mendaftarkan ke dinas tenaga kerja dalam 7 hari",
        "Melacak tanggal perpanjangan"
      ],
      whatToStore: ["Kontrak PKWT yang ditandatangani", "Bukti pendaftaran", "Catatan perpanjangan"],
      commonPitfalls: ["Kontrak tidak dalam Bahasa Indonesia", "Melebihi durasi kontrak maksimum"]
    }
  },
  "thr": {
    uk: {
      term: "THR (Святкова виплата)",
      tags: ["Персонал", "Компенсація"],
      plainDefinition: "Обов'язкова щорічна премія, яку роботодавці повинні виплачувати працівникам перед великими релігійними святами.",
      whyItMatters: [
        "THR є юридично обов'язковим — невиплата може призвести до штрафів",
        "Має бути виплачена щонайменше за 7 днів до свята працівника"
      ],
      typicalProcessSteps: [
        "Розрахувати THR (місячна зарплата для працівників 12+ місяців)",
        "Пропорційно розрахувати для працівників менше 12 місяців",
        "Виплатити за 7 днів до свята",
        "Включити в платіжні відомості"
      ],
      whatToStore: ["Записи розрахунку THR", "Квитанції виплат", "Підтвердження працівників"],
      commonPitfalls: ["Затримка виплати", "Непропорційний розрахунок для нових працівників"]
    },
    id: {
      term: "THR (Tunjangan Hari Raya)",
      tags: ["Staf", "Kompensasi"],
      plainDefinition: "Bonus tahunan wajib yang harus dibayarkan pemberi kerja kepada karyawan sebelum hari raya keagamaan besar.",
      whyItMatters: [
        "THR diwajibkan secara hukum — kegagalan membayar dapat mengakibatkan denda",
        "Harus dibayarkan setidaknya 7 hari sebelum hari raya karyawan"
      ],
      typicalProcessSteps: [
        "Menghitung THR (satu bulan gaji untuk karyawan 12+ bulan)",
        "Prorata untuk karyawan kurang dari 12 bulan",
        "Membayar 7 hari sebelum hari raya",
        "Mencatat dalam penggajian"
      ],
      whatToStore: ["Catatan perhitungan THR", "Bukti pembayaran", "Tanda terima karyawan"],
      commonPitfalls: ["Keterlambatan pembayaran", "Tidak menghitung prorata untuk karyawan baru"]
    }
  }
};

export const guideTranslationsMap: Record<string, { uk: GuideTranslation; id: GuideTranslation }> = {
  "slf-renewal-workflow": {
    uk: {
      title: "Процес поновлення SLF",
      summary: "Покроковий процес поновлення вашого SLF (Сертифіката функції будівлі) до закінчення його терміну дії. Цей гібридний процес включає як цифрові подання, так і фізичні інспекції.",
      authorityHandledBy: "Місцевий DPMPTSP / Управління громадських робіт",
      sequenceSteps: [
        {
          stepNumber: 1,
          actionDescription: "Перевірте дату закінчення SLF та заплануйте інспекцію щонайменше за 3 місяці до закінчення терміну",
          whereItGoes: "Внутрішній / DPMPTSP",
          digitalOrPhysical: "digital",
          whoHandlesIt: "Оператор вілли або консультант з комплаєнсу",
          notes: "Починайте завчасно — планування інспекцій може зайняти тижні.",
          expandDetails: {
            whyThisMatters: "Якщо SLF закінчиться до завершення поновлення, об'єкт технічно працює без дійсного сертифіката. Ранній початок запобігає прогалинам.",
            commonIssues: [
              "Забули дату закінчення, поки не стало надто пізно",
              "Перевантаження DPMPTSP у завантажені періоди"
            ],
            preparationTips: [
              "Встановіть нагадування в календарі за 6 місяців та за 3 місяці до закінчення терміну",
              "Уточніть, який офіс DPMPTSP обслуговує ваш регіон"
            ],
            storageReminders: [
              "Збережіть копію поточного SLF з виділеною датою закінчення",
              "Завантажте підтвердження запису на інспекцію до DSCVR"
            ]
          }
        },
        {
          stepNumber: 2,
          actionDescription: "Підготуйте пакет будівельної документації, включаючи оригінальний PBG, попередній SLF та виконавчі креслення",
          whereItGoes: "Внутрішня підготовка",
          digitalOrPhysical: "physical",
          whoHandlesIt: "Оператор вілли",
          notes: "Переконайтеся, що всі документи актуальні та відповідають фактичному стану будівлі.",
          expandDetails: {
            whyThisMatters: "Неповна документація є найпоширенішою причиною затримок інспекції. Наявність усього готового значно прискорює процес.",
            commonIssues: [
              "Не вдається знайти оригінальні документи PBG",
              "Виконавчі креслення не відповідають поточному плануванню будівлі"
            ],
            preparationTips: [
              "Зберіть PBG, попередній SLF, конструктивні креслення та схеми MEP",
              "Перевірте відповідність креслень будь-яким ремонтам, виконаним після останнього SLF"
            ],
            storageReminders: [
              "Завантажте повний пакет документів до DSCVR перед інспекцією",
              "Створіть контрольний список усіх необхідних документів"
            ]
          }
        },
        {
          stepNumber: 3,
          actionDescription: "Прийміть будівельного інспектора на об'єкті для фізичної інспекції",
          whereItGoes: "На об'єкті",
          digitalOrPhysical: "physical",
          whoHandlesIt: "Інспектор (DPMPTSP) + оператор вілли",
          notes: "Інспектор перевірить конструктивну цілісність, пожежну безпеку та системи MEP.",
          expandDetails: {
            whyThisMatters: "Фізична інспекція є основною вимогою. Інспектори перевіряють відповідність будівлі документації та чинним стандартам безпеки.",
            commonIssues: [
              "Інспектор виявляє незадокументовані зміни",
              "Обладнання пожежної безпеки не обслуговане або прострочене",
              "Проблеми з доступом, що перешкоджають повній інспекції"
            ],
            preparationTips: [
              "Обслужіть усі вогнегасники та обладнання безпеки заздалегідь",
              "Переконайтеся, що всі приміщення доступні для інспекції",
              "Забезпечте присутність співробітника для допомоги інспектору"
            ],
            storageReminders: [
              "Сфотографуйте процес інспекції",
              "Отримайте копію попередніх нотаток інспектора, якщо можливо"
            ]
          }
        },
        {
          stepNumber: 4,
          actionDescription: "Отримайте звіт інспекції та усуньте будь-які зауваження або вимоги щодо виправлення",
          whereItGoes: "DPMPTSP видає звіт",
          digitalOrPhysical: "hybrid",
          whoHandlesIt: "Оператор вілли + консультант",
          notes: "Деякі зауваження можуть вимагати виправлень перед видачею SLF.",
          expandDetails: {
            whyThisMatters: "Звіт інспекції визначає, чи можна поновити SLF напряму, чи спочатку потрібні виправлення. Швидка реакція на зауваження запобігає тривалим затримкам.",
            commonIssues: [
              "Затримка надання звіту від DPMPTSP",
              "Нечіткі вимоги щодо виправлення"
            ],
            preparationTips: [
              "Зверніться до DPMPTSP, якщо звіт не отримано протягом 2 тижнів",
              "Залучіть консультанта для інтерпретації технічних висновків"
            ],
            storageReminders: [
              "Завантажте повний звіт інспекції до DSCVR",
              "Задокументуйте будь-які виконані виправлення з фотографіями"
            ]
          }
        },
        {
          stepNumber: 5,
          actionDescription: "Поставте мокрий підпис та печатку компанії на формі заявки на SLF",
          whereItGoes: "Внутрішній — підписує директор",
          digitalOrPhysical: "physical",
          whoHandlesIt: "Директор компанії / уповноважена особа",
          notes: "Має бути підписано особою, зареєстрованою як директор у статуті компанії.",
          expandDetails: {
            whyThisMatters: "Державні установи вимагають оригінальні мокрі підписи. Цифрові або ксерокопійовані підписи будуть відхилені.",
            commonIssues: [
              "Директор не може особисто підписати",
              "Використання неправильної уповноваженої особи"
            ],
            preparationTips: [
              "Підтвердіть, хто є зареєстрованим директором перед підписанням",
              "Підготуйте печатку компанії"
            ],
            storageReminders: [
              "Чітко відскануйте підписану заявку",
              "Завантажте підписану форму та версію з печаткою до DSCVR"
            ]
          }
        },
        {
          stepNumber: 6,
          actionDescription: "Подайте заявку на поновлення з усіма супровідними документами до DPMPTSP",
          whereItGoes: "Офіс DPMPTSP",
          digitalOrPhysical: "hybrid",
          whoHandlesIt: "Консультант або оператор вілли",
          notes: "Деякі регіони приймають цифрове подання через OSS; інші вимагають фізичну доставку.",
          expandDetails: {
            whyThisMatters: "Це офіційне подання. Відсутні документи затримають обробку і можуть вимагати повторного подання.",
            commonIssues: [
              "Неповний пакет документів",
              "Неправильний офіс або канал подання"
            ],
            preparationTips: [
              "Двічі перевірте контрольний список документів перед поданням",
              "Уточніть, чи ваш регіон використовує OSS або фізичне подання"
            ],
            storageReminders: [
              "Завантажте квитанцію або підтвердження подання до DSCVR",
              "Зафіксуйте дату подання та очікуваний час обробки"
            ]
          }
        },
        {
          stepNumber: 7,
          actionDescription: "Отримайте поновлений сертифікат SLF та надійно зберігайте оригінали",
          whereItGoes: "DPMPTSP видає сертифікат",
          digitalOrPhysical: "digital",
          whoHandlesIt: "Оператор вілли",
          notes: "Встановіть нагадування для наступного циклу поновлення (зазвичай 5 років).",
          expandDetails: {
            whyThisMatters: "Поновлений SLF є вашим доказом відповідності будівлі вимогам. Зберігайте його ретельно та встановіть нагадування для наступного поновлення.",
            commonIssues: [
              "Невідстеження затримок у видачі",
              "Забули оновити DSCVR новим сертифікатом"
            ],
            preparationTips: [
              "Зверніться, якщо сертифікат не видано у зазначений термін",
              "Перевірте правильність усіх даних у новому SLF"
            ],
            storageReminders: [
              "Завантажте новий сертифікат SLF у форматі PDF до DSCVR",
              "Оновіть трекер дат поновлення",
              "Зберігайте фізичний оригінал у безпечному місці"
            ]
          }
        }
      ],
      whatToExpect: [
        "Процес зазвичай займає 4-8 тижнів від інспекції до видачі сертифіката",
        "Планування інспекції може зайняти 2-4 тижні залежно від доступності DPMPTSP",
        "Незначні зауваження щодо виправлення є поширеними та зазвичай швидко усуваються",
        "Деякі регіони обробляють поновлення швидше, ніж первинні заявки"
      ],
      typicalDelays: [
        "Доступність інспектора — очікування може становити 2-4 тижні",
        "Неповна документація, що вимагає повторного подання",
        "Необхідність виправних робіт після результатів інспекції",
        "Адміністративна черга обробки DPMPTSP"
      ],
      commonRejectionReasons: [
        "Модифікації будівлі не відображені в поданих кресленнях",
        "Обладнання пожежної безпеки прострочене або відсутнє",
        "Конструктивні проблеми, виявлені під час інспекції",
        "Неповні або неправильно підписані форми заявок"
      ],
      dscvrRecommendedStorage: [
        "Поточні та поновлені сертифікати SLF (PDF)",
        "Звіти інспекцій та зауваження",
        "Докази виправлень (фото та документи)",
        "Квитанції подань та листування",
        "Нагадування про дати поновлення"
      ]
    },
    id: {
      title: "Alur Perpanjangan SLF",
      summary: "Proses langkah demi langkah untuk memperpanjang SLF (Sertifikat Laik Fungsi) Anda sebelum masa berlakunya habis. Alur kerja hibrida ini melibatkan pengajuan digital dan inspeksi fisik.",
      authorityHandledBy: "DPMPTSP setempat / Dinas Pekerjaan Umum",
      sequenceSteps: [
        {
          stepNumber: 1,
          actionDescription: "Periksa tanggal kedaluwarsa SLF dan jadwalkan inspeksi setidaknya 3 bulan sebelum habis masa berlaku",
          whereItGoes: "Internal / DPMPTSP",
          digitalOrPhysical: "digital",
          whoHandlesIt: "Pengelola villa atau konsultan kepatuhan",
          notes: "Mulai lebih awal — penjadwalan inspeksi bisa memakan waktu berminggu-minggu.",
          expandDetails: {
            whyThisMatters: "Jika SLF kedaluwarsa sebelum perpanjangan selesai, properti secara teknis beroperasi tanpa sertifikat yang sah. Memulai lebih awal menghindari kesenjangan.",
            commonIssues: [
              "Lupa tanggal kedaluwarsa hingga terlambat",
              "Antrean panjang di DPMPTSP pada periode sibuk"
            ],
            preparationTips: [
              "Atur pengingat kalender 6 bulan dan 3 bulan sebelum kedaluwarsa",
              "Konfirmasi kantor DPMPTSP mana yang menangani kabupaten/kota Anda"
            ],
            storageReminders: [
              "Simpan salinan SLF saat ini dengan tanggal kedaluwarsa yang disorot",
              "Unggah konfirmasi jadwal inspeksi ke DSCVR"
            ]
          }
        },
        {
          stepNumber: 2,
          actionDescription: "Siapkan paket dokumentasi bangunan termasuk PBG asli, SLF sebelumnya, dan gambar as-built",
          whereItGoes: "Persiapan internal",
          digitalOrPhysical: "physical",
          whoHandlesIt: "Pengelola villa",
          notes: "Pastikan semua dokumen terkini dan sesuai dengan kondisi bangunan yang sebenarnya.",
          expandDetails: {
            whyThisMatters: "Dokumentasi yang tidak lengkap adalah alasan paling umum keterlambatan inspeksi. Menyiapkan semuanya akan mempercepat proses secara signifikan.",
            commonIssues: [
              "Tidak dapat menemukan dokumen PBG asli",
              "Gambar as-built tidak sesuai dengan tata letak bangunan saat ini"
            ],
            preparationTips: [
              "Kumpulkan PBG, SLF sebelumnya, gambar struktural, dan diagram MEP",
              "Verifikasi gambar sesuai dengan renovasi yang dilakukan sejak SLF terakhir"
            ],
            storageReminders: [
              "Unggah paket dokumen lengkap ke DSCVR sebelum inspeksi",
              "Buat daftar periksa semua dokumen yang diperlukan"
            ]
          }
        },
        {
          stepNumber: 3,
          actionDescription: "Terima inspektur bangunan di lokasi untuk inspeksi fisik",
          whereItGoes: "Di lokasi properti",
          digitalOrPhysical: "physical",
          whoHandlesIt: "Inspektur (DPMPTSP) + pengelola villa",
          notes: "Inspektur akan memeriksa integritas struktur, keselamatan kebakaran, dan sistem MEP.",
          expandDetails: {
            whyThisMatters: "Inspeksi fisik adalah persyaratan utama. Inspektur memverifikasi bahwa bangunan sesuai dengan dokumentasi dan memenuhi standar keselamatan yang berlaku.",
            commonIssues: [
              "Inspektur menemukan modifikasi yang tidak terdokumentasi",
              "Peralatan keselamatan kebakaran tidak diservis atau sudah kedaluwarsa",
              "Masalah akses yang menghalangi inspeksi menyeluruh"
            ],
            preparationTips: [
              "Servis semua alat pemadam kebakaran dan peralatan keselamatan sebelumnya",
              "Pastikan semua area dapat diakses untuk inspeksi",
              "Siapkan staf untuk membantu inspektur"
            ],
            storageReminders: [
              "Dokumentasikan proses inspeksi dengan foto",
              "Dapatkan salinan catatan awal inspektur jika memungkinkan"
            ]
          }
        },
        {
          stepNumber: 4,
          actionDescription: "Terima laporan inspeksi dan tangani temuan atau persyaratan perbaikan",
          whereItGoes: "DPMPTSP menerbitkan laporan",
          digitalOrPhysical: "hybrid",
          whoHandlesIt: "Pengelola villa + konsultan",
          notes: "Beberapa temuan mungkin memerlukan perbaikan sebelum SLF dapat diterbitkan.",
          expandDetails: {
            whyThisMatters: "Laporan inspeksi menentukan apakah SLF dapat langsung diperpanjang atau perlu perbaikan terlebih dahulu. Respons cepat terhadap temuan menghindari keterlambatan berkepanjangan.",
            commonIssues: [
              "Keterlambatan pengiriman laporan dari DPMPTSP",
              "Persyaratan perbaikan yang tidak jelas"
            ],
            preparationTips: [
              "Tindak lanjuti ke DPMPTSP jika laporan belum diterima dalam 2 minggu",
              "Libatkan konsultan Anda untuk menafsirkan temuan teknis"
            ],
            storageReminders: [
              "Unggah laporan inspeksi lengkap ke DSCVR",
              "Dokumentasikan pekerjaan perbaikan yang telah diselesaikan dengan foto"
            ]
          }
        },
        {
          stepNumber: 5,
          actionDescription: "Bubuhkan tanda tangan basah dan stempel perusahaan pada formulir permohonan SLF",
          whereItGoes: "Internal — ditandatangani oleh direktur",
          digitalOrPhysical: "physical",
          whoHandlesIt: "Direktur perusahaan / penandatangan resmi",
          notes: "Harus ditandatangani oleh orang yang terdaftar sebagai direktur dalam akta perusahaan.",
          expandDetails: {
            whyThisMatters: "Kantor pemerintah mensyaratkan tanda tangan basah asli. Tanda tangan digital atau fotokopi akan ditolak.",
            commonIssues: [
              "Direktur tidak tersedia untuk menandatangani secara langsung",
              "Menggunakan penandatangan yang salah"
            ],
            preparationTips: [
              "Konfirmasi siapa direktur terdaftar sebelum menandatangani",
              "Siapkan stempel perusahaan"
            ],
            storageReminders: [
              "Pindai formulir permohonan yang sudah ditandatangani dengan jelas",
              "Unggah formulir yang sudah ditandatangani dan distempel ke DSCVR"
            ]
          }
        },
        {
          stepNumber: 6,
          actionDescription: "Ajukan permohonan perpanjangan beserta seluruh dokumen pendukung ke DPMPTSP",
          whereItGoes: "Kantor DPMPTSP",
          digitalOrPhysical: "hybrid",
          whoHandlesIt: "Konsultan atau pengelola villa",
          notes: "Beberapa kabupaten/kota menerima pengajuan digital melalui OSS; lainnya mengharuskan penyerahan fisik.",
          expandDetails: {
            whyThisMatters: "Ini adalah pengajuan resmi. Dokumen yang kurang akan menunda pemrosesan dan mungkin memerlukan pengajuan ulang.",
            commonIssues: [
              "Paket dokumen tidak lengkap",
              "Kantor atau jalur pengajuan yang salah"
            ],
            preparationTips: [
              "Periksa ulang daftar periksa dokumen sebelum pengajuan",
              "Konfirmasi apakah kabupaten/kota Anda menggunakan OSS atau pengajuan fisik"
            ],
            storageReminders: [
              "Unggah tanda terima atau konfirmasi pengajuan ke DSCVR",
              "Catat tanggal pengajuan dan perkiraan waktu pemrosesan"
            ]
          }
        },
        {
          stepNumber: 7,
          actionDescription: "Terima sertifikat SLF yang telah diperpanjang dan simpan dokumen asli dengan aman",
          whereItGoes: "DPMPTSP menerbitkan sertifikat",
          digitalOrPhysical: "digital",
          whoHandlesIt: "Pengelola villa",
          notes: "Atur pengingat untuk siklus perpanjangan berikutnya (biasanya 5 tahun).",
          expandDetails: {
            whyThisMatters: "SLF yang diperpanjang adalah bukti kepatuhan bangunan Anda. Simpan dengan baik dan atur pengingat untuk perpanjangan berikutnya.",
            commonIssues: [
              "Tidak menindaklanjuti keterlambatan penerbitan",
              "Lupa memperbarui DSCVR dengan sertifikat baru"
            ],
            preparationTips: [
              "Tindak lanjuti jika sertifikat tidak diterbitkan dalam jangka waktu yang ditentukan",
              "Verifikasi semua detail pada SLF baru sudah benar"
            ],
            storageReminders: [
              "Unggah PDF sertifikat SLF baru ke DSCVR",
              "Perbarui pelacak tanggal perpanjangan",
              "Simpan dokumen asli fisik di lokasi yang aman"
            ]
          }
        }
      ],
      whatToExpect: [
        "Proses biasanya memakan waktu 4-8 minggu dari inspeksi hingga penerbitan sertifikat",
        "Penjadwalan inspeksi mungkin memakan waktu 2-4 minggu tergantung ketersediaan DPMPTSP",
        "Temuan perbaikan minor umum terjadi dan biasanya diselesaikan dengan cepat",
        "Beberapa kabupaten/kota memproses perpanjangan lebih cepat daripada permohonan awal"
      ],
      typicalDelays: [
        "Ketersediaan inspektur — waktu tunggu bisa 2-4 minggu",
        "Dokumentasi tidak lengkap yang memerlukan pengajuan ulang",
        "Pekerjaan perbaikan yang diperlukan setelah temuan inspeksi",
        "Antrean pemrosesan administratif DPMPTSP"
      ],
      commonRejectionReasons: [
        "Modifikasi bangunan tidak tercermin dalam gambar yang diajukan",
        "Peralatan keselamatan kebakaran kedaluwarsa atau tidak ada",
        "Masalah struktural yang teridentifikasi selama inspeksi",
        "Formulir permohonan tidak lengkap atau ditandatangani secara tidak benar"
      ],
      dscvrRecommendedStorage: [
        "Sertifikat SLF saat ini dan yang diperpanjang (PDF)",
        "Laporan dan temuan inspeksi",
        "Bukti perbaikan (foto dan dokumen)",
        "Tanda terima pengajuan dan korespondensi",
        "Pengingat tanggal perpanjangan"
      ]
    }
  }
};
