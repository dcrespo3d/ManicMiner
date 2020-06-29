var framenumber = 0;
var lives_counter = 2;
var high_score = 0;
var score_points = 0;
var air_value = 224;

// set this to values > 1 for slow motion debutting
var debug_slow_motion_factor = 1;

var willy_invincible = false;

// global flag to enable/disable music using the pause key
window.music_enabled = true;

var createLevel = function(level) {
    
    var leftKey, rightKey, upKey;
    var oKey, pKey, zKey, mKey;
    var leftBut, rightBut, upBut;
    var keys, conveyors, looses;
    var horizEnemies, vertEnemies, kong, eugene;

    var keys_caught;
    var exit_open;

    var miner_willy;
    var exit_sprite;

    var update_active;
    var update_air_score_active;
    var paused;
    var panel;

    var level_music;
    var willy_killed_sound;
    var willy_jump_sound;
    var willy_fall_sound;
    var air_exit_sound;

    level.preload = function() {
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
        game.load.audio('level_music', 'audio/mm_hall_mountain_king.mp3');
        game.load.audio('willy_killed', 'audio/mm_chirp.mp3');
        game.load.audio('willy_jump', 'audio/mm_jump.mp3');
        game.load.audio('willy_fall', 'audio/mm_fall.mp3');
        game.load.audio('game_over', 'audio/mm_boot.mp3');
        game.load.audio('air_exit', 'audio/mm_air.mp3');
    }

    level.create = function() {

        // console.log("CREATING LEVEL");

        level_music = game.add.audio('level_music', 0.25, true);
        willy_killed_sound = game.add.audio('willy_killed', 0.9);
        willy_jump_sound = game.add.audio('willy_jump', 0.8);
        willy_fall_sound = game.add.audio('willy_fall', 0.8);
        air_exit_sound = game.add.audio('air_exit', 0.6);

        willy_jump_sound.allowMultiple = false;

        framenumber = 0;
        keys = [];
        horizEnemies = [];
        vertEnemies = [];
        conveyors = [];
        looses = [];
        keys_caught = 0;
        exit_open = false;
        update_active = true;
        update_air_score_active = false;
        paused = false;
        level_music_played = false;

        miner_willy = null;
        exit_sprite = null;

        // scale the game 4x
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
        game.scale.setUserScale(3, 3);

        // enable crisp rendering
        game.renderer.renderSession.roundPixels = true;  
        Phaser.Canvas.setImageRenderingCrisp(game.canvas) 

        // set target FPS        
        game.time.desiredFps = 12.5;

        // level music
        if (music_enabled) {
            level_music_played = true;
            level_music.play();
        }

        // pause action
        var pauseAction = function() {
            paused = !paused;
            if (paused)
            {
                if (music_enabled) {
                    level_music.pause();
                }
                music_enabled = !music_enabled;
            }
            else if (music_enabled) {
                if (level_music_played) {
                    level_music.resume();
                }
                else {
                    level_music_played = true;
                    level_music.play();
                }
            }
        }

        // game keys
        leftKey = game.input.keyboard.addKey(Phaser.KeyCode.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.KeyCode.RIGHT);
        upKey = game.input.keyboard.addKey(Phaser.KeyCode.UP);
        oKey = game.input.keyboard.addKey(Phaser.KeyCode.O);
        pKey = game.input.keyboard.addKey(Phaser.KeyCode.P);
        zKey = game.input.keyboard.addKey(Phaser.KeyCode.Z);
        mKey = game.input.keyboard.addKey(Phaser.KeyCode.M);
        mKey.onDown.add(pauseAction);

        // more keys
        game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_ADD).onDown.add(function(){
            manic.nextLevel();
        });
        game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_SUBTRACT).onDown.add(function(){
            manic.prevLevel();
        });

        // game buttons
        upBut    = game.add.button(  0, 192, 'zmop', null, null, 0, 0, 4);
        pausebut = game.add.button( 64, 192, 'zmop', pauseAction, null, 1, 1, 5);
        leftBut  = game.add.button(128, 192, 'zmop', null, null, 2, 2, 6);
        rightBut = game.add.button(192, 192, 'zmop', null, null, 3, 3, 7);

        decorateButton(upBut);
        decorateButton(pausebut);
        decorateButton(leftBut);
        decorateButton(rightBut);

        // create background block
        createBlock(TILE_BACK, 0, 0, 32, 16);

        // create game level, including miner and enemies
        this.tilemap = tilemapFromLevelmap(this.map);
        createLevelFromTilemap(this.tilemap);

        // create game panel
        panel = createPanel(level.name);
        panel.putScore(score_points);
        panel.putLives(lives_counter);
        panel.putHighScore(high_score);
    }

    function decorateButton(but) {
        but.width  = 64;
        but.height = 64;
        but.isDown = false;
        but.onInputDown.add(function() { but.isDown = true;  });
        but.onInputUp . add(function() { but.isDown = false; });
    }


    var prev_timestamp = null;
    function debug_log_delta_frame() {
        if (prev_timestamp == null) {
            prev_timestamp = getCurrentTimeMillis();
            return;
        }
        var curr_timestamp = getCurrTimeMillis();
        var delta_frame = curr_timestamp - prev_timestamp;
        prev_timestamp = curr_timestamp;
        console.log("delta frame: " + delta_frame);
    }    

    function debug_slow_motion_skip_update() {
        if (0 == (framenumber % debug_slow_motion_factor))
            return false;
        framenumber += 1;
        return true;
    }

    level.update = function() {
        if (paused)
            return;

        // used for creating slow motion for debugging, skipping updates. 
        if (debug_slow_motion_skip_update()) return;

        if (update_active)
            update_one_frame();
        if (update_air_score_active)
            update_air_score();

        // increase frame number
        framenumber += 1;
    }

    function update_one_frame() {
        // controls states from their individual sources
        var leftActive  = leftKey.isDown  || leftBut.isDown  || oKey.isDown;
        var rightActive = rightKey.isDown || rightBut.isDown || pKey.isDown;
        var upActive    = upKey.isDown    || upBut.isDown    || zKey.isDown;

        // evaluate miner willy: control actions and its consequences
        miner_willy.evaluate(level.tilemap, leftActive, rightActive, upActive);

        // evaluate enemy collisions with willy
        for (var i = 0; i < horizEnemies.length; i++) {
            horizEnemies[i].evaluate();
            if (miner_willy.colrect.intersects(horizEnemies[i].colrect)) {
                level.onWillyDied();
                break;
            }
        }
        for (var i = 0; i < vertEnemies.length; i++) {
            vertEnemies[i].evaluate();
            if (miner_willy.colrect.intersects(vertEnemies[i].colrect)) {
                level.onWillyDied();
                break;
            }
        }
        if (kong) {
            kong.evaluate();
            if (miner_willy.colrect.intersects(kong.colrect)) {
                level.onWillyDied();
            }
        }

        // animate conveyors
        for (var i = 0; i < conveyors.length; i++) {
            var conveyor = conveyors[i];
            if (!conveyor.isLookingRight)
                conveyor.frame = (4 * level.level_index) + (framenumber & 3);
            else
                conveyor.frame = (4 * level.level_index) + 3 - (framenumber & 3);
        }

        // animate keys
        for (var i = 0; i < keys.length; i++) {
            var idx = keys[i].frame = ((i + framenumber) & 3);
            keys[i].frame = 4 * level.level_index + idx;
        }

        // animate loose terrain sinking
        for (var i = 0; i < looses.length; i++) {
            var loose = looses[i];
            if (loose.pending) {
                if (loose.firstHit) {
                    loose.firstHit = false;
                    continue;
                }
                loose.pending = false;
                if (loose.strength == 8)
                    loose.refY = loose.y;
                loose.strength--;
                if (loose.strength > 0) {
                    loose.height = loose.strength;
                    loose.y = loose.refY + 8 - loose.strength;
                }
                else {
                    loose.destroy();
                    var c = loose.coord;
                    level.tilemap.clearAt(c.i, c.j);
                }
            }
        }

        // animate exit and check intersection with it
        if (exit_open)
        {
            if (0 == (framenumber & 4)) exit_sprite.frame = 2 * level.level_index + 1;
            else                        exit_sprite.frame = 2 * level.level_index + 0;

            if (miner_willy.colrect.intersects(exit_sprite.colrect))
                level.onWillyExited();
        }

        // animate panel (lives, air)
        panel.update(framenumber);

        if (panel.isNoAir())
            level.onWillyDied();
    }

//    var debug_render = true;
    level.render = function() {
        if (typeof(debug_render) != 'undefined') {
            game.debug.geom(miner_willy.colrect);
            for (var i = 0; i < horizEnemies.length; i++) {
                game.debug.geom(horizEnemies[i].colrect);
            }
        }
    }

    level.onWillyExited = function() {
        update_active = false;
        exit_open = false;
        score_points += 1000;
        panel.putScore(score_points);

        mask = game.add.sprite(0, 0, 'whiteblock');
        mask.width = 256;
        mask.height = 128;
        mask.tint = 0x001040;
        mask.alpha = 0.666;

        game.camera.flash(0x00FF00,120);

        // set target FPS        
        game.time.desiredFps = 25;

        update_air_score_active = true;

        // stop and destroy music loop
        level_music.stop();
        level_music.destroy();
        willy_jump_sound.stop();
        willy_jump_sound.destroy();
        willy_fall_sound.stop();
        willy_fall_sound.destroy();

        // start playing air exit sound
        var dur = 3;
        var start = dur * panel.getAirFactor();
        var label = "" + start;
        air_exit_sound.addMarker(label, start, dur-start, 0.6);
        air_exit_sound.play(label);

    }

    function update_air_score() {
        panel.update_air_on_exit();
        if (panel.isNoAir()) {
            manic.onLevelPassed();
            update_air_score_active = false;
            air_exit_sound.stop();
        }
    }

    level.onWillyDied = function() {
        if (willy_invincible)
            return;

        // stop and destroy music loop
        level_music.stop();
        level_music.destroy();
        willy_jump_sound.stop();
        willy_jump_sound.destroy();
        willy_fall_sound.stop();
        willy_fall_sound.destroy();

        // play kill sound
        willy_killed_sound.play();

        update_active = false;
        // console.log("Willy Died!");
        game.camera.flash(0xFF0000,120);
        setTimeout(function(){
            lives_counter--;
            if (lives_counter < 0)
                manic.toGameOver();
            else
                manic.restartLevel();
        }, 120);
    }

    level.onKeyFoundAt = function(i, j) {
        // console.log("KEY FOUND", i, j);
        var tile = this.tilemap.tileAt(i, j);
        tile.tile_sprite.destroy();
        this.tilemap.clearAt(i, j);

        keys_caught ++;
        score_points += 100;
        panel.putScore(score_points);
        if (keys_caught == keys.length) {
            exit_open = true;
            if (eugene) eugene.triggered = true;
        }
    }

    level.onCrumbHit = function(i, j) {
        // console.log("LOOSE HIT", i, j);
        var tile = this.tilemap.tileAt(i, j);
        tile.tile_sprite.pending = true;
    }

    function createBlock(c, i, j, w=1, h=1) {
        var res;
        if (c === '?') res = null;
        else if (c === TILE_CONV || c === TILE_CONV2) {
            res = game.add.tileSprite(8*i, 8*j, 8*w, 8*h, 'conveyors');
            res.frame = 4 * level.level_index;
        }
        else if (c in FIXED_TILES) {
            res = game.add.tileSprite(i*8, j*8, w*8, h*8, 'tiles');
            res.frame = 8 * level.level_index + FIXED_TILES[c];
        }
        else if (c === TILE_EXIT ) {
            res = game.add.tileSprite(8*i, 8*j, 8*w, 8*h, 'exits');
            res.frame = 2 * level.level_index;
        }
        else if (c === TILE_KEY  ) {
            res = game.add.tileSprite(8*i, 8*j, 8*w, 8*h, 'items');
            res.frame = 4 * level.level_index;
        }
        return res;
    }

    function createConveyorLeft(i, j) {
        var conveyor = game.add.sprite(8*i, 8*j, 'conveyor');
        conveyor.isLookingRight = false;
        return conveyor;
    }

    function createConveyorRight(i, j) {
        var conveyor = game.add.sprite(8*i, 8*j, 'conveyor');
        conveyor.isLookingRight = true;
        return conveyor;
    }

    function tilemapFromLevelmap(levelmap) {
        var tilemap = createTilemap(32, 16);
        for (var j = 0; j < levelmap.length; j++) {
            var s = levelmap[j];
            for (var i = 0; i < s.length; i++) {
                var c = s[i];
                if (c == ' ') continue;

                var tile = {};
                tile.type = c;
                tilemap.putTileAt(i, j, tile);
            }
        }
        // debugTilemapLogType(tilemap);
        return tilemap;
    }

    function blocksInTilemapForType(tm, target) {
        res = [];
        // horiz
        for (var j = 0; j < tm.rows; j++)
        {
            var prev = ' ';
            var i0, i1;
            for (var i = -1; i < 1+tm.cols; i++)
            {
                var curr = tm.typeAt(i, j);
                if (prev != target && curr == target) {
                    i0 = i;
                }
                else if (prev == target && curr != target) {
                    i1 = i-1;
                    // console.log(target, i0, i1, j, j);
                    block = { type:target, imin:i0, imax:i1, jmin:j, jmax:j};
                    res.push(block);
                }
                prev = curr;
            }
        }
        return res;
    }

    function horizBlocksInTilemapForType(tm, target) {
        res = [];
        // horiz
        for (var j = 0; j < tm.rows; j++)
        {
            var prev = ' ';
            var i0, i1;
            var has2;
            for (var i = -1; i < 1+tm.cols; i++)
            {
                var curr = tm.typeAt(i, j);
                if (prev != target && curr == target) {
                    i0 = i;
                    has2 = false;
                }
                else if (prev == target && curr == target) {
                    i1 = i;
                    has2 = true;
                }
                else if (has2 && prev == target && curr != target) {
                    if (tm.typeAt(i1,j+1) == target) {
                        var aux = i0; i0 = i1; i1 = aux; }
                    // console.log(target, i0, i1, j, j);
                    block = { type:target, imin:i0, imax:i1, jmin:j, jmax:j};
                    res.push(block);
                }
                prev = curr;
            }
        }
        return res;
    }

    function createLevelFromTilemap(tm) {
        // create main character (miner willy)
        for (var j = 0; j < tm.rows; j++) {
            for (var i = 0; i < tm.cols; i++) {
                var type = tm.typeAt(i, j);
                if (type == TILE_MINER) {
                    miner_willy = createMiner(8*i, 8*j, true, level);
                    miner_willy.jump_sound = willy_jump_sound;
                    miner_willy.fall_sound = willy_fall_sound;
                    break;
                }
            }
        }

        // FALLBACK
        if (miner_willy == null) {
            i = level.minerPos[0];
            j = level.minerPos[1];
            right = level.minerPos[2];
            miner_willy = createMiner(8*i, 8*j, right, level);
            miner_willy.jump_sound = willy_jump_sound;
            miner_willy.fall_sound = willy_fall_sound;
        }

        // create enemies
        for (var i = 0; i < level.horizEnemyDefs.length; i++) {
            var he = level.horizEnemyDefs[i];
            var edef = {
                frame:he.frame, slow:he.slow,
                i:he.i, j:he.j,
                i1:he.ist, i2:he.ien
            }
            edef.color = sc_fg_color_for_attr(he.attr);
            var horizEnemy = createHorizEnemy(edef);
            horizEnemies.push(horizEnemy);
        }

        for (var i = 0; i < level.vertEnemyDefs.length; i++) {
            var ve = level.vertEnemyDefs[i];
            var edef = {
                frame:ve.frame, dy:ve.dy,
                i:ve.i, y:ve.y,
                ymin:ve.ymin, ymax:ve.ymax
            }
            edef.color = sc_fg_color_for_attr(ve.attr);

            var vertEnemy = createVertEnemy(edef);
            vertEnemies.push(vertEnemy);
        }

        // exceptions for levels 5, 8, 12
        eugene = except_eugene_create();
        kong = except_kong_create();
        
        // create dirt block groups
        var blocks = blocksInTilemapForType(tm, TILE_FLOOR);
        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            createBlock(b.type, b.imin, b.jmin, 1+b.imax-b.imin, 1+b.jmax-b.jmin);
        }

        // create brick block groups
        var blocks = blocksInTilemapForType(tm, TILE_WALL);
        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            createBlock(b.type, b.imin, b.jmin, 1+b.imax-b.imin, 1+b.jmax-b.jmin);
        }

        // create conveyor block groups
        var blocks = blocksInTilemapForType(tm, TILE_CONV2);
        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            var conveyor = createBlock(b.type, b.imin, b.jmin, 1+b.imax-b.imin, 1+b.jmax-b.jmin);
            conveyor.isLookingRight = true;
            conveyors.push(conveyor);
        }

        // create conveyor block groups
        var blocks = blocksInTilemapForType(tm, TILE_CONV);
        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            var conveyor = createBlock(b.type, b.imin, b.jmin, 1+b.imax-b.imin, 1+b.jmax-b.jmin);
            conveyor.isLookingRight = false;
            conveyors.push(conveyor);
        }

        except_final_barrier();

        // create other blocks individually
        for (var j = 0; j < tm.rows; j++)
        {
            for (var i = 0; i < tm.cols; i++)
            {
                var type = tm.typeAt(i, j);
                // keys
                if (type == TILE_KEY)
                {
                    var key = createBlock(type, i, j, 1, 1);
                    keys.push(key);
                    
                    var tile = tm.tileAt(i, j);
                    tile.tile_sprite = key;
                }
                // lo
                else if (type == TILE_CRUMB) {
                    var loose = createBlock(type, i, j, 1, 1);
                    loose.hit = false;
                    loose.strength = 8;
                    loose.firstHit = true;
                    loose.coord = {i:i,j:j};
                    looses.push(loose);

                    var tile = tm.tileAt(i,j);
                    tile.tile_sprite = loose;
                }
                else if (type == TILE_NASTY) {
                    createBlock(type, i, j, 1, 1);
                }
                else if (type == TILE_NAST2) {
                    createBlock(type, i, j, 1, 1);
                }
                else if (type == TILE_EXTRA) {
                    createBlock(type, i, j, 1, 1);
                }
                else if (type == TILE_EXIT) {
                    exit_sprite = createBlock(type, i, j-1, 2, 2);
                    exit_sprite.colrect = new Phaser.Rectangle(7+8*i,7+8*j,2,2);
                }
            }
        }

        // items not in map
        for (var k = 0; k < level.itemPos.length; k++)
        {
            pos = level.itemPos[k];
            i = pos[0];
            j = pos[1];

            var key = createBlock(TILE_KEY, i, j, 1, 1);
            keys.push(key);
            
            var tile = tm.tileAt(i, j);
            tile.type = TILE_KEY;
            tile.tile_sprite = key;
        }

        // FALLBACK
        if (exit_sprite == null)
        {
            i = level.exitPos[0]
            j = level.exitPos[1]
            exit_sprite = createBlock(TILE_EXIT, i, j, 2, 2);
            exit_sprite.colrect = new Phaser.Rectangle(7+8*i,7+8*j,2,2);
        }
    }

    function createHorizEnemy(def) {

        var henemy = game.add.sprite(0, 0, 'enemies');

        henemy.xmin = 8 * def.i1;
        henemy.xmax = 8 * def.i2 + 6;
        henemy.posX = 8 * def.i;
        if (def.i == def.i2)
            henemy.posX += 6;

//      if (henemy.posX - henemy.xmin < henemy.xmax - henemy.posX)
        if (def.frame == 0)
            henemy.isLookingRight = true;
        else
            henemy.isLookingRight = false;

        henemy.halfAnim = false;
        if ((level.vertEnemyDefs.length > 0) || (except_half_enemy_anim()))
            henemy.halfAnim = true;

        henemy.posY = 8 * def.j;

        henemy.tint = def.color;

        henemy.colrect = new Phaser.Rectangle(0,0,1,1);

        henemy.updatePos = function() {
            this.magX = Math.floor(this.posX / 8);
            this.x = 8 * this.magX;

            this.phaX = Math.floor(this.posX % 8) >> 1;
            var framebase = 8 * level.level_index + this.phaX; 
            if (!henemy.halfAnim) {
                if (this.isLookingRight) this.frame = framebase;
                else                      this.frame = framebase + 4;
            }
            else {
                this.frame = framebase + 4;
            }

            this.y = this.posY;

            this.colrect.x = 1+this.posX;
            this.colrect.y = 1+this.posY;
            this.colrect.width = 8;
            this.colrect.height = 15;
        }

        henemy.evaluate = function() {
            if (def.slow && (framenumber&1))
                return;

            if (!this.isLookingRight && this.posX <= this.xmin)
                this.isLookingRight = true;
            else if (this.isLookingRight && this.posX >= this.xmax)
                this.isLookingRight = false;
            else if (this.isLookingRight)
                this.posX += 2;
            else
                this.posX -= 2;

            this.updatePos();
        }

        henemy.updatePos();
        return henemy;
    }

    function createVertEnemy(def) {
        var venemy = game.add.sprite(0, 0, 'enemies');
        venemy.ymin = def.ymin;
        venemy.ymax = def.ymax;
        venemy.posX = 8 * def.i;
        venemy.posY = def.y;
        venemy.dy = def.dy;

        venemy.isLookingDown = true;
        if (venemy.dy < 0) {
            venemy.dy = -venemy.dy;
            venemy.isLookingDown = false;
        }

        venemy.tint = def.color;

        venemy.colrect = new Phaser.Rectangle(0,0,1,1);

        venemy.updatePos = function() {
            this.magX = Math.floor(this.posX / 8);
            this.x = 8 * this.magX;
            this.y = this.posY;

            this.colrect.x = 0+this.posX;
            this.colrect.y = 1+this.posY;
            this.colrect.width = 16;
            this.colrect.height = 15;
        }

        venemy.updateFrame = function() {
            var framebase = 8 * level.level_index; 
            this.frame = framebase + (framenumber & 3);
        }

        venemy.evaluate = function() {
            if (!this.isLookingDown && this.posY <= this.ymin)
                this.isLookingDown = true;
            else if (this.isLookingDown && this.posY >= this.ymax)
                this.isLookingDown = false;
            else if (this.isLookingDown)
                this.posY += this.dy;
            else
                this.posY -= this.dy;

            this.updatePos();
            this.updateFrame();
        }

        venemy.updatePos();

        except_skylab_create(venemy);

        return venemy;
    }

    function except_skylab_create(skylab) {
        if (level != level14)
            return;

        var frame = 0;
        var column = 0;
        var x0 = skylab.posX;

        skylab.updateFrame = function() {
            var framebase = 8 * level.level_index; 
            this.frame = framebase + (framenumber & 3);
            this.frame = framebase + frame;
        }

        skylab.evaluate = function() {
            if (frame == 0) {
                if (this.isLookingDown && this.posY >= this.ymax)
                    frame = 1;
                else
                    this.posY += this.dy;
            }
            else {
                frame += 1;
                if (frame > 7) {
                    frame = 0;
                    this.posY = this.ymin;
                    column += 1;
                    if (column > 3)
                        column = 0;
                    this.posX = x0 + 64 * column;
                    if (this.posX >  256)
                        this.posX -= 256;
                }
            }

            this.updatePos();
            this.updateFrame();
        }
    }

    function except_eugene_create() {
        if (level != level5)
            return;

        var edef = {
            frame:0, dy:1,
            i:15, y:1,
            ymin:1, ymax:87
        }
        edef.color = sc_white;

        var eugene = createVertEnemy(edef);
        eugene.loadTexture('extras', 3);
        eugene.triggered = false;

        var colorIndex = 7;

        eugene.updateFrame = function() {
            if (eugene.triggered) {
                eugene.tint = sc_colors[colorIndex--];
                if (colorIndex < 0) colorIndex = 7;
            }
        };

        eugene.base_evaluate = eugene.evaluate;
        eugene.evaluate = function() {
            if (!eugene.triggered) {
                eugene.base_evaluate();
                return;
            }

            if (this.posY < this.ymax)
                this.posY += this.dy;

            this.updatePos();
            this.updateFrame();
        }


        vertEnemies.push(eugene);

        return eugene;
    }

    function except_final_barrier() {
        if (level != level20)
            return;

        game.add.tileSprite(0, 0, 152, 64, 'main');
        game.add.tileSprite(152, 0, 104, 40, 'main').tilePosition.x = -152;
        game.add.tileSprite(168, 40, 8, 24, 'main').tilePosition = {x:-168,y:-40};
    }

    function except_half_enemy_anim() {
        if (level != level8 && level != level12)
            return false;
        else
            return true;
    }

    function except_kong_create() {
        if (level != level8 && level != level12)
            return;

        var framebase = 8 * level.level_index; 

        var kong = game.add.sprite(0, 0, 'enemies');
        kong.ymin = 0;
        kong.ymax = 88;
        kong.posX = 8 * 15;
        kong.posY = 0;

        kong.tint = sc_bgreen;
        kong.colrect = new Phaser.Rectangle(0,0,1,1);

        // remove wall
        level.tilemap.clearAt(17,11);
        level.tilemap.clearAt(17,12);
        // create fake wall
        fakewall = game.add.tileSprite(17*8, 11*8, 1*8, 2*8, 'tiles', 3 + framebase);

        // remove kong floor
        level.tilemap.clearAt(15,2);
        level.tilemap.clearAt(16,2);
        // create fake floor
        fakefloor = game.add.tileSprite(15*8, 2*8, 2*8, 1*8, 'tiles', 1 + framebase);

        // remove lever1 tile
        level.tilemap.clearAt(6,0);
        // add lever 1 sprite
        lever1 = game.add.sprite(4+6*8, 0*8, 'tiles', 7 + framebase);
        lever1.anchor.x = 0.5;
        lever1.colrect = new Phaser.Rectangle(6*8,0,8,8);
        lever1.activated = false;

        // remove lever2 tile
        level.tilemap.clearAt(18,0);
        // add lever 2 sprite
        lever2 = game.add.sprite(4+18*8, 0*8, 'tiles', 7 + framebase);
        lever2.anchor.x = 0.5;
        lever2.colrect = new Phaser.Rectangle(18*8,0,8,8);
        lever2.activated = false;

        horizEnemy1xmaxFinal = horizEnemies[1].xmax + 24;

        // flag for first update
        first_update = true;

        kong.updatePos = function() {
            this.magX = Math.floor(this.posX / 8);
            this.x = 8 * this.magX;
            this.y = this.posY;

            this.colrect.x = 0+this.posX;
            this.colrect.y = 1+this.posY;
            this.colrect.width = 16;
            this.colrect.height = 15;
        }

        kong.updateFrame = function() {
            if (!lever2.activated)
                this.frame = framebase + ((framenumber & 15) >> 3)
            else
                this.frame = framebase + ((framenumber & 15) >> 3) + 2
        }

        kong.evaluate = function() {

            if (first_update) {
                first_update = false;
                level.tilemap.putTileAt(17,11,{type:TILE_WALL});
                level.tilemap.putTileAt(17,12,{type:TILE_WALL});
            }

            if (miner_willy.colrect.intersects(lever1.colrect))
                kong.switchLever1();

            if (miner_willy.colrect.intersects(lever2.colrect))
                kong.switchLever2();

            if (lever1.activated)
                fakewall.y -= 1;

            if (fakewall.y < 9*8) {
                fakewall.destroy();
                horizEnemies[1].xmax = horizEnemy1xmaxFinal;
            }

            if (lever2.activated)
                kong.posY += 4;

            if (kong.posY >= 104)
                kong.destroy();

            this.updatePos();
            this.updateFrame();
        }

        kong.switchLever1 = function() {
            if (lever1.activated) return;
                lever1.activated = true;

            lever1.scale.x = -1;
            level.tilemap.clearAt(17,11);
            level.tilemap.clearAt(17,12);
        }

        kong.switchLever2 = function() {
            if (lever2.activated) return;
                lever2.activated = true;

            lever2.scale.x = -1;
            fakefloor.destroy();
            kong.tint = sc_yellow
        }

        kong.updatePos();

        return kong;
    }

    return level;
};

/*
    for testing conveyor logic
        '#                   ###-----===#', // 12
        '#  ==        =======           #', // 13
        '#                            X #', // 14
        '#===<<<<<<<<<==================#', // 15
*/    
