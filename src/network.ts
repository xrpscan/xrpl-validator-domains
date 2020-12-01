import axios from 'axios'
import toml from 'toml'

const TOML_PATH = '/.well-known/xrp-ledger.toml'

interface Response {
  data: string
}

interface Validator {
  public_key: string
  attestation: string
}

interface TOML {
  VALIDATORS?: Validator[]
}

/**
 * Fetch .toml file from manifest domain.
 *
 * @param domain - To fetch the .toml file from.
 * @throws If there is an error fetching .toml file.
 * @returns Parsed .toml file.
 */
async function fetchToml(domain: string): Promise<TOML> {
  const url = `https://${domain}${TOML_PATH}`

  return axios({
    method: 'get',
    url,
    responseType: 'text',
  })
    .then(async (resp: Response) => resp.data)
    .then(async (tomlData: string) => toml.parse(tomlData))
}

export default fetchToml
