minimap.js
=======

Adding minimap functionality to code mirror.

## Usage
Reference minimap.js
`<script type="text/javascript" src="minimap.js"></script>`  

then create a minimap instance

`var miniMapControl = miniMap({  
    scrollBar: ".CodeMirror-scrollbar",  
    content: ".CodeMirror-lines"});`  

The class names provided (".CodeMirror-scrollbar" and ".CodeMirror-lines") will likely work with most Code Mirror implementations.

To update the minimap when changes occur in the CodeMirror editor simply add this line after the instance is created:

`editor.setOption("onChange",function(){ 
    miniMapControl();  
});`


## TODO
I'm sure this could be adapted to non-code mirror fields.