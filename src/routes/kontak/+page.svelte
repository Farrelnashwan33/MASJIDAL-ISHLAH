<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import { 
		Phone, Mail, MapPin, Clock, Send, 
		MessageSquare, Share2, Compass
	} from '@lucide/svelte';

	// State
	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let isSubmitting = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name || !email || !subject || !message) {
			toastStore.show('Harap isi semua kolom input', 'error');
			return;
		}
		isSubmitting = true;
		setTimeout(() => {
			toastStore.show('Pesan Anda berhasil terkirim. Terima kasih!', 'success');
			name = '';
			email = '';
			subject = '';
			message = '';
			isSubmitting = false;
		}, 1500);
	}
</script>

<svelte:head>
	<title>Kontak & Lokasi - Masjid Al-Ishlah Soreang Indah</title>
	<meta name="description" content="Hubungi DKM Masjid Al-Ishlah Soreang Indah, Soreang, Kabupaten Bandung. Temukan peta lokasi, jam kegiatan, dan form kontak." />
</svelte:head>

<section class="min-h-screen py-12 bg-slate-50/50 dark:bg-slate-950/20">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<!-- Header -->
		<div class="text-center space-y-4 mb-12">
			<h1 class="font-display font-bold text-3xl sm:text-4xl text-slate-800 dark:text-white">Kontak & Lokasi</h1>
			<p class="max-w-xl mx-auto text-sm text-slate-500 leading-relaxed">
				Hubungi pengurus DKM Masjid Al-Ishlah Soreang Indah untuk informasi kegiatan, pendaftaran santri, kemitraan sosial, atau donasi.
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
			
			<!-- 1. Left: Contact Information Cards -->
			<div class="space-y-6 lg:col-span-1">
				<div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
					<h3 class="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
						<Compass class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
						Informasi Masjid
					</h3>

					<div class="space-y-4">
						<!-- Address -->
						<div class="flex items-start gap-3 text-xs">
							<MapPin class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
							<div>
								<span class="block font-semibold text-slate-700 dark:text-slate-300">Alamat Lengkap</span>
								<span class="block text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
									Komplek Soreang Indah, Soreang, Kec. Soreang, Kabupaten Bandung, Jawa Barat 40911
								</span>
							</div>
						</div>

						<!-- Phone -->
						<div class="flex items-start gap-3 text-xs">
							<Phone class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
							<div>
								<span class="block font-semibold text-slate-700 dark:text-slate-300">Telepon & WhatsApp</span>
								<span class="block text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
									<a href="tel:+6282385387709" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">+62823-8538-7709</a> (Administrasi)
								</span>
							</div>
						</div>

						<!-- Mail -->
						<div class="flex items-start gap-3 text-xs">
							<Mail class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
							<div>
								<span class="block font-semibold text-slate-700 dark:text-slate-300">Surel Resmi</span>
								<span class="block text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
									<a href="mailto:alislahsorin.sekre@gmail.com" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">alislahsorin.sekre@gmail.com</a>
								</span>
							</div>
						</div>

						<!-- Hours -->
						<div class="flex items-start gap-3 text-xs">
							<Clock class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
							<div>
								<span class="block font-semibold text-slate-700 dark:text-slate-300">Waktu Operasional</span>
								<span class="block text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
									Terbuka 24 Jam untuk Ibadah <br />
									Administrasi: Setiap Hari (08:00 - 17:00)
								</span>
							</div>
						</div>
					</div>

					<div class="pt-4 border-t border-slate-100 dark:border-slate-800">
						<a
							href="https://wa.me/6282385387709"
							target="_blank"
							rel="noopener noreferrer"
							class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all"
						>
							<MessageSquare class="w-4 h-4" />
							Hubungi via WhatsApp
						</a>
					</div>
				</div>
			</div>

			<!-- 2. Center: Contact Feedback Form -->
			<div class="lg:col-span-2 space-y-6">
				<div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
					<h3 class="font-display font-bold text-base text-slate-800 dark:text-white mb-6 flex items-center gap-2">
						<Mail class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
						Kirim Pesan
					</h3>

					<form onsubmit={handleSubmit} class="space-y-4">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label for="form-name" class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nama Lengkap</label>
								<input
									type="text"
									id="form-name"
									placeholder="Nama Anda"
									bind:value={name}
									class="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs focus:outline-none focus:border-emerald-500"
								/>
							</div>
							<div>
								<label for="form-email" class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Alamat Email</label>
								<input
									type="email"
									id="form-email"
									placeholder="email@domain.com"
									bind:value={email}
									class="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs focus:outline-none focus:border-emerald-500"
								/>
							</div>
						</div>

						<div>
							<label for="form-sub" class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Subjek</label>
							<input
								type="text"
								id="form-sub"
								placeholder="Judul Pesan"
								bind:value={subject}
								class="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs focus:outline-none focus:border-emerald-500"
							/>
						</div>

						<div>
							<label for="form-msg" class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Pesan Anda</label>
							<textarea
								id="form-msg"
								rows="5"
								placeholder="Tulis pesan lengkap..."
								bind:value={message}
								class="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs focus:outline-none focus:border-emerald-500"
							></textarea>
						</div>

						<div class="flex justify-end">
							<button
								type="submit"
								disabled={isSubmitting}
								class="flex items-center justify-center gap-1.5 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/15 disabled:opacity-55 transition-all"
							>
								{#if isSubmitting}
									Mengirim...
								{:else}
									<Send class="w-4 h-4" />
									Kirim Pesan
								{/if}
							</button>
						</div>
					</form>
				</div>
			</div>

		</div>

		<!-- 3. Google Maps Embed with premium border -->
		<div class="mt-12 rounded-3xl overflow-hidden border border-slate-200/85 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 p-3">
			<div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/80">
				<div>
					<h3 class="font-display font-bold text-sm text-slate-800 dark:text-white">Lokasi Masjid Soreang Indah</h3>
					<p class="text-[10px] text-slate-400 mt-0.5">Lihat rute arah, peta jalan, dan wilayah sekeliling.</p>
				</div>
				<a 
					href="https://maps.app.goo.gl/yCeEPrDYs1oGCdtT7" 
					target="_blank" 
					rel="noopener noreferrer"
					class="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
				>
					<Share2 class="w-4 h-4" />
					Buka Google Maps
				</a>
			</div>
			<!-- Maps Iframe with exact coordinates of Masjid Al-Ishlah -->
			<div class="w-full h-[400px] overflow-hidden rounded-2xl relative">
				<iframe
					title="Peta Lokasi Masjid Al-Ishlah Soreang Indah"
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.882410887163!2d107.5160251759089!3d-7.031267868884948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68ee570ecb1dd3%3A0xc48c66e2c39d899e!2sMasjid%20Al-Ishlah!5e0!3m2!1sid!2sid!4v1716715000000!5m2!1sid!2sid"
					class="w-full h-full border-none filter brightness-95 dark:brightness-[0.82] dark:contrast-[1.1]"
					allowfullscreen={true}
					loading="lazy"
				></iframe>
			</div>
		</div>

	</div>
</section>
