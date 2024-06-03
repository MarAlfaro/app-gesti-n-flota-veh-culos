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

    const newFlota = {
      id: flotas.length + 1,
      state,
      latitude,
      longitude,
      location,
      gasoline_level_parcentage,
      speedKm_average,
      totalKm,
      date: new Date(),
    };

    flotas.push(newFlota);

    fs.writeFileSync(flotaPath, JSON.stringify(flotas, null, 2));

    res.send({ message: "Flota registrada con éxito", newFlota });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const updateFlota = req.body;
  const flotasPah = path.join(__dirname, "flota.json");
  const flotas = JSON.parse(fs.readFileSync(flotasPah));
  const flotaIndex = flotas.findIndex((flota) => flota.id === Number(id));
  if (flotaIndex === -1) {
    return res.status(404).json({ message: "Flota no encontrada" });
  }
  if (flotas[flotaIndex].state === "SIN RUTA") {
    return res
      .status(400)
      .json({ message: "No se puede actualizar una flota sin ruta" });
  }

  try {
    let latitude, longitude;
    if (updateFlota.location) {
      const response = await geocode(updateFlota.location);
      latitude = response.latitude;
      longitude = response.longitude;
    } else {
      latitude = flotas[flotaIndex].latitude;
      longitude = flotas[flotaIndex].longitude;
    }
    flotas[flotaIndex] = {
      ...flotas[flotaIndex],
      ...updateFlota,
      latitude,
      longitude,
      date: new Date(),
    };
    fs.writeFileSync(flotasPah, JSON.stringify(flotas, null, 2));
    res.send({
      message: "flota actualizada con exito",
      response: flotas[flotaIndex],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
