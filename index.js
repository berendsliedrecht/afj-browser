import {
  InjectionSymbols,
  Agent,
  ConsoleLogger,
  LogLevel,
  Key,
} from "@aries-framework/core";
import { EventEmitter } from "events";

class BrowserWallet {
  isInitialized = false;
  isProvisioned = false;
  supportedKeyTypes = ["ed25519"];

  create(_cfg) {}
  createAndOpen(_cfg) {}
  open(_cfg) {}
  rotateKey(_cfg) {}
  close() {}
  delete() {}
  export(_cfg) {}
  import(_wcfg, _isfg) {}
  createKey(_opt) {
    switch (_opt.keyType) {
      case "ed25519":
        return Key.fromPublicKeyBase58("abc");
    }
  }
  sign(_opt) {}
  verify(_opt) {}
  pack(_pyd, _rks, _svk) {}
  unpack(_ems) {}
  generateNonce() {}
  generateWalletKey() {}
}

class BrowserStorageService {
  save(_cxt, record) {
    localStorage.setItem(record.id, JSON.stringify(record));
  }
  update(_cxt, record) {
    localStorage.setItem(record.id, JSON.stringify(record));
  }
  delete(_cxt, record) {
    localStorage.removeItem(record.id);
  }
  deleteById(_cxt, _cls, id) {
    localStorage.removeItem(id);
  }
  getById(_cxt, _cls, id) {
    return JSON.parse(localStorage.getItem(id));
  }
  getAll(_cxt, _cls) {
    const items = [];
    for (const i = 0; i <= localStorage.length; i++) {
      const key = localStorage.key(i);
      items.push(this.getById(key));
    }
    return items;
  }
  findByQuery(_cxt, _cls, qry) {
    return [this.getById("MEDIATOR_ROUTING_RECORD")];
  }
}

class BrowserWalletModule {
  register(dependencyManager) {
    dependencyManager.registerContextScoped(
      InjectionSymbols.Wallet,
      BrowserWallet
    );
    dependencyManager.registerSingleton(
      InjectionSymbols.StorageService,
      BrowserStorageService
    );
  }
}

class MockFs {
  dataPath = "";
  cachePath = "";
  tempPath = "";
  exists(_opt) {}
  createDirectory(_pth) {}
  copyFile(_spt, _dpt) {}
  write(_pth, _dta) {}
  read(_pth) {}
  delete(_pth) {}
  downloadToFile(_url, _pth, _opt) {}
}

const agent = new Agent({
  config: {
    label: "a",
    logger: new ConsoleLogger(LogLevel.test),
    walletConfig: { id: "some-id", key: "some-key" },
  },
  modules: {
    wallet: new BrowserWalletModule(),
  },
  dependencies: {
    fetch,
    FileSystem: MockFs,
    WebSocketClass: WebSocket,
    EventEmitterClass: EventEmitter,
  },
});

void (async () => {
  await agent.initialize();
  console.log("initialized!");
})();
