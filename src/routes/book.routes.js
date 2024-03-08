// aca van los get - post - path...
import express from "express";
import Book from "../models/book.model.js";
const router = express.Router();

// ACA DEFINO TODOS LOS ENDPOINTS(routes) POSIBLES  para books

//MIDDLEWARE [GET:ID]
const getBook = async (req, res, next) => {
  let book;
  const { id } = req.params; // obtnemos el id de los parametros enviados en la peticion

  // si el id coincide con el formato de id en mongoDB
  if (!id.match(/^[0-9a-fA-F]{24}$/))
    return res.status(404).json({ message: "El ID del libro no es válido" });

  try {
    book = await Book.findById(id); // busco en la tabla el registro con dicha id
    if (!book)
      return res.status(404).json({ message: "El libro no fue encontrado" });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }

  res.book = book; // guardo el book
  next(); // continuar
};

//Obtener todos los libros [GET ALL]
router.get("/", async (req, res) => {
  try {
    const books = await Book.find(); // trae todos los books, seria como hacer un select * from books.
    console.log("GET ALL", books);

    if (books.length === 0) return res.status(204).json([]); // Si retorna vacio lanzamos error. Codigo 204: No Content
    res.json(books); // mandamos como respuesta "books"
  } catch (error) {
    res.status(500).json({ message: error.message }); // Si hay un error enviamos el msj del mismo en formato json como respuesta mediante el codigo 500
    //codigo 500: Internal Server Error
  }
});

//Obtener un libro por id [GET :ID]
// Aca uso el middleware getBook para validar el id y lo q se retorna antes de enviar la res
router.get("/:id", getBook, async (req, res) => {
  res.json(res.book);
});

//Crear un nuevo libro (recurso) [POST]
router.post("/", async (req, res) => {
  const { title, author, genre, publication_date } = req?.body; //desectructuro los atributos enviados al sv. req?.body accedo al contenido de la peticion
  // req? es un if (req!=null) req.body - abreviado y util JOYA
  if (!title || !author || !genre || !publication_date) {
    return res.status(400).json({
      message: "Los campos titulos, autor, género y fecha son obligatorios",
    }); // codigo 400: Bad Request
  }

  //creamos el obj del nuevo libro creado
  const book = new Book({
    title, // es lo mismo que "t"itle: title,"
    author,
    genre,
    publication_date,
  });

  try {
    const newBook = await book.save(); // genera el obj mongo book y lo retorna
    console.log(newBook);
    res.status(201).json(newBook); // Codigo 201: Created
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Modifica un recurso por completo [PUT]
router.put("/:id", getBook, async (req, res) => {
  try {
    const book = res.book; // obtenemos el book del middleware
    book.title = req.body.title || book.title; // Si la solicitud envia un nuevo titulo, lo seteo sino seteo el existente
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;

    const updatedBook = await book.save(); //guardo el registro creado. El .save() es xq es un obj de Mongoose
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Modificamos el registro parcialmente [PATCH]
router.patch("/:id", getBook, async (req, res) => {
  // Si no se manda ningun atributo del recurso. Estaria piola agregarlo tmb al put
  if (
    !req.body.title &&
    !req.body.author &&
    !req.body.genre &&
    !req.body.publication_date
  ) {
    res.status(400).json({
      message:
        "Al menos uno de estos campos debe ser enviado: Titulo, Autor, Genero o Fecha de publicacion",
    });
  }

  try {
    const book = res.book; // obtenemos el book del middleware
    book.title = req.body.title || book.title; // Si la solicitud envia un nuevo titulo, lo seteo sino seteo el existente
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;

    const updatedBook = await book.save(); //guardo el registro creado. El .save() es xq es un obj de Mongoose
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminamos un recurso [DELETE]
router.delete("/:id", getBook, async (req, res) => {
  try {
    const book = res.book;
    await book.deleteOne({
      _id: book._id,
    }); // await xq el borrado es asincronico de js
    res.json({ message: `El libro ${book.title} fue eliminado exitosamente` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export { router };
