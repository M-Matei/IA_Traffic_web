class Game {
    
    chrono = 0;
    errors = 0;
    score = 0;
    consoleLog = '';
    endGame = false ;

    constructor(mission, timeEnd, road, curve, common){
        this.mission = mission;
        this.timeEnd = timeEnd;
        this.road = road;
        this.curve = curve;
        this.common = common;
    }

    start() {
        if (this.intervalID === null) {
            this.startTime = Date.now();

            this.intervalID = setInterval(() => {
                this.updateElapsedTime();
            }, 1000);
        }
    }

    stop() {
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }

    updateElapsedTime() {
        const currentTime = Date.now();
        this.chrono = Math.floor((currentTime - this.startTime) / 1000);
        this.game.isEndOfGame(this.chrono);
    }

    isEndOfGame(){
        if (parseFloat(this.chrono) >= this.timeEnd) {
            this.endGame = true ;
            this.stop();
          }
    }
}