import { Buffer } from "buffer"
if (!globalThis.Buffer) globalThis.Buffer = Buffer

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "@/app"
import "@/styles/index.css"

createRoot(document.getElementById("root")!).render(
   <StrictMode>
      <App />
   </StrictMode>
)
