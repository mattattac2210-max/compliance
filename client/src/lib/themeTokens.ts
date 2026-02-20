export type ThemeName = 'light' | 'dark';

export const themeTokens: Record<ThemeName, Record<string, string>> = {
  light: {
    '--bg':            '#F7F8FA',
    '--bg2':           '#EDF2F7',
    '--surface':       '#FFFFFF',
    '--surface2':      '#F7F8FA',
    '--sidebar':       '#0F1923',
    '--sidebar2':      '#162030',
    '--sidebar3':      '#1C2A3A',
    '--accent':        '#E8192C',
    '--accent2':       '#C8121F',
    '--accent-tint':   'rgba(232,25,44,0.08)',
    '--accent-tint2':  'rgba(232,25,44,0.13)',
    '--txt':           '#0F1923',
    '--t2':            '#4A5568',
    '--t3':            '#94A3B8',
    '--t4':            '#CBD5E1',
    '--charcoal':      '#2D3748',
    '--grey':          '#718096',
    '--grey-light':    '#EDF2F7',
    '--b':             'rgba(0,0,0,0.07)',
    '--b2':            'rgba(0,0,0,0.04)',
    '--shadow':        '0 1px 3px rgba(0,0,0,0.07),0 4px 16px rgba(0,0,0,0.04)',
    '--shadow2':       '0 2px 8px rgba(0,0,0,0.10),0 12px 32px rgba(0,0,0,0.06)',
    '--grn':           '#16A34A',
    '--grn-tint':      'rgba(22,163,74,0.10)',
    '--gold':          '#D97706',
    '--gold-tint':     'rgba(217,119,6,0.10)',
    '--blue':          '#2563EB',
    '--blue-tint':     'rgba(37,99,235,0.10)',
    '--purple':        '#7C3AED',
    '--danger':        '#E8192C',
    '--font-display':  "'IBM Plex Serif', Georgia, serif",
    '--font-body':     "'IBM Plex Sans', system-ui, sans-serif",
    '--font-mono':     "'IBM Plex Mono', 'Courier New', monospace",
    '--tp-bg':         '#FFFFFF',
    '--tp-b':          'rgba(0,0,0,0.07)',
    '--sb-active-bg':  'rgba(232,25,44,0.13)',
    '--qa-bg':         '#2D3748',
    '--qa-hover':      '#364156',
  },
  dark: {
    '--bg':            '#07101E',
    '--bg2':           '#0A1628',
    '--surface':       '#0C1A2E',
    '--surface2':      '#0F2040',
    '--sidebar':       '#0A1628',
    '--sidebar2':      '#0C1A2E',
    '--sidebar3':      '#0F2040',
    '--accent':        '#14B8A6',
    '--accent2':       '#0D9488',
    '--accent-tint':   'rgba(20,184,166,0.12)',
    '--accent-tint2':  'rgba(20,184,166,0.20)',
    '--txt':           '#F1F5F9',
    '--t2':            '#94A3B8',
    '--t3':            '#64748B',
    '--t4':            '#475569',
    '--charcoal':      '#334155',
    '--grey':          '#64748B',
    '--grey-light':    'rgba(255,255,255,0.06)',
    '--b':             'rgba(255,255,255,0.07)',
    '--b2':            'rgba(255,255,255,0.04)',
    '--shadow':        '0 2px 8px rgba(0,0,0,0.3),0 8px 24px rgba(0,0,0,0.2)',
    '--shadow2':       '0 4px 16px rgba(0,0,0,0.4),0 16px 48px rgba(0,0,0,0.3)',
    '--grn':           '#22C55E',
    '--grn-tint':      'rgba(34,197,94,0.12)',
    '--gold':          '#F59E0B',
    '--gold-tint':     'rgba(245,158,11,0.12)',
    '--blue':          '#3B82F6',
    '--blue-tint':     'rgba(59,130,246,0.12)',
    '--purple':        '#8B5CF6',
    '--danger':        '#EF4444',
    '--font-display':  "'Montserrat', sans-serif",
    '--font-body':     "'Lato', sans-serif",
    '--font-mono':     "'JetBrains Mono', monospace",
    '--tp-bg':         '#0C1A2E',
    '--tp-b':          'rgba(255,255,255,0.07)',
    '--sb-active-bg':  'rgba(20,184,166,0.15)',
    '--qa-bg':         '#0F2040',
    '--qa-hover':      '#162540',
  },
};

export const themeFontUrls: Record<ThemeName, string> = {
  light: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap',
  dark:  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Lato:ital,wght@0,300;0,400;0,700;1,300&family=JetBrains+Mono:wght@400;500&display=swap',
};

export function applyTheme(theme: ThemeName): void {
  const tokens = themeTokens[theme];
  const root = document.documentElement;
  Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  let link = document.getElementById('dscvr-font-link') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'dscvr-font-link';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = themeFontUrls[theme];
}
