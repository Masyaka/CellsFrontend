var CellsGame = function() {
    var ActiveCellIndication = function (scope) {
        this.bitMapData = scope.game.make.bitmapData(scope.spriteWidth * scope.canvasZoom, scope.spriteHeight * scope.canvasZoom);

        this.addToWorld = function (x, y) {
            this.bitMapData.addToWorld(x, y);
        };

        this.highLight = function (x, y) {
            this.bitMapData.clear();
            this.bitMapData.rect(x * scope.canvasZoom + 1, y * scope.canvasZoom + 1, scope.canvasZoom, scope.canvasZoom, '#0f0');
            this.bitMapData.clear(x * scope.canvasZoom + 2, y * scope.canvasZoom + 2, scope.canvasZoom - 2, scope.canvasZoom - 2, '#000');
        }
    };

    this.currentX = 0;
    this.currentY = 0;

//  Dimensions
    this.previewSize = 6;
    this.spriteWidth = 16;
    this.spriteHeight = 16;

//  UI
    this.ui = null;
    this.coords = null;
    this.widthText = null;
    this.widthUp = null;
    this.widthDown = null;
    this.heightText = null;
    this.heightUp = null;
    this.heightDown = null;
    this.previewSizeUp = null;
    this.previewSizeDown = null;
    this.previewSizeText = null;
    this.frameText = null;


    this.rightCol = 532;

//  Drawing Area
    this.canvas = null;
    this.canvasBG = null;
    this.canvasGrid = null;
    this.canvasSprite = null;
    this.canvasZoom = 32;

//  Sprite Preview
    this.preview = null;
    this.previewBG = null;

//  Keys + Mouse
    this.keys = null;
    this.isDown = false;
    this.isErase = false;

//  Palette
    this.color = 0;

//  Data
    this.frame = 1;
    this.frames = [[]];

    this.timerCount = 0;
    this.moveTimer = 0;

    this.data = 0;

    this.activeCellIndication = 0;

    this.websocket = 0;

    this.Cells = 0;
    this.Fractions = 0;
    this.Players = 0;
    this.Fraction = 0;
    this.Player = 0;

    this.create = function() {
        /*
         //   So we can right-click to erase
         document.body.oncontextmenu = function () {
         return false;
         };*/
        Phaser.Canvas.setUserSelect(game.canvas, 'none');
        Phaser.Canvas.setTouchAction(game.canvas, 'none');

        game.stage.backgroundColor = '#505050';

        this.createUI();
        this.createDrawingArea();
        this.createPreview();
        this.activeCellIndication = new ActiveCellIndication(this);
        this.activeCellIndication.addToWorld(10, 10);
        this.createEventListeners();

        this.resetData();

        //this.canvas.rect(10 * this.canvasZoom, 10 * this.canvasZoom, this.canvasZoom, this.canvasZoom, "#ffffff");

        this.loadState();

        this.startWebSocket();
    };

    this.resetData = function() {

        this.data = [];

        for (var y = 0; y < this.spriteHeight; y++) {
            var a = [];

            for (var x = 0; x < this.spriteWidth; x++) {
                a.push('.');
            }

            this.data.push(a);
        }

    };

    this.copyToData = function(src) {

        this.data = [];

        for (var y = 0; y < src.length; y++) {
            var a = [];

            for (var x = 0; x < src[y].length; x++) {
                a.push(src[y][x]);
            }

            this.data.push(a);
        }

    };

    this.cloneData = function() {

        var clone = [];

        for (var y = 0; y < this.data.length; y++) {
            var a = [];

            for (var x = 0; x < this.data[y].length; x++) {
                var v = this.data[y][x];
                a.push(v);
            }

            clone.push(a);
        }

        return clone;

    };

    this.createUI = function() {

        game.create.grid('uiGrid', 32 * 16, 32, 32, 32, 'rgba(255,255,255,0.5)');

        var plus = [
            '2222222',
            '2.....2',
            '2..2..2',
            '2.222.2',
            '2..2..2',
            '2.....2',
            '2222222'
        ];

        var minus = [
            '2222222',
            '2.....2',
            '2.....2',
            '2.222.2',
            '2.....2',
            '2.....2',
            '2222222'
        ];

        game.create.texture('plus', plus, 3);
        game.create.texture('minus', minus, 3);


        this.ui = game.make.bitmapData(800, 32);

        this.ui.addToWorld();

        var style = {font: "20px Calibri", fill: "#fff", tabs: 80};

        this.coords = game.add.text(this.rightCol, 8, "X: 0\tY: 0", style);

        this.timerLabel = game.add.text(this.rightCol + 150, 8, "Timer: 0", style);

        this.previewSizeText = game.add.text(this.rightCol, 320, "Size: " + this.previewSize, style);

        this.previewSizeUp = game.add.sprite(this.rightCol + 180, 320, 'plus');
        this.previewSizeUp.inputEnabled = true;
        this.previewSizeUp.input.useHandCursor = true;
        this.previewSizeUp.events.onInputDown.add(this.increasePreviewSize, this);

        this.previewSizeDown = game.add.sprite(this.rightCol + 220, 320, 'minus');
        this.previewSizeDown.inputEnabled = true;
        this.previewSizeDown.input.useHandCursor = true;
        this.previewSizeDown.events.onInputDown.add(this.decreasePreviewSize, this);

    };

    this.createDrawingArea = function() {

        game.create.grid('drawingGrid', 16 * this.canvasZoom, 16 * this.canvasZoom, this.canvasZoom, this.canvasZoom, 'rgba(0,191,243,0.3)');

        this.canvas = game.make.bitmapData(this.spriteWidth * this.canvasZoom, this.spriteHeight * this.canvasZoom);
        this.canvasBG = game.make.bitmapData(this.canvas.width + 2, this.canvas.height + 2);

        this.canvasBG.rect(0, 0, this.canvasBG.width, this.canvasBG.height, '#fff');
        this.canvasBG.rect(1, 1, this.canvasBG.width - 2, this.canvasBG.height - 2, '#3f5c67');

        var x = 10;
        var y = 10;

        this.canvasBG.addToWorld(x, y);
        this.canvasSprite = this.canvas.addToWorld(x + 1, y + 1);
        this.canvasGrid = game.add.sprite(x + 1, y + 1, 'drawingGrid');
        this.canvasGrid.crop(new Phaser.Rectangle(0, 0, this.spriteWidth * this.canvasZoom, this.spriteHeight * this.canvasZoom));


        //activeCellIndication.rect(0, 0, this.canvasBG.width / 2, this.canvasBG.height / 2, '#0f0');

    };

    this.resizeCanvas = function() {

        this.canvas.resize(this.spriteWidth * this.canvasZoom, this.spriteHeight * this.canvasZoom);
        this.canvasBG.resize(this.canvas.width + 2, this.canvas.height + 2);

        this.canvasBG.rect(0, 0, this.canvasBG.width, this.canvasBG.height, '#fff');
        this.canvasBG.rect(1, 1, this.canvasBG.width - 2, this.canvasBG.height - 2, '#3f5c67');

        this.canvasGrid.crop(new Phaser.Rectangle(0, 0, this.spriteWidth * this.canvasZoom, this.spriteHeight * this.canvasZoom));

    };

    this.createPreview = function() {

        this.preview = game.make.bitmapData(this.spriteWidth * this.previewSize, this.spriteHeight * this.previewSize);
        this.previewBG = game.make.bitmapData(this.preview.width + 2, this.preview.height + 2);

        this.previewBG.rect(0, 0, this.previewBG.width, this.previewBG.height, '#fff');
        this.previewBG.rect(1, 1, this.previewBG.width - 2, this.previewBG.height - 2, '#3f5c67');

        var x = this.rightCol;
        var y = 350;

        this.previewBG.addToWorld(x, y);
        this.preview.addToWorld(x + 1, y + 1);

    };

    this.resizePreview = function() {

        this.preview.resize(this.spriteWidth * this.previewSize, this.spriteHeight * this.previewSize);
        this.previewBG.resize(this.preview.width + 2, this.preview.height + 2);

        this.previewBG.rect(0, 0, this.previewBG.width, this.previewBG.height, '#fff');
        this.previewBG.rect(1, 1, this.previewBG.width - 2, this.previewBG.height - 2, '#3f5c67');

    };

    this.refresh = function() {

        //  Update both the Canvas and Preview
        this.canvas.clear();
        this.preview.clear();

        for (var y = 0; y < this.spriteHeight; y++) {
            for (var x = 0; x < this.spriteWidth; x++) {
                var i = this.data[y][x];

                if (i !== '.' && i !== ' ') {
                    this.canvas.rect(x * this.canvasZoom, y * this.canvasZoom, this.canvasZoom, this.canvasZoom, i);
                    this.preview.rect(x * this.previewSize, y * this.previewSize, this.previewSize, this.previewSize, i);
                }
            }
        }

    };

    this.createEventListeners = function() {

        keys = game.input.keyboard.addKeys(
            {
                //'erase': Phaser.Keyboard.X,
                'up': Phaser.Keyboard.UP,
                'down': Phaser.Keyboard.DOWN,
                'left': Phaser.Keyboard.LEFT,
                'right': Phaser.Keyboard.RIGHT
            }
        );

        //keys.erase.onDown.add(cls, this);
        keys.up.onDown.add(this.sendTop, this);
        keys.down.onDown.add(this.sendBottom, this);
        keys.left.onDown.add(this.sendLeft, this);
        keys.right.onDown.add(this.sendRight, this);

        game.input.mouse.capture = true;
        game.input.onDown.add(this.onDown, this);
        game.input.onUp.add(this.onUp, this);
        game.input.addMoveCallback(this.paint, this);
    };

    this.cls = function() {

        this.resetData();
        this.refresh();

    };

    this.sendLeft = function() {
        this.sendAction('left');
    };

    this.sendRight = function() {
        this.sendAction('right');
    };

    this.sendTop = function() {
        this.sendAction('top');
    };

    this.sendBottom = function() {
        this.sendAction('bottom');
    };

    this.sendAction = function(action) {
        var self = this;
        var data = {
            "from_x": this.currentX,
            "from_y": this.currentY,
            "direction": action,
            "player_name": $("#player").val()
        };
        if (!this.moveTimer) {
            this.doSend("move", data);
            this.timerCount = 1;
            this.moveTimer = setInterval(function(){
                if (self.timerLabel){
                    self.setTimerText(self.timerCount -= 0.1);
                }

                if (self.timerCount <= 0) {
                    clearInterval(self.moveTimer);
                    self.moveTimer = null;
                    self.setTimerText(0);
                }
            }, 100);
        }
    };

    this.setTimerText = function(value){
        this.timerLabel.text = "Timer: " + value;
    };

    this.increaseSize = function(sprite) {

        if (sprite.name === 'width') {
            if (this.spriteWidth === 16) {
                return;
            }

            this.spriteWidth++;
        }
        else if (sprite.name === 'height') {
            if (this.spriteHeight === 16) {
                return;
            }

            this.spriteHeight++;
        }

        this.resetData();
        this.resizeCanvas();
        this.resizePreview();

        this.widthText.text = "Current X: " + this.currentX;
        this.heightText.text = "Current Y: " + this.currentY;

    };

    this.decreaseSize = function(sprite) {

        if (sprite.name === 'width') {
            if (this.spriteWidth === 4) {
                return;
            }

            this.spriteWidth--;
        }
        else if (sprite.name === 'height') {
            if (this.spriteHeight === 4) {
                return;
            }

            this.spriteHeight--;
        }

        this.resetData();
        this.resizeCanvas();
        this.resizePreview();

        this.widthText.text = "Width: " + this.spriteWidth;
        this.heightText.text = "Height: " + this.spriteHeight;

    };

    this.increasePreviewSize = function() {

        if (this.previewSize === 16) {
            return;
        }

        this.previewSize++;
        this.previewSizeText.text = "Size: " + this.previewSize;

        this.resizePreview();
        this.refresh();

    };

    this.decreasePreviewSize = function() {

        if (this.previewSize === 1) {
            return;
        }

        this.previewSize--;
        this.previewSizeText.text = "Size: " + this.previewSize;

        this.resizePreview();
        this.refresh();

    };

    this.timerHandler = function(scope) {
        if (scope.timerLabel){
            scope.timerLabel.text = "Timer: " + (scope.timerCount -= 100);
        }

        if (scope.timerCount <= 0) {
            clearInterval(scope.moveTimer);
            scope.moveTimer = null;
        }
    };

    this.loadState = function() {
        var self = this;
        $.getJSON("http://" + gameConfig.serverName + ":" + gameConfig.port + "/state", function (data) {
            Cells = data.cells;

            self.updateFractions(data.fractions);
            self.updatePlayers(data.players);
            self.drawCells(Cells);
        });
    };

    this.drawCells = function(cells) {
        var self = this;
        $.each(cells, function (i, cell) {
            self.paint2({x: cell.x, y: cell.y, color: cell.color});
        });
    };

    this.updateFractions = function(fractions) {
        this.Fractions = fractions;
    };

    this.updatePlayers = function(players) {
        this.Players = players;
        var playersContainer = $('#players-container');
        $.each(players, function (i, player) {
            playersContainer.append('<li> <a href="#"  onClick="$(\'#player\').val(\'' + player.color + '\'); return false;">' + player.fraction + " | " + player.name + '</a></li>')
        });
    };

    this.updatePlayer = function(player) {
        this.Player = player;
        $('#player').val(player.color)
    };


    this.shiftLeft = function() {

        this.canvas.moveH(-this.canvasZoom);
        this.preview.moveH(-this.previewSize);

        for (var y = 0; y < this.spriteHeight; y++) {
            var r = data[y].shift();
            data[y].push(r);
        }

    };

    this.shiftRight = function() {

        this.canvas.moveH(this.canvasZoom);
        this.preview.moveH(this.previewSize);

        for (var y = 0; y < this.spriteHeight; y++) {
            var r = data[y].pop();
            data[y].splice(0, 0, r);
        }

    };

    this.shiftUp = function() {

        this.canvas.moveV(-this.canvasZoom);
        this.preview.moveV(-this.previewSize);

        var top = data.shift();
        this.data.push(top);

    };

    this.shiftDown = function() {

        this.canvas.moveV(this.canvasZoom);
        this.preview.moveV(this.previewSize);

        var bottom = data.pop();
        this.data.splice(0, 0, bottom);

    };

    this.onDown = function(pointer) {

        /*if (pointer.y <= 32)
         {
         setColor(game.math.snapToFloor(pointer.x, 32) / 32);
         }
         else
         {
         isDown = true;

         if (pointer.rightButton.isDown)
         {
         isErase = true;
         }
         else
         {
         isErase = false;
         }

         paint(pointer);
         }*/

    };


    this.onUp = function(pointer) {
        var x = game.math.snapToFloor(pointer.x - this.canvasSprite.x, this.canvasZoom) / this.canvasZoom;
        var y = game.math.snapToFloor(pointer.y - this.canvasSprite.y, this.canvasZoom) / this.canvasZoom;

        if (x < 0 || x >= this.spriteWidth || y < 0 || y >= this.spriteHeight) {
            return;
        }

        if (this.data[y][x] == $('#player').val() /*player.color*/) {
            this.currentX = x;
            this.currentY = y;
            this.widthText.text = "Current X: " + this.currentX;
            this.heightText.text = "Current Y: " + this.currentY;
            this.activeCellIndication.highLight(x, y);
        }
    };

    this.paint = function(pointer) {

        //  Get the grid loc from the pointer
        var x = game.math.snapToFloor(pointer.x - this.canvasSprite.x, this.canvasZoom) / this.canvasZoom;
        var y = game.math.snapToFloor(pointer.y - this.canvasSprite.y, this.canvasZoom) / this.canvasZoom;

        if (x < 0 || x >= this.spriteWidth || y < 0 || y >= this.spriteHeight) {
            return;
        }

        this.coords.text = "X: " + x + "\tY: " + y;

        if (!this.isDown) {
            return;
        }

        if (this.isErase) {
            data[y][x] = '.';
            this.canvas.clear(x * this.canvasZoom, y * this.canvasZoom, this.canvasZoom, this.canvasZoom, color);
            this.preview.clear(x * this.previewSize, y * this.previewSize, this.previewSize, this.previewSize, color);
        }
        else {
            //data[y][x] = pmap[colorIndex];
            this.canvas.rect(x * this.canvasZoom, y * this.canvasZoom, this.canvasZoom, this.canvasZoom, color);
            this.preview.rect(x * this.previewSize, y * this.previewSize, this.previewSize, this.previewSize, color);
        }

    };

    this.paint2 = function(pointer) {

        //  Get the grid loc from the pointer
        var x = pointer.x;
        var y = pointer.y;

        if (x < 0 || x >= this.spriteWidth || y < 0 || y >= this.spriteHeight) {
            return;
        }

        this.coords.text = "X: " + x + "\tY: " + y;


        if (this.isErase) {
            this.data[y][x] = '.';
            this.canvas.clear(x * this.canvasZoom, y * this.canvasZoom, this.canvasZoom, this.canvasZoom, color);
            this.preview.clear(x * this.previewSize, y * this.previewSize, this.previewSize, this.previewSize, color);
        }
        else {
            this.data[y][x] = pointer.color;
            this.canvas.rect(x * this.canvasZoom, y * this.canvasZoom, this.canvasZoom, this.canvasZoom, pointer.color);
            this.preview.rect(x * this.previewSize, y * this.previewSize, this.previewSize, this.previewSize, pointer.color);
        }

    };

    this.startWebSocket = function() {
        var self = this;
        websocket = new WebSocket("ws:/" + gameConfig.serverName + ":" + gameConfig.port + "/");
        websocket.onopen = function (evt) {
            self.onOpen(evt)
        };
        websocket.onclose = function (evt) {
            self.onClose(evt)
        };
        websocket.onmessage = function (evt) {
            self.onMessage(evt)
        };
        websocket.onerror = function (evt) {
            self.onError(evt)
        };
    };

    this.onOpen = function(evt) {
        console.log("CONNECTED");
        //doSend("WebSocket rocks");
    };

    this.onClose = function(evt) {
        console.log("DISCONNECTED");
    };

    this.onMessage = function(evt) {
        console.log(evt);
        var data = $.parseJSON(evt.data);

        if (data.cells instanceof Array) {
            this.drawCells(data.cells);
        }
    };

    this.onError = function(evt) {
        console.error(evt)
    };

    this.doSend = function(eventName, data) {
        websocket.send(JSON.stringify(
            {
                eventName: eventName,
                data: data
            }
        ));
    }
};

var gameState = new CellsGame(gameConfig);

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', gameState);
