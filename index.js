import express from "express"; 
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index", { jokes: null, error: null });
});

app.post("/", async (req, res) => {
    try {
        const { category, language, flags, type, number } = req.body;
        let apiUrl = `https://v2.jokeapi.dev/joke/${category}?amount=${number}&type=${type}`;

        if (flags) {
            const blacklistFlags = Array.isArray(flags) ? flags.join(",") : flags;
            apiUrl += `&blacklistFlags=${blacklistFlags}`;
        }

        if (language && language !== "en") {
            apiUrl += `&lang=${language}`;
        }

        const response = await axios.get(apiUrl);
        const jokeData = response.data;

        let jokesArray = [];

        if (jokeData.error) {
            throw new Error("Invalid request. Please check your input.");
        }

        if (jokeData.jokes && jokeData.jokes.length > 0) {
            jokesArray = jokeData.jokes.map(joke => joke.joke || `${joke.setup} - ${joke.delivery}`);
        } else if (jokeData.joke || jokeData.setup) {
            jokesArray = [jokeData.joke || `${jokeData.setup} - ${jokeData.delivery}`];
        } else {
            throw new Error("No jokes found. Try changing the filters.");
        }

        res.render("index", { jokes: jokesArray, error: null });

    } catch (error) {
        console.error("Error fetching joke:", error.message);
        res.render("index", { jokes: null, error: error.message || "Failed to fetch joke." });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
