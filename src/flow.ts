import {
  CREDENTIALS_CONTEXT_V1_URL,
  KeyDidCreateOptions,
  TypedArrayEncoder,
} from '@credo-ts/core';
import { holder } from './holder';
import { issuer } from './issuer';
import { transformPrivateKeyToPrivateJwk } from '@credo-ts/askar';

export const w3cIssuanceFlow = async () => {
  await issuer.initialize();
  await holder.initialize();
  issuer.config.logger.info('Agents initialized!');

  const privateJwk = transformPrivateKeyToPrivateJwk({
    privateKey: TypedArrayEncoder.fromString('00000000000000000000000000issuer'),
    type: {
      kty: 'OKP',
      crv: 'Ed25519',
    },
  }).privateJwk

  const { keyId } = await issuer.kms.importKey({
    privateJwk,
  })

  const {
    didState: { did: issuerDid },
  } = await issuer.dids.create<KeyDidCreateOptions>({
    method: 'key',
    options: {
      keyId
    },
  });

  if (!issuerDid) {
    throw new Error('Issuer DID not created');
  }

  // Create did:key with Ed25519 key type for holder
  const privateJwkHolder = transformPrivateKeyToPrivateJwk({
    privateKey: TypedArrayEncoder.fromString('00000000000000000000000000holder'),
    type: {
      kty: 'OKP',
      crv: 'Ed25519',
    },
  }).privateJwk

  const { keyId: keyIdHolder } = await holder.kms.importKey({
    privateJwk: privateJwkHolder,
  })

  const {
    didState: { did: holderDid },
  } = await holder.dids.create<KeyDidCreateOptions>({
    method: 'key',
    options: {
      keyId: keyIdHolder
    },
  });

  if (!holderDid) {
    throw new Error('Holder DID not created');
  }

  const credentialOffer = await issuer.didcomm.credentials.createOffer({
    credentialFormats: {
      jsonld: {
        credential: {
          '@context': [
            CREDENTIALS_CONTEXT_V1_URL,
            'https://www.w3.org/2018/credentials/examples/v1',
          ],
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          issuer: issuerDid,
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: holderDid,
            degree: {
              type: 'BachelorDegree',
              name: 'Bachelor of Science and Arts',
            },
          },
        },
        options: {
          proofType: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
        },
      },
    },
    protocolVersion: 'v2',
  });

  // Create out of band invitation
  const inv = await issuer.didcomm.oob.createInvitation({
    messages: [credentialOffer.message],
  });

  // Accept the invitation
  const { connectionRecord } = await holder.didcomm.oob.receiveInvitation(
    inv.outOfBandInvitation,
    {
      label: "Holder"
    }
  );

  if (!connectionRecord) {
    throw new Error('Connection not found');
  }

  // Wait for connection to be established
  await holder.didcomm.connections.returnWhenIsConnected(connectionRecord.id);

  // Adding delay to ensure that the connection is established
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Get and Accept the credential
  const credentials = await holder.didcomm.credentials.getAll();

  holder.config.logger.info('Credentials: ', credentials);

  // Accept the credential offer from the first credential in the list
  const credentialRecord = await holder.didcomm.credentials.acceptOffer({
    credentialExchangeRecordId: credentials[0].id,
  });
};
