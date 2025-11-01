<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AnimationType } from './animations';
	import BaseAnimated from './BaseAnimated.svelte';

	interface Props {
		animation?: AnimationType;
		threshold?: number;
		rootMargin?: string;
		offset?: number;
		duration?: number;
		delay?: number;
		repeat?: boolean;
		children: Snippet;
		[key: string]: any;
	}

	const {
		animation = 'fade-in',
		threshold = 0.5,
		rootMargin,
		offset,
		duration = 800,
		delay = 0,
		repeat = false,
		children,
		...rest
	}: Props = $props();
</script>

<!--
 * Wrapper component for scroll animations
 * Triggers animation based on repeat setting:
 * - repeat={false} (default): triggers once when element enters viewport
 * - repeat={true}: triggers each time element enters viewport
 -->
<BaseAnimated {animation} {threshold} {rootMargin} {offset} {duration} {delay} once={!repeat} {children} {...rest} />
