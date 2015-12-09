var CellsGame = function(config) {
    var game = this;

    var CellIndication = function (color) {
        this.bitMapData = game.game.make.bitmapData(game.spriteWidth * game.canvasZoom, game.spriteHeight * game.canvasZoom);

        this.addToWorld = function (x, y) {
            this.bitMapData.addToWorld(x, y);
        };

        this.highLight = function (x, y) {
            this.bitMapData.clear();
            this.bitMapData.rect(x * game.canvasZoom + 1, y * game.canvasZoom + 1, game.canvasZoom, game.canvasZoom, color);
            this.bitMapData.clear(x * game.canvasZoom + 2, y * game.canvasZoom + 2, game.canvasZoom - 2, game.canvasZoom - 2, '#000');
        };
    };

    var storage = {
        cells : [],
        fractions : [],
        players : [],
        updateCells : function(cells){
            this.cells = cells;
        },
        updateFractions : function(fractions) {
            this.fractions = fractions;
        },

        updatePlayers : function(players) {
            this.players = players;
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
    this.widthUp = null;
    this.widthDown = null;
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
    this.messageDispatcherService = 0;
    this.Player = 0;

    this.create = function() {
        Phaser.Canvas.setUserSelect(this.game.canvas, 'none');
        Phaser.Canvas.setTouchAction(this.game.canvas, 'none');
        game.createUI();
        game.createDrawingArea();
        game.createPreview();
        game.activeCellIndication = new CellIndication('#0f0');
        game.activeCellIndication.addToWorld(10, 10);
        game.createEventListeners();
        game.resetData();
        game.doSendRequest('request_state', {});
        game.$scope.$on('messageReceived', function (e, data) {
            game.onMessage(data);
        });
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

        this.game.create.grid('uiGrid', 32 * 16, 32, 32, 32, 'rgba(255,255,255,0.5)');

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

        this.game.create.texture('plus', plus, 3);
        this.game.create.texture('minus', minus, 3);


        this.ui = this.game.make.bitmapData(800, 32);

        this.ui.addToWorld();

        var style = {font: "20px Calibri", fill: "#fff", tabs: 80};

        this.coords = this.game.add.text(this.rightCol, 8, "X: 0\tY: 0", style);

        this.timerLabel = this.game.add.text(this.rightCol + 150, 8, "Timer: 0", style);

        this.previewSizeText = this.game.add.text(this.rightCol, 320, "Size: " + this.previewSize, style);

        this.previewSizeUp = this.game.add.sprite(this.rightCol + 180, 320, 'plus');
        this.previewSizeUp.inputEnabled = true;
        this.previewSizeUp.input.useHandCursor = true;
        this.previewSizeUp.events.onInputDown.add(this.increasePreviewSize, this);

        this.previewSizeDown = this.game.add.sprite(this.rightCol + 220, 320, 'minus');
        this.previewSizeDown.inputEnabled = true;
        this.previewSizeDown.input.useHandCursor = true;
        this.previewSizeDown.events.onInputDown.add(this.decreasePreviewSize, this);

    };

    this.createDrawingArea = function() {

        game.game.stage.backgroundColor = '#505050';
        this.game.create.grid('drawingGrid', 16 * this.canvasZoom, 16 * this.canvasZoom, this.canvasZoom, this.canvasZoom, 'rgba(0,191,243,0.3)');

        this.canvas = this.game.make.bitmapData(this.spriteWidth * this.canvasZoom, this.spriteHeight * this.canvasZoom);
        this.canvasBG = this.game.make.bitmapData(this.canvas.width + 2, this.canvas.height + 2);

        this.canvasBG.rect(0, 0, this.canvasBG.width, this.canvasBG.height, '#fff');
        this.canvasBG.rect(1, 1, this.canvasBG.width - 2, this.canvasBG.height - 2, '#3f5c67');

        var x = 10;
        var y = 10;

        this.canvasBG.addToWorld(x, y);
        this.canvasSprite = this.canvas.addToWorld(x + 1, y + 1);
        this.canvasGrid = this.game.add.sprite(x + 1, y + 1, 'drawingGrid');
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

        this.preview = this.game.make.bitmapData(this.spriteWidth * this.previewSize, this.spriteHeight * this.previewSize);
        this.previewBG = this.game.make.bitmapData(this.preview.width + 2, this.preview.height + 2);

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

        keys = this.game.input.keyboard.addKeys(
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

        this.game.input.mouse.capture = true;
        this.game.input.onDown.add(this.onDown, this);
        this.game.input.onUp.add(this.onUp, this);
        this.game.input.addMoveCallback(this.paint, this);
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
        var data = {
            "from_x": this.currentX,
            "from_y": this.currentY,
            "direction": action,
            "player_name": this.userService.player.color
        };
        if (!this.moveTimer) {
            this.doSendAction("move", data);
            this.timerCount = 1;
            this.moveTimer = setInterval(function(){
                if (game.timerLabel){
                    game.setTimerText(game.timerCount -= 0.1);
                }

                if (game.timerCount <= 0) {
                    clearInterval(game.moveTimer);
                    game.moveTimer = null;
                    game.setTimerText(0);
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

    this.drawCells = function(cells) {
        $.each(cells, function (i, cell) {
            game.drawCell({x: cell.x, y: cell.y, color: cell.color});
        });
    };

    this.onDown = function(pointer) {
    };

    this.onUp = function(pointer) {
        var x = this.game.math.snapToFloor(pointer.x - this.canvasSprite.x, this.canvasZoom) / this.canvasZoom;
        var y = this.game.math.snapToFloor(pointer.y - this.canvasSprite.y, this.canvasZoom) / this.canvasZoom;

        if (x < 0 || x >= this.spriteWidth || y < 0 || y >= this.spriteHeight) {
            return;
        }

        if (this.data[y][x] == this.userService.player.color) {
            this.currentX = x;
            this.currentY = y;
            this.activeCellIndication.highLight(x, y);
        }
    };

    this.paint = function(pointer) {

        //  Get the grid loc from the pointer
        var x = this.game.math.snapToFloor(pointer.x - this.canvasSprite.x, this.canvasZoom) / this.canvasZoom;
        var y = this.game.math.snapToFloor(pointer.y - this.canvasSprite.y, this.canvasZoom) / this.canvasZoom;

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

    this.drawCell = function(pointer) {

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

    this.onMessage = function(data) {
        if (data.cells_created) {
            this.drawCells(data.cells_created);
        }
        if (data.cells_removed) {
            this.drawCells(data.cells_removed);
        }
    };

    this.doSendAction = function(actionName, actionData) {
        this.messageDispatcherService.sendMessage({
            action_name: actionName,
            action_data: actionData
        });
    };

    this.doSendRequest = function(requestName, requestData) {
        this.messageDispatcherService.sendMessage({
            request_name: requestName,
            request_data: requestData
        });
    };
};