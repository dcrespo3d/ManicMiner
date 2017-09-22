

function createMiner(x, y, lookingRight, theLevel) {
    var mw = game.add.sprite(0, 0, 'minerwilly');
    var isLookingRight = lookingRight;
    var posX = x;
    var posY = y;
    var magX = 0;
    var magY = 0;
    var phaX = 0;
    var phaY = 0;

    mw.tint = sc_white;

    var on_floor = true;
    var on_floor_prev = true;
    var headbutt = false;
    var under_wall = false;
    var jumped = false;
    var extra_step = false;

    var landed_vertically = false;  // landed vertically in this frame
    var prev_lv = false;            // landed vertically in previous frame
    var prev_2_lv = false;          // landed vertically 2 frames ago
    var inhibit_conveyor = false;
    var conveyorForce = 0;

    var speedX = 0;
    var speedY = 0;

    var forceX = 0;
    var forceY = 0;

    var tilemap;

    var level = theLevel;

    var minDepth = null;

    var FATAL_FALL_DEPTH = 40;

    mw.colrect = new Phaser.Rectangle(0,0,1,1);

    var stepLeft = function() {
        if (!isLookingRight) {
            if (!is_wall_at_left()) {
                if (forceY == 0 || !is_wall_at_top_left())
                posX -= 2;
            }
        }
        else
            forceX = 0;
        isLookingRight = false;
        updatePos();
    }

    var stepRight = function() {
        if (isLookingRight) {
            if (!is_wall_at_right()) {
                if (forceY == 0 || !is_wall_at_top_right())
                posX += 2;
            }
        }
        else
            forceX = 0;
        isLookingRight = true;
        updatePos();
    }

    var updatePos = function() {
        magX = Math.floor(posX / 8);
        mw.x = 8 * magX;

        phaX = Math.floor(posX % 8) >> 1;
        if (isLookingRight) mw.frame = phaX;
        else                mw.frame = phaX + 4;

        magY = Math.floor(posY / 8);
        phaY = Math.floor(posY % 8);

        mw.y = posY;

        mw.colrect.x = 1+posX;
        mw.colrect.y = 1+posY;
        mw.colrect.width = 8;
        mw.colrect.height = 15;
    }

    updatePos();

    mw.evaluate = function(theTilemap, leftKeyDown, rightKeyDown, upKeyDown) {

        tilemap = theTilemap;

        on_floor_prev = on_floor;

        check_on_floor();
        check_on_conveyor();
        check_under_wall();

        check_nasty();
        check_keys();
        check_on_crumb();

        if (nasty) {
            level.onWillyDied();
        }

//        console.log("on_floor:", on_floor, "on_floor_prev:", on_floor_prev);

//        if (on_floor) { console.log("ON_FLOOR");         }
//        else          { console.log("NOoOoOoT ON_FLOOR"); }

        if (on_floor) {
            if (!extra_step) {
                // when both horizontal keys pressed or released, stop inhibiting conveyors
                if (!(leftKeyDown ^ rightKeyDown)) {
                    inhibit_conveyor = false;
                    landed_vertically = prev_lv = prev_2_lv = false;
                }

                // assign 0 force when no keys, -1 for left, 1 for right, 0 for both
                forceX = 0;
                if  (leftKeyDown) forceX -= 1;
                if (rightKeyDown) forceX += 1;

                // conveyor logic. 
                if (conveyorForce != 0 && !prev_2_lv) {
                    if (inhibit_conveyor) {
                        forceX += conveyorForce;
                        if (forceX < -1) forceX = -1;
                        if (forceX >  1) forceX =  1;
                    }
                    else {
                        forceX = conveyorForce;
                    }
                }

                // delayed jump
                if (upKeyDown) {
                    if (forceX == 0)
                        forceY = -1;
                    else
                        extra_step = true;
                }
            }
            else {  // extra_step
                extra_step = false;
                forceY = -1;
            }
        }

//        console.log("forceX:", forceX);
//        console.log("speedY:", speedY);
//        console.log(framenumber);

        if (on_floor) {
            evaluate_on_floor();
        }
        else {
            prev_2_lv = prev_lv;
            prev_lv = landed_vertically;
            evaluate_on_air();
            inhibit_conveyor = true;
            landed_vertically = (forceX != 0);
        }

        updatePos();

    }

    var last_jump_sound_stop_framenumber;

    var evaluate_on_floor = function() {
        if (!on_floor_prev) {
            // console.log('pause')
            mw.jump_sound.pause();
            mw.fall_sound.pause();
            last_jump_sound_stop_framenumber = framenumber;
        }

        if (minDepth != null) {
            var fall_depth = posY - minDepth;
            minDepth = null;
            if (fall_depth >= FATAL_FALL_DEPTH) {
                level.onWillyDied();
                return;
            }
        }

        if (under_wall) {
            if (forceY === -1) {
                forceX = 0;
                forceY = 0;
            }
        }

        if      (forceX ===  1) stepRight();
        else if (forceX === -1) stepLeft();

        if (!under_wall) {
            if (forceY === -1) {
                if (framenumber != last_jump_sound_stop_framenumber)
                    mw.jump_sound.restart();
                else setTimeout(function(){
                    mw.jump_sound.restart();
                }, 40);
                // console.log('restart');
                jumped = true;
                on_floor = false;
                speedY = -4;
                posY += Math.floor(speedY);
                speedY += 0.5;
                forceY = 0;
            }
        }
    }

    var evaluate_on_air = function() {
        if (minDepth == null)
            minDepth = posY;
        else if(minDepth > posY)
                minDepth = posY;

        if (!jumped) {
            forceX = 0;
            speedY = 4;
        }
        if (on_floor_prev) {
            if (jumped) ;
            else        mw.fall_sound.restart();
        }

        if (headbutt) {
            headbutt = false;
            jumped = false;
            speedY = 4;
            posY += Math.floor(speedY);
            mw.jump_sound.pause();
            mw.fall_sound.restart();
        }
        else if (under_wall) {
            speedY = 0;
            headbutt = true;
            forceX = 0;
        }
        else {
            if      (forceX ===  1) stepRight();
            else if (forceX === -1) stepLeft();

            posY += Math.floor(speedY);
            speedY += 0.5;

            if (speedY > 4) {
                speedY = 4;
                forceX = 0;
            }
        }

    }

    var sblocks = [];

    var tile_at = function(i,j) {
        return tilemap.tileAt(i + magX, j + magY);
    }

    var type_at = function(i,j) {
        var t = tilemap.typeAt(i + magX, j + magY);
        return t;
    }

    var floor_at = function(i,j) {
        var t = tilemap.typeAt(i + magX, j + magY);
        return (t == TILE_FLOOR || t == TILE_WALL || t == TILE_CONV || t == TILE_CONV2 || t == TILE_CRUMB || t == TILE_EXTRA);
    }

    var wall_at = function(i,j) {
        var t = tilemap.typeAt(i + magX, j + magY);
        return (t == TILE_WALL);
    }

    var key_at = function(i,j) {
        var t = tilemap.typeAt(i + magX, j + magY);
        return (t == TILE_KEY);
    }

    var crumb_at = function(i,j) {
        var t = tilemap.typeAt(i + magX, j + magY);
        return (t == TILE_CRUMB);
    }

    var conveyor_at = function(i,j) {
        var t = tilemap.typeAt(i + magX, j + magY);
        return (t == TILE_CONV || t == TILE_CONV2);
    }

    var left_conveyor_at = function(i,j) {
        var t = tilemap.typeAt(i + magX, j + magY);
        return (t == TILE_CONV);
    }

    var right_conveyor_at = function(i,j) {
        var t = tilemap.typeAt(i + magX, j + magY);
        return (t == TILE_CONV2);
    }

    var nasty_at = function(i,j) {
        var t = tilemap.typeAt(i + magX, j + magY);
        return (t == TILE_NASTY || t == TILE_NAST2);
    }

    var check_on_floor = function() {
        on_floor = false;
        if (speedY < 0) return;

        if (extra_step) {
            on_floor = true;
            return;
        }

        if (0 != phaY) return;

        if (floor_at(0,2) || floor_at(1,2)) {
            on_floor = true;
            headbutt = false;
            jumped = false;
            speedY = 0;
        }
    };

    var check_under_wall = function() {
        under_wall = false;
        
        if (0 != phaY) return;

        if (wall_at(0,-1) || (wall_at(1,-1)))
            under_wall = true;
    }

    var is_wall_at_left = function() {
        var res = false;

        if (0 != phaX) return res;

        if (0 == phaY) {
            if (wall_at(-1,0) || wall_at(-1,1))
                res = true;
        }
        else {
            if (wall_at(-1,0) || wall_at(-1,1) || wall_at(-1,2)) {
                res = true;

                if (4 == phaY && -3.5 == speedY) {
                    if (!wall_at(-1,0) && !wall_at(-1,1))
                        res = false;
                }
            }
        }
        return res;
    }

    var is_wall_at_top_left = function() {
        if (0 != phaX)
            return false;

        if (0 == phaY && wall_at(-1,-1))
            return true;

        return false;
    }

    var is_wall_at_right = function() {
        var res = false;

        if (3 != phaX) return res;

        if (0 == phaY) {
            if (wall_at(2,0) || wall_at(2,1))
                res = true;
        }
        else {
            if (wall_at(2,0) || wall_at(2,1) || wall_at(2,2)) {
                res = true;

                if (4 == phaY && -3.5 == speedY) {
                    if (!wall_at(2,0) && !wall_at(2,1))
                        res = false;
                }
            }
        }
        return res;
    }

    var is_wall_at_top_right = function() {
        if (3 != phaX)
            return false;

        if (0 == phaY && wall_at(2,-1))
            return true;

        return false;
    }

    var check_on_conveyor = function() {
        conveyorForce = 0;

        if (!on_floor)
            return;

        if ( left_conveyor_at(0,2) ||  left_conveyor_at(1,2)) conveyorForce -= 1;
        if (right_conveyor_at(0,2) || right_conveyor_at(1,2)) conveyorForce += 1;
    };

    var check_on_crumb = function() {
        if (!on_floor)
            return;

        if (crumb_at(0,2)) level.onCrumbHit(magX+0, magY+2);
        if (crumb_at(1,2)) level.onCrumbHit(magX+1, magY+2);

        // para que se caigan todos al pasar andando
        if (forceX > 0 && phaX == 0 && crumb_at(-1,2)) level.onCrumbHit(magX-1, magY+2);
        if (forceX < 0 && phaX == 3 && crumb_at( 2,2)) level.onCrumbHit(magX+2, magY+2);
    } 

    var check_nasty = function() {
        nasty = false;
        var di = 2;
        var dj = 2;
        if (phaY != 0) dj = 3;
        for (j = 0; j < dj; j++) {
            for (i = 0; i < di; i++) {
                if (nasty_at(i,j)) {
                    nasty = true;
                }
            }
        }
    }

    var check_keys = function() {
        var di = 2;
        var dj = 2;
        if (phaY != 0) dj = 3;
        for (j = 0; j < dj; j++) {
            for (i = 0; i < di; i++) {
                if (key_at(i,j)) {
                    level.onKeyFoundAt(magX+i,magY+j);
                }
            }
        }
    }

    return mw;
}

