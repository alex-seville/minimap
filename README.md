minimap.js
=======

NOTE: This project is no longer maintained.  The code is based on an earlier version of CodeMirror and breaks on the demo page.


## Usage
Reference minimap.js  
`<script type="text/javascript" src="minimap.js"></script>`  

then create a minimap instance  

`var miniMapControl = new MiniMap();`  

You can optionally pass in the following parameters:  

* scrollBar: The class name of the scroll element, default is ".CodeMirror-scrollbar".  
* content: The actual content to show in the minimap, the default is ".CodeMirror-lines".  
* keepScripts: Whether to keep (but escape) script tags found in the content, or to just remove them entirely  
* miniMapStyles: The css styles for the minimap (must be CSSStyleDeclaration format, camelCase without hyphens)  
* miniMapBarStyles: The css styles for the minimap highlight bar (must be CSSStyleDeclaration format, camelCase without hyphens)  

To update the minimap when changes occur in the CodeMirror editor simply add this line after the instance is created:

`editor.setOption("onChange",miniMapControl.mirrorContent);`  

## Contribute

Please Fork&Pull.  I'm sure that there is a lot that could still be done to improve/customize the control.

## TODO
I'm sure this could be adapted to non-code mirror fields.  
