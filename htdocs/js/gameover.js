function create_gameover() {
    var panel;
    var bg;
    var boot;
    var bootFinalY = 96;
    var leg;
    var miner;

    var state;
    var frame;

    var txtgame;

    var gameover = {
        create: function() {
            // set target FPS        
            game.time.desiredFps = 25;

            var prev_air_value = air_value;

            if (high_score < score_points) {
                high_score = score_points;
                window.localStorage.setItem("highscore", high_score);
            }

            panel = createPanel(gameover.levelname);
            panel.putLives(lives_counter);
            panel.putScore(score_points);
            panel.putHighScore(high_score);

            air_value = prev_air_value;
            bg = game.add.sprite(0, 0, 'whiteblock');
            bg.scale = {x:256,y:128};
            clridx = 8;

            game.add.sprite(120, 112, 'extras', 1);
            boot = game.add.sprite(120, 0, 'extras', 2);
            leg = game.add.tileSprite(120, 0, 16, 0, 'leg', 2);
            miner = game.add.tileSprite(120, 96, 16, 16, 'minerwilly', 2);

            state = 1;
            frame = 0;

            game.add.audio('game_over').play();
        },
        update: function() {
            panel.update(framenumber & 0xFFFFFFF0);

            if (state == 1) {
                bg.tint = sc_colors[clridx];
                clridx += 1; if (clridx > 11) clridx = 8;

                boot.y += 2;
                leg.height = boot.y;
                var mh = bootFinalY - boot.y;
                if (0 <= mh && mh <= 16) {
                    miner.y = boot.y + 16;
                    miner.height = mh;
                    miner.tilePosition.y = mh;
                }
                if (bootFinalY == boot.y) {
                    state = 2;
                    txtgame = createText(10, 7, 'Game   Over', sc_white);
                    bg.tint = sc_colors[0];
                }
            }
            else if (state == 2) {
                for (var i = 0; i < txtgame.chars.length; i++) {
                    var char = txtgame.chars[i];
                    var idx = (i + 5*frame) % 8;
                    char.tint = sc_colors[idx];
                }
                frame += 1;
                if (frame == 50) {
                    game.state.start(gameover.nextstate);
                }
            }

        },
    }

    gameover.levelname = "";

    return gameover;
};

