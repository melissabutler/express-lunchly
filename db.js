/** Database for lunchly */

const  { Client } = require("pg");

let DB_URI;

if(process.env.NODE_ENV === "test") {
    DB_URI = "lunchly_test";
} else {
    DB_URI = "lunchly"
}

const db = new Client({
    host: "/var/run/postgresql",
    database: DB_URI })

db.connect();

module.exports = db;
