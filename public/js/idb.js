// Initiate db variable
let db;

// Open indexedDB
const request = indexedDB.open('budget-tracker', 1);

// Upgrade Needed Function
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// Success function
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransactions();
    } 
};

// Error function
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// Save record to db
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionStore = transaction.objectStore('new_transaction');
    transactionStore.add(record);
}

// Upload transactions to database
function uploadTransactions() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionStore = transaction.objectStore('new_transaction');

    // Get All transactions
    const getAll = transactionStore.getAll();
    getAll.onsuccess = function() {
        
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
                        
                        const transaction = db.transaction(['new_transaction'], 'readwrite');
                        const transactionStore = transaction.objectStore('new_transaction');
                        transactionStore.clear();

                        alert('All saved transactions has been submitted!');
                    })
                .catch(err => {
                    console.log(err);
                });
        }
    };
  }

// Create event listener
window.addEventListener('online', uploadTransactions);