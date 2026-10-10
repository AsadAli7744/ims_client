import html2canvas from 'html2canvas';

export async function downloadElementAsPng(element, filename = 'download.png') {
  if (!element) {
    throw new Error('Nothing to download');
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: Math.min(2, window.devicePixelRatio || 2),
    useCORS: true,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
