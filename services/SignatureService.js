const request = require("request");
const tmp = require("tmp");
const fs = require("fs");
const slug = require("slug");
const {
  BACKGROUND_IMAGE_EMPTY_PATH,
  BACKGROUND_IMAGE_ALLIANCE_PATH,
  BACKGROUND_IMAGE_HORDE_PATH,
  BACKGROUND_IMAGE_NEUTRAL_PATH,
  FONT_MERRIWEATHER_BOLD_PATH,
  FONT_MERRIWEATHER_REGULAR_PATH
} = require("../constants");

// imageMagick made available when running in docker
const gm = require("gm").subClass({ imageMagick: true });

class SignatureService {

  async downloadCharacterMediaAsset(mediaUrl) {
    const tmpName = `${tmp.tmpNameSync()}.png`;
    return new Promise((resolve, reject) => {
      request(mediaUrl)
        .pipe(fs.createWriteStream(tmpName))
        .on("finish", () => {
          resolve(tmpName);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  getBackgroundImagePath(factionEnum) {
    return factionEnum === "ALLIANCE"
      ? BACKGROUND_IMAGE_ALLIANCE_PATH
      : factionEnum === "HORDE"
        ? BACKGROUND_IMAGE_HORDE_PATH
        : BACKGROUND_IMAGE_NEUTRAL_PATH;
  }

  async generateImage(character, characterMedia) {
    const { faction } = character;
    const { assets } = characterMedia;
    const insetAsset = assets.find((asset) => asset.key === "inset");
    const insetUrl = insetAsset.value;
    const backgroundImage = this.getBackgroundImagePath(faction.type);
    const tmpBustPath = await this.downloadCharacterMediaAsset(insetUrl);
    const identityString = `Level ${character.level} ${character.character_class.name} ${
      character.guild ? `of <${character.guild.name}> ` : ""
      }on ${character.realm.name}`;
    const itemLevelString = `Item Level: ${character.equipped_item_level} (${character.average_item_level})`;
    const achievementPointsString = `Achievement Points: ${character.achievement_points}`;

    return new Promise((resolve, reject) => {
      gm(BACKGROUND_IMAGE_EMPTY_PATH)
        .in("-page", "+2+2")
        .in(tmpBustPath)
        .in("-page", "+0+0")
        .in(backgroundImage)
        .mosaic()
        .font(FONT_MERRIWEATHER_BOLD_PATH)
        .fontSize("30")
        .fill("#deaa00")
        .drawText(220, 40, character.name)
        .font(FONT_MERRIWEATHER_REGULAR_PATH)
        .fontSize("12")
        .fill("#888888")
        .drawText(
          220,
          65,
          identityString
        )
        .drawText(
          220,
          85,
          itemLevelString
        )
        .drawText(
          220,
          105,
          achievementPointsString
        )
        .toBuffer("PNG", (err, buffer) => {
          fs.unlinkSync(tmpBustPath);
          if (err) {
            reject(err);
          } else {
            resolve({
              filename: `${slug(character.name)}-${character.realm.slug}.png`.toLowerCase(),
              data: buffer
            });
          }
        });
    });
  }
}

module.exports = SignatureService;
