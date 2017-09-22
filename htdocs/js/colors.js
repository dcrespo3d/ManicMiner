
// bits in attribute byte
// +---+---+---+---+---+---+---+---+
// | Extra | Background| Foreground|
// +---+---+---+---+---+---+---+---+
// |fla|bri|gre|red|blu|gre|red|blu|
// +---+---+---+---+---+---+---+---+
// | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
// +---+---+---+---+---+---+---+---+
// |MSB|                       |LSB|
// +---+                       +---+

// spectrum colors

var sc_black    = 0x000000;
var sc_blue     = 0x0000C0;
var sc_red      = 0xC00000;
var sc_magenta  = 0xC000C0;
var sc_green    = 0x00C000;
var sc_cyan     = 0x00C0C0;
var sc_yellow   = 0xC0C000;
var sc_white    = 0xC0C0C0;
var sc_bblack   = 0x000000;
var sc_bblue    = 0x0000FF;
var sc_bred     = 0xFF0000;
var sc_bmagenta = 0xFF00FF;
var sc_bgreen   = 0x00FF00;
var sc_bcyan    = 0x00FFFF;
var sc_byellow  = 0xFFFF00;
var sc_bwhite   = 0xFFFFFF;

var sc_colors = [
    sc_black,
    sc_blue,
    sc_red,
    sc_magenta,
    sc_green,
    sc_cyan,
    sc_yellow,
    sc_white,
    sc_bblack,
    sc_bblue,
    sc_bred,
    sc_bmagenta,
    sc_bgreen,
    sc_bcyan,
    sc_byellow,
    sc_bwhite,
];

function sc_fg_color_for_attr(attr) {
    var sc_color_index = attr & 7;
    if (attr & 64) sc_color_index += 8;
    return sc_colors[sc_color_index];
}