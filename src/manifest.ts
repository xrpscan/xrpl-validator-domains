import * as elliptic from 'elliptic'
import { decodeNodePublic, encodeNodePublic } from 'ripple-address-codec'
import { encode, decode } from 'ripple-binary-codec'

const Ed25519 = new elliptic.eddsa('ed25519')

export interface Manifest {
  PublicKey: string
  MasterSignature: string
  Sequence: number
  Domain?: string
  SigningPubKey?: string
  Signature?: string
}

function isManifest(param: any): param is Manifest {
  if(typeof param !== "object")
    return false

  return (typeof param.Sequence === "number"
    && typeof param.PublicKey === "string"
    && typeof param.MasterSignature === "string")
}

/**
 * Parse a manifest.
 *
 * @param binary - Hex-string of an encoded manifest.
 * @param manifest
 */
function parseManifest(manifest: string): Manifest | null {
  let parsed
  try {
    parsed = decode(manifest)
  } catch (e) {
    return null
  }

  if(!isManifest(parsed)) {
    return null
  }

  const result : Manifest = {
    Sequence: parsed.Sequence,
    Signature: parsed.Signature,
    MasterSignature: parsed.MasterSignature,
    PublicKey: encodeNodePublic(Buffer.from(parsed.PublicKey, 'hex'))
  }

  if (parsed.Domain) {
    result.Domain = Buffer.from(parsed.Domain, 'hex').toString()
  }

  if (parsed.SigningPubKey) {
    result.SigningPubKey = encodeNodePublic(
      Buffer.from(parsed.SigningPubKey, 'hex'),
    )
  }

  return result
}

interface SigningManifest {
  PublicKey: string
  MasterSignature: undefined
  Sequence: number
  Domain?: string
  SigningPubKey?: string
  Signature: undefined
}

/**
 * Verify a parsed manifest.
 *
 * @param manifest - A manifest object.
 */
function verifyManifestSignature(manifest: Manifest): boolean {
  const signature = Buffer.from(manifest.MasterSignature, 'hex').toString('hex')

  const signed: SigningManifest = Object.assign({}, manifest,
                                    { MasterSignature: undefined,
                                    Signature: undefined,
                                    PublicKey: decodeNodePublic(manifest.PublicKey).toString('hex') })

  if (signed.Domain) {
    signed.Domain = Buffer.from(signed.Domain).toString('hex')
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

  const key = Buffer.from(signed.PublicKey, 'hex').slice(1).toString('hex')

  return Ed25519.verify(data, signature, key) as boolean
}

export {
  parseManifest,
  verifyManifestSignature,
}
