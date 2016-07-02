var global = require('./globals');

class Canvas {
	constructor(params) {
		this.cv = document.getElementById('cvs');
		this.cv.width = global.screenWidth;
		this.cv.height = global.screenHeight;
		this.cv.parent = self;
		global.canvas = this;
	}
}

module.exports = Canvas;