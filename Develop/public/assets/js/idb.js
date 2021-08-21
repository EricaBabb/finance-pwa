// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'finance-pwa' and set it to version 1
const request = indexedDB.open('finance-pwa', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
//IndexedDB infers that a change needs to be made when the database is first connected (which we're doing now) or if the version number changes.
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_finance`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_finance', { autoIncrement: true });
  };

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // if app is online, run uploadFinances() function to send all local db data to api
    if (navigator.onLine) {
      uploadFinances();
    }
  };
  
  //error will be logged here
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };  

  // This function will be executed if we attempt to submit a new financial transaction and there's no internet connection
  //This saveRecord() function will be used in the index.js file's form submission function if the fetch() function's .catch() method is executed.
function saveRecord(record) {
    // open a new transaction (or a temporary connection) with the database with read and write permissions into the new_finance object store we declared earlier
    const transaction = db.transaction(['new_finance'], 'readwrite');
  
    // access the object store for `new_finance`
    const financeObjectStore = transaction.objectStore('new_finance');
  
    // add record to your store with add method
    financeObjectStore.add(record);
  }
  


  function uploadFinances() {
    // open a transaction on your db
    const transaction = db.transaction(['new_finance'], 'readwrite');
  
    // access your object store
    const financeObjectStore = transaction.objectStore('new_finance');
  
    // get all records from store and set to a variable
    const getAll = financeObjectStore.getAll();
  
    // upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_finance'], 'readwrite');
          // access the new_finance object store
          const financeObjectStore = transaction.objectStore('new_finance');
          // clear all items in your store
          financeObjectStore.clear();

          alert('All saved financial transactions have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
  }
   
// listen for app coming back online
window.addEventListener('online', uploadFinances);