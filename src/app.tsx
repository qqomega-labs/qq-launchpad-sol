import { Providers } from "@/providers"
import { LaunchpadPage } from "@/pages/launchpad"
import { NotFoundPage } from "@/pages/not-found"

/** @dev App - renders NotFoundPage for any path other than "/". */
export default function App() {
   if (typeof window !== "undefined" && window.location.pathname !== "/") {
      return <NotFoundPage />
   }

   return (
      <Providers>
         <LaunchpadPage />
      </Providers>
   )
}
