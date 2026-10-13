import { profile } from '../../data/profile';
import './floating-whatsapp.css';

export function FloatingWhatsApp() {
  const number = profile.whatsapp.replace(/\D/g, '');
  const message = `Hi ${profile.name}, I’d like to discuss a project or collaboration.`;
  return (
    <a
      className="whatsapp-contact"
      href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${profile.name} on WhatsApp (${profile.whatsapp}, opens in a new tab)`}
      title={`WhatsApp: ${profile.whatsapp}`}
    >
      <img src="/icons/whatsapp.svg" width="28" height="28" alt="" aria-hidden="true" />
      <span className="whatsapp-contact-label" aria-hidden="true">Chat on WhatsApp</span>
    </a>
  );
}
