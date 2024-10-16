//<!--BulkApiReportUtil.js -->

function getBulkApiReportData(bulkapiJSONStr){
    var bulkapiJSON = JSON.parse(bulkapiJSONStr);
    bulkapiJSONStr  = '';
    
    //var dataStr = "Timestamp, RunTime, CPUTime, Failures\n";
    var dataStr = "";
    var labelStr = ["RunTime", "CPUTime", "Failures"];

    bulkapiJSON.forEach(function(bulkapiEntry){
        var tempTS = bulkapiEntry.TIMESTAMP;

        bulkapiEntry.RUN_TIME = Number(bulkapiEntry.RUN_TIME)/1000;
        bulkapiEntry.CPU_TIME = Number(bulkapiEntry.CPU_TIME)/1000;
        
        dataStr = dataStr + tempTS.substr(0,4) + "/"+ tempTS.substr(4,2)+ "/"+ tempTS.substr(6,2)
                +" " +tempTS.substr(8,2) + ":" + tempTS.substr(10,2) + ":"+ tempTS.substr(12) 
                +", "+bulkapiEntry.RUN_TIME +", "+bulkapiEntry.CPU_TIME 
                +", "+bulkapiEntry.FAILURES +"\n"
    });

    displayBulkApiReportRawData(bulkapiJSON, labelStr);
    showHideGraphSeries(labelStr);

    bulkapiJSON = '';
    return dataStr;

}

function displayBulkApiReportRawData(JSONData, labelStr){
    var recid = 1;
    $(JSONData).each(function(i,rec){
      rec.recid = recid++;
    });
  
    if(!w2ui['flowOfEventsGrid']){
      initializeFlowOfEventsGrid();
    }
    if(w2ui['bulkApiGrid']){
      w2ui['bulkApiGrid'].destroy();
    }
  
    var contentconfig = {
      grid1 : {
        name    : 'bulkApiGrid',
        header  : '<B>BulkApi Report</B>',
        multiSearch : true,
        /*searches : [
          { field: 'JOB_ID', caption: 'Job Id, type: 'int' },
          { field: 'RUN_TIME', caption: 'Run Time', type: 'int' },
          { field: 'CPU_TIME', caption: 'CPU Time', type: 'int' },
          { field: 'SUCCESS', caption: 'Success', type: 'int' },
          { field: 'MESSAGE', caption: 'Message', type: 'text' },
          { field: 'ENTITY_NAME', caption: 'Entity Name', type: 'text' },
          { field: 'OPERATION_TYPE', caption: 'Operation Type', type: 'text' },
          { field: 'ROWS_PROCESSED', caption: 'Rows Processed', type: 'text' } 
        ],
        */
        toolbar : {
          items : [
            { type: 'break' },
            { type: 'button', id: 'inspectjobid', caption: 'Inspect Job Entry', img: 'fa fa-list-alt' },
            { type: 'spacer' },
            { type: 'button', id: 'exportdata', caption: 'Export Data', img: 'fa fa-download' },
          ],
          onClick : function(event) {
            var myGrid = w2ui['bulkApiGrid'];
            var sel  = myGrid.getSelection();

            if((sel[0] == null || sel[0] == undefined) && event.item.id != "exportdata"){
              w2alert('select a row to inspect')
              return;
            }
            var _selObj = myGrid.get(sel[0]);
            var _requestId = _selObj["REQUEST_ID"]; 
            var _jobId = _selObj["JOB_ID"];

            switch(event.item.id){
              case "exportdata":
                var csv = w2ui['bulkApiGrid'].records;
                var dataStr = "Timestamp, RequestId, BatchId, JobId, EntityType, OperationType, Message, RunTime, CPUTime, #Failures, Success, RowsProcessed\n";

                event.onComplete = function (){
                  for(var i =0;i<csv.length; i++){
                    var csvrec = csv[i];
  
                    dataStr = dataStr
                      + csvrec.TIMESTAMP_DERIVED + ', '
                      + csvrec.REQUEST_ID + ', '
                      + csvrec.BATCH_ID + ', '
                      + csvrec.JOB_ID + ', '
                      + csvrec.ENTITY_TYPE + ', '
                      + csvrec.OPERATION_TYPE + ', '
                      + csvrec.MESSAGE + ', '
                      + csvrec.RUN_TIME + ', '
                      + csvrec.CPU_TIME + ', '
                      + csvrec.NUMBER_FAILURES + ', '
                      + csvrec.SUCCESS + ', '
                      + csvrec.ROWS_PROCESSED + '\n';
                    csvrec = "";
                  }
                  exportData('BulkApi', dataStr);
                }
                csv = "";
                break;
              case "inspectjobid":
                w2popup.open({
									title 	: 'Inspecting Job'+_jobId,
									width 	: 700,
									height	: 400,
									showMax : true,
									body 	: '<div id="inspectingjobdivid" style="position: absolute; left: 5px; top: 5px; right: 5px; bottom: 5px"></div>',
									
									onClose	: function(event){
										if(w2ui['inspectjobgrid']){
											w2ui['inspectjobgrid'].clear();
											w2ui['inspectjobgrid'].destroy();
										}
									},
									
									onOpen 	: function(event){
										event.onComplete = function (){
											if(w2ui['inspectjobgrid']){
												w2ui['inspectjobgrid'].destroy();
											}
											$('#w2ui-popup #inspectjobdivid').w2grid({
												name : 'inspectjobgrid',
												method : 'GET',												
												url : 'http://localhost:3001/findEvents/?requestid='+_requestId,
												show : { header : true, columnHeaders : true, toolbar : true }, 

												columns : [
													{ field: 'TIMESTAMP_DERIVED', caption: 'Timestamp', size: '30%' },
                          { field: 'REQUEST_ID', caption: 'Request Id', size: '30%' },
                          { field: 'EVENT_TYPE', caption: 'Event Type', size: '30%' },
                          { field: 'URI', caption: 'URI', size: '30%' },
                          { field: 'JOB_ID', caption: 'Job Id', size: '30%' },
                          { field: 'BATCH_ID', caption: 'Batch Id', size: '30%' },
                          { field: 'ENTITY_NAME', caption: 'Entity Name', size: '30%' },
                          { field: 'ENTITY_TYPE', caption: 'Entity Type', size: '30%'},  
                          { field: 'OPERATION_TYPE', caption: 'Operation Type', size: '30%' },
                          { field: 'TRIGGER_ID', caption: 'Trigger Id', size: '30%' },
                          { field: 'TRIGGER_NAME', caption: 'Trigger Name', size: '30%' },
                          { field: 'RUN_TIME', caption: 'Run Time in s', size: '30%' },
                          { field: 'CPU_TIME', caption: 'Cpu Time in s', size: '30%' },
                          { field: 'EXEC_TIME', caption: 'Exec Time', size: '30%' },
                          { field: 'DB_TOTAL_TIME', caption: 'DB Total Time', size: '30%' },
                          { field: 'USER_ID', caption: 'User Id', size: '30%' },
                          { field: 'EXCEPTION_TYPE', caption: 'Exception Type', size: '30%' },
                          { field: 'EXCEPTION_MESSAGE', caption: 'Exception Message', size: '30%' }
												], 
												
												show : {
													toolbar	: true, 
													footer	: true,
													
													toolbarSearch	: true,
													toolbarColumns	: true,
													lineNumbers		: true,
													selectColumn	: true,
													expandColumn	: false
												}, 

												parser : function(responseText){
													
													var result = $.parseJSON(responseText);
                          var JSONData = {
                            "status" : "success",
                            "totalSize" : result.length,
                            "records" : result
                          };
                          
                          var data = JSONData ["records"];
                          w2ui.inspectjobgrid.total = data.length;
                          var recid = 1;

													$(data).each(function(i,rec){
														rec.recid = recid++;
													});
                          JSONData['records'] = data;
                          result = '';
													data ='';
													return JSONData;
												}
											});
										};
									}
								});
							
                break;
              default:
                break;
            }
          }
        },
  
        columns : [
          { field: 'TIMESTAMP_DERIVED', caption: 'Timestamp', size: '30%' },
          { field: 'REQUEST_ID', caption: 'Request Id', size: '30%' },
          { field: 'JOB_ID', caption: 'Job Id', size: '30%' },
          { field: 'BATCH_ID', caption: 'Batch Id', size: '30%' },
          { field: 'URI', caption: 'URI', size: '30%' },
          { field: 'ENTITY_TYPE', caption: 'Entity Name', size: '30%'},  
          { field: 'OPERATION_TYPE', caption: 'Operation Type', size: '30%' },
          { field: 'MESSAGE', caption: 'Message', size: '30%' },
          { field: 'RUN_TIME', caption: 'Run Time in s', size: '30%' },
          { field: 'CPU_TIME', caption: 'Cpu Time in s', size: '30%' },
          { field: 'NUMBER_FAILURES', caption: '#Failures', size: '30%' },
          { field: 'SUCCESS', caption: 'Success', size: '30%' },
          { field: 'ROWS_PROCESSED', caption: '#Rows Processed', size: '30%' }
          
        ],
        show : {
          toolbar	: true,
          footer	: true,
          header  : true,
          toolbarSearch	: true,
          toolbarColumns	: true,
          lineNumbers		: true,
          selectColumn	: true,
          toolbarSave   : false,
          expandColumn	: false
        },
        records : JSONData,
        multiSelect : true,
        onClick : function(event) {
          var grid = this;
          w2ui['flowOfEventsGrid'].clear();
          event.onComplete = function() {
            var sel = grid.getSelection();
            var record = this.get(event.recid);
            loadDoc('http://localhost:3001/findEventsUsingJobID/?jobid='+record.JOB_ID, showResults, 'requestreport');
          }
        }
      }
    };
    $(function() {
      var grid1 = $().w2grid(contentconfig.grid1);
      w2ui.globalcontentlayout.html('main', grid1);
  
    });
    JSONData = '';
    dataStr = '';
  }
  
  function getBulkApiReportOptions(){
    var opt = {
      title   : 'BulkApi Times',
      height  : 250,
      width   : 650,
      labels  : ["Timestamp", "RunTime", "CPUTime", "Failures"],
      visibility: [false, false, false, false ],
      series  : {
        '#Failures'  : {axis : 'y2'}
      },
      axes  : {
        x : {
          drawGrid : true
        },
  
        y : {
          valueRange : [0, 200],
          axisLabelWidth : 60
        },
  
        y2: {
          valueRange : [0, 100],
          labelsKMB  : true
        }
      },
      ylabel  : 'Time in Secs',
      y2label : '# SOQL Queries',
      xlabel  : 'Timestamp -->',
      plotter   : smoothPlotter,
  
      animatedZooms : true,
      connectSeparatedPoints  : false,
      errorBars : false,
      drawPoints  : true,
      showRangeSelector   : false,
      stackedGraph  : false,
  
      strokeWidth   : 0.5,
      strokeBorderWidth   : 0.5,
      highlightCircleSize : 2,
      fillAlpha : 0.2,
  
      highlightSeriesOpts : {
        strokeWidth   : 1,
        strokeBorderWidth   : 1,
        highlightCircleSize : 5,
      },
      legend  : 'always',
  
      pointClickCallback : function(event, points){
        var mydt = new Date(points.xval);
        var ms = new String(points.xval);
        var dgtms = ms.substr(ms.length - 3);
        var datestr = new String(mydt).substr(16,8) + '.' + dgtms;
        w2ui['bulkApiGrid'].search('all', datestr);
        event.stopPropagation();
        mydt = '';
        ms = '';
        dgtms = '';
      },
  
      colors :[
        "rgb(250, 50, 20)",
        "#006400",
        "#652121",
        "#8A2BE2",
        "#101015",
        "rgba(20, 50, 250, 0.4)"
      ],
    };
    return opt;
  }
  