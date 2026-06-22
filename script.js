async function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (element) {
        const response = await fetch(file);
        const html = await response.text();
        element.innerHTML = html;
        return true; // loading is done
    }
    return false;
}

document.addEventListener("DOMContentLoaded", async () => {
    // wait for the header to be fully loaded
    await loadComponent("header-placeholder", "/header.html");
    await loadComponent("footer-placeholder", "/footer.html");

    // now that the HTML exists, run the highlighting function
    highlightActiveLink();
});

function highlightActiveLink() {
    const path = window.location.pathname;
    const page = path.split("/").pop(); 
    const navLinks = document.querySelectorAll('.navbar a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // find the current page
        if (page === href || (page === "" && href === "index.html")) {
            link.classList.add('active');
        }
    });
}