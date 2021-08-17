let db;

let req = indexedDB.open("TempDB", 1);

req.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore("TempStore", { autoIncrement: true });
};

const checkDatabase = () => {
  let transaction = db.transaction(["TempStore"], "readwrite");
  const store = transaction.objectStore("TempStore");
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.length !== 0) {
            // DO WE NEED A SECOND TRANSACTION HERE??
            transaction = db.transaction(["TempStore"], "readwrite");
            const clearStore = transaction.objectStore("TempStore");
            clearStore.clearStore();
          }
        });
    }
  };
};

req.onsuccess = (event) => {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

const saveRecord = (data) => {
  const transaction = db.transaction(["TempStore"], "readwrite");
  const store = transaction.objectStore("TempStore");
  store.onupgradeneeded(data);
};

window.addEventListener("online", checkDatabase);
