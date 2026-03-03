const state = { day1: null, day2: null }

let tree = null

async function loadCSV(path) {
  let text = await fetch(path).then(r => r.text())

  text = text.replace(/^\uFEFF/, '')
  const lines = text.split(/\r?\n/)
  const rows = []
  for (const line of lines) {
    if (!line.trim()) continue
    const c = line.split(",")
    if (c.length < 3) continue
    rows.push({
      day1: c[0], day2: c[1], day3: c[2]
    })
  }

  return rows
}

function buildTree(rows) {
  const map = {}
  for (const r of rows) {
    if (!map[r.day1])
      map[r.day1] = {}
    if (!map[r.day1][r.day2])
      map[r.day1][r.day2] = []

    map[r.day1][r.day2].push(r.day3)
  }

  return map
}

function card(text, click) {
  const d = document.createElement("div")
  d.className = "card"
  d.textContent = text

  d.onclick = click

  return d
}

function refreshSelection() {
  document.querySelectorAll("#day1Grid .card").forEach(c => {
    c.classList.toggle("selected", c.textContent === state.day1)
  })
  document.querySelectorAll("#day2Grid .card").forEach(c => {
    c.classList.toggle("selected", c.textContent === state.day2)
  })
}

function showDay1() {
  const g = document.getElementById("day1Grid")
  g.innerHTML = ""
  for (const b in tree) {
    g.appendChild(
      card(b, () => toggleDay1(b))
    )
  }

  refreshSelection()
}

function showDay2() {
  const g = document.getElementById("day2Grid")
  g.innerHTML = ""

  // when no first-day is chosen, show all unique second-day options
  if (!state.day1) {
    const set = new Set()
    for (const d1 in tree) {
      for (const d2 in tree[d1]) {
        set.add(d2)
      }
    }
    for (const d2 of set) {
      g.appendChild(card(d2, () => toggleDay2(d2)))
    }
    refreshSelection()
    return
  }

  for (const d in tree[state.day1]) {
    g.appendChild(
      card(d, () => toggleDay2(d))
    )
  }

  refreshSelection()
}

function showDay3() {
  const g = document.getElementById("day3Grid")
  g.innerHTML = ""

  let list = []

  if (state.day1) {
    if (state.day2) {
      list = tree[state.day1][state.day2] || []
    } else {
      for (const d in tree[state.day1])
        list = list.concat(tree[state.day1][d])
      list = [...new Set(list)]
    }
  } else {
    // no day1 selected: show all possible day3s, optionally filtered by day2 if chosen
    if (state.day2) {
      for (const d1 in tree) {
        if (tree[d1][state.day2]) {
          list = list.concat(tree[d1][state.day2])
        }
      }
    } else {
      for (const d1 in tree) {
        for (const d2 in tree[d1]) {
          list = list.concat(tree[d1][d2])
        }
      }
    }
    list = [...new Set(list)]
  }

  for (const n of list) {
    g.appendChild(card(n, null))
  }
}

function toggleDay1(b) {
  if (state.day1 === b) {
    state.day1 = null
    state.day2 = null
  } else {
    state.day1 = b
    state.day2 = null
  }

  updateUI()
}

function toggleDay2(d) {
  if (state.day2 === d) {
    state.day2 = null
  } else {
    state.day2 = d
  }

  updateUI()
}

function updateUI() {
  showDay1()
  showDay2()
  showDay3()
}

async function init() {
  const rows = await loadCSV("roster_ja-JP.csv")

  tree = buildTree(rows)

  updateUI()
}

init()
