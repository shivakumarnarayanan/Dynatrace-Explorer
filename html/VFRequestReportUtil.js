//----- VFRequestReportUtil.js------
function getVFRequestReportData(vfRequestJSONStr){
  //alert(1);
  var vfRequestJSON = JSON.parse(vfRequestJSONStr);
  vfRequestJSONStr = '';

  //var dataStr = "Timestamp, Run Time, CPU Time, DB CPU Time, DB Total Time, #DB Blocks\n";
  var dataStr = "";
  var labelStr = ['RunTime', 'CPUTime', 'DBCPUTime', 'DBTotalTime', '#DB Blocks'];

  vfRequestJSON.forEach(function(vfRequestEntry){
    var tempTS = vfRequestEntry.TIMESTAMP;
    vfRequestEntry.DB_TOTAL_TIME = Number(vfRequestEntry.DB_TOTAL_TIME/1000000000);
    vfRequestEntry.RUN_TIME = Number(vfRequestEntry.RUN_TIME/1000);
    vfRequestEntry.CPU_TIME = Number(vfRequestEntry.CPU_TIME/1000);
    vfRequestEntry.DB_CPU_TIME = Number(vfRequestEntry.DB_CPU_TIME/1000);

    dataStr = dataStr
      + tempTS.substr(0,4)+"/" + tempTS.substr(4,2)+"/" + tempTS.substr(6,2)
      +" "+ tempTS.substr(8,2)+":" + tempTS.substr(10,2)+":"  + tempTS.substr(12)
      + ","+vfRequestEntry.RUN_TIME + "," + vfRequestEntry.CPU_TIME
      + vfRequestEntry.DB_CPU_TIME + ","+vfRequestEntry.DB_TOTAL_TIME + ","
      + Number(vfRequestEntry.DB_BLOCKS)
      + "\n";
  });
  console.log(dataStr);
  displayVFRequestReportRawData(vfRequestJSON);
  showHideGraphSeries(labelStr);

  vfRequestJSON = '';
  //alert(2);
  return dataStr;
}

function displayVFRequestReportRawData(JSONData){
  //alert(3);
  var recid = 1;
  $(JSONData).each(function(i,rec){
    rec.recid = recid++;
  });

  if(!w2ui['flowOfEventsGrid']){
    initializeFlowOfEventsGrid();
  }
  if(w2ui['vfRequestGrid']){
    w2ui['vfRequestGrid'].destroy();
  }
  //alert(4);
  var contentconfig = {
    grid1 : {
      name    : 'vfRequestGrid',
      header  : '<B>VF Request  Report</B>',
      multiSearch : true,
      /*
      searches : [
        { field: 'RUN_TIME', caption: 'Run Time', type: 'int' },
        { field: 'CPU_TIME', caption: 'CPU Time', type: 'int' },
        { field: 'DB_TOTAL_TIME', caption: 'DB Total Time', type: 'int' },
        { field: 'DB_CPU_TIME', caption: 'DB CPU Time', type: 'int' },
        { field: 'VIEW_STATE_SIZE', caption: 'Viewstate Size', type: 'int' },
        { field: 'HTTP_METHOD', caption: 'HTTP Method', type: 'text' },
        { field: 'IS_AJAX_REQUEST', caption: 'Is Ajax ?', type: 'text' }
      ],
      */
      toolbar : {
        items : [
          { type: 'break'  },
          { type: 'spacer' },
          { type: 'button', id: 'exportdata', caption: 'Export Data', img: 'fa fa-download' },
        ],
        onClick : function(event) {
          switch(event.item.id){
            case "exportdata":
              var csv = w2ui['vfRequestGrid'].records;
              var dataStr = "Timestamp, RequestId, Page Name, Managed Package Namespace, HTTP Method, RunTime, CPUTime, Ajax Req?, isFirstReq?, Req Size, Req Status, Request Type, Response Size, Query, DB CPU Time,  DBTotalTime, DB Blocks, Viewstate Size\n";

              event.onComplete = function (){
                for(var i =0;i<csv.length; i++){
                  var csvrec = csv[i];

                  dataStr = dataStr
                    + csvrec.TIMESTAMP_DERIVED + ', '
                    + csvrec.REQUEST_ID + ', '
                    + csvrec.PAGE_NAME + ', '
                    + csvrec.MANAGED_PACKAGE_NAMESPACE + ', '
                    + csvrec.HTTP_METHOD + ', '
                    + csvrec.RUN_TIME + ', '
                    + csvrec.CPU_TIME + ', '
                    + csvrec.IS_AJAX_REQUEST + ', '
                    + csvrec.IS_FIRST_REQUEST + ', '
                    + csvrec.REQUEST_SIZE + ', '
                    + csvrec.REQUEST_STATUS + ', '
                    + csvrec.REQUEST_TYPE + ', '
                    + csvrec.RESPONSE_SIZE + ', '
                    + csvrec.QUERY + ', '
                    + csvrec.DB_CPU_TIME + ', '
                    + csvrec.DB_TOTAL_TIME + ', '
                    + csvrec.DB_BLOCKS + ', '
                    + csvrec.VIEW_STATE_SIZE + ', '
                    + '\n';
                  csvrec = "";
                }
                exportData('VFRequest', dataStr);
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
        { field: 'PAGE_NAME', caption: 'Page Name', size: '30%' },
        { field: 'MANAGED_PACKAGE_NAMESPACE', caption: 'Namespace', size: '30%' },
        { field: 'HTTP_METHOD', caption: 'HTTP Method', size: '30%' },
        { field: 'IS_AJAX_REQUEST', caption: 'Ajax?', size: '30%' },
        { field: 'IS_FIRST_REQUEST', caption: 'First Req?', size: '30%' },
        { field: 'REQUEST_SIZE', caption: 'Request Size', size: '30%' },
        { field: 'REQUEST_STATUS', caption: 'Request Status', size: '30%' },
        { field: 'REQUEST_TYPE', caption: 'Request Type', size: '30%' },
        { field: 'RESPONSE_SIZE', caption: 'Response Size', size: '30%' },
        { field: 'QUERY', caption: 'Query', size: '30%' },
        { field: 'DB_CPU_TIME', caption: 'DB CPU Time', size: '30%' },
        { field: 'RUN_TIME', caption: 'Run Time in s', size: '30%' },
        { field: 'CPU_TIME', caption: 'CPU Time in s', size: '30%' },
        { field: 'DB_TOTAL_TIME', caption: 'DB Total Time in s', size: '30%' },
        { field: 'DB_BLOCKS', caption: 'DB Blocks', size: '30%' },
        { field: 'VIEW_STATE_SIZE', caption: 'Viewstate Size', size: '30%' },
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
  //alert(5);
  $(function() {
    //alert(6);
    var grid1 = $().w2grid(contentconfig.grid1);
    w2ui.globalcontentlayout.html('main', grid1);
    //alert(7);
  });
  JSONData = '';
  dataStr = '';
}

function getVFRequestReportOptions(){
  //alert(8);
  var opt = {
    title   : 'VFRequest Times',
    height  : 250,
    width   : 650,
    labels  : ['Timestamp', 'RunTime', 'CPUTime', 'DBCPUTime', 'DBTotalTime', '#DBBlocks'],
    visibility: [false, false, false, false, false, false],
    
    series  : {
      '#DBBlocks'  : {axis : 'y2'}
    },
   
    axes  : {
      x : {
        valueFormatter: Dygraph.datetimeString_,
        ticker: Dygraph.dateTicker,       
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
    y2label : '# DB Blocks',
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
      w2ui['vfRequestGrid'].search('TIMESTAMP_DERIVED', datestr);
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
  //alert(9);
  return opt;
}
