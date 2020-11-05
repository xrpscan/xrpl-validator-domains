import { expect } from 'chai'
import * as toml from 'toml'

import { fetchToml } from '../src/network'

const expected = toml.parse(
  `[METADATA]
    modified = 2020-02-27T05:17:00.000Z

    [[VALIDATORS]]
    public_key = "nHUcNC5ni7XjVYfCMe38Rm3KQaq27jw7wJpcUYdo4miWwpNePRTw"
    attestation = "27899F1CEDA9DD21FE4603B53795D83C23EBBBB06017C02AC740391D4BDDAF125B343A0B10B35FC30C07E22ACA982C624CF25E388818A1069B857FE49A0FFB0E"
    network = "main"
    owner_country = "US"
    server_country = "US"
    unl = "https://vl.ripple.com"

    [[ACCOUNTS]]
    address = "rabbitZWLG8PptsrPjuvKX4uAGjS5B64PP"
    network = "main"

    [[PRINCIPALS]]
    name = "rabbit"
    email = "postmaster@rabbitkick.club"
    twitter = "@RabbitKickClub"
    "xrpchat.com" = "Rabbit_Kick_Club"

    [[SERVERS]]
    peer = "hub.rabbitkick.club"
    network = "main"
    port = 51235`,
)

describe('Fetches TOML from URL', function () {
  it('rabbitkick.club', async function () {
    expect(await fetchToml('rabbitkick.club')).to.eql(expected)
  })
})
