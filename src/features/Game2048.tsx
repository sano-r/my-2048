import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/Button";

const size = 4;

const initialGrid = () =>
  Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));

const Game2048 = () => {
  const [grid, setGrid] = useState(initialGrid);
  const [tileKey, setTileKey] = useState(0); // タイルごとのキー管理用
  const [isGameOverState, setIsGameOverState] = useState(false);

  useEffect(() => {
    let newGrid = initialGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameOverState) return; // ゲームオーバー時は操作を受け付けない
      switch (event.key) {
        case "ArrowUp":
          moveTiles("up");
          break;
        case "ArrowDown":
          moveTiles("down");
          break;
        case "ArrowLeft":
          moveTiles("left");
          break;
        case "ArrowRight":
          moveTiles("right");
          break;
        default:
          return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [grid, isGameOverState]); // grid の状態が変わるたびにリスナーを更新

  const addRandomTile = (board: number[][]): number[][] => {
    let emptyCells: [number, number][] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return board;

    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = Math.random() > 0.9 ? 4 : 2;
    setTileKey((prev) => prev + 1);
    return newBoard;
  };

  const moveTiles = (direction: string) => {
    let newBoard = grid.map((row) => [...row]);

    if (direction === "up" || direction === "down") {
      newBoard = transpose(newBoard);
    }

    newBoard = newBoard.map((row) =>
      slide(row, direction === "right" || direction === "down")
    );

    if (direction === "up" || direction === "down") {
      newBoard = transpose(newBoard);
    }

    if (JSON.stringify(newBoard) !== JSON.stringify(grid)) {
      newBoard = addRandomTile(newBoard);
      setGrid(newBoard);
      if (isGameOver(newBoard)) {
        setIsGameOverState(true);
      }
    }
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
    while (newRow.length < size) {
      newRow.push(0);
    }

    if (reverse) newRow.reverse();
    return newRow;
  };

  const transpose = (matrix: number[][]): number[][] => {
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
  };

  const isGameOver = (board: number[][]): boolean => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) return false; // 空のセルがあればゲームオーバーではない
        // 横、縦で隣接したタイルが同じ場合も動かせるのでゲームオーバーではない
        if (c < size - 1 && board[r][c] === board[r][c + 1]) return false;
        if (r < size - 1 && board[r][c] === board[r + 1][c]) return false;
      }
    }
    return true; // すべてのセルが埋まっていて、隣接したタイルが結合できない場合はゲームオーバー
  };

  const resetGame = () => {
    let newGrid = initialGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setTileKey(0);
    setIsGameOverState(false); // リセット時にゲームオーバー解除
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">2048</h1>
      {isGameOverState && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50 flex flex-col">
          <div className="text-white text-2xl font-bold mb-2">Game Over</div>
          <Button variant="green" onClick={resetGame}>
            Reset
          </Button>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 bg-gray-800 p-4 rounded-lg mb-2">
        {grid.flat().map((num, i) => (
          <motion.div
            key={`${num}-${i}-${tileKey}`}
            className={`w-20 h-20 flex items-center justify-center font-bold text-xl rounded-lg ${
              num === 0 ? "bg-gray-700" : "bg-yellow-500"
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
      <Button variant="green" onClick={resetGame} disabled={isGameOverState}>
        Reset
      </Button>
    </div>
  );
};

export default Game2048;
