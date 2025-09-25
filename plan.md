# Plan wdrożenia FlightNet Watcher

## Faza 0 – Przygotowanie techniczne
- [x] **Audyt obecnego kodu**: sprawdzenie funkcji w `index.html`, identyfikacja logiki kandydatów do wydzielenia.
  - Podsumowanie: cała logika osadzona jest w `<script>`; klasa `Aircraft` łączy odpowiedzialności (generowanie danych, ruch, renderowanie), a animacja i obsługa zdarzeń są prowadzone proceduralnie w globalnym zakresie.
- [x] **Projekt podziału na moduły**: zaprojektowanie struktury plików (`src/` dla logiki, `assets/`, moduły OOP dla samolotów, radaru, kolizji, interfejsu).
  - Proponowana struktura:
    - `src/main.js` – inicjalizacja aplikacji, konfiguracja.
    - `src/core/RadarScene.js` – obsługa `canvas`, pętli animacji, zdarzeń użytkownika.
    - `src/models/Aircraft.js` – logika pojedynczego statku powietrznego (stan, ruch, separacja renderingu).
    - `src/services/TrafficManager.js` – generowanie, spawn i recykling flot.
    - `src/game/GameState.js`, `src/game/Scoreboard.js`, `src/game/PlayerManager.js`, `src/game/DifficultyManager.js` – moduły grywalizacyjne przygotowane na kolejne fazy.
    - `src/ui/` – komponenty interfejsu (`HUD`, panel kontroli, formularze).

## Faza 1 – Refaktoryzacja do modułów OOP
- [x] **Wydzielenie klasy `Aircraft`**: przeniesienie definicji do `src/models/Aircraft.js`, dodanie interfejsu do eksportu/instancjonowania.
- [x] **Stworzenie `RadarScene`**: nowa klasa w `src/core/RadarScene.js` zarządzająca płótnem, pętlą animacji, obsługą zdarzeń oraz diagnostyką.
- [x] **Moduł zarządzania flotą**: `src/services/TrafficManager.js` odpowiedzialny za generowanie, odświeżanie, spawn i usuwanie samolotów.
- [x] **Inicjalizacja aplikacji**: `src/main.js` jako punkt startowy, który łączy `RadarScene`, `TrafficManager` i konfigurację.

## Faza 2 – Infrastruktura grywalizacji
- [x] **Konfiguracja i stany gry**: `src/game/GameState.js` przechowujące poziom trudności, doświadczenie, limity graczy, scoreboard.
- [x] **System punktów i wyników**: `src/game/Scoreboard.js` do liczenia punktów, zapisu `callsign`, zarządzania lokalnym `Top 5`.
- [x] **Obsługa limitu graczy**: `src/game/PlayerManager.js` weryfikujący dostępne sloty, w przyszłości integracja sieciowa.

## Faza 3 – Interfejs użytkownika
- [ ] **Warstwa UI**: wydzielenie widoków do `src/ui/`, m.in. `HUD`, panel kontroli, formularz `callsign`.
- [ ] **Integracja z DOM**: dostosowanie `index.html` do ładowania zbudowanego bundle’a (np. Vite/Webpack) i ładowanie zasobów UI.

## Faza 4 – Mechaniki progresji i trudności
- [ ] **Poziomy trudności**: moduł `src/game/DifficultyManager.js` kontrolujący liczbę samolotów, typy zdarzeń, scenariusze.
- [ ] **Zdarzenia losowe**: rozszerzenie `TrafficManager` o awarie, niski poziom paliwa, wymuszenie separacji wysokości.

## Faza 5 – Testy, optymalizacja, dokumentacja
- [ ] **Testy jednostkowe i e2e**: pokrycie kluczowych modułów (np. `Aircraft`, `Scoreboard`) testami – wybór narzędzi (Vitest/Jest).
- [ ] **Optymalizacja i porządkowanie kodu**: DRY, linting (ESLint + Prettier), przygotowanie do dalszych funkcji wieloosobowych.
- [ ] **Aktualizacja dokumentacji**: zaktualizowanie `readme.md`, dodanie instrukcji build/run, opisu architektury.

## Zależności i kolejność
1. Refaktoryzacja do modułów (Faza 1) – blokuje dalsze zmiany.
2. Game-state i limit graczy (Faza 2) – zależy od struktury z Fazy 1.
3. UI, progresja, trudność (Fazy 3–4) – budują na fundamentach poprzednich.
4. Testy, optymalizacja (Faza 5) – końcowe szlify.
