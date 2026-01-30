import { decodeData } from "./data/data.secure.js";
import { Game } from "./app.js";

document.addEventListener("DOMContentLoaded", () => {
    const decodedData = decodeData();
    window.game = new Game(decodedData);
});
