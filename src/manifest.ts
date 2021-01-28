import { decodeNodePublic } from 'ripple-address-codec'
import { encode } from 'ripple-binary-codec'
import { verify } from 'ripple-keypairs'

import {
  Manifest,
  ManifestParsed,
  StreamManifest,
  normalizeManifest,
} from './normalizeManifest'

interface SigningManifest {
  PublicKey: string
  MasterSignature?: string
  Sequence: number
  Domain?: string
  SigningPubKey?: string
  Signature?: string
}

/**
 * Verify a parsed manifest signature.
 *
 * @param manifest - A manifest object.
 * @throws If no signature is provided.
 * @returns True if the manifest signature is valid.
 */
function verifyManifestSignature(
  manifest: string | StreamManifest | ManifestParsed | Manifest,
): boolean {
  const normalized = normalizeManifest(manifest)

  const sig = normalized.master_signature || normalized.signature
  const signature = sig && Buffer.from(sig, 'hex').toString('hex')

  if (signature === undefined) {
    throw new Error('No signature was provided')
  }

  const signed: SigningManifest = {
    Domain: normalized.domain,
    PublicKey: normalized.master_key,
    SigningPubKey: normalized.signing_key,
    Sequence: normalized.seq,
  }

  if (signed.Domain) {
    signed.Domain = Buffer.from(signed.Domain).toString('hex')
  }

  if (signed.PublicKey) {
    signed.PublicKey = decodeNodePublic(signed.PublicKey).toString('hex')
  }

  if (signed.SigningPubKey) {
    signed.SigningPubKey = decodeNodePublic(signed.SigningPubKey).toString(
      'hex',
    )
  }

  const signed_bytes = encode(signed)

  const manifestPrefix = Buffer.from('MAN\0')
  const data = Buffer.concat([
    manifestPrefix,
    Buffer.from(signed_bytes, 'hex'),
  ]).toString('hex')
  const key = Buffer.from(signed.PublicKey, 'hex').toString('hex')

  try {
    return verify(data, signature, key)
  } catch {
    return false
  }
}

export default verifyManifestSignature
