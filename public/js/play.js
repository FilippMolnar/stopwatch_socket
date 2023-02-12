import { Grid, GridEntry } from './grid.js';

/**
 * Initialize the alphabet board.
 * @param {GameState} gs
 */
class Board {
    constructor(gs) {
        this.gs = gs;
        // change to different values if you wish so
        // most if not all implementation come with 7x6 layout
        const columns = 7;
        const rows = 6;
        let arr = new Array(columns);
        for (let i = 0; i < columns; i++) {
            arr[i] = new Array(rows);
            for (let j = 0; j < rows; j++)
                arr[i][j] = new GridEntry();
        }
        this.grid = new Grid(arr);
        this._buildGrid();
    }
    /**
     * Build individual boxes
     * @param {number} i 
     * @param {number} j 
     * @returns HTML element that encapsulates the box
     */
    _buildHTMLEntry(i, j) {
        var box = document.createElement("div");
        box.id = `${i}-${j}`;
        box.classList.add('box');
        return box;
    }

    /**
     * Build the 2D grid and add interactions
     */
    _buildGrid() {
        var gridUI = document.getElementById("grid");

        for (let i = 0; i < this.grid.width; i++) {
            var col = document.createElement("div");
            col.id = i;
            col.classList.add('col');
            for (let j = 0; j < this.grid.height; j++) {
                var box = this._buildHTMLEntry(i, j);
                // last box set bottom margin to 0
                if (j == this.grid.height - 1)
                    box.style.marginBottom = '0';
                col.appendChild(box);
            }

            col.addEventListener('mouseover', (e) => this.onMouseEnter(e));
            col.addEventListener('click', (e) => this.onMouseClick(e));
            col.addEventListener('mouseout', (e) => this.onMouseExit(e));

            gridUI.appendChild(col);
        }
    }

    /**
     * Highlight the hovering column
     * Color grey -> regular
     * Color red -> column cannot be selected, it's full
     * @param {MouseEvent} e 
     */
    onMouseEnter(e) {
        // when hovering over entry  -> id = "cid-rid"
        // else hovering over column -> id = "cid"
        let cid = String(e.target.id).split('-')[0];
        let arr = this.grid.arr;
        let isEmpty = false;
        for (let i = 0; i < arr[cid].length; i++) {
            if (arr[cid][i].playerNum == null) {
                isEmpty = true;
                break;
            }
        }
        var col = document.getElementById(cid);
        if (isEmpty) {
            col.style.backgroundColor = 'grey';
        } else {
            col.style.backgroundColor = 'red';
        }
    }

    /**
     * Selects a column and marks it with the player's move
     * @param {MouseEvent} e 
     */
    onMouseClick(e) {
        e.preventDefault();
        let cid = String(e.target.id).split('-')[0];
        var col = document.getElementById(cid);

        let arr = this.grid.arr;
        let last = arr[0].length - 1;
        let empty_box = arr[cid][last];
        while (empty_box.playerNum != null && last >= 0) {
            empty_box = arr[cid][--last];
            if (!empty_box) {
                col.style.backgroundColor = 'red';
                return;
            };
        }

        // add the player's move 
        var child = col.children[last];

        if (this.gs.myTurn()) {
            empty_box.playerNum = this.gs.playerType == 'A' ? 1 : 2;
            child.classList.add('fadein');
            child.style.backgroundColor = this.gs.playerType == 'A' ? 'red' : '#00A6D8';
            this.gs.switchTurn();
            this.gs.ui.setStatus("Opponent's turn");
            this.gs.ui.setContainerA(this.gs.playerType == 'B');
            this.gs.ui.setContainerB(this.gs.playerType == 'A');
        } else {
            let msg = this.gs.ui.hasTwoPlayers() ? 'make a move' : 'connect';
            alert(`Not your turn. Wait for your opponent to ${msg}.`);
            return;
        }

        // check if the game is over
        let winner = this.grid.gameOver();
        if (winner != null) {
            winner = winner == 'A' ? 'Andy Zaidman' : 'Otto Visser';
            this.gs.ui.setStatus(`Congratulations ${winner} <a href='/play'> Want to Play Again? </a>`);
            this.gs.socket.send(JSON.stringify({ type: 'won', data: cid }));

            setTimeout(() => {
                alert(`Congratulations ${winner} \nGame over, restart!`);
                var gridUI = document.getElementById("grid");
                gridUI.replaceChildren('');
                this._buildGrid();
            }, 10);
        } else {
            this.gs.socket.send(JSON.stringify({ type: 'turn', data: cid }));
        }
    }

    /**
     * Display the move done by the opponent
     * @param {number} cid 
     * @returns void
     */
    mockClick(cid) {
        var col = document.getElementById(cid);

        let arr = this.grid.arr;
        let last = arr[0].length - 1;
        let empty_box = arr[cid][last];

        while (empty_box.playerNum != null && last >= 0) {
            empty_box = arr[cid][--last];
            if (!empty_box) {
                col.style.backgroundColor = 'red';
                return;
            };
        }

        // add the player's move 
        var child = col.children[last];
        empty_box.playerNum = this.gs.playerType != 'A' ? 1 : 2;

        child.classList.add('fadein');
        child.style.backgroundColor = this.gs.playerType != 'A' ? 'red' : '#00A6D8';
    }

    /**
     * Remove the hover effect of the column
     * @param {MouseEvent} e 
     */
    onMouseExit(e) {
        let cid = String(e.target.id).split('-')[0];
        var col = document.getElementById(cid);
        col.style.backgroundColor = '';
    }
}

class PlayerUI {
    constructor() {
        this.setStatus = function (status) {
            document.getElementById("status").innerHTML = status;
        };
        this.setPlayerBar = function (status) {
            document.getElementById("playerbar").innerHTML = status;
        };
        this.hasTwoPlayers = function () {
            let el = document.getElementById("playerbar").innerHTML;
            return el == "(2/2)";
        }
        this.setDividerA = function () {
            let el = document.getElementById("dividerA");
            el.style.backgroundColor = 'white';
        };
        this.setContainerA = function (active) {
            let el = document.getElementById("containerA");
            if (active) el.style.backgroundColor = '#ff00003b';
            else el.style.backgroundColor = '';
        };
        this.setDividerB = function () {
            let el = document.getElementById("dividerB");
            el.style.backgroundColor = 'white';
        };
        this.setContainerB = function (active) {
            let el = document.getElementById("containerB");
            if (active) el.style.backgroundColor = '#0000ff36';
            else el.style.backgroundColor = '';
        };
        this.setTimer = function (seconds) {
            let el = document.getElementById("timer");
            let mm = ~~(seconds / 60); // integer division
            let ss = seconds % 60;
            let time = `${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`;
            el.innerText = time;
        }
    }
}


export { Board, PlayerUI }
