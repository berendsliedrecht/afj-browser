import type {
  KeyType,
  EncryptedMessage,
  UnpackedMessageContext,
  Wallet,
  WalletConfig,
  WalletConfigRekey,
  WalletCreateKeyOptions,
  WalletExportImportConfig,
  WalletSignOptions,
  WalletVerifyOptions,
  Key,
  Buffer,
} from "@aries-framework/core"

export class BrowserWallet implements Wallet {
  public supportedKeyTypes: KeyType[] = []
  public isInitialized = false
  public isProvisioned = false

  public create(walletConfig: WalletConfig): Promise<void> {
    return this.open(walletConfig)
  }

  public createAndOpen(walletConfig: WalletConfig): Promise<void> {
    return this.create(walletConfig)
  }

  public open(_walletConfig: WalletConfig): Promise<void> {
    if (localStorage === undefined) {
      return Promise.reject("Local storage is undefined")
    } else {
      return Promise.resolve()
    }
  }

  public rotateKey(_walletConfig: WalletConfigRekey): Promise<void> {
    throw new Error("Rotate key is not implemented.")
  }

  public close(): Promise<void> {
    return Promise.resolve()
  }

  public delete(): Promise<void> {
    localStorage.clear()

    return Promise.resolve()
  }

  public export(_exportConfig: WalletExportImportConfig): Promise<void> {
    throw new Error("Cannot create an export from local storage")
  }

  public import(
    _walletConfig: WalletConfig,
    _importConfig: WalletExportImportConfig
  ): Promise<void> {
    throw new Error("Cannot import into local storage")
  }

  public createKey(_options: WalletCreateKeyOptions): Promise<Key> {
    throw new Error("Create key is not implemented.")
  }

  public sign(_options: WalletSignOptions): Promise<Buffer> {
    throw new Error("Sign is not implemented.")
  }

  public verify(_options: WalletVerifyOptions): Promise<boolean> {
    throw new Error("Verify is not implemented.")
  }

  public pack(
    _payload: Record<string, unknown>,
    _recipientKeys: string[],
    _senderVerkey?: string
  ): Promise<EncryptedMessage> {
    throw new Error("Pack is not implemented.")
  }

  public unpack(
    _encryptedMessage: EncryptedMessage
  ): Promise<UnpackedMessageContext> {
    throw new Error("Unpack is not implemented.")
  }

  public generateNonce(): Promise<string> {
    throw new Error("Generate nonce is not implemented.")
  }

  public generateWalletKey(): Promise<string> {
    throw new Error("Generate wallet key is not implemented.")
  }

  public dispose(): void | Promise<void> {
    throw new Error("Dispose is not implemented.")
  }
}
