const express = require("express");
const helmet = require("helmet");
const request = require("request");
const cheerio = require("cheerio");
const { exec } = require("child_process");
const uuid = require("uuid").v4;
const fs = require("fs");
const ms = require("ms");

const app = express();

app.use(helmet());

app.get("/audio/level/:id", async (req, result) => {
  if (isNaN(req.params.id))
    return result.status(400).json({ error: "Invalid ID!" });

  let start = Date.now();
  let fileName = uuid();

  request.get(
    `https://www.roblox.com/library/${req.params.id}`,
    (error, response, body) => {
      if (error)
        return result
          .status(400)
          .json({ error: "Failed to get audio URL from Roblox!" });

      let $ = cheerio.load(body);
      let audioUrl = $('div[class="MediaPlayerIcon icon-play"]').attr(
        "data-mediathumb-url"
      );

      if (!audioUrl)
        return result.status(400).json({ error: "Invalid audio ID!" });

      request
        .get(audioUrl)
        .on("error", (err) => {
          result
            .status(400)
            .json({ error: "Failed to get audio from Roblox!" });
        })
        .on("complete", (res) => {
          if (result.statusCode !== 200)
            return result.status(400).json({
              error: `Failed to get audio from Roblox! Status code: ${result.statusCode}`,
            });

          if (res.headers["content-type"] !== "audio/mpeg")
            return result.status(400).json({
              error: `Invalid content type received: ${res.headers["content-type"]}`,
            });

          exec(
            `ffmpeg -i ./temp/${fileName}.mp3 -af "volumedetect" -f null /dev/null`,
            (error, stdout, stderr) => {
              if (error)
                return res
                  .status(400)
                  .json({ error: "Failed to process audio!" });

              //i have no idea why ffmpeg writes to stderr but whatever
              let overAllLvl = stderr
                .split("\n")
                .find((s) => s.includes("mean_volume"))
                .split("mean_volume: ")[1];
              let overAllDb = parseInt(overAllLvl.replace(" dB", ""));
              
              result.status(200).json({
                processingTime: ms(Date.now() - start),
                audioLevel: overAllLvl,
                isEarRape: overAllDb > -10 ? true : false,
              });

              fs.unlinkSync(`./temp/${fileName}.mp3`);
            }
          );
        })
        .pipe(fs.createWriteStream(`./temp/${fileName}.mp3`));
    }
  );
});

app.listen(5000, () => {
  console.log("Listening at port 5000...");
});
