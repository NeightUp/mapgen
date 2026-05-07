export function downloadJson(filename: string, value: unknown): void {
  const json = `${JSON.stringify(value, null, 2)}\n`
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(filename, blob)
}

export async function downloadCanvasPng(
  filename: string,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })

  if (!blob) {
    throw new Error('Canvas PNG export failed')
  }

  downloadBlob(filename, blob)
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
