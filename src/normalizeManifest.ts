import { encodeNodePublic } from 'ripple-address-codec'
import { decode } from 'ripple-binary-codec'

export interface Manifest {
  master_key: string
  master_signature: string
  seq: number
  domain?: string
  ephemeral_key?: string
  signature?: string
}

export interface ManifestParsed {
  PublicKey: string
  MasterSignature: string
  Sequence: number
  Domain?: string
  SigningPubKey?: string
  Signature?: string
}

export interface ManifestRPC {
  master_key: string
  master_signature: string
  seq: number
  domain?: string
  signing_key?: string
  signature?: string
}

/**
 * Helper function for type guards.
 *
 * @param param - Checks if a param is a Record.
 * @returns Type guard for Record.
 */
function isObject(param: unknown): param is Record<string, unknown> {
  return typeof param === 'object' && param !== null
}

/**
 * Check that the parameter is a valid Manifest object.
 *
 * @param param - Checks if a parameter is a manifest.
 * @returns Type guard for Manifest.
 */
function isManifest(param: unknown): param is Manifest {
  if (!isObject(param)) {
    return false
  }

  const expected_keys = [
    'seq',
    'master_key',
    'master_signature',
    'domain',
    'ephemeral_key',
    'signature',
  ]
  const extra_keys = Object.keys(param).filter(
    (key) => !expected_keys.includes(key),
  )

  return (
    extra_keys.length === 0 &&
    typeof param.seq === 'number' &&
    typeof param.master_key === 'string' &&
    typeof param.master_signature === 'string' &&
    (param.domain === undefined || typeof param.domain === 'string') &&
    (param.ephemeral_key === undefined ||
      typeof param.ephemeral_key === 'string') &&
    (param.signature === undefined || typeof param.signature === 'string')
  )
}

/**
 * Check that the parameter is a valid ManifestParsed object.
 *
 * @param param - Checks if a parameter is a ManifestParsed.
 * @returns Type guard for ManifestParsed.
 */
function isManifestParsed(param: unknown): param is ManifestParsed {
  if (!isObject(param)) {
    return false
  }

  const expected_keys = [
    'Sequence',
    'PublicKey',
    'MasterSignature',
    'Domain',
    'SigningPubKey',
    'Signature',
  ]
  const extra_keys = Object.keys(param).filter(
    (key) => !expected_keys.includes(key),
  )

  return (
    extra_keys.length === 0 &&
    typeof param.Sequence === 'number' &&
    typeof param.PublicKey === 'string' &&
    typeof param.MasterSignature === 'string' &&
    (param.Domain === undefined || typeof param.Domain === 'string') &&
    (param.SigningPubKey === undefined ||
      typeof param.SigningPubKey === 'string') &&
    (param.Signature === undefined || typeof param.Signature === 'string')
  )
}

/**
 * Check that the parameter is a valid ManifestRPC object.
 *
 * @param param - Checks if a parameter is a ManifestRPC.
 * @returns Type guard for ManifestRPC.
 */
function isManifestRPC(param: unknown): param is ManifestRPC {
  if (!isObject(param)) {
    return false
  }

  const expected_keys = [
    'seq',
    'master_key',
    'master_signature',
    'domain',
    'signing_key',
    'signature',
    'type',
  ]
  const extra_keys = Object.keys(param).filter(
    (key) => !expected_keys.includes(key),
  )

  return (
    extra_keys.length === 0 &&
    typeof param.seq === 'number' &&
    typeof param.master_key === 'string' &&
    typeof param.master_signature === 'string' &&
    (param.domain === undefined || typeof param.domain === 'string') &&
    (param.signing_key === undefined ||
      typeof param.signing_key === 'string') &&
    (param.signature === undefined || typeof param.signature === 'string')
  )
}

/**
 * Parses a hex-string encoded manifest.
 *
 * @param manifest - A hex-string encoded manifest.
 * @throws When manifest cannot be decoded or is invalid.
 * @returns Manifest parsed representation of the manifest.
 */
function manifestFromHex(manifest: string): ManifestParsed {
  let parsed
  try {
    parsed = decode(manifest)
  } catch (_u) {
    throw new Error(`Error Decoding Manifest`)
  }

  if (!isManifestParsed(parsed)) {
    throw new Error('Unrecognized Manifest Format')
  }

  const result: ManifestParsed = {
    Sequence: parsed.Sequence,
    MasterSignature: parsed.MasterSignature,
    PublicKey: encodeNodePublic(Buffer.from(parsed.PublicKey, 'hex')),
  }

  if (parsed.Signature) {
    result.Signature = parsed.Signature
  }

  if (parsed.Domain) {
    result.Domain = Buffer.from(parsed.Domain, 'hex').toString()
  }

  if (parsed.SigningPubKey) {
    result.SigningPubKey = encodeNodePublic(
      Buffer.from(parsed.SigningPubKey, 'hex'),
    )
  }

  return result
}

/**
 * Normalizes a ManifestParsed to a Manifest.
 *
 * @param parsed - Manifest in ManifestParsed format.
 * @returns Normalized Manifest representation.
 */
function normalizeManifestParsed(parsed: ManifestParsed): Manifest {
  const result: Manifest = {
    seq: parsed.Sequence,
    signature: parsed.Signature,
    master_signature: parsed.MasterSignature,
    master_key: parsed.PublicKey,
  }

  if (parsed.Domain) {
    result.domain = parsed.Domain
  }

  if (parsed.SigningPubKey) {
    result.ephemeral_key = parsed.SigningPubKey
  }

  return result
}

/**
 * Normalizes a ManifestRPC to a Manifest.
 *
 * @param rpc - Manifest in ManifestRPC format.
 * @returns Normalized Manifest representation.
 */
function normalizeManifestRPC(rpc: ManifestRPC): Manifest {
  if (!rpc.signing_key) {
    return rpc
  }

  const manifest = { ...rpc }
  const ephemeral_key = manifest.signing_key
  delete manifest.signing_key

  const normalized = manifest as Manifest
  normalized.ephemeral_key = ephemeral_key
  return normalized
}

/**
 * Normalizes a manifest to a Manifest object.
 *
 * @param manifest - Hex-string, ManifestRPC, or ManifestParsed representation of a manifest.
 * @throws When manifest format is unrecognized.
 * @returns A normalized Manifest object.
 */
export function normalizeManifest(
  manifest: string | ManifestParsed | ManifestRPC | Manifest,
): Manifest {
  if (isManifest(manifest)) {
    return manifest
  }

  let parsed
  if (typeof manifest === 'string') {
    try {
      parsed = manifestFromHex(manifest)
    } catch (_u) {
      throw new Error(`Error Decoding Manifest`)
    }
  } else {
    parsed = manifest
  }

  if (isManifestParsed(parsed)) {
    return normalizeManifestParsed(parsed)
  }

  if (isManifestRPC(parsed)) {
    return normalizeManifestRPC(parsed)
  }

  throw new Error(`Unrecognized Manifest format ${JSON.stringify(manifest)}`)
}
