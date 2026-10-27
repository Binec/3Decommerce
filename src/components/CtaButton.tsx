import type { ReactNode } from 'react';
import Icon from './Icon';
import type { IconName } from './Icon';

type CtaButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  icon?: IconName;
  /** "pill" is the landing CTA; "square" is the form submit variant. */
  shape?: 'pill' | 'square';
  size?: 'regular' | 'compact';
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'aria-haspopup'?: 'dialog';
};

/**
 * Primary call to action copied from bineccc.com: a red pill with the label
 * on the left and a dark circular chip holding the arrow on the right.
 */
export default function CtaButton({
  children,
  onClick,
  icon = 'arrow-up-right',
  shape = 'pill',
  size = 'regular',
  type = 'button',
  disabled,
  loading,
  className = '',
  ...rest
}: CtaButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`binec-cta binec-cta--${shape} binec-cta--${size} ${className}`.trim()}
      {...rest}
    >
      <span className="binec-cta__label">{children}</span>
      <span className="binec-cta__chip" data-icon={icon} aria-hidden="true">
        {loading ? <span className="binec-cta__spinner" /> : <Icon name={icon} size={16} strokeWidth={1.75} />}
      </span>
    </button>
  );
}
