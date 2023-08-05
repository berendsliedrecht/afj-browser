import {
  DependencyManager,
  InjectionSymbols,
  Module,
} from "@aries-framework/core"
import { BrowserWallet } from "./browserwallet"
import { BrowserStorageService } from "./browserstorageservice"

export class BrowserWalletModule implements Module {
  public register(dependencyManager: DependencyManager) {
    dependencyManager.registerContextScoped(
      InjectionSymbols.Wallet,
      BrowserWallet,
    )
    dependencyManager.registerSingleton(
      InjectionSymbols.StorageService,
      BrowserStorageService,
    )
  }
}
