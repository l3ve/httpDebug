import Chess from './chess';

class Canvas {
    constructor(canvasId) {
        this.canvas = document.querySelector(`#${canvasId}`);
        this.ctx = canvas.getContext('2d');
        this.yourTurn = true;
        this.chessType = '0';
        this.canvas.setAttribute('width', document.querySelector('.game-box').offsetWidth + 'px');
        this.canvas.setAttribute('height', document.querySelector('.game-box').offsetHeight - 140 + 'px');
        this.chess = {
            previewChess: '',
            fixPosition: {
                x: 0,
                y: 0
            },
            firstPosition: {
                x: 0,
                y: 0
            },
            allChess: [],
            layout: []
        };
        this.selectEnd = true;
        this.handleClick = this.handleClick.bind(this);
        this.previewChess = this.previewChess.bind(this);
        this.reset = this.reset.bind(this);
        this.listenerEvent();
        this.updata();
    }
    listenerEvent() {
        this.canvas.addEventListener("click", this.handleClick, false);
    }
    removeListenerEvent() {
        this.canvas.removeEventListener("mousemove", this.previewChess);
        this.canvas.removeEventListener("contextmenu", this.reset);
    }
    updata() {
        this.clear();
        this.chess.layout.forEach((layout) => {
            this.drawChess(layout);
        });
        this.chess.allChess.forEach((chess) => {
            this.drawChess(chess);
        });
        this.drawChess(this.chess.previewChess);
        requestAnimationFrame(() => this.updata());
    }
    clear(w = this.canvas.width, h = this.canvas.height) {
        this.ctx.clearRect(0, 0, w, h);
    }
    saveChess(chess) {
        this.chess.allChess.push(chess)
    }
    switchType(type) {
        this.chessType = type;
        if (type == 0) {
            //无选中的情况(可以点击移动棋子)
            this.reset(null, false);
        } else {
            //选中的情况(可放子)
            this.chess.previewChess = this.createChess({
                x: -999,
                y: -999,
                type: type
            });
            this.canvas.addEventListener("mousemove", this.previewChess, false);
        }
    }
    handleClick(e) {
        const chess = {
            x: e.offsetX,
            y: e.offsetY,
            type: this.chessType
        };
        switch (chess.type) {
            case '0':
                this.selectChess(chess);
                break;
            default:
                this.setChess();
                break;
        }
    }
    selectChess(chess) {
        if (this.selectEnd) {
            const newChess = this.chess.allChess.filter((_chess) => {
                if (_chess.isYou(chess.x, chess.y)) {
                    this.chess.firstPosition = {
                        x: _chess.x,
                        y: _chess.y
                    };
                    this.chess.previewChess = _chess;
                    this.selectEnd = false;
                    this.canvas.addEventListener("mousemove", this.previewChess, false);
                    this.canvas.addEventListener("contextmenu", this.reset, false);
                    return false;
                } else {
                    return true;
                }
            });
            this.chess.allChess = newChess;
        } else {
            this.chess.allChess.push(this.chess.previewChess);
            this.reset(null, false);
        }
    }
    setChess() {
        const _chess = this.createChess(this.chess.previewChess);
        this.saveChess(_chess);
        this.getLayout(_chess);
        this.reset(null, false);
    }
    previewChess(e) {
        this.chess.previewChess.move(e.offsetX, e.offsetY);
        this.setLimit(e.offsetX, e.offsetY)
    }
    createChess(position) {
        const para = {
            x: position.x || -999,
            y: position.y || -999,
            type: position.type || '',
            reside: 1
        };
        return new Chess(para);
    }
    reset(e, b = true) {
        this.removeListenerEvent();
        this.selectEnd = true;
        if (b) {
            this.chess.previewChess.move(this.chess.firstPosition.x, this.chess.firstPosition.y);
            this.chess.allChess.push(this.chess.previewChess);
        }
        this.chess.previewChess = '';
    }
    drawChess(chess) {
        const {x, y, size, type, color} = chess,
            ctx = this.ctx;
        ctx.save();
        if (type == '99') {
            //网格区域样式
            ctx.strokeStyle = color;
            ctx.setLineDash([3, 3]);
            ctx.lineDashOffset = -10;
        }
        //绘制棋子或者网格区域
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.moveTo(x + size, y + Math.sqrt(3) * size);
        ctx.lineTo(x + (size * 2), y);
        ctx.lineTo(x + size, y - Math.sqrt(3) * size);
        ctx.lineTo(x - size, y - Math.sqrt(3) * size);
        ctx.lineTo(x - (size * 2), y);
        ctx.lineTo(x - size, y + Math.sqrt(3) * size);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        //调试判断面积的圆
        // ctx.beginPath();
        // ctx.arc(x, y, Math.sqrt(3) * size, 0, 2 * Math.PI);
        // ctx.closePath();
        // ctx.stroke();
    }
    getLayout(chess) {
        const {x, y, size, id} = chess,
            newLayout = [
                {
                    x: x,
                    y: y + Math.sqrt(3) * 2 * size,
                    num: 1,
                    reside: [id]
                }, {
                    x: x + 3 * size,
                    y: y + Math.sqrt(3) * size,
                    num: 2,
                    reside: [id]
                }, {
                    x: x + 3 * size,
                    y: y - Math.sqrt(3) * size,
                    num: 3,
                    reside: [id]
                }, {
                    x: x,
                    y: y - Math.sqrt(3) * 2 * size,
                    num: 4,
                    reside: [id]
                }, {
                    x: x - 3 * size,
                    y: y - Math.sqrt(3) * size,
                    num: 5,
                    reside: [id]
                }, {
                    x: x - 3 * size,
                    y: y + Math.sqrt(3) * size,
                    num: 6,
                    reside: [id]
                }
            ];
        let layout = this.filterLayout(newLayout);
        layout.forEach((layout) => {
            this.chess.layout.push(this.createChess(layout));
        });
    }
    filterLayout(newLayout) {
        let _index = [],
            deviation = 2;
            console.log(newLayout,this.chess.layout);
        newLayout.forEach((nl) => {
            _index.push(this.chess.layout.findIndex((ol) => {
                return nl.x <= ol.x + deviation && nl.x >= ol.x - deviation && nl.y <= ol.y + deviation && nl.y >= ol.y - deviation;
            }))
        });
        console.log(_index);
        return newLayout;
    }
    setLimit(x, y) {
        this.chess.layout.forEach((layout) => {
            if (layout.isYou(x, y, 15)) {
                this.chess.previewChess.move(layout.x, layout.y);

                // this.setChess(this.chess.previewChess);
            }
        });

    }
}


export default Canvas;