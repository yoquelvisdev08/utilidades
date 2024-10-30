const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint para crear una predicción
app.post('/api/generate', async (req, res) => {
  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
        input: req.body,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al conectar con Replicate');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener el estado de una predicción
app.get('/api/generate/:id', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${req.params.id}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener el estado de la predicción');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
