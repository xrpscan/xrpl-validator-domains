import { decodeNodePublic } from 'ripple-address-codec'
import { verify } from 'ripple-keypairs'
import { isManifestNew, ManifestNew, ManifestOld, parseManifest, verifyManifestSignature } from './manifest'
import { fetchToml } from './network'

interface Validator {
  public_key: string
  attestation: string
}

/**
 * @param manifest
 */
async function verifyValidatorDomain(manifest: string | ManifestOld | ManifestNew) {
    let parsedManifest
    if(typeof manifest === "string") {
        try {
            parsedManifest = parseManifest(manifest)
        }
        catch(error) {
            return {
                status: "error",
                message: `Cannot Parse Manifest: ${error}`,
            }
        }
    }
    else {
        parsedManifest = manifest
    }

    if(parsedManifest === undefined)
      throw new Error("parseManifest failed to parse given string")

    const domain = isManifestNew(parsedManifest) ? parsedManifest['Domain'] : parsedManifest['domain']
    const publicKey = isManifestNew(parsedManifest) ? parsedManifest['PublicKey'] : parsedManifest['master_key']
    const decodedPubKey = decodeNodePublic(publicKey).toString('hex')

    if(!verifyManifestSignature(parsedManifest))
        return {
            status: "error",
            message: "Cannot verify manifest signature",
            manifest: parsedManifest
        }

    if(domain === undefined)
        return {
            status: "error",
            message: "Manifest does not contain a domain",
            manifest: parsedManifest
        }

    const validatorInfo = await fetchToml(domain)
    if(!validatorInfo || !validatorInfo.VALIDATORS)
        return {
            status: "error",
            message: "Invalid .toml file",
            manifest: parsedManifest
        }

    const message = "[domain-attestation-blob:" + domain + ":" + publicKey + "]";
    const message_bytes = Buffer.from(message).toString('hex')

    const validators = validatorInfo.VALIDATORS.filter((validator: Validator) => validator.public_key === publicKey)
    if(validators && validators.length === 0)
        return {
            status: "error",
            message: ".toml file does not have matching public key",
            manifest: parsedManifest
        }

    for (const validator of validators) {
        const attestation = Buffer.from(validator.attestation, 'hex').toString('hex')
        
        if(!verify(message_bytes, attestation, decodedPubKey)) {
            return {
                status: "error",
                message: `Invalid attestation, cannot verify ${domain}`,
                manifest: parsedManifest
            }
        }
    }

    return {
        status: "success",
        message: `${domain} has been verified`,
        manifest: parsedManifest
    }
}

export {
  verifyValidatorDomain,
}