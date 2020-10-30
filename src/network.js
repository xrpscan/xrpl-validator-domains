const axios = require('axios')
const toml = require('toml')

const TOML_PATH = "/.well-known/xrp-ledger.toml"

async function fetchToml(domain) {
    const url = `https://${domain}${TOML_PATH}`

    return axios({
        method: 'get',
        url: url,
        responseType: 'text'
    })
    .then(resp => resp.data)
    .then(tomlData => toml.parse(tomlData))
    .catch(error => console.log(`Error Fetching ${url}: ${error}`))
}

module.exports = {
    fetchToml
}