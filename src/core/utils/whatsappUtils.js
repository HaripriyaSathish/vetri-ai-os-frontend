export function buildWhatsAppLink(phoneNumber, message) {
  const digitsOnly = (phoneNumber || '').replace(/\D/g, '');
  // Add India country code (91) if the number doesn't already look like it has one
  const withCountryCode = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(phoneNumber, message) {
  window.open(buildWhatsAppLink(phoneNumber, message), '_blank');
}