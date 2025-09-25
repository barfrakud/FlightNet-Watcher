import { RadarScene } from './core/RadarScene.js';

export function initApp(canvasElement) {
  if (!canvasElement || canvasElement.nodeName !== 'CANVAS') {
    throw new Error('initApp expects a valid <canvas> element');
  }

  const scene = new RadarScene(canvasElement);
  scene.start();
  return scene;
}
