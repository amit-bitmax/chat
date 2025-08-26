import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function Game() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return; // Prevent multiple initialization

    class DiceScene extends Phaser.Scene {
      constructor() {
        super("diceScene");
      }

      preload() {
        // Load 6 dice faces
        for (let i = 1; i <= 6; i++) {
          this.load.image(`dice${i}`, `https://upload.wikimedia.org/wikipedia/commons/${this.getDiceImage(i)}`);
        }
      }

      // Mapping for dice images (commons has 6 PNGs)
      getDiceImage(num) {
        switch (num) {
          case 1: return "2/2c/Alea_1.png";
          case 2: return "b/b8/Alea_2.png";
          case 3: return "2/2f/Alea_3.png";
          case 4: return "8/8d/Alea_4.png";
          case 5: return "5/5a/Alea_5.png";
          case 6: return "f/f4/Alea_6.png";
          default: return "2/2c/Alea_1.png";
        }
      }

      create() {
        // Start with dice face 1
        const dice = this.add.image(400, 300, "dice1").setScale(0.7);
        dice.setInteractive();

        // On click roll
        dice.on("pointerdown", () => {
          const newFace = Phaser.Math.Between(1, 6);

          // Fake 3D rotation: shrink, rotate, then expand + change face
          this.tweens.add({
            targets: dice,
            angle: dice.angle + 360,
            scaleX: 0.1, // squash horizontally
            duration: 300,
            yoyo: true,
            ease: "Cubic.easeInOut",
            onYoyo: () => {
              // Change dice face when halfway rotated
              dice.setTexture(`dice${newFace}`);
            },
          });
        });
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: "#1d1d1d",
      physics: { default: "arcade", arcade: { gravity: { y: 0 } } },
      scene: [DiceScene],
      parent: "phaser-container",
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div id="phaser-container"></div>;
}
