
class Book {
   constructor(id, title, genre, year, pages, author, img) {
        this.id = id;
        this.title = title;
        this.genres = genre;
        this.year = year;
        this.pages = pages;
        this.author = author;
        this.img = img;
   }

   showInfo() {
    console.log(`
    Название: ${this.title},
    Жанры: ${this.genres.join(', ')},
    Автор: ${this.author},
    Страниц: ${this.pages},
    Год выпуска: ${this.year},
    `);
   }

   getGenres() {
        return this.genres
   }
};

class Page {
    static #numberPage = 1;

    constructor() {
        this.numberPage = Page.#numberPage++;
        this.booksPage = [];
    }

    static get numberPage() {
        return Page.#numberPage;
    }

    static resetPageNumber() {
        Page.#numberPage = 1;
    }

    static getCurrentNumberPage() {
        return Page.#numberPage;
    }
};

class Library {
   constructor(name) {
       this.name = name;
       this.books = [];
       this.pages = [];
       this.genres = [];
       this.selectedGenres = [];
       this.quantityBooksOnPage = 20;
   }

    async loadBooks(url) {
        try {
            const response = await fetch(url);
            const books = await response.json();
            books.reverse()
            this.addBooks(books);
        } catch (error) {
            console.error("Error loading books:", error);
        }
    }

    addBooks(books) {
        console.log(books);
        books.forEach(book => this.createBook(book.id, book.title, book.genre, book.year, book.pages, book.author, book.img));
    }

    createBook(id, title, genre, year, pages, author, img) {
        const newBook = new Book(id, title, genre, year, pages, author, img);
        this.books.push(newBook)
        return newBook
    }

    createPages(currentArr) {
        this.pages = []
        Page.resetPageNumber()
            
        this.pages = currentArr.reduce((acc, book, index) => {

            const currentPageIndex = Math.floor(index / this.quantityBooksOnPage);
    
            if (!acc[currentPageIndex]) {
                acc[currentPageIndex] = new Page();
            }
    
            const currentPage = acc[currentPageIndex];

            currentPage.booksPage.push(book);
    
            return acc;
        }, []);

        renderPageButtons()
    }

    getFilteredGenres() {
        const allGenres = this.books.map(book => book.getGenres()).flat();
        this.genres = allGenres.filter((genre,index,self) => self.indexOf(genre) === index)
    }

    getPage(number) {
        if (!number) {
            const currentPage = this.pages.find(page => page.numberPage === Page.getCurrentNumberPage());
            return currentPage || this.pages[0];
        } else {
            return this.pages.find(page => page.numberPage === number);
        }
    }

    findBooksByTitle(title) {
        title = title.toLowerCase()
        return this.books.filter(book => book.title.toLowerCase().includes(title));
    }

    findBooksByGenre(genres) {
        return this.books.filter(book => genres.every(genre => book.genres.includes(genre)));
    }  
};

const library = new Library('TOP Library')

const containerBook = document.querySelector('.container__book');
const containerPages = document.querySelector('.library__pages');
const containerGenresRight = document.querySelector('.container__right .genres__block');
const containerGenresLeft = document.querySelector('.container__left .genres__block');
const btnSearchBooks = document.querySelector('.container__right .search-info__button');
const btnSearchBooksMobile = document.querySelector('.container__left .search-info__button');

btnSearchBooks.addEventListener('click', ()=> {
    const searchBooks = document.querySelector('.container__right .search-info__input').value;
    if(searchBooks === '') {
        return false
    } else {
        const filteredBooks = library.findBooksByTitle(searchBooks)
        library.createPages(filteredBooks);
        renderBooks(filteredBooks)
    }
})

btnSearchBooksMobile.addEventListener('click', ()=> {
    const searchBooks = document.querySelector('.container__left .search-info__input').value;
    if(searchBooks === '') {
        return false
    } else {
        const filteredBooks = library.findBooksByTitle(searchBooks)
        library.createPages(filteredBooks);
        renderBooks(filteredBooks)
    }
})


library.loadBooks('http://localhost:3000/getBooks')
.then(()=>{
    library.getFilteredGenres()
    library.createPages(library.books);
    renderPageButtons();
    renderGenres()
    console.log(library);

    const currentShowBooksOnPage = library.getPage();
    renderBooks(currentShowBooksOnPage.booksPage);

    console.log(library.pages, library.getPage());
}).catch(error => {
    console.error('Error loading books:', error);
});

function renderBooks(books) {
    containerBook.innerHTML = '';

    const fragment = document.createDocumentFragment();
    books.forEach(book => {
        const card = createBookCard(book);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = card;
        fragment.appendChild(tempDiv.firstElementChild);
    });
    containerBook.appendChild(fragment);
    initSwiper();
    addEventNotice()
};

function initSwiper() {
    let mySwiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        navigation: {
            nextEl: '.book__slide-right',
            prevEl: '.book__slide-left',
        },
    });
};

function renderPageButtons() {
    const fragmentPages = document.createDocumentFragment();
    library.pages.forEach(page => {
        const btnPage = createBtnPage(page);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = btnPage;
        fragmentPages.appendChild(tempDiv.firstElementChild);
    });
    containerPages.innerHTML = '';
    containerPages.appendChild(fragmentPages);

    const btnPages = document.querySelectorAll('.pages__block');
    btnPages.forEach(btnPage => {
        btnPage.addEventListener('click', () => {
            if(!btnPage.classList.contains('active-btn')) {
                const newShowBooksOnPage = library.getPage(+btnPage.dataset.pageNumber);
                renderBooks(newShowBooksOnPage.booksPage);
                
                btnPages.forEach(btn => btn.classList.remove('active-btn'));
                btnPage.classList.add('active-btn')
                console.log(btnPage, +btnPage.dataset.pageNumber, newShowBooksOnPage);
            }
        });
    });
};

function renderGenres() {
    const fragmentGenresRight = document.createDocumentFragment();
    library.genres.forEach(genre => {
        const checkboxGenre = createGenres(genre);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = checkboxGenre;
        fragmentGenresRight.appendChild(tempDiv.firstElementChild);
    });
    containerGenresRight.innerHTML = '';
    containerGenresRight.appendChild(fragmentGenresRight);

    const fragmentGenresLeft = document.createDocumentFragment();
    library.genres.forEach(genre => {
        const checkboxGenre = createGenres(genre);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = checkboxGenre;
        fragmentGenresLeft.appendChild(tempDiv.firstElementChild);
    });
    containerGenresLeft.innerHTML = '';
    containerGenresLeft.appendChild(fragmentGenresLeft);


    const chechBox = document.querySelectorAll('.real-checkbox')
    chechBox.forEach(chechbox=>{
        chechbox.addEventListener('change', ()=>{
            library.selectedGenres = Array.from(chechBox)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            console.log(library.selectedGenres);
            
            const filteredBooks = library.findBooksByGenre(library.selectedGenres);

            if (library.selectedGenres.length === 0) {
                library.createPages(library.books);
                renderBooks(library.getPage().booksPage)
            } else {
                library.createPages(filteredBooks);
                renderBooks(filteredBooks)
            }
        })
    })
}

function createBookCard(book) {
    console.log(book.genres);
    return `
    <div class="item__book swiper-container">
        <div class="book__top swiper-wrapper">
            <div class="book__img slide swiper-slide ">
                <img src="${book.img}" alt="img-book">
                <button class="book__slide-right"></button>
            </div>
            <div class="book__body slide swiper-slide">
                <div class="book__description">
                    <div class="book__title"><span>Название:</span> ${book.title}</div>
                    <div class="book__genres book__styles"><span>Жанры:</span> ${book.genres.join(', ')}</div>
                    <div class="book__year book__styles"><span>Год выпуска:</span> ${book.year}</div>
                    <div class="book__pages book__styles"><span>Страниц:</span> ${book.pages} страниц</div>
                    <div class="book__author book__styles"><span>Автор:</span> ${book.author}</div>
                </div>
                <button class="book__slide-left "></button>
            </div>
        </div>
        <div class="book__button">
            <div class="button__read">Читать</div>
            <div class="button__favorites">В избранное</div>
        </div>
    </div>
    `
}


function createBtnPage(page) { 
    const btnClass = page.numberPage === 1 ? 'pages__block active-btn' : 'pages__block';
    return `
    <div class="${btnClass}" data-page-number=${page.numberPage}><span>${page.numberPage}</span></div>
    `
}


function createGenres(genre) {
    return `
    <label>
        <input type="checkbox" value="${genre}" name="filter-genres" class="real-checkbox"></input>
        <span class="custom-checkbox"></span>
        ${genre}
    </label>
    `
}

const containerMain = document.querySelector('.container')
const containerRight = document.querySelector('.container__right')
const btnMenu = document.querySelector('.menu__icon')


btnMenu.addEventListener('click',  () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
    btnMenu.classList.toggle('open');
    containerRight.classList.toggle('container__right-active')
    containerMain.classList.toggle('container-active')
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function addEventNotice() {
    const btnFavorites = document.querySelectorAll('.button__favorites')
    btnFavorites.forEach(currentBtn => {
        currentBtn.addEventListener('click', async ()=>{
            console.log('Button clicked');
            const tempDiv = document.createElement('div');
            const noticeBlock = `
                <div class="notice">
                    <div class="notice__text">Зарегистрируйтесь, чтобы добавлять книги в избранное.</div>
                </div>
            `;
            tempDiv.innerHTML = noticeBlock;
            containerMain.appendChild(tempDiv.firstElementChild);
            const notice = document.querySelector('.notice')

            await delay(300)
            notice.classList.add('active')
            await delay(1500)
            notice.classList.remove('active')
            await delay(2000)
            containerMain.removeChild(notice);
        })
    })
}