window.ontime = window.ontime || {};
window.ontime.JSONFormatter = function(args) {
	if (!args) throw "You must supply a arguments object";
	if (!args.responseElementId) throw "You must supply a response element id (responseElementId)";
	
	// we need tabs as spaces and not CSS margin-left 
	// in order to retain format when coping and pasting the code
	var SINGLE_TAB = "  ";
	var ImgCollapsed = "images/Collapsed.gif";
	var ImgExpanded = "images/Expanded.gif";
	var IsCollapsible = false;
	var QuoteKeys = true;
	var _dateObj = new Date();
	var _regexpObj = new RegExp();
	var strJson = null;
	var _count = 0;
	
	var $id = function(id) {
		return document.getElementById(GetId(id));
	}
	var GetId = function(id) {
		if (id == "") {
			return args.responseElementId;
		} else {
			return args.responseElementId + "_" + id;
		}
	}
	var IsArray = function(obj) {
		  return obj &&  
		          typeof obj === 'object' && 
		          typeof obj.length === 'number' &&
		          !(obj.propertyIsEnumerable('length'));
	}
	var getResultElement = function() {
		return $id("");
	}
	var Process = function() {
		SetTab();
		IsCollapsible = $id("CollapsibleView") ? $id("CollapsibleView").checked : true;
		
		var html = "";
		try {
			_count=0;
			if (!strJson || strJson == null || strJson == "") strJson = "\"\"";
			var obj = eval("[" + strJson + "]");
			var html = ProcessObject(obj[0], 0, false, false, false);
			getResultElement().innerHTML = "<PRE class='CodeContainer'>"+html+"</PRE>";
			
			for (var i=0; i<_count; i++) {
				var elem = $id("jsonimg_" + i);
				elem.onclick = $.proxy(elem, ExpImgClicked);
			}
		} catch(e) {
			getResultElement().innerHTML = ("JSON is not well formated:\n" + e.message);
		}
	}
	function ProcessObject(obj, indent, addComma, isArray, isPropertyContent){
		  var html = "";
		  var comma = (addComma) ? "<span class='Comma'>,</span> " : ""; 
		  var type = typeof obj;
		  var clpsHtml ="";
		  if(IsArray(obj)){
		    if(obj.length == 0){
		      html += GetRow(indent, "<span class='ArrayBrace'>[ ]</span>"+comma, isPropertyContent);
		    }else{
		      clpsHtml = IsCollapsible ? "<span><img id=\"" + GetId("jsonimg_" + (_count++)) + "\" src=\""+ImgExpanded+"\" /></span><span class='collapsible'>" : "";
		      html += GetRow(indent, "<span class='ArrayBrace'>[</span>"+clpsHtml, isPropertyContent);
		      for(var i = 0; i < obj.length; i++){
		        html += ProcessObject(obj[i], indent + 1, i < (obj.length - 1), true, false);
		      }
		      clpsHtml = IsCollapsible ? "</span>" : "";
		      html += GetRow(indent, clpsHtml+"<span class='ArrayBrace'>]</span>"+comma);
		    }
		  }else if(type == 'object'){
		    if (obj == null){
		        html += FormatLiteral("null", "", comma, indent, isArray, "Null");
		    }else if (obj.constructor == _dateObj.constructor) { 
		        html += FormatLiteral("new Date(" + obj.getTime() + ") /*" + obj.toLocaleString()+"*/", "", comma, indent, isArray, "Date"); 
		    }else if (obj.constructor == _regexpObj.constructor) {
		        html += FormatLiteral("new RegExp(" + obj + ")", "", comma, indent, isArray, "RegExp"); 
		    }else{
		      var numProps = 0;
		      for(var prop in obj) numProps++;
		      if(numProps == 0){
		        html += GetRow(indent, "<span class='ObjectBrace'>{ }</span>"+comma, isPropertyContent);
		      }else{
		        clpsHtml = IsCollapsible ? "<span><img id=\"" + GetId("jsonimg_" + (_count++)) + "\" src=\""+ImgExpanded+"\" /></span><span class='collapsible'>" : "";
		        html += GetRow(indent, "<span class='ObjectBrace'>{</span>"+clpsHtml, isPropertyContent);
		        var j = 0;
		        for(var prop in obj){
		          var quote = window.QuoteKeys ? "\"" : "";
		          html += GetRow(indent + 1, "<span class='PropertyName'>"+quote+prop+quote+"</span>: "+ProcessObject(obj[prop], indent + 1, ++j < numProps, false, true));
		        }
		        clpsHtml = IsCollapsible ? "</span>" : "";
		        html += GetRow(indent, clpsHtml+"<span class='ObjectBrace'>}</span>"+comma);
		      }
		    }
		  }else if(type == 'number'){
		    html += FormatLiteral(obj, "", comma, indent, isArray, "Number");
		  }else if(type == 'boolean'){
		    html += FormatLiteral(obj, "", comma, indent, isArray, "Boolean");
		  }else if(type == 'function'){
		    if (obj.constructor == window._regexpObj.constructor) {
		        html += FormatLiteral("new RegExp(" + obj + ")", "", comma, indent, isArray, "RegExp"); 
		    }else{
		        obj = FormatFunction(indent, obj);
		        html += FormatLiteral(obj, "", comma, indent, isArray, "Function");
		    }
		  }else if(type == 'undefined'){
		    html += FormatLiteral("undefined", "", comma, indent, isArray, "Null");
		  }else{
		    html += FormatLiteral(obj.toString().split("\\").join("\\\\").split('"').join('\\"'), "\"", comma, indent, isArray, "String");
		  }
		  return html;
		}
		function FormatLiteral(literal, quote, comma, indent, isArray, style){
		  if(typeof literal == 'string')
		    literal = literal.split("<").join("&lt;").split(">").join("&gt;");
		  var str = "<span class='"+style+"'>"+quote+literal+quote+comma+"</span>";
		  if(isArray) str = GetRow(indent, str);
		  return str;
		}
		function FormatFunction(indent, obj){
		  var tabs = "";
		  for(var i = 0; i < indent; i++) tabs += window.TAB;
		  var funcStrArray = obj.toString().split("\n");
		  var str = "";
		  for(var i = 0; i < funcStrArray.length; i++){
		    str += ((i==0)?"":tabs) + funcStrArray[i] + "\n";
		  }
		  return str;
		}
		function GetRow(indent, data, isPropertyContent){
		  var tabs = "";
		  for(var i = 0; i < indent && !isPropertyContent; i++) tabs += window.TAB;
		  if(data != null && data.length > 0 && data.charAt(data.length-1) != "\n")
		    data = data+"\n";
		  return tabs+data;                       
		}
		function CollapsibleViewClicked(){
		  $id("CollapsibleViewDetail").style.visibility = $id("CollapsibleView").checked ? "visible" : "hidden";
		  Process();
		}
		
			function ExpandAllClicked(){
			  EnsureIsPopulated();
			  TraverseChildren(getResultElement(), function(element){
			    if(element.className == 'collapsible'){
			      MakeContentVisible(element, true);
			    }
			  }, 0);
			}
			function QuoteKeysClicked(){
				  window.QuoteKeys = $id("QuoteKeys").checked;
				  Process();
			}
			function MakeContentVisible(element, visible){
			  var img = element.previousSibling.firstChild;
			  if(!!img.tagName && img.tagName.toLowerCase() == "img"){
			    element.style.display = visible ? 'inline' : 'none';
			    element.previousSibling.firstChild.src = visible ? ImgExpanded : ImgCollapsed;
			  }
			}
			function TraverseChildren(element, func, depth){
			  for(var i = 0; i < element.childNodes.length; i++){
			    TraverseChildren(element.childNodes[i], func, depth + 1);
			  }
			  func(element, depth);
			}
			function ExpImgClicked(img){
			  var container = this.parentNode.nextSibling;
			  if(!container) return;
			  var disp = "none";
			  var src = ImgCollapsed;
			  if(container.style.display == "none"){
			      disp = "inline";
			      src = ImgExpanded;
			  }
			  container.style.display = disp;
			  this.src = src;
			}
			function TabSizeChanged(){
			  Process();
			}
			function SetTab(){
			  var select = $id("TabSize");
			  var tabsize = select ? parseInt(select.options[select.selectedIndex].value) : 2;
			  window.TAB = MultiplyString(tabsize, SINGLE_TAB);
			}
			function EnsureIsPopulated(){
			  if(!getResultElement().innerHTML && !$id("clmnRightRequestPlainBody").value) Process();
			  
			}
			function MultiplyString(num, str){
			  var sb =[];
			  for(var i = 0; i < num; i++){
			    sb.push(str);
			  }
			  return sb.join("");
			}
			function SelectAllClicked(){
			 
			  if(!!document.selection && !!document.selection.empty) {
			    document.selection.empty();
			  } else if(window.getSelection) {
			    var sel = window.getSelection();
			    if(sel.removeAllRanges) {
			      window.getSelection().removeAllRanges();
			    }
			  }
			 
			  var range = 
			      (!!document.body && !!document.body.createTextRange)
			          ? document.body.createTextRange()
			          : document.createRange();
			  
			  if(!!range.selectNode)
			    range.selectNode(getResultElement());
			  else if(range.moveToElementText)
			    range.moveToElementText(getResultElement());
			  
			  if(!!range.select)
			    range.select(getResultElement());
			  else
			    window.getSelection().addRange(range);
			}

			function LinkToJson(){
				  var val = $id("clmnRightRequestPlainBody").value;
				  val = escape(val.split('/n').join(' ').split('/r').join(' '));
				  $id("InvisibleLinkUrl").value = val;
				  $id("InvisibleLink").submit();
			}
	
	// return closure object
	return (function() {
		return {
			setJSON: function(json) {
				strJson = json;
			},
			process: function() {
				if (strJson == null || strJson == "") {
					strJson = "\"\"";
				}
				Process();
			},
			collapseLevel: function(level) {
				EnsureIsPopulated();
				TraverseChildren(getResultElement(), function(element, depth){
					if(element.className == 'collapsible'){
						if(depth >= level){
							MakeContentVisible(element, false);
						}else{
							MakeContentVisible(element, true);  
						}
					}
				}, 0);
			},
			collapseAllClicked: function() {
				EnsureIsPopulated();
				TraverseChildren(getResultElement(), function(element) {
					if (element.className == 'collapsible') {
						MakeContentVisible(element, false);
					}
				}, 0);
			}
		}
	})();
};


