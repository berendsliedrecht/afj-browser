import {
  EventEmitter,
  InjectionSymbols,
  inject,
  injectable,
  Repository,
  StorageService,
} from "@aries-framework/core"
import { BrowserKeyRecord } from "./browserkeyrecord"

@injectable()
export class BrowserKeyRepository extends Repository<BrowserKeyRecord> {
  public constructor(
    @inject(InjectionSymbols.StorageService)
    storageService: StorageService<BrowserKeyRecord>,
    eventEmitter: EventEmitter
  ) {
    super(BrowserKeyRecord, storageService, eventEmitter)
  }
}
