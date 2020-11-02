const { parseManifest, verifyManifestSignature } = require('./manifest.js')
const { fetchToml } = require('./network.js')
const { decodeNodePublic } = require('ripple-address-codec');
const elliptic = require('elliptic')

const Ed25519 = elliptic.eddsa('ed25519');

async function verifyValidatorDomain(manifest) {
    let parsedManifest
    try {
        parsedManifest = parseManifest(manifest)
    }
    catch(error) {
        return {
            status: "error",
            message: `Cannot Parse Manifest: ${error}`,
            manifest: {}
        }
    }

    const domain = parsedManifest['Domain']
    const publicKey = parsedManifest['PublicKey']
    const decodedPubKey = decodeNodePublic(publicKey).toJSON().data

    if(domain === undefined)
        return {
            status: "error",
            message: "Validator not configured for Decentralized Domain Verification",
            manifest: parsedManifest
        }

    if(!verifyManifestSignature(parsedManifest))
        return {
            status: "error",
            message: "Manifest Signature is invalid, cannot verify Domain",
            manifest: parsedManifest
        }
    
    const validatorInfo = await fetchToml(domain)
    const message = "[domain-attestation-blob:" + domain + ":" + publicKey + "]";
    const message_bytes = Buffer.from(message).toJSON().data

    validatorInfo.VALIDATORS.forEach(validator => {
        const attestation = Buffer.from(validator.attestation, 'hex').toJSON().data
        
        decodedPubKey.shift()
        if(!Ed25519.verify(message_bytes, attestation, decodedPubKey))
            return {
                status: "error",
                message: `Invalid attestation, cannot verify ${domain}`,
                manifest: parsedManifest
            }
    })

    return {
        status: "success",
        message: `${domain} has been verified`,
        manifest: parsedManifest
    }
}

module.exports = {
    verifyValidatorDomain
}