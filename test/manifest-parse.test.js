const { parseManifest, verifyManifestSignature } = require('./../src/manifest.js')
const { UNL } = require('./fixtures/UNL-blob.js')
const { encodeNodePublic } = require('ripple-address-codec')

const expect = require('chai').expect

describe("Verifies Manifest Signatures", () => {
    UNL.forEach( obj => {
        const pubkey = encodeNodePublic(Buffer.from(obj.validation_public_key, 'hex'))
        const manifest = Buffer.from(obj.manifest, 'base64').toString('hex')

        it(`Validates ${pubkey}`, () => {
            expect(verifyManifestSignature(parseManifest(manifest))).to.equal(true)
        })
    })

    it("Does Not Verify Invaild Signature", () => {
        const manifest = parseManifest(Buffer.from(UNL[0].manifest, 'base64').toString('hex'))
        manifest.MasterSignature = "BADA55"

        expect(verifyManifestSignature(manifest)).to.equal(false)
    })
})