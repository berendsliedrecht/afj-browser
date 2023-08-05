import sodium from "libsodium-wrappers"

declare global {
  interface Window {
    sodium: typeof sodium
  }
}
