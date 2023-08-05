import {
  EventEmitter,
  InjectionSymbols,
  inject,
  injectable,
  Repository,
  StorageService,
  Key,
  AgentContext,
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
}
