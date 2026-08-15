export function isHoneypotFilled(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim().length > 0;
}
