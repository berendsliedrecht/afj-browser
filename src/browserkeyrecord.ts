import {
  BaseRecord,
  KeyType,
  TagsBase,
  utils,
  Buffer,
  Key,
} from "@aries-framework/core"
import {
  extractPublicKeyFromSecretKey,
  generateKeyPair,
  generateKeyPairFromSeed,
} from "@stablelib/ed25519"

export class BrowserKeyRecordProps {
  id?: string
  keyType: KeyType
  publicKey: Buffer
  secretKey?: Buffer
  key: Key
}

export class BrowserKeyRecord
  extends BaseRecord
  implements BrowserKeyRecordProps
{
  public id: string
  public keyType: KeyType
  public publicKey: Buffer
  public secretKey?: Buffer
  public key: Key

  public static readonly type = "BrowserKeyRecord"
  public readonly type = BrowserKeyRecord.type

  public constructor(props: BrowserKeyRecordProps) {
    super()

    if (props) {
      this.id = props.id ?? utils.uuid()
      this.createdAt = new Date()
      this.keyType = props.keyType
      this.publicKey = props.publicKey
      this.secretKey = props.secretKey
      this.key = props.key
    }
  }

  public getTags(): TagsBase {
    return {
      ...this._tags,
      keyType: this.keyType,
    }
  }

  public static fromSecretBytes({
    secretKey,
    keyType,
  }: {
    secretKey: Buffer
    keyType: KeyType
  }) {
    if (keyType !== KeyType.Ed25519) throw new Error("Unsupported key type")
    const publicKey = Buffer.from(extractPublicKeyFromSecretKey(secretKey))

    return new BrowserKeyRecord({
      secretKey,
      publicKey,
      keyType,
      key: new Key(publicKey, keyType),
    })
  }

  public static fromSeed({
    keyType,
    seed,
  }: {
    seed: Buffer
    keyType: KeyType
  }) {
    if (keyType !== KeyType.Ed25519) throw new Error("Unsupported key type")

    const kp = generateKeyPairFromSeed(seed)

    return new BrowserKeyRecord({
      keyType,
      publicKey: Buffer.from(kp.publicKey),
      secretKey: Buffer.from(kp.secretKey),
      key: new Key(Buffer.from(kp.publicKey), keyType),
    })
  }

  public static generate({ keyType }: { keyType: KeyType }) {
    if (keyType !== KeyType.Ed25519) throw new Error("Unsupported key type")

    const kp = generateKeyPair()

    return new BrowserKeyRecord({
      keyType,
      publicKey: Buffer.from(kp.publicKey),
      secretKey: Buffer.from(kp.secretKey),
      key: new Key(Buffer.from(kp.publicKey), keyType),
    })
  }
}
