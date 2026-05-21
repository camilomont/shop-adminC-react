const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} es requerido.`;
  return null;
}

export function validatePrice(price: string): string | null {
  if (!price.trim()) return 'El precio es requerido.';
  const num = Number(price);
  if (Number.isNaN(num)) return 'El precio debe ser numérico.';
  if (num < 0) return 'El precio debe ser mayor o igual a 0.';
  return null;
}

export function validateQuantity(quantity: string): string | null {
  if (!quantity.trim()) return 'La cantidad es requerida.';
  const num = Number(quantity);
  if (!Number.isInteger(num) || num < 1) {
    return 'La cantidad debe ser un entero mayor o igual a 1.';
  }
  return null;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
