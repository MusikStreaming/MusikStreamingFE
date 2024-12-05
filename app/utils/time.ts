export function processTime(time: number) {
  return `${Math.floor(time / 60)}:${time % 60 < 10 ? '0' : ''}${time % 60}`;
}

export function processDuration(duration: number) {
  return `${Math.floor(duration / 60)}:${duration % 60 < 10 ? '0' : ''}${duration % 60}`;
}
