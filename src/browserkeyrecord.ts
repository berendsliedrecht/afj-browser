import { BaseRecord, TagsBase, Key } from "@aries-framework/core"
import { BrowserKey } from "./browserkey"

export class BrowserKeyRecordProps {
  browserKey: BrowserKey
}

export class BrowserKeyRecord
  extends BaseRecord
  implements BrowserKeyRecordProps
{
  public id: string

  // TODO: transforming this should convert the Uint8Arrays correctly
  public browserKey: BrowserKey

  public static readonly type = "BrowserKeyRecord"
  public readonly type = BrowserKeyRecord.type

  public constructor(props: BrowserKeyRecordProps) {
    super()

    if (props) {
      const k = new Key(
        Uint8Array.from(props.browserKey.publicKey),
        props.browserKey.keyType
      )
      this.id = `${k.keyType}::${k.publicKeyBase58}`
      this.createdAt = new Date()
      this.browserKey = props.browserKey
    }
  }

  public getTags(): TagsBase {
    return {
      ...this._tags,
      algorithm: this.browserKey.algorithm,
    }
  }
}
