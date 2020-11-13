import { decodeNodePublic } from 'ripple-address-codec'
import { verify } from 'ripple-keypairs'
import { verifyManifestSignature } from './manifest'
import { normalizeManifest } from './normalizeManifest'
import { fetchToml } from './network'
import { ManifestParsed, ManifestRPC } from './normalizeManifest'

interface Validator {
  public_key: string
  attestation: string
}

/**
 * @param manifest
 */
async function verifyValidatorDomain(manifest: string | ManifestParsed | ManifestRPC) {
    let normalizedManifest = normalizeManifest(manifest)

    const domain = normalizedManifest['domain']
    const publicKey = normalizedManifest['master_key']
    const decodedPubKey = decodeNodePublic(publicKey).toString('hex')

    if(!verifyManifestSignature(normalizedManifest))
        return {
            status: "error",
            message: "Cannot verify manifest signature",
            manifest: normalizedManifest
        }

    if(domain === undefined)
        return {
            status: "error",
            message: "Manifest does not contain a domain",
            manifest: normalizedManifest
        }

    const validatorInfo = await fetchToml(domain)
    if(!validatorInfo || !validatorInfo.VALIDATORS)
        return {
            status: "error",
            message: "Invalid .toml file",
            manifest: normalizedManifest
        }

    const message = "[domain-attestation-blob:" + domain + ":" + publicKey + "]";
    const message_bytes = Buffer.from(message).toString('hex')

    const validators = validatorInfo.VALIDATORS.filter((validator: Validator) => validator.public_key === publicKey)
    if(validators && validators.length === 0)
        return {
            status: "error",
            message: ".toml file does not have matching public key",
            manifest: normalizedManifest
        }

    for (const validator of validators) {
        const attestation = Buffer.from(validator.attestation, 'hex').toString('hex')
        
        if(!verify(message_bytes, attestation, decodedPubKey)) {
            return {
                status: "error",
                message: `Invalid attestation, cannot verify ${domain}`,
                manifest: normalizedManifest
            }
        }
    }

    return {
        status: "success",
        message: `${domain} has been verified`,
        manifest: normalizedManifest
    }
}

export {
  verifyValidatorDomain,
  verifyManifestSignature
}


