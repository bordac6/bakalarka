const {app, Tray, Menu, BrowserWindow} = require('electron');
const path = require('path');
const finder = require('fs-finder');

const iconPath = path.join(__dirname, 'ic.png');
const grayiconPath = path.join(__dirname, 'gric.png');
let configName = 'config.json';
let os = require('os');
let loginConfigPath = path.join(os.homedir(), 'AlexaComputerControl', configName);
const afs = require('await-fs');
const fs = require('fs');
let appIcon = null;
let win = null;
var forked = null;

app.on('ready', function(){
  //during startup
  win = new BrowserWindow({show: false});
  appIcon = new Tray(grayiconPath);
  console.log("app ready");
    console.log("async function");
  try{
    //saved login
    config = fs.readFileSync(loginConfigPath, 'utf8');
    console.log('config: ', config);
    connectToComputerControlClient()
    //console.log('saved: ', config)
  }
  catch(err){
      //first start
      //user input
      console.log(err)
      login();
  }

  //button eavents
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'reconnect',
      click: function() {
          if(forked !== null) forked.kill('SIGKILL');
          connectToComputerControlClient()
      }
    },
    {
      label: 'disconnect',
      click: function(){
        if(forked != null){
          forked.send('hello')
          forked.kill('SIGKILL')
        }
      }
    },
    {
      label: 'reload command file',
      click: function(){
        if(forked !== null){
          forked.send('reload commands')
        }
      }
    },
    {
      label: 'login',
      click: function(){
        login()
      }
    },
    { label: 'Quit',
      accelerator: 'Command+Q',
      selector: 'terminate:',
      click: function(){
        app.exit()
      }
    }
  ]);
  appIcon.setToolTip('Alexa Computer Control');
  appIcon.setContextMenu(contextMenu);
});

function connectToComputerControlClient(){
  
  const {fork} = require('child_process')

  function runScript(scriptPath, callback) {
  
      // keep track of whether callback has been invoked to prevent multiple invocations
      var invoked = false;
      
      forked = fork(scriptPath);
      
      // listen for message from child process
      forked.on('message', function(msg){
        console.log('Message from child: ', msg)
        appIcon.setImage(iconPath)
        if(msg === 'disconnected'){
          forked.kill('SIGKILL')
        }
      })
  
      // listen for errors as they may prevent the exit event from firing
      forked.on('error', function (err) {
          if (invoked) return;
          invoked = true;
          callback(err);
      });
  
      // execute the callback once the process has finished running
      forked.on('exit', function (code) {
          if (invoked) return;
          appIcon.setImage(grayiconPath)
          invoked = true;
          // var err = code === null ? null : new Error('exit code ' + code);
          // callback(err);
      });
  }
  
  // Now we can run a script and invoke a callback when complete, e.g.
  var file = finder.from(path.join(__dirname, '/..')).findFirst().findFiles('client.js')
  console.log(file)
  runScript(file, function (err) {
      if (err) throw err;
      console.log('finished running computer control');
  });        
}

function login(){
  win = new BrowserWindow({
    width: 205,
    height: 150
  });
  win.loadURL('file://' + __dirname + '/index.html')  
  //save to file in index.html
}