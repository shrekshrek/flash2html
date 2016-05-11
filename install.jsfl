function run(){
	var configURI = fl.configURI+'Commands/';
	var scriptURI = fl.scriptURI.slice(0, fl.scriptURI.lastIndexOf("/") + 1);

    FLfile.remove(configURI + 'flash2html');
	FLfile.createFolder(configURI + 'flash2html');
	FLfile.copy(scriptURI + "psd2div.jsfl", configURI + 'flash2html/psd2div.jsfl');

}

run();
