import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import CtaButton from './CtaButton';
import Icon from './Icon';
import { useLang } from '../i18n';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xblpnkle';
const MAX_MESSAGE = 400;

// Values stay in Spanish (they are what the team receives); labels are translated.
export const SERVICE_OPTIONS = [
  'Catálogo 3D',
  'Catálogo + ecommerce',
  'Modelado 3D de productos',
  'Otro',
] as const;
const SERVICE_LABELS_ZH: Record<string, string> = {
  'Catálogo 3D': '3D 目录',
  'Catálogo + ecommerce': '目录 + 电商',
  'Modelado 3D de productos': '产品 3D 建模',
  'Otro': '其他',
};
const SERVICE_LABELS_EN: Record<string, string> = {
  'Catálogo 3D': '3D catalog',
  'Catálogo + ecommerce': 'Catalog + ecommerce',
  'Modelado 3D de productos': '3D product modeling',
  'Otro': 'Other',
};
export const ECOMMERCE_SERVICE = 'Catálogo + ecommerce';

type FormFields = {
  name: string;
  email: string;
  organization: string;
  phone: string;
  service: string;
  message: string;
};
type FieldName = 'name' | 'email' | 'phone';
type Errors = Partial<Record<FieldName, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const initialFields: FormFields = {
  name: '',
  email: '',
  organization: '',
  phone: '',
  service: SERVICE_OPTIONS[0],
  message: '',
};

type FieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  textarea?: boolean;
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email';
  maxLength?: number;
  optional?: boolean;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLTextAreaElement>;
  optionalLabel?: string;
};

/** Rounded translucent field from bineccc.com, with inline validation. */
function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  type = 'text',
  textarea = false,
  autoComplete,
  inputMode,
  maxLength,
  optional,
  disabled,
  inputRef,
  optionalLabel = 'Opcional',
}: FieldProps) {
  const className = `bf-input${error ? ' has-error' : ''}${textarea ? ' bf-textarea' : ''}`;
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="bf-field">
      <label htmlFor={id} className="bf-label">
        {label}
        {optional && <span className="bf-optional">{optionalLabel}</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          ref={inputRef}
          rows={4}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={className}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={className}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="bf-error">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function SampleRequest() {
  const { lang, t } = useLang();
  const serviceLabel = (value: string) => (lang === 'en' ? SERVICE_LABELS_EN[value] ?? value : lang === 'zh' ? SERVICE_LABELS_ZH[value] ?? value : value);
  const [fields, setFields] = useState<FormFields>(initialFields);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // CTAs elsewhere on the page can preselect a topic and focus the message.
  useEffect(() => {
    const handleTopic = (event: Event) => {
      const topic = (event as CustomEvent<string>).detail;
      if (typeof topic !== 'string' || !topic) return;

      setStatus('idle');
      setFields((current) => ({
        ...current,
        service: ECOMMERCE_SERVICE,
        message: current.message.trim() ? current.message : topic,
      }));
      window.setTimeout(() => messageRef.current?.focus({ preventScroll: true }), 450);
    };

    window.addEventListener('binec:request-topic', handleTopic);
    return () => window.removeEventListener('binec:request-topic', handleTopic);
  }, []);

  const update = (key: keyof FormFields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
    if (status === 'error') setStatus('idle');
  };

  const validate = () => {
    const next: Errors = {};
    if (!fields.name.trim()) next.name = t('Escribe tu nombre', 'Enter your name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = t('Añade un correo válido', 'Enter a valid email');
    const phone = fields.phone.trim();
    const digits = phone.replace(/\D/g, '');
    if (phone && (digits.length < 7 || digits.length > 15 || !/^[+\d\s()-]+$/.test(phone))) {
      next.phone = t('Añade un teléfono válido', 'Enter a valid phone number');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus('submitting');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          organization: fields.organization.trim(),
          phone: fields.phone.trim(),
          servicio: fields.service,
          idioma: lang,
          message: fields.message.trim() || t('Me interesa crear un catálogo 3D para mi marca. Quisiera recibir una cotización.', 'I am interested in creating a 3D catalog for my brand. I would like to receive a quote.'),
          _replyto: fields.email.trim(),
          _subject: `Cotización de ${fields.service} - ${fields.name.trim()} - BINEC`,
        }),
      });
      setStatus(response.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setFields(initialFields);
    setErrors({});
    setStatus('idle');
  };

  if (status === 'success') {
    const firstName = fields.name.trim().split(' ')[0];
    return (
      <div className="bf-card bf-success" role="status" aria-live="polite">
        <svg viewBox="0 0 52 52" className="bf-success-mark" aria-hidden="true">
          <circle className="bf-success-circle" cx="26" cy="26" r="25" />
          <path className="bf-success-check" d="M16 27 l7 7 l14 -15" />
        </svg>
        <h3>{t('Gracias', 'Thank you')}{lang === 'zh' ? '，' : ', '}{firstName}{lang === 'zh' ? '。' : '.'}</h3>
        <p>
          {t('Recibimos tu solicitud. Te responderemos a', 'We received your request. We will reply to')} <span>{fields.email.trim()}</span>{lang === 'zh' ? '。' : ' ' + t('en breve.', 'shortly.')}
        </p>
        <span className="bf-success-topic">{t('Tema', 'Topic')} — {serviceLabel(fields.service)}</span>
        <button type="button" className="bf-secondary" onClick={reset}>
          {t('Enviar otro mensaje', 'Send another message')}
        </button>
      </div>
    );
  }

  const submitting = status === 'submitting';

  return (
    <form className="bf-card" onSubmit={handleSubmit} noValidate>
      <div className="bf-grid">
        <Field
          id="cotizacion-nombre"
          label={t('Nombre', 'Name')}
          placeholder={t('Tu nombre', 'Your name')}
          autoComplete="name"
          value={fields.name}
          onChange={(value) => update('name', value)}
          error={errors.name}
          disabled={submitting}
        />
        <Field
          id="cotizacion-correo"
          type="email"
          label={t('Correo', 'Email')}
          placeholder={t('nombre@empresa.com', 'name@company.com')}
          autoComplete="email"
          inputMode="email"
          value={fields.email}
          onChange={(value) => update('email', value)}
          error={errors.email}
          disabled={submitting}
        />
        <Field
          id="cotizacion-empresa"
          label={t('Empresa / Marca', 'Company / Brand')}
          placeholder={t('Nombre de tu empresa', 'Your company name')}
          autoComplete="organization"
          value={fields.organization}
          onChange={(value) => update('organization', value)}
          optional
          optionalLabel={t('Opcional', 'Optional')}
          disabled={submitting}
        />
        <Field
          id="cotizacion-telefono"
          type="tel"
          label={t('Teléfono', 'Phone')}
          placeholder="+52 81 1234 5678"
          autoComplete="tel"
          inputMode="tel"
          maxLength={20}
          value={fields.phone}
          onChange={(value) => update('phone', value)}
          error={errors.phone}
          optional
          optionalLabel={t('Opcional', 'Optional')}
          disabled={submitting}
        />
      </div>

      <fieldset className="bf-services">
        <legend className="bf-label">{t('¿Qué te interesa?', 'What are you interested in?')}</legend>
        <div className="bf-pills">
          {SERVICE_OPTIONS.map((option) => {
            const active = fields.service === option;
            return (
              <button
                type="button"
                key={option}
                className={`bf-pill${active ? ' is-active' : ''}`}
                onClick={() => update('service', option)}
                aria-pressed={active}
                disabled={submitting}
              >
                {serviceLabel(option)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="bf-message">
        <Field
          id="cotizacion-mensaje"
          label={t('Mensaje', 'Message')}
          placeholder={t('Cuéntanos qué productos quieres mostrar y cómo imaginas tu catálogo 3D.', 'Tell us which products you want to showcase and how you imagine your 3D catalog.')}
          textarea
          maxLength={MAX_MESSAGE}
          value={fields.message}
          onChange={(value) => update('message', value)}
          disabled={submitting}
          inputRef={messageRef}
        />
        <span className={`bf-counter${fields.message.length >= 10 ? ' is-ready' : ''}`}>
          {fields.message.length}/{MAX_MESSAGE}
        </span>
      </div>

      {status === 'error' && (
        <p role="alert" className="bf-error bf-error--form">
          <Icon name="alert" size={14} />
          {t('No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.', 'Could not send. Try again or message us on WhatsApp.')}
        </p>
      )}

      <div className="bf-actions">
        <p>{t('Sin spam. Solo respondemos a tu proyecto.', 'No spam. We only reply about your project.')}</p>
        <CtaButton type="submit" shape="square" disabled={submitting} loading={submitting}>
          {submitting ? t('Enviando…', 'Sending…') : t('Solicitar cotización', 'Request a quote')}
        </CtaButton>
      </div>
    </form>
  );
}
