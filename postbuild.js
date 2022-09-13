//&& mkdir build/dl/ && mv build/static/js/main*.js build/dl/dl.js && mv build/static/css/main*.css build/dl/dl.css

const fs = require("fs");
const path = require("path");

fs.mkdirSync("./build/dl");

const jsFile = path.join("./build/static/js/", fs.readdirSync("./build/static/js").find(file => file.endsWith(".js")));
const cssFile = path.join("./build/static/css/", fs.readdirSync("./build/static/css").find(file => file.endsWith(".css")));

fs.renameSync(jsFile, "./build/dl/dl.js");
fs.renameSync(cssFile, "./build/dl/dl.css");