
var createMenuModern = function() {
    var menu = {}

    var persist = window.localStorage;

    menu.preload = function() {
        game.load.spritesheet('charset', 'img/charset.png', 8, 8, 96);
        game.load.spritesheet('minerwilly', 'img/minerwilly.png', 16, 16, 8);
        game.load.image('whiteblock', 'img/1x1white.png');
        game.load.spritesheet('zmop', 'img/zmop_push.jpg', 64, 64, 8);
        game.load.spritesheet('aent', 'img/aent_push.jpg', 64, 64, 8);
        game.load.spritesheet('tiles', 'img/tiles.png', 8, 8, 160);
        game.load.spritesheet('conveyors', 'img/conveyors.png', 8, 8, 80);
        game.load.spritesheet('exits', 'img/exits.png', 16, 16, 40);
        game.load.spritesheet('items', 'img/items.png', 8, 8, 80);
        game.load.spritesheet('enemies', 'img/enemies.png', 16, 16, 160);
        game.load.spritesheet('extras', 'img/extras.png', 16, 16, 4);
        game.load.image('main', 'img/main.png');
        game.load.image('leg', 'img/leg.png');
    };

    function onbtn(e) {
        if (!openlevels[this.menu_index])
            return;

        manic.startGame(this.menu_index);
    }

    var buttons = []

    menu.markLevelPassed = function(zbi) {
        var key = 'passedlevel' + (1+zbi);
        // console.log(key);
        persist.setItem(key, true);
    }

    var passedlevels = [];
    var openlevels = [];

    function add(i,j,di,dj, label) {
        var btn = game.add.button(4+8*i, 4+8*j, 'whiteblock', onbtn);
        btn.menu_label = label;
        btn.width = 8*di;
        btn.height = 8*dj;
        btn.tint = 0x707680;

        btn.isGray = true;
        var obi = parseInt(label);
        if (!isNaN(obi)) {
            btn.menu_index = obi - 1;
        }
        
        var txtcolor = sc_bwhite;
        if (!openlevels[btn.menu_index]) {
            txtcolor = 0x9096A0;
        }
        else {
            createText(.625+i+1, .625+j+1, label, 0x404040);
            if (passedlevels[btn.menu_index])
                txtcolor = 0x90FF90;
        }
        createText(.5+i+1, .5+j+1, label, txtcolor);

        return btn;
    }

    menu.create = function() {
        // scale the game 4x
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
        game.scale.setUserScale(3, 3);

        // enable crisp rendering
        game.renderer.renderSession.roundPixels = true;  
        Phaser.Canvas.setImageRenderingCrisp(game.canvas) 

        // set target FPS        
        game.time.desiredFps = 12.5;

        // populate passed levels
        for (var zbi = 0; zbi < 20; zbi++) {
            var key = 'passedlevel' + (1+zbi);
            if (persist.getItem(key))
                passedlevels[zbi] = true;
            else
                passedlevels[zbi] = false;
        }

        // populate open levels
        var extra_to_open = 3;
        for (var zbi = 0; zbi < 20; zbi++) {
            if (passedlevels[zbi])
                openlevels[zbi] = true;
            else if (extra_to_open > 0) {
                openlevels[zbi] = true;
                extra_to_open -= 1;
            }
        }

        add(  1,  1, 14,  6, '   Easy');
        add( 16,  1, 14,  6, '  Normal');

        add(  1, 12,  5,  4, '1');
        add(  7, 12,  5,  4, '2');
        add( 13, 12,  5,  4, '3');
        add( 19, 12,  5,  4, '4');
        add( 25, 12,  5,  4, '5');

        add(  1, 17,  5,  4, '6');
        add(  7, 17,  5,  4, '7');
        add( 13, 17,  5,  4, '8');
        add( 19, 17,  5,  4, '9');
        add( 25, 17,  5,  4, '10');

        add(  1, 22,  5,  4, '11');
        add(  7, 22,  5,  4, '12');
        add( 13, 22,  5,  4, '13');
        add( 19, 22,  5,  4, '14');
        add( 25, 22,  5,  4, '15');

        add(  1, 27,  5,  4, '16');
        add(  7, 27,  5,  4, '17');
        add( 13, 27,  5,  4, '18');
        add( 19, 27,  5,  4, '19');
        add( 25, 27,  5,  4, '20');

        game.add.tileSprite(0, 0, 256, 96, 'main');
    };

    menu.update = function() {
    };
    


    return menu;
}