const { NAMESPACE_PROFILE_US, DEFAULT_LOCALE } = require("../constants");
const rp = require("request-promise");

class CharacterService {

    constructor(oauthClient) {
        this.oauthClient = oauthClient;
    }

    async getCharacter(characterName, realmName) {
        const oauthToken = await this.oauthClient.getToken();
        const characterSummaryDocumentURL = `https://us.api.blizzard.com/profile/wow/character/${encodeURIComponent(realmName)}/${encodeURIComponent(characterName)}`;
        const response = await rp.get({
            uri: characterSummaryDocumentURL,
            json: true,
            qs: {
                locale: DEFAULT_LOCALE,
                namespace: NAMESPACE_PROFILE_US
            },
            headers: {
                Authorization: `Bearer ${oauthToken}`
            }
        });
        return response;
    }

    async getCharacterMedia(character) {
        const oauthToken = await this.oauthClient.getToken();
        const characterMediaDocumentURL = character.media.href;
        const response = await rp.get({
            uri: characterMediaDocumentURL,
            json: true,
            headers: {
                Authorization: `Bearer ${oauthToken}`
            }
        });
        return response;
    }
}

module.exports = CharacterService;
