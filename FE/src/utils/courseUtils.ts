export function handleKeyboardAction(event: KeyboardEvent, callback: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    callback()
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

