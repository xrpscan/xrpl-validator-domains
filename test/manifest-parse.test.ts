const { encodeNodePublic } = require('ripple-address-codec')

import {
  Manifest,
  parseManifest,
  verifyManifestSignature,
} from './../src/manifest'
import UNL from './fixtures/UNL-blob.json'

import { expect } from 'chai'

interface UNLEntry {
  validation_public_key: string,
  manifest: string
}

describe('Verifies Manifest Signatures', function () {
  UNL.forEach((obj: UNLEntry) => {
    const pubkey = encodeNodePublic(
      Buffer.from(obj.validation_public_key, 'hex'),
    )
    const manifest = Buffer.from(obj.manifest, 'base64').toString('hex')

    it(`Validates ${pubkey}`, function () {
      const parsed = parseManifest(manifest)
      expect(parsed).to.not.be.null
      if(parsed)
        expect(verifyManifestSignature(parsed)).to.equal(true)
    })
  })

  it('Does Not Verify Invaild Signature', function () {
    const manifest: Manifest | null = parseManifest(
      Buffer.from(UNL[0].manifest, 'base64').toString('hex'),
    )
    expect(manifest).to.not.be.null

    if(manifest) {
      manifest.MasterSignature = 'BADA55'

      expect(verifyManifestSignature(manifest)).to.equal(false)
    }
  })
})
