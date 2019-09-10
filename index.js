let myLibrary = [];
const setStorage = myLibrary =>
  localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
const getStorage = myLibrary => {
  if (myLibrary.length) {
    setStorage(myLibrary);
  } else if (localStorage.getItem("myLibrary")) {
    const item = JSON.parse(localStorage.getItem("myLibrary"));
    myLibrary = item.map(
      ({ title, shortdescription, pages, author, status }) => {
        const newBook = new Book(
          title,
          shortdescription,
          pages,
          author,
          status
        );
        return newBook;
      }
    );
  }
  return myLibrary;
};

const addBookButton = document.querySelector("#add_book");
addBookButton.addEventListener("click", addBookToLibrary);

// all deleted items
const recycler = [];

if (storageAvailable()) {
  if (localStorage.getItem("myLibrary")) {
    myLibrary = getStorage(myLibrary);
  }
} else {
  myLibrary = [];
}

function Book(title, shortdescription, pages, author) {
  this.title = title;
  this.shortdescription = shortdescription;
  this.pages = pages;
  this.author = author;
  this.status = "available";
  this.read = function() {
    if (this.status === "available") {
      this.status = "busy";
    } else {
      this.status = "available";
    }
    setStorage(myLibrary);
    render();
  };
}

const readBook = function(index) {
  return myLibrary[index].read();
};
const removeBookFromLibrary = index => {
  recycler.push(myLibrary.splice(index, 1));
  setStorage(myLibrary);
  render();
};
const changeBookState = ({ target }) => {
  const { value, name } = target;
  const index = Number(name);
  switch (value) {
    case "dispose":
      removeBookFromLibrary(index);
      break;
    case "take to read":
      readBook(index);
      break;
    default:
      break;
  }
};

function addBookToLibrary() {
  const book = new Book();
  let validEntry = true;
  const bookDetails = document.querySelectorAll("input");
  const getBookDetails = ({ name, value, validity: { valid = true } }) => {
    if (!valid) {
      validEntry = valid;
    }
    book[`${name}`] = value;
  };

  bookDetails.forEach(getBookDetails);
  if (validEntry) {
    myLibrary.push(book);
    setStorage(myLibrary);
  }
  render();
}

function render() {
  myLibrary = getStorage(myLibrary);
  let render = myLibrary
    .map(
      (book, index) => `
            <book id="book">
              <book-start>
                <book-title>${book.title}</book-title>
                <book-shortdescription>${book.shortdescription}</book-shortdescription>
                <book-status>${book.status}</book-status>
                <book-author>${book.author}</book-author>
                <book-pages>${book.pages}</book-pages>
              </book-start>
              <book-end>
                <input type="button" value="dispose" name="${index}">
                <input type="button" value="take to read" name="${index}">
              </book-end>
            </book>
        `
    )
    .join("");

  document.querySelector("#list-of-objects").innerHTML = render;
  const bookElement = document.querySelector("#list-of-objects");
  bookElement.addEventListener("click", changeBookState);
}

function storageAvailable(type = "localStorage") {
  var storage;
  try {
    storage = window[type];
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0)
    );
  }
}

window.addEventListener("load", render);
