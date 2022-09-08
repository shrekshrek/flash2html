﻿var fileURI, doc, timeline, lib;

function run() {
	doc = fl.getDocumentDOM();
	timeline = doc.getTimeline();
	lib = doc.library;
	fileURI = doc.pathURI.slice(0, doc.pathURI.lastIndexOf("/") + 1);

	var _tlData = cookTimeline(timeline, '');

	exportHtml(_tlData.html);
	exportCss(_tlData.css);
}

function calcNum(num) {
	return Math.floor(num / 750 * 1000) / 10;

}

function cookTimeline(timeline, className) {
	var _html = '';
	var _css = '';
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
							case 'bitmap':
								_uniqueImg = {
									x: _ele.x,
									y: _ele.y,
									width: _ele.width,
									height: _ele.height,
									url: exportImg(_ele.libraryItem).url
								};
								break;
						}
						break;
				}
			}

			for (var i in elements) {
				var _ele = elements[i];
				var _dom = null;
				switch (_ele.elementType) {
					case 'instance':
						switch (_ele.instanceType) {
							case 'symbol':
								_dom = createDom(_ele, 'div', className, _uniqueImg);
								break;
						}
						break;
					case 'shape':
						break;
					case 'text':
						switch (_ele.textType) {
							case 'input':
								_dom = createDom(_ele, 'input', className, _uniqueImg);
								break;
							default:
								_dom = createDom(_ele, 'p', className, _uniqueImg);
								break;
						}
						break;
				}

				if (_dom) {
					_html += _dom.html;
					_css += _dom.css;
				}
			}
		}
	}

	return {
		html: _html,
		css: _css,
		img: _uniqueImg
	};
}

function createDom(ele, type, className, pimg) {
	var _a = Math.round(ele.colorAlphaPercent) / 100
	var _r = Math.round(ele.rotation * 10) / 10;
	var _sx = Math.round(ele.scaleX * 100) / 100;
	var _sy = Math.round(ele.scaleY * 100) / 100;
	var _kx = Math.round(ele.skewX * 10) / 10;
	var _ky = Math.round(ele.skewY * 10) / 10;

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

	if (!isNaN(_r)) {
		ele.rotation = _r;
	} else {
		ele.skewX = _kx;
		ele.skewY = _ky;
	}
	ele.scaleX = _sx;
	ele.scaleY = _sy;

	var _class = '',
		_html = '',
		_css = '',
		_style = '',
		_tlData = '';

	switch (type) {
		case 'div':
		case 'input':
		case 'p':
			_class = ele.name || (ele.libraryItem ? checkName(ele.libraryItem.name).file.name : '');
			className += (className && _class ? ' .' : '') + _class;
			break;
	}

	switch (type) {
		case "div":
			var _tlData = cookTimeline(ele.libraryItem.timeline, className);
			break;
	}

	_style += 'left:' + calcNum(_x + (pimg ? -pimg.x : 0)) + 'vw;' + 'top:' + calcNum(_y + (pimg ? -pimg.y : 0)) + 'vw;';

	switch (type) {
		case "div":
			if (_tlData.img) {
				_style +=
					"width:" + calcNum(_tlData.img.width) + "vw;" +
					"height:" + calcNum(_tlData.img.height) + "vw;";

				if (Math.floor(_tlData.img.x) != 0 || Math.floor(_tlData.img.y) != 0) _style += "margin:" + calcNum(_tlData.img.y) + "vw 0 0 " + calcNum(_tlData.img.x) + "vw;";

				if (_class != '') _style += "background-image:url('../" + _tlData.img.url + "');";
				else _style += "background-image:url('" + _tlData.img.url + "');";
			}
			break;
		case "input":
		case "p":
			_style +=
				"width:" + calcNum(_w) + "vw;" +
				"height:" + calcNum(_h) + "vw;" +
				'color:' + ele.getTextAttr('fillColor') + ';' +
				'font-size:' + calcNum(ele.getTextAttr('size')) + 'vw;' +
				'text-align:' + ele.getTextAttr('alignment') + ';';
			break;
	}

	if (_a < 1) {
		_style +=
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

	if (_sx !== 1 || _sy !== 1) _tf += " scale(" + _sx + "," + _sy + ")";

	if (_tf !== '') {
		if (_tlData.img) _style +=
			"transform-origin:" + calcNum(_tx - _x - Math.round(_tlData.img.x)) + "vw " + calcNum(_ty - _y - Math.round(_tlData.img.y)) + "vw;" +
			"transform:" + _tf + ";";
		else _style +=
			"transform-origin:" + calcNum(_tx - _x) + "vw " + calcNum(_ty - _y) + "vw;" +
			"transform:" + _tf + ";";
	}

	switch (type) {
		case "div":
			if (_class != '') {
				_html = '<div class="' + _class + '">' + _tlData.html + '</div>';
			} else {
				if (_style == '') _html = '<div>' + _tlData.html + '</div>';
				else _html = '<div style="' + _style + '">' + _tlData.html + '</div>';
			}
			_css += _tlData.css;
			break;
		case "input":
			if (_class != '') {
				_html = '<input type="text" class="' + _class + '"/>';
			} else {
				if (_style == '') _html = '<input type="text" />';
				else _html = '<input type="text" style="' + _style + '"/>';
			}
			break;
		case "p":
			if (_class != '') {
				_html = '<p class="' + _class + '">' + ele.getTextString() + '</p>';
			} else {
				if (_style == '') _html = '<p>' + ele.getTextString() + '</p>';
				else _html = '<p style="' + _style + '">' + ele.getTextString() + '</p>';
			}
			break;
	}

	if (_class != '' && _style != '') _css = '.' + className + '{' + _style + '}' + _css;

	return {
		html: _html,
		css: _css
	};
}

function checkName(name) {
	var _a = name.split("/");
	var _path = [];
	var _file = {};
	for (var _len = _a.length, i = _len - 1; i >= 0; i--) {
		var _t = _a[i];
		if (i == _len - 1) {
			var _exp = /(.+)\.([^\.]+)$/;
			var _a2 = _exp.exec(_t);
			_file = {
				name: _a2 ? _a2[1] : _t,
				ext: _a2 ? _a2[2] : 'png'
			};
		} else {
			if (_t.indexOf("Asset") == -1) _path.unshift(_t);
		}
	}

	return {
		path: _path,
		file: _file
	};
}

function exportImg(libItem) {
	var _uri = 'images';
	var _url;
	var _data = checkName(libItem.name);

	for (var i in _data.path) {
		_uri += '/' + _data.path[i];
		FLfile.createFolder(fileURI + _uri);
	}

	_url = _uri + '/' + _data.file.name + '.' + _data.file.ext;
	libItem.exportToFile(fileURI + _url, 100);

	return {
		name: libItem.name,
		url: _url
	};
}

function exportHtml(text) {
	var _fileURL = fileURI + 'index.html';
	var _text = '<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title></title><style>body,div,ul,li,img,p,a,h1,h2,h3,input,span{margin:0vw;padding:0vw;border:0vw;}html,body{background:' + doc.backgroundColor + '}div{position:absolute;background-size:cover;}p{position:absolute;}</style><link rel="stylesheet" href="css/main.css"/></head><body>' + text + '</body></html>';
	FLfile.write(_fileURL, _text);
}

function exportCss(text) {
	var _folderURI = fileURI + 'css';
	var _fileURL = _folderURI + '/main.css';
	var _text = text;
	FLfile.createFolder(_folderURI);
	FLfile.write(_fileURL, _text);
}


run();