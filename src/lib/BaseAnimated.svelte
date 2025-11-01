<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useIntersection, useIntersectionOnce } from './useIntersection.svelte';
	import { calculateRootMargin, type AnimationType } from './animations';
	import './animations.css';

	interface Props {
		animation?: AnimationType;
		threshold?: number;
		rootMargin?: string;
		offset?: number;
		duration?: number;
		delay?: number;
		once?: boolean;
		children: Snippet;
	}

	const {
		animation = 'fade-in',
		threshold = 0.5,
		rootMargin,
		offset,
		duration = 800,
		delay = 0,
		once = false,
		children
	}: Props = $props();

	// Calculate rootMargin from offset if provided
	const finalRootMargin = calculateRootMargin(offset, rootMargin);

	// Use appropriate composable based on once prop
	const intersection = once
		? useIntersectionOnce({ threshold, rootMargin: finalRootMargin })
		: useIntersection({ threshold, rootMargin: finalRootMargin });
</script>

<div
	bind:this={intersection.element}
	class="scroll-animate"
	class:is-visible={intersection.isVisible}
	data-animation={animation}
	style="--duration: {duration}ms; --delay: {delay}ms;"
>
	{@render children()}
</div>

<!-- Styles are imported from animations.css -->
