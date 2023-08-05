import {
  type KeyType,
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
} from "@aries-framework/core"
import { logger } from "."
import { BrowserKeyRecord } from "./browserkeyrecord"
import { BrowserKeyRepository } from "./browserkeyrepository"

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

    // Create key
    const keyRecord = privateKey
      ? BrowserKeyRecord.fromSecretBytes({ secretKey: privateKey, keyType })
      : seed
      ? BrowserKeyRecord.fromSeed({ seed, keyType })
      : BrowserKeyRecord.generate({ keyType })

    // @ts-ignore
    await this.browserKeyRepository.save({}, keyRecord)

    return Promise.resolve(keyRecord.key)
  }

  public sign(_: WalletSignOptions): Promise<Buffer> {
    logger.debug("called wallet.sign")
    throw new Error("Sign is not implemented.")
  }

  public verify(_options: WalletVerifyOptions): Promise<boolean> {
    logger.debug("called wallet.verify")
    throw new Error("Verify is not implemented.")
  }

  public pack(
    _payload: Record<string, unknown>,
    _recipientKeys: string[],
    _senderVerkey?: string
  ): Promise<EncryptedMessage> {
    logger.debug("called wallet.pack")
    throw new Error("Pack is not implemented.")
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
