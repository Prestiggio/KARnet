/**
 * Wrapper autour de l'API Umami
 * À utiliser partout dans votre app
 */

export function trackEvent(
  eventName: string,
  data?: Record<string, any>
): void {
  // Vérifier que Umami est chargé
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, data);
  } else {
    console.warn('Umami not loaded');
  }
}

// Types pour TypeScript
declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, any>) => void;
    };
  }
}