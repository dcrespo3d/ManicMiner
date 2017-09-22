function createTilemap(cols,rows) {
    var tm = {};
    tm._p_arr = [];

    tm.cols = cols;
    tm.rows = rows;

    tm.putTileAt = function(i, j, tile) {
        if (i < 0 || i >= cols) return;
        if (j < 0 || j >= cols) return;
        if (!(j in tm._p_arr)) tm._p_arr[j] = [];
        tm._p_arr[j][i] = tile;
    }

    tm.clearAt = function(i, j) {
        tm.putTileAt(i, j, { type:' ' });
    }

    tm.tileAt = function(i, j) {
        if (!(j in tm._p_arr)) tm._p_arr[j] = [];
        var row = tm._p_arr[j];
        if (!(i in row)) row[i] = { type:' ' };
        return row[i];
    }

    tm.typeAt = function(i, j) {
        if (!(j in tm._p_arr)) return ' ';
        var row = tm._p_arr[j];
        if (!(i in row)) return ' ';
        return row[i].type;
    }

    return tm;
}

function createTilemapDelta(tilemap, ref_i, ref_j) {
    var tm = {};

    tm.putTileAt = function(i, j, tile) {
        return tilemap.putTileAt(i+ref_i, j+ref_j, tile);
    }

    tm.tileAt = function(i, j) {
        return tilemap.tileAt(i+ref_i, j+ref_j);
    }

    tm.typeAt = function(i, j) {
        return tilemap.typeAt(i+ref_i, j+ref_j);
    }

    return tm;
}


function debugTilemapLog(tilemap, func) {
    var newline = '\n';

    var frameline = '';
    for (var i = 0; i < 2 + tilemap.cols; i++)
        frameline += '+';

    var res = '';
    res += frameline + newline;

    for (var j = 0; j < tilemap.rows; j++)
    {
        var line = '+';
        for (var i = 0; i < tilemap.cols; i++)
        {
            var tile = tilemap.tileAt(i, j);
            if (tile !== undefined) line += func(tile);
            else                            line += ' ';
        }
        line += '+';
        res += line + newline;
    }

    res += frameline + newline;
    console.log(res);
    return res;
}

function debugTilemapLogUsed(tilemap) {
    debugTilemapLog(tilemap, function(tile) { return 'X'; });
}

function debugTilemapLogType(tilemap) {
    debugTilemapLog(tilemap, function(tile) { return tile.type; });
}