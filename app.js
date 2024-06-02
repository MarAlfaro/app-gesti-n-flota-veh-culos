const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const geocode = require("./geocode");
const getRoute = require("./directions");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

let deliveries = [];

// Ruta para obtener el token de Mapbox
app.get("/config", (req, res) => {
  res.send({ mapboxToken: process.env.MAPBOX_TOKEN });
});

// Ruta para registrar flota
app.post("/register", async (req, res) => {
  const {
    state,
    location,
    gasoline_level_parcentage,
    speedKm_average,
    totalKm,
  } = req.body;
  try {
    const { latitude, longitude } = await geocode(location);

    const flotaPath = path.join(__dirname, "flota.json");
    let flotas = [];

    if (fs.existsSync(flotaPath)) {
      flotas = JSON.parse(fs.readFileSync(flotaPath));
    }

    flotas.push({
      id: flotas.length + 1,
      state,
      latitude,
      longitude,
      gasoline_level_parcentage,
      speedKm_average,
      totalKm,
      date: new Date(),
    });

    fs.writeFileSync(flotaPath, JSON.stringify(flotas, null, 2));

    const response = JSON.parse(fs.readFileSync(flotaPath, "utf-8"));

    res.send({ message: "Flota registrada con éxito", response });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Ruta obtener las flotas
app.get("/flotas", (req, res) => {
  const flotaPath = path.join(__dirname, "flota.json");
  if (fs.existsSync(flotaPath)) {
    const flotas = JSON.parse(fs.readFileSync(flotaPath));
    res.json(flotas);
  } else {
    res.json([]);
  }
});

app.listen(port, () => {
  console.log(`Servidor está ejecutándose en el puerto ${port}`);
});
