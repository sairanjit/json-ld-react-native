import {
  CREDENTIALS_CONTEXT_V1_URL,
  KeyType,
  TypedArrayEncoder,
} from '@aries-framework/core';
import {holder} from './holder';
import {issuer} from './issuer';

export const w3cIssuanceFlow = async () => {
  await issuer.initialize();
  await holder.initialize();
  issuer.config.logger.info('Agents initialized!');

  // Create did:key with Bls key type for issuer
  const {
    didState: {did: issuerDid},
  } = await issuer.dids.create({
    method: 'key',
    options: {
      keyType: KeyType.Ed25519,
      privateKey: TypedArrayEncoder.fromString(
        '00000000000000000000000000issuer',
      ),
    },
  });

  if (!issuerDid) {
    throw new Error('Issuer DID not created');
  }

  // Create did:key with Ed25519 key type for holder
  const {
    didState: {did: holderDid},
  } = await holder.dids.create({
    method: 'key',
    options: {
      keyType: KeyType.Ed25519,
      privateKey: TypedArrayEncoder.fromString(
        '00000000000000000000000000holder',
      ),
    },
  });

  if (!holderDid) {
    throw new Error('Holder DID not created');
  }

  const credentialOffer = await issuer.credentials.createOffer({
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
          // Added BBS proof type
          proofType: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
        },
      },
    },
    protocolVersion: 'v2',
  });

  // Create out of band invitation
  const inv = await issuer.oob.createInvitation({
    messages: [credentialOffer.message],
  });

  // Accept the invitation
  const {connectionRecord} = await holder.oob.receiveInvitation(
    inv.outOfBandInvitation,
  );

  if (!connectionRecord) {
    throw new Error('Connection not found');
  }

  // Wait for connection to be established
  await holder.connections.returnWhenIsConnected(connectionRecord.id);

  // Adding delay to ensure that the connection is established
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Get and Accept the credential
  const credentials = await holder.credentials.getAll();

  holder.config.logger.info('Credentials: ', credentials);

  // Accept the credential offer from the first credential in the list
  const credentialRecord = await holder.credentials.acceptOffer({
    credentialRecordId: credentials[0].id,
  });
};
