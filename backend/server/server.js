const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const  { mongodb }  = require('../../config/config.json')
const dataBooks = require('../../data/book-data.json');
const BookModel = require('./bookModel');

class Server {
    
  constructor(port, dbConfig) {
    this.port = port || 3000;
    this.mongodb = dbConfig;
    this.bookModel = new BookModel();
  }

  async startServer() {
    const dbUrl = `mongodb://${mongodb.username}:${mongodb.password}@127.0.0.1:27017/library`;

    try {
      await mongoose.connect(dbUrl);
      console.log('Connected to MongoDB');
      
      const app = express();
      app.use(express.json());
      const publicPath = path.join(__dirname, '..', '..', 'frontend');
      app.use(express.static(publicPath));
      app.get('/', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
      });

      app.post('/addBook', async (req, res) => {
        console.log('Запрос на /addBook получен');
        try {
          await this.bookModel.addBooksToDB(dataBooks);
          console.log('true');
          res.status(200).send('Книги успешно добавлены в базу данных.');
        } catch (error) {
          console.error(error);
          res.status(500).send('Произошла ошибка при добавлении книг в базу данных.');
        }
      });

      app.get('/getBooks', async (req, res) => {
        try {
          const books = await this.bookModel.getBooks();
          res.status(200).json(books);
        } catch (error) {
          console.error(error);
          res.status(500).send('Произошла ошибка при получении списка книг.');
        }
      });

      app.listen(this.port, () => {
        console.log(`Сервер запущен на http://localhost:${this.port}`);
      });
    } catch (error) {
      console.error('Ошибка при подключении к MongoDB:', error);
    }
  }
};

const server = new Server()

server.startServer(3000, mongodb);
