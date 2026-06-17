// Function to load external HTML
async function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (element) {
        const response = await fetch(file);
        const html = await response.text();
        element.innerHTML = html;
    }
}

// Run this when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header-placeholder", "/header.html");
    loadComponent("footer-placeholder", "/footer.html");
});