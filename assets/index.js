function reset() {
  localStorage.removeItem("pivonyDocumentId");
  sessionStorage.removeItem("displayCount");
  location.reload();
}

window.addEventListener("load", function () {
  document.getElementById("save").addEventListener("click", function () {
    reset();

    const e = document.getElementById("userIdInput");
    localStorage.setItem("pivonyDocumentId", e.value);
    location.reload();
  });

  document.getElementById("reset").addEventListener("click", reset);

  const e = document.getElementById("userIdInput");
  if (localStorage.getItem("pivonyDocumentId"))
    e.placeholder = localStorage.getItem("pivonyDocumentId");
});
