const DEFAULT_DIFFICULTY_LEVELS = ['rookie', 'regular', 'advanced', 'expert'];
const DEFAULT_EXPERIENCE_THRESHOLDS = [0, 100, 250, 500, 800];

export class GameState {
  constructor(config = {}) {
    this.difficultyLevels = Array.isArray(config.difficultyLevels) && config.difficultyLevels.length > 0
      ? config.difficultyLevels
      : [...DEFAULT_DIFFICULTY_LEVELS];

    this.experienceThresholds = Array.isArray(config.experienceThresholds) && config.experienceThresholds.length > 0
      ? [...config.experienceThresholds]
      : [...DEFAULT_EXPERIENCE_THRESHOLDS];

    this.state = {
      difficulty: this._normalizeDifficulty(config.difficulty),
      stage: Number.isInteger(config.stage) && config.stage > 0 ? config.stage : 1,
      experience: Number.isFinite(config.experience) && config.experience >= 0 ? config.experience : 0,
      activeFlights: Number.isFinite(config.activeFlights) && config.activeFlights >= 0 ? config.activeFlights : 0,
    };

    this.metrics = {
      flightsHandled: 0,
      collisions: 0,
      score: 0,
    };

    this._updateStageFromExperience();
  }

  setDifficulty(level) {
    this.state.difficulty = this._normalizeDifficulty(level);
    return this.state.difficulty;
  }

  getDifficulty() {
    return this.state.difficulty;
  }

  addExperience(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return this.state.experience;
    }
    this.state.experience += amount;
    this._updateStageFromExperience();
    return this.state.experience;
  }

  setStage(stage) {
    if (!Number.isInteger(stage) || stage < 1) {
      return this.state.stage;
    }
    this.state.stage = stage;
    return this.state.stage;
  }

  getStage() {
    return this.state.stage;
  }

  incrementFlightsHandled(count = 1) {
    if (!Number.isFinite(count) || count <= 0) {
      return this.metrics.flightsHandled;
    }
    this.metrics.flightsHandled += count;
    return this.metrics.flightsHandled;
  }

  recordCollisions(count = 1) {
    if (!Number.isFinite(count) || count <= 0) {
      return this.metrics.collisions;
    }
    this.metrics.collisions += count;
    return this.metrics.collisions;
  }

  adjustScore(delta = 0) {
    if (!Number.isFinite(delta)) {
      return this.metrics.score;
    }
    this.metrics.score += delta;
    return this.metrics.score;
  }

  setActiveFlights(count) {
    if (!Number.isFinite(count) || count < 0) {
      return this.state.activeFlights;
    }
    this.state.activeFlights = count;
    return this.state.activeFlights;
  }

  getActiveFlights() {
    return this.state.activeFlights;
  }

  setExperienceThresholds(thresholds) {
    if (!Array.isArray(thresholds) || thresholds.length === 0) {
      return [...this.experienceThresholds];
    }
    this.experienceThresholds = [...thresholds].sort((a, b) => a - b);
    this._updateStageFromExperience();
    return [...this.experienceThresholds];
  }

  resetMetrics() {
    this.metrics = {
      flightsHandled: 0,
      collisions: 0,
      score: 0,
    };
  }

  resetState(overrides = {}) {
    this.state = {
      difficulty: this._normalizeDifficulty(overrides.difficulty ?? this.state.difficulty),
      stage: Number.isInteger(overrides.stage) && overrides.stage > 0 ? overrides.stage : 1,
      experience: Number.isFinite(overrides.experience) && overrides.experience >= 0 ? overrides.experience : 0,
      activeFlights: Number.isFinite(overrides.activeFlights) && overrides.activeFlights >= 0 ? overrides.activeFlights : 0,
    };
    this._updateStageFromExperience();
  }

  getSnapshot() {
    return {
      state: { ...this.state },
      metrics: { ...this.metrics },
      difficultyLevels: [...this.difficultyLevels],
      experienceThresholds: [...this.experienceThresholds],
    };
  }

  _normalizeDifficulty(level) {
    if (!level) {
      return this.difficultyLevels[0];
    }
    const normalized = level.toString().toLowerCase();
    const match = this.difficultyLevels.find((item) => item.toLowerCase() === normalized);
    return match ?? this.difficultyLevels[0];
  }

  _updateStageFromExperience() {
    const experience = this.state.experience;
    let computedStage = 1;
    for (let i = 0; i < this.experienceThresholds.length; i += 1) {
      if (experience >= this.experienceThresholds[i]) {
        computedStage = i + 1;
      }
    }
    this.state.stage = computedStage;
    return this.state.stage;
  }
}
