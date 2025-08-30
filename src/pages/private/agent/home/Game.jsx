import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const GameBoard = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return; // Prevent re-init

    class LudoScene extends Phaser.Scene {
      constructor() {
        super("LudoScene");
      }

      create() {
        const w = this.scale.width;
        const h = this.scale.height;
        const size = Math.min(w, h) * 0.95; // full board
        const cell = size / 15; // 15x15 grid

        const colors = {
          red: 0xff4d4d,
          green: 0x4dff4d,
          yellow: 0xffff4d,
          blue: 0x4d4dff,
        };

        // --- Draw grid 15x15 ---
        for (let row = 0; row < 15; row++) {
          for (let col = 0; col < 15; col++) {
            const x = w / 2 - size / 2 + col * cell + cell / 2;
            const y = h / 2 - size / 2 + row * cell + cell / 2;

            let fill = 0xffffff; // default white
            let stroke = 0x000000;

            // --- Four homes ---
            if (row < 6 && col < 6) fill = colors.red;        // top-left
            if (row < 6 && col > 8) fill = colors.green;      // top-right
            if (row > 8 && col < 6) fill = colors.blue;       // bottom-left
            if (row > 8 && col > 8) fill = colors.yellow;     // bottom-right

            // --- Center star (cross area) ---
            if ((row >= 6 && row <= 8) || (col >= 6 && col <= 8)) {
              fill = 0xffffff;
            }

            // --- Safe paths (colored strips) ---
            if (row === 7 && col < 6) fill = colors.red;     // red path
            if (col === 7 && row < 6) fill = colors.green;   // green path
            if (row === 7 && col > 8) fill = colors.yellow;  // yellow path
            if (col === 7 && row > 8) fill = colors.blue;    // blue path

            // Draw cell
            this.add.rectangle(x, y, cell, cell, fill).setStrokeStyle(1, stroke);
          }
        }

        // --- Center star ---
        this.add.star(w / 2, h / 2, 4, cell * 2, cell * 3, 0xffffff).setStrokeStyle(3, 0x000000);
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 600,
      height: 600,
      parent: "ludo-container",
      backgroundColor: "#f0f0f0",
      scene: [LudoScene],
    };

    gameRef.current = new Phaser.Game(config);
  }, []);

  return <div id="ludo-container" className="w-full h-full" />;
};

export default GameBoard;
