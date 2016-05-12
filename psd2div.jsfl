var fileURI, doc, timeline, lib;

function run() {
	doc = fl.getDocumentDOM();
	timeline = doc.getTimeline();
	lib = doc.library;
	fileURI = doc.pathURI.slice(0, doc.pathURI.lastIndexOf("/") + 1);

	var _tlData = cookTimeline(timeline);

	exportHtml(_tlData.html);
}


function cookTimeline(timeline) {
	var _html = '';
	var _uniqueImg = '';
	for (var _len = timeline.layers.length, j = _len - 1; j >= 0; j--) {
		var _layer = timeline.layers[j];
		if (_layer.layerType == 'normal') {
			var elements = _layer.frames[0].elements;
			for (var i in elements) {
				var _ele = elements[i];
				var _dom = null;
				switch (_ele.elementType) {
					case 'instance':
						switch (_ele.instanceType) {
							case 'symbol':
								_dom = createDom(_ele, 'div');
								break;
							case 'bitmap':
								_uniqueImg = {
									width: _ele.width,
									height: _ele.height,
									url: exportImg(_ele.libraryItem).url
								};
								break;
						}
						break;
					case 'shape':
						break;
					case 'text':
						switch (_ele.textType) {
							case 'input':
								_dom = createDom(ele, 'input');
								break;
							default:
								_dom = createDom(ele, 'p');
								break;
						}
						break;
				}

				if (_dom) {
					_html += _dom;
				}
			}
		}
	}

	return {
		html: _html,
		img: _uniqueImg
	};
}

function exportImg(libItem) {
	//fl.trace(libItem.originalCompressionType+','+libItem.compressionType);
	var URI = 'images';
	var aURL, rURL;
	var _data = checkName(libItem.name);

	for (var i in _data.path) {
		URI += '/' + _data.path[i];
		FLfile.createFolder(fileURI + URI);
	}

	var _name = _data.name;
	switch (libItem.compressionType) {
		case 'photo':
			rURL = URI + '/' + _name + '.jpg';
			aURL = fileURI + rURL;
			break;
		case 'lossless':
			rURL = URI + '/' + _name + '.png';
			aURL = fileURI + rURL;
			break;
	}
	libItem.exportToFile(aURL, 100);

	return {
		name: libItem.name,
		url: rURL
	};
}

function exportHtml(text) {
	var _fileURL = fileURI + 'index.html';
	var _text = '<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title></title><style>body,div,ul,li,img,p,a,h1,h2,h3,input,span{margin:0px;padding:0px;border:0px;}html,body{background:' + doc.backgroundColor + '}div{position:absolute;top:0px;left:0px;}</style></head><body>' + text + '</body></html>';
	FLfile.write(_fileURL, _text);
}

function createDom(ele, type, img) {
	var _a = Math.round(ele.colorAlphaPercent) / 100;
	var _r = Math.round(ele.rotation);
	var _sx = Math.round(ele.scaleX * 100) / 100;
	var _sy = Math.round(ele.scaleY * 100) / 100;
	var _kx = Math.round(ele.skewX);
	var _ky = Math.round(ele.skewY);

	if (!isNaN(_r)) {
		ele.rotation = 0;
	} else {
		ele.skewX = 0;
		ele.skewY = 0;
	}
	ele.scaleX = 1;
	ele.scaleY = 1;

	var _w = Math.round(ele.width);
	var _h = Math.round(ele.height);
	var _x = Math.round(ele.x);
	var _y = Math.round(ele.y);
	var _tx = Math.round(ele.transformX);
	var _ty = Math.round(ele.transformY);


	switch (type) {
		case "div":
			var _tlData = cookTimeline(ele.libraryItem.timeline);
			break;
	}


	if (!isNaN(_r)) {
		ele.rotation = _r;
	} else {
		ele.skewX = _kx;
		ele.skewY = _ky;
	}
	ele.scaleX = _sx;
	ele.scaleY = _sy;

	var _cName, _html = '',
		_css = '';

	switch (type) {
		case 'div':
		case 'input':
		case 'p':
			_cName = ele.name;
			break;
	}
	_cName = _cName != '' ? 'class="' + _cName + '"' : '';

	if (_x != 0) _css += "left:" + _x + "px;";
	if (_y != 0) _css += "top:" + _y + "px;";

	switch (type) {
		case "div":
			if (_tlData.img) {
				_css +=
					"width:" + Math.round(_tlData.img.width) + "px;" +
					"height:" + Math.round(_tlData.img.height) + "px;" +
					"background:url('" + _tlData.img.url + "');";
			}
			break;
		case "img":
			_css +=
				"width:" + _w + "px;" +
				"height:" + _h + "px;" +
				"background:url('" + img + "');";
			break;
		case "input":
		case "p":
			_css +=
				"width:" + _w + "px;" +
				"height:" + _h + "px;";
			break;
	}

	if (_a < 1) {
		_css +=
			"opacity:" + _a + ";";
	}

	var _tf = "";
	if (!isNaN(_r)) {
		if (_r != 0) {
			_tf += " rotate(" + _r + "deg)";
		}
	} else if (!isNaN(_kx) && !isNaN(_ky)) {
		//_tf += "skew(" + _kx + "deg," + _ky + "deg) ";
	}

	if (_sx !== 1 || _sy !== 1) {
		_tf += " scale(" + _sx + "," + _sy + ")";
	}

	if (_tf !== "") {
		_css +=
			"transform-origin:" + (_tx - _x) + "px " + (_ty - _y) + "px;" +
			"-webkie-transform-origin:" + (_tx - _x) + "px " + (_ty - _y) + "px;" +
			"transform:" + _tf + ";" +
			"-webkie-transform:" + _tf + ";";
	}


	switch (type) {
		case "div":
			if (_css == '') {
				_html = '<div ' + _cName + '>' + _tlData.html + '</div>';
			} else {
				_html = '<div ' + _cName + ' style="' + _css + '">' + _tlData.html + '</div>';
			}
			break;
		case "input":
			_html = '<input type="text" ' + _cName + ' style="' + _css + '"/>';
			break;
		case "p":
			_html = '<p ' + _cName + ' style="' + _css + '">' + ele.getTextString() + '</p>';
			break;
	}

	return _html;
}

var cid = 0;
function createClassName(name) {
	var _name = isNaN(parseInt(name[0])) ? name : ('p' + name);
	return checkUnique(_name) ? _name : (_name + '_' + ++cid);
}

var uniqueName = [];
function checkUnique(name) {
	for (var i in uniqueName) {
		if (uniqueName[i] == name) {
			return false;
		}
	}
	uniqueName.push(name);
	return true;
}

function checkName(name) {
	var _a = name.split("/");
	for (var _len = _a.length, i = _len - 1; i >= 0; i--) {
		var _t = _a[i];
		var _n1 = _t.indexOf("Assets");
		if (_n1 >= 0) {
			_a.splice(i, 1);
		} else {
			var _n2 = _t.lastIndexOf(".");
			_t = _n2 >= 0 ? _t.slice(0, _n1) : _t;
			_t = _t.replace(/[\.\s]/g, "_");
			_a[i] = _t;
		}
	}
	var _name = _a.pop();

	return {
		path: _a,
		name: _name
	};
}


run();