import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const I = ({ size = 14, ...p }: IconProps) =>
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none"
    stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}/>;

export const Icons = {
  dashboard:   (p: IconProps) => <I {...p}><polygon points="7,1.5 12.5,4.5 12.5,9.5 7,12.5 1.5,9.5 1.5,4.5" strokeWidth="1.3"/></I>,
  check:       (p: IconProps) => <I {...p}><polyline points="2.5,7 5.5,10 11.5,4" strokeWidth="1.5"/></I>,
  document:    (p: IconProps) => <I {...p}><rect x="2.5" y="2.5" width="9" height="9" rx="1.5" strokeWidth="1.3"/></I>,
  timeline:    (p: IconProps) => <I {...p}><circle cx="7" cy="7" r="5.5" strokeWidth="1.3"/><circle cx="7" cy="7" r="2" strokeWidth="1.3"/></I>,
  vault:       (p: IconProps) => <I {...p}><rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" strokeWidth="1.3"/><rect x="8" y="1.5" width="4.5" height="4.5" rx="1" strokeWidth="1.3"/><rect x="1.5" y="8" width="4.5" height="4.5" rx="1" strokeWidth="1.3"/><rect x="8" y="8" width="4.5" height="4.5" rx="1" strokeWidth="1.3"/></I>,
  settings:    (p: IconProps) => <I {...p}><rect x="3" y="3" width="8" height="8" rx="1" transform="rotate(45 7 7)" strokeWidth="1.3"/><circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none"/></I>,
  profile:     (p: IconProps) => <I {...p}><circle cx="7" cy="4.5" r="2.5" strokeWidth="1.3"/><path d="M1.5 13a5.5 5.5 0 0 1 11 0" strokeWidth="1.3"/></I>,
  alerts:      (p: IconProps) => <I {...p}><path d="M7 1.5L12.5 12H1.5L7 1.5z" strokeWidth="1.3"/><line x1="7" y1="6" x2="7" y2="9"/><circle cx="7" cy="10.8" r="0.6" fill="currentColor" stroke="none"/></I>,
  regulations: (p: IconProps) => <I {...p}><rect x="1" y="11.5" width="12" height="1.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="1.5" y="6" width="11" height="1" fill="currentColor" stroke="none"/><line x1="3.5" y1="7" x2="3.5" y2="11.5" strokeWidth="1.3"/><line x1="7" y1="7" x2="7" y2="11.5" strokeWidth="1.3"/><line x1="10.5" y1="7" x2="10.5" y2="11.5" strokeWidth="1.3"/><polygon points="7,2 13,6 1,6" fill="currentColor" stroke="none"/></I>,
  scales:      (p: IconProps) => <I {...p}><line x1="7" y1="2" x2="7" y2="14" strokeWidth="1.3"/><line x1="3" y1="5" x2="11" y2="5" strokeWidth="1.3"/><path d="M3 5L1 9.5h4L3 5z" strokeWidth="1.3"/><path d="M11 5L9 9.5h4L11 5z" strokeWidth="1.3"/></I>,
  calendar:    (p: IconProps) => <I {...p}><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" strokeWidth="1.3"/><line x1="1.5" y1="6" x2="12.5" y2="6" strokeWidth="1.3"/><line x1="4.5" y1="1" x2="4.5" y2="4" strokeWidth="1.3"/><line x1="9.5" y1="1" x2="9.5" y2="4" strokeWidth="1.3"/></I>,
  globe:       (p: IconProps) => <I {...p}><circle cx="7" cy="7" r="5.5" strokeWidth="1.3"/><ellipse cx="7" cy="7" rx="2.5" ry="5.5" strokeWidth="1.3"/><line x1="1.5" y1="7" x2="12.5" y2="7" strokeWidth="1.3"/><line x1="2.3" y1="4.5" x2="11.7" y2="4.5" strokeWidth="1.3"/><line x1="2.3" y1="9.5" x2="11.7" y2="9.5" strokeWidth="1.3"/></I>,
  lock:        (p: IconProps) => <I {...p}><rect x="3" y="6.5" width="8" height="6" rx="1.5" strokeWidth="1.3"/><path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0V6.5" strokeWidth="1.3"/></I>,
  upload:      (p: IconProps) => <I {...p}><rect x="2" y="8" width="10" height="5.5" rx="1" strokeWidth="1.3"/><polyline points="5,5 7,2.5 9,5" strokeWidth="1.4"/><line x1="7" y1="2.5" x2="7" y2="9.5" strokeWidth="1.4"/></I>,
  search:      (p: IconProps) => <I {...p}><circle cx="6.5" cy="6.5" r="4.5" strokeWidth="1.3"/><line x1="10" y1="10" x2="13" y2="13" strokeWidth="1.4"/></I>,
  filter:      (p: IconProps) => <I {...p}><line x1="2" y1="4" x2="12" y2="4" strokeWidth="1.3"/><line x1="3.5" y1="7" x2="10.5" y2="7" strokeWidth="1.3"/><line x1="5" y1="10" x2="9" y2="10" strokeWidth="1.3"/></I>,
  chevronDown: (p: IconProps) => <I {...p}><polyline points="3,5 7,9 11,5" strokeWidth="1.5"/></I>,
  chevronRight:(p: IconProps) => <I {...p}><polyline points="5,3 9,7 5,11" strokeWidth="1.5"/></I>,
  arrowRight:  (p: IconProps) => <I {...p}><line x1="2" y1="7" x2="12" y2="7" strokeWidth="1.4"/><polyline points="9,4 12,7 9,10" strokeWidth="1.4"/></I>,
  close:       (p: IconProps) => <I {...p}><line x1="3" y1="3" x2="11" y2="11" strokeWidth="1.5"/><line x1="11" y1="3" x2="3" y2="11" strokeWidth="1.5"/></I>,
  plus:        (p: IconProps) => <I {...p}><line x1="7" y1="2" x2="7" y2="12" strokeWidth="1.5"/><line x1="2" y1="7" x2="12" y2="7" strokeWidth="1.5"/></I>,
  edit:        (p: IconProps) => <I {...p}><path d="M9 2L12 5L5 12H2V9L9 2z" strokeWidth="1.3"/></I>,
  trash:       (p: IconProps) => <I {...p}><polyline points="2,4 12,4" strokeWidth="1.4"/><rect x="3.5" y="4" width="7" height="8.5" rx="1" strokeWidth="1.3"/><path d="M5.5 4V2.5h3V4" strokeWidth="1.3"/></I>,
  refresh:     (p: IconProps) => <I {...p}><path d="M3 8a4 4 0 0 1 7.5-2" strokeWidth="1.4"/><path d="M11 6a4 4 0 0 1-7.5 2" strokeWidth="1.4"/><polyline points="9.5,3 11,6 14,5.5" strokeWidth="1.4"/><polyline points="4.5,11 3,8 0.5,8.5" strokeWidth="1.4"/></I>,
  shield:      (p: IconProps) => <I {...p}><path d="M7 1L2 3.5v4c0 3.5 2.5 5.5 5 6 2.5-.5 5-2.5 5-6v-4L7 1z" strokeWidth="1.3"/></I>,
  star:        (p: IconProps) => <I {...p}><polygon points="7,1.5 8.8,5.2 13,5.7 10,8.6 10.8,12.8 7,10.8 3.2,12.8 4,8.6 1,5.7 5.2,5.2" strokeWidth="1.3"/></I>,
  lightning:   (p: IconProps) => <I {...p}><path d="M8 1.5L4 7.5h5l-3 5 6-7H7l1-4z" strokeWidth="1.3"/></I>,
  file:        (p: IconProps) => <I {...p}><path d="M3 2h6l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" strokeWidth="1.3"/><path d="M9 2v3h3" strokeWidth="1.3"/></I>,
  info:        (p: IconProps) => <I {...p}><circle cx="7" cy="7" r="5.5" strokeWidth="1.3"/><line x1="7" y1="6" x2="7" y2="10.5"/><circle cx="7" cy="4.5" r="0.6" fill="currentColor" stroke="none"/></I>,
  sun:         (p: IconProps) => <I {...p}><circle cx="7" cy="7" r="2.5" strokeWidth="1.3"/><line x1="7" y1="1" x2="7" y2="3" strokeWidth="1.4"/><line x1="7" y1="11" x2="7" y2="13" strokeWidth="1.4"/><line x1="1" y1="7" x2="3" y2="7" strokeWidth="1.4"/><line x1="11" y1="7" x2="13" y2="7" strokeWidth="1.4"/><line x1="2.9" y1="2.9" x2="4.3" y2="4.3" strokeWidth="1.4"/><line x1="9.7" y1="9.7" x2="11.1" y2="11.1" strokeWidth="1.4"/><line x1="11.1" y1="2.9" x2="9.7" y2="4.3" strokeWidth="1.4"/><line x1="4.3" y1="9.7" x2="2.9" y2="11.1" strokeWidth="1.4"/></I>,
  moon:        (p: IconProps) => <I {...p}><path d="M10.5 7a5 5 0 0 1-6.5 4.7A5 5 0 1 0 10.5 7z" strokeWidth="1.3"/></I>,
};
