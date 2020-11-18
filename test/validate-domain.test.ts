import { verifyValidatorDomain } from '../src'
import { expect } from 'chai'
import nock from 'nock'
import rabbitKickResponse from './fixtures/rabbitkick.json'
import payIdMayurResponse from './fixtures/payid-mayur.json'
import invalidToml from './fixtures/invalid-toml.json'
import noKey from './fixtures/toml-no-matching-pubkey.json'
import invalidAttestation from './fixtures/invalid-toml-signature.json'

const rabbitKickManifiest = "240000007B7121EDA54C85F91219FD259134B6B126AD64AE7204B81DD4052510657E1A5697246AD27321032F7ACF6D67C42C9C898F576F92FE4638EB6C88D0DC7F6710AF00ED6BF50D97D676473045022100BE0B2E6071AED53C19A76BDC6EDE1A351C35343AA7CF917587F93C9D85C5A7B702207135F72654DC3AD70FE8A4DEB128965268A312DFB3E9A7C68BA8E9A8931F4285770F7261626269746B69636B2E636C7562701240C4FF2A6D277D24DEFB1C1EDF67285171EA02DC035FEF6216DEE41019CE41611AD4430AF59938DC505E538CCF669D521AC2A456C3805FE3CA85BB10B2A691B50B"
const rabbitKickParsed = {
  Sequence: 123,
  Domain: "rabbitkick.club",
  PublicKey: "nHUcNC5ni7XjVYfCMe38Rm3KQaq27jw7wJpcUYdo4miWwpNePRTw",
  SigningPubKey: "n9Li9iXepgXECvTFq2hGoxqSttJy9rrC1NbZ75NXLZyKFekV5ZU1",
  Signature: "3045022100BE0B2E6071AED53C19A76BDC6EDE1A351C35343AA7CF917587F93C9D85C5A7B702207135F72654DC3AD70FE8A4DEB128965268A312DFB3E9A7C68BA8E9A8931F4285",
  MasterSignature: "C4FF2A6D277D24DEFB1C1EDF67285171EA02DC035FEF6216DEE41019CE41611AD4430AF59938DC505E538CCF669D521AC2A456C3805FE3CA85BB10B2A691B50B"
}
const rabbitKickRpcResponse = {
  seq: 123,
  domain: "rabbitkick.club",
  master_key: "nHUcNC5ni7XjVYfCMe38Rm3KQaq27jw7wJpcUYdo4miWwpNePRTw",
  signing_key: "n9Li9iXepgXECvTFq2hGoxqSttJy9rrC1NbZ75NXLZyKFekV5ZU1",
  signature: "3045022100BE0B2E6071AED53C19A76BDC6EDE1A351C35343AA7CF917587F93C9D85C5A7B702207135F72654DC3AD70FE8A4DEB128965268A312DFB3E9A7C68BA8E9A8931F4285",
  master_signature: "C4FF2A6D277D24DEFB1C1EDF67285171EA02DC035FEF6216DEE41019CE41611AD4430AF59938DC505E538CCF669D521AC2A456C3805FE3CA85BB10B2A691B50B"
}
const rabbitKickManifestResponse = {
  seq: 123,
  domain: "rabbitkick.club",
  master_key: "nHUcNC5ni7XjVYfCMe38Rm3KQaq27jw7wJpcUYdo4miWwpNePRTw",
  ephemeral_key: "n9Li9iXepgXECvTFq2hGoxqSttJy9rrC1NbZ75NXLZyKFekV5ZU1",
  signature: "3045022100BE0B2E6071AED53C19A76BDC6EDE1A351C35343AA7CF917587F93C9D85C5A7B702207135F72654DC3AD70FE8A4DEB128965268A312DFB3E9A7C68BA8E9A8931F4285",
  master_signature: "C4FF2A6D277D24DEFB1C1EDF67285171EA02DC035FEF6216DEE41019CE41611AD4430AF59938DC505E538CCF669D521AC2A456C3805FE3CA85BB10B2A691B50B"
}

const mayursManifest = "24000000027121ED24ED1C96F59215417497AC51CD9850549A51586E00856F0037D82EAA01AB4C7B732102AB53AFAADA932FB71888F8E37F6CB48B08612E6CB77B3C5A3227F6ABFD0641A076473045022100A887F4C261786803AD033839FB52272E1123A57DFF48C07C06616D2028A4CC0502203F3325B1635864EBBFE44991910D66836F66FC00E14E965AB0F5352AD97816FF771770617969642E6D617975726268616E646172792E636F6D70124070AF72795E290EC997D0DDCE5180F260FD013BE75A3C57924829599D53F14CB071F090E76428BA77A43C3530CBA8BA72CF1AC59EEF9A352E9EA4B8334703EB0E"
const mayursParsed = {
    Sequence: 2,
    Domain: "payid.mayurbhandary.com",
    PublicKey: "nHBd6ZRXfG353vtK1kwCahqbMk6BAqUz57rVy77Do5YTBG8LHkye",
    SigningPubKey: "n9KqxB1nyphLfQnj8YBWtwt9ekhM58QQR3UWG3bRFKofSvBUDhXu",
    Signature: "3045022100A887F4C261786803AD033839FB52272E1123A57DFF48C07C06616D2028A4CC0502203F3325B1635864EBBFE44991910D66836F66FC00E14E965AB0F5352AD97816FF",
    MasterSignature: "70AF72795E290EC997D0DDCE5180F260FD013BE75A3C57924829599D53F14CB071F090E76428BA77A43C3530CBA8BA72CF1AC59EEF9A352E9EA4B8334703EB0E"
}
const mayursRpcResponse = {
    seq: 2,
    domain: "payid.mayurbhandary.com",
    master_key: "nHBd6ZRXfG353vtK1kwCahqbMk6BAqUz57rVy77Do5YTBG8LHkye",
    signing_key: "n9KqxB1nyphLfQnj8YBWtwt9ekhM58QQR3UWG3bRFKofSvBUDhXu",
    signature: "3045022100A887F4C261786803AD033839FB52272E1123A57DFF48C07C06616D2028A4CC0502203F3325B1635864EBBFE44991910D66836F66FC00E14E965AB0F5352AD97816FF",
    master_signature: "70AF72795E290EC997D0DDCE5180F260FD013BE75A3C57924829599D53F14CB071F090E76428BA77A43C3530CBA8BA72CF1AC59EEF9A352E9EA4B8334703EB0E"
}
const mayursManifestResponse = {
  seq: 2,
  domain: "payid.mayurbhandary.com",
  master_key: "nHBd6ZRXfG353vtK1kwCahqbMk6BAqUz57rVy77Do5YTBG8LHkye",
  ephemeral_key: "n9KqxB1nyphLfQnj8YBWtwt9ekhM58QQR3UWG3bRFKofSvBUDhXu",
  signature: "3045022100A887F4C261786803AD033839FB52272E1123A57DFF48C07C06616D2028A4CC0502203F3325B1635864EBBFE44991910D66836F66FC00E14E965AB0F5352AD97816FF",
  master_signature: "70AF72795E290EC997D0DDCE5180F260FD013BE75A3C57924829599D53F14CB071F090E76428BA77A43C3530CBA8BA72CF1AC59EEF9A352E9EA4B8334703EB0E"
}

const noDomain = "JAAAAAFxIe2heHHnKwxXCsQ0XGDPAq+7t0CmMbetDh5XMhZXTZrqAnMhAojyuzgtreQkxQj8prHxOsbDcF5fu4XXb0KxEL/Pq5HhdkcwRQIhANfPDLZP47aCWwt5kBnp75BuuCgp9c4BfJPd66SFCw61AiAJvegBvvPIrec+XOSzKRfi5uuXWxtl9Eyr2aPBYXvbRHASQMULYEo7beRfoUCnjk1sTYyY91tLIGLgnnaWXhUm80+zs5IGegk8qijKAtBOMuBC71lAB4KhJc+dB2rpMOFc5gw="
const noDomainStr = Buffer.from(noDomain, 'base64').toString('hex');
const noDomainParsed = {
    Sequence: 1,
    PublicKey: 'nHU2Y1mLGDvTbc2dpvpkQ16qdeTKv2aJwGJHFySSB9U3jkTmj4CA',
    SigningPubKey: 'n9K2FpCqZftM1xXXaWXFPVbEimLX6MEjrmQywfSutkdK1PRvqDb2',
    Signature: '3045022100D7CF0CB64FE3B6825B0B799019E9EF906EB82829F5CE017C93DDEBA4850B0EB5022009BDE801BEF3C8ADE73E5CE4B32917E2E6EB975B1B65F44CABD9A3C1617BDB44',
    MasterSignature: 'C50B604A3B6DE45FA140A78E4D6C4D8C98F75B4B2062E09E76965E1526F34FB3B392067A093CAA28CA02D04E32E042EF59400782A125CF9D076AE930E15CE60C'
}
const noDomainRpcResponse = {
    seq: 1,
    master_key: 'nHU2Y1mLGDvTbc2dpvpkQ16qdeTKv2aJwGJHFySSB9U3jkTmj4CA',
    signing_key: 'n9K2FpCqZftM1xXXaWXFPVbEimLX6MEjrmQywfSutkdK1PRvqDb2',
    signature: '3045022100D7CF0CB64FE3B6825B0B799019E9EF906EB82829F5CE017C93DDEBA4850B0EB5022009BDE801BEF3C8ADE73E5CE4B32917E2E6EB975B1B65F44CABD9A3C1617BDB44',
    master_signature: 'C50B604A3B6DE45FA140A78E4D6C4D8C98F75B4B2062E09E76965E1526F34FB3B392067A093CAA28CA02D04E32E042EF59400782A125CF9D076AE930E15CE60C'
}
const noDomainResponseManifest = {
  seq: 1,
  master_key: 'nHU2Y1mLGDvTbc2dpvpkQ16qdeTKv2aJwGJHFySSB9U3jkTmj4CA',
  ephemeral_key: 'n9K2FpCqZftM1xXXaWXFPVbEimLX6MEjrmQywfSutkdK1PRvqDb2',
  signature: '3045022100D7CF0CB64FE3B6825B0B799019E9EF906EB82829F5CE017C93DDEBA4850B0EB5022009BDE801BEF3C8ADE73E5CE4B32917E2E6EB975B1B65F44CABD9A3C1617BDB44',
  master_signature: 'C50B604A3B6DE45FA140A78E4D6C4D8C98F75B4B2062E09E76965E1526F34FB3B392067A093CAA28CA02D04E32E042EF59400782A125CF9D076AE930E15CE60C'
}


describe("Verifies domains", () => {
    it("rabbitkick.club", async () => {
        nock('https://rabbitkick.club')
            .get('/.well-known/xrp-ledger.toml')
            .reply(200, rabbitKickResponse.response);

        expect(await verifyValidatorDomain(rabbitKickManifiest)).to.eql({ 
            status: 'success', 
            message: 'rabbitkick.club has been verified',
            manifest: rabbitKickManifestResponse
        })

        nock('https://rabbitkick.club')
            .get('/.well-known/xrp-ledger.toml')
            .reply(200, rabbitKickResponse.response);

        expect(await verifyValidatorDomain(rabbitKickParsed)).to.eql({
            status: 'success', 
            message: 'rabbitkick.club has been verified',
            manifest: rabbitKickManifestResponse
        })

        nock('https://rabbitkick.club')
            .get('/.well-known/xrp-ledger.toml')
            .reply(200, rabbitKickResponse.response);

        expect(await verifyValidatorDomain(rabbitKickRpcResponse)).to.eql({
            status: 'success', 
            message: 'rabbitkick.club has been verified',
            manifest: rabbitKickManifestResponse
        })   
})

    it("payid.mayurbhandary.com", async () => {
        nock('https://payid.mayurbhandary.com')
            .get('/.well-known/xrp-ledger.toml')
            .reply(200, payIdMayurResponse.response);

        expect(await verifyValidatorDomain(mayursManifest)).to.eql({
            status: 'success', 
            message: 'payid.mayurbhandary.com has been verified',
            manifest: mayursManifestResponse
        })

        nock('https://payid.mayurbhandary.com')
            .get('/.well-known/xrp-ledger.toml')
            .reply(200, payIdMayurResponse.response);

        expect(await verifyValidatorDomain(mayursParsed)).to.eql({
            status: 'success', 
            message: 'payid.mayurbhandary.com has been verified',
            manifest: mayursManifestResponse
        })
        nock('https://payid.mayurbhandary.com')
            .get('/.well-known/xrp-ledger.toml')
            .reply(200, payIdMayurResponse.response);

        expect(await verifyValidatorDomain(mayursRpcResponse)).to.eql({
            status: 'success', 
            message: 'payid.mayurbhandary.com has been verified',
            manifest: mayursManifestResponse
        })
    })

    it("no domain manifest", async () => {
        expect(await verifyValidatorDomain(noDomainStr)).to.eql({
            status: 'error',
            message: 'Manifest does not contain a domain',
            manifest: noDomainResponseManifest
        })

        expect(await verifyValidatorDomain(noDomainParsed)).to.eql({
            status: 'error',
            message: 'Manifest does not contain a domain',
            manifest: noDomainResponseManifest
        })

        expect(await verifyValidatorDomain(noDomainRpcResponse)).to.eql({
            status: 'error',
            message: 'Manifest does not contain a domain',
            manifest: noDomainResponseManifest
        })
    })

    it("invalid signature", async () => {
        const invalid = Object.assign({}, rabbitKickParsed, { MasterSignature: "11223344556677889900aabbccddeeff" })
        expect(await verifyValidatorDomain(invalid)).to.eql({
            status: 'error',
            message: 'Cannot verify manifest signature',
            manifest: {
                "domain": "rabbitkick.club",
                "ephemeral_key": "n9Li9iXepgXECvTFq2hGoxqSttJy9rrC1NbZ75NXLZyKFekV5ZU1",
                "master_key": "nHUcNC5ni7XjVYfCMe38Rm3KQaq27jw7wJpcUYdo4miWwpNePRTw",
                "master_signature": "11223344556677889900aabbccddeeff",
                "seq": 123,
                "signature": "3045022100BE0B2E6071AED53C19A76BDC6EDE1A351C35343AA7CF917587F93C9D85C5A7B702207135F72654DC3AD70FE8A4DEB128965268A312DFB3E9A7C68BA8E9A8931F4285"
            }
        })
    })

    it("Invalid TOML file", async () => {
        nock('https://payid.mayurbhandary.com')
            .get('/.well-known/xrp-ledger.toml')
            .reply(200, invalidToml.response);

        expect(await verifyValidatorDomain(mayursManifest)).to.eql({
            status: 'error',
            message: "Invalid .toml file",
            manifest: mayursManifestResponse
        })
    })

    it("No matching public key in TOML file", async () => {
        nock('https://payid.mayurbhandary.com')
            .get('/.well-known/xrp-ledger.toml')
            .reply(200, noKey.response);

        expect(await verifyValidatorDomain(mayursManifest)).to.eql({
            status: 'error',
            message: ".toml file does not have matching public key",
            manifest: mayursManifestResponse
        })
    })

    it("Invalid attestation fails", async () => {
        nock('https://payid.mayurbhandary.com')
            .get('/.well-known/xrp-ledger.toml')
            .reply(200, invalidAttestation.response);

        expect(await verifyValidatorDomain(mayursManifest)).to.eql({
            status: "error",
            message: "Invalid attestation, cannot verify payid.mayurbhandary.com",
            manifest: mayursManifestResponse
        })
    })
})