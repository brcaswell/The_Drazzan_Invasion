const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// 🚀 **Declare `stars` first to avoid errors**
let stars = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // ✅ Recreate stars after resizing to adjust positions
    stars = createStars();
}

resizeCanvas(); // ✅ Ensure canvas is initialized first
window.addEventListener("resize", resizeCanvas);

// 🚀 **Function to Create Stars AFTER Canvas is Ready**
function createStars() {
    return Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1, // ✅ Random star sizes
        speed: Math.random() * 0.5 + 0.2, // ✅ Slightly different speeds for depth effect
    }));
}

// ✅ Initialize stars AFTER canvas is set up
stars = createStars();
