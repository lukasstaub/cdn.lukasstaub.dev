require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const knex = require("./knex");

const PORT = process.env.PORT || 2395;

const app = express();

app.set("trust proxy", true);
app.use(async (req, _, next) => {
    if (process.env.NODE_ENV === "production") {
        const ip = req.ip;

        await knex("requests").insert({
            ip: ip,
            client: req.headers["user-agent"],
            method: req.method,
            url: req.url,
            source: process.env.PAGE_NAME,
        });
    }

    return next();
});

app.use(
    express.json({
        limit: "50mb",
    })
);
// app.use(cookieParser());
app.use(
    cors({
        origin: "*",
    })
);

app.get("/:filename", async (req, res) => {
    const { filename } = req.params;

    try {
        const [file] = await knex("files").select("data", "content_type").where("name", "=", filename);

        if (file) {
            var readFile = Buffer.from(file.data);

            res.writeHead(200, {
                "Content-Type": file.content_type,
                "Content-Length": readFile.length,
            });
            return res.end(readFile);
        } else {
            return res.sendStatus(404);
        }
    } catch (e) {
        return res.sendStatus(500);
    }
});

app.get("/*", (_, res) => {
    return res.sendStatus(403);
});

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});
