import { AskarModule } from '@credo-ts/askar';
import {
  Agent,
  ConsoleLogger,
  LogLevel,
  PeerDidNumAlgo,
} from '@credo-ts/core';
import { DidCommAutoAcceptCredential, DidCommCredentialV2Protocol, DidCommHttpOutboundTransport, DidCommJsonLdCredentialFormatService, DidCommMediatorPickupStrategy, DidCommModule, DidCommWsOutboundTransport } from '@credo-ts/didcomm';
import { agentDependencies } from '@credo-ts/react-native';
import { askar } from '@openwallet-foundation/askar-react-native';

export const holder = new Agent({
  config: {
    logger: new ConsoleLogger(LogLevel.debug),
  },
  modules: {
    askar: new AskarModule({
      askar,
      store: {
        id: 'holder-agent-id',
        key: 'holder-agent-key',
      }
    }),

    didcomm: new DidCommModule({
      connections: {
        autoAcceptConnections: true,
        peerNumAlgoForDidExchangeRequests: PeerDidNumAlgo.GenesisDoc,
      },
      mediationRecipient: {
        mediatorInvitationUrl: 'https://us-east2.public.mediator.indiciotech.io/message?oob=eyJAaWQiOiIyNzFmYTZiYS0xYmUxLTQ0ZDEtYjZlZi01ZmM2ODcyZTY4NmYiLCJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJoYW5kc2hha2VfcHJvdG9jb2xzIjpbImh0dHBzOi8vZGlkY29tbS5vcmcvZGlkZXhjaGFuZ2UvMS4wIl0sImFjY2VwdCI6WyJkaWRjb21tL2FpcDEiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il0sImxhYmVsIjoiQ2xvdWQgTWVkaWF0b3IiLCJzZXJ2aWNlcyI6W3siaWQiOiIjaW5saW5lIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtnczZNd1lCM1lnVG9aWEd3a25xQzM1MmNiSHR4SnNpM3pYWmZGMXQyZk5rVCN6Nk1rZ3M2TXdZQjNZZ1RvWlhHd2tucUMzNTJjYkh0eEpzaTN6WFpmRjF0MmZOa1QiXSwic2VydmljZUVuZHBvaW50IjoiaHR0cHM6Ly91cy1lYXN0Mi5wdWJsaWMubWVkaWF0b3IuaW5kaWNpb3RlY2guaW8vbWVzc2FnZSJ9LHsiaWQiOiIjaW5saW5lIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtnczZNd1lCM1lnVG9aWEd3a25xQzM1MmNiSHR4SnNpM3pYWmZGMXQyZk5rVCN6Nk1rZ3M2TXdZQjNZZ1RvWlhHd2tucUMzNTJjYkh0eEpzaTN6WFpmRjF0MmZOa1QiXSwic2VydmljZUVuZHBvaW50Ijoid3NzOi8vd3MudXMtZWFzdDIucHVibGljLm1lZGlhdG9yLmluZGljaW90ZWNoLmlvL3dzIn1dfQ==',
        mediatorPickupStrategy: DidCommMediatorPickupStrategy.PickUpV2
      },
      credentials: {
        autoAcceptCredentials: DidCommAutoAcceptCredential.Always,
        credentialProtocols: [
          new DidCommCredentialV2Protocol({
            credentialFormats: [new DidCommJsonLdCredentialFormatService()],
          }),
        ]
      },
    })
  },
  dependencies: agentDependencies,
});

holder.didcomm.registerOutboundTransport(new DidCommHttpOutboundTransport());
holder.didcomm.registerOutboundTransport(new DidCommWsOutboundTransport());
