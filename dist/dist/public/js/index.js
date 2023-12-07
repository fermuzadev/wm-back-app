//FRONTEND
(function () {
  const socket = io();
  let products = [];
  const form = document.getElementById("form");
  const deleteForm = document.getElementById("deleteForm");
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const code = document.getElementById("code");
  const price = document.getElementById("price");
  const stock = document.getElementById("stock");
  const category = document.getElementById("category");
  const thumbnails = document.getElementById("thumbnails");
  const idInputDelete = document.getElementById("idDelete");
  const productsListSocket = document.getElementById("productsSocket");
  deleteForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "Deleted!",
          `Your file ${idInputDelete.value} has been deleted.`,
          "success"
        );
        let idToDelete;
        ev.preventDefault();
        idToDelete = parseInt(idInputDelete.value);
        socket.emit("idToDelete", idToDelete);
      } else {
        console.log(`The action was cancelled`);
        return;
      }
    });
  });
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    products.push({
      title: title.value,
      description: description.value,
      code: code.value,
      price: price.value,
      stock: stock.value,
      category: category.value,
      thumbnails: thumbnails.value,
    });
    socket.emit("productSocket", products);
    showProductSocket(products);
  });
  function showProductSocket(products) {
    productsListSocket.innerHTML = "";
    products.forEach((product) => {
      const prod = document.createElement("div");
      prod.className = "card";
      prod.innerHTML = `  
      <img src=${product.thumbnails} class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">Product Title: ${product.title}</h5>
        <p class="card-text">ID: ${product.id}</p>
        <p class="card-text">CODE: ${product.code}.</p>
        <p class="card-text">Description: ${product.description}.</p>
        <p class="card-text">Price: ${product.price}.</p>
        <p class="card-text">Category${product.category}.</p>
        <p class="card-text"><small class="text-muted">Stock: ${product.stock}</small></p>
      </div>`;
      productsListSocket.appendChild(prod);
    });
  }
  //!Show realTime Products

  socket.on("products", (...products) => {
    showProductSocket(products);
  });

  //!Reception Events from Backend

  socket.on("message_everyone", (message) => {
    console.log("message_everyone", message);
  });
})();
