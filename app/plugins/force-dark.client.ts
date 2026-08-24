// Dark-only app. Pin the color mode to dark on every load so a previously
// stored 'light' preference (or system) can't flip it — the toggle is gone.
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  if (colorMode.preference !== 'dark') colorMode.preference = 'dark'
})
