//----- ApexTriggerReportUtil.js------
function getApexTriggerReportData(apexTriggerJSONStr){
  var apexTriggerJSON = JSON.parse(apexTriggerJSONStr);
  apexTriggerJSONStr = '';

  //var dataStr = "Timestamp, RunTime, CPUTime, ExecTime, DBTotalTime\n";
  var dataStr = "";
  var labelStr = ["RunTime", "CPUTime", "ExecTime", "DBTotalTime"];

  apexTriggerJSON.forEach(function(apexTriggerEntry){
    var tempTS = apexTriggerEntry.TIMESTAMP;
    apexTriggerEntry.DB_TOTAL_TIME = Number(apexTriggerEntry.DB_TOTAL_TIME/1000000000);
    apexTriggerEntry.RUN_TIME = Number(apexTriggerEntry.RUN_TIME/1000);
    apexTriggerEntry.CPU_TIME = Number(apexTriggerEntry.CPU_TIME/1000);
    apexTriggerEntry.EXEC_TIME = Number(apexTriggerEntry.EXEC_TIME/1000);

    dataStr = dataStr
      + tempTS.substr(0,4)+"/" + tempTS.substr(4,2)+"/" + tempTS.substr(6,2)+" " + tempTS.substr(8,2)+":" + tempTS.substr(10,2)+":"  + tempTS.substr(12)
      + ", "+apexTriggerEntry.RUN_TIME + ", " + apexTriggerEntry.CPU_TIME
      + apexTriggerEntry.EXEC_TIME + ", "+apexTriggerEntry.DB_TOTAL_TIME + ", "
      + "\n";
  });
  displayApexTriggerReportRawData(apexTriggerJSON);
  showHideGraphSeries(labelStr);

  apexTriggerJSON = '';
  return dataStr;
}

function displayApexTriggerReportRawData(JSONData, labelStr){
  var recid = 1;
  $(JSONData).each(function(i,rec){
    rec.recid = recid++;
  });

  if(!w2ui['flowOfEventsGrid']){
    initializeFlowOfEventsGrid();
  }
  if(w2ui['apexTriggerGrid']){
    w2ui['apexTriggerGrid'].destroy();
  }

  var contentconfig = {
    grid1 : {
      name    : 'apexTriggerGrid',
      header  : '<B>Apex Trigger Report</B>',
      multiSearch : true,
      searches : [
        { field: 'EXEC_TIME', caption: 'Exec Time', type: 'int' },
        { field: 'CPU_TIME', caption: 'CPU Time', type: 'int' },
        { field: 'ENTITY_NAME', caption: 'Entity Name', type: 'text' },
        { field: 'TRIGGER_NAME', caption: 'Trigger Name', type: 'text' }
      ],
      toolbar : {
        items : [
          { type: 'break' },
          { type: 'spacer' },
          { type: 'button', id: 'exportdata', caption: 'Export Data', img: 'fa fa-download' },
        ],
        onClick : function(event) {
          switch(event.item.id){
            case "exportdata":
              var csv = w2ui['apexTriggerGrid'].records;
              var dataStr = "Timestamp, RequestId, Entity Name, Trigger Id, Trigger Name, Trigger Type, RunTime, CPUTime, ExecTime, DBTotalTime\n";

              event.onComplete = function (){
                for(var i =0;i<csv.length; i++){
                  var csvrec = csv[i];

                  dataStr = dataStr
                    + csvrec.TIMESTAMP_DERIVED + ', '
                    + csvrec.REQUEST_ID + ', '
                    + csvrec.ENTITY_NAME + ', '
                    + csvrec.TRIGGER_ID + ', '
                    + csvrec.TRIGGER_NAME + ', '
                    + csvrec.TRIGGER_TYPE + ', '
                    + csvrec.RUN_TIME + ', '
                    + csvrec.CPU_TIME + ', '
                    + csvrec.EXEC_TIME + ', '
                    + csvrec.DB_TOTAL_TIME + ', '
                    + '\n';
                  csvrec = "";
                }
                exportData('ApexTrigger', dataStr);
              }
              csv = "";
              break;
            default:
              break;
          }
        }
      },

      columns : [
        { field: 'TIMESTAMP_DERIVED', caption: 'Timestamp', size: '30%' },
        { field: 'REQUEST_ID', caption: 'Request Id', size: '30%' },
        { field: 'ENTITY_NAME', caption: 'Entity Name', size: '30%' },
        { field: 'TRIGGER_ID', caption: 'Trigger Id', size: '30%' },
        { field: 'TRIGGER_NAME', caption: 'Trigger Name', size: '30%' },
        { field: 'TRIGGER_TYPE', caption: 'Trigger Type', size: '30%' },
        { field: 'RUN_TIME', caption: 'Run Time in s', size: '30%' },
        { field: 'CPU_TIME', caption: 'CPU Time in s', size: '30%' },
        { field: 'EXEC_TIME', caption: 'Exec Time in s', size: '30%' },
        { field: 'DB_TOTAL_TIME', caption: 'DB Total Time in s', size: '30%' }
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
          loadDoc('http://localhost:3001/findEvents/?requestid='+record.REQUEST_ID, showResults, 'requestreport');
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

function getApexTriggerReportOptions(){
  var opt = {
    title   : 'Apex Trigger Times',
    height  : 250,
    width   : 650,
    labels  : ["Timestamp", "RunTime", "CPUTime", "ExecTime", "DBTotalTime"],
    visibility: [false, false, false, false, false],
    /*
    series  : {
      '#SOQLQueries'  : {axis : 'y2'}
    },
    */
    axes  : {
      x : {
        drawGrid : true
      },

      y : {
        valueRange : [0, 200],
        axisLabelWidth : 60
      },
      /*
      y2: {
        valueRange : [0, 100],
        labelsKMB  : true
      }
      */
    },
    ylabel  : 'Time in Secs',
    //y2label : '# SOQL Queries',
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
      w2ui['apexTriggerGrid'].search('all', datestr);
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
