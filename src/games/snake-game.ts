export enum SnakeGameOverReason {
  HitWall = "Hit Wall",
  HitSelf = "Hit Self",
  Starved = "Starved",
}

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export class Position {
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Snake {
  private _body: Position[] = [];
  private _direction: Direction = Direction.Right;

  constructor(headPosition: Position) {
    this._body.push(headPosition);
  }

  move() {
    const head = this.head;
    let newHead: Position;
    switch (this._direction) {
      case Direction.Up:
        newHead = new Position(head.x, head.y - 1);
        break;
      case Direction.Down:
        newHead = new Position(head.x, head.y + 1);
        break;
      case Direction.Left:
        newHead = new Position(head.x - 1, head.y);
        break;
      case Direction.Right:
        newHead = new Position(head.x + 1, head.y);
        break;
    }

    if (this.isOverlapping(newHead)) return false;

    this._body.unshift(newHead);
    this._body.pop();
    return true;
  }

  set direction(direction: Direction) {
    if (
      direction === Direction.Up &&
      this._direction === Direction.Down &&
      this._body.length !== 1
    )
      return;
    if (
      direction === Direction.Down &&
      this._direction === Direction.Up &&
      this._body.length !== 1
    )
      return;
    if (
      direction === Direction.Left &&
      this._direction === Direction.Right &&
      this._body.length !== 1
    )
      return;
    if (
      direction === Direction.Right &&
      this._direction === Direction.Left &&
      this._body.length !== 1
    )
      return;
    this._direction = direction;
  }

  get body() {
    return this._body;
  }

  get head() {
    return this._body[0];
  }

  grow() {
    this.body.push(this.body[this.body.length - 1]);
  }

  isOverlapping(position: Position) {
    return this.body.some(
      (chunk) => chunk.x === position.x && chunk.y === position.y
    );
  }
}

export class Apple {
  private _position: Position;
  constructor(position: Position) {
    this._position = position;
  }

  get position() {
    return this._position;
  }
}

export class SnakeGame {
  private _width: number;
  private _height: number;
  private _snake: Snake;
  private _apple: Apple;
  private _score: number = 0;
  private _gameOver: boolean = false;
  private _ticksSinceLastApple: number = 0;
  private _gameOverReason: SnakeGameOverReason | null = null;

  constructor(public width: number, public height: number) {
    this._width = width;
    this._height = height;
    this._snake = new Snake(
      new Position(Math.floor(width / 2), Math.floor(height / 2))
    );

    for (let i = 0; i < 3; i++) this._snake.grow();

    this._apple = this.spawnApple();
  }

  draw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { height, width } = canvas;

    const drawCell = (
      x: number,
      y: number,
      color = "black",
      opacity = 1,
      padding = -0.25
    ) => {
      const oldAlpha = ctx.globalAlpha;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.fillRect(
        x * (width / this._width) + padding,
        y * (height / this._height) + padding,
        width / this._width - padding * 2,
        height / this._height - padding * 2
      );
      ctx.globalAlpha = oldAlpha;
    };
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    this._snake.body.forEach((chunk, index) => {
      drawCell(
        chunk.x,
        chunk.y,
        "black",
        1 - index / 2 / this._snake.body.length
      );
    });

    drawCell(this._apple.position.x, this._apple.position.y, "red");

    // draw score on top left

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText(`Score: ${this._score}`, 6, 6);

    if (this.gameOver) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      ctx.font = "24px Arial";
      ctx.fillText(`Game Over\n${this.gameOverReason}`, width / 2, height / 2);
    }
  }

  setSnakeDirection(direction: Direction) {
    this._snake.direction = direction;
  }

  spawnApple() {
    return (this._apple = new Apple(
      new Position(
        Math.floor(Math.random() * this._width),
        Math.floor(Math.random() * this._height)
      )
    ));
  }

  checkAppleCollision() {
    if (this._snake.isOverlapping(this._apple.position)) {
      this._snake.grow();
      this.spawnApple();
      this._score++;
      this._ticksSinceLastApple = 0;
      return 1;
    }

    return 0;
  }

  tick() {
    if (this._gameOver) return 0;
    const validMove = this._snake.move();
    if (!validMove) {
      this._gameOver = true;
      this._gameOverReason = SnakeGameOverReason.HitSelf;
    }

    if (this.snakeIsOutOfBounds()) {
      this._gameOver = true;
      this._gameOverReason = SnakeGameOverReason.HitWall;
    }

    if (this._ticksSinceLastApple > (this.height * this.width) / 2) {
      this._gameOver = true;
      this._gameOverReason = SnakeGameOverReason.Starved;
      return 0;
    }

    return this.checkAppleCollision();
  }

  snakeIsOutOfBounds() {
    const head = this._snake.head;
    return (
      head.x < 0 ||
      head.x >= this._width ||
      head.y < 0 ||
      head.y >= this._height
    );
  }

  get score() {
    return this._score;
  }

  get gameOver() {
    return this._gameOver;
  }

  get gameOverReason() {
    return this._gameOverReason;
  }

  get snake() {
    return this._snake;
  }

  get apple() {
    return this._apple;
  }
}
