import { RadarScene } from './core/RadarScene.js';

export function initApp({ canvas, uiRoot, options, uiOptions, gameState, scoreboard, playerManager } = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('initApp expects a valid <canvas> element');
  }

  const scene = new RadarScene({
    canvas,
    uiRoot,
    options,
    uiOptions,
    gameState,
    scoreboard,
    playerManager,
  });

  scene.start();
  return scene;
}
