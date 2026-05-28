<script lang="ts">
	import DonateModal from '$lib/components/DonateModal.svelte';
	import { 
		Heart, Coins, BookOpen, Hammer, Star, Calendar, 
		UserCheck, Search, ShieldAlert, Award, FileText, Gift
	} from '@lucide/svelte';

	// State
	let searchQuery = $state('');
	let selectedCategory = $state('Semua');
	let isModalOpen = $state(false);
	let selectedProgramName = $state('Infaq Masjid');

	const categories = [
		{ name: 'Semua', icon: null },
		{ name: 'ZIS', icon: Coins },
		{ name: 'Sosial Keumatan', icon: Heart },
		{ name: 'Pendidikan', icon: BookOpen },
		{ name: 'Pembangunan', icon: Hammer },
		{ name: 'Gema Islami', icon: Star },
		{ name: 'Majelis Ta\'lim', icon: Calendar },
		{ name: 'Layanan Umat', icon: UserCheck }
	];

	const programsList = [
		// ZIS
		{
			category: 'ZIS',
			title: 'Zakat Penghasilan',
			desc: 'Tunaikan kewajiban zakat dari penghasilan bulanan Anda secara aman dan amanah.',
			icon: Coins
		},
		{
			category: 'ZIS',
			title: 'Zakat Fitrah',
			desc: 'Layanan penyaluran zakat fitrah menjelang hari raya Idul Fitri bagi yang berhak.',
			icon: Coins
		},
		{
			category: 'ZIS',
			title: 'Donatur Rutin',
			desc: 'Bergabung menjadi donatur rutin operasional bulanan dan pemakmuran dakwah masjid.',
			icon: Heart
		},
		// Sosial Keumatan
		{
			category: 'Sosial Keumatan',
			title: 'Beras Perelek',
			desc: 'Gerakan pengumpulan beras sukarela untuk didistribusikan kepada warga pra-sejahtera.',
			icon: Heart
		},
		{
			category: 'Sosial Keumatan',
			title: 'Beras Bersubsidi',
			desc: 'Penyediaan sembako murah bersubsidi bagi jamaah kurang mampu di sekitar lingkungan masjid.',
			icon: Heart
		},
		{
			category: 'Sosial Keumatan',
			title: 'Beras Gratis',
			desc: 'Distribusi beras gratis berkala bagi kaum dhuafa dan jemaah rentan pangan.',
			icon: Gift
		},
		{
			category: 'Sosial Keumatan',
			title: 'Sembako Jemaah Sakit',
			desc: 'Pemberian paket nutrisi dan sembako serta santunan bagi jemaah yang sedang sakit keras.',
			icon: Heart
		},
		{
			category: 'Sosial Keumatan',
			title: 'Konsultasi Keluarga',
			desc: 'Layanan bimbingan keluarga sakinah, mediasi konflik rumah tangga secara Islami.',
			icon: Heart
		},
		{
			category: 'Sosial Keumatan',
			title: 'Konsultasi Waris',
			desc: 'Konsultasi perhitungan waris (Faraid) sesuai syariat Islam dipandu ustadz ahli.',
			icon: FileText
		},
		// Pendidikan
		{
			category: 'Pendidikan',
			title: 'KOBER / PAUD Al‑Ishlah',
			desc: 'Kelompok bermain mendidik akhlaqul karimah sejak usia dini dengan metode interaktif.',
			icon: BookOpen
		},
		{
			category: 'Pendidikan',
			title: 'DTA (Diniyah Takmiliyah Awaliyah)',
			desc: 'Madrasah sore penunjang nilai keagamaan bagi siswa SD/MI sederajat.',
			icon: BookOpen
		},
		{
			category: 'Pendidikan',
			title: 'Maghrib Mengaji',
			desc: 'Program tadarus dan hafalan Al-Quran ba\'da maghrib untuk anak-anak.',
			icon: BookOpen
		},
		{
			category: 'Pendidikan',
			title: 'Tahsin Jama\'ah',
			desc: 'Perbaikan bacaan Al-Quran bagi jamaah dewasa dengan bimbingan metode Iqra.',
			icon: BookOpen
		},
		// Pembangunan
		{
			category: 'Pembangunan',
			title: 'Penambahan Fasilitas',
			desc: 'Wakaf sarana prasarana baru, pendingin ruangan, sound system, karpet, dll.',
			icon: Hammer
		},
		{
			category: 'Pembangunan',
			title: 'Pemeliharaan Rutin',
			desc: 'Dukungan biaya renovasi berkala, tagihan listrik, kebersihan, air bersih, dll.',
			icon: Hammer
		},
		// Gema Islami
		{
			category: 'Gema Islami',
			title: 'Gema Tarawih & Tadarus',
			desc: 'Penyelenggaraan ibadah Ramadhan, insentif imam muda, dan tadarus malam hari.',
			icon: Star
		},
		{
			category: 'Gema Islami',
			title: 'Berbagi Takjil Ramadhan',
			desc: 'Penyediaan hidangan buka puasa gratis setiap hari bagi musafir dan jamaah.',
			icon: Star
		},
		{
			category: 'Gema Islami',
			title: 'Pesantren Kilat (Sanlat)',
			desc: 'Edukasi keagamaan intensif liburan sekolah untuk remaja Soreang Indah.',
			icon: Star
		},
		{
			category: 'Gema Islami',
			title: 'Program Imam Muda',
			desc: 'Kaderisasi dan bimbingan kepemimpinan imam sholat berjamaah dari kalangan santri.',
			icon: Award
		},
		{
			category: 'Gema Islami',
			title: 'I\'tikaf 10 Hari Terakhir',
			desc: 'Fasilitas sahur gratis dan konsumsi bagi jamaah i\'tikaf mengejar Lailatul Qadar.',
			icon: Star
		},
		{
			category: 'Gema Islami',
			title: 'Kajian Subuh Akbar',
			desc: 'Penyelenggaraan tabligh akbar ba\'da sholat subuh secara berkala.',
			icon: Star
		},
		{
			category: 'Gema Islami',
			title: 'Sholat Idul Fitri & Adha',
			desc: 'Kepanitiaan ibadah sholat Id, sound system luar ruang, dan penataan saf jamaah.',
			icon: Star
		},
		// Majelis Ta'lim
		{
			category: 'Majelis Ta\'lim',
			title: 'Kajian Gerakan Subuh',
			desc: 'Kajian rutin ba\'da subuh membahas fiqih sehari-hari dan tafsir ayat pendek.',
			icon: Calendar
		},
		{
			category: 'Majelis Ta\'lim',
			title: 'Ta\'lim Al‑Fadilah Senin',
			desc: 'Majelis ilmu ibu-ibu membahas keutamaan akhlaq dan pendidikan keluarga.',
			icon: Calendar
		},
		{
			category: 'Majelis Ta\'lim',
			title: 'Majelis Selasa Sore',
			desc: 'Kajian sirah nabawiyah umum setiap selasa ba\'da ashar.',
			icon: Calendar
		},
		{
			category: 'Majelis Ta\'lim',
			title: 'Malam Kamis Bapak-bapak',
			desc: 'Kajian fiqih muamalah dan interaktif bagi jamaah pria.',
			icon: Calendar
		},
		{
			category: 'Majelis Ta\'lim',
			title: 'Dzikir Al‑Ishlah Maljum',
			desc: 'Dzikir bersama dan pembacaan yasin/tahlil jamaah setiap malam jumat.',
			icon: Calendar
		},
		{
			category: 'Majelis Ta\'lim',
			title: 'Hadits Malam Ahad',
			desc: 'Bedah kitab hadits Riyadhush Shalihin setiap sabtu malam ba\'da isya.',
			icon: Calendar
		},
		// Layanan Umat
		{
			category: 'Layanan Umat',
			title: 'Tabungan Qurban',
			desc: 'Fasilitasi kemudahan tabungan terencana bagi jemaah yang hendak berqurban.',
			icon: UserCheck
		},
		{
			category: 'Layanan Umat',
			title: 'KPJ (Pemulasaran Jenazah)',
			desc: 'Iuran kematian jemaah, layanan pemandian, kafan, ambulans, dan santunan waris.',
			icon: UserCheck
		}
	];

	// Reactive filtering
	let filteredPrograms = $derived(
		programsList.filter((p) => {
			const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
														p.desc.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
			return matchesSearch && matchesCat;
		})
	);

	function openDonation(programName: string) {
		selectedProgramName = programName;
		isModalOpen = true;
	}
</script>

<svelte:head>
	<title>Program & Donasi - Masjid Al-Ishlah Soreang Indah</title>
	<meta name="description" content="Daftar Program Keumatan, Dakwah, ZIS, Pendidikan dan Pembangunan Masjid Al-Ishlah Soreang Indah. Salurkan sedekah terbaik Anda." />
</svelte:head>

<section class="min-h-screen py-12 bg-slate-50/50 dark:bg-slate-950/20">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<!-- Page Title Section -->
		<div class="text-center space-y-4 mb-12">
			<h1 class="font-display font-bold text-3xl sm:text-4xl text-slate-800 dark:text-white">Program & Donasi Masjid</h1>
			<p class="max-w-xl mx-auto text-sm text-slate-500 leading-relaxed">
				Tebarkan keberkahan rezeki Anda. Salurkan donasi, zakat, infaq, shadaqah secara mudah, transparan, dan profesional.
			</p>
		</div>

		<!-- Search Bar & Filters -->
		<div class="space-y-6 mb-10">
			<!-- Search Input -->
			<div class="relative max-w-md mx-auto">
				<Search class="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
				<input
					type="text"
					placeholder="Cari program donasi..."
					bind:value={searchQuery}
					class="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
				/>
			</div>

			<!-- Categories Horizontal Filter Scrollable -->
			<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start lg:justify-center -mx-4 px-4 sm:mx-0 sm:px-0">
				{#each categories as cat}
					<button
						onclick={() => selectedCategory = cat.name}
						class="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap {selectedCategory === cat.name ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700'}"
					>
						{#if cat.icon}
							<cat.icon class="w-3.5 h-3.5" />
						{/if}
						{cat.name}
					</button>
				{/each}
			</div>
		</div>

		<!-- Programs Grid -->
		{#if filteredPrograms.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each filteredPrograms as prog}
					<div class="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-emerald-300/40 dark:hover:border-emerald-800/30 transition-all duration-300">
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
									<prog.icon class="w-5 h-5" />
								</div>
								<span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
									{prog.category}
								</span>
							</div>
							<h3 class="font-display font-semibold text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
								{prog.title}
							</h3>
							<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[48px]">
								{prog.desc}
							</p>
						</div>

						<div class="pt-6">
							<button
								onclick={() => openDonation(prog.title)}
								class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 transition-all duration-200"
							>
								Donasi Sekarang
							</button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<ShieldAlert class="w-12 h-12 text-slate-300 dark:text-slate-700" />
				<h3 class="font-display font-semibold text-slate-800 dark:text-white mt-4">Program Tidak Ditemukan</h3>
				<p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs">
					Kami tidak menemukan hasil pencarian untuk "{searchQuery}". Silakan cari kata kunci lain.
				</p>
			</div>
		{/if}

	</div>
</section>

<!-- Donasi Modal -->
<DonateModal isOpen={isModalOpen} onClose={() => isModalOpen = false} programName={selectedProgramName} />
