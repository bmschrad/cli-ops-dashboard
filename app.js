var blessed = require('blessed')
  , contrib = require('blessed-contrib')
  , t_msgs = require('./test_messages').test_msgs
  , moment = require('moment')
  , screen = blessed.screen()

/*** Globals ***/
var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});
var hb_threshold = 1; // How long the heart beat from api data should be (minutes)
var check_api_interval = 5;  // How often to check ops-api (seconds)
var i_test_msg = 0;
var ops_status;
/*** End Globals ***/

/*** Widget Setup ***/
var lcdLine = grid.set(0,0,2,3, contrib.lcd,
  {
    label: "Last Updated",
    segmentWidth: 0.06,
    segmentInterval: 0.11,
    strokeWidth: 0.1,
    elements: 5,
    display: '00.00',
    color: 'red',
    elementSpacing: 4,
    elementPadding: 2
  }
);

// Render screen
screen.render()
  //, bar = contrib.stackedBar(
       //{ label: 'Form Status (#)'
       //, barWidth: 4
       //, barSpacing: 8
       //, xOffset: 0
       ////, maxValue: 15
       //, height: "40%"
       //, width: "50%"
       //, barBgColor: [ 'red', 'yellow', 'green', 'blue' ]})
/*** End Widget Setup ***/

/*** Data Setup ***/
// API Check
setInterval(function() {
    if (i_test_msg == t_msgs.length) i_test_msg = 0;
    ops_msg = t_msgs[i_test_msg];

    // If we have no ops_status because of a first run or we get a new one we need to update
    if (ops_status == null || ops_status.hb != ops_msg.hb) {
        // We got a new status msg in so let's process it for all the widgets
        ops_status = ops_msg;

        //lcdLine.setOptions({label: `Last Updated: ${ops_status.hb}`});
        lcdLine.setLabel(`Last Updated: ${ops_status.hb}`);
    }
    else { console.log('No Update');}
    //console.log(t_msgs[i_test_msg]);
    i_test_msg++;
}, check_api_interval * 1000);
 
// LCD Countdown logic
setInterval(function() {
    if (ops_status != null){
        var next_hb = moment(ops_status.hb).add(hb_threshold, 'minutes');
        var duration = moment.duration(next_hb.diff(moment()));
        var minutes = ("0" + duration.minutes()).slice(-2);
        var seconds = ("0" + duration.seconds()).slice(-2);
        var dispColor = moment().isSameOrBefore(next_hb) ? 'green' : 'red';

        lcdLine.setDisplay(`${minutes}.${seconds}`);
        lcdLine.setOptions({
            color: dispColor
        });

        screen.render();
    }
}, 1000);

//bar.setData(
       //{ barCategory: ['MDS', 'PBJ', 'REP', 'CFS']
       //, stackedCategory: ['in', 'over']
       //, data:
          //[ [ 10, 7]
          //, [1, 0]
          //, [8, 3]
          //, [1, 0] ]
       //})
/*** Data Setup ***/

