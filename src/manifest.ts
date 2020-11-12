import { decodeNodePublic, encodeNodePublic } from 'ripple-address-codec'
import { encode, decode } from 'ripple-binary-codec'
import { verify } from 'ripple-keypairs'

export interface ManifestNew {
  PublicKey: string
  MasterSignature: string
  Sequence: number
  Domain?: string
  SigningPubKey?: string
  Signature?: string
}

export interface ManifestOld {
  master_key: string,
  master_signature: string,
  seq: number,
  domain?: string
  signing_key?: string
  signature?: string
}

interface SigningManifest {
  PublicKey: string
  MasterSignature?: string
  Sequence: number
  Domain?: string
  SigningPubKey?: string
  Signature?: string
}

/**
 * @param param tests if a parameter is a Manifest
 */
export function isManifestNew(param: any): param is ManifestNew {
  if(typeof param !== "object")
    return false

  return (typeof param.Sequence === "number"
    && typeof param.PublicKey === "string"
    && typeof param.MasterSignature === "string")
}

/**
 * Parse a manifest
 *
 * @param binary hex-string of an encoded manifest
 */
function parseManifest(manifest: string): ManifestNew {
  let parsed;
  try {
      parsed = decode(manifest)
  }
  catch(e) {
      throw new Error(`Error Decoding Manifest: ${e}`)
  }

  if(!isManifestNew(parsed))
    throw new Error(`Decoded Manifest of unknown form`)

  const result: ManifestNew = {
      Sequence: parsed['Sequence'],
      Signature: parsed['Signature'],
      MasterSignature: parsed['MasterSignature'],
      PublicKey: encodeNodePublic(Buffer.from(parsed['PublicKey'], 'hex'))
  }

  if(parsed['Domain'])
      result['Domain'] = Buffer.from(parsed['Domain'], 'hex').toString()

  if(parsed['SigningPubKey'])
      result['SigningPubKey'] = encodeNodePublic(Buffer.from(parsed['SigningPubKey'], 'hex'))

  return result
}

/**
 * Verify a parsed manifest
 * 
 * @param manifest a manifest object
 */
function verifyManifestSignature(manifest: string | ManifestOld | ManifestNew | undefined): boolean {
  if(typeof manifest === "string") {
      manifest = parseManifest(manifest)
  }

  if(manifest === undefined)
    throw new Error("parseManifest failed to parse given string")

  let signed: SigningManifest;
  let signature: string | undefined;
  if(isManifestNew(manifest)) {
    signed = Object.assign({}, manifest) 

    const sig = manifest['MasterSignature'] || manifest['Signature']
    signature = sig && Buffer.from(sig, 'hex').toString('hex')
    delete signed['MasterSignature']
    delete signed['Signature']
  }
  else {
    signed = {
        Domain: manifest["domain"],
        PublicKey: manifest["master_key"],
        SigningPubKey: manifest["signing_key"],
        Sequence: manifest['seq'],
    }
    const sig = manifest['master_signature'] || manifest['signature']
    signature = sig && Buffer.from(sig, 'hex').toString('hex')
  }

  if(signature === undefined)
    throw new Error("No signature was provided")  

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
  parseManifest,
  verifyManifestSignature,
}
