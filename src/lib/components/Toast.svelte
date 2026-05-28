<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import { CheckCircle, XCircle, Info } from '@lucide/svelte';
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
	{#each toastStore.toasts as toast (toast.id)}
		<div
			class="flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100
			{toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-800' : ''}
			{toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/90 dark:text-red-200 dark:border-red-800' : ''}
			{toast.type === 'info' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/90 dark:text-amber-200 dark:border-amber-800' : ''}"
		>
			{#if toast.type === 'success'}
				<CheckCircle class="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
			{:else if toast.type === 'error'}
				<XCircle class="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
			{:else}
				<Info class="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
			{/if}
			<span class="text-sm font-medium">{toast.message}</span>
		</div>
	{/each}
</div>
