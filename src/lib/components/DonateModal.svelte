<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import { X, Copy, QrCode, CheckCircle, Heart, Loader2 } from '@lucide/svelte';
	import confetti from 'canvas-confetti';

	// Props
	interface Props {
		isOpen: boolean;
		onClose: () => void;
		programName?: string;
	}
	let { isOpen, onClose, programName = 'Infaq Masjid' }: Props = $props();

	// State
	let selectedAmount = $state<number | null>(50000);
	let customAmount = $state<string>('');
	let donationStep = $state<'input' | 'payment' | 'loading' | 'success'>('input');
	let paymentMethod = $state<'qris' | 'transfer'>('qris');

	const nominalOptions = [10000, 25000, 50000, 100000, 250000, 500000];
	const bankAccount = '0000007021959';
	const bankName = 'Bank BJB';
	const accountHolder = 'MASJID AL ISHLAH SOREANG INDAH';

	// Computed amount
	let finalAmount = $derived(
		selectedAmount !== null ? selectedAmount : (parseInt(customAmount.replace(/\D/g, '')) || 0)
	);

	function formatRupiah(num: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(num);
	}

	function handleCopy() {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(bankAccount);
			toastStore.show('Nomor rekening berhasil disalin!', 'success');
		} else {
			toastStore.show('Gagal menyalin secara otomatis', 'error');
		}
	}

	function nextStep() {
		if (finalAmount < 5000) {
			toastStore.show('Minimal donasi adalah Rp 5.000', 'error');
			return;
		}
		donationStep = 'payment';
	}

	function simulatePayment() {
		donationStep = 'loading';
		setTimeout(() => {
			donationStep = 'success';
			confetti({
				particleCount: 150,
				spread: 80,
				origin: { y: 0.6 },
				colors: ['#047857', '#cf8a28', '#34d399', '#f5dfb2']
			});
			toastStore.show('Terima kasih! Donasi Anda berhasil diterima.', 'success');
		}, 2500);
	}

	function resetModal() {
		donationStep = 'input';
		selectedAmount = 50000;
		customAmount = '';
		paymentMethod = 'qris';
		onClose();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<!-- eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -->
		<div 
			class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
			onclick={resetModal}
		></div>

		<!-- Modal Container -->
		<div class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300 transform scale-100 flex flex-col max-h-[90vh]">
			
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-emerald-50/50 dark:bg-slate-800/40">
				<div>
					<h3 class="font-display font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
						<Heart class="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/20" />
						Donasi Keumatan
					</h3>
					<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Program: <span class="font-medium text-emerald-700 dark:text-emerald-300">{programName}</span></p>
				</div>
				<button 
					onclick={resetModal} 
					class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					aria-label="Tutup"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Body -->
			<div class="overflow-y-auto px-6 py-6 flex-1">
				{#if donationStep === 'input'}
					<!-- Step 1: Input Nominal -->
					<div class="space-y-6">
						<div>
							<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
								Pilih Nominal Donasi
							</label>
							<div class="grid grid-cols-3 gap-2">
								{#each nominalOptions as nominal}
									<button
										onclick={() => {
											selectedAmount = nominal;
											customAmount = '';
										}}
										class="py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all duration-200 {selectedAmount === nominal ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:border-emerald-300'}"
									>
										{formatRupiah(nominal)}
									</button>
								{/each}
							</div>
						</div>

						<div class="relative">
							<div class="absolute inset-0 flex items-center" aria-hidden="true">
								<div class="w-full border-t border-slate-200 dark:border-slate-700"></div>
							</div>
							<div class="relative flex justify-center text-xs uppercase">
								<span class="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 font-medium">Atau Masukkan Nominal Sendiri</span>
							</div>
						</div>

						<div>
							<label for="custom-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
								Nominal Kustom (Rp)
							</label>
							<div class="relative rounded-xl shadow-sm">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
									<span class="text-slate-400 font-medium text-sm">Rp</span>
								</div>
								<input
									type="text"
									id="custom-input"
									class="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-base"
									placeholder="Contoh: 50.000"
									bind:value={customAmount}
									oninput={() => {
										selectedAmount = null;
										// strip non-digits
										customAmount = customAmount.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
									}}
								/>
							</div>
							<p class="text-xs text-slate-400 mt-2">Minimal donasi Rp 5.000</p>
						</div>
					</div>
				{:else if donationStep === 'payment'}
					<!-- Step 2: Payment options -->
					<div class="space-y-6">
						<div class="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-center">
							<span class="text-xs text-emerald-800 dark:text-emerald-300 font-medium uppercase tracking-wider">Total Donasi Anda</span>
							<p class="text-2xl font-bold font-display text-emerald-700 dark:text-emerald-400 mt-1">
								{formatRupiah(finalAmount)}
							</p>
						</div>

						<!-- Payment Method Tabs -->
						<div class="flex border-b border-slate-200 dark:border-slate-700">
							<button
								onclick={() => paymentMethod = 'qris'}
								class="flex-1 pb-3 text-sm font-semibold transition-all border-b-2 flex items-center justify-center gap-2 {paymentMethod === 'qris' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-slate-400'}"
							>
								<QrCode class="w-4 h-4" />
								QRIS / E-Wallet
							</button>
							<button
								onclick={() => paymentMethod = 'transfer'}
								class="flex-1 pb-3 text-sm font-semibold transition-all border-b-2 flex items-center justify-center gap-2 {paymentMethod === 'transfer' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-slate-400'}"
							>
								<Copy class="w-4 h-4" />
								Transfer Bank
							</button>
						</div>

						<!-- Tab Content -->
						{#if paymentMethod === 'qris'}
							<div class="flex flex-col items-center justify-center space-y-4">
								<p class="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
									Scan QRIS menggunakan Dana, OVO, GoPay, ShopeePay, LinkAja, atau aplikasi mobile banking Anda.
								</p>
								
								<!-- QRIS Barcode Box -->
								<div class="p-4 bg-white rounded-2xl shadow-md border border-slate-100 flex flex-col items-center">
									<!-- Custom SVG QR Code Mockup to look exactly like the real official QRIS standards -->
									<div class="w-48 h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden rounded-lg">
										<!-- Logo QRIS overlay -->
										<div class="absolute inset-0 p-3 bg-white flex flex-col justify-between">
											<div class="flex justify-between items-center border-b pb-1">
												<span class="text-[9px] font-black text-red-600 tracking-tighter">QRIS</span>
												<span class="text-[7px] text-blue-800 font-bold">GPN</span>
											</div>
											<!-- QR Pattern Mockup -->
											<svg class="w-full h-32 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
												<!-- QR Code Corners -->
												<rect x="0" y="0" width="22" height="22" />
												<rect x="3" y="3" width="16" height="16" fill="white" />
												<rect x="6" y="6" width="10" height="10" />

												<rect x="78" y="0" width="22" height="22" />
												<rect x="81" y="3" width="16" height="16" fill="white" />
												<rect x="84" y="6" width="10" height="10" />

												<rect x="0" y="78" width="22" height="22" />
												<rect x="3" y="81" width="16" height="16" fill="white" />
												<rect x="6" y="84" width="10" height="10" />

												<!-- Center Logo Box -->
												<rect x="42" y="42" width="16" height="16" fill="white" />
												<rect x="44" y="44" width="12" height="12" fill="#047857" />

												<!-- Random QR pixels -->
												<rect x="28" y="4" width="4" height="8" />
												<rect x="36" y="8" width="8" height="4" />
												<rect x="48" y="12" width="6" height="6" />
												<rect x="60" y="2" width="12" height="4" />
												<rect x="68" y="10" width="4" height="8" />
												
												<rect x="4" y="28" width="8" height="4" />
												<rect x="8" y="36" width="4" height="8" />
												<rect x="12" y="48" width="6" height="6" />
												<rect x="2" y="60" width="12" height="4" />
												<rect x="10" y="68" width="4" height="8" />

												<rect x="82" y="28" width="8" height="4" />
												<rect x="88" y="36" width="4" height="8" />
												<rect x="80" y="48" width="6" height="6" />
												<rect x="84" y="60" width="12" height="4" />
												
												<rect x="28" y="82" width="8" height="4" />
												<rect x="36" y="88" width="4" height="8" />
												<rect x="48" y="80" width="6" height="6" />
												<rect x="60" y="84" width="12" height="4" />

												<rect x="30" y="30" width="8" height="8" />
												<rect x="62" y="30" width="8" height="8" />
												<rect x="30" y="62" width="8" height="8" />
												<rect x="62" y="62" width="8" height="8" />

												<rect x="45" y="22" width="10" height="4" />
												<rect x="22" y="45" width="4" height="10" />
												<rect x="74" y="45" width="4" height="10" />
												<rect x="45" y="74" width="10" height="4" />
											</svg>
											<div class="text-[7px] text-center font-bold text-slate-500 border-t pt-0.5 uppercase">
												NMID: ID1020304050607
											</div>
										</div>
									</div>
									<span class="text-xs font-bold text-slate-800 tracking-wider mt-2">NMID: ID1020304050607</span>
								</div>
							</div>
						{:else}
							<div class="space-y-4">
								<p class="text-xs text-slate-500 dark:text-slate-400">
									Silakan transfer nominal donasi Anda ke rekening resmi Masjid Al-Ishlah Soreang Indah berikut:
								</p>
								<div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
									<div class="flex justify-between items-center">
										<span class="text-xs text-slate-500 dark:text-slate-400">Nama Bank</span>
										<span class="text-sm font-bold text-slate-800 dark:text-slate-200">{bankName}</span>
									</div>
									<div class="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/60 pt-2.5">
										<span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Nomor Rekening</span>
										<button
											onclick={handleCopy}
											class="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-mono font-bold text-base hover:underline"
										>
											{bankAccount}
											<Copy class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
										</button>
									</div>
									<div class="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/60 pt-2.5">
										<span class="text-xs text-slate-500 dark:text-slate-400">Penerima</span>
										<span class="text-xs font-semibold text-slate-800 dark:text-slate-200 text-right">{accountHolder}</span>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{:else if donationStep === 'loading'}
					<!-- Step 3: Loading Simulator -->
					<div class="flex flex-col items-center justify-center py-12 space-y-4 text-center">
						<Loader2 class="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin" />
						<div>
							<h4 class="font-display font-semibold text-slate-800 dark:text-white">Memproses Pembayaran</h4>
							<p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
								Menghubungkan ke gateway bank/e-wallet untuk memvalidasi transaksi Anda...
							</p>
						</div>
					</div>
				{:else if donationStep === 'success'}
					<!-- Step 4: Success Screen -->
					<div class="flex flex-col items-center justify-center py-8 space-y-6 text-center">
						<div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
							<CheckCircle class="w-12 h-12 fill-emerald-600/10" />
						</div>
						<div class="space-y-2">
							<h3 class="font-display font-bold text-xl text-slate-900 dark:text-white">Alhamdulillah, Donasi Berhasil!</h3>
							<p class="text-sm text-slate-600 dark:text-slate-400 max-w-sm px-4">
								Semoga donasi Anda menjadi amal jariyah yang dilipatgandakan pahalanya oleh Allah SWT. Aamiin ya Rabbal Alamin.
							</p>
						</div>

						<div class="w-full bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-sans text-xs space-y-2 max-w-sm text-left">
							<div class="flex justify-between">
								<span class="text-slate-500">Program</span>
								<span class="font-semibold text-slate-800 dark:text-slate-200">{programName}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-slate-500">Nominal</span>
								<span class="font-bold text-emerald-700 dark:text-emerald-400">{formatRupiah(finalAmount)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-slate-500">Metode</span>
								<span class="font-semibold text-slate-800 dark:text-slate-200 uppercase">{paymentMethod}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-slate-500">Tanggal</span>
								<span class="font-semibold text-slate-800 dark:text-slate-200">
									{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}
								</span>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex gap-3 justify-end bg-slate-50 dark:bg-slate-900/30">
				{#if donationStep === 'input'}
					<button
						onclick={resetModal}
						class="py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					>
						Batal
					</button>
					<button
						onclick={nextStep}
						class="py-2.5 px-6 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 transition-colors"
					>
						Lanjutkan
					</button>
				{:else if donationStep === 'payment'}
					<button
						onclick={() => donationStep = 'input'}
						class="py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					>
						Kembali
					</button>
					<button
						onclick={simulatePayment}
						class="py-2.5 px-6 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 transition-colors"
					>
						{paymentMethod === 'qris' ? 'Konfirmasi Sudah Scan' : 'Konfirmasi Transfer'}
					</button>
				{:else if donationStep === 'success'}
					<button
						onclick={resetModal}
						class="w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 transition-colors text-center"
					>
						Selesai
					</button>
				{/if}
			</div>

		</div>
	</div>
{/if}
