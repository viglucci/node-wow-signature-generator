const Promise = require("bluebird");
const express = require("express");
const OauthClient = require("./oauth.js");
const CharacterService = require("./services/CharacterService");
const SignatureService = require("./services/SignatureService");

const oauthClient = new OauthClient();
const characterService = new CharacterService(oauthClient);
const signatureService = new SignatureService();

const app = express();

app.get("/signature", async (req, res, next) => {
  try {
    const { characterName, realmName } = req.query;
    const character = await characterService.getCharacter(characterName, realmName);
    const characterMedia = await characterService.getCharacterMedia(character);
    const imageBuffer = await signatureService.generateImage(character, characterMedia);
    res.set("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (err) {
    next(err);
  }
});

app.use((req, res, err) => {
  res.json(err.toString());
});

module.exports = async () => {
  await oauthClient.getToken();
  return Promise.resolve(app);
};
