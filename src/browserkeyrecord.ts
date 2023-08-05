import {
  BaseRecord,
  KeyType,
  TagsBase,
  Buffer,
  Key,
} from "@aries-framework/core"
import {
  extractPublicKeyFromSecretKey,
  generateKeyPair,
  generateKeyPairFromSeed,
  sign,
} from "@stablelib/ed25519"

export class BrowserKeyRecordProps {
  keyType: KeyType

  publicKey: Array<number>
  secretKey?: Array<number>
}

export class BrowserKeyRecord
  extends BaseRecord
  implements BrowserKeyRecordProps
{
  public id: string
  public keyType: KeyType
  public publicKey: Array<number>
  public secretKey?: Array<number>

  public static readonly type = "BrowserKeyRecord"
  public readonly type = BrowserKeyRecord.type

  public constructor(props: BrowserKeyRecordProps) {
    super()

    if (props) {
      const k = new Key(Uint8Array.from(props.publicKey), props.keyType)
      this.id = `${k.keyType}::${k.publicKeyBase58}`
      this.createdAt = new Date()
      this.keyType = props.keyType
      this.publicKey = props.publicKey
      this.secretKey = props.secretKey
    }
  }

  public getTags(): TagsBase {
    return {
      ...this._tags,
      keyType: this.keyType,
    }
  }

  public get key() {
    return Key.fromPublicKey(Uint8Array.from(this.publicKey), this.keyType)
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
      secretKey: [...secretKey],
      publicKey: [...publicKey],
      keyType,
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
      publicKey: [...kp.publicKey],
      secretKey: [...kp.secretKey],
    })
  }

  public static generate({ keyType }: { keyType: KeyType }) {
    if (keyType !== KeyType.Ed25519) throw new Error("Unsupported key type")

    const kp = generateKeyPair()

    return new BrowserKeyRecord({
      keyType,
      publicKey: [...kp.publicKey],
      secretKey: [...kp.secretKey],
    })
  }

  public sign({ data }: { data: Uint8Array }): Uint8Array {
    if (Array.isArray(data[0])) {
      throw new Error("cannot sign multiple items")
    }

    console.log(this.secretKey)

    return sign(Uint8Array.from(this.secretKey), data)
  }
}
