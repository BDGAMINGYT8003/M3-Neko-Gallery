export function triggerHapticFeedback(pattern: VibratePattern = 20) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }
}
