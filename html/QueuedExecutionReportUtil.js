//<!--QueuedExecutionReportUtil.js -->

function getQueuedExecutionReportData(queuedexecutionJSONStr) {
  var queuedexecutionJSON = JSON.parse(queuedexecutionJSONStr);
  queuedexecutionJSONStr = '';

  //var dataStr = "Timestamp, RunTime, CPUTime, DBTotalTime\n";
  var dataStr = "";
  var labelStr = ["RunTime", "CPUTime", "DBTotalTime"];

  queuedexecutionJSON.forEach(function (queuedexecutionEntry) {
    var tempTS = queuedexecutionEntry.TIMESTAMP;

    queuedexecutionEntry.RUN_TIME = Number(queuedexecutionEntry.RUN_TIME) / 1000;
    queuedexecutionEntry.CPU_TIME = Number(queuedexecutionEntry.CPU_TIME) / 1000;
    queuedexecutionEntry.DB_TOTAL_TIME = Number(queuedexecutionEntry.DB_TOTAL_TIME) / 1000000000;

    dataStr = dataStr + tempTS.substr(0, 4) + "/" + tempTS.substr(4, 2) + "/" + tempTS.substr(6, 2)
      + " " + tempTS.substr(8, 2) + ":" + tempTS.substr(10, 2) + ":" + tempTS.substr(12)
      + ", " + queuedexecutionEntry.RUN_TIME + ", " + queuedexecutionEntry.CPU_TIME
      + ", " + queuedexecutionEntry.DB_TOTAL_TIME + "\n"
  });

  displayQueuedExecutionReportRawData(queuedexecutionJSON, labelStr);
  showHideGraphSeries(labelStr);

  queuedexecutionJSON = '';
  return dataStr;

}

function displayQueuedExecutionReportRawData(JSONData, labelStr) {
  var recid = 1;
  $(JSONData).each(function (i, rec) {
    rec.recid = recid++;
  });

  if (!w2ui['flowOfEventsGrid']) {
    initializeFlowOfEventsGrid();
  }
  if (w2ui['queuedExecutionGrid']) {
    w2ui['queuedExecutionGrid'].destroy();
  }

  var contentconfig = {
    grid1: {
      name: 'queuedExecutionGrid',
      header: '<B>Q Batch Apex Execution Report</B>',
      multiSearch: true,
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
      toolbar: {
        items: [
          { type: 'break' },
          { type: 'button', id: 'failedjobdetailsid', caption: 'Failed Jobs', img: 'fa fa-exclamation-triangle' },
          { type: 'break' },
          { type: 'button', id: 'jobdetailsid', caption: 'What Failed ? ', img: 'fa fa-list-alt' },
          { type: 'spacer' },
          { type: 'button', id: 'exportdata', caption: 'Export Data', img: 'fa fa-download' },
        ],
        onClick: function (event) {
          var myGrid = w2ui['queuedExecutionGrid'];
          var sel = myGrid.getSelection();
          var _selObj = '';
          var _requestId = '';
          var _jobId = '';

          if (event.item.id != "exportdata") {
            if ((sel[0] == null || sel[0] == undefined)) {
              w2alert('select a job id to inspect')
              return;
            }
          }
          if (sel[0] != null) {
            _selObj = myGrid.get(sel[0]);
            _requestId = _selObj["REQUEST_ID"];
            _jobId = _selObj["JOB_ID"];
          }
          switch (event.item.id) {
            case "exportdata":
              var csv = w2ui['queuedExecutionGrid'].records;
              var dataStr = "Timestamp, RequestId, JobId, EnryPointe, RunTime, CPUTime, DBTotalTime\n";

              event.onComplete = function () {
                for (var i = 0; i < csv.length; i++) {
                  var csvrec = csv[i];

                  dataStr = dataStr
                    + csvrec.TIMESTAMP_DERIVED + ', '
                    + csvrec.REQUEST_ID + ', '
                    + csvrec.JOB_ID + ', '
                    + csvrec.ENTRY_Point + ', '
                    + csvrec.RUN_TIME + ', '
                    + csvrec.CPU_TIME + ', '
                    + csvrec.DB_TOTAL_TIME + ', '
                    + csvrec.REQUEST_STATUS + '\n';
                  csvrec = "";
                }
                exportData('QueuedExecution', dataStr);
              }
              csv = "";
              break;
            case "inspectjobid":
              w2popup.open({
                title: 'Failure Details',
                width: 1300,
                height: 600,
                showMax: true,
                body: '<div id="jobsummaryid" style="position: absolute; left: 5px; top: 5px; right: 5px; bottom: 5px"></div>',

                onClose: function (event) {
                  if (w2ui['jobsummarygrid']) {
                    w2ui['jobsummarygrid'].clear();
                    w2ui['jobsummarygrid'].destroy();
                  }
                },

                onOpen: function (event) {
                  event.onComplete = function () {
                    if (w2ui['jobsummarygrid']) {
                      w2ui['jobsummarygrid'].clear();
                      w2ui['jobsummarygrid'].destroy();
                    }
                    $('#w2ui-popup #jobsummaryid').w2grid({
                      name: 'jobsummarygrid',
                      method: 'GET',
                      //url : 'http://localhost:3001/findEvents/?requestid='+_requestId,
                      url: 'http://localhost:3001/findApexExceptionEvents/?jobid=' + _jobId + '&requestid=' + _requestId,
                      show: { header: true, columnHeaders: true, toolbar: true },

                      columns: [
                        { field: 'TIMESTAMP_DERIVED', caption: 'Timestamp', size: '30%' },
                        { field: 'REQUEST_ID', caption: 'Request Id', size: '30%' },
                        { field: 'JobId', caption: 'Job Id', size: '30%' },
                        { field: 'EXCEPTION_TYPE', caption: 'Exception Type', size: '30%' },
                        { field: 'EXCEPTION_MESSAGE', caption: 'Exception Message', size: '30%' }
                      ],

                      show: {
                        toolbar: true,
                        footer: true,
                        toolbarSearch: true,
                        toolbarColumns: true,
                        lineNumbers: true,
                        selectColumn: true,
                        expandColumn: false
                      },

                      parser: function (responseText) {

                        var result = $.parseJSON(responseText);
                        var JSONData = {
                          "status": "success",
                          "totalSize": result.length,
                          "records": result
                        };

                        var data = JSONData["records"];
                        w2ui.jobsummarygrid.total = data.length;
                        var recid = 1;

                        $(data).each(function (i, rec) {
                          rec.recid = recid++;
                          rec.JobId = _jobId;
                        });

                        JSONData['records'] = data;
                        result = '';
                        data = '';
                        return JSONData;
                      }
                    });
                  };
                }
              });
              break;
            case "failedjobsdetailsid":
                w2popup.open({
                  title: 'Failed Jobs',
                  width: 1350,
                  height: 600,
                  showMax: true,
                  body: '<div id="failedjobsdetailsdivid" style="position: absolute; left: 5px; top: 5px; right: 5px; bottom: 5px"></div>',
  
                  onClose: function (event) {
                    if (w2ui['failedjobsgrid']) {
                      w2ui['failedjobsgrid'].clear();
                      w2ui['failedjobsgrid'].destroy();
                    }
                  },
  
                  onOpen: function (event) {
                    event.onComplete = function () {
                      if (w2ui['failedjobsgrid']) {
                        w2ui['failedjobsgrid'].clear();
                        w2ui['failedjobsgrid'].destroy();
                      }
                      $('#w2ui-popup #failedjobsdetailsdivid').w2grid({
                        name: 'failedjobsgrid',
                        method: 'GET',
                        //url : 'http://localhost:3001/findEvents/?requestid='+_requestId,
                        url: 'http://localhost:3001/findFailedApexJobs/?fromdate=' + globalvars.fromDate + '&todate=' + _globalvars.toDate,
                        show: { header: true, columnHeaders: true, toolbar: true },
  
                        columns: [
                          { field: 'Id', caption: 'Id', editable:{type: 'text' }, size: '30%' },
                          { field: 'ParentJobId', caption: 'ParentJobId', editable:{type: 'text' }, size: '30%' },
                          { field: 'CreatedDate', caption: 'CreatedDate', editable:{type: 'text' }, size: '30%' },
                          { field: 'JobType', caption: 'JobType', editable:{type: 'text' }, size: '30%' },
                          { field: 'TotalJobItems', caption: 'TotalJobItems', editable:{type: 'text' }, size: '30%' },
                          { field: 'JobItemsProcessed', caption: 'JobItemsProcessed', editable:{type: 'text' }, size: '30%' },
                          { field: 'NumberOfErrors', caption: 'NumberOfErrors', editable:{type: 'text' }, size: '30%' },
                          { field: 'Status', caption: 'Status', editable:{type: 'text' }, size: '30%' },
                          { field: 'ExtendedStatus', caption: 'ExtendedStatus', editable:{type: 'text' }, size: '30%' },
                          { field: 'CompletedDate', caption: 'CompletedDate', editable:{type: 'text' }, size: '30%' },
                          { field: 'LastProcessed', caption: 'LastProcessed', editable:{type: 'text' }, size: '30%' },
                          { field: 'LastProcessedOffset', caption: 'LastProcessedOffset', editable:{type: 'text' }, size: '30%' },
                          { field: 'CreatedById', caption: 'CreatedById', editable:{type: 'text' }, size: '30%' }
                        ],
  
                        show: {
                          toolbar: true,
                          footer: true,
                          toolbarSearch: true,
                          toolbarColumns: true,
                          lineNumbers: true,
                          selectColumn: true,
                          expandColumn: false
                        },
  
                        parser: function (responseText) {
  
                          var result = $.parseJSON(responseText);
                          var JSONData = {
                            "status": "success",
                            "totalSize": result.length,
                            "records": result
                          };
  
                          var data = JSONData["records"];
                          w2ui.failedjobsgrid.total = data.length;
                          var recid = 1;
  
                          $(data).each(function (i, rec) {
                            rec.recid = recid++;
                          });
  
                          JSONData['records'] = data;
                          result = '';
                          data = '';
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

      columns: [
        { field: 'TIMESTAMP_DERIVED', caption: 'Timestamp', size: '30%' },
        { field: 'REQUEST_ID', caption: 'Request Id', size: '30%' },
        { field: 'JOB_ID', caption: 'Job Id', size: '30%' },
        { field: 'ENTRY_POIINT', caption: 'Entry Point', size: '30%' },
        { field: 'RUN_TIME', caption: 'Run Time in s', size: '30%' },
        { field: 'CPU_TIME', caption: 'Cpu Time in s', size: '30%' },
        { field: 'DB_TOTAL_TIME', caption: 'DB Total Time', size: '30%' },
        { field: 'REQUEST_STATUS', caption: 'Request Status', size: '30%' },
      ],
      show: {
        toolbar: true,
        footer: true,
        header: true,
        toolbarSearch: true,
        toolbarColumns: true,
        lineNumbers: true,
        selectColumn: true,
        toolbarSave: false,
        expandColumn: false
      },
      records: JSONData,
      multiSelect: true,
      onClick: function (event) {
        var grid = this;
        w2ui['flowOfEventsGrid'].clear();
        event.onComplete = function () {
          var sel = grid.getSelection();
          var record = this.get(event.recid);
          loadDoc('http://localhost:3001/findEventsUsingJobID/?jobid=' + record.JOB_ID, showResults, 'requestreport');
        }
      }
    }
  };
  $(function () {
    var grid1 = $().w2grid(contentconfig.grid1);
    w2ui.globalcontentlayout.html('main', grid1);

  });
  JSONData = '';
  dataStr = '';
}

function getQueuedExecutionReportOptions() {
  var opt = {
    title: 'QueuedExecution Times',
    height: 250,
    width: 650,
    labels: ["Timestamp", "RunTime", "CPUTime", "Failures"],
    visibility: [false, false, false, false],
    series: {
      '#Failures': { axis: 'y2' }
    },
    axes: {
      x: {
        drawGrid: true
      },

      y: {
        valueRange: [0, 200],
        axisLabelWidth: 60
      },

      y2: {
        valueRange: [0, 100],
        labelsKMB: true
      }
    },
    ylabel: 'Time in Secs',
    y2label: '# SOQL Queries',
    xlabel: 'Timestamp -->',
    plotter: smoothPlotter,

    animatedZooms: true,
    connectSeparatedPoints: false,
    errorBars: false,
    drawPoints: true,
    showRangeSelector: false,
    stackedGraph: false,

    strokeWidth: 0.5,
    strokeBorderWidth: 0.5,
    highlightCircleSize: 2,
    fillAlpha: 0.2,

    highlightSeriesOpts: {
      strokeWidth: 1,
      strokeBorderWidth: 1,
      highlightCircleSize: 5,
    },
    legend: 'always',

    pointClickCallback: function (event, points) {
      var mydt = new Date(points.xval);
      var ms = new String(points.xval);
      var dgtms = ms.substr(ms.length - 3);
      var datestr = new String(mydt).substr(16, 8) + '.' + dgtms;
      w2ui['queuedExecutionGrid'].search('all', datestr);
      event.stopPropagation();
      mydt = '';
      ms = '';
      dgtms = '';
    },

    colors: [
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
