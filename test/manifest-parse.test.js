const { parseManifest, verifyManifestSignature } = require('./../src/manifest.js')
const { UNL } = require('./fixtures/UNL-blob.js')
const { manifests } = require('./fixtures/manifest-stream.js')
const { encodeNodePublic } = require('ripple-address-codec')

const expect = require('chai').expect

describe("Verifies Manifest Signatures", () => {
    UNL.forEach( obj => {
        const pubkey = encodeNodePublic(Buffer.from(obj.validation_public_key, 'hex'))
        const manifest = Buffer.from(obj.manifest, 'base64').toString('hex')

        it(`Verifies ${pubkey}`, () => {
            expect(verifyManifestSignature(parseManifest(manifest))).to.equal(true)
        })
    })

    it("Does Not Verify Invaild Signature", () => {
        const manifest = parseManifest(Buffer.from(UNL[0].manifest, 'base64').toString('hex'))
        manifest.MasterSignature = "1234567890ABCDEF"

        expect(verifyManifestSignature(manifest)).to.equal(false)
    })
})

describe("Verifies Old Manifest Signatures", () => {
    manifests.forEach( manifest => {
        it(`Verifies ${manifest.signing_key}`, () => {
            expect(verifyManifestSignature(manifest)).to.equal(true)
        })
    })
})

describe("Verifies hex-encoded Manifest Signatures", () => {
    UNL.forEach( obj => {
        const pubkey = encodeNodePublic(Buffer.from(obj.validation_public_key, 'hex'))
        const manifest = Buffer.from(obj.manifest, 'base64').toString('hex')

        it(`Verifies ${pubkey}`, () => {
            expect(verifyManifestSignature(manifest)).to.equal(true);
        })
    })
})