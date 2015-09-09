function run(){
	var configURI = fl.configURI+'Commands/';
	var scriptURI = fl.scriptURI.slice(0, fl.scriptURI.lastIndexOf("/") + 1);
	
	FLfile.createFolder(configURI + 'flash2html');
	FLfile.copy(scriptURI + "img2div.jsfl", configURI + 'flash2html/img2div.jsfl');
	
}

run();
