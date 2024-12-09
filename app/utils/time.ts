export function formatDuration(duration: number, reducedFormat: boolean = false) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  if (reducedFormat) {
    const secondsStr = seconds.toString().padStart(2, '0');
    return hours > 0 ? `${hours}:${minutes}:${secondsStr}` : `${minutes}:${secondsStr}`;
  }

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (seconds > 0) parts.push(`${seconds.toString().padStart(2, '0')}sec`);
  
  return parts.join(' ');
}



