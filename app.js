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
    const { filename, data } = await signatureService.generateImage(character, characterMedia);
    res.set("Content-Type", "image/png");
    res.set("Content-Disposition", `inline; filename="${filename}"`);
    res.send(data);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.json(err.toString());
});

module.exports = async () => {
  try {
    await oauthClient.getToken();
  } catch (err) {
    console.error("failed to initialize oauth token at startup:")
    console.log(err.message);
  }
  return Promise.resolve(app);
};
