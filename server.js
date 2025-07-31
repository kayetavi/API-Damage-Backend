const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// 📦 Inventory Calculation API
app.post('/api/inventory', (req, res) => {
  try {
    const {
      shape, phase, manual,
      volumeInput, volumeUnit,
      inv_diameter, inv_length,
      inv_diameterUnit, inv_lengthUnit,
      addHead, headType, headCount,
      equipmentType, customPercent,
      density, flowRate, flowRateUnit
    } = req.body;

    let volume = 0;

    // 🔹 Manual Volume
    if (manual) {
      volume = (volumeUnit === "ft3") ? volumeInput * 0.0283168 : volumeInput;
    }
    // 🔹 Auto Volume
    else if (shape && phase !== "vapor") {
      const d = inv_diameter * (inv_diameterUnit || 1);
      const l = inv_length * (inv_lengthUnit || 1);
      let cylVolume = 0, headVolume = 0;

      if (shape === "cylinder") {
        cylVolume = Math.PI * Math.pow(d / 2, 2) * l;

        if (addHead) {
          const count = headCount || 2;

          if (headType === "hemihead") {
            headVolume = (2 / 3) * Math.PI * Math.pow(d / 2, 3);
          } else if (headType === "torispherical") {
            headVolume = 0.9 * Math.PI * Math.pow(d / 2, 2) * (d / 4);
          } else if (headType === "ellipsoidalhead") {
            headVolume = (Math.PI / 24) * Math.pow(d, 3);
          }

          volume = cylVolume + (count * headVolume);
        } else {
          volume = cylVolume;
        }

      } else if (shape === "sphere") {
        volume = (4 / 3) * Math.PI * Math.pow(d / 2, 3);
      }
    }

    const results = {
      volume: Number(volume.toFixed(2)),
      liquidInventory: null,
      vaporInventory: null
    };

    // 🔹 Liquid
    if (phase === "liquid" || phase === "both") {
      let percent = equipmentType === "custom"
        ? customPercent / 100
        : getDefaultLVPercent(equipmentType);

      if (!density || percent === 0) {
        return res.status(400).json({ error: "Missing density or %." });
      }

      const liquidMass = volume * percent * density;
      results.liquidInventory = Number(liquidMass.toFixed(2));
    }

    // 🔹 Vapor
    if (phase === "vapor" || phase === "both") {
      let flow = flowRate;
      if (flowRateUnit === "kg/min") flow /= 60;
      if (flowRateUnit === "kg/h") flow /= 3600;
      const vaporMass = flow * 180;
      results.vaporInventory = Number(vaporMass.toFixed(2));
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

function getDefaultLVPercent(equipmentType) {
  const lvMap = {
    COLTOP: 0.25, COLMID: 0.25, COLBTM: 0.37,
    DRUM: 0.50, KODRUM: 0.10, COMP: 0.0,
    PUMP: 1.0, HEX: 0.50, FINFAN: 0.25,
    FILTER: 1.0, PIPE: 1.0, REACTOR: 0.15
  };
  return lvMap[equipmentType] || 0;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Inventory API running on port ${PORT}`));
