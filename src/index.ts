import { Agent, ConsoleLogger, LogLevel } from "@aries-framework/core"
import { EventEmitter } from "events"
import { BrowserFileSystem } from "./browserfs"
import { BrowserWalletModule } from "./browserwalletmodule"
import WebSocket from "isomorphic-ws"

const agent = new Agent({
  config: {
    label: "browseragent",
    logger: new ConsoleLogger(LogLevel.test),
    walletConfig: { id: "some-id", key: "some-key" },
  },
  modules: {
    browserWallet: new BrowserWalletModule(),
  },
  dependencies: {
    fetch,
    FileSystem: BrowserFileSystem,
    WebSocketClass: WebSocket,
    EventEmitterClass: EventEmitter,
  },
})

await agent.initialize()
