<template>
  <div class="page">
    <!-- Extra room at the top so the title isn't crowded by the lights hanging off the navbar -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <header class="text-center mb-6">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">🧩 Nonogramm</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Die Zahlen sagen, wie viele Felder in einer Zeile oder Spalte zusammenhängend ausgemalt sind. Findest du das Bild?
        </p>
        <button type="button" class="btn btn-secondary mt-4" @click="showHelp = true">📖 Anleitung</button>
      </header>

      <div class="card p-4 sm:p-6">
        <!-- Puzzle choice -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              v-for="option in modes"
              :key="option.id"
              type="button"
              :class="[segmentClasses, mode === option.id ? segmentActive : segmentInactive]"
              @click="mode = option.id"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <template v-if="mode === 'random'">
              <select v-model.number="width" class="input w-auto! py-1.5! text-sm" aria-label="Breite">
                <option v-for="n in sizes" :key="n" :value="n">{{ n }}</option>
              </select>
              <span class="text-gray-500 dark:text-gray-400">×</span>
              <select v-model.number="height" class="input w-auto! py-1.5! text-sm" aria-label="Höhe">
                <option v-for="n in sizes" :key="n" :value="n">{{ n }}</option>
              </select>
            </template>
            <button type="button" class="btn btn-primary" @click="newPuzzle">
              {{ mode === 'christmas' ? 'Neues Motiv' : 'Neues Rätsel' }}
            </button>
          </div>
        </div>

        <!-- Tools -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              v-for="option in tools"
              :key="option.id"
              type="button"
              :class="[segmentClasses, tool === option.id ? segmentActive : segmentInactive]"
              :disabled="solved"
              @click="tool = option.id"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ puzzle.name && solved ? `${puzzle.name} ${puzzle.emoji}` : `${puzzle.cols} × ${puzzle.rows}` }}
            </span>
            <span class="font-mono text-sm tabular-nums text-gray-700 dark:text-gray-200">⏱ {{ formatTime(elapsed) }}</span>
            <button type="button" class="btn btn-secondary" :disabled="solved || !cells.some(Boolean)" @click="reset">
              Zurücksetzen
            </button>
          </div>
        </div>

        <!-- Solved -->
        <Transition name="pop">
          <div
            v-if="solved"
            class="mt-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
          >
            <p class="font-semibold text-green-800 dark:text-green-300">
              🎉 Geschafft in {{ formatTime(elapsed) }}!
              <span v-if="puzzle.name" class="font-normal">Es ist: {{ puzzle.name }} {{ puzzle.emoji }}</span>
            </p>
            <button type="button" class="btn btn-success" @click="newPuzzle">Nächstes Rätsel</button>
          </div>
        </Transition>

        <!-- Board -->
        <div ref="boardWrap" class="mt-6 overflow-x-auto pb-2">
          <div
            class="nonogram mx-auto"
            :class="{ solved }"
            :style="{ '--cell': `${cellSize}px` }"
          >
            <div></div>

            <div class="col-clues">
              <div
                v-for="(clue, c) in clues.colClues"
                :key="c"
                class="col-clue"
                :class="{ done: colDone[c], hover: hover?.c === c }"
              >
                <span v-for="(n, k) in clue" :key="k">{{ n }}</span>
              </div>
            </div>

            <div class="row-clues">
              <div
                v-for="(clue, r) in clues.rowClues"
                :key="r"
                class="row-clue"
                :class="{ done: rowDone[r], hover: hover?.r === r }"
              >
                <span v-for="(n, k) in clue" :key="k">{{ n }}</span>
              </div>
            </div>

            <div
              class="board"
              :style="{ gridTemplateColumns: `repeat(${puzzle.cols}, var(--cell))` }"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerleave="hover = null"
              @contextmenu.prevent
            >
              <div
                v-for="(state, i) in cells"
                :key="i"
                :data-index="i"
                class="cell"
                :class="cellClasses(i, state)"
                :style="solved ? solvedStyle(i) : null"
              >
                <span v-if="state === MARKED && !solved" class="mark">✕</span>
              </div>
            </div>
          </div>
        </div>

        <p class="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Linksklick malt aus, Rechtsklick markiert ein leeres Feld mit ✕. Gedrückt halten und ziehen für mehrere Felder.
        </p>
      </div>
    </div>

    <Modal v-if="showHelp" size="large" @close="showHelp = false">
      <template #title>📖 So funktioniert ein Nonogramm</template>
      <template #content>
        <div class="space-y-5 text-sm sm:text-base text-gray-700 dark:text-gray-200">
          <section>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Das Ziel</h4>
            <p>
              Im Gitter ist ein Bild versteckt. Male die richtigen Felder aus, bis es fertig ist.
              Bei einem Weihnachtsmotiv erscheint am Ende das Bild in Farbe und sein Name.
            </p>
          </section>

          <section>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Die Zahlen</h4>
            <p>
              Links stehen die Zahlen für jede Zeile, oben die für jede Spalte. Jede Zahl ist ein Block aus so vielen
              ausgemalten Feldern direkt nebeneinander, in genau dieser Reihenfolge.
              Zwischen zwei Blöcken ist immer mindestens ein leeres Feld.
            </p>
            <p class="mt-2">
              Beispiel: <strong>3 1</strong> heißt drei ausgemalte Felder am Stück, dann mindestens eine Lücke,
              dann ein einzelnes Feld. Eine <strong>0</strong> heißt, dass die ganze Reihe leer bleibt.
            </p>
            <div class="mt-3 flex items-center gap-3 font-mono">
              <span class="font-semibold">3 1</span>
              <span class="help-row">
                <span class="filled"></span><span class="filled"></span><span class="filled"></span><span></span><span></span><span class="filled"></span><span></span>
              </span>
            </div>
          </section>

          <section>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Bedienung</h4>
            <ul class="list-disc pl-5 space-y-1">
              <li><strong>Linksklick</strong> oder Tippen malt ein Feld aus, nochmal klicken macht es wieder leer.</li>
              <li>
                <strong>Rechtsklick</strong> setzt ein ✕ in ein Feld, das sicher leer bleibt. Auf dem Handy schaltest du dafür
                oben auf <strong>✕ Markieren</strong> um.
              </li>
              <li><strong>Gedrückt halten und ziehen</strong> malt mehrere Felder einer Zeile oder Spalte auf einmal.</li>
              <li>Ist eine Zeile oder Spalte erfüllt, werden ihre Zahlen blass.</li>
            </ul>
          </section>

          <section>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Tipps</h4>
            <ul class="list-disc pl-5 space-y-1">
              <li>Fang mit großen Zahlen an. Eine 8 in einer Zeile mit 10 Feldern überdeckt auf jeden Fall die mittleren 6.</li>
              <li>Ergeben die Zahlen samt Lücken genau die Länge der Reihe, steht sie schon komplett fest.</li>
              <li>Setze ✕ in Felder, die sicher leer sind. Das hilft bei den Spalten, die sie kreuzen.</li>
              <li>Raten ist nie nötig: Jedes Rätsel hat genau eine Lösung, die man Schritt für Schritt herausfinden kann.</li>
            </ul>
          </section>

          <section>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Die zwei Modi</h4>
            <ul class="list-disc pl-5 space-y-1">
              <li><strong>🎄 Weihnachtsmotiv:</strong> ein weihnachtliches Bild. Was es ist, verrät es erst, wenn du fertig bist.</li>
              <li><strong>🎲 Zufällig:</strong> ein zufälliges Muster in der Größe, die du einstellst, von 3 × 3 bis 15 × 15.</li>
            </ul>
          </section>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Modal from '../components/Modal.vue'
import {
  CHRISTMAS_PUZZLES,
  christmasPuzzle,
  randomPuzzle,
  cluesOf,
  lineClue,
  rowsOf,
  columnsOf
} from '../nonogram'

const EMPTY = 0
const FILLED = 1
const MARKED = 2

const modes = [
  { id: 'christmas', label: '🎄 Weihnachtsmotiv' },
  { id: 'random', label: '🎲 Zufällig' }
]
const tools = [
  { id: 'fill', label: '✏️ Ausmalen' },
  { id: 'mark', label: '✕ Markieren' }
]
const sizes = Array.from({ length: 13 }, (_, i) => i + 3)

const segmentClasses = 'px-3 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50'
const segmentActive = 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white'
const segmentInactive = 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'

const mode = ref('christmas')
const tool = ref('fill')
const width = ref(5)
const height = ref(5)

const puzzle = ref(null)
const cells = ref([])
const solved = ref(false)
const hover = ref(null)
const showHelp = ref(false)

// Timer, starts with the first click

const elapsed = ref(0)
let timer = null
let startedAt = 0

function startTimer() {
  if (timer) return
  startedAt = Date.now() - elapsed.value * 1000
  timer = setInterval(() => {
    elapsed.value = Math.floor((Date.now() - startedAt) / 1000)
  }, 250)
}

function stopTimer() {
  clearInterval(timer)
  timer = null
}

const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

// Christmas pictures come in random order, none twice until all were shown
let unseen = []
function nextChristmasIndex() {
  if (unseen.length === 0) unseen = CHRISTMAS_PUZZLES.map((_, i) => i)
  return unseen.splice(Math.floor(Math.random() * unseen.length), 1)[0]
}

function newPuzzle() {
  puzzle.value = mode.value === 'christmas' ? christmasPuzzle(nextChristmasIndex()) : randomPuzzle(height.value, width.value)
  reset()
}

function reset() {
  cells.value = new Array(puzzle.value.rows * puzzle.value.cols).fill(EMPTY)
  solved.value = false
  stopTimer()
  elapsed.value = 0
}

watch([mode, width, height], newPuzzle)
newPuzzle()

const clues = computed(() => cluesOf(puzzle.value.solution, puzzle.value.rows, puzzle.value.cols))

const sameClue = (line, clue) => {
  const actual = lineClue(line.map((state) => state === FILLED))
  return actual.length === clue.length && actual.every((n, i) => n === clue[i])
}
const rowDone = computed(() =>
  rowsOf(cells.value, puzzle.value.rows, puzzle.value.cols).map((row, r) => sameClue(row, clues.value.rowClues[r]))
)
const colDone = computed(() =>
  columnsOf(cells.value, puzzle.value.rows, puzzle.value.cols).map((col, c) => sameClue(col, clues.value.colClues[c]))
)

// Every puzzle has exactly one solution, so matching all clues means it is solved
watch([rowDone, colDone], () => {
  if (!solved.value && rowDone.value.every(Boolean) && colDone.value.every(Boolean)) {
    solved.value = true
    drag = null
    hover.value = null
    stopTimer()
  }
})

// Painting: the first cell decides whether the drag fills, marks or clears,
// then the drag sticks to the row or column it started in

let drag = null

function cellAt(event) {
  const element = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-index]')
  if (!element) return null
  const i = Number(element.dataset.index)
  return { i, r: Math.floor(i / puzzle.value.cols), c: i % puzzle.value.cols }
}

function onPointerDown(event) {
  if (solved.value || (event.button !== 0 && event.button !== 2)) return
  const cell = cellAt(event)
  if (!cell) return
  event.preventDefault()

  const paintWith = event.button === 2 || tool.value === 'mark' ? MARKED : FILLED
  const value = cells.value[cell.i] === paintWith ? EMPTY : paintWith
  drag = { tool: paintWith, value, start: cell, axis: null }
  cells.value[cell.i] = value
  startTimer()
}

function onPointerMove(event) {
  const cell = cellAt(event)
  if (!solved.value) hover.value = cell
  if (!drag || !cell) return

  const { start } = drag
  if (!drag.axis) {
    if (cell.r === start.r && cell.c === start.c) return
    drag.axis = Math.abs(cell.r - start.r) > Math.abs(cell.c - start.c) ? 'column' : 'row'
  }

  const cols = puzzle.value.cols
  const indices = []
  if (drag.axis === 'row') {
    for (let c = Math.min(start.c, cell.c); c <= Math.max(start.c, cell.c); c++) indices.push(start.r * cols + c)
  } else {
    for (let r = Math.min(start.r, cell.r); r <= Math.max(start.r, cell.r); r++) indices.push(r * cols + start.c)
  }

  // Filling leaves marks alone and clearing only clears what the drag started on
  for (const i of indices) {
    const state = cells.value[i]
    if (drag.value === EMPTY ? state === drag.tool : state === EMPTY) cells.value[i] = drag.value
  }
}

const endDrag = (event) => {
  drag = null
  // Fingers don't hover, so the highlight would stay where the finger was lifted
  if (event.pointerType !== 'mouse') hover.value = null
}

// Board size: as big as fits, between 16 and 40 px per cell

const boardWrap = ref(null)
const availableWidth = ref(640)
let resizeObserver = null

const cellSize = computed(() => {
  const clueWidth = Math.max(...clues.value.rowClues.map((clue) => clue.length)) * 0.7 + 0.6
  const size = Math.floor((availableWidth.value - 8) / (puzzle.value.cols + clueWidth))
  return Math.max(16, Math.min(40, size))
})

onMounted(() => {
  resizeObserver = new ResizeObserver(([entry]) => {
    availableWidth.value = entry.contentRect.width
  })
  resizeObserver.observe(boardWrap.value)
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
  stopTimer()
})

function cellClasses(i, state) {
  const { rows, cols } = puzzle.value
  const r = Math.floor(i / cols)
  const c = i % cols
  return {
    filled: state === FILLED,
    hover: hover.value && (hover.value.r === r || hover.value.c === c),
    'edge-right': (c + 1) % 5 === 0 && c < cols - 1,
    'edge-bottom': (r + 1) % 5 === 0 && r < rows - 1,
    'last-col': c === cols - 1,
    'last-row': r === rows - 1
  }
}

// Once solved, the picture appears in color on a night sky, sweeping in from the top left
function solvedStyle(i) {
  const { cols, solution, colors } = puzzle.value
  return {
    backgroundColor: solution[i] ? colors[i] : '#0f172a',
    transitionDelay: `${(Math.floor(i / cols) + (i % cols)) * 35}ms`
  }
}
</script>

<style scoped>
.nonogram {
  --line: #d1d5db;
  --line-strong: #6b7280;
  --cell-bg: #ffffff;
  --cell-filled: #1f2937;
  --cell-hover: #fef2f2;
  --clue: #374151;
  --clue-hover: #dc2626;
  --mark: #9ca3af;
  --night: #0f172a;

  display: grid;
  grid-template-columns: auto auto;
  width: max-content;
  user-select: none;
  -webkit-user-select: none;
}

.dark .nonogram {
  --line: #4b5563;
  --line-strong: #9ca3af;
  --cell-bg: #1f2937;
  --cell-filled: #e5e7eb;
  --cell-hover: #374151;
  --clue: #d1d5db;
  --clue-hover: #f87171;
  --mark: #6b7280;
}

/* Clues */
.col-clues {
  display: flex;
  padding-left: 2px;
}

.col-clue {
  width: var(--cell);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: calc(var(--cell) * 0.15);
  line-height: 1.25;
}

.row-clues {
  display: flex;
  flex-direction: column;
  padding-top: 2px;
}

.row-clue {
  height: var(--cell);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: calc(var(--cell) * 0.25);
  padding-right: calc(var(--cell) * 0.3);
}

.col-clue,
.row-clue {
  font-size: max(10px, calc(var(--cell) * 0.45));
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--clue);
  border-radius: 4px;
  transition: color 0.2s, opacity 0.2s, background-color 0.2s;
}

.col-clue.hover,
.row-clue.hover {
  color: var(--clue-hover);
  background-color: var(--cell-hover);
}

.col-clue.done,
.row-clue.done {
  opacity: 0.35;
}

.solved .col-clue,
.solved .row-clue {
  opacity: 0.35;
}

/* Board */
.board {
  display: grid;
  border: 2px solid var(--line-strong);
  border-radius: 4px;
  overflow: hidden;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  transition: border-color 0.6s, box-shadow 0.6s;
}

.cell {
  width: var(--cell);
  height: var(--cell);
  box-sizing: border-box;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background-color: var(--cell-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.12s, border-color 0.6s;
}

.cell.edge-right {
  border-right: 2px solid var(--line-strong);
}

.cell.edge-bottom {
  border-bottom: 2px solid var(--line-strong);
}

.cell.last-col {
  border-right: none;
}

.cell.last-row {
  border-bottom: none;
}

.cell.hover {
  background-color: var(--cell-hover);
}

.cell.filled {
  background-color: var(--cell-filled);
}

.mark {
  color: var(--mark);
  font-size: calc(var(--cell) * 0.5);
  line-height: 1;
}

.solved .board {
  cursor: default;
  border-color: var(--night);
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.6);
}

.solved .cell {
  border-color: var(--night);
  transition: background-color 0.5s ease, border-color 0.6s;
}

@media (prefers-reduced-motion: reduce) {
  .cell,
  .solved .cell {
    transition: none;
  }
}

.help-row {
  display: inline-flex;
  border: 2px solid #6b7280;
  border-radius: 4px;
  overflow: hidden;
}

.help-row span {
  width: 1.5rem;
  height: 1.5rem;
  border-right: 1px solid #d1d5db;
  background-color: #ffffff;
}

.help-row span:last-child {
  border-right: none;
}

.help-row span.filled {
  background-color: #1f2937;
}

.dark .help-row span {
  border-color: #4b5563;
  background-color: #1f2937;
}

.dark .help-row span.filled {
  background-color: #e5e7eb;
}

.pop-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.pop-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
