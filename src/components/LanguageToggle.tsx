import { useLang } from '../i18n';
import type { Lang } from '../i18n';

const options: Lang[] = ['es', 'en', 'zh'];
const labels: Record<Lang, string> = { es: 'ES', en: 'EN', zh: '中文' };
const names: Record<Lang, string> = { es: 'Español', en: 'English', zh: '中文' };

/** ES | EN | 中文 pill switch: outlined track with a sliding filled thumb. */
export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      className={`lang-toggle ${className}`.trim()}
      role="group"
      aria-label={t('Idioma', 'Language')}
      data-lang={lang}
    >
      <span className="lang-toggle__thumb" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          className={`lang-toggle__btn${lang === option ? ' is-active' : ''}`}
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          aria-label={names[option]}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}
