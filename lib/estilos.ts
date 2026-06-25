// Shared text style options for the message editor and the album rendering.

export const COLOR_DEFAULT = '#1f2937'

export const COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: 'Negro', value: '#1f2937' },
  { label: 'Verde', value: '#2f6b4f' },
  { label: 'Azul', value: '#1d4ed8' },
  { label: 'Vino', value: '#9d174d' },
  { label: 'Café', value: '#92400e' },
  { label: 'Dorado', value: '#a16207' },
]

export const FONT_DEFAULT = 'serif'

export const FONT_OPTIONS: {
  key: string
  label: string
  family: string
}[] = [
  { key: 'serif', label: 'Clásica', family: 'var(--font-playfair), Georgia, serif' },
  { key: 'sans', label: 'Moderna', family: 'var(--font-geist-sans), system-ui, sans-serif' },
  { key: 'mono', label: 'Máquina', family: 'var(--font-geist-mono), ui-monospace, monospace' },
  { key: 'cursive', label: 'Manuscrita', family: '"Segoe Script", "Brush Script MT", cursive' },
]

export function fontFamily(key: string | null | undefined): string {
  const found = FONT_OPTIONS.find((f) => f.key === key)
  return found ? found.family : FONT_OPTIONS[0].family
}
