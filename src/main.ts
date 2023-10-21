import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Bunger";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
ctx.canvas.width = 256;
ctx.canvas.height = 256;
ctx.fillStyle = "white"
ctx.fillRect(0, 0, canvas.width, canvas.height);
canvas.style.border = "3px solid black";
canvas.style.borderRadius = "15px";
canvas.style.boxShadow = "10px 10px #111111FF"
app.append(canvas);
