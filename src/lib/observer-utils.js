/**
 * Shared IntersectionObserver utility functions
 * Reduces code duplication between action implementations
 */

/**
 * Create and manage an IntersectionObserver with automatic cleanup tracking
 * Provides a reusable wrapper to handle observer lifecycle and connection state
 *
 * @param {HTMLElement} target - Element to observe
 * @param {IntersectionObserverCallback} callback - Callback function invoked on intersection changes
 * @param {IntersectionObserverInit} options - IntersectionObserver configuration options
 * @returns {{ observer: IntersectionObserver, isConnected: boolean }}
 *
 * @example
 * ```javascript
 * const { observer, isConnected } = createManagedObserver(element, callback, {threshold: 0});
 * // Use observer...
 * // Later: observer.disconnect();
 * ```
 */
export function createManagedObserver(target, callback, options) {
	const observer = new IntersectionObserver(callback, options);
	observer.observe(target);

	return {
		observer,
		isConnected: true
	};
}

/**
 * Safely disconnect an IntersectionObserver if it's still connected
 * Prevents errors from double-disconnecting and tracks connection state
 *
 * @param {IntersectionObserver} observer - The observer to disconnect
 * @param {{ isConnected: boolean }} state - Object containing connection state
 * @returns {void}
 *
 * @example
 * ```javascript
 * disconnectObserver(observer, state);
 * ```
 */
export function disconnectObserver(observer, state) {
	if (state.isConnected && observer) {
		observer.disconnect();
		state.isConnected = false;
	}
}
