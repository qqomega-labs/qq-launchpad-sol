import { ArrowLeft } from "lucide-react"

/**
 * @dev NotFoundPage - rendered for any path that is not "/".
 */
export function NotFoundPage() {
   return (
      <div className="min-h-dvh flex flex-col relative bg-bg-primary">
         <div className="fixed inset-0 bg-radial-deep" />
         <div className="fixed inset-0 bg-filigree" />
         <div className="fixed inset-0 bg-vignette" />

         <div className="relative z-10 flex flex-1 items-center justify-center px-4 min-h-dvh">
            <div className="text-center">
               <h1 className="text-8xl sm:text-9xl font-bold text-accent mb-4">404</h1>
               <p className="text-xl sm:text-2xl text-text-primary mb-2">Page Not Found</p>
               <p className="text-sm sm:text-base text-text-muted mb-8">
                  The page you&apos;re looking for doesn&apos;t exist or has been moved.
               </p>
               <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 border border-accent/30 rounded-lg text-text-primary transition-all hover:bg-accent/20 hover:scale-105"
               >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
               </a>
            </div>
         </div>
      </div>
   )
}
