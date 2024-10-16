//----- ApexCalloutReportUtil.js------
function getApexCalloutReportData(apexCalloutJSONStr){
  var apexCalloutJSON = JSON.parse(apexCalloutJSONStr);
  apexCalloutJSONStr = '';

  //var dataStr = "Timestamp, Time, CPUTime\n";
  var dataStr = "";
  var labelStr = ["Time", "CPUTime"];

  apexCalloutJSON.forEach(function(apexCalloutEntry){
    var tempTS = apexCalloutEntry.TIMESTAMP;

    apexCalloutEntry.RUN_TIME = Number(apexCalloutEntry.RUN_TIME/1000);
    apexCalloutEntry.CPU_TIME = Number(apexCalloutEntry.CPU_TIME/1000);
    apexCalloutEntry.TIME = Number(apexCalloutEntry.TIME/1000);

    dataStr = dataStr
      + tempTS.substr(0,4)+"/" + tempTS.substr(4,2)+"/" + tempTS.substr(6,2)+" " + tempTS.substr(8,2)+":" + tempTS.substr(10,2)+":"  + tempTS.substr(12)
      + ", "+apexCalloutEntry.TIME + ", " + apexCalloutEntry.CPU_TIME
      + "\n";
  });
  displayApexCalloutReportRawData(apexCalloutJSON);
  showHideGraphSeries(labelStr);

  apexCalloutJSON = '';
  return dataStr;
}

function displayApexCalloutReportRawData(JSONData, labelStr){
  var recid = 1;
  $(JSONData).each(function(i,rec){
    rec.recid = recid++;
  });

  if(!w2ui['flowOfEventsGrid']){
    initializeFlowOfEventsGrid();
  }
  if(w2ui['apexCalloutGrid']){
    w2ui['apexCalloutGrid'].destroy();
  }

  var contentconfig = {
    grid1 : {
      name    : 'apexCalloutGrid',
      header  : '<B>Apex Callout Report</B>',
      multiSearch : true,
      searches : [
        { field: 'RUN_TIME', caption: 'Run Time', type: 'int' },
        { field: 'CPU_TIME', caption: 'CPU Time', type: 'int' },
        { field: 'METHOD', caption: 'Method', type: 'text' },
        { field: 'TYPE', caption: 'Type', type: 'text' },
        { field: 'SUCCESS', caption: 'Success?', type: 'text' } 
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
              var csv = w2ui['apexCalloutGrid'].records;
              var dataStr = "Timestamp, RequestId, Method, Type, URL, ReuestSize, ResponseSize, CPUTime, Time, Success\n";

              event.onComplete = function (){
                for(var i =0;i<csv.length; i++){
                  var csvrec = csv[i];

                  dataStr = dataStr
                    + csvrec.TIMESTAMP_DERIVED + ', '
                    + csvrec.REQUEST_ID + ', '
                    + csvrec.METHOD + ', '
                    + csvrec.TYPE + ', '
                    + "\""+ csvrec.URL + "\""+ ', '
                    + csvrec.REQUEST_SIZE + ', '
                    + csvrec.RESPONSE_SIZE + ', '
                    + csvrec.CPU_TIME + ', '
                    + csvrec.TIME + ', '
                    + csvrec.SUCCESS + ', '
                    + '\n';
                  csvrec = "";
                }
                exportData('ApexCallout', dataStr);
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
        { field: 'METHOD', caption: 'Method', size: '30%' },
        { field: 'TYPE', caption: 'Type', size: '30%' },
        { field: 'URL', caption: 'URL', size: '30%' },
        { field: 'REQUEST_SIZE', caption: 'Request Size', size: '30%' },
        { field: 'RESPONSE_SIZE', caption: 'Response Size', size: '30%' },
        { field: 'CPU_TIME', caption: 'CPU Time in s', size: '30%' },
        { field: 'TIME', caption: 'Time in s', size: '30%' },
        { field: 'SUCCESS', caption: 'Success', size: '30%' }
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

function getApexCalloutReportOptions(){
  var opt = {
    title   : 'Apex Callout Times',
    height  : 250,
    width   : 650,
    labels  : ["Timestamp", "Time", "CPUTime"],
    visibility: [false, false, false ],
    series  : {
      //'#SOQLQueries'  : {axis : 'y2'}
    },
    axes  : {
      x : {
        drawGrid : true
      },

      y : {
        valueRange : [0, 200],
        axisLabelWidth : 60
      }
      /*,
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
      w2ui['apexCalloutGrid'].search('all', datestr);
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
