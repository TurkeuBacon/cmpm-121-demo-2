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
class Sticker {
    position: Point;
    sticker: string;
    constructor(x: number, y: number, sticker: string) {
        this.position = { x:x, y:y };
        this.sticker = sticker;
    }
    drag(x: number, y: number) {
        this.position = { x: x, y: y };
    }
    display(ctx: CanvasRenderingContext2D) {
        ctx.fillText(this.sticker, this.position.x, this.position.y);
    }
}

class LineCursor {
    previewVisible: boolean;
    currentThickness: number;
    cursorX: number;
    cursorY: number;
    constructor(thickness: number) {
        this.previewVisible = false;
        this.currentThickness = thickness;
        this.cursorX = 0;
        this.cursorY = 0;
    }
    setThickness(thickness: number) {
        this.currentThickness = thickness;
    }
    move(x: number, y: number) {
        this.cursorX = x;
        this.cursorY = y;
    }
    draw(ctx: CanvasRenderingContext2D) {
        if (!this.previewVisible) return;
        ctx.beginPath();
        ctx.lineWidth = this.currentThickness;
        ctx.strokeStyle = LINE_COLOR;
        ctx.arc(this.cursorX, this.cursorY, this.currentThickness * HALF, zero, CIRCLE_DEGREES);
        ctx.stroke();
    }
    setVisible(visible: boolean) {
        this.previewVisible = visible;
    }
    getDrawable(x: number, y: number): MarkerLine {
        return new MarkerLine(x, y, currentThickness);
    }
}
class StickerCursor {
    previewVisible: boolean;
    currentSticker: string;
    cursorX: number;
    cursorY: number;
    constructor(sticker: string) {
        this.previewVisible = false;
        this.currentSticker = sticker;
        this.cursorX = 0;
        this.cursorY = 0;
    }
    setSticker(sticker: string) {
        this.currentSticker = sticker;
    }
    move(x: number, y: number) {
        this.cursorX = x;
        this.cursorY = y;
    }
    draw(ctx: CanvasRenderingContext2D) {
        if (!this.previewVisible) return;
        ctx.fillText(this.currentSticker, this.cursorX, this.cursorY);
    }
    setVisible(visible: boolean) {
        this.previewVisible = visible;
    }
    getDrawable(x: number, y: number): Sticker {
        return new Sticker(x, y, this.currentSticker);
    }
}

let drawing = false;
const DRAWING_CHANGED_EVENT = new Event("drawing-changed");
const TOOL_MOVED_EVENT = new Event("tool-moved");

const zero = 0;
const HALF = .5;
const CIRCLE_DEGREES = 360;
const CANVAS_SIZE = 256;
const CANVAS_BACKGROUND_COLOR = "white";
const LINE_COLOR = "black";

const THICK_THICKNESS = 7;
const THIN_THICKNESS = 2;

const COWBOY_STICKER = "🤠";
const RIGHT_FINGER_GUN_STICKER = "👉";
const LEFT_FINGER_GUN_STICKER = "👈";

let currentThickness: number = THIN_THICKNESS;

let cursor: LineCursor | StickerCursor = new LineCursor(currentThickness);

let points: (MarkerLine | Sticker)[] = [];
let currentDrawable: MarkerLine | Sticker;

let redoStack: (MarkerLine | Sticker)[] = [];

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
ctx.canvas.width = CANVAS_SIZE;
ctx.canvas.height = CANVAS_SIZE;
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
        dispatchEvent(DRAWING_CHANGED_EVENT);
    }
};
const redoButton = document.createElement("button");
redoButton.innerText = "REDO";
redoButton.onclick = () => {
    if (redoStack.length > zero) {
        points.push(redoStack.pop()!);
        dispatchEvent(DRAWING_CHANGED_EVENT);
    }
};
const thickyVicky = document.createElement("button");
thickyVicky.innerText = "THICK";
thickyVicky.onclick = () => {
    currentThickness = THICK_THICKNESS;
    cursor = new LineCursor(currentThickness);
};
const thinnyVinny = document.createElement("button");
thinnyVinny.innerText = "THIN";
thinnyVinny.onclick = () => {
    currentThickness = THIN_THICKNESS;
    cursor = new LineCursor(currentThickness);
};
const cowboyStickerButton = document.createElement("button");
cowboyStickerButton.innerText = COWBOY_STICKER;
cowboyStickerButton.onclick = () => {
    cursor = new StickerCursor(COWBOY_STICKER);
    dispatchEvent(TOOL_MOVED_EVENT);
};
const rightFingerGunStickerButton = document.createElement("button");
rightFingerGunStickerButton.innerText = RIGHT_FINGER_GUN_STICKER;
rightFingerGunStickerButton.onclick = () => {
    cursor = new StickerCursor(RIGHT_FINGER_GUN_STICKER);
    dispatchEvent(TOOL_MOVED_EVENT);
};
const leftFingerGunStickerButton = document.createElement("button");
leftFingerGunStickerButton.innerText = LEFT_FINGER_GUN_STICKER;
leftFingerGunStickerButton.onclick = () => {
    cursor = new StickerCursor(LEFT_FINGER_GUN_STICKER);
    dispatchEvent(TOOL_MOVED_EVENT);
};
app.append(header);
app.append(canvas);
app.append(clearButton);
app.append(undoButton);
app.append(redoButton);
app.append(thickyVicky);
app.append(thinnyVinny);
app.append(cowboyStickerButton);
app.append(rightFingerGunStickerButton);
app.append(leftFingerGunStickerButton);

addEventListener("mousedown", (event) => {
    if (event.target == canvas) {
        cursor.setVisible(false);
        drawing = true;
        currentDrawable = cursor.getDrawable(event.offsetX, event.offsetY);
        points.push(currentDrawable);
        redoStack = [];
        dispatchEvent(TOOL_MOVED_EVENT);
    }
});
addEventListener("mouseup", (event) => {
    drawing = false;
    if (event.target == canvas) {
        cursor.setVisible(true);
    }
    dispatchEvent(TOOL_MOVED_EVENT);
});

addEventListener("mousemove", (event) => {
    if (event.target == canvas) {
        cursor.move(event.offsetX, event.offsetY);
        if (drawing) {
            currentDrawable.drag(event.offsetX, event.offsetY);
            dispatchEvent(DRAWING_CHANGED_EVENT);
        } else {
            dispatchEvent(TOOL_MOVED_EVENT);
        }
    }
});
addEventListener("mouseover", (event) => {
    if (event.target == canvas && !drawing) {
        cursor.setVisible(true);
    } else {
        cursor.setVisible(false);
    }
    dispatchEvent(DRAWING_CHANGED_EVENT);
});

addEventListener(DRAWING_CHANGED_EVENT.type, () => {
    redraw();
});
addEventListener(TOOL_MOVED_EVENT.type, () => {
    redraw();
});

function redraw() {
    clearCanvas();
    ctx.strokeStyle = LINE_COLOR;
    for (const line of points) {
        line.display(ctx);
    }
    cursor.draw(ctx);
}

function clearCanvas() {
    ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
    ctx.fillRect(zero, zero, canvas.width, canvas.height);
}
