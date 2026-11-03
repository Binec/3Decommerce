import Icon from './Icon';

export const WHATSAPP_NUMBER = '528130738347';
const DEFAULT_MESSAGE = 'Hola BINEC, me interesa un catálogo 3D para mi marca.';

/** Floating WhatsApp button, fixed to the bottom-right corner. */
export default function WhatsAppFloat() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      className="whatsapp-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp a BINEC"
    >
      <span className="whatsapp-float__label" aria-hidden="true">¿Hablamos por WhatsApp?</span>
      <span className="whatsapp-float__icon">
        <Icon name="whatsapp" size={30} />
      </span>
    </a>
  );
}
