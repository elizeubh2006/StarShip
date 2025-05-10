import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const DEFAULTS = {
  player:      { position:{x:0,y:0,z:0}, scale:0.09 },
  enemy:       { position:{z:-20},       scale:0.1 },
  collectible: { position:{z:-20},       scale:0.03 },
  earth:       { position:{z:-5.9},       scale:0.5 },
  brightStar:  { position:{z:-10},        scale:{x:3,y:3,z:3} }
};

 



const saved = JSON.parse(localStorage.getItem("config")) || {};
const cfg = structuredClone(DEFAULTS);
Object.assign(cfg, saved);

const container = document.getElementById("resize-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(0,0,15);
const renderer = new THREE.WebGLRenderer({ antialias:true });
resizeRenderer();
container.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff,0.6));
const dirLight = new THREE.DirectionalLight(0xffffff,0.8);
dirLight.position.set(5,10,7);
scene.add(dirLight);

window.addEventListener("resize", resizeRenderer);
function resizeRenderer() {
  const w = container.clientWidth, h = container.clientHeight;
  renderer.setSize(w,h);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
}

const loader = new GLTFLoader();
const objects = {};

function loadAll() {
  const promises = [];
  for (let key of Object.keys(PATHS)) {
    if (key === "brightStar") {
      promises.push(new Promise(res => {
        new THREE.TextureLoader().load(PATHS[key], tex => {
          const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
          scene.add(spr);
          objects[key] = spr;
          res();
        });
      }));
    } else {
      promises.push(new Promise(res => {
        loader.load(PATHS[key], gltf => {
          const obj = gltf.scene;
          scene.add(obj);
          objects[key] = obj;
          res();
        });
      }));
    }
  }
  return Promise.all(promises);
}

function applyTransforms() {
  for (let key in objects) {
    const obj = objects[key];
    const data = cfg[key];
    obj.position.x = POSITIONS_X[key];
    if (key==="player") {
      obj.position.setX(POSITIONS_X[key]);
      obj.position.setY(data.position.y);
      obj.position.setZ(data.position.z);
      obj.scale.setScalar(data.scale);
    } else if (key==="enemy" || key==="collectible" || key==="earth") {
      obj.position.z = data.position.z;
      obj.scale.setScalar(data.scale);
    } else if (key==="brightStar") {
      obj.position.z = data.position.z;
      obj.scale.set(data.scale.x, data.scale.y, data.scale.z);
    }
  }
}

let selectedObj = "player";
const controlsDiv = document.getElementById("controls");

document.querySelectorAll('input[name="obj"]').forEach(r => {
  r.addEventListener("change", () => {
    selectedObj = document.querySelector('input[name="obj"]:checked').value;
    buildControls();
  });
});

function buildControls() {
  controlsDiv.innerHTML = "";
  const o = cfg[selectedObj];

  if (selectedObj==="player") {
    createSlider("position.x", o.position.x, -10,10,0.01, val => { o.position.x = val; });
    createSlider("position.y", o.position.y, -10,10,0.01, val => { o.position.y = val; });
    createSlider("position.z", o.position.z, -50,50,0.01, val => { o.position.z = val; });
    createSlider("scale", o.scale, 0.01,5,0.01, val => { o.scale = val; });
  } else if (selectedObj==="brightStar") {
    createSlider("position.z", o.position.z, -50,50,0.01, val => { o.position.z = val; });
    createSlider("scale.x", o.scale.x, 0.01,5,0.01, val => { o.scale.x = val; });
    createSlider("scale.y", o.scale.y, 0.01,5,0.01, val => { o.scale.y = val; });
    createSlider("scale.z", o.scale.z, 0.01,5,0.01, val => { o.scale.z = val; });
  } else {
    createSlider("position.z", o.position.z, -50,50,0.01, val => { o.position.z = val; });
    createSlider("scale", o.scale, 0.01,5,0.01, val => { o.scale = val; });
  }

  buildVisibilityControls();
}

function createSlider(label, value, min, max, step, onChange) {
  const lbl = document.createElement("label");
  lbl.textContent = label + ": ";
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = value;
  const valDisplay = document.createTextNode(value.toFixed(2));
  slider.oninput = () => {
    const v = parseFloat(slider.value);
    onChange(v);
    valDisplay.textContent = v.toFixed(2);
    applyTransforms();
    saveConfig();
  };
  controlsDiv.appendChild(lbl);
  controlsDiv.appendChild(slider);
  controlsDiv.appendChild(valDisplay);
  controlsDiv.appendChild(document.createElement("br"));
}

function buildVisibilityControls() {
  const visibilityDiv = document.createElement("div");
  visibilityDiv.style.marginTop = "10px";
  visibilityDiv.innerHTML = "<strong>Visibilidade:</strong><br>";
  for (let key of Object.keys(objects)) {
    const label = document.createElement("label");
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = objects[key].visible;
    chk.onchange = () => { objects[key].visible = chk.checked; };
    label.appendChild(chk);
    label.append(" " + key);
    visibilityDiv.appendChild(label);
    visibilityDiv.appendChild(document.createElement("br"));
  }
  controlsDiv.appendChild(visibilityDiv);
}

function updateSidePanel() {
  const pre = document.getElementById("object-values");
  pre.textContent = `
const PLAYER_START_POSITION = { x: ${cfg.player.position.x.toFixed(2)}, y: ${cfg.player.position.y.toFixed(2)}, z: ${cfg.player.position.z.toFixed(2)} };
const PLAYER_SIZE = ${cfg.player.scale.toFixed(2)};

const INITIAL_ENEMY_Z = ${cfg.enemy.position.z.toFixed(2)};
const ENEMY_SIZE = ${cfg.enemy.scale.toFixed(2)};

const INITIAL_COLLECTIBLE_Z = ${cfg.collectible.position.z.toFixed(2)};
const COLLECTIBLE_SIZE = ${cfg.collectible.scale.toFixed(2)};

const EARTH_SIZE = ${cfg.earth.scale.toFixed(2)};
const EARTH_POSITION = { x: 3, y: 2, z: ${cfg.earth.position.z.toFixed(2)} };

const BRIGHTSTAR_SIZE = { x: ${cfg.brightStar.scale.x.toFixed(2)}, y: ${cfg.brightStar.scale.y.toFixed(2)}, z: ${cfg.brightStar.scale.z.toFixed(2)} };
const BRIGHTSTAR_POSITION = { x: -0.5, y: 2, z: ${cfg.brightStar.position.z.toFixed(2)} };
`.trim();
}

function saveConfig() {
  localStorage.setItem("config", JSON.stringify(cfg));
  updateSidePanel();
}

document.getElementById("reset-btn").onclick = () => {
  localStorage.removeItem("config");
  location.reload();
};

loadAll().then(() => {
  applyTransforms();
  buildControls();
  saveConfig();
  animate();
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
