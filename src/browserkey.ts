import { Buffer, Key, KeyType } from "@aries-framework/core"
import {
  KeyPair,
  generateKeyPair,
  generateKeyPairFromSeed,
  extractPublicKeyFromSecretKey,
} from "@stablelib/ed25519"

export class BrowserKey {
  public static fromSecretBytes({
    keyType,
    secretKey,
  }: {
    secretKey: Buffer
    keyType: KeyType
  }): Key {
    let pk: Uint8Array
    switch (keyType) {
      case KeyType.Ed25519:
        pk = extractPublicKeyFromSecretKey(secretKey)
        break
      default:
        throw new Error(`Unsupported key type: ${keyType}`)
    }
    return new Key(pk, keyType)
  }

  public static fromSeed({
    keyType,
    seed,
  }: {
    seed: Buffer
    keyType: KeyType
  }): Key {
    let kp: KeyPair
    switch (keyType) {
      case KeyType.Ed25519:
        kp = generateKeyPairFromSeed(seed)
        break
      default:
        throw new Error(`Unsupported key type: ${keyType}`)
    }
    return new Key(kp.publicKey, keyType)
  }

  public static generate(keyType: KeyType): Key {
    let kp: KeyPair
    switch (keyType) {
      case KeyType.Ed25519:
        kp = generateKeyPair()
        break
      default:
        throw new Error(`Unsupported key type: ${keyType}`)
    }
    return new Key(kp.publicKey, keyType)
  }
}
