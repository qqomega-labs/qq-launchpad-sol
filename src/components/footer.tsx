import { cn } from "@/lib/utils"
import { AUTHOR } from "@/config/const"
import { version } from "../../package.json"

/**
 * @dev Footer.
 */
export function Footer() {
   return (
      <footer
         className={cn(
            "h-12 flex items-center justify-center",
            "px-4 md:px-6 border-t border-border",
            "backdrop-blur-[64px] backdrop-saturate-[120%]",
            "text-text-muted text-xs"
         )}
      >
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
         <span className="ml-2 text-text-muted/60 font-mono">v{version}</span>
      </footer>
   )
}
