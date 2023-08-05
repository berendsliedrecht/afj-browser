import { DependencyManager, InjectionSymbols } from "@aries-framework/core"
import type { Module } from "@aries-framework/core"
import { BrowserWallet } from "./browserwallet"
import { BrowserStorageService } from "./browserstorageservice"
import { BrowserKeyRepository } from "./browserkeyrepository"

export class BrowserWalletModule implements Module {
  public register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(BrowserKeyRepository)
    dependencyManager.registerContextScoped(
      InjectionSymbols.Wallet,
      BrowserWallet
    )
    dependencyManager.registerSingleton(
      InjectionSymbols.StorageService,
      BrowserStorageService
    )
  }
}
