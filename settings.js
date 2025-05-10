// parâmetros para controlar a “janela de reação"
const BASE_REACTION_TIME        = 2.0;   // segundos iniciais para reagir
const MIN_REACTION_TIME         = 0.3;   // limite mínimo (mesmo no nível alto)
const REACTION_DECREASE         = 0.2;   // quanto tempo a menos por nível

// parâmetros de aggro
const AGGRO_INCREMENT           = 0.1;
const AGGRO_MAX                 = 2.0;
 
// limites e posições em X
const BOUND_X                   = 3;
const BOUND_Y                   = 2.5;
const POSITIONS_X               = {
  player:      -6,
  enemy:       -3,
  collectible:  0,
  earth:        3,
  brightStar:   6
};

// jogador
const PLAYER_SIZE               = -0.01;
const PLAYER_START_POSITION     = { x: 0, y: 0, z: 0 };

// inimigo
const ENEMY_BASE_SPEED          = 0.1;
const ENEMY_PASS_OFFSET_Z       = 4.0;   // além da posição do player antes de sumir
const INITIAL_ENEMY_Z           = -39.96;
const ENEMY_SIZE                = { x: 0.1, y: 0.1, z: 0.1 };
const BASE_HITS_TO_KILL         = 5;     // base hits to destroy enemy
const COLLISION_DISTANCE        = 0.6;
const ENEMY_MIN_DISTANCE        = 2;

// colecionáveis
const COLLISION_DISTANCE_COLLECTIBLE  = 1.2;
const INITIAL_COLLECTIBLE_Z           = -39.96;
const COLLECTIBLE_SIZE                = { x: 0.08, y: 0.08, z: 0.08 };

// projéteis
const PLASMA_SIZE               = 0.13;
const PROJECTILE_SPEED          = 1;     // speed of plasma balls
const TIROS_POR_SEGUNDO         = 7;

// pontuação e níveis
const PONTOS_PARA_MUDAR_NIVEL   = 500;
const VALOR_INIMIGO             = 20;
const VALOR_ESTRELA             = 50;

// planetas
const EARTH_SIZE                = 2.29;
const EARTH_POSITION            = { x: 10, y: 5, z: -50.00 };
const EARTH_ROTATION_SPEED      = 0.01;
const PLANET_SIZE               = 0.5;
const PLANET_SPEED              = 0.0005;

// estrelas brilhantes
const BRIGHTSTAR_SIZE           = { x: 5, y: 5, z: 5 };
const BRIGHTSTAR_POSITION       = { x: -0.5, y: 2, z: -50 };
const STAR_ROTATION_SPEED       = 0.08;

// efeitos de explosão
const EXPLOSION_SPEED           = 0.1;

// caminhos para assets
const PATHS = {
  player:      "./models/SpaceShip/scene.gltf",
  enemy:       "./models/Enemy/scene.gltf",
  collectible: "./models/Collectibles/scene.gltf",
  earth:       "./models/Earth/earth.gltf",
  brightStar:  "./images/brightStar.png"
};

// áudio
const BG_MUSIC   = new Audio('audio/bg-music.mp3');
const FX_SPAWN   = new Audio('audio/spawn.mp3');
const FX_COLLECT = new Audio('audio/collect.mp3');
const FX_PLASMA_NOT_HIT   = new Audio('audio/PlasmaShot.mp3');

const CRASH_POOL_AUDIO = Array.from({length:6}, () => {
  const a = new Audio('audio/crash.mp3');
  a.preload = 'auto';
  a.load();
  return a;
});
  
const SHOT_POOL_AUDIO = Array.from({length:8}, () => {
  const a = new Audio('audio/PlasmaShotHit.mp3');
  a.preload = 'auto';
  a.load();
  return a;
});

// Exportando todas as constantes em bloco, agrupadas por categoria
export {
  // janela de reação
  BASE_REACTION_TIME,
  MIN_REACTION_TIME,
  REACTION_DECREASE,

  // aggro
  AGGRO_INCREMENT,
  AGGRO_MAX,

  // limites e posições
  BOUND_X,
  BOUND_Y,
  POSITIONS_X,

  // jogador
  PLAYER_SIZE,
  PLAYER_START_POSITION,

  // inimigo
  ENEMY_BASE_SPEED,
  ENEMY_PASS_OFFSET_Z,
  INITIAL_ENEMY_Z,
  ENEMY_SIZE,
  BASE_HITS_TO_KILL,
  COLLISION_DISTANCE,
  ENEMY_MIN_DISTANCE,

  // colecionáveis
  COLLISION_DISTANCE_COLLECTIBLE,
  INITIAL_COLLECTIBLE_Z,
  COLLECTIBLE_SIZE,

  // projéteis
  PLASMA_SIZE,
  PROJECTILE_SPEED,
  TIROS_POR_SEGUNDO,

  // pontuação e níveis
  PONTOS_PARA_MUDAR_NIVEL,
  VALOR_INIMIGO,
  VALOR_ESTRELA,

  // planetas
  EARTH_SIZE,
  EARTH_POSITION,
  EARTH_ROTATION_SPEED,
  PLANET_SIZE,
  PLANET_SPEED,

  // estrelas brilhantes
  BRIGHTSTAR_SIZE,
  BRIGHTSTAR_POSITION,
  STAR_ROTATION_SPEED,

  // efeitos de explosão
  EXPLOSION_SPEED,

  // caminhos para assets
  PATHS,

  // áudio
  BG_MUSIC,
  FX_SPAWN,
  FX_COLLECT,
  FX_PLASMA_NOT_HIT,
  CRASH_POOL_AUDIO,
  SHOT_POOL_AUDIO
};
