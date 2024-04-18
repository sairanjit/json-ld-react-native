import {AskarModule} from '@aries-framework/askar';
import {
  Agent,
  AutoAcceptCredential,
  ConnectionsModule,
  ConsoleLogger,
  CredentialsModule,
  HttpOutboundTransport,
  JsonLdCredentialFormatService,
  LogLevel,
  MediationRecipientModule,
  MediatorPickupStrategy,
  V2CredentialProtocol,
  WsOutboundTransport,
} from '@aries-framework/core';
import {agentDependencies} from '@aries-framework/react-native';
import {ariesAskar} from '@hyperledger/aries-askar-react-native';

export const holder = new Agent({
  config: {
    label: 'Holder Agent',
    walletConfig: {
      id: 'holder-agent-id',
      key: 'holder-agent-key',
    },
    logger: new ConsoleLogger(LogLevel.debug),
  },
  modules: {
    // Storage Module
    askar: new AskarModule({
      ariesAskar,
    }),

    // Connections module is enabled by default, but we can
    // override the default configuration
    connections: new ConnectionsModule({
      autoAcceptConnections: true,
    }),

    // Credentials module is enabled by default, but we can
    // override the default configuration
    credentials: new CredentialsModule({
      autoAcceptCredentials: AutoAcceptCredential.Always,

      // Only v2 supports jsonld
      credentialProtocols: [
        new V2CredentialProtocol({
          credentialFormats: [new JsonLdCredentialFormatService()],
        }),
      ],
    }),

    mediationRecipient: new MediationRecipientModule({
      mediatorInvitationUrl:
        'https://mediator.dev.animo.id/invite?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiIyMDc1MDM4YS05ZGU3LTRiODItYWUxYi1jNzBmNDg4MjYzYTciLCJsYWJlbCI6IkFuaW1vIE1lZGlhdG9yIiwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwiaGFuZHNoYWtlX3Byb3RvY29scyI6WyJodHRwczovL2RpZGNvbW0ub3JnL2RpZGV4Y2hhbmdlLzEuMCIsImh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUtMCIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHBzOi8vbWVkaWF0b3IuZGV2LmFuaW1vLmlkIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtvSG9RTUphdU5VUE5OV1pQcEw3RGs1SzNtQ0NDMlBpNDJGY3FwR25iampMcSJdLCJyb3V0aW5nS2V5cyI6W119LHsiaWQiOiIjaW5saW5lLTEiLCJzZXJ2aWNlRW5kcG9pbnQiOiJ3c3M6Ly9tZWRpYXRvci5kZXYuYW5pbW8uaWQiLCJ0eXBlIjoiZGlkLWNvbW11bmljYXRpb24iLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa29Ib1FNSmF1TlVQTk5XWlBwTDdEazVLM21DQ0MyUGk0MkZjcXBHbmJqakxxIl0sInJvdXRpbmdLZXlzIjpbXX1dfQ',
      mediatorPickupStrategy: MediatorPickupStrategy.PickUpV2,
    }),
  },
  dependencies: agentDependencies,
});

holder.registerOutboundTransport(new HttpOutboundTransport());
holder.registerOutboundTransport(new WsOutboundTransport());
