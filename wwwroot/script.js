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
if (canvas) {
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
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

render();
}


function getCleanPath() {
    let path = window.location.pathname;
    if (path === '/' || path.includes('index')) {
        return '/';
    }
    return path;
}

function registerVisit() {
    if (sessionStorage.getItem('hasVisited')) {
        return; 
    }

    fetch('/api/visit', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                sessionStorage.setItem('hasVisited', 'true');
                console.log("visit");
            }
        });
}

registerVisit();

let myUserId = "";

async function setupUserTracking() {
    // Check if we already have a User ID for this session
    let savedId = sessionStorage.getItem('trackingUserId');

    if (savedId) {
        // We already have an ID, so just use it
        myUserId = savedId;
        console.log("Welcome back to this session, keeping ID: " + myUserId);
    } else {
        // First time on the site for this tab session, get a fresh ID
        let response = await fetch('/api/users/join', { method: 'POST' });
        let data = await response.json();
        myUserId = data.id;

        // Save it so next page clicks remember it
        sessionStorage.setItem('trackingUserId', myUserId);
        console.log("New session started with ID: " + myUserId);
    }

    // Start the heartbeat loop immediately using our ID
    setInterval(async () => {
        await fetch('/api/users/heartbeat?id=' + myUserId, { method: 'POST' });
    }, 10000);

    // Start the layout updates
    setInterval(updateStatsDisplay, 5000);
    updateStatsDisplay();
}

async function updateStatsDisplay() {
    try {
        const response = await fetch('/api/stats/visits');
        if (response.ok) {
            const data = await response.json();
            
            const visitElement = document.getElementById('visit-count');
            if (visitElement) {
                visitElement.textContent = data.totalVisits;
            }
            
            const onlineElement = document.getElementById('online-count');
            if (onlineElement) {
                onlineElement.textContent = data.onlineUsers;
            }
        }
    } catch (error) {
        console.error("Could not fetch visits stats:", error);
    }

    try {
        const paletteResponse = await fetch('/api/palettes');
        if (paletteResponse.ok) {
            const palettesData = await paletteResponse.json();
            
            const paletteElement = document.getElementById('palette-count');
            if (paletteElement) {
                paletteElement.textContent = palettesData.length;
            }
        }
    } catch (error) {
        console.error("Could not fetch palette stats:", error);
    }
}

setupUserTracking();

const tagSelect = document.getElementById('tagSelect');
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const fontSelect = document.getElementById('fontSelect');
const underlineBtn = document.getElementById('underlineBtn');


function getSandbox() {
    return document.getElementById('text-sandbox');
}

if (tagSelect) {

    // tag switching (h1, h2 stuff)
    tagSelect.addEventListener('change', (e) => {
        const oldBox = getSandbox();
        const newTag = document.createElement(e.target.value);
        
        newTag.id = "text-sandbox";
        newTag.contentEditable = "true";
        newTag.spellcheck = false;
        newTag.innerHTML = oldBox.innerHTML;
        
        // copy the stuff that is not controlled by the tag
        newTag.style.fontWeight = oldBox.style.fontWeight;
        newTag.style.fontStyle = oldBox.style.fontStyle;
        newTag.style.fontFamily = oldBox.style.fontFamily;
        
        oldBox.replaceWith(newTag);
    });

    // toggle buttons
    boldBtn.addEventListener('click', () => {
        boldBtn.classList.toggle('active');

        const box = getSandbox();
        box.style.fontWeight = box.style.fontWeight === 'bold' ? 'normal' : 'bold';
    });

    italicBtn.addEventListener('click', () => {
        italicBtn.classList.toggle('active');
        
        const box = getSandbox();
        box.style.fontStyle = box.style.fontStyle === 'italic' ? 'normal' : 'italic';
    });

    underlineBtn.addEventListener('click', () => {
        underlineBtn.classList.toggle('active');
        
        const box = getSandbox();
        const isUnderlined = box.style.textDecoration === 'underline';
        box.style.textDecoration = isUnderlined ? 'none' : 'underline';
    });

    // font Family
    fontSelect.addEventListener('change', (e) => {
        getSandbox().style.fontFamily = e.target.value;
    });
}

const template = document.getElementById('palette-template');
const form = document.getElementById('paletteForm');
const curatedContainer = document.getElementById('premade-container-inner');
const communityGrid = document.getElementById('palette-grid');

// helper to turn hex to rgb
function hexToRgbStr(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(s => s + s).join('');
    }
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `(${r}, ${g}, ${b})`;
}

function createPaletteCard(p) {
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.p-title').textContent = p.title;
    clone.querySelector('.p-meta').textContent = p.author ? `By ${p.author} on ${p.date}` : "Official Palette";

    clone.querySelector('.block-1').style.backgroundColor = p.c1;
    clone.querySelector('.block-2').style.backgroundColor = p.c2;

    const rgb1 = hexToRgbStr(p.c1);
    const rgb2 = hexToRgbStr(p.c2);

    clone.querySelector('.hex-1').textContent = p.c1.toUpperCase();
    clone.querySelector('.rgb-1').textContent = rgb1;
    clone.querySelector('.hex-2').textContent = p.c2.toUpperCase();
    clone.querySelector('.rgb-2').textContent = rgb2;

    return clone;
}

async function loadAllPalettes() {
    try {
        const [curatedRes, communityRes] = await Promise.all([
            fetch('/api/palettes/curated'),
            fetch('/api/palettes')
        ]);

        const curated = await curatedRes.json();
        const community = await communityRes.json();

        if (curatedContainer && template) {
            curatedContainer.innerHTML = '';
            curated.forEach(p => {
                const card = createPaletteCard(p);
                curatedContainer.appendChild(card);
            });
        }

        if (communityGrid && template) {
            communityGrid.innerHTML = '';
            community.forEach(p => {
                const card = createPaletteCard(p);
                communityGrid.appendChild(card);
            });
        }
    } catch (err) {
        console.error("Error loading palettes:", err);
    }
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPalette = {
            title: document.getElementById('pName').value,
            c1: document.getElementById('color1').value,
            c2: document.getElementById('color2').value,
            author: document.getElementById('userName').value
        };

        const response = await fetch('/api/palettes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPalette)
        });

        if (response.ok) {
            form.reset();
            loadAllPalettes();
        }
    });
}

if (curatedContainer && communityGrid) {
    loadAllPalettes();
}