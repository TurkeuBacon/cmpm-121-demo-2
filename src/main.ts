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
        ctx.strokeStyle = LINE_COLOR;
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
const EXPORT_SIZE = 1024;
const CANVAS_BACKGROUND_COLOR = "white";
const LINE_COLOR = "black";

const THICK_THICKNESS = 7;
const THIN_THICKNESS = 2;

const DEFAULT_STICKERS = ["🤠", "👉", "👈"];

let currentThickness: number = THIN_THICKNESS;

let cursor: LineCursor | StickerCursor = new LineCursor(currentThickness);

let drawables: (MarkerLine | Sticker)[] = [];
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

const downloadButton = document.createElement("button");
downloadButton.innerText = "DOWNLOAD";
downloadButton.onclick = () => {
    exportCanvas();
};
const clearButton = document.createElement("button");
clearButton.innerText = "CLEAR";
clearButton.onclick = () => {
    clearCanvas();
    drawables = [];
    redoStack = [];
};
const undoButton = document.createElement("button");
undoButton.innerText = "UNDO";
undoButton.onclick = () => {
    if (drawables.length > zero) {
        redoStack.push(drawables.pop()!);
        dispatchEvent(DRAWING_CHANGED_EVENT);
    }
};
const redoButton = document.createElement("button");
redoButton.innerText = "REDO";
redoButton.onclick = () => {
    if (redoStack.length > zero) {
        drawables.push(redoStack.pop()!);
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

function addSticker(newSticker: string) {
    const newStickerButton = document.createElement("button");
    newStickerButton.innerText = newSticker;
    newStickerButton.onclick = () => {
        cursor = new StickerCursor(newSticker);
        dispatchEvent(TOOL_MOVED_EVENT);
    };
    app.append(newStickerButton);
}
const addStickerButton = document.createElement("button");
addStickerButton.innerText = "Add Sticker";
addStickerButton.onclick = () => {
    const newSticker = prompt("Enter New Sticker:", "😀");
    if (newSticker != null) {
        addSticker(newSticker);
    }
};
app.append(header);
app.append(canvas);
app.append(downloadButton);
app.append(clearButton);
app.append(undoButton);
app.append(redoButton);
app.append(thickyVicky);
app.append(thinnyVinny);
app.append(addStickerButton);
DEFAULT_STICKERS.forEach(sticker => {
    addSticker(sticker);
});

addEventListener("mousedown", (event) => {
    if (event.target == canvas) {
        cursor.setVisible(false);
        drawing = true;
        currentDrawable = cursor.getDrawable(event.offsetX, event.offsetY);
        drawables.push(currentDrawable);
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
    for (const line of drawables) {
        line.display(ctx);
    }
    cursor.draw(ctx);
}

function clearCanvas() {
    ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
    ctx.fillRect(zero, zero, canvas.width, canvas.height);
}

function exportCanvas() {
    const exportCanvas = document.createElement("canvas");
    const exportCtx = exportCanvas.getContext("2d")!;
    exportCtx.canvas.width = EXPORT_SIZE;
    exportCtx.canvas.height = EXPORT_SIZE;
    exportCtx.fillStyle = CANVAS_BACKGROUND_COLOR;
    exportCtx.fillRect(zero, zero, exportCanvas.width, exportCanvas.height);
    const SCALE_FACTOR = EXPORT_SIZE / CANVAS_SIZE;
    exportCtx.scale(SCALE_FACTOR, SCALE_FACTOR);
    drawables.forEach(drawable => {
        drawable.display(exportCtx);
    });

    const anchor = document.createElement("a");
    anchor.href = exportCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
}