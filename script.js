const state = {
  day1: null,
  day2: null,
  day3: null
}

let bosses = {}
let roster = []

let index = {}

let day1Cards = []
let day2Cards = []
let day3Cards = []

async function loadData() {

  const bossesData = await fetch("./bosses.json").then(r => r.json())
  const rosterData = await fetch("./roster.json").then(r => r.json())

  bosses = bossesData.bosses
  roster = rosterData.roster

}

function getBossList(day) {

  return Object.keys(bosses[`day${day}`])

}

function add(map, key, value) {

  if (!map.has(key))
    map.set(key, new Set())

  map.get(key).add(value)

}

function buildIndex() {

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

  for (const r of roster) {

    const [d1, d2, d3] = r

    add(idx.day1_to_day2, d1, d2)
    add(idx.day1_to_day3, d1, d3)

    add(idx.day2_to_day1, d2, d1)
    add(idx.day2_to_day3, d2, d3)

    add(idx.day3_to_day1, d3, d1)
    add(idx.day3_to_day2, d3, d2)

    idx.all_day1.add(d1)
    idx.all_day2.add(d2)
    idx.all_day3.add(d3)

  }

  return idx

}

function intersect(a, b) {

  if (!a) return b
  if (!b) return a

  const out = new Set()

  for (const v of a)
    if (b.has(v))
      out.add(v)

  return out

}

function createCards(container, list, type) {

  list.forEach(id => {

    const card = document.createElement("div")

    card.className = "card"
    card.textContent = bosses[type][id].name_ja

    card.dataset.id = id
    card.dataset.type = type

    card.onclick = () => {

      if (state[type] === id) {

        state[type] = null
        card.classList.remove("selected")

      } else {

        state[type] = id

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

function updateCards(cards, valid) {

  cards.forEach(card => {

    const id = card.dataset.id

    if (valid && valid.has(id))
      card.classList.remove("disabled")
    else
      card.classList.add("disabled")

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


async function init() {

  await loadData()

  index = buildIndex()

  const day1List = getBossList(1)
  const day2List = getBossList(2)
  const day3List = getBossList(3)

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