// Nonogram puzzles: the Christmas pictures, random puzzles and a line solver that makes sure
// every puzzle can be solved by logic alone (no guessing, exactly one solution)

export const COLORS = {
  G: '#16a34a', // green
  R: '#dc2626', // red
  Y: '#facc15', // gold
  O: '#f97316', // orange
  B: '#a16207', // brown
  T: '#d6a46c', // antlers
  P: '#fcd5b0', // skin
  W: '#f1f5f9', // snow
  C: '#7dd3fc' // ice
}

// '.' is an empty cell, every letter a filled cell in that color (only shown once the puzzle is solved)
export const CHRISTMAS_PUZZLES = [
  // Leicht (the solver rates them, see DIFFICULTIES)
  {
    name: 'Geschenk',
    emoji: '🎁',
    picture: [
      '..Y.....Y..',
      '.YYY...YYY.',
      '..YYY.YYY..',
      '....YYY....',
      'RRRRRYRRRRR',
      'RRRRRYRRRRR',
      'YYYYYYYYYYY',
      'RRRRRYRRRRR',
      'RRRRRYRRRRR',
      'RRRRRYRRRRR',
      'RRRRRYRRRRR'
    ]
  },
  {
    name: 'Glocke',
    emoji: '🔔',
    picture: [
      '...RR.RR...',
      '....RRR....',
      '....YYY....',
      '...YYYYY...',
      '..YYYYYYY..',
      '..YYYYYYY..',
      '..YYYYYYY..',
      '..YYYYYYY..',
      '.YYYYYYYYY.',
      'YYYYYYYYYYY',
      'YYYYYYYYYYY',
      '.....B.....',
      '....BBB....'
    ]
  },
  {
    name: 'Kerze',
    emoji: '🕯️',
    picture: [
      '....O....',
      '...OYO...',
      '...OYO...',
      '....O....',
      '....B....',
      '..RRRRR..',
      '..RRRRR..',
      '..RRRRR..',
      '..RRRRR..',
      '..RRRRR..',
      '..RRRRR..',
      '.YYYYYYY.',
      'YYYYYYYYY'
    ]
  },
  {
    name: 'Weihnachtsmannmütze',
    emoji: '🎅',
    picture: [
      '.........WW.',
      '.......RRWW.',
      '.....RRRR...',
      '....RRRRR...',
      '...RRRRRR...',
      '..RRRRRRRR..',
      '..RRRRRRRR..',
      '.RRRRRRRRRR.',
      'WWWWWWWWWWWW',
      'WWWWWWWWWWWW'
    ]
  },
  // Mittel (the solver rates them, see DIFFICULTIES)
  {
    name: 'Tannenbaum',
    emoji: '🎄',
    picture: [
      '.....Y.....',
      '....YYY....',
      '.....G.....',
      '....GGG....',
      '...GRGGG...',
      '....GGG....',
      '...GGGYG...',
      '..GGGGGGG..',
      '.GRGGGGGRG.',
      'GGGGGYGGGGG',
      '....BBB....',
      '....BBB....'
    ]
  },
  {
    name: 'Schneemann',
    emoji: '⛄',
    picture: [
      '....RRR....',
      '....RRR....',
      '..RRRRRRR..',
      '...WWWWW...',
      '...W.W.W...',
      '...WWOWW...',
      '...WWWWW...',
      '..GGGGGGG..',
      '..WWWWWGW..',
      '.WWWWRWWGW.',
      '.WWWWWWWWW.',
      '.WWWWRWWWW.',
      '.WWWWWWWWW.',
      '..WWWWWWW..'
    ]
  },
  {
    name: 'Zuckerstange',
    emoji: '🍬',
    picture: [
      '...RWRW...',
      '..RWRWRW..',
      '.RW....RW.',
      '.WR....WR.',
      '.RW....RW.',
      '.......WR.',
      '.......RW.',
      '.......WR.',
      '.......RW.',
      '.......WR.',
      '.......RW.',
      '.......WR.'
    ]
  },
  {
    name: 'Lebkuchenmann',
    emoji: '🍪',
    picture: [
      '....BBB....',
      '...BBBBB...',
      '...B.B.B...',
      '...BBBBB...',
      '....BBB....',
      '.BBBBBBBBB.',
      'BBBBBWBBBBB',
      'BB.BBBBB.BB',
      '...BBWBB...',
      '...BBBBB...',
      '..BBB.BBB..',
      '..BB...BB..',
      '.BBB...BBB.'
    ]
  },
  // Schwer (the solver rates them, see DIFFICULTIES)
  {
    name: 'Stern',
    emoji: '⭐',
    picture: [
      '.....Y.....',
      '....YYY....',
      '....YYY....',
      'YYYYYYYYYYY',
      '.YYYYYYYYY.',
      '..YYYYYYY..',
      '...YYYYY...',
      '..YYYYYYY..',
      '..YYY.YYY..',
      '.YY.....YY.',
      '.Y.......Y.'
    ]
  },
  {
    name: 'Rentier',
    emoji: '🦌',
    picture: [
      'T.T.T...T.T.T',
      'TTTT.....TTTT',
      '..T.......T..',
      '..TT.....TT..',
      '...T.....T...',
      '....BBBBB....',
      'BB.BBBBBBB.BB',
      '.BBB.BBB.BBB.',
      '....BBBBB....',
      '....BBBBB....',
      '....BBBBB....',
      '.....RRR.....',
      '.....RRR.....'
    ]
  },
  {
    name: 'Schneeflocke',
    emoji: '❄️',
    picture: [
      '....C.C....',
      '.C...C...C.',
      'C.C..C..C.C',
      '.C.CCCCC.C.',
      '...CC.CC...',
      '..CC.C.CC..',
      '...CC.CC...',
      '.C.CCCCC.C.',
      'C.C..C..C.C',
      '.C...C...C.',
      '....C.C....'
    ]
  },
  {
    name: 'Engel',
    emoji: '👼',
    picture: [
      '....YYYYY....',
      '.............',
      '.....PPP.....',
      'C....PPP....C',
      'CC....W....CC',
      'C.C.WWWWW.C.C',
      'CC.WWWWWWW.CC',
      '.C..WWWWW..C.',
      '....W.W.W....',
      '...WWWWWWW...',
      '...W.W.W.W...',
      '..WWWWWWWWW..'
    ]
  }
]

// The clue of one line: the lengths of its runs of filled cells, [0] for an empty line
export function lineClue(line) {
  const clue = []
  let run = 0
  for (const filled of line) {
    if (filled) run++
    else if (run) {
      clue.push(run)
      run = 0
    }
  }
  if (run) clue.push(run)
  return clue.length ? clue : [0]
}

export function rowsOf(cells, rows, cols) {
  return Array.from({ length: rows }, (_, r) => cells.slice(r * cols, (r + 1) * cols))
}

export function columnsOf(cells, rows, cols) {
  return Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (_, r) => cells[r * cols + c]))
}

export function cluesOf(solution, rows, cols) {
  return {
    rowClues: rowsOf(solution, rows, cols).map(lineClue),
    colClues: columnsOf(solution, rows, cols).map(lineClue)
  }
}

// One pass over a line: tries every placement of the clue that fits the known cells
// (-1 unknown, 0 empty, 1 filled) and returns the cells that are the same in all of them,
// or null if no placement fits
function solveLine(clue, known) {
  const n = known.length
  const blocks = clue[0] === 0 ? [] : clue
  let common = null
  const line = new Array(n).fill(0)

  const place = (block, start) => {
    if (block === blocks.length) {
      for (let i = start; i < n; i++) if (known[i] === 1) return
      if (!common) common = line.slice()
      else for (let i = 0; i < n; i++) if (common[i] !== line[i]) common[i] = -1
      return
    }
    const length = blocks[block]
    let rest = 0
    for (let b = block + 1; b < blocks.length; b++) rest += blocks[b] + 1
    for (let pos = start; pos + length + rest <= n; pos++) {
      // Every cell skipped before the block is empty
      if (pos > start && known[pos - 1] === 1) break
      let fits = true
      for (let i = pos; i < pos + length; i++) if (known[i] === 0) { fits = false; break }
      if (fits && pos + length < n && known[pos + length] === 1) fits = false
      if (fits) {
        for (let i = pos; i < pos + length; i++) line[i] = 1
        place(block + 1, pos + length + 1)
        for (let i = pos; i < pos + length; i++) line[i] = 0
      }
    }
  }

  place(0, 0)
  return common
}

// Solves line by line, alternating sweeps over all rows and all columns until nothing changes.
// Returns null if that doesn't fill in the whole grid (guessing would be needed), otherwise how hard it was:
// how many sweeps it took and how much of the grid was already certain after the first sweep
export function lineSolve(rowClues, colClues) {
  const rows = rowClues.length
  const cols = colClues.length
  const grid = new Array(rows * cols).fill(-1)
  let sweeps = 0
  let firstSweepKnown = 0
  let changed = true

  while (changed) {
    changed = false
    for (let r = 0; r < rows; r++) {
      const known = grid.slice(r * cols, (r + 1) * cols)
      const result = solveLine(rowClues[r], known)
      if (!result) return null
      for (let c = 0; c < cols; c++) {
        if (known[c] === -1 && result[c] !== -1) {
          grid[r * cols + c] = result[c]
          changed = true
        }
      }
    }
    for (let c = 0; c < cols; c++) {
      const known = Array.from({ length: rows }, (_, r) => grid[r * cols + c])
      const result = solveLine(colClues[c], known)
      if (!result) return null
      for (let r = 0; r < rows; r++) {
        if (known[r] === -1 && result[r] !== -1) {
          grid[r * cols + c] = result[r]
          changed = true
        }
      }
    }
    if (changed) sweeps++
    if (sweeps === 1 && changed) firstSweepKnown = grid.filter((cell) => cell !== -1).length / grid.length
  }
  return grid.includes(-1) ? null : { sweeps, firstSweepKnown }
}

// How hard a puzzle is: the less is certain after the first sweep and the more sweeps it takes, the harder.
// Hard puzzles also need sparse grids: lots of small numbers give no foothold, big blocks almost solve themselves
export const DIFFICULTIES = [
  { id: 'easy', label: 'Leicht', maxScore: 0.35, density: [0.65, 0.75] },
  { id: 'medium', label: 'Mittel', maxScore: 0.7, density: [0.52, 0.62] },
  { id: 'hard', label: 'Schwer', maxScore: Infinity, density: [0.4, 0.5] }
]

function difficultyScore({ sweeps, firstSweepKnown }) {
  return 1 - firstSweepKnown + 0.08 * (sweeps - 1)
}

function difficultyOf(score) {
  return DIFFICULTIES.find((level) => score < level.maxScore).id
}

export function christmasPuzzle(index) {
  const { name, emoji, picture } = CHRISTMAS_PUZZLES[index]
  const rows = picture.length
  const cols = picture[0].length
  const letters = picture.join('').split('')
  const solution = letters.map((letter) => letter !== '.')
  const { rowClues, colClues } = cluesOf(solution, rows, cols)
  return {
    rows,
    cols,
    name,
    emoji,
    difficulty: difficultyOf(difficultyScore(lineSolve(rowClues, colClues))),
    solution,
    colors: letters.map((letter) => COLORS[letter] ?? null)
  }
}

// A random picture of the wanted difficulty that can be solved without guessing; colored from red over gold
// to green once solved. Small grids can't get very hard, then it settles for the closest one it found
export function randomPuzzle(rows, cols, difficulty) {
  const level = DIFFICULTIES.findIndex((entry) => entry.id === difficulty)
  const minScore = level > 0 ? DIFFICULTIES[level - 1].maxScore : 0
  const maxScore = DIFFICULTIES[level].maxScore
  const [minDensity, maxDensity] = DIFFICULTIES[level].density
  const deadline = Date.now() + 200
  let best = null

  for (let attempt = 0; attempt < 2000 || !best; attempt++) {
    // Fall back to fuller grids if the sparse ones keep needing guesses
    const density = best || Date.now() < deadline ? minDensity + Math.random() * (maxDensity - minDensity) : 0.7
    const solution = Array.from({ length: rows * cols }, () => Math.random() < density)
    if (!solution.some(Boolean)) continue
    const { rowClues, colClues } = cluesOf(solution, rows, cols)
    const result = lineSolve(rowClues, colClues)
    if (!result) continue

    const score = difficultyScore(result)
    const distance = Math.max(0, minScore - score, score - maxScore + 1e-9)
    if (!best || distance < best.distance) best = { solution, score, distance }
    if (distance === 0 || Date.now() > deadline) break
  }

  const solution = best.solution
  const festive = ['#dc2626', '#f97316', '#facc15', '#22c55e', '#16a34a']
  const span = Math.max(1, rows + cols - 2)
  return {
    rows,
    cols,
    name: null,
    emoji: null,
    difficulty: difficultyOf(best.score),
    solution,
    colors: solution.map((_, i) => festive[Math.round(((Math.floor(i / cols) + (i % cols)) / span) * (festive.length - 1))])
  }
}
