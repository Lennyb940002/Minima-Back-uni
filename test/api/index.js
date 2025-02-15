const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const path = require("path");

const app = express();
app.use(
  cors({
    origin: ["https://minima-front-uni.vercel.app/"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);
app.use(express.json());

// Fonction pour extraire l'email d'une ligne
function extractEmail(line) {
  const emailMatch = line.match(/- (.+@.+\..+)$/);
  return emailMatch ? emailMatch[1].trim() : null;
}

// Fonction pour vérifier si l'email existe déjà
async function checkEmailExists(newEmail) {
  try {
    try {
      await fs.access("email.txt");
    } catch {
      return false;
    }
    const fileContent = await fs.readFile("email.txt", "utf-8");
    const lines = fileContent.split("\n").filter((line) => line.trim());
    for (const line of lines) {
      const existingEmail = extractEmail(line);
      if (
        existingEmail &&
        existingEmail.toLowerCase() === newEmail.toLowerCase()
      ) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    throw error;
  }
}

app.post("/api/emails", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email invalide" });
    }

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return res.status(409).json({ error: "Cet email est déjà inscrit" });
    }

    const timestamp = new Date().toISOString();
    const emailEntry = `${timestamp} - ${email}\n`;
    await fs.appendFile("email.txt", emailEntry);

    res.json({ success: true, message: "Email enregistré avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'email:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'enregistrement de l'email" });
  }
});

app.get("/api/emails", async (req, res) => {
  try {
    const content = await fs.readFile("email.txt", "utf-8");
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la lecture des emails" });
  }
});

// Exporter l'application Express en tant que fonction serverless
module.exports = app;
