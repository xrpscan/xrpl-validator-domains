import { decodeNodePublic } from 'ripple-address-codec'
import { encode } from 'ripple-binary-codec'
import { verify } from 'ripple-keypairs'
import { ManifestParsed, ManifestRPC, normalizeManifest } from './normalizeManifest'

interface SigningManifest {
  PublicKey: string
  MasterSignature?: string
  Sequence: number
  Domain?: string
  SigningPubKey?: string
  Signature?: string
}

/**
 * Verify a parsed manifest
 * 
 * @param manifest a manifest object
 */
function verifyManifestSignature(manifest: string | ManifestRPC | ManifestParsed): boolean {
  const m = normalizeManifest(manifest)

  const sig = m['master_signature'] || m['signature']
  const signature = sig && Buffer.from(sig, 'hex').toString('hex')

  if(signature === undefined)
    throw new Error("No signature was provided")  

  let signed: SigningManifest = {
        Domain: m['domain'],
        PublicKey: m['master_key'],
        SigningPubKey: m['ephemeral_key'],
        Sequence: m['seq'],
  }

  if(signed['Domain'])
      signed['Domain'] = Buffer.from(signed['Domain']).toString('hex')

  if(signed['PublicKey'])
      signed['PublicKey'] = decodeNodePublic(signed['PublicKey']).toString('hex')

  if(signed['SigningPubKey'])
      signed['SigningPubKey'] = decodeNodePublic(signed['SigningPubKey']).toString('hex')
      
  const signed_bytes = encode(signed)

  const manifestPrefix = Buffer.from("MAN\0")
  const data = Buffer.concat([manifestPrefix, Buffer.from(signed_bytes, 'hex')]).toString('hex')
  const key = Buffer.from(signed['PublicKey'], 'hex').toString('hex')

  return verify(data, signature, key)
}

export {
  verifyManifestSignature,
}
