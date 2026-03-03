const state = {

  day1: null,
  day2: null,
  day3: null

}

let data = []

let day1Cards = []
let day2Cards = []
let day3Cards = []

function parseCSV(text) {

  const lines = text.split(/\r?\n/)

  return lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {

      const parts = line.split(/\s*,\s*/)

      return {

        day1: parts[0],
        day2: parts[1],
        day3: parts[2]

      }

    })

}

function unique(list, key) {

  return [...new Set(list.map(v => v[key]))]

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

  const filtered = data.filter(row => {

    if (state.day1 && row.day1 !== state.day1) return false
    if (state.day2 && row.day2 !== state.day2) return false
    if (state.day3 && row.day3 !== state.day3) return false

    return true

  })

  const validDay1 = new Set(filtered.map(r => r.day1))
  const validDay2 = new Set(filtered.map(r => r.day2))
  const validDay3 = new Set(filtered.map(r => r.day3))

  updateCards(day1Cards, validDay1)
  updateCards(day2Cards, validDay2)
  updateCards(day3Cards, validDay3)

}

function updateCards(cards, valid) {

  cards.forEach(card => {

    const name = card.dataset.name

    if (valid.has(name)) {

      card.classList.remove("disabled")

    } else {

      card.classList.add("disabled")

    }

  })

}

async function init() {

  const text = await fetch("roster_ja-JP.csv").then(r => r.text())

  data = parseCSV(text)

  const day1List = unique(data, "day1").sort()
  const day2List = unique(data, "day2").sort()
  const day3List = unique(data, "day3").sort()

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
