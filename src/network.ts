const axios = require('axios')
const toml = require('toml')

const TOML_PATH = '/.well-known/xrp-ledger.toml'

interface Response {
  data: string
}

/**
 * @param domain
 */
async function fetchToml(domain: string) {
  const url = `https://${domain}${TOML_PATH}`

  return axios({
    method: 'get',
    url,
    responseType: 'text',
  })
    .then((resp: Response) => resp.data)
    .then((tomlData: string) => toml.parse(tomlData))
    .catch((error: Error) => console.log(`Error Fetching ${url}: ${error}`))
}

export {
  fetchToml,
}
