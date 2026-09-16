import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

/**
 * Two variants:
 *  - "switch" (default): one click flips light/dark. For the top bar.
 *  - "menu": light / dark / follow system. For the settings page.
 */
export default function ThemeToggle({ variant = 'switch' }: { variant?: 'switch' | 'menu' }) {
  const { theme, resolved, setTheme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (variant === 'switch') {
    return (
      <button
        onClick={toggle}
        aria-label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ background: 'var(--bg-surface-2)' }}
      >
        {/* Both icons live in the same box and cross-fade, so the
            button never jumps as the glyph changes. */}
        <Sun
          size={16}
          className="absolute transition-all duration-300"
          style={{
            color: 'var(--text-secondary)',
            opacity: resolved === 'dark' ? 0 : 1,
            transform: resolved === 'dark' ? 'rotate(-90deg) scale(.5)' : 'none',
          }}
        />
        <Moon
          size={16}
          className="absolute transition-all duration-300"
          style={{
            color: 'var(--text-secondary)',
            opacity: resolved === 'dark' ? 1 : 0,
            transform: resolved === 'dark' ? 'none' : 'rotate(90deg) scale(.5)',
          }}
        />
      </button>
    );
  }

  const OPTIONS = [
    { key: 'light'  as const, label: 'Light',         icon: Sun },
    { key: 'dark'   as const, label: 'Dark',          icon: Moon },
    { key: 'system' as const, label: 'Follow system', icon: Monitor },
  ];

  return (
    <div ref={ref} className="relative">
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(opt => {
          const Icon = opt.icon;
          const active = theme === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setTheme(opt.key)}
              className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all"
              style={{
                background: active ? 'var(--brand-50)' : 'var(--bg-surface-2)',
                borderColor: active ? 'var(--brand-500)' : 'var(--border)',
                color: active ? 'var(--brand-600)' : 'var(--text-secondary)',
              }}
            >
              {active && (
                <span
                  className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--brand-500)' }}
                >
                  <Check size={10} className="text-white" strokeWidth={3} />
                </span>
              )}
              <Icon size={19} />
              <span className="text-xs font-semibold">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
