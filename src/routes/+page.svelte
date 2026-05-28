<script lang="ts">
	import { onMount } from 'svelte';
	import { getJadwalSholat, type PrayerTimings } from '$lib/services/jadwalSholat';
	import { formatIndonesianDate, getApproximateHijriDate } from '$lib/utils/date';
	import DonateModal from '$lib/components/DonateModal.svelte';
	import { 
		Heart, BookOpen, Compass, Users, MapPin, 
		ChevronLeft, ChevronRight, Quote, Info, ArrowRight,
		Clock, Bell
	} from '@lucide/svelte';

	// State
	let timings = $state<PrayerTimings | null>(null);
	let nextPrayer = $state<{ name: string; time: string; countdown: string } | null>(null);
	let currentDate = $state(new Date());
	let showDonateModal = $state(false);
	let activeTestimonial = $state(0);

	const stats = [
		{ label: 'Jamaah Aktif', value: '1.200+', icon: Users },
		{ label: 'Santri KOBER/DTA', value: '150+', icon: BookOpen },
		{ label: 'Program Sosial', value: '12+', icon: Heart },
		{ label: 'Pembangunan Fisik', value: '92%', icon: Compass }
	];

	const programs = [
		{
			title: 'Bidang ZIS',
			desc: 'Pengelolaan Zakat, Infaq, dan Sedekah secara syar\'i, transparan, dan produktif.',
			icon: Heart,
			color: 'from-emerald-500 to-emerald-600'
		},
		{
			title: 'Pendidikan Islami',
			desc: 'Membina generasi qur\'ani melalui KOBER/PAUD, DTA, dan Maghrib Mengaji.',
			icon: BookOpen,
			color: 'from-amber-500 to-gold-600'
		},
		{
			title: 'Sosial Keumatan',
			desc: 'Penyaluran beras perelek, sembako jemaah sakit, dan konsultasi keluarga/waris.',
			icon: Users,
			color: 'from-teal-500 to-teal-600'
		}
	];

	const testimonials = [
		{
			name: 'Bapak H. Mulyana',
			role: 'Tokoh Masyarakat Soreang Indah',
			quote: 'Alhamdulillah, Masjid Al-Ishlah tidak hanya menjadi tempat ibadah, tetapi juga pusat pemberdayaan sosial dan pendidikan anak-anak kami. Pengelolaannya sangat profesional.'
		},
		{
			name: 'Ibu Siti Aminah',
			role: 'Orang Tua Santri DTA',
			quote: 'Metode pembelajaran di DTA Al-Ishlah sangat terstruktur. Anak saya sekarang lebih gemar mengaji dan memiliki akhlaq yang baik. Ustadz dan ustadzahnya sangat penyabar.'
		},
		{
			name: 'Kang Asep',
			role: 'Penerima Manfaat Beras Bersubsidi',
			quote: 'Program sosial Beras Perelek sangat membantu keluarga kami di masa-masa sulit. Semoga Allah melipatgandakan rezeki para donatur Masjid Al-Ishlah.'
		}
	];

	onMount(() => {
		// Fetch prayer times
		getJadwalSholat().then((data) => {
			timings = data;
			calculateNextPrayer();
		});

		// Clock interval
		const interval = setInterval(() => {
			currentDate = new Date();
			calculateNextPrayer();
		}, 1000);

		return () => clearInterval(interval);
	});

	function calculateNextPrayer() {
		if (!timings) return;
		
		const now = new Date();
		const currentHour = now.getHours();
		const currentMin = now.getMinutes();
		const currentSec = now.getSeconds();
		const nowInSeconds = currentHour * 3600 + currentMin * 60 + currentSec;

		const list = [
			{ name: 'Subuh', time: timings.Fajr },
			{ name: 'Syuruq', time: timings.Sunrise },
			{ name: 'Dzuhur', time: timings.Dhuhr },
			{ name: 'Ashar', time: timings.Asr },
			{ name: 'Maghrib', time: timings.Maghrib },
			{ name: 'Isya', time: timings.Isha }
		];

		let found = false;
		for (const prayer of list) {
			const [hour, min] = prayer.time.split(':').map(Number);
			const prayerInSeconds = hour * 3600 + min * 60;

			if (prayerInSeconds > nowInSeconds) {
				const diff = prayerInSeconds - nowInSeconds;
				const h = Math.floor(diff / 3600);
				const m = Math.floor((diff % 3600) / 60);
				const s = diff % 60;
				
				nextPrayer = {
					name: prayer.name,
					time: prayer.time,
					countdown: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
				};
				found = true;
				break;
			}
		}

		if (!found) {
			// Next prayer is Fajr tomorrow
			const [hour, min] = list[0].time.split(':').map(Number);
			const prayerInSeconds = hour * 3600 + min * 60 + 24 * 3600; // plus 24 hours
			const diff = prayerInSeconds - nowInSeconds;
			const h = Math.floor(diff / 3600);
			const m = Math.floor((diff % 3600) / 60);
			const s = diff % 60;

			nextPrayer = {
				name: list[0].name,
				time: list[0].time,
				countdown: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
			};
		}
	}

	function nextTestimonial() {
		activeTestimonial = (activeTestimonial + 1) % testimonials.length;
	}

	function prevTestimonial() {
		activeTestimonial = (activeTestimonial - 1 + testimonials.length) % testimonials.length;
	}
</script>

<svelte:head>
	<title>Masjid Al-Ishlah Soreang Indah - Pusat Pendidikan & Dakwah</title>
	<meta name="description" content="Website Resmi Masjid Al-Ishlah Soreang Indah. Pusat dakwah keumatan, pendidikan qur'ani, zakat, infaq, shadaqah, dan layanan sosial kemanusiaan." />
</svelte:head>

<!-- Hero Section -->
<section class="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
	<!-- Background Image with Gradient Overlay -->
	<div class="absolute inset-0 z-0">
		<img
			src="/images/hero.png"
			alt="Masjid Al-Ishlah Background"
			class="w-full h-full object-cover object-center filter brightness-65 dark:brightness-40 transform scale-105 transition-transform duration-[10s]"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-900/60 to-slate-950/90"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 max-w-5xl mx-auto px-4 text-center text-white space-y-8 py-20">
		
		<!-- Floating glow tag -->
		<div class="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-emerald-400/30 bg-emerald-950/40 backdrop-blur-md glow-emerald text-xs font-semibold text-emerald-300 tracking-wider uppercase animate-float">
			<Compass class="w-3.5 h-3.5" />
			Pusat Pendidikan & Dakwah Keumatan
		</div>

		<div class="space-y-4">
			<h1 class="font-display font-bold text-4xl sm:text-6xl tracking-tight leading-tight">
				Masjid <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">Al‑Ishlah</span> <br class="hidden sm:inline" /> Soreang Indah
			</h1>
			<p class="max-w-2xl mx-auto text-sm sm:text-base text-slate-200/90 leading-relaxed font-sans">
				Membina akidah, mempererat ukhuwah, dan menebar kemanfaatan sosial keumatan demi terwujudnya peradaban islami yang berkah dan diridhai Allah SWT.
			</p>
		</div>

		<!-- Action CTA Buttons -->
		<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
			<button
				onclick={() => showDonateModal = true}
				class="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transform hover:-translate-y-0.5 transition-all duration-300"
			>
				<Heart class="w-5 h-5 fill-white/10" />
				Donasi Sekarang
			</button>
			<a
				href="/donasi"
				class="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl glass text-emerald-800 dark:text-emerald-300 border border-slate-200/20 dark:border-slate-800/80 font-bold hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
			>
				Lihat Program
				<ArrowRight class="w-4 h-4" />
			</a>
			<a
				href="/mushaf"
				class="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl border border-emerald-400/40 bg-emerald-950/20 text-emerald-300 font-bold hover:bg-emerald-900/20 transition-all duration-300"
			>
				<BookOpen class="w-4 h-4" />
				Mushaf Digital
			</a>
		</div>
	</div>

	<!-- Bottom Animated Wave or Fade -->
	<div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none"></div>
</section>

<!-- Jadwal Sholat Bar -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
	<div class="glass border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl p-6">
		<div class="flex flex-col lg:flex-row items-center justify-between gap-6">
			<!-- Date & Location -->
			<div class="flex items-center gap-4 w-full lg:w-auto">
				<div class="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
					<Clock class="w-6 h-6" />
				</div>
				<div>
					<h3 class="font-display font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
						Jadwal Sholat Hari Ini
						<span class="inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
							<MapPin class="w-2.5 h-2.5" /> Soreang, Bdg
						</span>
					</h3>
					<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
						{formatIndonesianDate(currentDate)} | <span class="text-emerald-700 dark:text-emerald-400 font-medium">{getApproximateHijriDate(currentDate)}</span>
					</p>
				</div>
			</div>

			<!-- Core Timings -->
			<div class="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full lg:w-auto">
				{#each [
					{ name: 'Subuh', time: timings?.Fajr || '04:35' },
					{ name: 'Syuruq', time: timings?.Sunrise || '05:52' },
					{ name: 'Dzuhur', time: timings?.Dhuhr || '11:51' },
					{ name: 'Ashar', time: timings?.Asr || '15:12' },
					{ name: 'Maghrib', time: timings?.Maghrib || '17:47' },
					{ name: 'Isya', time: timings?.Isha || '18:59' }
				] as sholat}
					<div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center flex flex-col justify-center">
						<span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{sholat.name}</span>
						<span class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono">{sholat.time}</span>
					</div>
				{/each}
			</div>

			<!-- Countdown Timer widget -->
			{#if nextPrayer}
				<div class="w-full lg:w-auto p-4 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-950 dark:to-emerald-900 text-white flex items-center justify-between gap-4">
					<div class="flex items-center gap-2">
						<Bell class="w-4 h-4 text-emerald-300 animate-bounce" />
						<div>
							<span class="block text-[10px] text-emerald-200 font-medium uppercase tracking-wider">Menuju Sholat</span>
							<span class="font-display font-semibold text-sm">{nextPrayer.name} ({nextPrayer.time})</span>
						</div>
					</div>
					<div class="text-right">
						<span class="block text-[10px] text-emerald-200 font-medium uppercase tracking-wider">Mundur</span>
						<span class="text-base font-bold font-mono tracking-wider">{nextPrayer.countdown}</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- Running Islamic Text Section -->
<section class="bg-emerald-50/50 dark:bg-slate-900/20 py-4 border-y border-slate-100 dark:border-slate-900 overflow-hidden mt-12">
	<div class="relative w-full overflow-hidden flex">
		<!-- Running content -->
		<div class="animate-scroll-text whitespace-nowrap flex items-center gap-20 text-sm font-display text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider pr-20">
			<span>🌙 Rasulullah SAW bersabda: "Siapa yang membangun masjid karena Allah walaupun hanya selubang tempat bertelur burung, maka Allah bangunkan rumah di surga." (HR. Ibnu Majah)</span>
			<span>🌟 Jadikan sedekah subuh sebagai penolong kita di akhirat kelak.</span>
			<span>📚 Mari bergabung dalam Maghrib Mengaji untuk menyongsong generasi qur'ani Soreang Indah.</span>
			<span>🤝 Salurkan Zakat, Infaq, Shadaqah Anda dengan aman & transparan melalui BJB Rekening 0000007021959.</span>
		</div>
		<div class="animate-scroll-text whitespace-nowrap flex items-center gap-20 text-sm font-display text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider pr-20" aria-hidden="true">
			<span>🌙 Rasulullah SAW bersabda: "Siapa yang membangun masjid karena Allah walaupun hanya selubang tempat bertelur burung, maka Allah bangunkan rumah di surga." (HR. Ibnu Majah)</span>
			<span>🌟 Jadikan sedekah subuh sebagai penolong kita di akhirat kelak.</span>
			<span>📚 Mari bergabung dalam Maghrib Mengaji untuk menyongsong generasi qur'ani Soreang Indah.</span>
			<span>🤝 Salurkan Zakat, Infaq, Shadaqah Anda dengan aman & transparan melalui BJB Rekening 0000007021959.</span>
		</div>
	</div>
</section>

<!-- Stats Grid -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
		{#each stats as stat}
			<div class="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow duration-300">
				<div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
					<stat.icon class="w-6 h-6" />
				</div>
				<div>
					<span class="block text-2xl font-bold font-display text-slate-800 dark:text-white leading-none">{stat.value}</span>
					<span class="block text-xs text-slate-400 mt-1.5 font-medium">{stat.label}</span>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Featured Programs -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
	<div class="text-center space-y-3 mb-16">
		<h2 class="font-display font-bold text-3xl text-slate-800 dark:text-white">Program Unggulan Keumatan</h2>
		<p class="max-w-xl mx-auto text-sm text-slate-500 leading-relaxed">
			Berbagai program dakwah, pendidikan, dan kesejahteraan sosial yang diselenggarakan aktif untuk mengayomi seluruh lapisan masyarakat.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
		{#each programs as program}
			<div class="group relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
				<!-- Top gradient highlight hover -->
				<div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r {program.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
				
				<div class="space-y-4">
					<div class="w-12 h-12 bg-gradient-to-tr {program.color} text-white rounded-xl flex items-center justify-center shadow-md">
						<program.icon class="w-6 h-6" />
					</div>
					<h3 class="font-display font-bold text-lg text-slate-800 dark:text-white">{program.title}</h3>
					<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{program.desc}</p>
				</div>

				<div class="pt-6">
					<a
						href="/donasi"
						class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline"
					>
						Lihat Detail Program
						<ArrowRight class="w-3.5 h-3.5" />
					</a>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Quran Quote Banner Section -->
<section class="max-w-5xl mx-auto px-4 py-16">
	<div class="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-900/50 p-8 sm:p-12 text-center border border-slate-800 shadow-xl">
		<!-- Glow backdrop -->
		<div class="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
		
		<div class="relative z-10 space-y-6">
			<div class="flex justify-center">
				<Quote class="w-10 h-10 text-emerald-500/30" />
			</div>
			<!-- Islamic Arabic calligraphy style font -->
			<p class="font-arabic font-bold text-2xl sm:text-3xl text-emerald-400 tracking-wide leading-relaxed">
				اِنَّمَا يَعْمُرُ مَسٰجِدَ اللّٰهِ مَنْ اٰمَنَ بِاللّٰهِ وَالْيَوْمِ الْاٰخِرِ
			</p>
			<p class="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300/90 leading-relaxed font-sans font-medium italic">
				"Hanya yang memakmurkan masjid-masjid Allah ialah orang-orang yang beriman kepada Allah dan Hari Kemudian..."
				<span class="block not-italic font-bold text-xs text-emerald-400 uppercase tracking-widest mt-2">— QS. At-Tawbah: 18</span>
			</p>
		</div>
	</div>
</section>

<!-- Testimonies Section -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl mb-20 border border-slate-100 dark:border-slate-900">
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center p-6">
		<div class="space-y-4">
			<span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Testimoni Jemaah</span>
			<h2 class="font-display font-bold text-3xl text-slate-800 dark:text-white leading-tight">Apa Kata Jemaah Soreang Indah?</h2>
			<p class="text-sm text-slate-500 leading-relaxed">
				Kepuasan, kenyamanan, dan rasa syukur dari warga, santri, serta donatur atas pelayanan sosial dan dakwah Masjid Al-Ishlah.
			</p>
			<!-- Nav controls -->
			<div class="flex items-center gap-3 pt-4">
				<button
					onclick={prevTestimonial}
					class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					aria-label="Kembali"
				>
					<ChevronLeft class="w-5 h-5" />
				</button>
				<button
					onclick={nextTestimonial}
					class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					aria-label="Lanjut"
				>
					<ChevronRight class="w-5 h-5" />
				</button>
			</div>
		</div>

		<div class="lg:col-span-2 relative min-h-[220px] flex items-center justify-center">
			{#each testimonials as testimonial, idx}
				{#if idx === activeTestimonial}
					<div class="w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md space-y-4 transition-all duration-300 transform translate-x-0 opacity-100">
						<p class="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
							"{testimonial.quote}"
						</p>
						<div>
							<h4 class="font-display font-semibold text-slate-800 dark:text-white">{testimonial.name}</h4>
							<p class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">{testimonial.role}</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<!-- Donasi Modal Overlay Trigger -->
<DonateModal isOpen={showDonateModal} onClose={() => showDonateModal = false} />
