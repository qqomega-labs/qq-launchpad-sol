import { AUTHOR } from "@/config/const";

/**
 * @dev Footer.
 */
export function Footer() {
  return (
    <footer className="h-12 flex items-center justify-center px-4 md:px-6 border-t border-border backdrop-blur-[64px] backdrop-saturate-[120%] text-text-muted text-xs">
      <a
        key={AUTHOR.key}
        href={AUTHOR.href}
        target="_blank"
        rel="noopener noreferrer"
        title={AUTHOR.label}
        className="text-text-muted hover:text-accent transition-colors duration-200"
      >
        &copy; 2026 QQ Omega Labs
      </a>
    </footer>
  );
}
