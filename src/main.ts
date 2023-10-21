import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Bunger";

interface Point {
    x: number;
    y: number;
}

let drawing = false;
const zero = 0;
const canvasSize = 256;
const canvasBackgroundColor = "white";
const lineColor = "black";

let points: Point[][] = [];
let currentLine: Point[];

let redoStack: Point[][] = [];

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
ctx.canvas.width = canvasSize;
ctx.canvas.height = canvasSize;
clearCanvas();
canvas.style.border = "3px solid black";
canvas.style.borderRadius = "15px";
canvas.style.boxShadow = "10px 10px #111111FF";
const clearButton = document.createElement("button");
clearButton.innerText = "CLEAR";
clearButton.onclick = () => {
    clearCanvas();
    points = [];
    redoStack = [];
};
const undoButton = document.createElement("button");
undoButton.innerText = "UNDO";
undoButton.onclick = () => {
    if (points.length > 0) {
        redoStack.push(points.pop()!);
        dispatchEvent(new Event("drawing-changed"));
    }
};
const redoButton = document.createElement("button");
redoButton.innerText = "REDO";
redoButton.onclick = () => {
    if (redoStack.length > 0) {
        points.push(redoStack.pop()!);
        dispatchEvent(new Event("drawing-changed"));
    }
};
app.append(header);
app.append(canvas);
app.append(clearButton);
app.append(undoButton);
app.append(redoButton);

addEventListener("mousedown", (event) => {
    if (event.target == canvas) {
        drawing = true;
        currentLine = [];
        points.push(currentLine);
    }
});
addEventListener("mouseup", () => {
        drawing = false;
});

addEventListener("mousemove", (event) => {
    if (event.target == canvas && drawing) {
        currentLine.push({ x: event.offsetX, y: event.offsetY });
        dispatchEvent(new Event("drawing-changed"));
    }
});

addEventListener("drawing-changed", () => {
    clearCanvas();
    ctx.strokeStyle = lineColor;
    for (const line of points) {
        drawLine(line);
    }
});

function drawLine(points: Point[]) {
    ctx.beginPath();
    for (const point of points) {
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }
}
function clearCanvas() {
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(zero, zero, canvas.width, canvas.height);
}
