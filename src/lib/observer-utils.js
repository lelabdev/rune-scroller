/**
 * Shared IntersectionObserver utility functions
 * Reduces code duplication between action implementations
 */

/**
 * @param {HTMLElement} target
 * @param {IntersectionObserverCallback} callback
 * @param {IntersectionObserverInit} options
 * @returns {{ observer: IntersectionObserver, isConnected: boolean }}
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
 * @param {IntersectionObserver} observer
 * @param {{ isConnected: boolean }} state
 */
export function disconnectObserver(observer, state) {
	if (state.isConnected && observer) {
		observer.disconnect();
		state.isConnected = false;
	}
}
