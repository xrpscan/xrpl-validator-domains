import * as elliptic from 'elliptic'
import { decodeNodePublic } from 'ripple-address-codec'

import { Manifest, parseManifest, verifyManifestSignature } from './manifest'
import { fetchToml } from './network'

const Ed25519 = new elliptic.eddsa('ed25519')

/**
 * @param manifest
 */
async function verifyValidatorDomain(manifest: string) {
  let parsedManifest: Manifest | null = null
  try {
    parsedManifest = parseManifest(manifest)
  } catch (error) {
    return {
      status: 'error',
      message: `Cannot Parse Manifest: ${error}`,
      manifest: {},
    }
  }

  if(parsedManifest?.Domain === undefined) {
    return {
      status: 'error',
      message: 'Validator not configured for Decentralized Domain Verification',
      manifest: parsedManifest,
    }
  }

  const domain = parsedManifest.Domain

  const publicKey = parsedManifest.PublicKey
  const decodedPubKey = decodeNodePublic(publicKey).slice(1).toString('hex')

  if (!verifyManifestSignature(parsedManifest)) {
    return {
      status: 'error',
      message: 'Manifest Signature is invalid, cannot verify Domain',
      manifest: parsedManifest,
    }
  }

  const validatorInfo = await fetchToml(domain)
  const message = `[domain-attestation-blob:${domain}:${publicKey}]`
  const message_bytes = Buffer.from(message).toString('hex')

  for(let validator of validatorInfo.VALIDATORS) {
    const attestation = validator.attestation

  if (!Ed25519.verify(message_bytes, attestation, decodedPubKey)) {
      return {
        status: 'error',
        message: `Invalid attestation, cannot verify ${domain}`,
        manifest: parsedManifest,
      }
    }
  }

  return {
    status: 'success',
    message: `${domain} has been verified`,
    manifest: parsedManifest,
  }
}

export {
  verifyValidatorDomain,
}
