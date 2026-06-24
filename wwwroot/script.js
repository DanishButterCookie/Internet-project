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

const canvas = document.getElementById('colorCanvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('blueSlider');
const colorBox = document.getElementById('colorBox');
const colorText = document.getElementById('colorText');

let selectorX = 128;
let selectorY = 128;
let isDragging = false;
const halfSize = 10;

function render() {
    const blueValue = parseInt(slider.value);
    const imgData = ctx.createImageData(256, 256);
    
    for (let x = 0; x < 256; x++) {
        for (let y = 0; y < 256; y++) {
            let i = (y * 256 + x) * 4;
            imgData.data[i] = x;
            imgData.data[i + 1] = y;
            imgData.data[i + 2] = blueValue;
            imgData.data[i + 3] = 255;
        }
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(selectorX - halfSize, selectorY - halfSize, 21, 21);
    
    const color = `(${Math.round(selectorX)}, ${Math.round(selectorY)}, ${blueValue})`;
    colorBox.style.backgroundColor = `rgb${color}`;
    colorText.textContent = color;
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePosition(e);
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) updatePosition(e);
});

window.addEventListener('mouseup', () => isDragging = false);
slider.addEventListener('input', render);

function updatePosition(e) {
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = 256 / rect.width;
    const scaleY = 256 / rect.height;

    selectorX = Math.max(0, Math.min(255, (e.clientX - rect.left) * scaleX));
    selectorY = Math.max(0, Math.min(255, (e.clientY - rect.top) * scaleY));
    
    render();
}

const copyBtn = document.getElementById('copyBtn');

copyBtn.addEventListener('click', () => {
    const textToCopy = colorText.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✔️Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

render();

console.log("test");