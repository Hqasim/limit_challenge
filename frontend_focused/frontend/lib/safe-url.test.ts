import { toMailtoHref, toSafeExternalUrl, toTelHref } from '@/lib/safe-url';

describe('toSafeExternalUrl', () => {
  it('allows absolute http(s) URLs', () => {
    expect(toSafeExternalUrl('https://files.example.com/a.pdf')).toBe(
      'https://files.example.com/a.pdf',
    );
    expect(toSafeExternalUrl('http://example.com')).toBe('http://example.com/');
  });

  it.each([
    'javascript:alert(document.cookie)',
    'JAVASCRIPT:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '/relative/path',
    'not a url',
    '',
    null,
    undefined,
  ])('rejects %p', (value) => {
    expect(toSafeExternalUrl(value)).toBeNull();
  });
});

describe('toMailtoHref', () => {
  it('builds a mailto link with an encoded subject', () => {
    expect(toMailtoHref('ops@northwind.test')).toBe('mailto:ops@northwind.test');
    expect(toMailtoHref(' ops@northwind.test ', 'Submission #12 & Acme')).toBe(
      'mailto:ops@northwind.test?subject=Submission%20%2312%20%26%20Acme',
    );
  });

  it('rejects values that are not email-shaped', () => {
    expect(toMailtoHref('ops at northwind')).toBeNull();
    expect(toMailtoHref('a@b.test?cc=evil@x.test')).toBeNull();
    expect(toMailtoHref('a@b.test?bcc=evil')).toBeNull();
    expect(toMailtoHref(null)).toBeNull();
  });
});

describe('toTelHref', () => {
  it('keeps digits and a leading plus, dropping extensions', () => {
    expect(toTelHref('(555) 010-2030')).toBe('tel:5550102030');
    expect(toTelHref('+1-555-010-2030x1234')).toBe('tel:+15550102030');
    expect(toTelHref('001-555-010-2030 ext. 9')).toBe('tel:0015550102030');
  });

  it('rejects values without a usable number', () => {
    expect(toTelHref('n/a')).toBeNull();
    expect(toTelHref('')).toBeNull();
  });
});
