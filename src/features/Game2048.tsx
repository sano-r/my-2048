import { useEffect, useReducer } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/Button";

const size: number = 4;

type Grid = number[][];
type Direction = "up" | "down" | "left" | "right";

type GameState = {
  grid: Grid;
  isGameOver: boolean;
};

type GameAction = {
  type: "MOVE" | "RESET";
  direction?: Direction;
};

const initialGrid = (): Grid =>
  Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));

const tileColors: { [key: number]: string } = {
  0: "bg-gray-700",
  2: "bg-gray-400",
  4: "bg-yellow-500",
  8: "bg-orange-500",
  16: "bg-orange-400",
  32: "bg-red-500",
  64: "bg-red-400",
  128: "bg-green-500",
  256: "bg-green-400",
  512: "bg-blue-500",
  1024: "bg-blue-400",
  2048: "bg-purple-500",
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "MOVE":
      const newGrid = moveTiles(state.grid, action.direction!);
      return {
        grid: newGrid,
        isGameOver: checkGameOver(newGrid),
      };
    case "RESET":
      let resetGrid = initialGrid();
      resetGrid = addRandomTile(resetGrid);
      resetGrid = addRandomTile(resetGrid);
      return { grid: resetGrid, isGameOver: false };
    default:
      return state;
  }
};

export function Game2048() {
  const [state, dispatch] = useReducer(gameReducer, {
    grid: initialGrid(),
    isGameOver: false,
  });

  useEffect(() => {
    dispatch({ type: "RESET" });
  }, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (state.isGameOver) return;
    const directions: Record<string, Direction> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    if (directions[event.key]) {
      dispatch({ type: "MOVE", direction: directions[event.key] });
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white relative">
      <h1 className="text-4xl font-bold mb-4">2048</h1>
      {state.isGameOver && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 flex-col">
          <div className="text-white text-2xl font-bold mb-2">Game Over</div>
          <Button variant="green" onClick={() => dispatch({ type: "RESET" })}>
            Reset
          </Button>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 bg-gray-800 p-4 rounded-lg mb-2">
        {state.grid.flat().map((num, i) => (
          <motion.div
            key={`${num}-${i}`}
            className={`w-20 h-20 flex items-center justify-center font-bold text-xl rounded-lg ${
              tileColors[num] || "bg-gray-700"
            }`}
            layout
            initial={{ scale: num === 0 ? 1 : 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {num !== 0 && num}
          </motion.div>
        ))}
      </div>
      <Button variant="green" onClick={() => dispatch({ type: "RESET" })}>
        Reset
      </Button>
    </div>
  );
}

const moveTiles = (grid: Grid, direction: Direction): Grid => {
  let newGrid = grid.map((row) => [...row]);
  if (direction === "up" || direction === "down") newGrid = transpose(newGrid);
  newGrid = newGrid.map((row) =>
    slide(row, direction === "right" || direction === "down")
  );
  if (direction === "up" || direction === "down") newGrid = transpose(newGrid);
  return addRandomTile(newGrid);
};

const slide = (row: number[], reverse: boolean): number[] => {
  if (reverse) row.reverse();
  let newRow = row.filter((num) => num !== 0);
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      newRow[i + 1] = 0;
    }
  }
  newRow = newRow.filter((num) => num !== 0);
  while (newRow.length < size) newRow.push(0);
  if (reverse) newRow.reverse();
  return newRow;
};

const transpose = (matrix: Grid): Grid =>
  matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));

const addRandomTile = (board: Grid): Grid => {
  let emptyCells: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return board;
  const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[r][c] = Math.random() > 0.9 ? 4 : 2;
  return board;
};

const checkGameOver = (grid: Grid): boolean => {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) return false;
      if (c < size - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < size - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
};
