const state = {

  day1: null,
  day2: null,
  day3: null

}

let orderMap = {

  day1: new Map(),
  day2: new Map(),
  day3: new Map()

}

async function loadBossOrder() {

  const res = await fetch("boss_order_ja-JP.json")
  const json = await res.json()

  buildOrderMap("day1", json.day1)
  buildOrderMap("day2", json.day2)
  buildOrderMap("day3", json.day3)

}

function buildOrderMap(day, list) {

  list.forEach((name, index) => { orderMap[day].set(name.trim(), index) })

}

function sortBossList(day, list) {

  const map = orderMap[day]

  return list.sort((a, b) => {
    const ai = map.get(a) ?? Number.MAX_SAFE_INTEGER
    const bi = map.get(b) ?? Number.MAX_SAFE_INTEGER
    return ai - bi
  })

}

let index = {}

let day1Cards = []
let day2Cards = []
let day3Cards = []

function parseCSV(text) {

  const lines = text.split(/\r?\n/)

  return lines
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(line => {

      const [day1, day2, day3] = line.split(/\s*,\s*/)

      return { day1, day2, day3 }

    })

}

function add(map, key, value) {

  if (!map.has(key)) map.set(key, new Set())

  map.get(key).add(value)

}

function buildIndex(data) {

  const idx = {

    day1_to_day2: new Map(),
    day1_to_day3: new Map(),

    day2_to_day1: new Map(),
    day2_to_day3: new Map(),

    day3_to_day1: new Map(),
    day3_to_day2: new Map(),

    all_day1: new Set(),
    all_day2: new Set(),
    all_day3: new Set()

  }

  for (const r of data) {

    add(idx.day1_to_day2, r.day1, r.day2)
    add(idx.day1_to_day3, r.day1, r.day3)

    add(idx.day2_to_day1, r.day2, r.day1)
    add(idx.day2_to_day3, r.day2, r.day3)

    add(idx.day3_to_day1, r.day3, r.day1)
    add(idx.day3_to_day2, r.day3, r.day2)

    idx.all_day1.add(r.day1)
    idx.all_day2.add(r.day2)
    idx.all_day3.add(r.day3)

  }

  return idx

}

function intersect(a, b) {

  if (!a) return b
  if (!b) return a

  const out = new Set()

  for (const v of a) if (b.has(v)) out.add(v)

  return out

}

function createCards(container, names, type) {

  names.forEach(name => {

    const card = document.createElement("div")

    card.className = "card"
    card.textContent = name

    card.dataset.name = name
    card.dataset.type = type

    card.onclick = () => {

      if (state[type] === name) {

        state[type] = null
        card.classList.remove("selected")

      } else {

        state[type] = name

        document
          .querySelectorAll(`[data-type="${type}"]`)
          .forEach(c => c.classList.remove("selected"))

        card.classList.add("selected")

      }

      update()

    }

    container.appendChild(card)

  })

}

function update() {

  let day1Candidates = index.all_day1
  let day2Candidates = index.all_day2
  let day3Candidates = index.all_day3

  if (state.day1) {

    day2Candidates = intersect(day2Candidates, index.day1_to_day2.get(state.day1))
    day3Candidates = intersect(day3Candidates, index.day1_to_day3.get(state.day1))

  }

  if (state.day2) {

    day1Candidates = intersect(day1Candidates, index.day2_to_day1.get(state.day2))
    day3Candidates = intersect(day3Candidates, index.day2_to_day3.get(state.day2))

  }

  if (state.day3) {

    day1Candidates = intersect(day1Candidates, index.day3_to_day1.get(state.day3))
    day2Candidates = intersect(day2Candidates, index.day3_to_day2.get(state.day3))

  }

  updateCards(day1Cards, day1Candidates)
  updateCards(day2Cards, day2Candidates)
  updateCards(day3Cards, day3Candidates)

}

function updateCards(cards, valid) {

  cards.forEach(card => {

    const name = card.dataset.name

    if (valid && valid.has(name)) card.classList.remove("disabled")
    else card.classList.add("disabled")

  })

}

async function init() {

  const text = await fetch("roster_ja-JP.csv").then(r => r.text())

  const data = parseCSV(text)

  index = buildIndex(data)

  const day1List = sortBossList("day1", [...index.all_day1])
  const day2List = sortBossList("day2", [...index.all_day2])
  const day3List = sortBossList("day3", [...index.all_day3])

  const day1Div = document.getElementById("day1")
  const day2Div = document.getElementById("day2")
  const day3Div = document.getElementById("day3")

  createCards(day1Div, day1List, "day1")
  createCards(day2Div, day2List, "day2")
  createCards(day3Div, day3List, "day3")

  day1Cards = [...day1Div.children]
  day2Cards = [...day2Div.children]
  day3Cards = [...day3Div.children]

  update()

}

init()
