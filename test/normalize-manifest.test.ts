import { expect } from 'chai'

import { normalizeManifest } from '../src/normalizeManifest'

import * as fixtures from './fixtures/normalize-manifests.json'

describe('Normalizes Manifests', () => {
  it('Normalizing invalid manifests throws', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any -- invalid manifests must be of type any */
    for (const manifest of fixtures.invalid) {
      expect(() => normalizeManifest(manifest as any)).to.throw()
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  })
})
