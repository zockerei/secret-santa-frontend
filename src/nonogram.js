// Nonogram puzzles: the Christmas pictures, random puzzles and a line solver that makes sure
// every puzzle can be solved by logic alone (no guessing, exactly one solution)

export const COLORS = {
  G: '#16a34a', // green
  D: '#166534', // dark green
  R: '#dc2626', // red
  Y: '#facc15', // gold
  O: '#f97316', // orange
  B: '#a16207', // brown
  W: '#f1f5f9', // snow
  C: '#7dd3fc' // ice
}

// '.' is an empty cell, every letter a filled cell in that color (only shown once the puzzle is solved)
export const CHRISTMAS_PUZZLES = [
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
    name: 'Christbaumkugel',
    emoji: '🔴',
    picture: [
      '.....Y.....',
      '....Y.Y....',
      '....YYY....',
      '..RRRRRRR..',
      '.RRRRRRRRR.',
      '.RRRRRRRRR.',
      'Y.Y.Y.Y.Y.Y',
      'RRRRRRRRRRR',
      '.Y.Y.Y.Y.Y.',
      '.RRRRRRRRR.',
      '..RRRRRRR..',
      '...RRRRR...'
    ]
  },
  {
    name: 'Schneeflocke',
    emoji: '❄️',
    picture: [
      '.....C.....',
      '..C..C..C..',
      '.CCC.C.CCC.',
      '..CCC.CCC..',
      '...C.C.C...',
      'CCC.CCC.CCC',
      '...C.C.C...',
      '..CCC.CCC..',
      '.CCC.C.CCC.',
      '..C..C..C..',
      '.....C.....'
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
  {
    name: 'Lebkuchenhaus',
    emoji: '🏠',
    picture: [
      '.....WW.....',
      '....WRRW....',
      '...WRRRRW...',
      '..WRRRRRRW..',
      '.WRRRRRRRRW.',
      'WWWWWWWWWWWW',
      '.BBBBBBBBBB.',
      '.B..BBBB..B.',
      '.B..B..B..B.',
      '.BBBB..BBBB.',
      '.BBBB..BBBB.'
    ]
  },
  {
    name: 'Nikolausstiefel',
    emoji: '🥾',
    picture: [
      '.WWWWWW...',
      '.WWWWWW...',
      '.RRRRRR...',
      '.RRRRRR...',
      '.RRRRRR...',
      '.RRRRRR...',
      '.RRRRRR...',
      '.RRRRRRR..',
      '.RRRRRRRRR',
      '.RRRRRRRRR',
      '..RRRRRRRR'
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

// Solves line by line until nothing changes; true if that fills in the whole grid
export function isLineSolvable(rowClues, colClues) {
  const rows = rowClues.length
  const cols = colClues.length
  const grid = new Array(rows * cols).fill(-1)
  let changed = true

  while (changed) {
    changed = false
    for (let r = 0; r < rows; r++) {
      const known = grid.slice(r * cols, (r + 1) * cols)
      const result = solveLine(rowClues[r], known)
      if (!result) return false
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
      if (!result) return false
      for (let r = 0; r < rows; r++) {
        if (known[r] === -1 && result[r] !== -1) {
          grid[r * cols + c] = result[r]
          changed = true
        }
      }
    }
  }
  return !grid.includes(-1)
}

export function christmasPuzzle(index) {
  const { name, emoji, picture } = CHRISTMAS_PUZZLES[index]
  const rows = picture.length
  const cols = picture[0].length
  const letters = picture.join('').split('')
  return {
    rows,
    cols,
    name,
    emoji,
    solution: letters.map((letter) => letter !== '.'),
    colors: letters.map((letter) => COLORS[letter] ?? null)
  }
}

// A random picture that can be solved without guessing; colored from red over gold to green once solved
export function randomPuzzle(rows, cols) {
  let solution
  for (let attempt = 0; attempt < 300; attempt++) {
    const density = 0.5 + Math.random() * 0.15
    solution = Array.from({ length: rows * cols }, () => Math.random() < density)
    if (!solution.some(Boolean)) continue
    const { rowClues, colClues } = cluesOf(solution, rows, cols)
    if (isLineSolvable(rowClues, colClues)) break
  }
  const festive = ['#dc2626', '#f97316', '#facc15', '#22c55e', '#16a34a']
  const span = Math.max(1, rows + cols - 2)
  return {
    rows,
    cols,
    name: null,
    emoji: null,
    solution,
    colors: solution.map((_, i) => festive[Math.round(((Math.floor(i / cols) + (i % cols)) / span) * (festive.length - 1))])
  }
}
