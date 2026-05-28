<script lang="ts">
	import './layout.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { ArrowUp, MessageCircle } from '@lucide/svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	let showBackToTop = $state(false);

	if (browser) {
		window.addEventListener('scroll', () => {
			showBackToTop = window.scrollY > 400;
		});
	}

	function scrollToTop() {
		if (browser) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
</script>

<div class="min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
	<!-- Global Navigation -->
	<Navbar />

	<!-- Page Content Router -->
	<main class="flex-grow pt-20">
		{@render children()}
	</main>

	<!-- Global Footer -->
	<Footer />

	<!-- Toast System -->
	<Toast />

	<!-- Floating Widgets -->
	<div class="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
		<!-- WhatsApp Floating Button -->
		<a
			href="https://wa.me/6281234567890?text=Assalamualaikum%20Admin%20Masjid%20Al-Ishlah..."
			target="_blank"
			rel="noopener noreferrer"
			class="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transform hover:scale-110 transition-all duration-300"
			aria-label="Hubungi WhatsApp Admin"
		>
			<MessageCircle class="w-6 h-6 fill-white/10" />
		</a>
	</div>

	{#if showBackToTop}
		<div class="fixed bottom-6 right-6 z-40">
			<!-- Scroll back to top -->
			<button
				onclick={scrollToTop}
				class="w-12 h-12 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200/80 dark:border-slate-700 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transform hover:-translate-y-0.5 transition-all duration-200"
				aria-label="Kembali ke atas"
			>
				<ArrowUp class="w-5 h-5" />
			</button>
		</div>
	{/if}
</div>
