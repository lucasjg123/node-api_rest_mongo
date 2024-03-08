import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import { router as bookRoutes } from "./routes/book.routes.js";
import bodyParser from "body-parser";
config();

//Usamos express para losmiddlewars
const app = express();
app.use(bodyParser.json()); // se parsea el body q recibamos

// Aca conectaremos la BD
mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB_NAME });
const db = mongoose.connection;

app.use("/books", bookRoutes); // Si el cliente buscar /books, devuelve la ruta de book
// Es decir defino el end point /books y le paso las rutas posibles

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
