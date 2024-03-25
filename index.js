const pause = document.querySelector("#pause")
const start = document.querySelector("#start")
const resetGame = document.querySelector("#reset-game")
const lightModeBoxColor = 100;
const darkModeBoxColor = 200;
const settingBtn = document.querySelector("#setting-icon")
const settingPage = document.querySelector("#setting-page")
const closeSetting = document.querySelector(".btn-close")
const submit = document.querySelector("#submit")
const cancel = document.querySelector("#cancel")
const switchModeBtn = document.querySelector(".toggle-switch")
const colorPicker = document.querySelector("#color-picker")
const checkbox = document.querySelector(".check")
const randomBtn = document.querySelector("#random")
const controlMode = document.querySelector("#control-mode")
const patterns = document.querySelectorAll('.pattern')
const next = document.querySelector("#next")


let middleX
let middleY
let keyboardMode = false
let randomMode = false
let drawColor
let colorTheme = "#FFFFFF"
let darkMode = true
let started = false
let emptyColor = "#000000"
let filledColor = "#FFFFFF"
let strokeColor = "#FFFFFF"
let loneliness = 2
let overpopulation = 3
let reproduction = 3
let canvaBackgroundColor = "#171717"
let columns;
let rows;
let currentBoard;
let nextBoard;
let scale
let speed
let unitLength

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

// <----------------------------- Change color format -----------------------------> 
let list = "0123456789ABCDEF"
list = list.split("")
let hexValuePair = {}
for (let i = 0; i < list.length; i++) {
  hexValuePair[list[i]] = i
}
let valueHexPair = {}
for (var key in hexValuePair) {            // numbers (0-15) to hex value
  valueHexPair[hexValuePair[key]] = key;
}

function hexToRgb(hex) {
  let list = hex.toUpperCase().split("")
  let R = list.slice(1, 3)
  let G = list.slice(3, 5)
  let B = list.slice(5, 8)
  R = hexValuePair[R[0]] * 16 + hexValuePair[R[1]]
  G = hexValuePair[G[0]] * 16 + hexValuePair[G[1]]
  B = hexValuePair[B[0]] * 16 + hexValuePair[B[1]]
  return {
    hexValue: hex,
    RGB: [R, G, B],
    constrastColor: [255 - R, 255 - G, 255 - B],
    darkenColor: [R < 50 ? 0 : R - 50, G < 50 ? 0 : G - 50, B < 50 ? 0 : B - 50]
  }
}

function componentToHex(color) {
  var hex = color.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


// <----------------------------- initial Setup -----------------------------> 
function setup() {
  const canvas = createCanvas(windowWidth - 30, windowHeight - 200);
  canvas.parent(document.querySelector("#canvas"));
  setCondition()
  middleX = Math.floor((width / 2) / unitLength)
  middleY = Math.floor((height / 2) / unitLength)
  noLoop()
}

// <----------------------------- Change Condition -----------------------------> 
function setCondition() {
  loneliness = parseInt(document.querySelector("#loneliness").firstElementChild.innerHTML)
  overpopulation = parseInt(document.querySelector("#overpopulation").firstElementChild.innerHTML)
  reproduction = parseInt(document.querySelector("#reproduction").firstElementChild.innerHTML)
  scale = parseInt(document.querySelector("#scale-bar").value)
  speed = parseInt(document.querySelector("#speed-bar").value)

  unitLength = 20 * (scale / 100);
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);
  currentBoard = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = randomMode ? (random() > 0.8 ? 1 : 0) : 0
      nextBoard[i][j] = 0;
    }
  }
  frameRate(speed)
  redraw()
}

window.addEventListener("resize", function () {
  resizeCanvas(windowWidth - 30, windowHeight - 200);
  setCondition()
})

// <----------------------------- Print image based on frame rate -----------------------------> 
function printCanvas() {


  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (currentBoard[i][j] == 1) {
        fill(filledColor);
      }
      else if (currentBoard[i][j] == 2) {
        fill(hexToRgb(filledColor).darkenColor)
      }
      else {
        fill(emptyColor);
      }
      stroke(strokeColor)
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
}

function draw() {
  background(canvaBackgroundColor);
  generate();
  printCanvas()
}

// <----------------------------- Game Logic -----------------------------> 
function generate() {
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (i == 0 && j == 0) {
            continue;
          }
          if (currentBoard[(x + i + columns) % columns][(y + j + rows) % rows]) {
            neighbors += 1
          }
        }
      }

      if (currentBoard[x][y] >= 1 && neighbors < loneliness) {
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] >= 1 && neighbors > overpopulation) {
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] == 0 && neighbors == reproduction) {
        nextBoard[x][y] = 1;
      } else {
        nextBoard[x][y] = currentBoard[x][y];
      }
      if (nextBoard[x][y] >= 1 && currentBoard[x][y] >= 1) {
        nextBoard[x][y] = 2
      }

    }
  }

  [currentBoard, nextBoard] = [nextBoard, currentBoard];
}

// <----------------------------- Fill Color ----------------------------->

function mouseDragged() {
  if (!started && !keyboardMode) {
    if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
      return;
    }
    const x = Math.floor(mouseX / unitLength);
    const y = Math.floor(mouseY / unitLength);
    currentBoard[x][y] = 1;
    fill(filledColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
    noLoop()
  }
}

function mousePressed() {
  mouseDragged();
}

// <----------------------------- Set Button Event Listener ----------------------------->

resetGame.addEventListener("click", function () {
  started = false
  randomMode = false
  setCondition()
});

start.addEventListener("click", function () {
  started = true

  loop();
});

pause.addEventListener("click", function () {
  started = false
  noLoop();
});

settingBtn.addEventListener("click", function () {
  started = true
  settingPage.classList.toggle("hide")
  noLoop()
});

closeSetting.addEventListener("click", function (e) {
  settingPage.classList.add("hide")
})

next.addEventListener("click", function (e) {
  redraw()
})

cancel.addEventListener("click", function () {
  started = false
  settingPage.classList.add("hide")
})
submit.addEventListener("click", function () {
  if (loneliness < overpopulation) {
    settingPage.classList.add("hide")
    setCondition()
    noLoop()
  } else {
    document.querySelector(".error").classList.remove("hide")
  }
})


randomBtn.addEventListener("click", function () {
  if (started == false) {
    randomMode = true
    setCondition()
    noLoop()
  }
})

//  <----------------------------- Change Rule ----------------------------->

let ups = document.querySelectorAll(".up")
ups.forEach(function (up) {
  up.addEventListener("click", function (e) {
    switch (Array.from(ups).indexOf(up)) {
      case 0:
        loneliness += 1
        document.querySelector("#loneliness").firstElementChild.innerHTML = loneliness
        break
      case 1:
        overpopulation += 1
        document.querySelector("#overpopulation").firstElementChild.innerHTML = overpopulation
        break
      case 2:
        reproduction += 1
        document.querySelector("#reproduction").firstElementChild.innerHTML = reproduction
    }
  })
});

let downs = document.querySelectorAll(".down")
downs.forEach(function (down) {
  down.addEventListener("click", function (e) {
    switch (Array.from(downs).indexOf(down)) {
      case 0:
        loneliness -= 1
        document.querySelector("#loneliness").firstElementChild.innerHTML = loneliness
        break
      case 1:
        overpopulation -= 1
        document.querySelector("#overpopulation").firstElementChild.innerHTML = overpopulation
        break
      case 2:
        reproduction -= 1
        document.querySelector("#reproduction").firstElementChild.innerHTML = reproduction
    }
  })
});



// <----------------------------- Night Mode ----------------------------->

const backgroundDark = document.querySelectorAll(".background-dark")
const arrowDark = document.querySelectorAll(".arrow-dark")
const btnDark = document.querySelectorAll(".btn-dark")
const fontDark = document.querySelectorAll(".font-dark")
function switchMode(list, selector) {
  list.forEach(function (elem) {
    elem.classList.toggle(`${selector}`)
  })
}

switchModeBtn.addEventListener("change", function () {
  switchMode(backgroundDark, "background-dark")
  switchMode(arrowDark, "arrow-dark")
  switchMode(btnDark, "btn-dark")
  switchMode(fontDark, "font-dark")

  if (darkMode) {
    canvaBackgroundColor = "#FFFFFF"
    emptyColor = "#FFFFFF"
    strokeColor = "#000000"
    filledColor = "#000000"
  } else {
    canvaBackgroundColor = "#000000"
    emptyColor = "#000000"
    strokeColor = "#FFFFFF"
    filledColor = "#FFFFFF"
  }
  redraw()
  darkMode = !darkMode
})

// <----------------------------- Different Color Theme ----------------------------->

colorGroup = [emptyColor,filledColor,hexToRgb(filledColor).darkenColor]

colorPicker.addEventListener("change", function () {
  colorGroup.push(colorPicker.value)
  colorTheme = hexToRgb(colorPicker.value).hexValue
  let constrastColor = hexToRgb(colorPicker.value).constrastColor
  filledColor = colorTheme

  strokeColor = constrastColor

  fontDark.forEach(function (elem) {
    elem.style.color = colorTheme
  })
  arrowDark.forEach(function (elem) {
    elem.style.color = `rgb(${constrastColor[0]},${constrastColor[1]},${constrastColor[2]})`
    elem.style.backgroundColor = colorTheme

  })
  // not finished yet
  btnDark.forEach(function (elem) {
    elem.style.color = `${colorTheme} !important`
    elem.style.backgroundColor = `rgb(${constrastColor[0]},${constrastColor[1]},${constrastColor[2]}) !important`
  })
  printCanvas()
})
// <----------------------------- Keyboard Control ----------------------------->


document.body.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (!keyboardMode) {
      controlMode.innerHTML = "Keyboard Mode<br>Use WASD to move"
    } else {
      controlMode.innerHTML = "Mouse Mode"
    } keyboardMode = !keyboardMode
  }
  if (keyboardMode) {
    if (event.key === 'w') {
      // currentBoard[middleX][middleY-1] = 1
      middleY = (middleY - 1 + rows) % rows
    } else if (event.key === 'a') {
      // currentBoard[middleX-1][middleY] = 1
      middleX = (middleX - 1 + columns) % columns
    } else if (event.key === 's') {
      // currentBoard[middleX][middleY+1] = 1
      middleY = (middleY + 1 + rows) % rows
    } else if (event.key === 'd') {
      // currentBoard[middleX+1][middleY] = 1
      middleX = (middleX + 1 + columns) % columns
    }
    currentBoard[middleX][middleY] = 1
    fill(filledColor)
    rect(middleX * unitLength, middleY * unitLength, unitLength, unitLength);

    if (event.key === ' ') {
      if (started) {
        noLoop()
      } else (
        loop()
      )
      started = !started
    }
  }
});

// <----------------------------- Pattern ----------------------------->
let commonPattern = {
  AK_94:
    `.......O.......O.......OO.............
.......OOO.....OOO.....OO.............
..........O.......O...................
.........OO......OO................OO.
..............................OO..O..O
..............................O.O..OO.
.................................OO...
.....O............................O...
.....OOO..........................O.OO
........O......................OO.O..O
.......OO......................OO.OO..
......................................
......................................
.................O....................
..OO.OO.........O.O..........OO.......
O..O.OO........O...O.........O........
OO.O...........O...O..........OOO.....
...O...........O...O............O.....
...OO...........O.O...................
.OO..O.O.........O....................
O..O..OO..............................
.OO................OO.................
...................O..................
.............OO.....OOO...............
.............OO.......O...............`,
  Lightweight_Spaceship:
    `.....................O...
..................OOOO...
.............O..O.OO.....
.............O...........
OOOO........O...O.OO.....
O...O.....OO.OO.O.O.OOOOO
O.........OO.O.O.O..OOOOO
.O..O..OO..O...OOO..O.OO.
......O..O.OO............
......O....OO............
......O..O.OO............
.O..O..OO..O...OOO..O.OO.
O.........OO.O.O.O..OOOOO
O...O.....OO.OO.O.O.OOOOO
OOOO........O...O.OO.....
.............O...........
.............O..O.OO.....
..................OOOO...
.....................O...`,
  Eater_2:
    `..................O..
..................O.O
..................OO.
.....................
.....................
................O....
................O.O..
................OO...
...........O.........
...........O.O.......
...........OO........
.....................
........O............
........O.O..........
........OO...........
...O.OO..............
.OOO.OO..............
O....................
.OOO.OO..............
...O.O...............
...O.O...............
....O................`
}
patterns.forEach(function (pattern) {
  pattern.addEventListener("click", function () {
    setCondition()  
    let shape = commonPattern[pattern.innerHTML]
    shape = shape.replaceAll(".", "0").replaceAll('O', '1').replaceAll(" ", "").split("\n")
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        currentBoard[j][i] = parseInt(shape[i][j])
      }
    }
    printCanvas()
  })
})



// <----------------------------- Debug ----------------------------->

checkbox.addEventListener("click", function () {
  console.log(patterns);

})