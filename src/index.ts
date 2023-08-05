import sodium from "libsodium-wrappers"
import {
  Agent,
  ConsoleLogger,
  DidsModule,
  HttpOutboundTransport,
  KeyDidRegistrar,
  KeyDidResolver,
  LogLevel,
  MediationRecipientModule,
  PeerDidRegistrar,
  PeerDidResolver,
  WsOutboundTransport,
} from "@aries-framework/core"
import { EventEmitter } from "events"
import { BrowserFileSystem } from "./browserfilesystem"
import { BrowserWalletModule } from "./browserwalletmodule"
import WebSocket from "isomorphic-ws"

await sodium.ready
window.sodium = sodium

export const logger = new ConsoleLogger(LogLevel.test)

const agent = new Agent({
  config: {
    label: "browseragent",
    logger,
    walletConfig: { id: "some-id", key: "some-key" },
  },
  modules: {
    dids: new DidsModule({
      resolvers: [new PeerDidResolver(), new KeyDidResolver()],
      registrars: [new KeyDidRegistrar(), new PeerDidRegistrar()],
    }),
    browserWallet: new BrowserWalletModule(),
    mediationRecipient: new MediationRecipientModule({
      mediatorInvitationUrl:
        "https://mediator.dev.animo.id/invite?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiIyMDc1MDM4YS05ZGU3LTRiODItYWUxYi1jNzBmNDg4MjYzYTciLCJsYWJlbCI6IkFuaW1vIE1lZGlhdG9yIiwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwiaGFuZHNoYWtlX3Byb3RvY29scyI6WyJodHRwczovL2RpZGNvbW0ub3JnL2RpZGV4Y2hhbmdlLzEuMCIsImh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUtMCIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHBzOi8vbWVkaWF0b3IuZGV2LmFuaW1vLmlkIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtvSG9RTUphdU5VUE5OV1pQcEw3RGs1SzNtQ0NDMlBpNDJGY3FwR25iampMcSJdLCJyb3V0aW5nS2V5cyI6W119LHsiaWQiOiIjaW5saW5lLTEiLCJzZXJ2aWNlRW5kcG9pbnQiOiJ3c3M6Ly9tZWRpYXRvci5kZXYuYW5pbW8uaWQiLCJ0eXBlIjoiZGlkLWNvbW11bmljYXRpb24iLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa29Ib1FNSmF1TlVQTk5XWlBwTDdEazVLM21DQ0MyUGk0MkZjcXBHbmJqakxxIl0sInJvdXRpbmdLZXlzIjpbXX1dfQ",
    }),
  },
  dependencies: {
    fetch,
    FileSystem: BrowserFileSystem,
    WebSocketClass: WebSocket,
    EventEmitterClass: EventEmitter,
  },
})

agent.registerOutboundTransport(new HttpOutboundTransport())
agent.registerOutboundTransport(new WsOutboundTransport())

await agent.initialize()
