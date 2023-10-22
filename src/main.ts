import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Bunger";

interface Point {
    x: number;
    y: number;
}

class MarkerLine {
    initialPoint: Point;
    linePoints: Point[];
    thickness: number;
    constructor(x: number, y: number, thickness: number) {
        this.initialPoint = { x: x, y: y };
        this.linePoints = [];
        this.thickness = thickness;
    }
    drag(x: number, y: number) {
        this.linePoints.push({ x: x, y: y });
    }
    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = this.thickness;
        ctx.moveTo(this.initialPoint.x, this.initialPoint.y);
        for (const point of this.linePoints) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}

class Cursor {
    currentThickness: number;
    cursorX: number;
    cursorY: number;
    constructor(thickness: number) {
        this.currentThickness = thickness;
        this.cursorX = 0;
        this.cursorY = 0;
    }
    setThickness(thickness: number) {
        this.currentThickness = thickness;
    }
    hover(x: number, y: number) {
        this.cursorX = x;
        this.cursorY = y;
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = this.currentThickness;
        ctx.strokeStyle = lineColor;
        ctx.arc(this.cursorX, this.cursorY, this.currentThickness * half, zero, circleDegrees);
        ctx.stroke();
    }
}

let drawing = false;
const zero = 0;
const half = .5;
const circleDegrees = 360;
const canvasSize = 256;
const canvasBackgroundColor = "white";
const lineColor = "black";
const thickThickness = 7;
const thinThickness = 2;
let lineThickness: number = thinThickness;
let cursor: null | Cursor = new Cursor(lineThickness);

let points: MarkerLine[] = [];
let currentLine: MarkerLine;

let redoStack: MarkerLine[] = [];

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
    if (points.length > zero) {
        redoStack.push(points.pop()!);
        dispatchEvent(new Event("drawing-changed"));
    }
};
const redoButton = document.createElement("button");
redoButton.innerText = "REDO";
redoButton.onclick = () => {
    if (redoStack.length > zero) {
        points.push(redoStack.pop()!);
        dispatchEvent(new Event("drawing-changed"));
    }
};
const thickyVicky = document.createElement("button");
thickyVicky.innerText = "THICK";
thickyVicky.onclick = () => {
    lineThickness = thickThickness;
    if (cursor != null) {
        cursor.setThickness(lineThickness);
    }
};
const thinnyVinny = document.createElement("button");
thinnyVinny.innerText = "THIN";
thinnyVinny.onclick = () => {
    lineThickness = thinThickness;
    if (cursor != null) {
        cursor.setThickness(lineThickness);
    }
};
app.append(header);
app.append(canvas);
app.append(clearButton);
app.append(undoButton);
app.append(redoButton);
app.append(thickyVicky);
app.append(thinnyVinny);

addEventListener("mousedown", (event) => {
    if (event.target == canvas) {
        drawing = true;
        currentLine = new MarkerLine(event.offsetX, event.offsetY, lineThickness);
        points.push(currentLine);
    }
});
addEventListener("mouseup", () => {
    drawing = false;
    cursor = new Cursor(lineThickness);
});

addEventListener("mousemove", (event) => {
    if (event.target == canvas) {
        if (drawing) {
            cursor = null;
            currentLine.drag(event.offsetX, event.offsetY);
        } else if (cursor != null) {
            cursor.hover(event.offsetX, event.offsetY);
        }
        dispatchEvent(new Event("drawing-changed"));
    }
});
addEventListener("mouseover", (event) => {
    if (event.target == canvas && !drawing) {
        cursor = new Cursor(lineThickness);
    } else {
        cursor = null;
    }
    dispatchEvent(new Event("drawing-changed"));
});

addEventListener("drawing-changed", () => {
    clearCanvas();
    ctx.strokeStyle = lineColor;
    for (const line of points) {
        line.display(ctx);
    }
    if (cursor != null) {
        cursor.draw(ctx);
    }
});
function clearCanvas() {
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(zero, zero, canvas.width, canvas.height);
}
