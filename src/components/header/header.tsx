import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter"

import { socialLinks } from "./brand-icons"
import { truncateAddress, cn } from "@/lib/utils"
import { COLORS } from "@/config/const"

/** @dev Header. */
export function Header() {
   const { publicKey, connected, disconnect } = useWallet()
   const { setShowModal } = useUnifiedWalletContext()
   const [showDropdown, setShowDropdown] = useState(false)

   const handleWalletClick = () => {
      if (!connected) {
         setShowModal(true)
      } else {
         setShowDropdown((prev) => !prev)
      }
   }

   const handleCopy = () => {
      if (publicKey) {
         navigator.clipboard.writeText(publicKey.toBase58())
         setShowDropdown(false)
      }
   }

   const handleDisconnect = () => {
      disconnect()
      setShowDropdown(false)
   }

   return (
      <header className="glass-header h-16 landscape:h-12 flex items-center justify-between px-4 md:px-6">
         <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="QQ" className="h-8 w-8" />
            <span className="hidden md:inline text-text-muted text-sm font-medium tracking-wide">Launchpad</span>
            <span className="hidden md:inline text-text-muted text-sm font-medium tracking-wide">|</span>
            <div className="flex items-center gap-3 ml-1">
               {socialLinks.map((link) => (
                  <a
                     key={link.label}
                     href={link.href}
                     target="_blank"
                     rel="noopener noreferrer"
                     title={link.label}
                     className="text-text-muted hover:text-accent transition-colors duration-200"
                  >
                     {link.icon}
                  </a>
               ))}
            </div>
         </div>

         <div className="relative">
            <button
               onClick={handleWalletClick}
               className={cn(
                  "px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200",
                  connected
                     ? "glass-panel hover:border-border-active text-white font-mono"
                     : cn(
                          COLORS.tw.accentBg,
                          "border border-accent/35",
                          COLORS.tw.accentBgHover,
                          "hover:border-accent/50 text-white active:scale-[0.98]",
                          COLORS.tw.accentGlow
                       )
               )}
            >
               {connected && publicKey ? truncateAddress(publicKey.toBase58()) : "Connect Wallet"}
            </button>

            {showDropdown && connected && (
               <div className="absolute right-0 top-full mt-2 w-48 glass-panel-solid rounded-[8px] py-1">
                  <button
                     onClick={handleCopy}
                     className={cn(
                        "w-full text-left px-4 py-2 text-sm",
                        "text-text-secondary hover:text-white hover:bg-bg-input transition-colors"
                     )}
                  >
                     Copy Address
                  </button>
                  <button
                     onClick={handleDisconnect}
                     className={cn(
                        "w-full text-left px-4 py-2 text-sm",
                        "text-text-secondary hover:text-white hover:bg-bg-input transition-colors"
                     )}
                  >
                     Disconnect
                  </button>
               </div>
            )}
         </div>
      </header>
   )
}
