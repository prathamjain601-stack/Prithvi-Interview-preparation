export const Logo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Globe Lines */}
    <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="7" />
    <path d="M60 12 C 30 12, 30 108, 60 108" stroke="currentColor" strokeWidth="7" fill="none" />
    <path d="M60 12 C 90 12, 90 108, 60 108" stroke="currentColor" strokeWidth="7" fill="none" />
    <path d="M12 60 L 108 60" stroke="currentColor" strokeWidth="7" />
    
    {/* Circuit details */}
    <path d="M5 85 Q 25 115 60 115" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <circle cx="10" cy="85" r="4" fill="currentColor" />
    <circle cx="35" cy="107" r="4" fill="currentColor" />
    
    <path d="M115 35 Q 95 5 60 5" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <circle cx="110" cy="35" r="4" fill="currentColor" />
    <circle cx="85" cy="13" r="4" fill="currentColor" />

    {/* Center Arrow */}
    <path d="M60 25 L85 75 L60 65 L35 75 Z" fill="currentColor" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    <path d="M60 65 L60 108" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
  </svg>
);
