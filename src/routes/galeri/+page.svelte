<script lang="ts">
	import { 
		Grid, Image, Calendar, User, Eye, X, 
		ChevronLeft, ChevronRight, PlayCircle
	} from '@lucide/svelte';

	// State
	let selectedCategory = $state('Semua');
	let activeLightboxIndex = $state<number | null>(null);

	const categories = ['Semua', 'Kajian', 'Pendidikan', 'Ramadhan', 'Qurban', 'Kegiatan Sosial', 'Pembangunan'];

	const galleryItems = [
		{
			id: 1,
			title: 'Kajian Gerakan Subuh Akbar',
			category: 'Kajian',
			date: '12 Mei 2026',
			lecturer: 'Ustadz Wijayanto',
			img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
		},
		{
			id: 2,
			title: 'Penerimaan Santri Baru KOBER',
			category: 'Pendidikan',
			date: '05 Mei 2026',
			lecturer: 'Tim PAUD Al-Ishlah',
			img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600'
		},
		{
			id: 3,
			title: 'I\'tikaf 10 Hari Terakhir Ramadhan',
			category: 'Ramadhan',
			date: '15 April 2026',
			lecturer: 'Ustadz Adi Hidayat',
			img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=600'
		},
		{
			id: 4,
			title: 'Pendistribusian Beras Perelek Tahap III',
			category: 'Kegiatan Sosial',
			date: '20 April 2026',
			lecturer: 'Lazis Al-Ishlah',
			img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600'
		},
		{
			id: 5,
			title: 'Pemasangan Karpet Baru Ruang Utama',
			category: 'Pembangunan',
			date: '02 April 2026',
			lecturer: 'DKM Al-Ishlah',
			img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600'
		},
		{
			id: 6,
			title: 'Pelaksanaan Penyembelihan Qurban 1447 H',
			category: 'Qurban',
			date: '28 Juni 2025',
			lecturer: 'Panitia Qurban',
			img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'
		},
		{
			id: 7,
			title: 'Kajian Rutin Fiqih Muamalah',
			category: 'Kajian',
			date: '28 Mei 2026',
			lecturer: 'K.H. Athian Ali',
			img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600'
		},
		{
			id: 8,
			title: 'Pesantren Kilat Ramadhan Ceria',
			category: 'Ramadhan',
			date: '10 April 2026',
			lecturer: 'Remaja Masjid',
			img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600'
		}
	];

	let filteredItems = $derived(
		selectedCategory === 'Semua' 
			? galleryItems 
			: galleryItems.filter(item => item.category === selectedCategory)
	);

	function openLightbox(index: number) {
		activeLightboxIndex = index;
	}

	function closeLightbox() {
		activeLightboxIndex = null;
	}

	function nextLightbox() {
		if (activeLightboxIndex === null) return;
		activeLightboxIndex = (activeLightboxIndex + 1) % filteredItems.length;
	}

	function prevLightbox() {
		if (activeLightboxIndex === null) return;
		activeLightboxIndex = (activeLightboxIndex - 1 + filteredItems.length) % filteredItems.length;
	}
</script>

<svelte:head>
	<title>Galeri Dokumentasi - Masjid Al-Ishlah Soreang Indah</title>
	<meta name="description" content="Dokumentasi foto dan video berbagai kegiatan dakwah, kajian, sosial keumatan, ramadhan, qurban dan renovasi Masjid Al-Ishlah Soreang Indah." />
</svelte:head>

<section class="min-h-screen py-12 bg-slate-50/50 dark:bg-slate-950/20">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<!-- Page Header -->
		<div class="text-center space-y-4 mb-12">
			<h1 class="font-display font-bold text-3xl sm:text-4xl text-slate-800 dark:text-white">Galeri Dokumentasi</h1>
			<p class="max-w-xl mx-auto text-sm text-slate-500 leading-relaxed">
				Melihat kembali momen-momen penuh keberkahan dari dakwah, kajian, pendidikan, pembangunan, dan kegiatan sosial jamaah Masjid Al-Ishlah.
			</p>
		</div>

		<!-- Filter Buttons -->
		<div class="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none justify-start lg:justify-center -mx-4 px-4 sm:mx-0 sm:px-0 mb-10">
			{#each categories as category}
				<button
					onclick={() => selectedCategory = category}
					class="px-4 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap {selectedCategory === category ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700'}"
				>
					{category}
				</button>
			{/each}
		</div>

		<!-- Grid Layout -->
		{#if filteredItems.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each filteredItems as item, idx}
					<!-- eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -->
					<div
						onclick={() => openLightbox(idx)}
						class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
					>
						<!-- Image Container -->
						<div class="relative aspect-video overflow-hidden">
							<img
								src={item.img}
								alt={item.title}
								loading="lazy"
								class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<!-- Overlay glass glow -->
							<div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
								<div class="p-3 bg-white/20 backdrop-blur rounded-full text-white">
									<Eye class="w-6 h-6" />
								</div>
							</div>
							<span class="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded shadow">
								{item.category}
							</span>
						</div>

						<!-- Details -->
						<div class="p-5 space-y-3">
							<h3 class="font-display font-semibold text-sm text-slate-800 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
								{item.title}
							</h3>
							<div class="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
								<span class="flex items-center gap-1">
									<Calendar class="w-3.5 h-3.5" />
									{item.date}
								</span>
								<span class="flex items-center gap-1">
									<User class="w-3.5 h-3.5" />
									{item.lecturer}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-20 text-center text-slate-400">
				<Image class="w-12 h-12" />
				<h3 class="font-display font-semibold text-slate-800 dark:text-white mt-4">Belum Ada Dokumentasi</h3>
				<p class="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
					Dokumentasi kegiatan untuk kategori ini belum tersedia. Silakan cek kembali dalam waktu dekat.
				</p>
			</div>
		{/if}

	</div>
</section>

<!-- Lightbox Modal -->
{#if activeLightboxIndex !== null}
	{@const activeItem = filteredItems[activeLightboxIndex]}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<!-- eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -->
		<div 
			class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm transition-opacity duration-300"
			onclick={closeLightbox}
		></div>

		<!-- Lightbox Container -->
		<div class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-slate-900 shadow-2xl border border-slate-800/80 transition-all duration-300 transform scale-100 flex flex-col">
			
			<!-- Close button -->
			<button
				onclick={closeLightbox}
				class="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors"
				aria-label="Tutup"
			>
				<X class="w-5 h-5" />
			</button>

			<!-- Media Showcase -->
			<div class="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
				<img
					src={activeItem.img}
					alt={activeItem.title}
					class="max-w-full max-h-full object-contain"
				/>

				<!-- Left Arrow -->
				<button
					onclick={prevLightbox}
					class="absolute left-4 p-2.5 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors"
					aria-label="Sebelumnya"
				>
					<ChevronLeft class="w-5 h-5" />
				</button>

				<!-- Right Arrow -->
				<button
					onclick={nextLightbox}
					class="absolute right-4 p-2.5 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors"
					aria-label="Selanjutnya"
				>
					<ChevronRight class="w-5 h-5" />
				</button>
			</div>

			<!-- Lightbox details bar -->
			<div class="p-6 bg-slate-950 text-white space-y-2">
				<div class="flex items-center gap-2">
					<span class="text-[9px] font-bold uppercase tracking-wider bg-emerald-600 px-2 py-0.5 rounded">
						{activeItem.category}
					</span>
					<span class="text-[10px] text-slate-500 font-mono">{activeItem.date}</span>
				</div>
				<h3 class="font-display font-semibold text-base leading-snug">{activeItem.title}</h3>
				<p class="text-xs text-slate-400">Pembawa Acara/Pelaksana: <span class="font-medium text-emerald-400">{activeItem.lecturer}</span></p>
			</div>

		</div>
	</div>
{/if}
