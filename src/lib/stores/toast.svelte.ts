class ToastStore {
	toasts = $state<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

	show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
		const id = Math.random().toString(36).substring(2, 9);
		this.toasts.push({ id, message, type });
		setTimeout(() => {
			this.toasts = this.toasts.filter((t) => t.id !== id);
		}, duration);
	}
}

export const toastStore = new ToastStore();
