import {
  EventEmitter,
  InjectionSymbols,
  inject,
  injectable,
  Repository,
  StorageService,
  Key,
  AgentContext,
  KeyType,
} from "@aries-framework/core"
import { BrowserKeyRecord } from "./browserkeyrecord"

@injectable()
// @ts-ignore
export class BrowserKeyRepository extends Repository<BrowserKeyRecord> {
  private storageService: StorageService<BrowserKeyRecord>

  public constructor(
    @inject(InjectionSymbols.StorageService)
    storageService: StorageService<BrowserKeyRecord>,
    eventEmitter: EventEmitter
  ) {
    super(BrowserKeyRecord, storageService, eventEmitter)

    this.storageService = storageService
  }

  public async getFromKeyClass(
    agentContext: AgentContext,
    key: Key
  ): Promise<BrowserKeyRecord> {
    return this.storageService.getById(
      agentContext,
      BrowserKeyRecord,
      `${key.keyType}::${key.publicKeyBase58}`
    )
  }

  public async getFromBase58(
    agentContext: AgentContext,
    key: string,
    keyType: KeyType
  ): Promise<BrowserKeyRecord> {
    const keyCls = Key.fromPublicKeyBase58(key, keyType)
    return await this.getFromKeyClass(agentContext, keyCls)
  }
}
