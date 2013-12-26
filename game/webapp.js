var {Application} = require("stick");
var log = require('ringo/logging').getLogger(module.id);

var app = exports.app = Application();
app.configure("static");
app.static(module.resolve('./'), "index.html");

var startUp = exports.startUp = function() {
   require("ringo/httpserver").main(module.id);
};

// Script run from command line
if (require.main === module) {
    startUp();
}


