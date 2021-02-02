import { decodeNodePublic } from 'ripple-address-codec'
import { verify } from 'ripple-keypairs'

import verifyManifestSignature from './manifest'
import fetchToml from './network'
import {
  normalizeManifest,
  ManifestParsed,
  StreamManifest,
  Manifest,
} from './normalizeManifest'

interface Validator {
  public_key: string
  attestation: string
}

/**
 * Verifies the signature and domain associated with a manifest.
 *
 * @param manifest - The signed manifest that contains the validator's domain.
 * @returns A verified, message, and the verified manifest.
 */
// eslint-disable-next-line max-lines-per-function -- Necessary use of extra lines.
async function verifyValidatorDomain(
  manifest: string | ManifestParsed | StreamManifest | Manifest,
): Promise<{
  verified: boolean
  verified_manifest_signature: boolean
  message: string
  manifest?: Manifest
}> {
  const normalizedManifest = normalizeManifest(manifest)

  const domain = normalizedManifest.domain
  const publicKey = normalizedManifest.master_key
  const decodedPubKey = decodeNodePublic(publicKey).toString('hex')

  if (!verifyManifestSignature(normalizedManifest)) {
    return {
      verified: false,
      verified_manifest_signature: false,
      message: 'Cannot verify manifest signature',
      manifest: normalizedManifest,
    }
  }

  if (domain === undefined) {
    return {
      verified: false,
      verified_manifest_signature: true,
      message: 'Manifest does not contain a domain',
      manifest: normalizedManifest,
    }
  }

  const validatorInfo = await fetchToml(domain)
  if (!validatorInfo.VALIDATORS) {
    return {
      verified: false,
      verified_manifest_signature: true,
      message: 'Invalid .toml file',
      manifest: normalizedManifest,
    }
  }

  const message = `[domain-attestation-blob:${domain}:${publicKey}]`
  const message_bytes = Buffer.from(message).toString('hex')

  const validators = validatorInfo.VALIDATORS.filter(
    (validator: Validator) => validator.public_key === publicKey,
  )
  if (validators.length === 0) {
    return {
      verified: false,
      verified_manifest_signature: true,
      message: '.toml file does not have matching public key',
      manifest: normalizedManifest,
    }
  }

  for (const validator of validators) {
    const attestation = Buffer.from(validator.attestation, 'hex').toString(
      'hex',
    )

    const failedToVerify = {
      verified: false,
      verified_manifest_signature: true,
      message: `Invalid attestation, cannot verify ${domain}`,
      manifest: normalizedManifest,
    }

    let verified: boolean
    try {
      verified = verify(message_bytes, attestation, decodedPubKey)
    } catch (_u) {
      return failedToVerify
    }

    if (!verified) {
      return failedToVerify
    }
  }

  return {
    verified: true,
    verified_manifest_signature: true,
    message: `${domain} has been verified`,
    manifest: normalizedManifest,
  }
}

export {
  verifyValidatorDomain,
  verifyManifestSignature,
  normalizeManifest,
  Manifest,
  StreamManifest,
  ManifestParsed,
}
