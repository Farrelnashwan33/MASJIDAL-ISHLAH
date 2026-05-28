<script lang="ts">
	import { page } from '$app/state';
	import { theme } from '$lib/stores/theme.svelte';
	import { Menu, X, Sun, Moon, Heart, BookOpen } from '@lucide/svelte';

	// State
	let isMobileMenuOpen = $state(false);
	let isScrolled = $state(false);

	// Navigation items
	const navItems = [
		{ name: 'Beranda', path: '/' },
		{ name: 'Program & Donasi', path: '/donasi' },
		{ name: 'Mushaf Digital', path: '/mushaf' },
		{ name: 'Galeri', path: '/galeri' },
		{ name: 'Kontak', path: '/kontak' }
	];

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', () => {
			isScrolled = window.scrollY > 20;
		});
	}

	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}
</script>

<header
	class="fixed top-0 left-0 right-0 z-40 transition-all duration-300 {isScrolled ? 'glass shadow-md py-3' : 'bg-transparent py-5'}"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between">
			
			<!-- Logo Section -->
			<a href="/" class="flex items-center gap-2.5 group" onclick={closeMobileMenu}>
				<!-- Elegant Mosque Icon -->
				<div class="relative w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 dark:from-emerald-700 dark:to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
					<BookOpen class="w-5.5 h-5.5 text-white" />
					<div class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full border border-white dark:border-slate-900 animate-ping"></div>
					<div class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full border border-white dark:border-slate-900"></div>
				</div>
				<div>
					<span class="block font-display font-bold text-base text-emerald-800 dark:text-emerald-400 tracking-tight leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
						Al‑Ishlah
					</span>
					<span class="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none font-medium">
						Soreang Indah
					</span>
				</div>
			</a>

			<!-- Desktop Nav Links -->
			<nav class="hidden md:flex items-center gap-1.5">
				{#each navItems as item}
					<a
						href={item.path}
						class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 {page.url.pathname === item.path ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'}"
					>
						{item.name}
					</a>
				{/each}
			</nav>

			<!-- Action buttons (Dark Mode, Donate button) -->
			<div class="hidden md:flex items-center gap-3">
				<!-- Theme Toggle -->
				<button
					onclick={() => theme.toggle()}
					class="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all duration-200"
					aria-label="Toggle dark mode"
				>
					{#if theme.current === 'dark'}
						<Sun class="w-5 h-5" />
					{:else}
						<Moon class="w-5 h-5" />
					{/if}
				</button>

				<!-- Floating / Quick Donate Link -->
				<a
					href="/donasi"
					class="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/25 transform hover:-translate-y-0.5 transition-all duration-200"
				>
					<Heart class="w-4 h-4 fill-white/10" />
					Donasi Sekarang
				</a>
			</div>

			<!-- Mobile menu button -->
			<div class="flex items-center gap-2 md:hidden">
				<!-- Theme Toggle Mobile -->
				<button
					onclick={() => theme.toggle()}
					class="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
					aria-label="Toggle dark mode"
				>
					{#if theme.current === 'dark'}
						<Sun class="w-5 h-5" />
					{:else}
						<Moon class="w-5 h-5" />
					{/if}
				</button>
				
				<button
					onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
					class="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
					aria-expanded={isMobileMenuOpen}
					aria-label="Main menu"
				>
					{#if isMobileMenuOpen}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</button>
			</div>

		</div>
	</div>

	<!-- Mobile drawer -->
	{#if isMobileMenuOpen}
		<div class="md:hidden glass border-t border-slate-200/80 dark:border-slate-800/80 absolute top-full left-0 right-0 py-4 px-6 shadow-xl flex flex-col gap-2 transition-all duration-300">
			{#each navItems as item}
				<a
					href={item.path}
					onclick={closeMobileMenu}
					class="py-3 px-4 rounded-xl text-base font-semibold transition-all {page.url.pathname === item.path ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400'}"
				>
					{item.name}
				</a>
			{/each}
			<a
				href="/donasi"
				onclick={closeMobileMenu}
				class="mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
			>
				<Heart class="w-4 h-4 fill-white/10" />
				Donasi Sekarang
			</a>
		</div>
	{/if}
</header>
