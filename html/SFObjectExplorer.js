//SFobjectExplorer.js

var objectTypes = [ '--ObjectTypes--', 'ApexTrigger', 'ApexClass'];
//_________________________________________________________________

function initializeAceEditor(){
	var textarea = $('#content');
	var editor = ace.edit('editor');

	editor.setFontSize(13);
	editor.setTheme("ace/theme/github");
	editor.setHighlightActiveLine(true);
	editor.setShowPrintMargin(false);
	editor.container.style.fontFamily = "Monaco";
	editor.getSession().setMode("ace/mode/apex");
	editor.getSession().on('change', function(){
		textarea.val(editor.getSession().getValue());
	});
	textarea.val(editor.getSession().getValue());

	editor.on("guttermousedown", function(e){
		var objGrid = w2ui['sObjectsGrid'];
		var objGridSelection = objGrid.getSelection()-1;
		var objId ='';
		var target = e.domEvent.target;
		if(target.className.indexOf("ace_gutter-cell") == -1){
			return;
		}
		if(!editor.isFocussed()){
			return;
		}
		if(e.clientX > (25+ target.getBoundingClientRect().left)){
			return;
		}
		var breakpoints = e.editor.session.getBreakpoints(row,0);
		var row = e.getDocumentPosition().row;
		console.log('w2ui[sObjectsGrid].getSelection()  :'+w2ui['sObjectsGrid'].getSelection());
		var uriStrArray = (objGrid.records[objGridSelection].url).split("/");
		var len = uriStrArray.length;
		objId  = uriStrArray[len-1];
		if(typeof breakpoints[row] === typeof undefined){
			//console.log('Setting checkpoint : '+w2ui['sObjectsGrid'].getSelection());
			e.editor.session.setBreakpoint(row);
			loadDoc("http://localhost:3001/setCheckpoint/?id="+objId+'&lineNo='+(row+1));
		}
		else{
			console.log('Deleting checkpoint : '+w2ui['sObjectsGrid'].getSelection());
			e.editor.session.setBreakpoint(row);
			loadDoc("http://localhost:3001/deleteCheckpoint/?id="+objId+'&lineNo='+(row+1));
		}
	});
}

function fetchSObjects(selectedText, url, cFunction, id){
	alert(1);
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.open("POST", url, true);
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200 ){
			cFunction(xhttp, id);
		}
	};

	var postQuery = selectedText;
	xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhttp.send("sobjecttype="+encodeURIComponent(postQuery));
	alert(2);
}

function getSObjectsData(sObjectsJSONStr){
	var sObjectsJSON = JSON.parse(sObjectsJSONStr);
	sObjectsJSONStr ='';
	alert("GSOD start");
	displaySObjectsRawData(sObjectsJSON['records']);
	alert("GSOD end");
	sObjectsJSON = '';	
}

function displaySObjectsRawData(JSONData){
	var recid = 1;
	$(JSONData).each(function(i,rec){
		rec.recid = recid++;
		rec.url = rec.attributes.url;
	});
	if(w2ui['flowOfEventsGrid']){
		w2ui['flowOfEventsGrid'].destroy();
	}

	if(w2ui['sObjectsGrid']){
		w2ui['sObjectsGrid'].clear();
	}

	var mygrid = w2ui['sObjectsGrid'];
	mygrid.add(JSONData);

	JSONData = '';
}

function displayObjectBody(body){
	var sObjectsDetailsJSON = JSON.parse(body);
	ace.edit('editor').setValue(sObjectsDetailsJSON['Body'], -1);
	var objId = sObjectsDetailsJSON['Id'];
	loadDoc("http://localhost:3001/getCheckpoints/?id="+objId, showResults, 'getcheckpointsid');
}

function setCheckPoints(aeoaRes){
	var checkPointsDetailsJSON = JSON.parse(aeoaRes);
	var editor = ace.edit('editor');
	editor.getSession().clearBreakpoints();
	$(checkPointsDetailsJSON).each(function(i, rec){
		console.log('Setting checkpoint for '+rec.ExecutableEntityId+'at line '+rec.Line);
		editor.getSession().setBreakpoint(rec.Line-1);
	});
}