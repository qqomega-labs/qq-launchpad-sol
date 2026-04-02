import { describe, it, expect } from "vitest"

/**
 * @dev Validates the input sanitization logic from swap-input.tsx onChange handler.
 *
 * Security context: user-typed swap amounts are the primary input boundary.
 * The regex /^\d*\.?\d*$/ + comma-to-dot normalization ensures only valid
 * decimal strings reach parseTokenAmount() and the swap execution pipeline.
 * Combined with maxLength=20 on the input element, this prevents:
 *   - Non-numeric character injection
 *   - Scientific notation (e.g. "1e18" producing unexpectedly large amounts)
 *   - Negative amounts
 *   - Multiple decimal points
 */
const AMOUNT_REGEX = /^\d*\.?\d*$/

/** @dev Mirrors the onChange handler from swap-input.tsx:117-118 */
function sanitizeInput(raw: string): string | null {
   const v = raw.replace(",", ".")
   if (v === "" || AMOUNT_REGEX.test(v)) return v
   return null
}

describe("swap input sanitization", () => {
   describe("valid inputs", () => {
      it("accepts integer", () => {
         expect(sanitizeInput("100")).toBe("100")
      })

      it("accepts decimal", () => {
         expect(sanitizeInput("1.5")).toBe("1.5")
      })

      it("accepts leading decimal (e.g. .5)", () => {
         expect(sanitizeInput(".5")).toBe(".5")
      })

      it("accepts trailing decimal (user still typing)", () => {
         expect(sanitizeInput("1.")).toBe("1.")
      })

      it("accepts zero", () => {
         expect(sanitizeInput("0")).toBe("0")
      })

      it("accepts empty string (clearing input)", () => {
         expect(sanitizeInput("")).toBe("")
      })

      it("normalizes comma to dot (EU decimal separator)", () => {
         expect(sanitizeInput("1,5")).toBe("1.5")
      })

      it("accepts long decimal (within maxLength=20)", () => {
         expect(sanitizeInput("0.123456789")).toBe("0.123456789")
      })

      it("accepts large integer", () => {
         expect(sanitizeInput("99999999")).toBe("99999999")
      })
   })

   describe("rejected inputs", () => {
      it("rejects alphabetic characters", () => {
         expect(sanitizeInput("abc")).toBeNull()
      })

      it("rejects mixed alphanumeric", () => {
         expect(sanitizeInput("1a2b")).toBeNull()
      })

      it("rejects negative sign", () => {
         expect(sanitizeInput("-1")).toBeNull()
      })

      it("rejects positive sign", () => {
         expect(sanitizeInput("+1")).toBeNull()
      })

      it("rejects scientific notation (would produce huge amounts)", () => {
         expect(sanitizeInput("1e18")).toBeNull()
      })

      it("rejects uppercase scientific notation", () => {
         expect(sanitizeInput("1E9")).toBeNull()
      })

      it("rejects multiple decimal points", () => {
         expect(sanitizeInput("1.2.3")).toBeNull()
      })

      it("rejects spaces", () => {
         expect(sanitizeInput("1 000")).toBeNull()
      })

      it("rejects special characters", () => {
         expect(sanitizeInput("100$")).toBeNull()
      })

      it("rejects HTML/script injection", () => {
         expect(sanitizeInput("<script>alert(1)</script>")).toBeNull()
      })

      it("rejects unicode digits (Arabic-Indic)", () => {
         expect(sanitizeInput("\u0661\u0662\u0663")).toBeNull()
      })

      it("rejects hex notation", () => {
         expect(sanitizeInput("0xFF")).toBeNull()
      })

      it("rejects whitespace-only", () => {
         expect(sanitizeInput(" ")).toBeNull()
      })

      it("rejects tab character", () => {
         expect(sanitizeInput("\t")).toBeNull()
      })

      it("rejects newline", () => {
         expect(sanitizeInput("\n")).toBeNull()
      })
   })
})
