flash2html
============

利用flash来帮助排版的小工具，直接导出成相关html,css,images。  

安装方法:  
  运行install.jsfl（双击打开运行，如果是默认flash打开不运行的，可以点击编辑窗口右上角三角运行按钮运行脚本即可）  
删除方法:  
  运行uninstall.jsfl  

安装后即可在flash软件菜单Commands中找到flash2html命令集  
当前只有一个img2div命令，会将所有图片转成带background属性的div标签，以方便webpack打包之用。  
执行即可自动将当前flash文档转换为同目录下的html文件  


