// Builders for links made from API data. Values that come from a database are untrusted: a
// document URL of "javascript:..." must never become a clickable link. Each helper returns
// null when the value is unsafe or unusable, and callers then render plain text.

// Absolute http(s) URLs only.
export function toSafeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null; // not an absolute URL
  }
}

// A deliberately loose shape check: one "@", and no spaces or URL delimiters (? & # , ;) that
// could smuggle extra mail headers such as "?cc=" into the link. Enough to keep junk out
// without rejecting unusual but valid addresses.
const EMAIL_SHAPE = /^[^\s@?&#,;]+@[^\s@?&#,;]+$/;

// mailto: link with an optional prefilled subject.
export function toMailtoHref(email: string | null | undefined, subject?: string): string | null {
  const address = email?.trim();
  if (!address || !EMAIL_SHAPE.test(address)) return null;
  return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}

// tel: link keeping only a leading "+" and digits ("(555) 010-2030 x12" -> "tel:5550102030").
// Extensions after "x" are dropped, since dialers handle them inconsistently.
export function toTelHref(phone: string | null | undefined): string | null {
  const [number] = (phone ?? '').toLowerCase().split(/x|ext/);
  const digits = number.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return digits.replace('+', '').length >= 3 ? `tel:${digits}` : null;
}
