export class Game {
    
    intervalID = null;
    chrono = 0;
    errors = 0;
    score = 0;
    consoleLog = '';
    endGame = false ;

    constructor(heureux, nbFails, timeEnd, road, curve){
        this.mission = 'Vous avez ' + timeEnd + ' secondes pour que ' + heureux + ' conducteurs rejoignent la fin du niveau avec une marge de ' + nbFails + ' erreurs !';
        this.timeEnd = timeEnd;
        this.road = road;
        this.curve = curve;
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
        this.isEndOfGame(this.chrono);
    }

    isEndOfGame(){
        if (parseFloat(this.chrono) >= this.timeEnd || this.errors >= this.nbFails) {
            this.endGame = true ;
        }
        return this.endGame ;
    }
}