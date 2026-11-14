import {
  Bell,
  Bug,
  Database,
  GraduationCap,
  Handshake,
  Layers,
  LifeBuoy,
  Palette,
} from 'lucide-react';

/** All the copy on the landing page. Change wording, projects and answers here. */

export const NAV_SECTIONS = [
  { id: 'layanan', label: 'Layanan' },
  { id: 'portofolio', label: 'Portofolio' },
  { id: 'komunitas', label: 'Komunitas' },
  { id: 'faq', label: 'FAQ' },
];

export const SERVICES = [
  {
    id: 'fullstack',
    icon: Layers,
    title: 'Full-Stack Web Development',
    body: 'Website dan aplikasi web dari nol, lengkap dengan frontend, backend, dan login pengguna.',
    points: ['Frontend React', 'API dan backend', 'Siap di-deploy'],
    span: 'lg:col-span-7',
  },
  {
    id: 'uiux',
    icon: Palette,
    title: 'Custom UI/UX Implementation',
    body: 'Desain Figma atau referensi kamu diubah jadi antarmuka yang responsif dan halus.',
    points: ['Pixel-accurate', 'Mobile sampai desktop'],
    span: 'lg:col-span-5',
  },
  {
    id: 'database',
    icon: Database,
    title: 'Database Integration',
    body: 'Skema, query, dan aturan akses data yang rapi di Supabase, PostgreSQL, atau MySQL.',
    points: ['Desain skema', 'Keamanan data'],
    span: 'lg:col-span-5',
  },
  {
    id: 'bugfix',
    icon: Bug,
    title: 'Bug Fixing & Optimization',
    body: 'Error dilacak sampai akarnya, lalu kode dan halaman yang lambat dibereskan supaya kembali lancar.',
    points: ['Debugging', 'Refactor kode', 'Performa'],
    span: 'lg:col-span-7',
  },
];

export const ALL_PROJECTS = 'Semua';
export const PORTFOLIO_FILTERS = [ALL_PROJECTS, 'Dashboard', 'E-commerce', 'Landing Page', 'Sistem Informasi'];

/**
 * `sample: true` marks a design concept rather than client work, and the page says
 * so. Replace those entries with real projects as you collect them.
 */
export const PROJECTS = [
  {
    id: 'order-dashboard',
    title: 'Dashboard Order Realtime',
    category: 'Dashboard',
    mock: 'dashboard',
    summary: 'Dashboard untuk melacak order, nilai, dan status pengerjaan secara realtime.',
    details: ['Grafik nilai order per periode', 'Status order yang ter-update langsung', 'Tampilan khusus untuk ponsel'],
    stack: ['React', 'Tailwind', 'Supabase'],
  },
  {
    id: 'service-catalog',
    title: 'Katalog dan Order Layanan',
    category: 'E-commerce',
    mock: 'catalog',
    summary: 'Katalog layanan dengan pencarian realtime, filter kategori, dan alur pemesanan.',
    details: ['Pencarian saat mengetik', 'Filter kategori', 'Order tersimpan ke database'],
    stack: ['React', 'Tailwind', 'Supabase'],
  },
  {
    id: 'this-landing',
    title: 'Landing Page JokiWebApp',
    category: 'Landing Page',
    mock: 'landing',
    summary: 'Halaman yang sedang kamu lihat: dark mode, glassmorphism, dan animasi ringan.',
    details: ['Responsif dari ponsel sampai layar lebar', 'Bisa dipakai dengan keyboard', 'Menghormati setelan kurangi animasi'],
    stack: ['React', 'Tailwind', 'Vite'],
  },
  {
    id: 'sample-store',
    title: 'Toko Online Produk Lokal',
    category: 'E-commerce',
    mock: 'shop',
    sample: true,
    summary: 'Konsep toko online dengan katalog produk, keranjang, dan halaman checkout.',
    details: ['Katalog dan filter produk', 'Keranjang belanja', 'Panel kelola produk'],
    stack: ['React', 'Tailwind', 'Supabase'],
  },
  {
    id: 'sample-school',
    title: 'Sistem Informasi Sekolah',
    category: 'Sistem Informasi',
    mock: 'table',
    sample: true,
    summary: 'Konsep sistem data siswa, nilai, dan jadwal untuk admin dan guru.',
    details: ['Data siswa dan kelas', 'Input nilai', 'Laporan yang bisa dicetak'],
    stack: ['PHP', 'MySQL', 'Tailwind'],
  },
  {
    id: 'sample-saas',
    title: 'Landing Page Produk SaaS',
    category: 'Landing Page',
    mock: 'landing',
    sample: true,
    summary: 'Konsep halaman produk dark mode dengan fokus pada konversi.',
    details: ['Hero dan ajakan yang jelas', 'Tabel harga', 'Form kontak'],
    stack: ['React', 'Tailwind'],
  },
];

export const COMMUNITY_BENEFITS = [
  { icon: GraduationCap, title: 'Belajar bareng', body: 'Bahas kode, stack, dan cara kerja project bersama.' },
  { icon: LifeBuoy, title: 'Saling bantu', body: 'Tanya saat buntu, dan bantu yang lain saat kamu bisa.' },
  { icon: Bell, title: 'Update langsung', body: 'Info layanan dan pengumuman sampai lebih dulu ke sini.' },
  { icon: Handshake, title: 'Kolaborasi', body: 'Bertemu klien dan developer lain untuk kerja bareng.' },
];

export const COMMUNITY_TOPICS = [
  { id: 'tanya-jawab', note: 'Tanya apa saja soal kode, error, atau stack yang sedang kamu pakai.' },
  { id: 'review-kode', note: 'Kirim potongan kode dan dapat masukan supaya lebih rapi dan aman.' },
  { id: 'showcase', note: 'Pamerkan project yang sudah jadi dan dapat tanggapan dari anggota lain.' },
  { id: 'pengumuman', note: 'Kabar layanan, jadwal, dan info terbaru dari JokiWebApp.' },
];

export const FAQS = [
  {
    question: 'Bagaimana alur kerjanya?',
    answer:
      'Kamu kirim brief lewat konsultasi, lalu kita bahas ruang lingkup, stack, dan estimasinya. Pengerjaan dimulai setelah sepakat. Selama proses kamu dapat update progres, dan hasilnya kamu cek sebelum diserahkan.',
  },
  {
    question: 'Berapa lama estimasi pengerjaannya?',
    answer:
      'Tergantung ruang lingkupnya. Perbaikan bug kecil jauh lebih singkat daripada aplikasi penuh, jadi estimasi dibuat per project setelah brief jelas. Kalau ada deadline, sampaikan dari awal.',
  },
  {
    question: 'Bagaimana kalau perlu revisi?',
    answer:
      'Batas revisi disepakati sebelum pengerjaan dimulai, supaya jelas apa saja yang termasuk. Perubahan di luar ruang lingkup awal dibahas dulu sebelum dikerjakan.',
  },
  {
    question: 'Apakah keamanan dan privasi terjamin?',
    answer:
      'Detail project dan data kamu hanya dipakai untuk pengerjaan dan tidak dibagikan ke pihak lain. Akses atau kredensial yang kamu berikan dipakai seperlunya, dan sebaiknya kamu ganti setelah project selesai.',
  },
];

export const CONSULT_TIMELINES = ['Secepatnya', '1 sampai 2 minggu', 'Sekitar sebulan', 'Fleksibel'];
