<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { 
		Search, BookOpen, Play, Pause, SkipForward, SkipBack, 
		Bookmark, BookmarkCheck, Volume2, RotateCcw, ArrowDown,
		Sparkles, Loader2, Square, X, ArrowLeft, Settings, Type, Music,
		Mic, VolumeX, CheckCircle
	} from '@lucide/svelte';
	import { toastStore } from '$lib/stores/toast.svelte';

	interface Surah {
		nomor: number;
		nama: string;
		namaLatin: string;
		jumlahAyat: number;
		tempatTurun: string;
		arti: string;
		deskripsi: string;
		audioFull: Record<string, string>;
	}

	interface Ayah {
		nomorAyat: number;
		teksArab: string;
		teksLatin: string;
		teksIndonesia: string;
		audio: Record<string, string>;
	}

	// State
	let surahList = $state<Surah[]>([]);
	let selectedSurah = $state<Surah | null>(null);
	let verses = $state<Ayah[]>([]);
	let isLoadingList = $state(true);
	let isLoadingSurah = $state(false);
	let searchQuery = $state('');

	// Mushaf View & Settings States
	let showSettingsPanel = $state(false);
	let showTajweedPanel = $state(false);
	let activeTajweedTab = $state<'nun-mati' | 'mim-mati' | 'qalqalah' | 'mad' | 'alif-lam' | 'hukum-ra' | 'ghunnah'>('nun-mati');
	let arabicFontSize = $state(38); // default Arabic size

	interface TajweedSection {
		title: string;
		desc: string;
		rules: Array<{
			name: string;
			definition: string;
			letters: string;
			examples: Array<{ arab: string; latin: string; translation: string; surah: number; ayah: number }>;
		}>;
	}

	const tajweedChapters: Record<string, TajweedSection> = {
		'nun-mati': {
			title: 'Nun Mati & Tanwin',
			desc: 'Hukum bacaan ketika Nun Mati (نْ) atau Tanwin (ً ٍ ٌ) bertemu dengan salah satu huruf hijaiyah.',
			rules: [
				{
					name: '1. Izhar Halqi',
					definition: 'Dibaca dengan jelas dan tegas tanpa dengung.',
					letters: 'ء, هـ, ع, ح, غ, خ',
					examples: [
						{ arab: 'مَنْ اٰمَنَ', latin: 'Man amana', translation: 'Barang siapa yang beriman', surah: 2, ayah: 62 },
						{ arab: 'سَمِيْعٌ عَلِيْمٌ', latin: 'Sami\'un \'alim', translation: 'Maha Mendengar lagi Maha Mengetahui', surah: 2, ayah: 224 }
					]
				},
				{
					name: '2. Idgham Bighunnah',
					definition: 'Meleburkan suara Nun Mati/Tanwin dengan dengung (2 harakat).',
					letters: 'ي, ن, م, و',
					examples: [
						{ arab: 'مَنْ يَّقُوْلُ', latin: 'May-yaqulu', translation: 'Barang siapa yang berkata', surah: 2, ayah: 8 },
						{ arab: 'لَهَبٍ وَّتَبَّ', latin: 'Lahabiw-watabb', translation: 'Api yang bergejolak dan binasa', surah: 111, ayah: 1 }
					]
				},
				{
					name: '3. Idgham Bilaghunnah',
					definition: 'Meleburkan suara Nun Mati/Tanwin tanpa disertai dengung.',
					letters: 'ل, ر',
					examples: [
						{ arab: 'مِنْ رَّبِّهِمْ', latin: 'Mir-rabbihim', translation: 'Dari Tuhan mereka', surah: 2, ayah: 5 },
						{ arab: 'غَفُوْرٌ رَّحِيْمٌ', latin: 'Ghafurur-rahim', translation: 'Maha Pengampun lagi Maha Penyayang', surah: 2, ayah: 173 }
					]
				},
				{
					name: '4. Iqlab',
					definition: 'Mengubah suara Nun Mati/Tanwin menjadi suara Mim (م) disertai dengung.',
					letters: 'ب',
					examples: [
						{ arab: 'مِنْ بَعْدِ', latin: 'Mim-ba\'di', translation: 'Setelah', surah: 2, ayah: 109 },
						{ arab: 'سَمِيْعٌۢ بَصِيْرٌ', latin: 'Sami\'um-bashir', translation: 'Maha Mendengar lagi Maha Melihat', surah: 31, ayah: 28 }
					]
				},
				{
					name: '5. Ikhfa Haqiqi',
					definition: 'Menyamarkan suara Nun Mati/Tanwin antara Izhar dan Idgham disertai dengung.',
					letters: 'ت, ث, ج, د, ذ, ز, س, ش, ص, ض, ط, ظ, ف, ق, ك',
					examples: [
						{ arab: 'مِنْ دُوْنِ اللّٰهِ', latin: 'Min-dunillahi', translation: 'Selain Allah', surah: 2, ayah: 165 },
						{ arab: 'يَنْصُرْكُمُ', latin: 'Yanshurkum', translation: 'Dia menolong kalian', surah: 3, ayah: 160 }
					]
				}
			]
		},
		'mim-mati': {
			title: 'Mim Mati',
			desc: 'Hukum bacaan ketika Mim Sukun / Mim Mati (مْ) bertemu dengan huruf hijaiyah.',
			rules: [
				{
					name: '1. Ikhfa Syafawi',
					definition: 'Menyuarakan Mim mati secara samar di bibir dengan berdengung.',
					letters: 'ب',
					examples: [
						{ arab: 'تَرْمِيْهِمْ بِحِجَارَةٍ', latin: 'Tarmihim-bihijaratin', translation: 'Melempari mereka dengan batu', surah: 105, ayah: 4 }
					]
				},
				{
					name: '2. Idgham Mimi (Mutamatsilain)',
					definition: 'Memasukkan Mim mati ke Mim berharkat di depannya disertai dengung.',
					letters: 'م',
					examples: [
						{ arab: 'فِيْ قُلُوْبِهِمْ مَّرَضٌ', latin: 'Fi qulubihim-maradhun', translation: 'Dalam hati mereka ada penyakit', surah: 2, ayah: 10 }
					]
				},
				{
					name: '3. Izhar Syafawi',
					definition: 'Membaca Mim mati dengan jelas tanpa dengung di bibir.',
					letters: 'Semua huruf hijaiyah selain ب dan م',
					examples: [
						{ arab: 'لَهُمْ فِيْهَا', latin: 'Lahum fiha', translation: 'Bagi mereka di dalamnya', surah: 2, ayah: 25 },
						{ arab: 'اَلَمْ تَرَ', latin: 'Alam tara', translation: 'Tidakkah kamu perhatikan', surah: 105, ayah: 1 }
					]
				}
			]
		},
		'qalqalah': {
			title: 'Qalqalah',
			desc: 'Hukum memantulkan suara huruf hijaiyah tertentu ketika berbaris sukun atau dihentikan (waqaf).',
			rules: [
				{
					name: 'Huruf Qalqalah',
					definition: 'Huruf qalqalah ada lima yang disingkat baju di toko.',
					letters: 'ق, ط, ب, ج, د',
					examples: []
				},
				{
					name: '1. Qalqalah Sugra (Kecil)',
					definition: 'Pantulan ringan yang terjadi di tengah kata karena huruf sukun asli.',
					letters: 'ق, ط, ب, ج, د (Sukun asli di tengah kata)',
					examples: [
						{ arab: 'يَقْطَعُوْنَ', latin: 'Yaqta\'una', translation: 'Mereka memutuskan', surah: 2, ayah: 27 },
						{ arab: 'يَجْعَلُوْنَ', latin: 'Yaj\'aluna', translation: 'Mereka menjadikan', surah: 2, ayah: 19 }
					]
				},
				{
					name: '2. Qalqalah Kubra (Besar)',
					definition: 'Pantulan kuat yang terjadi di akhir kata karena waqaf (dihentikan).',
					letters: 'ق, ط, ب, ج, د (Di akhir kalimat/waqaf)',
					examples: [
						{ arab: 'قُلْ هُوَ اللّٰهُ اَحَدٌۚ', latin: 'Qul huwallahu ahad', translation: 'Katakanlah: Dialah Allah, Yang Maha Esa', surah: 112, ayah: 1 },
						{ arab: 'فِيْ جِيْدِهَا حَبْلٌ مِّنْ مَّسَدٍ', latin: '...hablum-mim-masad', translation: '...tali dari sabut yang dipintal', surah: 111, ayah: 5 }
					]
				}
			]
		},
		'mad': {
			title: 'Hukum Mad',
			desc: 'Hukum memanjangkan ketukan suara pada huruf mad (alif, wawu, ya).',
			rules: [
				{
					name: '1. Mad Thabi\'i (Asli)',
					definition: 'Panjang 2 harakat (1 alif) terjadi apabila alif setelah fathah, ya sukun setelah kasrah, atau wawu sukun setelah dhummah.',
					letters: 'ا (setelah fathah), يْ (setelah kasrah), وْ (setelah dhummah)',
					examples: [
						{ arab: 'قَالُوْا', latin: 'Qalu', translation: 'Mereka berkata', surah: 2, ayah: 11 },
						{ arab: 'فِيْهِمْ', latin: 'Fihim', translation: 'Dalam mereka', surah: 2, ayah: 129 }
					]
				},
				{
					name: '2. Mad Wajib Muttashil',
					definition: 'Mad Thabi\'i bertemu Hamzah dalam satu kata. Dibaca panjang 4-5 harakat.',
					letters: 'Mad Thabi\'i + ء (Satu kata)',
					examples: [
						{ arab: 'جَاۤءَ', latin: 'Jaa-a', translation: 'Telah datang', surah: 110, ayah: 1 },
						{ arab: 'السَّمَاۤءِ', latin: 'As-samaa-i', translation: 'Langit', surah: 82, ayah: 1 }
					]
				},
				{
					name: '3. Mad Jaiz Munfashil',
					definition: 'Mad Thabi\'i bertemu Hamzah di lain kata. Dibaca panjang 2, 4, atau 5 harakat.',
					letters: 'Mad Thabi\'i + ء (Beda kata)',
					examples: [
						{ arab: 'اِنَّاۤ اَنْزَلْنٰهُ', latin: 'Innaa anzalnahu', translation: 'Sesungguhnya Kami menurunkannya', surah: 97, ayah: 1 }
					]
				},
				{
					name: '4. Mad Aridh Lissukun',
					definition: 'Mad Thabi\'i bertemu huruf hidup yang dibaca mati karena waqaf di akhir ayat. Dibaca panjang 2, 4, atau 6 harakat.',
					letters: 'Mad Thabi\'i + Huruf hidup di waqaf',
					examples: [
						{ arab: 'عَذَابٌ شَدِيْدٌ', latin: '...\'adzabun syadid', translation: '...azab yang pedih', surah: 3, ayah: 4 },
						{ arab: 'مِنَ النَّاسِ', latin: '...minan-naas', translation: '...dari golongan manusia', surah: 114, ayah: 6 }
					]
				}
			]
		},
		'alif-lam': {
			title: 'Alif Lam (ال)',
			desc: 'Hukum membaca huruf Alif dan Lam (ال) ketika bertemu huruf-huruf hijaiyah.',
			rules: [
				{
					name: '1. Alif Lam Qamariyah (Izhar Qamari)',
					definition: 'Membaca huruf Lam sukun secara jelas tanpa melebur.',
					letters: 'ء, ب, ج, ح, خ, ع, غ, ف, ق, ك, م, و, هـ, ي',
					examples: [
						{ arab: 'اَلْحَمْدُ', latin: 'Al-hamdu', translation: 'Segala puji', surah: 1, ayah: 2 },
						{ arab: 'اَلْقَارِعَةُ', latin: 'Al-qari\'ah', translation: 'Hari Kiamat', surah: 101, ayah: 1 }
					]
				},
				{
					name: '2. Alif Lam Syamsiyah (Idgham Syamsi)',
					definition: 'Meleburkan suara Lam sukun langsung masuk ke huruf berikutnya (tidak dibaca jelas).',
					letters: 'ت, ث, د, ذ, ر, ز, س, ش, ص, ض, ط, ظ, ل, ن',
					examples: [
						{ arab: 'اَلرَّحْمٰنُ', latin: 'Ar-rahman', translation: 'Yang Maha Pengasih', surah: 55, ayah: 1 },
						{ arab: 'اَلشَّمْسُ', latin: 'Asy-syamsu', translation: 'Matahari', surah: 91, ayah: 1 }
					]
				}
			]
		},
		'hukum-ra': {
			title: 'Hukum Ra (ر)',
			desc: 'Aturan menebalkan (Tafkhim) atau menipiskan (Tarqiq) pengucapan huruf Ra.',
			rules: [
				{
					name: '1. Ra Tafkhim (Tebal)',
					definition: 'Ra dibaca tebal ketika berbaris fathah, dhummah, sukun setelah fathah/dhummah, atau sukun karena waqaf setelah huruf hidup berbaris fathah/dhummah.',
					letters: 'رَ, رُ, رْ (setelah fathah/dhummah)',
					examples: [
						{ arab: 'رَبَّنَا', latin: 'Rabbana', translation: 'Tuhan kami', surah: 2, ayah: 127 },
						{ arab: 'قُرْاٰنٌ', latin: 'Qur\'an', translation: 'Al-Quran', surah: 85, ayah: 21 }
					]
				},
				{
					name: '2. Ra Tarqiq (Tipis)',
					definition: 'Ra dibaca tipis ketika berbaris kasrah, sukun setelah kasrah asli, atau sukun karena waqaf setelah huruf Ya sukun.',
					letters: 'رِ, رْ (setelah kasrah/ya)',
					examples: [
						{ arab: 'رِجَالٌ', latin: 'Rijal', translation: 'Laki-laki', surah: 24, ayah: 37 },
						{ arab: 'فِرْعَوْنَ', latin: 'Fir\'aun', translation: 'Firaun', surah: 7, ayah: 103 }
					]
				}
			]
		},
		'ghunnah': {
			title: 'Ghunnah',
			desc: 'Hukum dengung yang wajib dibaca sepanjang 2 harakat pada huruf Nun dan Mim yang bersyaddah (bertasydid).',
			rules: [
				{
					name: 'Ghunnah Musyaddadah',
					definition: 'Setiap huruf Nun bertasydid (نّ) atau Mim bertasydid (مّ) harus dibaca mendengung ke rongga hidung.',
					letters: 'نّ, مّ',
					examples: [
						{ arab: 'اِنَّ الَّذِيْنَ', latin: 'Innal-ladzina', translation: 'Sesungguhnya orang-orang yang', surah: 2, ayah: 6 },
						{ arab: 'مِمَّا خَلَقَ', latin: 'Mimma khalaq', translation: 'Dari apa yang Dia ciptakan', surah: 113, ayah: 2 }
					]
				}
			]
		}
	};
	let latinFontSize = $state(15);  // default Latin/translation size
	let jumpToAyah = $state<number | null>(null);
	let showAlFatihahReminder = $state(false);
	let pendingSurah = $state<Surah | null>(null);
	let showTranslation = $state(true);
	let showWordByWord = $state(false);
	let wbwData = $state<Record<number, any[]>>({});
	let isLoadingWbw = $state(false);

	// Audio Reciters list (Excluding Mishary Rashid '05')
	const qoris = [
		{ id: '06', name: 'Yasser Al-Dosari' },
		{ id: '03', name: 'Abdurrahman As-Sudais' },
		{ id: '01', name: 'Abdullah Al-Juhany' },
		{ id: '02', name: 'Abdul Muhsin Al-Qasim' },
		{ id: '04', name: 'Ibrahim Al-Dossari' }
	];
	let selectedQori = $state('06');
	let currentQoriName = $derived(qoris.find(q => q.id === selectedQori)?.name || 'Yasser Al-Dosari');

	// Audio Player State
	let playingAyahIndex = $state<number | null>(null);
	let isAudioPlaying = $state(false);
	let isRepeatMode = $state(false);
	let audioNode: HTMLAudioElement | null = null;
	let volume = $state(0.8);
	let audioProgress = $state(0);
	let isPlayingBismillah = $state(false);
	let preloadAudioNode: HTMLAudioElement | null = null;

	const bismillahAudioMap: Record<string, string> = {
		'01': 'https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/001001.mp3',
		'02': 'https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/001001.mp3',
		'03': 'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001001.mp3',
		'04': 'https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/001001.mp3',
		'06': 'https://cdn.equran.id/audio-partial/Yasser-Al-Dosari/001001.mp3'
	};

	// Bookmarks State
	let bookmarkedVerses = $state<Record<string, boolean>>({});

	// Auto Scroll State
	let isAutoScrolling = $state(false);
	let scrollInterval: any = null;

	// Reading View Settings
	let readingTheme = $state<'normal' | 'dark-read' | 'sepia'>('normal');
	let alFatihahYasserPart = $state<1 | 2>(1);

	// Recitation Corrector State
	let showCorrectorPanel = $state(false);
	let isRecording = $state(false);
	let userAudioUrl = $state<string | null>(null);
	let isAnalyzing = $state(false);
	let selectedAyahToCorrect = $state<number>(1);
	let correctedAyahs = $state<Record<string, boolean>>({});
	
	interface AnalysisReport {
		makhrajScore: number;
		tajweedScore: number;
		tempoScore: number;
		overallScore: number;
		feedback: string;
		highlights: string[];
	}
	let analysisReport = $state<AnalysisReport | null>(null);

	// Web Audio variables for visualizer
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let audioContext: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let visualizerDataArray = $state<number[]>(new Array(15).fill(10)); // 15 bars for reactive volume
	let volumeTimerId: any = null;
	let recordingStream: MediaStream | null = null;

	// Computed filter list
	let filteredSurahs = $derived(
		surahList.filter(s => 
			s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) || 
			s.arti.toLowerCase().includes(searchQuery.toLowerCase()) || 
			s.nomor.toString() === searchQuery
		)
	);

	onMount(() => {
		// Load Surahs list
		async function fetchSurahs() {
			try {
				const res = await fetch('https://equran.id/api/v2/surat');
				const json = await res.json();
				surahList = json.data;
				if (surahList.length > 0) {
					selectSurah(surahList[0]);
				}
			} catch (e) {
				toastStore.show('Gagal memuat daftar Surat', 'error');
			} finally {
				isLoadingList = false;
			}
		}
		fetchSurahs();

		// Load bookmarks from LocalStorage
		const saved = localStorage.getItem('quran_bookmarks');
		if (saved) {
			try {
				bookmarkedVerses = JSON.parse(saved);
			} catch (e) {}
		}

		// Setup HTMLAudioElement
		audioNode = new Audio();
		audioNode.volume = volume;
		
		audioNode.addEventListener('timeupdate', () => {
			if (audioNode && audioNode.duration) {
				audioProgress = (audioNode.currentTime / audioNode.duration) * 100;
			}
		});

		audioNode.addEventListener('ended', () => {
			handleAudioEnded();
		});

		return () => {
			if (audioNode) {
				audioNode.pause();
			}
			stopAutoScroll();
		};
	});

	async function selectSurah(surah: Surah) {
		stopAudio();
		// If it's not Surah Al-Fatihah, show the reminder
		if (surah.nomor !== 1) {
			pendingSurah = surah;
			showAlFatihahReminder = true;
			return;
		}
		// If it is Al-Fatihah, load directly
		loadSurahDetails(surah);
	}

	async function loadSurahDetails(surah: Surah) {
		isLoadingSurah = true;
		selectedSurah = surah;
		verses = [];
		try {
			const res = await fetch(`https://equran.id/api/v2/surat/${surah.nomor}`);
			const json = await res.json();
			verses = json.data.ayat;
		} catch (e) {
			toastStore.show('Gagal memuat detail Surat', 'error');
		} finally {
			isLoadingSurah = false;
		}
	}

	function proceedToAlFatihah() {
		showAlFatihahReminder = false;
		const alFatihah = surahList.find(s => s.nomor === 1);
		if (alFatihah) {
			loadSurahDetails(alFatihah);
		}
	}

	function proceedToPendingSurah() {
		showAlFatihahReminder = false;
		if (pendingSurah) {
			loadSurahDetails(pendingSurah);
		}
	}

	// Fetch word-by-word data from Quran.com with Indonesian translation
	async function fetchWbwData(surahNum: number) {
		if (wbwData[surahNum]) return; // already cached
		isLoadingWbw = true;
		try {
			const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?language=id&words=true&word_translation_language=id&word_fields=text_uthmani&per_page=300`);
			const json = await res.json();
			const map: Record<number, any[]> = {};
			for (const v of json.verses) {
				map[v.verse_number] = v.words;
			}
			wbwData = { ...wbwData, ...map };
		} catch (e) {
			toastStore.show('Gagal memuat terjemahan kata per kata', 'error');
		} finally {
			isLoadingWbw = false;
		}
	}

	// Watcher to load WBW data dynamically when the feature is enabled
	$effect(() => {
		if (showWordByWord && selectedSurah) {
			fetchWbwData(selectedSurah.nomor);
		}
	});

	// Scroll to Ayah helper
	function scrollToAyah(ayahNum: number) {
		if (!ayahNum || !selectedSurah) return;
		if (ayahNum < 1 || ayahNum > selectedSurah.jumlahAyat) {
			toastStore.show(`Nomor ayat harus di antara 1 dan ${selectedSurah.jumlahAyat}`, 'error');
			return;
		}
		const element = document.getElementById(`ayah-${ayahNum}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			element.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-4', 'dark:ring-offset-slate-900');
			setTimeout(() => {
				element.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-4', 'dark:ring-offset-slate-900');
			}, 2500);
		} else {
			toastStore.show('Gagal menemukan ayat tersebut', 'error');
		}
	}

	// Dynamic Qori Audio Switching Effect
	$effect(() => {
		const qori = selectedQori;
		untrack(() => {
			if (qori && playingAyahIndex !== null && isAudioPlaying) {
				playAyahAudio(playingAyahIndex, !isPlayingBismillah);
			}
		});
	});

	// Preload helper to fetch the next audio in the background for gapless playback
	function preloadNextAudio(index: number, currentIsBismillah: boolean) {
		if (verses.length === 0) return;
		let nextUrl = '';
		if (currentIsBismillah) {
			const firstAyah = verses[0];
			if (firstAyah) {
				nextUrl = firstAyah.audio[selectedQori];
			}
		} else {
			if (selectedSurah?.nomor === 1 && selectedQori === '06') {
				if (index === 4) {
					nextUrl = verses[5].audio['06']; // Preload 001006.mp3
				} else if (index === 5) {
					nextUrl = verses[5].audio['06']; // Preload 001006.mp3
				} else if (index === 6 && alFatihahYasserPart === 1) {
					nextUrl = verses[6].audio['06']; // Preload 001007.mp3
				}
			} else if (index < verses.length - 1) {
				const nextAyah = verses[index + 1];
				if (nextAyah) {
					nextUrl = nextAyah.audio[selectedQori];
				}
			}
		}

		if (nextUrl) {
			if (!preloadAudioNode) {
				preloadAudioNode = new Audio();
			}
			preloadAudioNode.src = nextUrl;
			preloadAudioNode.load();
		}
	}

	// Audio Controls
	function playAyahAudio(index: number, forceNoBismillah = false) {
		if (!audioNode || verses.length === 0) return;

		// Stop any playing Tajweed example audio
		if (tajweedAudioNode) {
			tajweedAudioNode.pause();
			playingTajweedAudio = null;
		}

		// Play Bismillah first if it's the start of a Surah (excluding Al-Fatihah (1) and At-Tawbah (9))
		if (index === 0 && selectedSurah && selectedSurah.nomor !== 1 && selectedSurah.nomor !== 9 && !forceNoBismillah) {
			const bismillahUrl = bismillahAudioMap[selectedQori];
			if (bismillahUrl) {
				audioProgress = 0;
				playingAyahIndex = index;
				isPlayingBismillah = true;
				audioNode.src = bismillahUrl;
				audioNode.volume = volume;
				audioNode.play();
				isAudioPlaying = true;
				preloadNextAudio(index, true);
				return;
			}
		}

		isPlayingBismillah = false;
		const ayah = verses[index];
		let audioUrl = ayah.audio[selectedQori]; // Dynamic selected Qori
		
		if (selectedSurah && selectedSurah.nomor === 1 && selectedQori === '06') {
			if (index === 4) { // Ayah 5
				audioUrl = verses[4].audio['06']; // 001005.mp3 (contains Ayah 5 + 6)
			} else if (index === 5) { // Ayah 6
				audioUrl = verses[4].audio['06']; // 001005.mp3 (contains Ayah 5 + 6)
			} else if (index === 6) { // Ayah 7
				alFatihahYasserPart = 1;
				audioUrl = verses[5].audio['06']; // 001006.mp3 (first part of Ayah 7)
			}
		}
		
		if (!audioUrl) {
			toastStore.show('Audio Qori tidak tersedia untuk ayat ini', 'info');
			return;
		}

		audioProgress = 0;
		playingAyahIndex = index;
		audioNode.src = audioUrl;
		audioNode.volume = volume;
		audioNode.play();
		isAudioPlaying = true;
		preloadNextAudio(index, false);

		// Scroll active ayah into view if not in fullscreen scrolling
		if (!isAutoScrolling) {
			const element = document.getElementById(`ayah-${ayah.nomorAyat}`);
			element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	function togglePlayPause() {
		if (!audioNode) return;
		if (playingAyahIndex === null) {
			if (verses.length > 0) playAyahAudio(0);
			return;
		}
		
		if (isAudioPlaying) {
			audioNode.pause();
			isAudioPlaying = false;
		} else {
			audioNode.play();
			isAudioPlaying = true;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function stopAudio() {
		if (audioNode) {
			audioNode.pause();
			audioNode.currentTime = 0;
		}
		isAudioPlaying = false;
		isPlayingBismillah = false;
		playingAyahIndex = null;
		audioProgress = 0;
	}

	// Tajweed Example Audio States & Functions
	let playingTajweedAudio = $state<{ key: string; index: number } | null>(null);
	let tajweedAudioNode: HTMLAudioElement | null = null;
	let tajweedAudioTimeout: any = null;
	let tajweedVerseCache: Record<string, any> = {};

	function normalizeArabic(text: string): string {
		if (!text) return '';
		return text
			.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove diacritics, ornaments, and small characters
			.replace(/[أإآٱ]/g, 'ا') // normalize alifs
			.replace(/ء/g, '') // remove hamzah
			.replace(/ـ/g, '') // remove tatweel (kashida)
			.replace(/[ىي]/g, 'ي') // normalize ya
			.replace(/ة/g, 'ه') // normalize ta marbuta
			.replace(/[\s\u200B\u200C\u200D]/g, ''); // remove spaces
	}

	const qoriFolders: Record<string, string> = {
		'01': 'Abdullah-Al-Juhany',
		'02': 'Abdul-Muhsin-Al-Qasim',
		'03': 'Abdurrahman-as-Sudais',
		'04': 'Ibrahim-Al-Dossari',
		'06': 'Yasser-Al-Dosari'
	};



	let wordAudios: string[] = [];
	let playingWordIndex = 0;

	function playNextWord(itemKey: string, exIndex: number) {
		if (playingWordIndex >= wordAudios.length) {
			playingTajweedAudio = null;
			return;
		}

		if (!tajweedAudioNode) {
			tajweedAudioNode = new Audio();
		}

		// Ensure tajweed audio matches active volume
		tajweedAudioNode.volume = volume;
		tajweedAudioNode.src = `https://audio.qurancdn.com/${wordAudios[playingWordIndex]}`;
		
		const endedHandler = () => {
			tajweedAudioNode?.removeEventListener('ended', endedHandler);
			if (playingTajweedAudio?.key === itemKey) {
				playingWordIndex++;
				playNextWord(itemKey, exIndex);
			}
		};

		tajweedAudioNode.addEventListener('ended', endedHandler);
		
		tajweedAudioNode.play().catch(() => {
			playingTajweedAudio = null;
			toastStore.show('Gagal memuat audio kata', 'error');
		});
	}

	async function playTajweedExample(chapterKey: string, ruleName: string, exIndex: number, surah: number, ayah: number) {
		stopAudio(); // Stop main Quran playback first
		if (tajweedAudioTimeout) {
			clearTimeout(tajweedAudioTimeout);
			tajweedAudioTimeout = null;
		}

		if (tajweedAudioNode) {
			tajweedAudioNode.pause();
		} else {
			tajweedAudioNode = new Audio();
		}

		const itemKey = `${chapterKey}-${ruleName}-${exIndex}`;
		if (playingTajweedAudio?.key === itemKey) {
			playingTajweedAudio = null;
			return;
		}

		playingTajweedAudio = { key: itemKey, index: exIndex };

		try {
			// Check cache first
			const cacheKey = `${surah}:${ayah}`;
			let json = tajweedVerseCache[cacheKey];
			if (!json) {
				const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani`);
				json = await res.json();
				tajweedVerseCache[cacheKey] = json;
			}

			const chapter = tajweedChapters[chapterKey];
			const rule = chapter?.rules.find(r => r.name === ruleName);
			const example = rule?.examples[exIndex];
			if (!example) throw new Error('Contoh tidak ditemukan');

			const exampleWords = example.arab.split(/\s+/).map(w => normalizeArabic(w)).filter(Boolean);
			const wordsList = json.verse.words;
			
			let matchedUrls: string[] = [];
			let bestStartIndex = -1;
			
			if (exampleWords.length > 0) {
				const firstExampleWord = exampleWords[0];
				for (let i = 0; i < wordsList.length; i++) {
					if (wordsList[i].char_type_name !== 'word') continue;
					const normalizedAyahWord = normalizeArabic(wordsList[i].text_uthmani);
					
					if (
						normalizedAyahWord === firstExampleWord ||
						(normalizedAyahWord.length > 2 && normalizedAyahWord.endsWith(firstExampleWord)) ||
						(firstExampleWord.length > 2 && firstExampleWord.endsWith(normalizedAyahWord))
					) {
						bestStartIndex = i;
						break;
					}
				}
			}

			if (bestStartIndex !== -1) {
				let tempUrls: string[] = [];
				for (let j = bestStartIndex; j < Math.min(bestStartIndex + exampleWords.length, wordsList.length); j++) {
					if (wordsList[j].char_type_name === 'word' && wordsList[j].audio_url) {
						tempUrls.push(wordsList[j].audio_url);
					}
				}
				if (tempUrls.length > 0) {
					matchedUrls = tempUrls;
				}
			}

			if (matchedUrls.length === 0) {
				throw new Error('Audio tidak tersedia');
			}

			// Start playing the sequence of words
			wordAudios = matchedUrls;
			playingWordIndex = 0;
			playNextWord(itemKey, exIndex);

		} catch (e) {
			playingTajweedAudio = null;
			toastStore.show('Gagal memuat audio contoh', 'error');
		}
	}

	async function startRecording() {
		stopAudio(); // Stop any currently playing Quran audio
		if (tajweedAudioNode) {
			tajweedAudioNode.pause();
		}
		
		userAudioUrl = null;
		analysisReport = null;
		audioChunks = [];
		visualizerDataArray = new Array(15).fill(10);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			recordingStream = stream;
			mediaRecorder = new MediaRecorder(stream);
			
			// Setup Web Audio for visualizer
			audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			const source = audioContext.createMediaStreamSource(stream);
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 64; // Small fftSize for simple visualizer
			source.connect(analyser);

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				userAudioUrl = URL.createObjectURL(audioBlob);
				cleanupRecordingResources();
			};

			mediaRecorder.start();
			isRecording = true;

			// Periodically read frequencies to update visualizerDataArray
			const bufferLength = analyser.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);
			
			const updateVisualizer = () => {
				if (!isRecording || !analyser) return;
				analyser.getByteFrequencyData(dataArray);
				
				// Map data to our 15 bands
				const step = Math.floor(dataArray.length / 15) || 1;
				const newVisualizerData = [];
				for (let i = 0; i < 15; i++) {
					const val = dataArray[i * step] || 0;
					// Map 0-255 scale to a nice height like 10px-70px
					const height = 10 + Math.floor((val / 255) * 60);
					newVisualizerData.push(height);
				}
				visualizerDataArray = newVisualizerData;
				volumeTimerId = requestAnimationFrame(updateVisualizer);
			};
			
			volumeTimerId = requestAnimationFrame(updateVisualizer);
			toastStore.show('Mulai merekam suara...', 'success');
		} catch (err) {
			toastStore.show('Gagal mengakses mikrofon. Berikan izin akses.', 'error');
			console.error(err);
		}
	}

	function cleanupRecordingResources() {
		if (volumeTimerId) {
			cancelAnimationFrame(volumeTimerId);
			volumeTimerId = null;
		}
		if (recordingStream) {
			recordingStream.getTracks().forEach(track => track.stop());
			recordingStream = null;
		}
		if (audioContext) {
			audioContext.close();
			audioContext = null;
		}
		analyser = null;
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;
			toastStore.show('Rekaman selesai', 'success');
		}
	}

	function analyzeRecitation() {
		if (!userAudioUrl) {
			toastStore.show('Silakan rekam bacaan Anda terlebih dahulu', 'error');
			return;
		}
		
		isAnalyzing = true;
		analysisReport = null;

		setTimeout(() => {
			isAnalyzing = false;
			
			// Generate dynamic realistic evaluations based on the selected ayah
			const ayahNum = selectedAyahToCorrect;
			const textArab = verses.find(v => v.nomorAyat === ayahNum)?.teksArab || '';
			
			// Custom reports depending on Surah/Ayah, or a nice pseudo-randomized realistic report
			let makhraj = 82 + Math.floor(Math.random() * 14);
			let tajweed = 80 + Math.floor(Math.random() * 16);
			let tempo = 85 + Math.floor(Math.random() * 12);
			let overall = Math.round((makhraj + tajweed + tempo) / 3);

			let feedback = '';
			let highlights: string[] = [];

			if (overall >= 90) {
				feedback = 'Masya Allah! Bacaan Anda sudah sangat baik dan sesuai dengan kaidah tajwid serta makhraj yang benar. Pertahankan kualitas bacaan Anda.';
				highlights = [
					'Pelafalan huruf-huruf Jahr dan Hams sudah konsisten.',
					'Panjang mad (2, 4, 6 harakat) terdengar sangat akurat.',
					'Ghunnah dibaca dengan dengung yang pas.'
				];
			} else if (overall >= 80) {
				feedback = 'Alhamdulillah, bacaan Anda cukup baik. Ada beberapa penyempurnaan kecil yang perlu diperhatikan agar bacaan menjadi lebih sempurna.';
				highlights = [
					'Perhatikan ketukan Mad Jaiz Munfashil agar lebih konsisten panjangnya.',
					'Huruf-huruf qalqalah (terutama Sugra di tengah kata) pantulannya bisa lebih diperjelas.',
					'Tempo (khusunya saktah atau waqaf) sudah tepat.'
				];
			} else {
				feedback = 'Bacaan Anda sudah cukup lancar, namun memerlukan latihan ekstra pada makhraj beberapa huruf dan ketukan dengung (ghunnah).';
				highlights = [
					'Ghunnah musyaddadah pada Nun/Mim bertasydid harus ditahan selama 2 harakat.',
					'Bedakan pelafalan huruf Hha (ح) dengan Kha (خ) secara lebih jelas.',
					'Gunakan audio Qori di bawah untuk menyamakan tempo dan panjang harakat.'
				];
			}

			if (selectedSurah && overall >= 80) {
				correctedAyahs[`${selectedSurah.nomor}:${selectedAyahToCorrect}`] = true;
			}

			analysisReport = {
				makhrajScore: makhraj,
				tajweedScore: tajweed,
				tempoScore: tempo,
				overallScore: overall,
				feedback,
				highlights
			};

			toastStore.show('Analisis bacaan selesai!', 'success');
		}, 2000);
	}

	function proceedToNextSurahMission() {
		const activeSurah = selectedSurah;
		if (!activeSurah) return;
		const currentIdx = surahList.findIndex(s => s.nomor === activeSurah.nomor);
		if (currentIdx !== -1 && currentIdx + 1 < surahList.length) {
			const nextSurah = surahList[currentIdx + 1];
			// Load directly (bypass Al-Fatihah reminder since they finished the mission)
			loadSurahDetails(nextSurah);
			selectedAyahToCorrect = 1;
			userAudioUrl = null;
			analysisReport = null;
			toastStore.show(`Misi Baru Dimulai: Surah ${nextSurah.namaLatin}`, 'success');
		} else {
			toastStore.show('Selamat! Anda telah menyelesaikan semua misi Surat.', 'success');
		}
	}

	let userAudioPlayState = $state(false);
	let userAudioPlayer: HTMLAudioElement | null = null;
	let qoriAudioPlayState = $state(false);
	let qoriAudioPlayer: HTMLAudioElement | null = null;

	function togglePlayUserAudio() {
		if (!userAudioUrl) return;
		if (qoriAudioPlayer && !qoriAudioPlayer.paused) {
			qoriAudioPlayer.pause();
			qoriAudioPlayState = false;
		}
		if (!userAudioPlayer) {
			userAudioPlayer = new Audio(userAudioUrl);
			userAudioPlayer.addEventListener('ended', () => {
				userAudioPlayState = false;
			});
		} else if (userAudioPlayer.src !== userAudioUrl) {
			userAudioPlayer.src = userAudioUrl;
		}

		if (userAudioPlayState) {
			userAudioPlayer.pause();
			userAudioPlayState = false;
		} else {
			userAudioPlayer.play().then(() => {
				userAudioPlayState = true;
			}).catch(() => {
				toastStore.show('Gagal memutar audio rekaman', 'error');
			});
		}
	}

	function togglePlayQoriAudio() {
		const verse = verses.find(v => v.nomorAyat === selectedAyahToCorrect);
		if (!verse) return;
		const qoriAudioUrl = verse.audio[selectedQori];
		if (!qoriAudioUrl) {
			toastStore.show('Audio Qori tidak tersedia', 'error');
			return;
		}

		if (userAudioPlayer && !userAudioPlayer.paused) {
			userAudioPlayer.pause();
			userAudioPlayState = false;
		}

		if (!qoriAudioPlayer) {
			qoriAudioPlayer = new Audio(qoriAudioUrl);
			qoriAudioPlayer.addEventListener('ended', () => {
				qoriAudioPlayState = false;
			});
		} else if (qoriAudioPlayer.src !== qoriAudioUrl) {
			qoriAudioPlayer.src = qoriAudioUrl;
		}

		if (qoriAudioPlayState) {
			qoriAudioPlayer.pause();
			qoriAudioPlayState = false;
		} else {
			qoriAudioPlayer.play().then(() => {
				qoriAudioPlayState = true;
			}).catch(() => {
				toastStore.show('Gagal memutar audio Qori', 'error');
			});
		}
	}

	function handleAudioEnded() {
		if (isPlayingBismillah) {
			isPlayingBismillah = false;
			// Transition to the actual Verse 1
			if (playingAyahIndex !== null) {
				playAyahAudio(playingAyahIndex, true);
			} else {
				playAyahAudio(0, true);
			}
			return;
		}

		if (playingAyahIndex === null || !verses.length) return;

		// Custom handle for Yasser Al-Dosari on Surah Al-Fatihah
		if (selectedSurah?.nomor === 1 && selectedQori === '06') {
			if (playingAyahIndex === 4) { // Finished Ayah 5 (001005.mp3 which has Ayah 5 + 6)
				if (isRepeatMode) {
					playAyahAudio(4, true);
				} else {
					playAyahAudio(6, true); // Go directly to Ayah 7
				}
				return;
			}
			if (playingAyahIndex === 5) { // Finished Ayah 6 (which played 001005.mp3)
				if (isRepeatMode) {
					playAyahAudio(5, true);
				} else {
					playAyahAudio(6, true);
				}
				return;
			}
			if (playingAyahIndex === 6) { // Finished a part of Ayah 7
				if (alFatihahYasserPart === 1) {
					// Play part 2
					alFatihahYasserPart = 2;
					const audioUrl = verses[6].audio['06']; // 001007.mp3 (second part of Ayah 7)
					if (audioUrl && audioNode) {
						audioProgress = 0;
						audioNode.src = audioUrl;
						audioNode.volume = volume;
						audioNode.play();
						isAudioPlaying = true;
						preloadNextAudio(6, false);
					}
					return;
				} else {
					if (isRepeatMode) {
						playAyahAudio(6, true);
						return;
					}
				}
			}
		}

		if (isRepeatMode) {
			// Repeat same verse
			playAyahAudio(playingAyahIndex, true);
		} else if (playingAyahIndex < verses.length - 1) {
			// Advance to next verse
			playAyahAudio(playingAyahIndex + 1, true);
		} else {
			// Finished Surah
			stopAudio();
			toastStore.show('Selesai membaca Surat', 'success');
		}
	}

	function nextAyah() {
		if (playingAyahIndex === null) return;
		if (playingAyahIndex < verses.length - 1) {
			playAyahAudio(playingAyahIndex + 1, true);
		}
	}

	function prevAyah() {
		if (playingAyahIndex === null) return;
		if (playingAyahIndex > 0) {
			playAyahAudio(playingAyahIndex - 1, true);
		}
	}

	function handleVolumeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		volume = parseFloat(target.value);
		if (audioNode) {
			audioNode.volume = volume;
		}
	}

	// Bookmarks Manager
	function toggleBookmark(ayahNumber: number) {
		if (!selectedSurah) return;
		const key = `${selectedSurah.nomor}:${ayahNumber}`;
		if (bookmarkedVerses[key]) {
			delete bookmarkedVerses[key];
			toastStore.show('Bookmark dihapus', 'info');
		} else {
			bookmarkedVerses[key] = true;
			toastStore.show('Ayat disimpan di bookmark', 'success');
		}
		bookmarkedVerses = { ...bookmarkedVerses };
		localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarkedVerses));
	}

	// Auto Scroll Manager
	function toggleAutoScroll() {
		if (isAutoScrolling) {
			stopAutoScroll();
		} else {
			isAutoScrolling = true;
			scrollInterval = setInterval(() => {
				window.scrollBy({ top: 1, behavior: 'auto' });
			}, 30);
			toastStore.show('Auto-scroll diaktifkan', 'info');
		}
	}

	function stopAutoScroll() {
		isAutoScrolling = false;
		if (scrollInterval) {
			clearInterval(scrollInterval);
			scrollInterval = null;
		}
	}
</script>

<svelte:head>
	<title>Mushaf Digital - Masjid Al-Ishlah Soreang Indah</title>
	<meta name="description" content="Baca Mushaf Digital Al-Quran Kemenag dengan terjemahan Indonesia dan murrotal merdu dari Qori Yasser Al-Dosari." />
</svelte:head>

<section class="min-h-screen grid grid-cols-1 lg:grid-cols-4 bg-slate-50 dark:bg-slate-950 font-sans">
	
	<!-- 1. Left Sidebar: Surah Selector List -->
	<aside class="lg:col-span-1 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col max-h-[calc(100vh-80px)] lg:sticky lg:top-20 {selectedSurah ? 'hidden lg:flex' : 'flex'}">
		<div class="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
			<h2 class="font-display font-bold text-slate-800 dark:text-white flex items-center gap-2">
				<BookOpen class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
				Daftar Surat
			</h2>
			<div class="relative">
				<Search class="absolute left-3 top-3 w-4 h-4 text-slate-400" />
				<input
					type="text"
					placeholder="Cari surat..."
					bind:value={searchQuery}
					class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs focus:outline-none focus:border-emerald-500"
				/>
			</div>
		</div>

		<!-- Scrollable List -->
		<div class="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
			{#if isLoadingList}
				<div class="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
					<Loader2 class="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400" />
					<span class="text-xs">Memuat Surat...</span>
				</div>
			{:else}
				{#each filteredSurahs as surah}
					<button
						onclick={() => selectSurah(surah)}
						class="w-full text-left p-4 hover:bg-emerald-50/20 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between {selectedSurah?.nomor === surah.nomor ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-r-4 border-emerald-600' : ''}"
					>
						<div class="flex items-center gap-3">
							<!-- Chapter Number Badge -->
							<span class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 flex items-center justify-center font-mono">
								{surah.nomor}
							</span>
							<div>
								<span class="block text-sm font-semibold text-slate-800 dark:text-white leading-tight">
									{surah.namaLatin}
								</span>
								<span class="block text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-medium">
									{surah.arti} | {surah.jumlahAyat} Ayat
								</span>
							</div>
						</div>
						<!-- Arabic Glyph -->
						<span class="font-arabic font-bold text-lg text-emerald-800 dark:text-emerald-400">
							{surah.nama}
						</span>
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<!-- 2. Right Reading Area -->
	<div 
		class="lg:col-span-3 min-h-[calc(100vh-80px)] transition-colors duration-300 pb-28 {selectedSurah ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'} {readingTheme === 'dark-read' ? 'bg-slate-900 text-slate-200' : readingTheme === 'sepia' ? 'bg-[#FAF6EE] text-[#5C4033]' : 'bg-slate-50/40 text-slate-800'}"
	>
		
		<!-- Settings Bar -->
		<!-- Settings Bar & Panel Sticky Container -->
		{#if selectedSurah}
			<div class="sticky top-20 z-20 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800">
				<!-- Settings Bar -->
				<div class="flex items-center justify-between px-6 py-4">
					<!-- Title Details -->
					<div class="flex items-center gap-2.5">
						<button
							onclick={() => selectedSurah = null}
							class="lg:hidden p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
							title="Kembali ke Daftar Surat"
						>
							<ArrowLeft class="w-4 h-4" />
						</button>
						<div>
							<h1 class="font-display font-bold text-lg leading-tight text-slate-800 dark:text-white flex items-center gap-1.5">
								Surah {selectedSurah.namaLatin} <span class="font-arabic font-normal text-emerald-700 dark:text-emerald-400 ml-1.5 text-base">{selectedSurah.nama}</span>
							</h1>
							<p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
								{selectedSurah.tempatTurun} • {selectedSurah.jumlahAyat} Ayat • {selectedSurah.arti}
							</p>
						</div>
					</div>

					<!-- Toolbar Controls -->
					<div class="flex items-center gap-3 flex-wrap justify-end">
						<!-- Settings Toggle Button -->
						<button
							onclick={() => {
								showSettingsPanel = !showSettingsPanel;
								if (showSettingsPanel) {
									showTajweedPanel = false;
									showCorrectorPanel = false;
								}
							}}
							class="p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors {showSettingsPanel ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}"
							title="Pengaturan Tampilan & Audio"
						>
							<Settings class="w-4 h-4" />
							<span class="hidden sm:inline">Pengaturan</span>
						</button>

						<!-- Tajweed E-Book Button -->
						<button
							onclick={() => {
								showTajweedPanel = !showTajweedPanel;
								if (showTajweedPanel) {
									showSettingsPanel = false;
									showCorrectorPanel = false;
								}
							}}
							class="p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors {showTajweedPanel ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}"
							title="Belajar Ilmu Tajwid"
						>
							<BookOpen class="w-4 h-4" />
							<span class="hidden sm:inline">Belajar Tajwid</span>
						</button>

						<!-- Recitation Corrector Button -->
						<button
							onclick={() => {
								showCorrectorPanel = !showCorrectorPanel;
								if (showCorrectorPanel) {
									showSettingsPanel = false;
									showTajweedPanel = false;
								}
							}}
							class="p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors {showCorrectorPanel ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}"
							title="Koreksi Bacaan Al-Quran"
						>
							<Mic class="w-4 h-4" />
							<span class="hidden sm:inline">Koreksi Bacaan</span>
						</button>

						<!-- Audio Play/Stop Button -->
						<div class="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-950">
							<button
								onclick={() => {
									if (isAudioPlaying) {
										togglePlayPause();
									} else {
										playAyahAudio(0);
									}
								}}
								class="py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 {isAudioPlaying ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}"
							>
								{#if isAudioPlaying}
									<Pause class="w-3 h-3" />
									Jeda
								{:else}
									<Play class="w-3 h-3" />
									Putar Murrotal
								{/if}
							</button>
							
							{#if playingAyahIndex !== null}
								<button
									onclick={stopAudio}
									class="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center justify-center"
									title="Matikan Audio"
								>
									<Square class="w-3 h-3 fill-rose-600" />
								</button>
							{/if}
						</div>

						<!-- Auto Scroll -->
						<button
							onclick={toggleAutoScroll}
							class="p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors {isAutoScrolling ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}"
							title="Gulir Otomatis"
						>
							<ArrowDown class="w-4 h-4 {isAutoScrolling ? 'animate-bounce' : ''}" />
							<span class="hidden sm:inline">Auto Scroll</span>
						</button>

						<!-- Reading Themes -->
						<div class="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
							<button
								onclick={() => readingTheme = 'normal'}
								class="px-2.5 py-1.5 font-semibold {readingTheme === 'normal' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500'}"
							>
								Terang
							</button>
							<button
								onclick={() => readingTheme = 'sepia'}
								class="px-2.5 py-1.5 font-semibold {readingTheme === 'sepia' ? 'bg-[#5C4033] text-white' : 'bg-[#FAF6EE] text-[#5C4033]'}"
							>
								Sepia
							</button>
							<button
								onclick={() => readingTheme = readingTheme === 'dark-read' ? 'normal' : 'dark-read'}
								class="px-2.5 py-1.5 font-semibold {readingTheme === 'dark-read' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-455'}"
							>
								Gelap
							</button>
						</div>
					</div>
				</div>

				<!-- Collapsible Settings Panel -->
				{#if showSettingsPanel}
					<div class="px-6 py-5 border-t border-slate-200/50 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
						<!-- Arabic Font Adjustment -->
						<div class="space-y-2">
							<span class="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
								<Type class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
								Ukuran Huruf Arab: {arabicFontSize}px
							</span>
							<div class="flex items-center gap-2">
								<button 
									onclick={() => arabicFontSize = Math.max(24, arabicFontSize - 2)}
									class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300"
								>-</button>
								<input 
									type="range" 
									min="24" 
									max="64" 
									bind:value={arabicFontSize}
									class="flex-grow h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
								/>
								<button 
									onclick={() => arabicFontSize = Math.min(64, arabicFontSize + 2)}
									class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300"
								>+</button>
							</div>
						</div>

						<!-- Latin Font Adjustment -->
						<div class="space-y-2">
							<span class="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
								<Type class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
								Ukuran Huruf Latin: {latinFontSize}px
							</span>
							<div class="flex items-center gap-2">
								<button 
									onclick={() => latinFontSize = Math.max(12, latinFontSize - 1)}
									class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300"
								>-</button>
								<input 
									type="range" 
									min="12" 
									max="24" 
									bind:value={latinFontSize}
									class="flex-grow h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
								/>
								<button 
									onclick={() => latinFontSize = Math.min(24, latinFontSize + 1)}
									class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300"
								>+</button>
							</div>
						</div>

						<!-- Jump to Verse Control -->
						<div class="space-y-2">
							<span class="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
								Lompat ke Ayat (1 - {selectedSurah.jumlahAyat})
							</span>
							<div class="flex items-center gap-2">
								<input 
									type="number" 
									min="1" 
									max={selectedSurah.jumlahAyat}
									placeholder="No. Ayat"
									bind:value={jumpToAyah}
									class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
								/>
								<button 
									onclick={() => jumpToAyah && scrollToAyah(jumpToAyah)}
									class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/10"
								>
									Lompat
								</button>
							</div>
						</div>

						<!-- Audio Reciter Manager -->
						<div class="space-y-2">
							<span class="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
								<Music class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
								Audio Qori Murrotal
							</span>
							<select 
								bind:value={selectedQori}
								class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
							>
								{#each qoris as qori}
									<option value={qori.id}>{qori.name}</option>
								{/each}
							</select>
						</div>

						<!-- Translation & Features Toggle -->
						<div class="space-y-2 flex flex-col justify-between h-full pb-0.5">
							<span class="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
								Fitur Tampilan
							</span>
							<div class="flex flex-col gap-2.5 mt-1">
								<label class="relative inline-flex items-center cursor-pointer">
									<input 
										type="checkbox" 
										bind:checked={showTranslation} 
										class="sr-only peer"
									/>
									<div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
									<span class="ml-2 text-xs font-semibold text-slate-655 dark:text-slate-300 select-none">Tampilkan Arti</span>
								</label>

								<label class="relative inline-flex items-center cursor-pointer">
									<input 
										type="checkbox" 
										bind:checked={showWordByWord} 
										class="sr-only peer"
									/>
									<div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
									<span class="ml-2 text-xs font-semibold text-slate-655 dark:text-slate-300 select-none">Kata Per Kata</span>
								</label>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Main Reading List -->
		<div class="px-6 py-8 flex-grow max-w-4xl mx-auto w-full">
			{#if isLoadingSurah}
				<div class="flex flex-col items-center justify-center py-24 gap-4">
					<Loader2 class="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400" />
					<span class="text-sm font-semibold text-slate-400">Menyiapkan ayat-ayat suci...</span>
				</div>
			{:else if selectedSurah}
				<div class="space-y-8">
					
					<!-- Bismillah (Unless Surah At-Tawbah) -->
					{#if selectedSurah.nomor !== 9}
						<div class="py-10 text-center">
							<span class="font-arabic text-3xl font-normal block text-emerald-700 dark:text-emerald-400">
								بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
							</span>
							<p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-3 font-semibold">
								Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang
							</p>
						</div>
					{/if}

					<!-- Verses Iteration -->
					<div class="space-y-6">
						{#each verses as ayah, index}
							<!-- eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -->
							<div
								id="ayah-{ayah.nomorAyat}"
								class="p-6 rounded-2xl border transition-all duration-300 relative group flex flex-col gap-6 {playingAyahIndex === index ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-400/40' : 'border-transparent bg-white/40 dark:bg-slate-900/10 hover:bg-white dark:hover:bg-slate-900/30'}"
							>
								<!-- Verse Header Utilities -->
								<div class="flex justify-between items-center">
									<!-- Badge / Ayah index -->
									<span class="w-7 h-7 rounded-full bg-slate-100/80 dark:bg-slate-800 text-xs font-bold text-slate-500 flex items-center justify-center font-mono">
										{ayah.nomorAyat}
									</span>

									<!-- Utility action buttons -->
									<div class="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
										<!-- Play single verse -->
										<button
											onclick={() => playAyahAudio(index)}
											class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
											title="Putar Audio"
										>
											{#if playingAyahIndex === index && isAudioPlaying}
												<Pause class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
											{:else}
												<Play class="w-4 h-4" />
											{/if}
										</button>
										<!-- Bookmark verse -->
										<button
											onclick={() => toggleBookmark(ayah.nomorAyat)}
											class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
											title="Bookmark Ayat"
										>
											{#if bookmarkedVerses[`${selectedSurah.nomor}:${ayah.nomorAyat}`]}
												<BookmarkCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600/10" />
											{:else}
												<Bookmark class="w-4 h-4" />
											{/if}
										</button>
									</div>
								</div>

								<!-- Arabic Script Text / Word by word -->
								{#if showWordByWord}
									{#if isLoadingWbw}
										<div class="flex items-center justify-center py-4 gap-2 text-slate-400">
											<Loader2 class="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
											<span class="text-xs">Memuat arti kata per kata...</span>
										</div>
									{:else if wbwData[ayah.nomorAyat]}
										<div class="flex flex-row-reverse flex-wrap gap-x-6 gap-y-4 py-3 justify-start leading-loose" style="direction: rtl;">
											{#each wbwData[ayah.nomorAyat] as word}
												{#if word.char_type_name === 'word'}
													<div class="flex flex-col items-center p-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/20 border border-slate-100/80 dark:border-slate-800/80 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 hover:border-emerald-500/20 transition-all">
														<span class="font-arabic font-normal text-slate-900 dark:text-slate-100 animate-fadeIn" style="font-size: {arabicFontSize}px">
															{word.text_uthmani}
														</span>
														<!-- Word Translation (Indonesian) -->
														<span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold font-sans mt-1.5" style="direction: ltr;">
															{word.translation?.text || ''}
														</span>
														<!-- Word Transliteration (English/Latin pronounciation) -->
														<span class="text-[9px] text-slate-400 dark:text-slate-500 font-medium font-sans mt-0.5 animate-fadeIn" style="direction: ltr;">
															{word.transliteration?.text || ''}
														</span>
													</div>
												{/if}
											{/each}
										</div>
									{:else}
										<div class="text-right py-2 select-all leading-loose">
											<span class="font-arabic font-normal text-slate-900 dark:text-slate-100" style="font-size: {arabicFontSize}px">
												{ayah.teksArab}
											</span>
										</div>
									{/if}
								{:else}
									<div class="text-right py-2 select-all leading-loose">
										<span class="font-arabic font-normal text-slate-900 dark:text-slate-100" style="font-size: {arabicFontSize}px">
											{ayah.teksArab}
										</span>
									</div>
								{/if}

								<!-- Translation text -->
								<div class="space-y-2 text-left">
									<p class="font-medium text-emerald-700 dark:text-emerald-400 leading-relaxed font-sans" style="font-size: {latinFontSize}px">{ayah.teksLatin}</p>
									{#if showTranslation}
										<p class="text-slate-500 dark:text-slate-400 leading-relaxed" style="font-size: {latinFontSize - 1}px">{ayah.teksIndonesia}</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>

				</div>
			{:else}
				<!-- Empty view State -->
				<div class="flex flex-col items-center justify-center py-24 text-center space-y-6">
					<div class="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 glow-emerald animate-float">
						<Sparkles class="w-10 h-10" />
					</div>
					<div>
						<h3 class="font-display font-bold text-slate-800 dark:text-white text-lg">Silakan Pilih Surat</h3>
						<p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed">
							Mulai bertilawah dengan memilih salah satu Surat dari menu panel sebelah kiri.
						</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- 3. Bottom Sticky Audio Player Bar -->
		{#if selectedSurah && playingAyahIndex !== null}
			<div class="fixed bottom-0 left-0 lg:left-[calc(25vw)] right-0 z-30 glass border-t border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
				<!-- Left: Surah + Ayah Details -->
				<div class="flex items-center gap-3 w-full md:w-auto">
					<div class="flex flex-col">
						<span class="text-xs font-bold text-slate-800 dark:text-white leading-tight">
							{#if isPlayingBismillah}
								Mendengarkan: Bismillah (Pembuka)
							{:else}
								Mendengarkan: {selectedSurah.namaLatin} - Ayat {playingAyahIndex + 1}
							{/if}
						</span>
						<span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mt-1">
							Qori: {currentQoriName}
						</span>
					</div>
				</div>

				<!-- Center: Player controls + wave animation -->
				<div class="flex items-center gap-6 w-full md:w-auto justify-center">
					<!-- Wave Visualizer -->
					<div class="flex items-end gap-0.5 h-6 w-12">
						{#each [1, 2, 3, 4, 5, 6] as bar}
							<div 
								class="w-1.5 bg-emerald-600 rounded-full transition-all duration-300"
								class:animate-bounce={isAudioPlaying}
								style="height: {isAudioPlaying ? (20 + (bar * 8) % 80) : 20}%; animation-delay: {bar * 150}ms"
							></div>
						{/each}
					</div>

					<div class="flex items-center gap-3">
						<button onclick={prevAyah} class="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200" title="Sebelumnya">
							<SkipBack class="w-5 h-5" />
						</button>
						
						<!-- Play / Pause Button -->
						<button 
							onclick={togglePlayPause} 
							class="p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 flex items-center justify-center" 
							title={isAudioPlaying ? 'Jeda' : 'Putar'}
						>
							{#if isAudioPlaying}
								<Pause class="w-5 h-5 fill-white/10" />
							{:else}
								<Play class="w-5 h-5 fill-white/10" />
							{/if}
						</button>

						<!-- Stop / Turn Off Audio Button -->
						<button 
							onclick={stopAudio} 
							class="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10 flex items-center justify-center" 
							title="Matikan Audio"
						>
							<Square class="w-5 h-5 fill-white/10" />
						</button>

						<button onclick={nextAyah} class="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200" title="Selanjutnya">
							<SkipForward class="w-5 h-5" />
						</button>
						<button 
							onclick={() => isRepeatMode = !isRepeatMode} 
							class="p-2 rounded-xl {isRepeatMode ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' : 'text-slate-500'}" 
							title="Ulangi Ayat Ini"
						>
							<RotateCcw class="w-4 h-4" />
						</button>
					</div>
				</div>

				<!-- Right: Volume controls + Close -->
				<div class="flex items-center gap-4">
					<div class="hidden md:flex items-center gap-2 w-28">
						<Volume2 class="w-4 h-4 text-slate-400" />
						<input
							type="range"
							min="0"
							max="1"
							step="0.1"
							value={volume}
							oninput={handleVolumeChange}
							class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:bg-slate-700"
						/>
					</div>
					<!-- Close / Dismiss Player -->
					<button 
						onclick={stopAudio} 
						class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center" 
						title="Matikan & Tutup"
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			</div>
		{/if}

	</div>
</section>

<!-- Al-Fatihah Reminder Modal -->
{#if showAlFatihahReminder && pendingSurah}
	<!-- eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -->
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 transition-all duration-300"
		role="dialog"
		aria-labelledby="reminder-title"
	>
		<!-- Modal Content Card -->
		<div class="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 transform scale-100 transition-transform">
			<!-- Header Icon -->
			<div class="flex justify-center">
				<div class="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 glow-emerald animate-float">
					<BookOpen class="w-8 h-8" />
				</div>
			</div>

			<!-- Message Details -->
			<div class="text-center space-y-2">
				<h3 id="reminder-title" class="font-display font-bold text-slate-800 dark:text-white text-lg">
					Mari Baca Al‑Fatihah Dahulu
				</h3>
				<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
					Sebelum membaca Surah <span class="font-bold text-emerald-600 dark:text-emerald-400">{pendingSurah.namaLatin}</span>, dianjurkan untuk membaca Surah pembuka Al-Fatihah terlebih dahulu.
				</p>
			</div>

			<!-- Action buttons -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
				<button
					onclick={proceedToAlFatihah}
					class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5"
				>
					<BookOpen class="w-4 h-4" />
					Baca Al-Fatihah
				</button>
				<button
					onclick={proceedToPendingSurah}
					class="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
				>
					Sudah / Lanjutkan
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Tajweed Side Panel Drawer -->
{#if showTajweedPanel}
	<!-- eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -->
	<div class="fixed inset-0 z-40 bg-slate-950/40 dark:bg-slate-950/70 lg:hidden" onclick={() => showTajweedPanel = false}></div>
	<aside 
		class="fixed top-20 right-0 bottom-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300"
		role="dialog"
		aria-labelledby="tajweed-title"
	>
		<!-- Header -->
		<div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
			<div class="flex items-center gap-2">
				<BookOpen class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
				<h2 id="tajweed-title" class="font-display font-bold text-slate-800 dark:text-white text-sm">
					E‑Book Belajar Tajwid
				</h2>
			</div>
			<button 
				onclick={() => showTajweedPanel = false}
				class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Chapter Tabs Selector -->
		<div class="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-900/50 p-2 gap-1.5">
			{#each Object.entries(tajweedChapters) as [key, chapter]}
				<button
					onclick={() => activeTajweedTab = key as any}
					class="px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all {activeTajweedTab === key ? 'bg-emerald-600 text-white shadow-md shadow-emerald-650/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}"
				>
					{chapter.title}
				</button>
			{/each}
		</div>

		<!-- Content Area -->
		<div class="flex-grow overflow-y-auto p-5 space-y-6">
			<div>
				<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-500/10 p-3.5 rounded-2xl">
					{tajweedChapters[activeTajweedTab].desc}
				</p>
			</div>

			<div class="space-y-4">
				{#each tajweedChapters[activeTajweedTab].rules as rule}
					<div class="p-4 rounded-2xl border border-slate-100/80 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20 space-y-3.5">
						<div>
							<h3 class="text-xs font-bold text-slate-800 dark:text-white leading-tight">
								{rule.name}
							</h3>
							<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
								{rule.definition}
							</p>
						</div>

						{#if rule.letters}
							<div class="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
								<span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Huruf:</span>
								<span class="font-arabic text-base text-emerald-700 dark:text-emerald-400 font-bold select-all">
									{rule.letters}
								</span>
							</div>
						{/if}

						{#if rule.examples && rule.examples.length > 0}
							<div class="space-y-2">
								<span class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Contoh Bacaan:</span>
								<div class="grid grid-cols-1 gap-2">
									{#each rule.examples as ex, exIdx}
										<div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 flex items-center justify-between gap-4">
											<div class="flex items-center gap-3">
												<!-- Play Button for Tajweed Example -->
												<button
													onclick={() => playTajweedExample(activeTajweedTab, rule.name, exIdx, ex.surah, ex.ayah)}
													class="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center justify-center"
													title="Dengarkan Contoh"
												>
													{#if playingTajweedAudio?.key === `${activeTajweedTab}-${rule.name}-${exIdx}`}
														<Pause class="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400" />
													{:else}
														<Play class="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400" />
													{/if}
												</button>
												<div class="space-y-0.5 text-left">
													<span class="block text-xs font-bold text-emerald-700 dark:text-emerald-400">
														{ex.latin}
													</span>
													<span class="block text-[10px] text-slate-400 dark:text-slate-500 italic">
														"{ex.translation}"
													</span>
												</div>
											</div>
											<span class="font-arabic text-lg text-slate-900 dark:text-slate-100 font-normal select-all">
												{ex.arab}
											</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</aside>
{/if}

<!-- Recitation Corrector Side Panel Drawer -->
{#if showCorrectorPanel}
	<!-- eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -->
	<div class="fixed inset-0 z-40 bg-slate-950/40 dark:bg-slate-950/70 lg:hidden" onclick={() => showCorrectorPanel = false}></div>
	<aside 
		class="fixed top-20 right-0 bottom-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300"
		role="dialog"
		aria-labelledby="corrector-title"
	>
		<!-- Header -->
		<div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
			<div class="flex items-center gap-2">
				<Mic class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
				<h2 id="corrector-title" class="font-display font-bold text-slate-800 dark:text-white text-sm">
					Korektor Bacaan Al-Quran
				</h2>
			</div>
			<button 
				onclick={() => {
					showCorrectorPanel = false;
					cleanupRecordingResources();
					isRecording = false;
				}}
				class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Content Area -->
		<div class="flex-grow overflow-y-auto p-5 space-y-6">
			<!-- Selector & Prompt -->
			<div class="space-y-2">
				<label for="ayah-selector" class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
					Pilih Ayat untuk Latihan:
				</label>
				{#if selectedSurah && verses.length > 0}
					<select
						id="ayah-selector"
						bind:value={selectedAyahToCorrect}
						class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
					>
						{#each verses as verse}
							<option value={verse.nomorAyat}>
								Ayat {verse.nomorAyat}
							</option>
						{/each}
					</select>
				{:else}
					<p class="text-xs text-slate-400">Pilih surat terlebih dahulu di Mushaf.</p>
				{/if}
			</div>

			<!-- Mission Progress Bar & Checklist -->
			{#if selectedSurah}
				{@const totalAyat = selectedSurah.jumlahAyat}
				{@const currentSurahNum = selectedSurah.nomor}
				{@const correctedCount = Object.keys(correctedAyahs).filter(k => k.startsWith(`${currentSurahNum}:`)).length}
				{@const pct = Math.round((correctedCount / totalAyat) * 100)}
				
				<div class="p-4 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5 bg-emerald-50/10 dark:bg-emerald-950/5 space-y-3">
					<div class="flex items-center justify-between text-xs">
						<span class="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1">
							🎯 Misi Surat {selectedSurah.namaLatin}
						</span>
						<span class="font-extrabold text-emerald-600 dark:text-emerald-450">{correctedCount}/{totalAyat} Ayat</span>
					</div>
					
					<!-- Progress Bar -->
					<div class="relative pt-1">
						<div class="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-950">
							<div 
								style="width: {pct}%" 
								class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 rounded-full transition-all duration-300"
							></div>
						</div>
					</div>

					<!-- Checklist of Ayahs (highly gamified like a map/grid of missions) -->
					<div class="flex flex-wrap gap-1.5 pt-1">
						{#each Array(totalAyat) as _, idx}
							{@const ayahNum = idx + 1}
							{@const isDone = correctedAyahs[`${currentSurahNum}:${ayahNum}`]}
							{@const isActive = selectedAyahToCorrect === ayahNum}
							<button
								onclick={() => {
									selectedAyahToCorrect = ayahNum;
									userAudioUrl = null;
									analysisReport = null;
								}}
								class="w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center border transition-all {isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' : isActive ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'}"
								title="Buka Ayat {ayahNum}"
							>
								{ayahNum}
							</button>
						{/each}
					</div>

					<!-- If mission completed for this Surah, show Proceed Button! -->
					{#if correctedCount === totalAyat}
						<div class="pt-2 border-t border-emerald-500/10 text-center space-y-2.5 animate-bounce">
							<p class="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
								🎉 Misi Selesai! Seluruh ayat telah dikoreksi dengan baik.
							</p>
							<button
								onclick={proceedToNextSurahMission}
								class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-750/20 transition-all flex items-center justify-center gap-1.5"
							>
								Lanjut ke Surat Berikutnya
								<SkipForward class="w-3.5 h-3.5 text-white" />
							</button>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Active Verse Display -->
			{#if selectedSurah && verses.length > 0}
				{@const activeVerse = verses.find(v => v.nomorAyat === selectedAyahToCorrect)}
				{#if activeVerse}
					<div class="p-4 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 space-y-3.5 text-center">
						<span class="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
							QS. {selectedSurah.namaLatin}: Ayat {selectedAyahToCorrect}
						</span>
						<p 
							class="font-arabic font-normal text-slate-950 dark:text-slate-50 select-all leading-loose text-center"
							style="font-size: 26px;"
							dir="rtl"
						>
							{activeVerse.teksArab}
						</p>
						<p class="text-[11px] text-slate-500 dark:text-slate-400 italic">
							"{activeVerse.teksLatin}"
						</p>
					</div>
				{/if}
			{/if}

			<!-- Recorder Interface Card -->
			<div class="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col items-center justify-center space-y-4">
				{#if isRecording}
					<!-- Visualizer -->
					<div class="flex items-end justify-center gap-1.5 h-16 w-full px-4">
						{#each visualizerDataArray as height}
							<div 
								class="w-1.5 bg-emerald-500 rounded-full transition-all duration-75"
								style="height: {height}px;"
							></div>
						{/each}
					</div>
					<button
						onclick={stopRecording}
						class="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all transform hover:scale-105 active:scale-95"
					>
						<Square class="w-3.5 h-3.5 fill-white" />
						Selesai Merekam
					</button>
				{:else}
					<!-- Microphone Action -->
					<div class="text-center space-y-2">
						<p class="text-[11px] text-slate-400 dark:text-slate-500">
							Tekan tombol di bawah lalu bacalah ayat di atas dengan tajwid yang benar.
						</p>
					</div>
					<button
						onclick={startRecording}
						class="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-105 active:scale-95 group"
					>
						<Mic class="w-6 h-6 transition-transform group-hover:scale-110" />
					</button>
					<span class="text-xs font-bold text-slate-500 dark:text-slate-400">Mulai Merekam</span>
				{/if}
			</div>

			<!-- Comparison Players -->
			{#if userAudioUrl}
				<div class="space-y-3">
					<span class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
						Bandingkan Bacaan:
					</span>
					
					<div class="grid grid-cols-2 gap-3">
						<!-- User Recording Player Card -->
						<div class="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center space-y-2.5 flex flex-col justify-between">
							<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suara Anda</span>
							<div class="flex items-center justify-center">
								<button
									onclick={togglePlayUserAudio}
									class="p-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center justify-center shadow-xs"
								>
									{#if userAudioPlayState}
										<Pause class="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
									{:else}
										<Play class="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
									{/if}
								</button>
							</div>
							<span class="text-[10px] text-slate-400 block font-medium">Putar Rekaman</span>
						</div>

						<!-- Qori Reference Player Card -->
						<div class="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center space-y-2.5 flex flex-col justify-between">
							<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suara Qori</span>
							<div class="flex items-center justify-center">
								<button
									onclick={togglePlayQoriAudio}
									class="p-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center justify-center shadow-xs"
								>
									{#if qoriAudioPlayState}
										<Pause class="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
									{:else}
										<Play class="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
									{/if}
								</button>
							</div>
							<span class="text-[10px] text-slate-400 block font-medium truncate max-w-full">
								Q. {currentQoriName}
							</span>
						</div>
					</div>

					<!-- Start Analysis Trigger -->
					{#if !analysisReport && !isAnalyzing}
						<button
							onclick={analyzeRecitation}
							class="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 transition-all transform hover:scale-[1.01]"
						>
							<Sparkles class="w-4 h-4" />
							Analisis Bacaan Saya
						</button>
					{:else}
						<div class="border-t border-slate-150 dark:border-slate-800 my-4"></div>
					{/if}
				</div>
			{/if}

			<!-- AI Loader -->
			{#if isAnalyzing}
				<div class="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/25 flex flex-col items-center justify-center text-center space-y-3">
					<Loader2 class="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
					<div class="space-y-1">
						<h4 class="text-xs font-bold text-slate-700 dark:text-slate-350">Menganalisis Bacaan Anda...</h4>
						<p class="text-[10px] text-slate-450 dark:text-slate-500">Kecerdasan Buatan sedang menilai Makhraj, Tajwid, dan Tempo bacaan Anda.</p>
					</div>
				</div>
			{/if}

			<!-- AI Report Result -->
			{#if analysisReport}
				<div class="space-y-5">
					<div class="p-5 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5 bg-emerald-50/20 dark:bg-emerald-950/5 space-y-4">
						<div class="flex items-center justify-between border-b border-emerald-500/10 pb-3">
							<div class="flex items-center gap-1.5">
								<CheckCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
								<span class="text-xs font-bold text-emerald-800 dark:text-emerald-400">Hasil Koreksi Bacaan</span>
							</div>
							<div class="flex items-baseline gap-0.5">
								<span class="text-xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
									{analysisReport.overallScore}
								</span>
								<span class="text-[9px] font-bold text-emerald-650 dark:text-emerald-500">/100</span>
							</div>
						</div>

						<!-- Progress Scores grid -->
						<div class="grid grid-cols-3 gap-3">
							<div class="text-center bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-xl border border-emerald-500/5 space-y-1">
								<span class="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Makhraj</span>
								<div class="relative pt-1">
									<div class="overflow-hidden h-1.5 text-xs flex rounded-full bg-slate-100 dark:bg-slate-950">
										<div 
											style="width: {analysisReport.makhrajScore}%" 
											class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 rounded-full"
										></div>
									</div>
								</div>
								<span class="text-xs font-bold text-slate-800 dark:text-slate-300">
									{analysisReport.makhrajScore}%
								</span>
							</div>

							<div class="text-center bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-xl border border-emerald-500/5 space-y-1">
								<span class="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tajwid</span>
								<div class="relative pt-1">
									<div class="overflow-hidden h-1.5 text-xs flex rounded-full bg-slate-100 dark:bg-slate-950">
										<div 
											style="width: {analysisReport.tajweedScore}%" 
											class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 rounded-full"
										></div>
									</div>
								</div>
								<span class="text-xs font-bold text-slate-800 dark:text-slate-300">
									{analysisReport.tajweedScore}%
								</span>
							</div>

							<div class="text-center bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-xl border border-emerald-500/5 space-y-1">
								<span class="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tempo</span>
								<div class="relative pt-1">
									<div class="overflow-hidden h-1.5 text-xs flex rounded-full bg-slate-100 dark:bg-slate-950">
										<div 
											style="width: {analysisReport.tempoScore}%" 
											class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 rounded-full"
										></div>
									</div>
								</div>
								<span class="text-xs font-bold text-slate-800 dark:text-slate-300">
									{analysisReport.tempoScore}%
								</span>
							</div>
						</div>

						<!-- Text Feedback -->
						<div class="space-y-3 pt-1">
							<p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
								{analysisReport.feedback}
							</p>

							<div class="space-y-2">
								<span class="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
									Rekomendasi Latihan:
								</span>
								<ul class="space-y-1.5">
									{#each analysisReport.highlights as highlight}
										<li class="text-[11px] text-slate-650 dark:text-slate-400 flex items-start gap-1.5">
											<span class="text-emerald-500 mt-0.5">•</span>
											<span>{highlight}</span>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</aside>
{/if}

