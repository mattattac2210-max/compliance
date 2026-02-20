import { db } from "./db";
import { vaultDocumentTemplates } from "@shared/schema";
import { sql } from "drizzle-orm";

const templates = [
  {
    gateNumber: 0, documentSlug: "akta-pendirian", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "Notarised Deed (Akta Pendirian)", description: "Original notarised deed of establishment for the PT PMA company." },
      uk: { name: "Нотаріальний акт (Akta Pendirian)", description: "Оригінал нотаріального акта заснування компанії PT PMA." },
      id: { name: "Akta Pendirian", description: "Akta pendirian asli yang dinotariskan untuk perusahaan PT PMA." },
    },
  },
  {
    gateNumber: 0, documentSlug: "sk-kemenkumham", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "Ministry Approval (SK Kemenkumham)", description: "Ministry of Law & Human Rights approval letter confirming legal entity registration." },
      uk: { name: "Затвердження міністерства (SK Kemenkumham)", description: "Лист затвердження Міністерства юстиції та прав людини." },
      id: { name: "SK Kemenkumham", description: "Surat persetujuan Kementerian Hukum dan HAM yang mengonfirmasi pendaftaran badan hukum." },
    },
  },
  {
    gateNumber: 0, documentSlug: "corporate-npwp", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "Corporate NPWP Certificate", description: "Tax identification number certificate for the PT PMA entity." },
      uk: { name: "Корпоративний сертифікат NPWP", description: "Сертифікат податкового ідентифікаційного номера для PT PMA." },
      id: { name: "Sertifikat NPWP Badan", description: "Sertifikat nomor pokok wajib pajak untuk entitas PT PMA." },
    },
  },
  {
    gateNumber: 0, documentSlug: "bank-confirmation", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "Bank Account Confirmation", description: "Official bank letter confirming the corporate account has been opened and minimum capital deposited." },
      uk: { name: "Підтвердження банківського рахунку", description: "Офіційний лист банку про відкриття корпоративного рахунку та внесення мінімального капіталу." },
      id: { name: "Konfirmasi Rekening Bank", description: "Surat resmi bank yang mengonfirmasi pembukaan rekening perusahaan dan setoran modal minimum." },
    },
  },
  {
    gateNumber: 1, documentSlug: "kkpr-certificate", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "KKPR Zoning Certificate", description: "Zoning compliance certificate confirming the property is in a permitted zone for commercial accommodation." },
      uk: { name: "Сертифікат зонування KKPR", description: "Сертифікат відповідності зонуванню, що підтверджує дозвіл на комерційне розміщення." },
      id: { name: "Sertifikat KKPR", description: "Sertifikat kesesuaian kegiatan pemanfaatan ruang yang mengonfirmasi properti berada di zona yang diizinkan." },
    },
  },
  {
    gateNumber: 1, documentSlug: "zone-map-extract", isRequired: false, expiryMonths: null,
    translations: {
      en: { name: "Zone Map Extract (GISTARU)", description: "Extract from the GISTARU spatial planning map showing the property's zone classification." },
      uk: { name: "Витяг карти зонування (GISTARU)", description: "Витяг з карти просторового планування GISTARU із класифікацією зони." },
      id: { name: "Ekstrak Peta Zonasi (GISTARU)", description: "Ekstrak dari peta tata ruang GISTARU yang menunjukkan klasifikasi zona properti." },
    },
  },
  {
    gateNumber: 2, documentSlug: "nib-certificate", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "NIB Certificate (OSS)", description: "Business identification number certificate issued via the OSS system." },
      uk: { name: "Сертифікат NIB (OSS)", description: "Сертифікат ідентифікаційного номера бізнесу, виданий через систему OSS." },
      id: { name: "Sertifikat NIB (OSS)", description: "Sertifikat nomor induk berusaha yang diterbitkan melalui sistem OSS." },
    },
  },
  {
    gateNumber: 2, documentSlug: "nib-verified-screenshot", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "NIB Verified Status Screenshot", description: "Screenshot from OSS showing NIB status as 'Verified' with KBLI codes visible." },
      uk: { name: "Скриншот верифікованого статусу NIB", description: "Скриншот із OSS, що показує статус NIB як 'Верифіковано' з кодами KBLI." },
      id: { name: "Screenshot Status NIB Terverifikasi", description: "Screenshot dari OSS yang menunjukkan status NIB sebagai 'Terverifikasi' dengan kode KBLI terlihat." },
    },
  },
  {
    gateNumber: 3, documentSlug: "pbg-certificate", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "PBG Building Approval", description: "Building approval permit (Persetujuan Bangunan Gedung) from the local government." },
      uk: { name: "Дозвіл на будівництво PBG", description: "Дозвіл на будівництво від місцевого уряду." },
      id: { name: "Persetujuan Bangunan Gedung (PBG)", description: "Izin persetujuan bangunan gedung dari pemerintah daerah." },
    },
  },
  {
    gateNumber: 3, documentSlug: "slf-certificate", isRequired: true, expiryMonths: 60,
    translations: {
      en: { name: "SLF Occupancy Certificate", description: "Confirms building is fit for commercial occupation. Renews every 5 years." },
      uk: { name: "Сертифікат SLF", description: "Підтверджує придатність будівлі для комерційного використання. Поновлюється кожні 5 років." },
      id: { name: "Sertifikat SLF", description: "Mengonfirmasi bangunan layak untuk hunian komersial. Diperbarui setiap 5 tahun." },
    },
  },
  {
    gateNumber: 3, documentSlug: "slf-inspection-report", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "SLF Inspection Report", description: "Technical inspection report that supports the SLF application or renewal." },
      uk: { name: "Звіт інспекції SLF", description: "Технічний звіт інспекції для подання або поновлення SLF." },
      id: { name: "Laporan Inspeksi SLF", description: "Laporan inspeksi teknis yang mendukung pengajuan atau pembaruan SLF." },
    },
  },
  {
    gateNumber: 3, documentSlug: "as-built-drawings", isRequired: false, expiryMonths: null,
    translations: {
      en: { name: "As-Built Technical Drawings", description: "Final construction drawings reflecting the actual built state of the property." },
      uk: { name: "Технічні креслення виконання", description: "Остаточні будівельні креслення, що відображають фактичний стан споруди." },
      id: { name: "Gambar As-Built", description: "Gambar konstruksi akhir yang mencerminkan kondisi aktual properti yang dibangun." },
    },
  },
  {
    gateNumber: 4, documentSlug: "npwpd-registration", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "NPWPD Registration (e-Palapa)", description: "Local tax registration for hotel/accommodation tax via the e-Palapa system." },
      uk: { name: "Реєстрація NPWPD (e-Palapa)", description: "Реєстрація місцевого податку на готельні послуги через систему e-Palapa." },
      id: { name: "Pendaftaran NPWPD (e-Palapa)", description: "Pendaftaran pajak daerah untuk pajak hotel/akomodasi melalui sistem e-Palapa." },
    },
  },
  {
    gateNumber: 4, documentSlug: "sptpd-latest", isRequired: true, expiryMonths: 1,
    translations: {
      en: { name: "Latest SPTPD Filing Confirmation", description: "Confirmation of the most recent monthly SPTPD hotel tax filing." },
      uk: { name: "Підтвердження останньої подачі SPTPD", description: "Підтвердження подачі щомісячного податку на готель SPTPD." },
      id: { name: "Konfirmasi Pelaporan SPTPD Terbaru", description: "Konfirmasi pelaporan pajak hotel SPTPD bulanan terbaru." },
    },
  },
  {
    gateNumber: 4, documentSlug: "pph-spt-tahunan", isRequired: true, expiryMonths: 12,
    translations: {
      en: { name: "Annual PPh SPT Tahunan", description: "Annual corporate income tax return filing confirmation." },
      uk: { name: "Річна податкова декларація PPh SPT Tahunan", description: "Підтвердження подачі річної корпоративної податкової декларації." },
      id: { name: "SPT Tahunan PPh Badan", description: "Konfirmasi pelaporan SPT pajak penghasilan badan tahunan." },
    },
  },
  {
    gateNumber: 5, documentSlug: "bpjs-kesehatan-reg", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "BPJS Kesehatan Registration", description: "Proof of employer registration with BPJS Health insurance." },
      uk: { name: "Реєстрація BPJS Kesehatan", description: "Підтвердження реєстрації роботодавця у BPJS медичне страхування." },
      id: { name: "Pendaftaran BPJS Kesehatan", description: "Bukti pendaftaran pemberi kerja di BPJS Kesehatan." },
    },
  },
  {
    gateNumber: 5, documentSlug: "bpjs-ketenagakerjaan-reg", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "BPJamsostek Registration", description: "Proof of employer registration with BPJS Employment (BPJamsostek)." },
      uk: { name: "Реєстрація BPJamsostek", description: "Підтвердження реєстрації роботодавця у BPJS Ketenagakerjaan." },
      id: { name: "Pendaftaran BPJamsostek", description: "Bukti pendaftaran pemberi kerja di BPJS Ketenagakerjaan." },
    },
  },
  {
    gateNumber: 5, documentSlug: "employment-contracts", isRequired: false, expiryMonths: null,
    translations: {
      en: { name: "Staff Employment Contracts", description: "Signed employment contracts for all staff members." },
      uk: { name: "Трудові договори персоналу", description: "Підписані трудові договори для всіх працівників." },
      id: { name: "Kontrak Kerja Karyawan", description: "Kontrak kerja yang ditandatangani untuk semua karyawan." },
    },
  },
  {
    gateNumber: 5, documentSlug: "kitas-investor", isRequired: false, expiryMonths: 12,
    translations: {
      en: { name: "KITAS Investor (if applicable)", description: "Investor stay permit for foreign shareholders, renewed annually." },
      uk: { name: "KITAS Інвестора (за потреби)", description: "Дозвіл на перебування інвестора для іноземних акціонерів, поновлюється щорічно." },
      id: { name: "KITAS Investor (jika berlaku)", description: "Izin tinggal investor untuk pemegang saham asing, diperbarui setiap tahun." },
    },
  },
  {
    gateNumber: 6, documentSlug: "fire-safety-certificate", isRequired: true, expiryMonths: 12,
    translations: {
      en: { name: "Fire Safety Certificate", description: "Annual fire safety inspection certificate from the local fire department." },
      uk: { name: "Сертифікат пожежної безпеки", description: "Щорічний сертифікат пожежної інспекції від місцевої пожежної служби." },
      id: { name: "Sertifikat Keselamatan Kebakaran", description: "Sertifikat inspeksi keselamatan kebakaran tahunan dari dinas pemadam kebakaran setempat." },
    },
  },
  {
    gateNumber: 6, documentSlug: "sop-evidence", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "SOP Execution Evidence Log", description: "Documented evidence that safety SOPs are being followed and maintained." },
      uk: { name: "Журнал виконання SOP", description: "Задокументовані докази дотримання та підтримки SOP з безпеки." },
      id: { name: "Log Bukti Pelaksanaan SOP", description: "Bukti terdokumentasi bahwa SOP keselamatan dijalankan dan dipelihara." },
    },
  },
  {
    gateNumber: 7, documentSlug: "ota-verification-airbnb", isRequired: false, expiryMonths: null,
    translations: {
      en: { name: "Airbnb Verification Confirmation", description: "Confirmation that the property is verified and compliant on Airbnb." },
      uk: { name: "Підтвердження верифікації Airbnb", description: "Підтвердження верифікації та відповідності нерухомості на Airbnb." },
      id: { name: "Konfirmasi Verifikasi Airbnb", description: "Konfirmasi bahwa properti telah diverifikasi dan sesuai di Airbnb." },
    },
  },
  {
    gateNumber: 7, documentSlug: "ota-verification-booking", isRequired: false, expiryMonths: null,
    translations: {
      en: { name: "Booking.com Verification Confirmation", description: "Confirmation that the property is verified and compliant on Booking.com." },
      uk: { name: "Підтвердження верифікації Booking.com", description: "Підтвердження верифікації та відповідності нерухомості на Booking.com." },
      id: { name: "Konfirmasi Verifikasi Booking.com", description: "Konfirmasi bahwa properti telah diverifikasi dan sesuai di Booking.com." },
    },
  },
  {
    gateNumber: 7, documentSlug: "tdup-certificate", isRequired: true, expiryMonths: null,
    translations: {
      en: { name: "TDUP Tourism Business Licence", description: "Tourism business licence required for commercial accommodation operations." },
      uk: { name: "Ліцензія TDUP на туристичний бізнес", description: "Ліцензія на туристичний бізнес для комерційного розміщення." },
      id: { name: "TDUP Tanda Daftar Usaha Pariwisata", description: "Izin usaha pariwisata yang diperlukan untuk operasi akomodasi komersial." },
    },
  },
];

export async function seedVaultTemplates() {
  for (const t of templates) {
    await db.insert(vaultDocumentTemplates)
      .values(t)
      .onConflictDoUpdate({
        target: vaultDocumentTemplates.documentSlug,
        set: {
          gateNumber: t.gateNumber,
          isRequired: t.isRequired,
          expiryMonths: t.expiryMonths,
          translations: t.translations,
          isActive: true,
        },
      });
  }
  console.log("Vault document templates seeded/updated.");
}
