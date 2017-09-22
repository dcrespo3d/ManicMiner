function createText(i, j, text, spectrum_color) {
    var textblock = game.add.group();
    textblock.chars = [];
    for (var ic = 0; ic < text.length; ic++) {
        var asc = text.charCodeAt(ic);
        // console.log(text[ic], asc);
        if (asc <= 32 || asc >= 128) continue;
        var x = 8 * (i + ic);
        var y = 8 * j;
        var charblock = textblock.create(x, y, 'charset');
        charblock.frame = asc - 32;
        charblock.tint = spectrum_color;
        textblock.chars.push(charblock);
    }
    return textblock;
}

var prev_extra_life_score = 0;

function createPanel(level_name)
{
    var panel = {}

    var air_sprite;

    if (window.localStorage && window.localStorage.getItem("highscore"))
        high_score = window.localStorage.getItem("highscore");

    function initialize()
    {
        createSolidBlock(0, 16, 32, 1, sc_yellow);    
        createSolidBlock(0, 17, 10, 1, sc_bred);    
        createSolidBlock(10, 17, 22, 1, sc_bgreen);

        createCenteredText(16, level_name, sc_black);
        createText(0, 17, "AIR", sc_bwhite);

        air_sprite = createAirBlock(4, 17);
        air_value = 224;

        createText(0, 19, "High Score", sc_byellow);    
        putHighScore(high_score);
        createText(20, 19, "Score", sc_byellow);    
        putScore(0);

        putLives(2);
    }
    
    function createSolidBlock(i, j, di, dj, spectrum_color) {
        var block = game.add.sprite(8*i, 8*j, 'whiteblock');
        block.scale.x = 8*di; 
        block.scale.y = 8*dj; 
        block.tint = spectrum_color;
    }

    function createCenteredText(j, text, spectrum_color) {
        var i = Math.floor((33 - text.length) / 2);
        createText(i, j, text, spectrum_color);
    }

    function createAirBlock(i, j) {
        var block = game.add.sprite(8*i, 2+8*j, 'whiteblock');
        block.scale.y = 4; 
        block.tint = sc_bwhite;
        return block;
    }


    var score_panel;
    var high_score_panel;

    function scoreStringFromNumber(num) {
        var s = "";
        s += Math.floor(num / 100000) % 10;
        s += Math.floor(num /  10000) % 10;
        s += Math.floor(num /   1000) % 10;
        s += Math.floor(num /    100) % 10;
        s += Math.floor(num /     10) % 10;
        s += Math.floor(num /      1) % 10;
        return s;
    }

    function putScore(val) {
        if (score_panel !== undefined) {
            score_panel.destroy();
        }
        score_panel = createText(26, 19, scoreStringFromNumber(val), sc_byellow);
        check_score_for_extra_life();
    }

    function putHighScore(val) {
        if (high_score_panel !== undefined) {
            high_score_panel.destroy();
        }
        high_score_panel = createText(11, 19, scoreStringFromNumber(val), sc_byellow);
    }

    var extra_life_points = 10000;

    function check_score_for_extra_life() {
        // discard value from previous games
        if (prev_extra_life_score > score_points)
            prev_extra_life_score = 1;

        // give extra life when range exceeded
        if (score_points - prev_extra_life_score >= extra_life_points) {
            prev_extra_life_score += extra_life_points;
            lives_counter += 1;
        }
    }

    var lives_panel;

    function putLives(val) {
        if (lives_panel !== undefined) {
            lives_panel.destroy();
        }
        lives_panel = game.add.group();
        for (var i = 0; i < val; i++) {
            var life = lives_panel.create(16*i, 21*8, 'minerwilly');
            life.tint = sc_bcyan;
        }
    }

    function update(framenumber) {
        // update air
        if (air_value >= 0)
            air_sprite.scale.x = air_value;
        else
            air_sprite.scale.x = 0;

        if ((framenumber & 7) == 4)
            air_value --;
            
        // update lives
        var v03 = (framenumber & 15) >> 2;
        for (var i = 0; i < lives_panel.length; i++) {
            var life = lives_panel.getAt(i);
            life.frame = v03; 
        }
    }

    function update_air_on_exit() {
        if (air_value >= 0) {
            air_value    -= 3;
            score_points += 24;
            air_sprite.scale.x = air_value > 0 ? air_value : 0;
            putScore(score_points);
        }
    }

    initialize();

    panel.putHighScore = putHighScore;
    panel.putScore = putScore;
    panel.putLives = putLives;
    panel.update = update;

    panel.update_air_on_exit = update_air_on_exit;

    panel.isNoAir = function() {
        return air_value < 0;
    }

    panel.getAirFactor = function() {
        if (air_value > 0) {
            var val = (224 - air_value) / 224;
            val -= 0.2;
            if (val < 0) val = 0;
            val /= 0.8;
            return val;
        }
        else
            return 0;
    }

    return panel;
}

