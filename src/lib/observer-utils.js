/**
 * Shared IntersectionObserver utility functions.
 *
 * An observer is shared by actions that use the same configuration. A registry
 * entry owns the browser observer while each action owns a subscription to one
 * observed target. This avoids retaining actions when an individual target is
 * destroyed.
 */

/** @type {Array<{ ObserverConstructor: typeof IntersectionObserver, observer: IntersectionObserver, options: IntersectionObserverInit, subscribers: Map<Element, Set<IntersectionObserverCallback>> }>} */
const observerRegistry = [];

/**
 * @param {IntersectionObserverInit["threshold"]} left
 * @param {IntersectionObserverInit["threshold"]} right
 */
function thresholdsMatch(left, right) {
  const leftValues = Array.isArray(left) ? left : [left ?? 0];
  const rightValues = Array.isArray(right) ? right : [right ?? 0];
  return (
    leftValues.length === rightValues.length &&
    leftValues.every((value, index) => value === rightValues[index])
  );
}

/**
 * @param {IntersectionObserverInit} left
 * @param {IntersectionObserverInit} right
 */
function optionsMatch(left, right) {
  return (
    (left.root ?? null) === (right.root ?? null) &&
    (left.rootMargin ?? "0px") === (right.rootMargin ?? "0px") &&
    thresholdsMatch(left.threshold, right.threshold)
  );
}

/**
 * @param {IntersectionObserverInit} options
 */
function getRegistryEntry(options) {
  const existing = observerRegistry.find(
    (entry) =>
      entry.ObserverConstructor === IntersectionObserver &&
      optionsMatch(entry.options, options),
  );
  if (existing) return existing;

  /** @type {{ ObserverConstructor: typeof IntersectionObserver, observer: IntersectionObserver, options: IntersectionObserverInit, subscribers: Map<Element, Set<IntersectionObserverCallback>> } | undefined} */
  let entry;
  const observer = new IntersectionObserver((entries, activeObserver) => {
    for (const intersectionEntry of entries) {
      const callbacks = entry?.subscribers.get(intersectionEntry.target);
      if (!callbacks) continue;
      for (const callback of callbacks) {
        callback([intersectionEntry], activeObserver);
      }
    }
  }, options);

  entry = {
    ObserverConstructor: IntersectionObserver,
    observer,
    options: { ...options },
    subscribers: new Map(),
  };
  const nativeDisconnect = observer.disconnect.bind(observer);
  observer.disconnect = () => {
    nativeDisconnect();
    entry?.subscribers.clear();
    const index = observerRegistry.indexOf(entry);
    if (index !== -1) observerRegistry.splice(index, 1);
  };
  observerRegistry.push(entry);
  return entry;
}

/**
 * @typedef {{ observer: IntersectionObserver, isConnected: boolean, release: () => void }} ManagedObserver
 */

/**
 * Observe a target with a shared observer.
 *
 * @param {HTMLElement} target
 * @param {IntersectionObserverCallback} callback
 * @param {IntersectionObserverInit} options
 * @returns {ManagedObserver}
 */
export function createManagedObserver(target, callback, options) {
  const entry = getRegistryEntry(options);
  let callbacks = entry.subscribers.get(target);
  if (!callbacks) {
    callbacks = new Set();
    entry.subscribers.set(target, callbacks);
    entry.observer.observe(target);
  }
  callbacks.add(callback);

  let released = false;
  return {
    observer: entry.observer,
    isConnected: true,
    release() {
      if (released) return;
      released = true;

      const targetCallbacks = entry.subscribers.get(target);
      targetCallbacks?.delete(callback);
      if (targetCallbacks?.size) return;

      entry.subscribers.delete(target);
      entry.observer.unobserve(target);
      if (entry.subscribers.size) return;

      entry.observer.disconnect();
    },
  };
}

/**
 * Disconnect a standalone observer or release one action subscription.
 *
 * @param {IntersectionObserver | ManagedObserver | null | undefined} observer
 * @param {{ isConnected: boolean }} state
 */
export function disconnectObserver(observer, state) {
  if (!state.isConnected || !observer) return;

  if ("release" in observer) {
    observer.release();
  } else {
    observer.disconnect();
  }
  state.isConnected = false;
}
