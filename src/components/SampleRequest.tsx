import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Icon from './Icon';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xblpnkle';

type FormFields = {
  name: string;
  email: string;
  organization: string;
  phone: string;
  message: string;
};

const initialFields: FormFields = {
  name: '',
  email: '',
  organization: '',
  phone: '',
  message: '',
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function SampleRequest() {
  const [fields, setFields] = useState<FormFields>(initialFields);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // A CTA elsewhere on the page can send an enquiry topic and focus the form.
  useEffect(() => {
    const handleTopic = (event: Event) => {
      const topic = (event as CustomEvent<string>).detail;
      if (typeof topic !== 'string' || !topic) return;

      setFields((current) => ({ ...current, message: topic }));
      setStatus('idle');
      setErrorMessage('');

      window.setTimeout(() => {
        const message = document.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
        message?.focus({ preventScroll: true });
      }, 400);
    };

    window.addEventListener('binec:request-topic', handleTopic);
    return () => window.removeEventListener('binec:request-topic', handleTopic);
  }, []);

  const updateField = (field: keyof FormFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
    if (status === 'error' || status === 'success') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          organization: fields.organization,
          phone: fields.phone,
          message: fields.message || 'Me interesa crear un catálogo 3D para mi marca. Quisiera recibir una cotización.',
          _subject: 'Cotización de catálogo 3D - BINEC',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string; errors?: Array<{ message?: string }> } | null;
        const detail = data?.error || data?.errors?.[0]?.message || 'No se pudo enviar la solicitud.';
        throw new Error(detail);
      }

      setStatus('success');
      setFields(initialFields);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.');
    }
  };

  return (
    <form className="request-form" onSubmit={handleSubmit} noValidate={false}>
      <div className="form-heading">
        <span>Cotiza tu catálogo 3D</span>
        <span>Respuesta por correo</span>
      </div>

      <div className="form-grid">
        <label>
          <span>Nombre completo *</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            value={fields.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Tu nombre"
            disabled={status === 'submitting'}
          />
        </label>
        <label>
          <span>Correo profesional *</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={fields.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="nombre@empresa.com"
            disabled={status === 'submitting'}
          />
        </label>
        <label>
          <span>Empresa / Marca</span>
          <input
            type="text"
            name="organization"
            autoComplete="organization"
            value={fields.organization}
            onChange={(event) => updateField('organization', event.target.value)}
            placeholder="Nombre de tu empresa"
            disabled={status === 'submitting'}
          />
        </label>
        <label>
          <span>Teléfono</span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={fields.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="+52 00 0000 0000"
            disabled={status === 'submitting'}
          />
        </label>
        <label className="form-full">
          <span>Mensaje</span>
          <textarea
            name="message"
            rows={4}
            value={fields.message}
            onChange={(event) => updateField('message', event.target.value)}
            placeholder="Cuéntanos qué productos quieres mostrar y cómo imaginas tu catálogo 3D."
            disabled={status === 'submitting'}
          />
        </label>
      </div>

      <div className="form-submit-row">
        <p>Tu solicitud llegará al equipo de BINEC.</p>
        <button type="submit" className="button button-dark" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Enviando…' : 'Solicitar cotización'}
          <Icon name={status === 'submitting' ? 'cube' : 'arrow-right'} size={17} />
        </button>
      </div>

      {status === 'success' && (
        <div className="request-ready" role="status" aria-live="polite">
          <div className="request-ready-heading">
            <span className="request-check"><Icon name="check" size={18} /></span>
            <div>
              <strong>Solicitud enviada</strong>
              <p>Gracias por contarnos tu proyecto. El equipo de BINEC te responderá por correo.</p>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="request-error" role="alert">
          <strong>No se pudo enviar</strong>
          <p>{errorMessage || 'Inténtelo de nuevo en unos momentos.'}</p>
        </div>
      )}
    </form>
  );
}
