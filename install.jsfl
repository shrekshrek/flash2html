function run(){
	var configURI = fl.configURI+'Commands/';
	var scriptURI = fl.scriptURI.slice(0, fl.scriptURI.lastIndexOf("/") + 1);

    FLfile.remove(configURI + 'flash2html');
	FLfile.createFolder(configURI + 'flash2html');
	FLfile.copy(scriptURI + "img2img.jsfl", configURI + 'flash2html/img2img.jsfl');
	FLfile.copy(scriptURI + "img2div.jsfl", configURI + 'flash2html/img2div.jsfl');
	FLfile.copy(scriptURI + "img2div.jsfl", configURI + 'flash2html/img2div&css.jsfl');

}

run();
