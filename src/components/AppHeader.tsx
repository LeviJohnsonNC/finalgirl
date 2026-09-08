interface AppHeaderProps {
  onNavigateHome: () => void;
}

export const AppHeader = ({ onNavigateHome }: AppHeaderProps) => {
  return (
    <button
      onClick={onNavigateHome}
      className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-12 md:left-12 z-40 text-left hover:opacity-80 transition-opacity cursor-pointer min-h-[44px] safe-area-top"
    >
      <h1 
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-wider text-foreground/65 mb-0.5 sm:mb-1 drop-shadow-lg"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500, textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
      >
        FINAL GIRL
      </h1>
      <p 
        className="text-base md:text-lg tracking-[0.2em] sm:tracking-[0.3em] uppercase text-foreground/50 drop-shadow-md"
        style={{ fontFamily: 'var(--font-vhs)', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
      >
        <span className="text-primary/50">Unofficial</span> Case Files
      </p>
    </button>
  );
};
