import { decode } from 'ripple-binary-codec'
import { encodeNodePublic } from 'ripple-address-codec'

export interface Manifest {
    master_key: string,
    master_signature: string,
    seq: number,
    domain?: string
    ephemeral_key?: string
    signature?: string
}

export interface ManifestParsed {
    PublicKey: string
    MasterSignature: string
    Sequence: number
    Domain?: string
    SigningPubKey?: string
    Signature?: string
}
  
export interface ManifestRPC {
    master_key: string,
    master_signature: string,
    seq: number,
    domain?: string
    signing_key?: string
    signature?: string
}

export function isNormalizedManifest(param: any): param is Manifest {
    if(typeof param !== "object")
      return false

    const expected_keys = ["seq", "master_key", "master_signature", "domain", "ephemeral_key", "signature"]
    const extra_keys = Object.keys(param).filter(key => !expected_keys.includes(key))

    return (extra_keys.length === 0
      && typeof param.seq === "number"
      && typeof param.master_key === "string"
      && typeof param.master_signature === "string"
      && (param.domain === undefined || typeof param.domain === 'string')
      && (param.ephemeral_key === undefined || typeof param.ephemeral_key === 'string')
      && (param.signature === undefined || typeof param.signature === 'string'))
}

/**
 * @param param tests if a parameter is a Manifest in ManifestParsed format
 */
export function isManifestParsed(param: any): param is ManifestParsed {
    if(typeof param !== "object")
      return false

    const expected_keys = ["Sequence", "PublicKey", "MasterSignature", "Domain", "SigningPubKey", "Signature"]
    const extra_keys = Object.keys(param).filter(key => !expected_keys.includes(key))
  
    return (extra_keys.length === 0
      && typeof param.Sequence === "number"
      && typeof param.PublicKey === "string"
      && typeof param.MasterSignature === "string"
      && (param.Domain === undefined || typeof param.Domain === 'string')
      && (param.SigningPubKey === undefined || typeof param.SigningPubKey === 'string')
      && (param.Signature === undefined || typeof param.Signature === 'string'))
}

/**
 * Parse a manifest
 *
 * @param binary hex-string of an encoded manifest
 */
function manifestFromHex(manifest: string): ManifestParsed {
    let parsed;
    try {
        parsed = decode(manifest)
    }
    catch(e) {
        throw new Error(`Error Decoding Manifest: ${e}`)
    }

    if(!isManifestParsed(parsed))
        throw new Error('Unrecognized Manifest Format')

    const result: ManifestParsed = {
        Sequence: parsed['Sequence'],
        MasterSignature: parsed['MasterSignature'],
        PublicKey: encodeNodePublic(Buffer.from(parsed['PublicKey'], 'hex'))
    }

    if(parsed['Signature'])
        result['Signature'] = parsed['Signature']

    if(parsed['Domain'])
        result['Domain'] = Buffer.from(parsed['Domain'], 'hex').toString()

    if(parsed['SigningPubKey'])
        result['SigningPubKey'] = encodeNodePublic(Buffer.from(parsed['SigningPubKey'], 'hex'))

    return result
}

/**
 * @param manifest tests if a parameter is a Manifest in ManifestRPC format
 */
export function isManifestRPC(param: any): param is ManifestRPC {
    if(typeof param !== "object")
      return false

    const expected_keys = ["seq", "master_key", "master_signature", "domain", "signing_key", "signature", "type"]
    const extra_keys = Object.keys(param).filter(key => !expected_keys.includes(key))

    return (extra_keys.length === 0
      && typeof param.seq === "number"
      && typeof param.master_key === "string"
      && typeof param.master_signature === "string"
      && (param.domain === undefined || typeof param.domain === 'string')
      && (param.signing_key === undefined || typeof param.signing_key === 'string')
      && (param.signature === undefined || typeof param.signature === 'string'))
}

/**
 * Parse a manifest
 *
 * @param binary hex-string of an encoded manifest
 */
function normalizeManifest(manifest: string | ManifestParsed | ManifestRPC | Manifest ): Manifest {
    if(isNormalizedManifest(manifest))
        return manifest

    let parsed;
    if(typeof manifest === 'string') {
        try {
            parsed = manifestFromHex(manifest)
        }
        catch(e) {
            throw new Error(`Error Decoding Manifest: ${e}`)
        }   
    }
    else {
        parsed = manifest
    }

    if(isManifestParsed(parsed)) {
        const result: Manifest = {
            seq: parsed['Sequence'],
            signature: parsed['Signature'],
            master_signature: parsed['MasterSignature'],
            master_key: parsed['PublicKey']
        }

        if(parsed['Domain'])
            result['domain'] = parsed['Domain']

        if(parsed['SigningPubKey'])
            result['ephemeral_key'] = parsed['SigningPubKey']

        return result
    }

    if(isManifestRPC(parsed)) {
        if(!parsed.signing_key)
            return parsed

        const ephemeral_key = parsed.signing_key
        delete parsed.signing_key;

        parsed = parsed as Manifest
        parsed.ephemeral_key = ephemeral_key
        return parsed
    }

    throw new Error(`Unrecognized Manifest format ${JSON.stringify(manifest)}`);
}

export { normalizeManifest }