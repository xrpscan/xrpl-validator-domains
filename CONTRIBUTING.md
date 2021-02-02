# Contributing

Thanks for considering a contribution to the XRP Ledger Ecosystem.

## About This Library
xrpl-validator-domains is a developer kit for verifying validator identity.

There are three main pieces of functionality in this library.


### normalizeManifest()

`normalizeManifest()` is a helper function that takes a manifest of any of three standard formats and normalizes it into one manifest format. It does this with by defining type guards for each manifest type:

```ts
export interface Manifest {
  master_key: string
  master_signature: string
  seq: number
  domain?: string
  ephemeral_key?: string
  signature?: string
}
```

```ts
export interface ManifestRPC {
  master_key: string
  master_signature: string
  seq: number
  domain?: string
  signing_key?: string
  signature?: string
}
```

```ts
export interface ManifestParsed {
  PublicKey: string
  MasterSignature: string
  Sequence: number
  Domain?: string
  SigningPubKey?: string
  Signature?: string
}
```

`normalizeManifest()` takes a hex-string encoded manifest, a `ManifestRPC`, or a `ManifestParsed` and converts it into a `Manifest`.


### verifyManifestSignature()

`verifyManifestSignature` takes a Manifest object and verifies its signature.

The function uses the `master_signature` field. If the `master_signature` is not present `signature` is used instead. Then, the signatures are `delete`ed from the Manifest, and the manifest is hex-encoded using `ripple-binary-codec`. The signature is verified using `ripple-keypairs`, and `verifyManifestSignature()` returns `true` if the signature is valid, and `false` if it is not.


### verifyValidatorDomain()

`verifyValidatorDomain()` verifies that a validator and the domain it uses have the same operator. Verification is done in four steps:

1. Normalize the manifest. Uses `normalizeManifest()` as described above.
   
2. Verify the manifest signature. Uses `verifyManifestSignature()` as described above.

3. Look for the `xrpl-ledger.toml` file at the `.well-known` endpoint of the domain. Validator operators should configure their domains in accordance with [domain verification](https://xrpl.org/xrp-ledger-toml.html#domain-verification). This is done in the `network.ts` file. `fetchToml()` returns a `.toml` file that has been parsed by the `toml` library.

4. Validate the attestation found in the `xrp-ledger.toml` file. Under the `VALIDATION` field, each attestation that doesn't match the manifest's public key is filtered out. For each remaining attestation, the message [domain-attestation-blob:${domain}:${publicKey}] is verified to have been signed by the holder of the manifest's public key.

## Create A Pull Request
Before being considered for review or merging, each pull request must:

- Pass GitHub continuous integration tests. `yarn test` runs all unit tests.
- Update documentation for any new features.
- Be free of lint errors. Please run `yarn lint` and fix any errors before creating a pull request.