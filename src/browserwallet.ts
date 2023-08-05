import {
  KeyType,
  type EncryptedMessage,
  type UnpackedMessageContext,
  type Wallet,
  type WalletConfig,
  type WalletConfigRekey,
  type WalletCreateKeyOptions,
  type WalletExportImportConfig,
  type WalletSignOptions,
  type WalletVerifyOptions,
  Key,
  Buffer,
  isValidSeed,
  isValidPrivateKey,
  injectable,
  WalletError,
  JsonTransformer,
  TypedArrayEncoder,
  JsonEncoder,
} from "@aries-framework/core"
import { logger } from "."
import { BrowserKeyRecord } from "./browserkeyrecord"
import { BrowserKeyRepository } from "./browserkeyrepository"
import {
  BrowserKey,
  BrowserKeyAlgorithm,
  keyTypeToBrowserAlgorithm,
} from "./browserkey"
import {
  JweEnvelope,
  JweRecipient,
} from "@aries-framework/askar/build/wallet/JweEnvelope"

@injectable()
export class BrowserWallet implements Wallet {
  private browserKeyRepository: BrowserKeyRepository

  public supportedKeyTypes: KeyType[] = []
  public isInitialized = false
  public isProvisioned = false

  public constructor(browserKeyRepository: BrowserKeyRepository) {
    this.browserKeyRepository = browserKeyRepository
  }

  public create(walletConfig: WalletConfig): Promise<void> {
    logger.debug("called wallet.create")
    return this.open(walletConfig)
  }

  public createAndOpen(walletConfig: WalletConfig): Promise<void> {
    logger.debug("called wallet.createAndOpen")
    return this.create(walletConfig)
  }

  public open(_walletConfig: WalletConfig): Promise<void> {
    logger.debug("called wallet.open")
    if (localStorage === undefined) {
      return Promise.reject("Local storage is undefined")
    } else {
      return Promise.resolve()
    }
  }

  public rotateKey(_walletConfig: WalletConfigRekey): Promise<void> {
    logger.debug("called wallet.rotateKey")
    throw new Error("Rotate key is not implemented.")
  }

  public close(): Promise<void> {
    logger.debug("called wallet.close")
    return Promise.resolve()
  }

  public delete(): Promise<void> {
    logger.debug("called wallet.delete")
    localStorage.clear()

    return Promise.resolve()
  }

  public export(_exportConfig: WalletExportImportConfig): Promise<void> {
    logger.debug("called wallet.export")
    throw new Error("Cannot create an export from local storage")
  }

  public import(
    _walletConfig: WalletConfig,
    _importConfig: WalletExportImportConfig
  ): Promise<void> {
    logger.debug("called wallet.import")
    throw new Error("Cannot import into local storage")
  }

  public async createKey({
    keyType,
    seed,
    privateKey,
  }: WalletCreateKeyOptions): Promise<Key> {
    logger.debug("called wallet.createKey")
    if (seed && privateKey) {
      throw new Error("Only one of seed and privateKey can be set")
    }

    if (seed && !isValidSeed(seed, keyType)) {
      throw new Error("Invalid seed provided")
    }

    if (privateKey && !isValidPrivateKey(privateKey, keyType)) {
      throw new Error("Invalid private key provided")
    }

    const bka = keyTypeToBrowserAlgorithm(keyType)

    // Create key
    const browserKey = privateKey
      ? BrowserKey.fromSecretBytes({ secretKey: privateKey, algorithm: bka })
      : seed
      ? BrowserKey.fromSeed({ seed, algorithm: bka })
      : BrowserKey.generate(bka)

    const browserKeyRecord = new BrowserKeyRecord({ browserKey })

    await this.browserKeyRepository
      // @ts-ignore
      .save({}, browserKeyRecord)
      .catch(console.error)

    return Promise.resolve(browserKey.key)
  }

  public async sign({ key, data }: WalletSignOptions): Promise<Buffer> {
    if (Array.isArray(data[0])) {
      throw new Error("cannot sign multiple items")
    }
    // @ts-ignore
    const keyRecord = await this.browserKeyRepository.getFromKeyClass({}, key)
    const signature = keyRecord.browserKey.sign(Uint8Array.from(data as Buffer))

    return Buffer.from(signature)
  }

  public verify(_options: WalletVerifyOptions): Promise<boolean> {
    logger.debug("called wallet.verify")
    throw new Error("Verify is not implemented.")
  }

  public async pack(
    payload: Record<string, unknown>,
    recipientKeys: string[],
    senderVerkey?: string
  ): Promise<EncryptedMessage> {
    logger.debug("called wallet.pack")
    const senderKey = senderVerkey
      ? (
          await this.browserKeyRepository.getFromBase58(
            //@ts-ignore
            {},
            senderVerkey,
            KeyType.Ed25519
          )
        ).browserKey
      : undefined

    if (senderVerkey && !senderKey) {
      throw new WalletError(
        `Unable to pack message. Sender key ${senderVerkey} not found in wallet.`
      )
    }

    const cek = BrowserKey.generate(BrowserKeyAlgorithm.Chacha20C20P)
    const senderExchangeKey = senderKey
      ? senderKey.convertKey({ algorithm: BrowserKeyAlgorithm.X25519 })
      : undefined

    const recipients: Array<JweRecipient> = []

    for (const recipientKey of recipientKeys) {
      const targetPk = BrowserKey.fromPublicBytes({
        publicKey: Key.fromPublicKeyBase58(recipientKey, KeyType.Ed25519)
          .publicKey,
        algorithm: BrowserKeyAlgorithm.Ed25519,
      }).convertKey({ algorithm: BrowserKeyAlgorithm.X25519 })

      if (senderVerkey && senderExchangeKey) {
        const encSender = window.sodium.crypto_box_seal(senderVerkey, targetPk.publicKey)
        const nonce = window.sodium.randombytes_buf(window.sodium.crypto_box_NONCEBYTES)

        const encCek = window.sodium.crypto_box_easy(
          cek.secretKey,
          nonce,
          targetPk.publicKey,
          senderExchangeKey.secretKey
        )

        recipients.push(
          new JweRecipient({
            encryptedKey: encCek,
            header: {
              kid: recipientKey,
              sender: TypedArrayEncoder.toBase64URL(encSender),
              iv: TypedArrayEncoder.toBase64URL(nonce),
            },
          })
        )
      } else {
        const encCek = window.sodium.crypto_box_seal(cek.secretKey, targetPk.publicKey)

        recipients.push(
          new JweRecipient({
            encryptedKey: encCek,
            header: {
              kid: recipientKey,
            },
          })
        )
      }
    }

    const protectedJson = {
      enc: "xchacha20poly1305_ietf",
      typ: "JWM/1.0",
      alg: senderVerkey ? "Authcrypt" : "Anoncrypt",
      recipients: recipients.map((item) => JsonTransformer.toJSON(item)),
    }

    const iv = window.sodium.randombytes_buf(window.sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES)
    const out = window.sodium.crypto_aead_chacha20poly1305_encrypt_detached(
      JSON.stringify(payload),
      JSON.stringify(protectedJson),
      null,
      iv,
      cek.secretKey
    )

    const ciphertext = out.ciphertext
    const tag = out.mac

    const envelope = new JweEnvelope({
      ciphertext: TypedArrayEncoder.toBase64URL(ciphertext),
      iv: TypedArrayEncoder.toBase64URL(iv),
      protected: JsonEncoder.toBase64URL(protectedJson),
      tag: TypedArrayEncoder.toBase64URL(tag),
    })

    return envelope.toJson() as EncryptedMessage
  }

  public unpack(
    _encryptedMessage: EncryptedMessage
  ): Promise<UnpackedMessageContext> {
    logger.debug("called wallet.unpack")
    throw new Error("Unpack is not implemented.")
  }

  public generateNonce(): Promise<string> {
    logger.debug("called wallet.generateNonce")
    throw new Error("Generate nonce is not implemented.")
  }

  public generateWalletKey(): Promise<string> {
    logger.debug("called wallet.generateWalletKey")
    throw new Error("Generate wallet key is not implemented.")
  }

  public dispose(): void | Promise<void> {
    logger.debug("called wallet.dispose")
    throw new Error("Dispose is not implemented.")
  }
}
