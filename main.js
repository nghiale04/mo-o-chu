import { decodeData } from "./data/data.secure.js";
import { Game } from "./app.js";

document.addEventListener("DOMContentLoaded", () => {
    const decodedData = decodeData();

    if (!decodedData || !decodedData.data) {
        console.error("❌ Decode data FAILED", decodedData);
        return;
    }

    console.log("✅ Decode data OK", decodedData);

    window.game = new Game(decodedData);
});
