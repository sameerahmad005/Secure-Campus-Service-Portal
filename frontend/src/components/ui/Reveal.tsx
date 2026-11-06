import React, { useEffect, useRef } from 'react';

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  as?: 'div' | 'section' | 'li';
}

/** Fades and lifts its children in once, the first time they scroll into view. */
export const Reveal: React.FC<RevealProps> = ({ delay = 0, as = 'div', className = '', style, children, ...rest }) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={{ ...style, ['--reveal-delay' as string]: `${Math.min(delay, 400)}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
};
