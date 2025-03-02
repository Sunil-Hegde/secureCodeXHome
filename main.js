import "./style.css";
import Phaser from "phaser";

document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("startScreen");
  const gameContainer = document.getElementById("gameContainer");
  const startButton = document.getElementById("startButton");

  startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    gameContainer.style.display = "block";
    startGame(); // Initialize your Phaser game
  });
});

function startGame() {
  const sizes = {
    width: 800,
    height: 650,
  };
  const charSize = {
    width: 100,
    height: 100,
  };
  const speedDown = 300;

  class GameScene extends Phaser.Scene {
    constructor() {
      super("scene-game");
      this.player;
      this.cursor;
      this.playerSpeed = speedDown + 50;
      this.computer;
      this.idCard;
      this.phone;
      this.note;
      this.notePrompted = false;
      this.phoneUnlocked = false;
      this.phonePrompted = false;
      this.idPrompted = false;
      this.passwordPrompted = false;
      this.flashMessage = null;
      this.successMessage = null;
      this.timer = 0;
      this.timerText = null;
      this.timeLimit = 600; // 5 minutes in seconds
    }

    preload() {
      this.load.image("bg", "/assets/bg.jpg");
      this.load.image("player", "assets/character.png");
      this.load.image("computer", "assets/computer.png");
      this.load.image("phone", "assets/phone.png");
      this.load.image("dustbin", "assets/Dustbin.png");
      this.load.image("note", "assets/Note.png");
      this.load.image("ID", "assets/IDCard.png");
      this.load.image("messageBox", "assets/MessageBox.png");
    }

    create() {
      this.add.image(0, 0, "bg").setOrigin(0, 0);
      this.computer = this.add
        .image(50, 268, "computer")
        .setOrigin(0, 0)
        .setDisplaySize(charSize.width + 160, charSize.height + 70);
      this.phone = this.add
        .image(450, 165, "phone")
        .setOrigin(0, 0)
        .setDisplaySize(charSize.width, charSize.height);

      this.add
        .image(548.3, 520, "dustbin")
        .setOrigin(0, 0)
        .setDisplaySize(charSize.width + 30, charSize.height + 50);
      this.note = this.add
        .image(548.3, 520, "note")
        .setOrigin(0, 0)
        .setDisplaySize(charSize.width, charSize.height);
      this.idCard = this.add
        .image(575, 350, "ID")
        .setOrigin(0, 0)
        .setDisplaySize(charSize.width - 30, charSize.height - 30);
      this.player = this.physics.add
        .image(255, sizes.height - 100, "player")
        .setOrigin(0, 0);
      this.player.setDisplaySize(charSize.width, charSize.height);
      this.player.setImmovable(true);
      this.player.body.allowGravity = false;
      this.cursor = this.input.keyboard.createCursorKeys();
      this.player.setCollideWorldBounds(true);

      this.timerText = this.add
        .text(sizes.width - 20, 20, "00:00", {
          font: "24px Arial",
          fill: "#00ff00",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
          borderRadius: 5,
          stroke: "#00ff00",
          strokeThickness: 1,
        })
        .setOrigin(1, 0);

      // Start the timer
      this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true,
      });
    }

    showFlashMessage(message, color = "#ffffff") {
      // Remove existing flash message if any
      if (this.flashMessage) {
        this.flashMessage.destroy();
      }

      // Create flash message at top center of screen
      this.flashMessage = this.add
        .text(sizes.width / 2, 50, message, {
          font: "24px Arial",
          fill: color,
          backgroundColor: "#000000",
          padding: { x: 20, y: 10 },
          borderRadius: 8,
          stroke: "#ffffff",
          strokeThickness: 2,
          align: "center",
        })
        .setOrigin(0.5);

      // Add fade in/out animation with null check
      this.tweens.add({
        targets: this.flashMessage,
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: "Power2",
        yoyo: true,
        hold: 1000,
        onComplete: () => {
          if (this.flashMessage) {
            // Add null check here
            this.flashMessage.destroy();
            this.flashMessage = null;
          }
        },
      });
    }

    showSuccessScreen() {
      // Create a semi-transparent background
      const bg = this.add
        .rectangle(0, 0, sizes.width, sizes.height, 0x000000, 0.8)
        .setOrigin(0)
        .setDepth(1);

      // Add congratulations message
      this.successMessage = this.add
        .text(
          sizes.width / 2,
          sizes.height / 3,
          "🎉 Congratulations!\nYou are now a cyber criminal!\n\n" +
            "⚠️ Cybersecurity Awareness:\n" +
            "• Never use personal information as passwords\n" +
            "• Avoid using birthdays or common dates\n" +
            "• Use a mix of letters, numbers, and symbols\n" +
            "• Keep your passwords private and unique\n" +
            "• Enable two-factor authentication when possible\n\n" +
            "[Press SPACE to continue]",
          {
            font: "20px Arial",
            fill: "#ffffff",
            align: "center",
            wordWrap: { width: 600 },
            lineSpacing: 10,
          }
        )
        .setOrigin(0.5)
        .setDepth(2);

      // Add space key handler to dismiss
      const spaceKey = this.input.keyboard.addKey("SPACE");
      spaceKey.once("down", () => {
        bg.destroy();
        this.successMessage.destroy();
        this.successMessage = null;
        this.restartGame(); // Add restart call
      });
    }

    showGameOver() {
      // Create a semi-transparent background
      const bg = this.add
        .rectangle(0, 0, sizes.width, sizes.height, 0x000000, 0.8)
        .setOrigin(0)
        .setDepth(1);

      // Add game over message
      this.gameOverMessage = this.add
        .text(
          sizes.width / 2,
          sizes.height / 3,
          "❌ Game Over!\nTime's up!\n\n" +
            "You failed to break into the system in time.\n" +
            "Try to be faster next time!\n\n" +
            "[Press SPACE to restart]",
          {
            font: "24px Arial",
            fill: "#ff0000",
            align: "center",
            wordWrap: { width: 600 },
            lineSpacing: 10,
          }
        )
        .setOrigin(0.5)
        .setDepth(2);

      // Add space key handler to restart
      const spaceKey = this.input.keyboard.addKey("SPACE");
      spaceKey.once("down", () => {
        bg.destroy();
        this.gameOverMessage.destroy();
        this.restartGame();
      });
    }

    update() {
      const { left, right, up, down } = this.cursor;
      if (left.isDown) {
        this.player.setVelocityX(-this.playerSpeed);
      } else if (right.isDown) {
        this.player.setVelocityX(this.playerSpeed);
      } else if (up.isDown) {
        this.player.setVelocityY(-this.playerSpeed);
      } else if (down.isDown) {
        this.player.setVelocityY(this.playerSpeed);
      } else {
        this.player.setVelocity(0);
      }

      const distanceToComputer = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.computer.x,
        this.computer.y
      );

      // Add phone distance check
      const distanceToPhone = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.phone.x,
        this.phone.y
      );

      const distanceToNote = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.note.x,
        this.note.y
      );

      const distanceToId = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.idCard.x,
        this.idCard.y
      );
      // ID interaction
      if (distanceToId < 50) {
        if (!this.idPrompted) {
          this.idPrompted = true;
          this.showFlashMessage("ID Number: DSI2024001", "#00ff00");
        }
      } else {
        this.idPrompted = false;
      }

      //computer interaction
      if (distanceToComputer < 150) {
        if (!this.passwordPrompted) {
          this.passwordPrompted = true;
          const option = prompt(
            "Choose option:\n1. Enter Password\n2. Enter OTP"
          );

          if (option === "1") {
            const password = prompt("Enter password for testmail@dsi.xyz:");
            if (password === "20/06/2004") {
              this.showFlashMessage(
                "Access Granted! Login successful",
                "#00ff00"
              );
              this.showSuccessScreen();
            } else {
              this.showFlashMessage(
                "Access Denied! Incorrect password",
                "#ff0000"
              );
            }
          } else if (option === "2") {
            const otp = prompt("Enter OTP:");
            if (otp === "4528") {
              this.showFlashMessage(
                "Access Granted! Login successful",
                "#00ff00"
              );
              this.showSuccessScreen();
            } else {
              this.showFlashMessage("Access Denied! Incorrect OTP", "#ff0000");
            }
          } else {
            this.showFlashMessage("Invalid option selected", "#ff0000");
          }
        }
      } else {
        this.passwordPrompted = false;
      }

      //phone interaction
      if (distanceToPhone < 50) {
        if (!this.phonePrompted) {
          this.phonePrompted = true;
          const idInput = prompt("Enter Pin number to unlock phone:");
          if (idInput === "DSI2024001") {
            this.phoneUnlocked = true;
            this.showFlashMessage("Phone unlocked! OTP: 4528", "#00ff00");
          } else {
            this.showFlashMessage("Incorrect ID number!", "#ff0000");
          }
        }
      } else {
        this.phonePrompted = false;
      }

      if (distanceToNote < 50) {
        if (!this.notePrompted) {
          this.notePrompted = true;
          this.showFlashMessage(
            "Personal Information:\nFather: Keshav Karthik CN\nMother: Hemavathi\nDOB: 20/06/2004",
            "#ffffff"
          );
        }
      } else {
        this.notePrompted = false;
      }
    }

    updateTimer() {
      this.timer += 1;
      const timeLeft = this.timeLimit - this.timer;

      if (timeLeft <= 0) {
        // Time's up!
        this.showGameOver();
        // Disable player movement
        this.player.setVelocity(0);
        this.player.body.moves = false;
        return;
      }

      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      this.timerText.setText(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );

      // Change timer color to red when less than 30 seconds remain
      if (timeLeft <= 30) {
        this.timerText.setFill("#ff0000");
      }
    }

    restartGame() {
      // Reset all game state
      this.timer = 0;
      this.phoneUnlocked = false;
      this.phonePrompted = false;
      this.idPrompted = false;
      this.passwordPrompted = false;
      this.notePrompted = false;

      // Reset player position
      this.player.setPosition(255, sizes.height - 100);
      this.player.body.moves = true;

      // Reset timer color
      this.timerText.setFill("#00ff00");

      if (this.flashMessage) {
        this.flashMessage.destroy();
        this.flashMessage = null;
      }
    }
  }

  const config = {
    type: Phaser.WEBGL,
    width: sizes.width,
    height: sizes.height,
    canvas: gameCanvas,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: speedDown },
        debug: true,
      },
    },
    scene: [GameScene],
  };

  const game = new Phaser.Game(config);
}
