const mongoose = require('mongoose');

class BookModel {
   constructor() {
     this.bookSchema = new mongoose.Schema({
        img: String,
        title: String,
        genre: Array,
        year: Number,
        pages: Number,
        author: String,
      });
      this.Book = mongoose.model('Book', this.bookSchema, 'books');
   }
    async addBooksToDB(dataBooks) {
        for (const bookData of dataBooks) {
            // Проверяем, есть ли такая книга уже в коллекции
            const existingBook = await this.Book.findOne({ title: bookData.title });

            console.log(`Попытка добавления книги: ${bookData.title}`);

            if (!existingBook) {
                // Если нет, добавляем книгу
                const newBook = new this.Book(bookData);
                await newBook.save();
                console.log(`Добавлена новая книга: ${bookData.title}`);
            } else {
                console.log(`Книга ${bookData.title} уже существует, пропускаем.`);
            }
        }
        console.log('Процесс добавления книг завершен.');
    }
    async getBooks() {
        try {
            return await this.Book.find();
        } catch (error) {
            console.error('Ошибка при получении списка книг:', error);
            throw error;
        }
    }
};

module.exports = BookModel;