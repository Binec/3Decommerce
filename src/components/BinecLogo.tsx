import type { CSSProperties } from 'react';

const ring = Array.from('BINEC \u2022 BINEC \u2022 BINEC \u2022 ');
const step = 360 / ring.length;

export default function BinecLogo() {
  return (
    <span className="binec-lockup" aria-hidden="true">
      <span className="binec-logo">
        <span className="binec-logo__tilt">
          <span className="binec-logo__sphere">
            <span className="binec-logo__shine" />
          </span>
          <span className="binec-logo__ring">
            {ring.map((char, index) => (
              <span
                key={`front-${index}`}
                className="binec-logo__glyph"
                style={{ '--a': `${index * step}deg` } as CSSProperties}
              >
                {char === ' ' ? '\u00a0' : char}
              </span>
            ))}
            {ring.map((char, index) => (
              <span
                key={`back-${index}`}
                className="binec-logo__glyph binec-logo__glyph--back"
                style={{ '--a': `${index * step}deg` } as CSSProperties}
              >
                {char === ' ' ? '\u00a0' : char}
              </span>
            ))}
          </span>
        </span>
      </span>
      <span className="binec-wordmark">BINEC<span>.</span></span>
    </span>
  );
}