<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import { BookOpen, Send, Phone, Mail, MapPin } from '@lucide/svelte';

	let email = $state('');

	function handleSubscribe(e: Event) {
		e.preventDefault();
		if (!email || !email.includes('@')) {
			toastStore.show('Silakan masukkan email yang valid', 'error');
			return;
		}
		toastStore.show('Terima kasih! Anda berhasil berlangganan newsletter.', 'success');
		email = '';
	}
</script>

<footer class="bg-slate-900 text-slate-300 dark:bg-slate-980 dark:text-slate-400 border-t border-slate-800 pt-16 pb-8 font-sans">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
			
			<!-- Brief Branding -->
			<div class="space-y-4 md:col-span-1">
				<a href="/" class="flex items-center gap-2">
					<div class="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
						<BookOpen class="w-5 h-5 text-white" />
					</div>
					<div>
						<span class="block font-display font-bold text-white text-base leading-tight">
							Al‑Ishlah
						</span>
						<span class="block text-[9px] text-emerald-400 uppercase tracking-widest leading-none font-semibold">
							Soreang Indah
						</span>
					</div>
				</a>
				<p class="text-xs text-slate-400 italic font-display mt-3 leading-relaxed">
					"Pusat Pendidikan dan Dakwah keumatan yang modern, inklusif, dan profesional untuk mewujudkan masyarakat madani."
				</p>
				<div class="flex items-center gap-3 pt-2">
					<!-- Instagram SVG -->
					<a href="https://instagram.com" class="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white transition-colors" aria-label="Instagram">
						<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
							<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
							<line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
						</svg>
					</a>
					<!-- Youtube SVG -->
					<a href="https://youtube.com" class="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white transition-colors" aria-label="Youtube">
						<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
							<polygon points="10 15 15 12 10 9"/>
						</svg>
					</a>
					<!-- Facebook SVG -->
					<a href="https://facebook.com" class="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white transition-colors" aria-label="Facebook">
						<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
						</svg>
					</a>
				</div>
			</div>

			<!-- Navigation Directories -->
			<div class="space-y-4">
				<h4 class="font-display font-semibold text-sm text-white tracking-wider uppercase">Tautan Cepat</h4>
				<ul class="space-y-2.5 text-sm">
					<li><a href="/" class="hover:text-emerald-400 transition-colors">Beranda</a></li>
					<li><a href="/donasi" class="hover:text-emerald-400 transition-colors">Program & Donasi</a></li>
					<li><a href="/mushaf" class="hover:text-emerald-400 transition-colors">Mushaf Digital</a></li>
					<li><a href="/galeri" class="hover:text-emerald-400 transition-colors">Galeri Kegiatan</a></li>
					<li><a href="/kontak" class="hover:text-emerald-400 transition-colors">Hubungi Kami</a></li>
				</ul>
			</div>

			<!-- Contact Brief -->
			<div class="space-y-4">
				<h4 class="font-display font-semibold text-sm text-white tracking-wider uppercase">Kontak Info</h4>
				<ul class="space-y-3 text-xs text-slate-400">
					<li class="flex items-start gap-2.5">
						<MapPin class="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
						<span>Komplek Soreang Indah, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911</span>
					</li>
					<li class="flex items-center gap-2.5">
						<Phone class="w-4 h-4 text-emerald-500 flex-shrink-0" />
						<a href="tel:+6282385387709" class="hover:text-emerald-400 transition-colors">+62823-8538-7709</a>
					</li>
					<li class="flex items-center gap-2.5">
						<Mail class="w-4 h-4 text-emerald-500 flex-shrink-0" />
						<a href="mailto:alislahsorin.sekre@gmail.com" class="hover:text-emerald-400 transition-colors">alislahsorin.sekre@gmail.com</a>
					</li>
				</ul>
			</div>

			<!-- Newsletter Subscription -->
			<div class="space-y-4">
				<h4 class="font-display font-semibold text-sm text-white tracking-wider uppercase">Warta Jemaah</h4>
				<p class="text-xs text-slate-400 leading-relaxed">
					Berlangganan warta, info kajian, dan update donasi rutin Masjid Al-Ishlah langsung ke email Anda.
				</p>
				<form onsubmit={handleSubscribe} class="relative flex items-center">
					<input
						type="email"
						placeholder="Email Anda"
						bind:value={email}
						class="w-full rounded-xl bg-slate-800 border border-slate-700/60 px-4 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
					/>
					<button
						type="submit"
						class="absolute right-1 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
						aria-label="Kirim"
					>
						<Send class="w-3.5 h-3.5" />
					</button>
				</form>
			</div>

		</div>

		<!-- Divider -->
		<div class="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
			<p>© {new Date().getFullYear()} Masjid Al-Ishlah Soreang Indah. Hak Cipta Dilindungi.</p>
			<p>Pusat Pendidikan dan Dakwah Keumatan</p>
		</div>
	</div>
</footer>
