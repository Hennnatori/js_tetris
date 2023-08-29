//エレメント
const gameBoardElm = document.querySelector('#boad');
const scoreElm = document.querySelector('#score');
const moveLeftButton = document.getElementById("#moveLeft");
const moveRightButton = document.getElementById("#moveRight");
const moveDownButton = document.getElementById("#moveDown");
const rotateButton = document.getElementById("#rotate");
const startButton = document.getElementById("#start");

//ステージの大きさ
const ROWS = 20;
const COLUMNS = 11;

//ルール
const BASE_POINT = 100;
const TIMER = 1000;

//テトリミノ
const SHAPE_LISTS = [
  // I
  [[1, 1, 1, 1],[0, 0, 0, 0],[0, 0, 0, 0],[0, 0, 0, 0]],
  // O
  [[1, 1],[1, 1]],
  // T
  [[1, 1, 1],[0, 1, 0],[0, 0, 0]],
  // S
  [[0, 1, 1],[1, 1, 0],[0, 0, 0]],
  // Z
  [[1, 1, 0],[0, 1, 1],[0, 0, 0]],
  // J
  [[1, 0, 0],[1, 1, 1],[0, 0, 0]],
  // L
  [[0, 0, 1],[1, 1, 1],[0, 0, 0]]
];

//構造体のようなもの
function Shape(_array, _row, _col) {
  this.array = _array;
  this.row = _row;
  this.col = _col;
}
let currentShape;

//諸々の変数
const table = Array.from(new Array(ROWS), () => new Array(COLUMNS).fill());
let score;
let gameOn;
let timerHandler;

//テトリミノ回転
function RotateShape(_shape)
{
  const n = _shape.array.length - 1;

  _shape.array = _shape.array.map((row, i) => row.map((val, j) => _shape.array[n - j][i]));
}

//当たり判定
function CheckPosition(_shape)
{
  const array = _shape.array;
  const row = _shape.row;
  const col = _shape.col;

  for(let i = 0; i < _shape.array.length; i++)
  {
    for(let j = 0; j < _shape.array.length; j++)
    {
      if (array[i][j])
      {
        const newRow = row + i;
        const newCol = col + j;

        if(newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLUMNS)
        {
          if (array[i][j])
          {
            return false;
          }
        }

        if (table[newRow][newCol] && array[i][j])
        {
          return false;
        }
      }
    }
  }
  return true;
}

//揃った行判定
function CheckFilledLines()
{
  let count = 0;
  for (let i = 0; i < ROWS; i++)
  {
    let sum = table[i].reduce((acc, val) => acc + val, 0);
    if (sum == COLUMNS)
    {
      count++;
      for(let j = i; j >= 1; j--)
      {
        table[j] = [...table[j - 1]];
      }
      table[0] = Array(COLUMNS).fill(0);
    }
  }

  score += BASE_POINT * (count * count);
}


//テトリミノ生成
function GetNewShape()
{
  const randomIndex = Math.floor(Math.random() * SHAPE_LISTS.length);
  const shapeArray = SHAPE_LISTS[randomIndex];

  const newShape = new Shape(shapeArray, 0, Math.floor(Math.random() * (COLUMNS - shapeArray.length + 1)));

  if (!CheckPosition(newShape))
  {
    StopGame();
  }
  else
  {
    currentShape = newShape;
  }
}

//テトリミノ
function WriteToTable()
{
  for(let i = 0; i < currentShape.array.length; i++)
  {
    for(let j = 0; j < currentShape.array.length; j++)
    {
      if(currentShape.array[i][j])
      {
        const newRow = currentShape.row + i;
        const newCol = currentShape.col + j;
        table[newRow][newCol] = currentShape.array[i][j];
      }
    }
  }
}

//画面描画
function PrintTable()
{
  gameBoardElm.innerHTML = "";

  const buffer = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

  for(let i = 0; i < currentShape.array.length; i++)
  {
    for(let j = 0; j < currentShape.array.length; j++)
    {
      if (currentShape.array[i][j])
      {
          buffer[currentShape.row + i][currentShape.col + j] = currentShape.array[i][j];
      }
    }
  }

  for(let i = 0; i < ROWS; i++)
    {
      for(j = 0; j < COLUMNS; j++)
      {
        
        gameBoardElm.insertAdjacentHTML("beforeend", table[i][j] + buffer[i][j] == 0 ? "▫︎" : "▪︎" );
      };
      
      gameBoardElm.insertAdjacentHTML("beforeend", "<br>" );
    };

  scoreElm.textContent = `Score: ${score}`;
};

function MoveLeft()
{
  const temp = {...currentShape};

  temp.col--;
  if(CheckPosition(temp))
  {
    currentShape.col--;
    PrintTable();
  }
}

function MoveRight()
{
  const temp = {...currentShape};

  temp.col++;
  if(CheckPosition(temp))
  {
    currentShape.col++;
    PrintTable();
  }
}

function MoveDown()
{
  const temp = {...currentShape};

  temp.row++;
  if (CheckPosition(temp))
  {
    currentShape.row++;
    PrintTable();
  }
  else
  {
    WriteToTable();
    CheckFilledLines();
    GetNewShape();
    PrintTable();
  }
}

function MoveRotation()
{
  const temp = {...currentShape};

  RotateShape(temp);
  if(CheckPosition(temp))
  {
    RotateShape(currentShape);
    PrintTable();
  }
}

function InitializeGame()
{
  table.forEach((elem, i) => table[i].fill(0));
  score = 0;
  gameOn = false;
  currentShape = {array: [], width: 0, row: 0, col: 0 };

  startButton.textContent = "Start";

  PrintTable();
}

function StartGame()
{
  gameOn = true;
  startButton.textContent = "Playing";
  GetNewShape();
  PrintTable();
  //SetTimeOutを再起的に呼び出したほうがいい気もする。
  timerHandler = setInterval(GameMainLoop, TIMER);
}

function StopGame()
{
  clearInterval(timerHandler);
  startButton.textContent = "Reset";
  gameOn = false;
}

function GameMainLoop()
{
  MoveDown();
}

moveLeftButton.addEventListener("click", () => MoveLeft());

moveRightButton.addEventListener("click", () => MoveRight());

moveDownButton.addEventListener("click", () => MoveDown());

rotateButton.addEventListener("click", () => MoveRotation());

startButton.addEventListener("click", () =>
{
  const text = startButton.textContent;

  if(text == "Start")
  {
    StartGame()
  }
  else if(text == "Reset")
  {
    InitializeGame();
  }
});

addEventListener('load', (e) =>
{
  InitializeGame();
});
