var fileURI,doc,timeline,lib;

function init(){
	doc = fl.getDocumentDOM();
	timeline = doc.getTimeline();
	lib = doc.library;
	fileURI = doc.pathURI.slice(0, doc.pathURI.lastIndexOf("/")+1);

	var _tlData = cookTimeline(timeline);

	exportHtml(_tlData.html);
	exportCss(_tlData.css);
	//fl.trace(_tlData.html);
	//fl.trace(_tlData.css);
}

init();


//---------------------------------------输出

function cookTimeline(timeline, className){
	var _html = '';
	var _css = '';
	for(var len = timeline.layers.length, j = len-1; j>=0; j--){
		var layer = timeline.layers[j];
		if(layer.layerType == 'normal'){
			var elements = layer.frames[0].elements;fl.trace(elements);
			for(var i in elements){
				var ele = elements[i];
				var domObj = null;
				switch(ele.elementType){
					case 'instance':
						switch(ele.instanceType){
							case 'symbol':
								domObj = cerateDiv(ele);
								break;
							case 'bitmap':
								var img = exportImg(ele.libraryItem).url;
								domObj = cerateDiv(ele, img);
								break;
						}
						break;
					case 'shape':
						break;
					case 'text':
						break;
				}

				if(domObj){
					_html += domObj.html;
					_css += (className?('.' + className + ' '):'') + domObj.css;
				}
			}
		}
	}

	return {
		html:_html,
		css:_css
		};
}

function exportImg (libItem){
	var aURL,rURL;
	var _name = checkName(libItem.name);
	switch(libItem.originalCompressionType){
		case 'photo':
			rURL = 'images/' + _name + '.jpg';
			aURL = fileURI + rURL;
			break;
		case 'lossless':
			rURL = 'images/' + _name + '.png';
			aURL = fileURI + rURL;
			break;
	}
	libItem.exportToFile(aURL, 100);

	return {
		name:libItem.name,
		url:rURL
		};
}

function exportHtml (text){
	var _fileURL = fileURI + 'index.html';
	var _text = '<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title></title><link rel="stylesheet" href="css/main.css"/></head><body>' + text + '</body></html>';
	FLfile.write(_fileURL, _text);
}

function exportCss (text){
	var _folderURI = fileURI + 'css';
	var _fileURL = _folderURI + '/main.css';
	var _text = text;
	FLfile.createFolder(_folderURI)
	FLfile.write(_fileURL, _text);
}

function cerateDiv(ele, img){
	var _a = Math.round(ele.colorAlphaPercent)/100;
	var _r = Math.round(ele.rotation);
	var _sx = Math.round(ele.scaleX*100)/100;
	var _sy = Math.round(ele.scaleY*100)/100;
	ele.rotation = 0;
	ele.scaleX = 1;
	ele.scaleY = 1;

	var _w = Math.round(ele.width);
	var _h = Math.round(ele.height);
	var _x = Math.round(ele.x);
	var _y = Math.round(ele.y);
	var _tx = Math.round(ele.transformX);
	var _ty = Math.round(ele.transformY);
	ele.rotation = _r;
	ele.scaleX = _sx;
	ele.scaleY = _sy;
	fl.trace('name:'+ele.libraryItem.name);
	var _cName = ele.name || createClassName(checkName(ele.libraryItem.name));
	var _tlData,_html,_css;

	_css = '.' + _cName +
	'{position:absolute;' +
	'left:' + _x + 'px;' +
	'top:' + _y + 'px;';

	if(img){
		_css +=
		'width:' + _w + 'px;' +
		'height:' + _h + 'px;' +
		'background:url("../' + img + '");'
	}

	if(_a){
		_css +=
		'opacity:' + _a + ';'
	}

	if(_r !== 0 || _sx !== 1 || _sy !== 1){
		_css +=
		'transform-origin:' + (_tx-_x) + 'px ' + (_ty-_y) + 'px;' +
		'-webkie-transform-origin:' + (_tx-_x) + 'px ' + (_ty-_y) + 'px;' +
		'transform:rotate(' + _r + 'deg) scale(' + _sx + ',' + _sy + ');' +
		'-webkie-transform:rotate(' + _r + 'deg) scale(' + _sx + ',' + _sy + ');';
	}

	_css += '}';

	if(ele.libraryItem.timeline){
		_tlData = cookTimeline(ele.libraryItem.timeline, _cName);
		_html = '<div class="' + _cName + '">' + _tlData.html + '</div>';
		_css += _tlData.css;
	}else{
		_html = '<div class="' + _cName + '">' + '</div>';
	}

	return {
		html:_html,
		css:_css
		};
}

var cid = 0;
function createClassName(name){
	return (name||'div') + 's' + ++cid;
}

function checkName(name){
	var _n = name.lastIndexOf(".");
	var _name = _n>=0?name.slice(0, _n):name;
	_name = _name.replace(/[\.\s]/g, "_");
	return _name;
}




