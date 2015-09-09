function run(){
	var configURI = fl.configURI+'Commands/';
	var scriptURI = fl.scriptURI.slice(0, fl.scriptURI.lastIndexOf("/") + 1);
	
	FLfile.createFolder(configURI + 'flash2html');
	FLfile.copy(scriptURI + "flash2html.jsfl", configURI + 'flash2html/flash2html.jsfl');
	
}

run();
