import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/loaders/GLTFLoader.js';
import * as ST from './settings.js';
import { initDomElements } from './DomElements.js';

const IS_MODO_TESTE = false;
const ABRIR_MONITOR = true;


  
document.addEventListener('DOMContentLoaded', () => {

  let hitsToKill = 5;
  let aggroFactor            = 0.3;    // quão “focados” no jogador os inimigos são

  const chaseClock = new THREE.Clock();

  const {
    startScreen, hud, gameOverScreen,
    scoreEl, levelEl, finalScoreEl,
    btnPlay, btnRestart,
    container, loadingScreen, progressBar,
    settingsBtn, settingsMenu,
    muteBtn, bgSlider, fxSlider, expSlider, exitBtn,
    parExplosionGain, pauseBtn, overlay
  } = initDomElements();

  let explosionGain = parExplosionGain;

  // --- Monitor de variáveis (torna-as acessíveis de fora do escopo) ---
    window.monitorVars = {
        score: 0,
        level: 1,
        dificuldade: 1,
        hitsToKill: ST.BASE_HITS_TO_KILL,
        aggroFactor: aggroFactor,
        playerPosition: { x: 0, y: 0, z: 0 }
    };


  function abrirPainelMonitor() {
    const w = 300, h = 400;
    const features = `width=${w},height=${h},resizable=yes,scrollbars=yes`;
    // Abre o monitor.html 
    window.open('monitor.html', 'Monitor', features);
  }
  
  


  

  var tiroAutomatico = false;
    var dificuldade = 1;
    var contadorParaPularNivel = 0;

  let scene, camera, renderer;
  let player = null, enemyTemplate = null, collectibleTemplate = null, planetaTerraTemplate = null; let projectiles = [];
  let enemys = [], collectibles = [], explosions = [];
  let stars, brightStar, planetaTerraPlanet = null;
  let score = 0, highScore = 0, level = 1, speed = 0.1;
  let gameState = 'start', spawnTimer = 0, spawnTimerEnemy = 0;
  let dragging = false, lastPos = { x: 0, y: 0 }, isPaused = false;
  let enemySpeed = ST.ENEMY_BASE_SPEED;
 

  let crashIndex = 0;

  let shotIndex = 0;

  const topbarElement = document.getElementById('topbar');

function atualizarVisibilidadeDaBarra() {
  if (gameState === 'play') {
    topbarElement.classList.add('hidden');
  } else {
    topbarElement.classList.remove('hidden');
  }
}

  
  [ST.FX_SPAWN, ST.FX_COLLECT, ST.FX_PLASMA_NOT_HIT, ST.BG_MUSIC].forEach(a => {
    a.preload = 'auto';
    a.load();
  });

  

  ST.BG_MUSIC.loop = true; ST.BG_MUSIC.volume = 0.02; ST.FX_SPAWN.volume = ST.FX_COLLECT.volume =  1;
  ST.FX_PLASMA_NOT_HIT.volume = 0.5;

  const manager = new THREE.LoadingManager();
  manager.onProgress = (url, loaded, total) => {
    progressBar.value = (loaded / total) * 100;
    
    if(progressBar.value < 98)
        btnPlay.style.display = 'none';
    else
    {
        btnPlay.style.display = '';    
    }
  };
  manager.onLoad = () => {
    loadingScreen.style.display = 'none';
    renderer.domElement.style.display = '';
  };




  muteBtn.onclick = () => {
    const muted = !ST.BG_MUSIC.muted;
  
    // 1) fundo + efeitos “soltos”
    [ST.BG_MUSIC, ST.FX_SPAWN, ST.FX_COLLECT, ST.FX_PLASMA_NOT_HIT]
      .forEach(a => a.muted = muted);
  
    // 2) pools
    ST.SHOT_POOL_AUDIO.forEach(a => a.muted = muted);
    ST.CRASH_POOL_AUDIO.forEach(a => a.muted = muted);
  
    muteBtn.textContent = muted ? '🔇 Mudo' : '🔊 Som';
  
    // 3) salva no localStorage
    localStorage.setItem('audioSettings', JSON.stringify({
      bgVolume: ST.BG_MUSIC.volume,
      fxVolume: ST.FX_SPAWN.volume,
      muted
    }));
  };
  
  


  bgSlider.oninput = () => {
    ST.BG_MUSIC.volume = parseFloat(bgSlider.value);
    const settings = JSON.parse(localStorage.getItem('audioSettings') || '{}');
    settings.bgVolume = ST.BG_MUSIC.volume;
    localStorage.setItem('audioSettings', JSON.stringify(settings));
  };

  fxSlider.oninput = () => {
    const vol = parseFloat(fxSlider.value);
  
    // 1) efeitos “soltos”
    ST.FX_SPAWN.volume = ST.FX_COLLECT.volume = vol;
  
    // 2) pool de disparos
    ST.SHOT_POOL_AUDIO.forEach(a => a.volume = vol);
  
    // 3) pool de explosões
    ST.CRASH_POOL_AUDIO.forEach(a => a.volume = vol);
  
    // 4) salva em localStorage
    const settings = JSON.parse(localStorage.getItem('audioSettings') || '{}');
    settings.fxVolume = vol;
    localStorage.setItem('audioSettings', JSON.stringify(settings));
  };

  expSlider.oninput = () => {
    explosionGain = parseFloat(expSlider.value);
  
    // propaga para o pool de explosões
    ST.CRASH_POOL_AUDIO.forEach(a => a.volume = fxSlider.value * explosionGain);
  
    // salva
    const settings = JSON.parse(localStorage.getItem('audioSettings') || '{}');
    settings.explosionGain = explosionGain;
    localStorage.setItem('audioSettings', JSON.stringify(settings));
  };
  
  

  exitBtn.onclick = () => location.reload();

  


  pauseBtn.onclick = () => {
    if (gameState !== 'play') return;
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶️' : '⏸️';
    overlay.style.display = isPaused ? 'block' : 'none';
    settingsBtn.style.display = isPaused ? 'block' : 'none';
    if (isPaused) {
      ST.BG_MUSIC.pause();
    } else {
      ST.BG_MUSIC.play().catch(() => {});
    }
    
  };

  settingsBtn.onclick = e => {
    e.stopPropagation();
    settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
  };
  settingsMenu.onclick = e => e.stopPropagation();
  // fecha ao clicar fora
  document.addEventListener('click', () => {
    settingsMenu.style.display = 'none';
  });

  function playShotHit() {
    const fx = ST.SHOT_POOL_AUDIO[shotIndex];
    fx.currentTime = 0;
    fx.play();
    shotIndex = (shotIndex + 1) % ST.SHOT_POOL_AUDIO.length;
  }

  function playCrash() {
    const fx = ST.CRASH_POOL_AUDIO[crashIndex];
    fx.currentTime = 0;

    fx.play();
    crashIndex = (crashIndex + 1) % ST.CRASH_POOL_AUDIO.length;
  }

  function playEffect(orig) {
    const fx = orig.cloneNode();          // clona o elemento
    fx.currentTime = 0;           // << isto é crucial
    fx.volume = orig.volume;              // propaga o volume atual
    fx.muted  = orig.muted;               // propaga o mute atual
    fx.play();  
  }

  
  function initThree() {
    scene  = new THREE.Scene();



    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.display = 'none';
    container.appendChild(renderer.domElement);


    // 1. Ambiente reforçado
    const ambient = new THREE.AmbientLight(0xffffff, 15);  
    scene.add(ambient);

    // 2. Luz direcional para relevo
    const sun = new THREE.DirectionalLight(0xffeeaa, 15);
    sun.position.set(10, 20, 30);
    scene.add(sun);
        
    if(IS_MODO_TESTE){
      const helperSun = new THREE.DirectionalLightHelper(sun, 0.5);
      scene.add(helperSun);
    }
      
    const backLight = new THREE.DirectionalLight(0xffffff, 35); 
    backLight.position.set(0, 0, -5);
    backLight.intensity = 30;
    backLight.target.position.set(0, 0, -20);
    scene.add(backLight);
    scene.add(backLight.target);

    if(IS_MODO_TESTE){
      const helperBckLight = new THREE.DirectionalLightHelper(backLight, 0.5);
      scene.add(helperBckLight);
    }
    
    new THREE.TextureLoader(manager).load('./images/brightStar.png', tex => {
      brightStar = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      brightStar.scale.set(ST.BRIGHTSTAR_SIZE.x, ST.BRIGHTSTAR_SIZE.y, ST.BRIGHTSTAR_SIZE.z);
      brightStar.position.set(ST.BRIGHTSTAR_POSITION.x, ST.BRIGHTSTAR_POSITION.y, ST.BRIGHTSTAR_POSITION.z);
      scene.add(brightStar);
    });
        

    
    const starCount = 1000;
    const posArr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      posArr[3 * i]     = (Math.random() - 0.5) * 100;
      posArr[3 * i + 1] = (Math.random() - 0.5) * 100;
      posArr[3 * i + 2] = -Math.random() * 200;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.2 });
    stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const gltfLoader = new GLTFLoader(manager);
    gltfLoader.load('./models/SpaceShip/scene.gltf', gltf => {
      player = gltf.scene;
      player.scale.set(0.1+ST.PLAYER_SIZE, 0.1+ST.PLAYER_SIZE, 0.1+ST.PLAYER_SIZE);
      player.position.set(ST.PLAYER_START_POSITION.x, ST.PLAYER_START_POSITION.y, ST.PLAYER_START_POSITION.z);
      scene.add(player);       

    });




    gltfLoader.load('./models/Enemy/scene.gltf', gltf => {
      enemyTemplate = gltf.scene;
      enemyTemplate.scale.set(ST.ENEMY_SIZE.x, ST.ENEMY_SIZE.y, ST.ENEMY_SIZE.z);
      gltf.scene.traverse(o => {
        if (o.isMesh && o.material.isMeshStandardMaterial) {
          o.material.metalness = 1;
          o.material.roughness = 0.3;
          o.material.envMapIntensity = 5;
        }
      });
    });

    gltfLoader.load('./models/Collectibles/scene.gltf', gltf => {
      collectibleTemplate = gltf.scene;
      collectibleTemplate.scale.set(ST.COLLECTIBLE_SIZE.x, ST.COLLECTIBLE_SIZE.y, ST.COLLECTIBLE_SIZE.z);
      gltf.scene.traverse(o => {
        if (o.isMesh && o.material.isMeshStandardMaterial) {
          o.material.metalness = 1;
          o.material.roughness = 0.0;
          o.material.envMapIntensity = 1;
        }
      });
      
    });

    

   
      gltfLoader.load('models/Earth/earth.gltf', gltf => {
        planetaTerraTemplate = gltf.scene;
        planetaTerraTemplate.scale.set(ST.EARTH_SIZE, ST.EARTH_SIZE, ST.EARTH_SIZE);
        spawnplanetaTerraPlanet();
      });
    
  }

  function spawnplanetaTerraPlanet() {
    if (planetaTerraPlanet) scene.remove(planetaTerraPlanet);
    planetaTerraPlanet = planetaTerraTemplate.clone();
    planetaTerraPlanet.position.set(ST.EARTH_POSITION.x, ST.EARTH_POSITION.y, ST.EARTH_POSITION.z);
    
    scene.add(planetaTerraPlanet);
  }

  function spawnExplosion(position) {
    const count = 300;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[3 * i] = position.x;
      positions[3 * i + 1] = position.y;
      positions[3 * i + 2] = position.z;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const s = ST.EXPLOSION_SPEED * Math.random();
      velocities[3 * i] = Math.sin(phi) * Math.cos(theta) * s;
      velocities[3 * i + 1] = Math.sin(phi) * Math.sin(theta) * s;
      velocities[3 * i + 2] = Math.cos(phi) * s;
    } 
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    const mat = new THREE.PointsMaterial({ size: 0.05, color: 0xffff00, transparent: true, opacity: 1 });
    const points = new THREE.Points(geom, mat);
    scene.add(points);
    explosions.push(points);
    console.log('Play fxCrash');
    playCrash();
  }

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', onWindowResize);

  window.addEventListener('keydown', e => {
    if (gameState === 'play' && player) {
        if (e.key === 'ArrowLeft' || e.key === 'a')  player.position.x = Math.max(player.position.x - 1, -ST.BOUND_X);
        if (e.key === 'ArrowRight' || e.key === 'd') player.position.x = Math.min(player.position.x + 1,  ST.BOUND_X);
        if (e.key === 'ArrowUp'   || e.key === 'w') player.position.y = Math.min(player.position.y + 1,  ST.BOUND_Y);
        if (e.key === 'ArrowDown' || e.key === 's') player.position.y = Math.max(player.position.y - 1, -ST.BOUND_Y);
        
        window.monitorVars.playerPosition = {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z
          };
    }


    
  });

   
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouch) {
    let lastTap = 0;
    container.addEventListener('touchend', e => {
        const now = Date.now();
        if (now - lastTap < 300) tiroAutomatico = !tiroAutomatico;
        lastTap = now;
    });
    } else {
    container.addEventListener('dblclick', () => {
        if (isPaused) return;
        tiroAutomatico = !tiroAutomatico;
    });
    }


  container.addEventListener('pointerdown', e => {
    if (isPaused) return;
    if (gameState === 'play' && player) {
      dragging = true;
      lastPos.x = e.clientX;
      lastPos.y = e.clientY;

      shootPlasma();
      playEffect(ST.FX_PLASMA_NOT_HIT);

    }
  });
  
  container.addEventListener('pointermove', e => {
    if (dragging && gameState === 'play' && player) {
      const dx = (e.clientX - lastPos.x) / 100;
      const dy = (e.clientY - lastPos.y) / 100;
      player.position.x = Math.max(Math.min(player.position.x + dx,  ST.BOUND_X), -ST.BOUND_X);
      player.position.y = Math.max(Math.min(player.position.y - dy,  ST.BOUND_Y), -ST.BOUND_Y);
      lastPos.x = e.clientX;
      lastPos.y = e.clientY;
    
      window.monitorVars.playerPosition = {
        x: player.position.x,
        y: player.position.y,
        z: player.position.z
      };         
    }

 
  });
  container.addEventListener('pointerup',   () => dragging = false);
  container.addEventListener('pointerleave',() => dragging = false);

  btnPlay.onclick = () => {
    if(progressBar.value >= 98){
      if (container.requestFullscreen) document.documentElement.requestFullscreen();
      startScreen.style.display = 'none';
      hud.style.display = 'flex';
      gameState = 'play';
      atualizarVisibilidadeDaBarra();
      pauseBtn.style.display = 'block';
      ST.BG_MUSIC.play().catch(() => {});
      animate();
    }
  };
  btnRestart.onclick = () => location.reload();

  function spawnenemy() {
    if (!enemyTemplate) return;
    const count = 1; 
    
    for (let i = 0; i < count; i++) {
      let pos;
      do {
        pos = new THREE.Vector3((Math.random() * (ST.BOUND_X * 2) - ST.BOUND_X), (Math.random() * (ST.BOUND_Y * 2) - ST.BOUND_Y), ST.INITIAL_ENEMY_Z - Math.random() * 10);
      } while (enemys.some(o => o.position.distanceTo(pos) < ST.ENEMY_MIN_DISTANCE));

      const o = enemyTemplate.clone();
      
      // configurações iniciais de "timer" para delay de perseguição:
      o.userData.elapsedTime   = 0;  // tempo decorrido desde o spawn
      o.userData.reactionTime  = Math.max(
        ST.MIN_REACTION_TIME,
        ST.BASE_REACTION_TIME - (level - 1) * ST.REACTION_DECREASE
      );      
      
      o.position.copy(pos);
      o.userData.hits = 0; // initialize hit counter
      scene.add(o);
      enemys.push(o);
    }
  }

  function spawnCollectible() {
    if (!collectibleTemplate) return;
    const c = collectibleTemplate.clone();
    c.position.set(Math.random() * (ST.BOUND_X * 2) - ST.BOUND_X, Math.random() * (ST.BOUND_Y * 2) - ST.BOUND_Y, ST.INITIAL_COLLECTIBLE_Z);
    scene.add(c);
    collectibles.push(c);


  }

  function checkCollisions() {
    if (!player) return;
    enemys = enemys.filter(o => {
      if (player.position.distanceTo(o.position) < ST.COLLISION_DISTANCE) {
 
        spawnExplosion(player.position.clone());
        scene.remove(player);
        gameState = 'exploding';
        return false;
      }

    // só remove quando o inimigo tiver passado pelo jogador + offset
    if (o.position.z > player.position.z + ST.ENEMY_PASS_OFFSET_Z) {
      scene.remove(o);
      return false;
    }


      return true;
    });
    collectibles = collectibles.filter(c => {
      if (player.position.distanceTo(c.position) < ST.COLLISION_DISTANCE_COLLECTIBLE) {
        score += ST.VALOR_ESTRELA;
        window.monitorVars.score = score;
 
        scoreEl.textContent = score;
        scene.remove(c);

    
        playEffect(ST.FX_COLLECT);
        verificaNivelPorScore();
        return false;
      }
      if (c.position.z > 5) {
        scene.remove(c);
        return false;
      }
      return true;
    });
  }

  function verificaNivelPorScore() {
    // Cada 200 pontos um novo nível
    const novoLevel = Math.floor(score / ST.PONTOS_PARA_MUDAR_NIVEL) + 1;
    if (novoLevel > level) {
      level = novoLevel;
      levelEl.textContent = level;
      ajustarDificuldade();
    }
  }

  // 4. Ajuste a função de movimento para usar o aggroFactor:
function moveEnemiesTowardsPlayer(delta) {
  enemys.forEach(o => {
    // 1) atualiza contador
    o.userData.elapsedTime += delta;
    // 2) calcula fator de reação [0…1]
    const f = Math.min(o.userData.elapsedTime / o.userData.reactionTime, 1);

    // direção pura ao jogador
    const dir = new THREE.Vector3()
      .subVectors(player.position, o.position)
      .normalize();

    // só X e Y com fator f
    o.position.x += dir.x * enemySpeed * aggroFactor * f;
    o.position.y += dir.y * enemySpeed * aggroFactor * f;      
    
  });
}
  
  function ajustarDificuldade() {
    enemySpeed   = ST.ENEMY_BASE_SPEED + (level - 1) * 0.005;
    
    // incrementa 0.1 por nível, mas não ultrapassa 2.0
    aggroFactor = Math.min(aggroFactor + ST.AGGRO_INCREMENT, ST.AGGRO_MAX);

    dificuldade += 1;
    hitsToKill   = ST.BASE_HITS_TO_KILL + (level - 1) * 2;

    window.monitorVars.level = level;
    window.monitorVars.dificuldade = dificuldade;
    window.monitorVars.hitsToKill = hitsToKill;
    window.monitorVars.aggroFactor = aggroFactor;
        
  }

  // Plasma shooting functionality
  function shootPlasma() {
    if (!player) return;
    
    const geometry = new THREE.SphereGeometry(0.07 + ST.PLASMA_SIZE, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.copy(player.position);
    ball.userData = { velocity: new THREE.Vector3(0, 0, -ST.PROJECTILE_SPEED) };
    scene.add(ball);
    projectiles.push(ball);
  

  }
  
  

  
  window.addEventListener('keydown', e => {
    if (isPaused) return;
    if (gameState === 'play' && (e.key === ' ' || e.key === 'Spacebar')) {
      shootPlasma();
  
      playEffect(ST.FX_PLASMA_NOT_HIT);
    }
  });

  var contaTiros = 0;

  function animate() {

    if(contaTiros > ST.TIROS_POR_SEGUNDO && tiroAutomatico )
    {
      if( ! isPaused && gameState === 'play'){
        shootPlasma();
        playEffect(ST.FX_PLASMA_NOT_HIT);
  
      }        
        contaTiros = 0;  
      
    }
    else
    {
        contaTiros++;
    }
    
    
    if (gameState === 'start') return;
    requestAnimationFrame(animate);
    if (isPaused) return;
    
    if (gameState === 'play') {
      spawnTimer += speed;
      if (spawnTimer > 60) {
        spawnTimer = 0;
  
        spawnCollectible();
      }

      spawnTimerEnemy += speed;
      if (spawnTimerEnemy > 50-dificuldade) {
        spawnTimerEnemy = 0;
        spawnenemy();
        
      }

    }
    
    const delta = chaseClock.getDelta();

    moveEnemiesTowardsPlayer(delta);

    enemys.forEach(o => o.position.z += speed);

    collectibles.forEach(c => {
 
        c.position.z += speed;
        c.rotation.y += ST.STAR_ROTATION_SPEED;
      });


    // update projectiles
    projectiles = projectiles.filter(b => {
      b.position.add(b.userData.velocity);
      // remove if too far
      if (b.position.z < ST.INITIAL_ENEMY_Z - 50) {
        scene.remove(b);
        return false;
      }
      return true;
    });
    
    const pos = stars.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.array[3 * i + 2] += speed * 5;
      if (pos.array[3 * i + 2] > 10) pos.array[3 * i + 2] -= 200;
    }
    pos.needsUpdate = true;
   
      planetaTerraPlanet.rotation.y += ST.EARTH_ROTATION_SPEED;
      planetaTerraPlanet.position.z += ST.PLANET_SPEED;
      if (planetaTerraPlanet.position.z > 5) spawnplanetaTerraPlanet();
    

    // collision: projectiles vs enemies
    projectiles.forEach((b, bi) => {
      enemys.forEach((o, ei) => {
        if (b.position.distanceTo(o.position) < ST.COLLISION_DISTANCE) {
          // hit effect
          o.userData.hits++;
          

          // flash white
          o.traverse(c => { if (c.material) { c.material.emissive = new THREE.Color(0xffffff); } });
          setTimeout(() => {
            o.traverse(c => { if (c.material) { c.material.emissive = new THREE.Color(0x000000); } });
          }, 50);
          // remove projectile
          scene.remove(b);
          projectiles.splice(bi, 1);
          // check destroy
          const required = ST.BASE_HITS_TO_KILL + (level - 1) * 2;
          if (o.userData.hits >= required) {
            // destroy enemy
            spawnExplosion(o.position.clone());
            scene.remove(o);
            enemys.splice(ei, 1);



            score += ST.VALOR_INIMIGO; 
            window.monitorVars.score = score;

            contadorParaPularNivel = Math.round(score / ST.PONTOS_PARA_MUDAR_NIVEL);
            scoreEl.textContent = score;
            verificaNivelPorScore();

          }
          else
          {
            //playEffect(fxTiroAtinge);
            playShotHit();
          }
        }
      });
    });
 
    if(!IS_MODO_TESTE)
      checkCollisions();

    for (let i = explosions.length - 1; i >= 0; i--) {
      const p = explosions[i];
      const posA = p.geometry.attributes.position;
      const velA = p.geometry.attributes.velocity;
      for (let j = 0; j < posA.count; j++) {
        posA.array[3 * j]     += velA.array[3 * j];
        posA.array[3 * j + 1] += velA.array[3 * j + 1];
        posA.array[3 * j + 2] += velA.array[3 * j + 2];
      }
      posA.needsUpdate = true;
      p.material.opacity -= 0.005;
      if (p.material.opacity <= 0) {
        scene.remove(p);
        explosions.splice(i, 1);
      }
    }
    if (gameState === 'exploding' && explosions.length === 0) {
      gameState = 'over';
      hud.style.display = 'none';
      gameOverScreen.style.display = 'flex';
      finalScoreEl.textContent = score;
      if (score > highScore) localStorage.setItem('highScore', score);
      atualizarVisibilidadeDaBarra();
    }
    renderer.render(scene, camera);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker registrado!'));
  }
  
  let audioSettings = JSON.parse(localStorage.getItem('audioSettings'));
  if (!audioSettings) {
    audioSettings = { bgVolume: ST.BG_MUSIC.volume, fxVolume: ST.FX_SPAWN.volume, muted: false };
    localStorage.setItem('audioSettings', JSON.stringify(audioSettings));
  }
  if (!audioSettings.explosionGain) {
    audioSettings.explosionGain = explosionGain;
    localStorage.setItem('audioSettings', JSON.stringify(audioSettings));
  } else {
    explosionGain = audioSettings.explosionGain;
  }
  
  const { bgVolume, fxVolume, muted } = audioSettings;
  
  // 🎵 Volume de fundo
  ST.BG_MUSIC.volume = bgVolume;
  bgSlider.value   = bgVolume;
  
  // 💥 Volume de efeitos “soltos”
  ST.FX_SPAWN.volume = ST.FX_COLLECT.volume = ST.FX_PLASMA_NOT_HIT.volume =  fxVolume;
  
  // 🔫 Pool de tiros
  ST.SHOT_POOL_AUDIO.forEach(a => a.volume = fxVolume);
  
  // 💥 Pool de explosões
  ST.CRASH_POOL_AUDIO.forEach(a => a.volume = fxVolume);
  
  fxSlider.value = fxVolume;
  
  // 🔇 Estado mudo
  [ST.BG_MUSIC, ST.FX_SPAWN, ST.FX_COLLECT, ST.FX_PLASMA_NOT_HIT]
    .forEach(a => a.muted = muted);
  ST.SHOT_POOL_AUDIO.forEach(a => a.muted = muted);
  ST.CRASH_POOL_AUDIO.forEach(a => a.muted = muted);
  
  muteBtn.textContent = muted ? '🔇 Mudo' : '🔊 Som';
  
  
  initThree();

    // --- Abre o painel apenas se ativado ---
    if (ABRIR_MONITOR) {
        abrirPainelMonitor();
    }
  

  onWindowResize();

  if (IS_MODO_TESTE) {
    if (container.requestFullscreen) document.documentElement.requestFullscreen();
    startScreen.style.display = 'none';
    hud.style.display = 'flex';
    gameState = 'play';
    pauseBtn.style.display = 'block';
    ST.BG_MUSIC.play().catch(() => {});
    atualizarVisibilidadeDaBarra();
    animate();
  }


});
