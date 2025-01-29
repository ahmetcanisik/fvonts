import { Utils } from "./utils";

const dir = process.cwd();

console.log(dir);

if (Utils.capitalizeFontName("merhaba") === "Merhaba") console.log("Passed::Utils::capitalizeFontName");