const DEFAULT_TOP_LIMIT = 5;
const DEFAULT_REQUIRE_CALLSIGN = true;

class MemoryStorage {
  constructor(initialData = []) {
    this._data = Array.isArray(initialData) ? [...initialData] : [];
  }

  load() {
    return [...this._data];
  }

  save(entries) {
    this._data = Array.isArray(entries) ? [...entries] : [];
  }
}

export class Scoreboard {
  constructor({ topLimit = DEFAULT_TOP_LIMIT, storage, requireCallsign = DEFAULT_REQUIRE_CALLSIGN } = {}) {
    this.topLimit = Number.isInteger(topLimit) && topLimit > 0 ? topLimit : DEFAULT_TOP_LIMIT;
    this.storage = storage ?? new MemoryStorage();
    this.requireCallsign = requireCallsign;
    this.entries = this._normaliseEntries(this.storage.load?.() ?? []);
    this._persist();
  }

  recordResult({ callsign, score, durationMs, timestamp }) {
    const validatedScore = this._validateScore(score);
    const validatedCallsign = this._validateCallsign(callsign);

    const entry = {
      callsign: validatedCallsign,
      score: validatedScore,
      durationMs: this._validateDuration(durationMs),
      timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
    };

    this.entries.push(entry);
    this.entries.sort(this._compareEntries);
    if (this.entries.length > this.topLimit) {
      this.entries.length = this.topLimit;
    }

    this._persist();
    return { ...entry };
  }

  getTopScores() {
    return this.entries.map((entry) => ({ ...entry }));
  }

  getBestScore() {
    return this.entries.length === 0 ? null : { ...this.entries[0] };
  }

  reset() {
    this.entries = [];
    this._persist();
  }

  setTopLimit(limit) {
    if (!Number.isInteger(limit) || limit <= 0) {
      return this.topLimit;
    }
    this.topLimit = limit;
    if (this.entries.length > this.topLimit) {
      this.entries.length = this.topLimit;
      this._persist();
    }
    return this.topLimit;
  }

  importEntries(entries) {
    this.entries = this._normaliseEntries(entries);
    this._persist();
    return this.getTopScores();
  }

  _persist() {
    if (typeof this.storage?.save === 'function') {
      this.storage.save(this.getTopScores());
    }
  }

  _normaliseEntries(entries) {
    if (!Array.isArray(entries)) {
      return [];
    }
    const normalised = entries
      .map((item) => {
        try {
          return {
            callsign: this._validateCallsign(item.callsign),
            score: this._validateScore(item.score),
            durationMs: this._validateDuration(item.durationMs),
            timestamp: Number.isFinite(item.timestamp) ? item.timestamp : Date.now(),
          };
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean)
      .sort(this._compareEntries);

    if (normalised.length > this.topLimit) {
      normalised.length = this.topLimit;
    }

    return normalised;
  }

  _validateCallsign(callsign) {
    if (!this.requireCallsign) {
      return typeof callsign === 'string' ? callsign.trim() : 'ANON';
    }
    if (typeof callsign !== 'string') {
      throw new Error('Callsign must be a string');
    }
    const trimmed = callsign.trim();
    if (trimmed.length < 2 || trimmed.length > 12) {
      throw new Error('Callsign must be between 2 and 12 characters');
    }
    return trimmed;
  }

  _validateScore(score) {
    if (!Number.isFinite(score)) {
      throw new Error('Score must be a finite number');
    }
    return Math.max(0, Math.round(score));
  }

  _validateDuration(duration) {
    if (!Number.isFinite(duration) || duration < 0) {
      return null;
    }
    return Math.round(duration);
  }

  _compareEntries(a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.timestamp - b.timestamp;
  }
}
