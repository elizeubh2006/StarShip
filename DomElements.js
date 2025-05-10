import * as ST from './settings.js';

export function initDomElements() {
    let explosionGain = 1.2;


    const startScreen    = document.getElementById('start-screen');
    const hud            = document.getElementById('hud');
    const gameOverScreen = document.getElementById('game-over');
    const scoreEl        = document.getElementById('score');

    const levelEl        = document.getElementById('level');
    const finalScoreEl   = document.getElementById('final-score');
    const btnPlay        = document.getElementById('btn-play');
    const btnRestart     = document.getElementById('btn-restart');
    const container      = document.getElementById('game-container');

    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.style.position = 'absolute';
    loadingScreen.style.top = 0;
    loadingScreen.style.left = 0;
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.flexDirection = 'column';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.background = '#000';
    const progressBar = document.createElement('progress');
    progressBar.id = 'progress-bar';
    progressBar.max = 100;
    progressBar.value = 0;
    progressBar.style.width = '50%';
    const loadingText = document.createElement('div');
    loadingText.id = 'loading-text';
    loadingText.textContent = 'Loading...';
    loadingText.style.color = '#fff';
    loadingText.style.marginTop = '10px';
    loadingScreen.appendChild(progressBar);
    loadingScreen.appendChild(loadingText);
    container.appendChild(loadingScreen);


    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'settings-btn';
    settingsBtn.style.position = 'absolute';
    settingsBtn.style.bottom = '10px';
    settingsBtn.style.right = '10px';
    settingsBtn.style.backgroundColor = 'transparent';
    settingsBtn.style.border = '2px outset white';
    settingsBtn.style.borderRadius = '4px';
    settingsBtn.style.fontSize = '50px';
    settingsBtn.style.color = 'white';
    settingsBtn.style.zIndex = '10';
    settingsBtn.style.display = 'none';
    settingsBtn.textContent = '⚙️';
    container.appendChild(settingsBtn);

    const settingsMenu = document.createElement('div');
    settingsMenu.id = 'settings-menu';
    settingsMenu.style.position = 'absolute';
    settingsMenu.style.bottom = '70px';
    settingsMenu.style.right = '10px';
    settingsMenu.style.display = 'none';
    settingsMenu.style.background = '#222';
    settingsMenu.style.padding = '10px';
    settingsMenu.style.borderRadius = '8px';
    settingsMenu.style.color = 'white';
    settingsMenu.style.zIndex = '11';
    settingsMenu.style.width = '200px';




    container.appendChild(settingsMenu);

    const muteBtn = document.createElement('button');
    muteBtn.id = 'mute-btn';
    muteBtn.textContent = '🔊 Som';
    muteBtn.style.display = 'block';
    muteBtn.style.marginBottom = '10px';
    muteBtn.style.background = 'transparent';
    muteBtn.style.border = '1px solid white';
    muteBtn.style.width = '100%';
    muteBtn.style.fontSize = '40px';
    muteBtn.style.color = 'white';
    settingsMenu.appendChild(muteBtn);

    const bgSliderLabel = document.createElement('label');
    bgSliderLabel.textContent = 'Música de Fundo';
    settingsMenu.appendChild(bgSliderLabel);
    const bgSlider = document.createElement('input');
    bgSlider.type = 'range';
    bgSlider.min = 0;
    bgSlider.max = 1;
    bgSlider.step = 0.01;
    bgSlider.value = ST.BG_MUSIC.volume;
    bgSlider.style.width = '100%';
    settingsMenu.appendChild(bgSlider);

    const fxSliderLabel = document.createElement('label');
    fxSliderLabel.textContent = 'Efeitos';
    settingsMenu.appendChild(fxSliderLabel);
    const fxSlider = document.createElement('input');
    fxSlider.type = 'range';
    fxSlider.min = 0;
    fxSlider.max = 1;
    fxSlider.step = 0.01;
    fxSlider.value = ST.FX_SPAWN.volume;
    fxSlider.style.width = '100%';
    settingsMenu.appendChild(fxSlider);

    // label + slider para explosão
    const expLabel = document.createElement('label');
    expLabel.textContent = 'Explosões';
    settingsMenu.appendChild(expLabel);

    const expSlider = document.createElement('input');
    expSlider.type = 'range';
    expSlider.min = 0.5;
    expSlider.max = 2.0;
    expSlider.step = 0.05;
    expSlider.value = explosionGain;
    expSlider.style.width = '100%';
    settingsMenu.appendChild(expSlider);

    const exitBtn = document.createElement('button');
    exitBtn.textContent = '🏠 Voltar';
    exitBtn.style.display = 'block';
    exitBtn.style.color = 'white';
    exitBtn.style.marginTop = '10px';
    exitBtn.style.background = 'transparent';
    exitBtn.style.border = '1px solid white';
    exitBtn.style.width = '100%';
    exitBtn.style.fontSize = '40px';
    settingsMenu.appendChild(exitBtn);

        if (localStorage.getItem('audioSettings')) {
        const audioSettings = JSON.parse(localStorage.getItem('audioSettings'));
        ST.BG_MUSIC.volume = audioSettings.bgVolume;
        ST.FX_SPAWN.volume = ST.FX_COLLECT.volume = ST.FX_PLASMA_NOT_HIT.volume = audioSettings.fxVolume;
        bgSlider.value = audioSettings.bgVolume;
        fxSlider.value = audioSettings.fxVolume;
        muteBtn.textContent = audioSettings.muted ? '🔇 Mudo' : '🔊 Som';
        if (!audioSettings.explosionGain) {
          audioSettings.explosionGain = explosionGain;
          localStorage.setItem('audioSettings', JSON.stringify(audioSettings));
        } else {
          explosionGain = audioSettings.explosionGain;
        }
      }
      
        const pauseBtn = document.createElement('button');
        pauseBtn.id = 'pause-btn';
        pauseBtn.style.position = 'absolute';
        pauseBtn.style.top = '10px';
        pauseBtn.style.right = '10px';
        pauseBtn.style.backgroundColor = 'transparent';
        pauseBtn.style.border = 'none';
        pauseBtn.style.fontSize = '50px';
        pauseBtn.style.color = 'white';
        pauseBtn.style.zIndex = '10';
        pauseBtn.textContent = '⏸️';
        pauseBtn.style.display = 'none';
        container.appendChild(pauseBtn);      

        const overlay = document.createElement('div');
        overlay.id = 'pause-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(255,255,255,0.5)';
        overlay.style.backdropFilter = 'blur(10px)';
        overlay.style.display = 'none';
        overlay.style.zIndex = '9';
        overlay.style.backdropFilter = 'blur(10px)';
        overlay.style.webkitBackdropFilter = 'blur(10px)';
        container.appendChild(overlay);
 
        const pauseIcon = document.createElement('div');
        pauseIcon.textContent = '⏸️';
        pauseIcon.style.position = 'absolute';
        pauseIcon.style.top = '50%';
        pauseIcon.style.left = '50%';
        pauseIcon.style.transform = 'translate(-50%, -50%)';
        pauseIcon.style.fontSize = '100px';
        pauseIcon.style.animation = 'blink 1s infinite';
        overlay.appendChild(pauseIcon);
        const style = document.createElement('style');
        style.textContent = `
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        `;
        document.head.appendChild(style);

      
      let parExplosionGain = explosionGain;



      return {
        startScreen, hud, gameOverScreen,
        scoreEl, levelEl, finalScoreEl,
        btnPlay, btnRestart,
        container, loadingScreen, progressBar,
        settingsBtn, settingsMenu,
        muteBtn, bgSlider, fxSlider, expSlider, exitBtn,
        parExplosionGain, pauseBtn,overlay
      };      
}