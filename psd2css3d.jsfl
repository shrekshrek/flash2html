var fileURI, doc, timeline, lib;

function run() {
    doc = fl.getDocumentDOM();
    timeline = doc.getTimeline();
    lib = doc.library;
    fileURI = doc.pathURI.slice(0, doc.pathURI.lastIndexOf("/") + 1);

    var _tlData = cookTimeline(timeline, {x: 0, y: 0});

    exportJs(_tlData.js);
}


function cookTimeline(timeline, center) {
    var _js = '';
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
                                _dom = createDom(_ele, 'div', center);
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
                }

                if (_dom) {
                    _js += _dom.js + ',';
                }
            }
        }
    }

    if (_js.substr(-1, 1) == ',') _js = _js.substr(0, _js.length - 1);

    return {
        js: _js,
        img: _uniqueImg
    };
}

function createDom(ele, type, center) {
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
    var _cx = Math.round(_w / 2);
    var _cy = Math.round(_h / 2);
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

    var _tlData = cookTimeline(ele.libraryItem.timeline, {x: _cx, y: _cy});

    var _js = '';

    if (_tlData.img) {
        _js += "{type: 'plane'";
        _js += ",size: [" + _w + ", " + _h + "]";
    } else {
        _js += "{type: 'sprite'";
    }

    var _ox = _tx - _x - _cx;
    var _oy = _ty - _y - _cy;
    // fl.trace(_tx + '|' + _ty + '|' + center.x + '|' + center.y + '|' + (_tx - center.x) + '|' + (_ty - center.y));
    if (ele.name) _js += ",name:'" + ele.name + "'";
    if ((_tx - center.x) != 0 || (_ty - center.y) != 0) _js += ",position: [" + (_tx - center.x) + ", " + (_ty - center.y) + ", 0]";
    if (_sx != 1 || _sy != 1) _js += ",scale: [" + _sx + "," + _sy + "]";
    if (_r != 0) _js += ",rotation:[0,0," + _r + "]";
    if (_a < 1) _js += ",visibility:[{alpha:" + _r + "}]";
    if (_ox != 0 || _oy != 0) _js += ",origin:[" + (_ox + _cx) + "," + (_oy + _cy) + "]";
    if (_tlData.img) _js += ",material: [{image: '" + _tlData.img.url + "'}]";
    if (_tlData.js != '') _js += ", children:[" + _tlData.js + "]";

    _js += "}";
    // fl.trace(_js);
    return {
        js: _js
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
            _file = {name: _a2 ? _a2[1] : _t, ext: _a2 ? _a2[2] : 'png'};
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

function exportJs(text) {
    var _folderURI = fileURI + 'js';
    var _fileURL = _folderURI + '/index.js';
    var _text = 'var obj = ' + text + ';';
    FLfile.createFolder(_folderURI);
    FLfile.write(_fileURL, _text);
}


run();