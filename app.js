//Para conectar a la base de datos MongoDB: mongodb://localhost/27017
//Para instalar nodemon: npm install -g nodemon
//Despues de conectar a la base de datos coloca en la terminal: nodemon app
//En la terminal te saldra lo siguiente: Connected to MongoDB - Server started on port 3000

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require('./usuario'); // Make sure to use the User model correctly

const app = express();
const PORT = 3000;
const mongo_uri = "mongodb://localhost:27017/usuarios";

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Conectar a MongoDB usando async/await
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
};

connectToMongoDB();

// Rutas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const user = new User({ username, password });

    try {
        await user.save();
        console.log("User registered successfully");
        res.send("User registered successfully");
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).send("Error registering user");
    }
});

app.post('/authenticate', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        const passwordMatch = await user.isCorrectPassword(password);
        if (!passwordMatch) {
            return res.status(401).send('Invalid username or password');
        }

        res.send('Login successful');
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).send('Error authenticating user');
    }
});
