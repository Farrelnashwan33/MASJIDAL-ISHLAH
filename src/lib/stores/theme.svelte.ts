import { browser } from '$app/environment';

class ThemeStore {
	current = $state<'light' | 'dark'>('light');

	constructor() {
		if (browser) {
			const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			this.current = saved || (prefersDark ? 'dark' : 'light');
			this.apply();
		}
	}

	toggle() {
		this.current = this.current === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem('theme', this.current);
			this.apply();
		}
	}

	private apply() {
		if (browser) {
			if (this.current === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}
}

export const theme = new ThemeStore();
