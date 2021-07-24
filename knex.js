const knex = require("knex");

module.exports = knex({
    client: "mysql",
    connection: {
        host: process.env.DB_HOST,
        user: process.env.FRONTEND_USERNAME,
        password: process.env.FRONTEND_PASSWORD,
        database: "lukasstaub.dev",
        typeCast: (field, next) => {
            if (field.type == "TINY" && field.length == 4) {
                return field.string() === "1";
            }
            return next();
        },
        charset: "utf8mb4",
    },
});
