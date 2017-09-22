var vpW = 256;
var vpH = 256; 

var transparent = false;
var antialias = false;

var game = new Phaser.Game(vpW, vpH, Phaser.CANVAS, 'phaser-example', this, transparent, antialias);

//  00 01 02 03
//  10 11 12 13
//  20 21 22 23
//  30 31 32 33

//  6031769

// 0 Background
// 1 Floor
// 2 Crumbling Floor
// 3 Wall
// 4 Conveyor
// 5 Nasty 1
// 6 Nasty 2
// 7 Extra

TILE_BACK  = ' '
TILE_FLOOR = '='
TILE_CRUMB = '-'
TILE_WALL  = '#'
TILE_CONV  = '<'
TILE_CONV2 = '>'
TILE_NASTY = '*'
TILE_NAST2 = 'V'
TILE_EXTRA = 'E'
TILE_KEY   = '$'
TILE_EXIT  = 'X'
TILE_MINER = 'M'

FIXED_TILES = {
    ' ' : 0,
    '=' : 1,
    '-' : 2,
    '#' : 3,
    '<' : 4,
    '>' : 4,
    '*' : 5,
    'V' : 6,
    'E' : 7
}

// manic is the Manic Miner game instance
var manic = (function(){
    var manic = {};

    var currentLevel;

    var levels = [
        level1,
        level2,
        level3,
        level4,
        level5,
        level6,
        level7,
        level8,
        level9,
        level10,
        level11,
        level12,
        level13,
        level14,
        level15,
        level16,
        level17,
        level18,
        level19,
        level20,
    ];

    for (var i = 0; i < levels.length; i++) {
        var level = levels[i];
        level.level_index = i;
        level.tag = 'level' + (1 + i);

        game.state.add(level.tag, level);
    }

    var gameover = create_gameover();

    game.state.add('gameover', gameover);

    ////

    manic.startGame = function(startLevel = 0) {
        currentLevel = startLevel;       // <<<<######################
        score_points = 0;
        lives_counter = 2;
        air_value = 224;
        game.state.start(levels[currentLevel].tag); 
    }

    manic.restartLevel = function() {
        game.state.start(levels[currentLevel].tag); 
    }

    manic.nextLevel = function() {
        currentLevel++;
        while (currentLevel >= levels.length)
            currentLevel -= levels.length;
        manic.restartLevel();
    }

    manic.prevLevel = function() {
        currentLevel--;
        while (currentLevel < 0)
            currentLevel += levels.length;
        manic.restartLevel();
    }

    manic.toGameOver = function() {
        gameover.nextstate = 'modern';
        gameover.levelname = levels[currentLevel].name;
        game.state.start('gameover');
    }

    manic.onLevelPassed = function() {
        menu.markLevelPassed(currentLevel);
        manic.nextLevel();
    }

    var menu = createMenuModern();

    game.state.add('modern', menu);
    game.state.start('modern');

    // explicit call to restart to start first level
//    manic.startGame();

    return manic;
})();







var ts_ref_secs = 0;
var getCurrTimeMillis = function() {
    var now = new Date;
    var nowsecs = now.getSeconds();
    var nowmillis = now.getMilliseconds();

    if (0 === ts_ref_secs) {
        // console.log("getCurrTimeMillis: setting reference time")
        ts_ref_secs = nowsecs;
        return nowmillis; 
    }

    return 1000 * (nowsecs - ts_ref_secs) + nowmillis;
};

var prev_timestamp = getCurrTimeMillis();

    


