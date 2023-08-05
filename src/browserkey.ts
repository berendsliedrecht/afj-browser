import { Buffer, Key, KeyType } from "@aries-framework/core"
import {
  generateKeyPair as ed25519GenerateKeyPair,
  generateKeyPairFromSeed as ed25519GenerateKeyPairFromSeed,
  extractPublicKeyFromSecretKey as ed25519ExtractPublicKeyFromSecretKey,
  sign as ed25519Sign,
  convertPublicKeyToX25519,
  convertSecretKeyToX25519,
} from "@stablelib/ed25519"
import { chacha20 } from "@noble/ciphers/chacha"
import { randomBytes } from "@noble/ciphers/webcrypto/utils"

export enum BrowserKeyAlgorithm {
  Ed25519 = "ed25519",
  X25519 = "x25519",
  Chacha20C20P = "c20p",
}

export const browserKeyAlgorithmToKeyType = (bka: BrowserKeyAlgorithm) => {
  switch (bka) {
    case BrowserKeyAlgorithm.Ed25519:
      return KeyType.Ed25519
    case BrowserKeyAlgorithm.X25519:
      return KeyType.X25519
    default:
      throw new Error(`Could not convert browser key algorithm: ${bka}`)
  }
}

export const keyTypeToBrowserAlgorithm = (kt: KeyType) => {
  switch (kt) {
    case KeyType.Ed25519:
      return BrowserKeyAlgorithm.Ed25519
    case KeyType.X25519:
      return BrowserKeyAlgorithm.X25519
    default:
      throw new Error(`Could not convert key type: ${kt}`)
  }
}

export class BrowserKey {
  public secretKey?: Uint8Array
  public publicKey?: Uint8Array
  public algorithm: BrowserKeyAlgorithm

  public constructor({
    secretKey,
    publicKey,
    algorithm,
  }: {
    secretKey?: Uint8Array
    publicKey?: Uint8Array
    algorithm: BrowserKeyAlgorithm
  }) {
    this.secretKey = secretKey
    this.publicKey = publicKey
    this.algorithm = algorithm
  }

  public get keyType() {
    return browserKeyAlgorithmToKeyType(this.algorithm)
  }

  public get key() {
    if (!this.publicKey) {
      throw new Error("Could not convert to Key as there is no public key")
    }
    return new Key(this.publicKey, browserKeyAlgorithmToKeyType(this.algorithm))
  }

  public static fromPublicBytes({
    algorithm,
    publicKey,
  }: {
    publicKey: Buffer
    algorithm: BrowserKeyAlgorithm
  }): BrowserKey {
    switch (algorithm) {
      case BrowserKeyAlgorithm.Ed25519:
        return new BrowserKey({ publicKey, algorithm })
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }

  public static fromSecretBytes({
    algorithm,
    secretKey,
  }: {
    secretKey: Buffer
    algorithm: BrowserKeyAlgorithm
  }): BrowserKey {
    switch (algorithm) {
      case BrowserKeyAlgorithm.Ed25519:
        const publicKey = ed25519ExtractPublicKeyFromSecretKey(secretKey)
        return new BrowserKey({ publicKey, algorithm })
      case BrowserKeyAlgorithm.Chacha20C20P:
        if (secretKey.length !== 32) {
          throw new Error("c20p needs a key length of 32")
        }
        return new BrowserKey({ secretKey, algorithm })
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }

  public static fromSeed({
    algorithm,
    seed,
  }: {
    seed: Buffer
    algorithm: BrowserKeyAlgorithm
  }): BrowserKey {
    switch (algorithm) {
      case BrowserKeyAlgorithm.Ed25519:
        const keyPair = ed25519GenerateKeyPairFromSeed(seed)
        return new BrowserKey({ algorithm, ...keyPair })
      case BrowserKeyAlgorithm.Chacha20C20P:
        return BrowserKey.fromSecretBytes({ algorithm, secretKey: seed })
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }

  public static generate(algorithm: BrowserKeyAlgorithm): BrowserKey {
    switch (algorithm) {
      case BrowserKeyAlgorithm.Ed25519:
        const keyPair = ed25519GenerateKeyPair()
        return new BrowserKey({ algorithm, ...keyPair })
      case BrowserKeyAlgorithm.Chacha20C20P:
        const key = randomBytes(32)
        return new BrowserKey({ secretKey: key, algorithm })
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }

  public convertKey({
    algorithm,
  }: {
    algorithm: BrowserKeyAlgorithm
  }): BrowserKey {
    const srcAlgorithm = this.algorithm
    const destAlgorithm = algorithm
    switch (srcAlgorithm) {
      case BrowserKeyAlgorithm.Ed25519:
        if (destAlgorithm !== BrowserKeyAlgorithm.X25519) {
          throw new Error("ed25519 keys can only be converted to x25519")
        }
        const secretKey = this.secretKey
          ? convertSecretKeyToX25519(this.secretKey)
          : undefined
        const publicKey = this.publicKey
          ? convertPublicKeyToX25519(this.publicKey)
          : undefined
        return new BrowserKey({
          algorithm: destAlgorithm,
          secretKey,
          publicKey,
        })
      default:
        throw new Error(
          `Cannot convert key with source algorithm: ${srcAlgorithm}`
        )
    }
  }

  public sign(data: Uint8Array): Uint8Array {
    if (!this.secretKey)
      throw Error(`No secret key found for public key ${this.publicKey}`)

    switch (this.algorithm) {
      case BrowserKeyAlgorithm.Ed25519:
        return ed25519Sign(this.secretKey, data)
      default:
        throw new Error(
          `Unsupported key algorithm for signing: ${this.algorithm}`
        )
    }
  }

  public encrypt(data: Uint8Array): Uint8Array {
    if (!this.secretKey)
      throw Error(`No secret key found for public key ${this.publicKey}`)

    switch (this.algorithm) {
      case BrowserKeyAlgorithm.Chacha20C20P:
        const nonce = randomBytes(24)
        return chacha20(this.secretKey, nonce, data)
      default:
        throw new Error(
          `Unsupported key algorithm for encryption: ${this.algorithm}`
        )
    }
  }
}
