require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const knex = require("./knex");

const PORT = process.env.PORT || 2395;

const app = express();

app.use(
    express.json({
        limit: "50mb",
    })
);
app.use(cookieParser());
app.use(
    cors({
        origin: "*",
    })
);

app.get("/:filename", async (req, res) => {
    const { filename } = req.params;

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
});

app.get("/*", (_, res) => {
    return res.sendStatus(403);
});

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});
