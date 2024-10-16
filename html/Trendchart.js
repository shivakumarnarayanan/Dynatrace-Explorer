//Trendchart.js
function getTrendChartData(trendChartJSONStr){
    console.log('In getTrendChartData : \n');
    var trendChartJSON = JSON.parse(trendChartJSONStr);
    trendChartJSONStr = '';

    //var dataStr = "Timestamp, RunTime, CPUTime, ExecTime, DBTotalTime\n";
    var dataStr = "Timestamp, MaxRuntime, AvgRuntime, MaxCPUtime, AvgCPUtime, MaxExectime, AvgExectime, MaxDBtime, AvgDBtime, MaxCallouttime, AvgCallouttime";
    var labelStr = ["MaxRuntime", "AvgRuntime", "MaxCPUtime", "AvgCPUtime", "MaxExectime", "AvgExectime", "MaxDBtime", "AvgDBtime", "MaxCallouttime", "AvgCallouttime"];

    trendChartJSON.forEach(function(trendChartEntry){
    var tempTS = trendChartEntry.z_id;

    trendChartEntry.MaxRuntime = Number(trendChartEntry.MaxRuntime/1000); isNaN(trendChartEntry.MaxRuntime)?0:trendChartEntry.MaxRuntime;
    trendChartEntry.AvgRuntime = Number(trendChartEntry.AvgRuntime/1000); isNaN(trendChartEntry.AvgRuntime)?0:trendChartEntry.AvgRuntime;
    trendChartEntry.MaxCPUtime = Number(trendChartEntry.MaxCPUtime/1000); isNaN(trendChartEntry.MaxCPUtime)?0:trendChartEntry.MaxCPUtime;
    trendChartEntry.AvgCPUtime = Number(trendChartEntry.AvgCPUtime/1000); isNaN(trendChartEntry.AvgCPUtime)?0:trendChartEntry.AvgCPUtime;
    trendChartEntry.MaxExectime = Number(trendChartEntry.MaxExectime/1000); isNaN(trendChartEntry.MaxExectime)?0:trendChartEntry.MaxExectime;
    trendChartEntry.AvgExectime = Number(trendChartEntry.AvgExectime/1000); isNaN(trendChartEntry.AvgExectime)?0:trendChartEntry.AvgExectime;
    trendChartEntry.MaxCallouttime = Number(trendChartEntry.MaxCallouttime/1000); isNaN(trendChartEntry.MaxCallouttime)?0:trendChartEntry.MaxCallouttime;
    trendChartEntry.AvgCallouttime = Number(trendChartEntry.AvgCallouttime/1000); isNaN(trendChartEntry.AvgCallouttime)?0:trendChartEntry.AvgCallouttime;
    trendChartEntry.MaxDBtime = Number(trendChartEntry.MaxDBtime/1000000000); isNaN(trendChartEntry.MaxDBtime)?0:trendChartEntry.MaxDBtime;
    trendChartEntry.AvgDBtime = Number(trendChartEntry.AvgDBtime/1000000000); isNaN(trendChartEntry.AvgDBtime)?0:trendChartEntry.AvgDBtime;

    dataStr = dataStr
        + tempTS.substr(0,4)+"/" + tempTS.substr(4,2)+"/" + tempTS.substr(6,2)+" " + tempTS.substr(8,2)+":" + tempTS.substr(10,2)+":"  + tempTS.substr(12)
        + ", "+trendChartEntry.MaxRuntime + ", " + trendChartEntry.AvgRuntime
        + ", "+trendChartEntry.MaxCPUtime + ", " + trendChartEntry.AvgCPUtime
        + ", "+trendChartEntry.MaxExectime + ", " + trendChartEntry.AvgExectime
        + ", "+trendChartEntry.MaxCallouttime + ", " + trendChartEntry.AvgCallouttime
        + ", "+trendChartEntry.MaxDBtime + ", " + trendChartEntry.AvgDBtime
        + "\n";
    });
   
    showHideGraphSeries(labelStr);

    trendChartJSON = '';
    return dataStr;
}

function getTrendChartOptions(){
    var opt = {
        title   : 'Trend Chart',
        height  : 250,
        width   : 1450,
        labels  : ["Timestamp", "MaxRuntime", "AvgRuntime", "MaxCPUtime", "AvgCPUtime", "MaxExectime", "AvgExectime", "MaxDBtime", "AvgDBtime", "MaxCallouttime", "AvgCallouttime"],
        visibility: [false, false, false, false, false, false, false, false, false, false, false],
        axes  : {
            x : {
                drawGrid : true
            },
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
  