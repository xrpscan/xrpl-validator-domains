import { normalizeManifest } from './../src/normalizeManifest'
import * as fixtures from './fixtures/normalize-manifests.json'

import { expect } from 'chai'

describe("Normalizes Manifests", () => {
    it("Normalizing invalid manifests throws", () => {
        fixtures.invalid.forEach((manifest: any) => {
            expect(() => normalizeManifest(manifest)).to.throw()
        })
    })
})