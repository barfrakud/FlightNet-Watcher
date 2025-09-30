import { TrafficManager } from '../services/TrafficManager.js';
import { GameState } from '../game/GameState.js';
import { Scoreboard } from '../game/Scoreboard.js';
import { PlayerManager } from '../game/PlayerManager.js';
import { HUD } from '../ui/HUD.js';
import { ControlPanel } from '../ui/ControlPanel.js';
import { CallsignForm } from '../ui/CallsignForm.js';
import { StageComplete } from '../ui/StageComplete.js';
import { GameOver } from '../ui/GameOver.js';
import { FinalScore } from '../ui/FinalScore.js';

const DEFAULT_BACKGROUND = '#001a2c';

export class RadarScene {
  constructor({ canvas, uiRoot, gameState, scoreboard, playerManager, options = {}, uiOptions = {} } = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('RadarScene expects a HTMLCanvasElement');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      backgroundColor: options.backgroundColor ?? DEFAULT_BACKGROUND,
      maxAircraft: options.maxAircraft ?? 10,
      spawnInterval: options.spawnInterval ?? 1000,
    };

    this.uiRoot = uiRoot ?? null;
    this.uiOptions = uiOptions;

    this.mousePosition = null;
    this.running = false;
    this.frameRequest = null;
    this.startTimestamp = null;

    this.trafficManager = new TrafficManager({
      maxAircraft: this.options.maxAircraft,
      spawnInterval: this.options.spawnInterval,
    });

    this.gameState = gameState ?? new GameState();
    this.scoreboard = scoreboard ?? new Scoreboard({ topLimit: 5 });
    this.playerManager = playerManager ?? new PlayerManager({ maxPlayers: 1 });

    this.hud = null;
    this.controlPanel = null;
    this.callsignForm = null;
    this.stageComplete = null;
    this.gameOver = null;
    this.finalScore = null;
    this.currentPlayerId = null;
    this.currentCallsign = null;
    this.runway = null;
    this.runwayVisible = false;
    this.windDirection = 0;
    this.activeRunway = '27';
    this.currentStage = 1;
    this.stageScore = 0;
    this._generateWind();

    this._boundLoop = this._loop.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleCallsignSubmit = this._handleCallsignSubmit.bind(this);
    this._handleNextStage = this._handleNextStage.bind(this);
    this._handleRestart = this._handleRestart.bind(this);

    this._configureCanvas();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startTimestamp = null;
    this.frameRequest = requestAnimationFrame(this._boundLoop);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
    window.removeEventListener('resize', this._handleResize);
    this.canvas.removeEventListener('mousemove', this._handleMouseMove);
    this._destroyUi();
  }

  _configureCanvas() {
    this._handleResize();
    window.addEventListener('resize', this._handleResize);
    this.canvas.addEventListener('mousemove', this._handleMouseMove);
    this.trafficManager.initialize(this._getBounds());
    this._initUi();
  }

  _handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._updateRunwayDefinition();
  }

  _generateWind() {
    this.windDirection = Math.random() * 360;
    const normalizedWind = ((this.windDirection + 180) % 360);
    if (normalizedWind < 90 || normalizedWind >= 270) {
      this.activeRunway = '27';
    } else {
      this.activeRunway = '09';
    }
    this.trafficManager.setActiveRunway(this.activeRunway);
  }

  startNextStage() {
    this.currentStage += 1;
    this.stageScore = 0;
    this.startTimestamp = null;
    this.trafficManager.startStage(this.currentStage);
    this._generateWind();
  }

  _handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  _loop(timestamp) {
    if (!this.running) {
      return;
    }

    if (this.startTimestamp === null) {
      this.startTimestamp = timestamp;
    }

    const bounds = this._getBounds();
    this.trafficManager.setBounds(bounds);
    const activeRunway = this.runwayVisible ? this.runway : null;
    const { landed, score } = this.trafficManager.update({
      timestamp,
      mousePosition: this.mousePosition,
      runway: activeRunway,
    });
    if (score !== 0) {
      console.log(`Score change: ${score > 0 ? '+' : ''}${score} points`);
      this.gameState.adjustScore(score);
      this.stageScore += score;
      console.log(`Total score: ${this.gameState.metrics.score}, Stage score: ${this.stageScore}`);
    }
    if (landed > 0) {
      this.gameState.incrementFlightsHandled(landed);
    }
    this.gameState.setActiveFlights(this.trafficManager.aircraft.length);

    if (this.gameState.metrics.score < 0) {
      this.running = false;
      this._showGameOver();
      return;
    }

    if (this.trafficManager.stageComplete && !this.stageComplete?.isVisible) {
      this.running = false;
      this._showStageComplete();
      return;
    }

    this._drawBackground();
    this.trafficManager.draw(this.ctx);

    this._updateUi(timestamp);

    this.frameRequest = requestAnimationFrame(this._boundLoop);
  }

  _drawBackground() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    ctx.fillStyle = this.options.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY);

    if (this.runwayVisible) {
      this._drawRunway(ctx, centerX, centerY, maxRadius);
    }

    ctx.strokeStyle = '#003300';
    for (let i = 1; i <= 5; i += 1) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius * i) / 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    ctx.stroke();
  }

  _updateRunwayDefinition() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const halfLength = width * 0.18;
    const halfWidth = Math.min(width, height) * 0.02;
    this.runway = {
      centerX: width / 2,
      centerY: height / 2,
      halfLength,
      halfWidth,
    };
  }

  _drawRunway(ctx, centerX, centerY, maxRadius) {
    if (!this.runway) {
      this._updateRunwayDefinition();
    }
    const { halfLength = maxRadius * 0.4, halfWidth = maxRadius * 0.04 } = this.runway ?? {};
    const runwayLength = halfLength * 2;
    const runwayWidth = halfWidth * 2;
    const top = this.runway.centerY - runwayWidth / 2;
    const left = this.runway.centerX - runwayLength / 2;

    ctx.fillStyle = 'rgba(30, 30, 30, 0.85)';
    ctx.fillRect(left, top, runwayLength, runwayWidth);

    ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, runwayLength, runwayWidth);

    const centerLineSegments = 9;
    const segmentLength = runwayLength / (centerLineSegments * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([segmentLength, segmentLength]);
    ctx.beginPath();
    const midY = this.runway.centerY;
    ctx.moveTo(left, midY);
    ctx.lineTo(left + runwayLength, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    const landingPointX = left + runwayLength / 3;
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(landingPointX, top);
    ctx.lineTo(landingPointX, top + runwayWidth);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 24px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (this.activeRunway === '27') {
      ctx.fillText('27', left + 40, midY);
      ctx.fillText('09', left + runwayLength - 40, midY);
    } else {
      ctx.fillText('09', left + 40, midY);
      ctx.fillText('27', left + runwayLength - 40, midY);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  _getBounds() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  _initUi() {
    if (!this.uiRoot) {
      return;
    }

    this.hud = new HUD(this.uiRoot, this.uiOptions.hud);
    this.controlPanel = new ControlPanel(this.uiRoot, this.uiOptions.controlPanel);
    this.callsignForm = new CallsignForm(this.uiRoot, {
      onSubmit: this._handleCallsignSubmit,
      ...(this.uiOptions.callsignForm ?? {}),
    });
    this.stageComplete = new StageComplete(this.uiRoot, {
      onNextStage: this._handleNextStage,
      onEndGame: this._handleEndGame.bind(this),
    });
    this.gameOver = new GameOver(this.uiRoot, {
      onRestart: this._handleRestart,
    });
    this.finalScore = new FinalScore(this.uiRoot, {
      onRestart: this._handleRestart,
    });
  }

  _destroyUi() {
    this.hud?.destroy();
    this.hud = null;
    this.controlPanel?.destroy();
    this.controlPanel = null;
    this.callsignForm?.destroy();
    this.callsignForm = null;
    this.stageComplete?.destroy();
    this.stageComplete = null;
    this.gameOver?.destroy();
    this.gameOver = null;
    this.finalScore?.destroy();
    this.finalScore = null;
  }

  _showStageComplete() {
    if (this.stageComplete) {
      this.stageComplete.show({
        stage: this.currentStage,
        score: this.stageScore,
        totalScore: this.gameState.metrics.score,
      });
    }
  }

  _handleNextStage() {
    this.startNextStage();
    this.running = true;
    this.frameRequest = requestAnimationFrame(this._boundLoop);
  }

  _showGameOver() {
    if (this.gameOver) {
      this.gameOver.show({
        score: this.gameState.metrics.score,
        stage: this.currentStage,
      });
    }
  }

  _handleEndGame() {
    if (this.currentCallsign && this.gameState.metrics.score > 0) {
      this.scoreboard.addScore({
        callsign: this.currentCallsign,
        score: this.gameState.metrics.score,
      });
    }

    if (this.finalScore) {
      this.finalScore.show({
        callsign: this.currentCallsign || 'Unknown',
        score: this.gameState.metrics.score,
        stage: this.currentStage,
        topScores: this.scoreboard.getTopScores(),
      });
    }
  }

  _handleRestart() {
    this.currentStage = 1;
    this.stageScore = 0;
    this.gameState.metrics.score = 0;
    this.gameState.metrics.flightsHandled = 0;
    this.currentPlayerId = null;
    this.currentCallsign = null;
    this.runwayVisible = false;
    this.startTimestamp = null;
    this.trafficManager.startStage(1);
    this._generateWind();
    
    if (this.hud) {
      this.hud.hide();
    }
    if (this.controlPanel) {
      this.controlPanel.hide();
    }
    if (this.callsignForm) {
      this.callsignForm.setVisible(true);
    }
  }

  _updateUi(timestamp) {
    if (!this.hud && !this.controlPanel) {
      return;
    }

    const elapsedMs = this.startTimestamp === null ? 0 : timestamp - this.startTimestamp;

    if (this.hud) {
      const aircraftAirborne = this.trafficManager.aircraft.length;
      const aircraftLanded = this.gameState.metrics.flightsHandled;
      
      this.hud.update({
        score: this.gameState.metrics.score,
        stage: this.currentStage,
        elapsedMs,
        activeRunway: this.activeRunway,
        aircraftAirborne,
        aircraftLanded,
      });
    }

    if (this.controlPanel) {
      this.controlPanel.update({
        topScores: this.scoreboard.getTopScores(),
      });
    }

    if (this.callsignForm) {
      const hasPlayer = Boolean(this.currentPlayerId);
      this.callsignForm.setVisible(!hasPlayer);
    }
  }

  _handleCallsignSubmit({ callsign }) {
    if (!this.playerManager.isSlotAvailable()) {
      return;
    }
    const id = this._generatePlayerId();
    const player = this.playerManager.joinPlayer({ id, callsign });
    if (!player) {
      return;
    }
    this.currentPlayerId = player.id;
    this.currentCallsign = callsign;
    this.runwayVisible = true;
    this.running = true;
    this.trafficManager.startStage(1);
    
    if (this.hud) {
      this.hud.show();
    }
    if (this.controlPanel) {
      this.controlPanel.show();
    }
    
    this.frameRequest = requestAnimationFrame(this._boundLoop);
  }

  _generatePlayerId() {
    return `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
