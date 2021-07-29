require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const knex = require("./knex");

const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 2395;

const app = express();

app.set("trust proxy", true);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use(async (req, _, next) => {
    if (process.env.NODE_ENV === "production" && !(req.headers["origin"] ? req.headers["origin"].includes("lukasstaub.dev") : false)) {
        try {
            await knex("access_logs").insert({
                user_agent: req.headers["user-agent"],
                page_name: process.env.RESOURCE_NAME,
                requested_resource: req.path,
                method: req.method,
            });
        } catch (e) {
            fs.writeFileSync(
                path.join(__dirname, "./error.txt"),
                JSON.stringify({
                    error: e.toString(),
                    time: new Date(),
                    environment: process.env,
                }),
                { encoding: "utf-8" }
            );
        }
    }

    return next();
});

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
