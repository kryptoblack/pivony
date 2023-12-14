window.addEventListener("load", function() {
    document.getElementById("save").addEventListener("click", function() {
        const e = document.getElementById("userIdInput");
        localStorage.setItem("pivonyDocumentId", e.value);
        console.log(e.placeholder);
        e.placeholder = e.value;
        e.value = "";
        location.reload();
    });

    document.getElementById("reset").addEventListener("click", function() {
        sessionStorage.getItem("pivonyDocumentId", "");
    });

    const e = document.getElementById("userIdInput");
    e.placeholder = localStorage.getItem("pivonyDocumentId");
});
