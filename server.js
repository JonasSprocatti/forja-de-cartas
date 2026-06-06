// server.js — adaptador para hospedar no Render (Web Service Node).
// Serve os arquivos estáticos e direciona /api/* para as mesmas funções usadas no Vercel.
// No Vercel este arquivo é ignorado (lá as funções em /api rodam direto).
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import card from "./api/generate-card.js";
import art from "./api/generate-art.js";
import checkout from "./api/create-checkout.js";
import webhook from "./api/stripe-webhook.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// O webhook da Stripe PRECISA do corpo cru → sem parser nesta rota
// (o handler lê o stream direto para validar a assinatura).
app.post("/api/stripe-webhook", (req, res) => webhook(req, res));

// Demais rotas recebem JSON
app.post("/api/generate-card", express.json({ limit: "2mb" }), (req, res) => card(req, res));
app.post("/api/generate-art", express.json({ limit: "2mb" }), (req, res) => art(req, res));
app.post("/api/create-checkout", express.json(), (req, res) => checkout(req, res));

// Arquivos estáticos (index.html, app.js, style.css, assets/, etc.)
app.use(express.static(__dirname));
// Fallback para a página principal
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Forja de Cartas rodando na porta " + port));
