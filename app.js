const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const geocode = require("./geocode");
const getRoute = require("./directions");

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

// Ruta para registrar un nuevo envío
app.post("/register", async (req, res) => {
  const { code, pointAAddress, pointBAddress } = req.body;
  try {
    const pointA = await geocode(pointAAddress);
    const pointB = await geocode(pointBAddress);
    const route = await getRoute(pointA, pointB);
    const delivery = {
      code,
      pointA,
      pointB,
      pointAAddress,
      pointBAddress,
      route,
    };
    deliveries.push(delivery);
    res.send({ message: "Envío registrado con éxito", delivery });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Ruta para buscar un envío por código
app.get("/search/:code", (req, res) => {
  const code = req.params.code;
  const delivery = deliveries.find((delivery) => delivery.code === code);
  if (delivery) {
    res.send(delivery);
  } else {
    res.status(404).send({ message: "Envío no encontrado" });
  }
});

app.listen(port, () => {
  console.log(`Servidor está ejecutándose en el puerto ${port}`);
});
