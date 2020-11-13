import { encodeNodePublic } from 'ripple-address-codec'

import {
  verifyManifestSignature,
} from './../src/manifest'
import { normalizeManifest } from './../src/normalizeManifest'
import UNL from './fixtures/UNL-blob.json'
import manifests from './fixtures/manifest-stream.json'

import { expect } from 'chai'

describe("Verifies Manifest Signatures", () => {
    UNL.forEach( obj => {
        const pubkey = encodeNodePublic(Buffer.from(obj.validation_public_key, 'hex'))
        const manifest = Buffer.from(obj.manifest, 'base64').toString('hex')

        it(`Verifies ${pubkey}`, () => {
            expect(verifyManifestSignature(normalizeManifest(manifest))).to.equal(true)
        })
    })

    it("Does Not Verify Invaild Signature", () => {
        const manifest = normalizeManifest(Buffer.from(UNL[0].manifest, 'base64').toString('hex'))
        manifest.master_signature = "1234567890ABCDEF"

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