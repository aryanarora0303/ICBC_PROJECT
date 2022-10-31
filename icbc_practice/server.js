//Importing Packages
const electron = require("electron");
const url      = require("url");
const path     = require("path");
const fs       = require("fs");

//Retrive the Variables
const { app, BrowserWindow, Menu, ipcMain } = electron;

//Create Window to display to the user
let mainWindow;

//Global Data
let ques_data_array;
let results_data;

//Listne for the app to be ready
app.on('ready', () => {

  //Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      worldSafeExecuteJavaScript: true
    }
  });

  //Load HTML into the window
  mainWindow.loadURL(url.format({

    //Formats the URL as file://(directory_name)/(html file)
    pathname: path.join(__dirname, "index.html"),
    protocol: 'file:',
    slashes: true
  }))

  //Build Menu from the template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  //Insert Menu
  Menu.setApplicationMenu(mainMenu);
})

//Create Menu Template
const mainMenuTemplate = [
  // Each object is a dropdown
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        role: 'add-item'
      },
      {
        label: 'Clear Items',
        role: 'clean-item'
      },
      {
        label: 'Quit',
        role: 'quit-program',
        click() {
          app.quit();
        }
      }
    ]
  }
];

//If Running on Mac Menu items needs to configured differently
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({
    label: ''
  });
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}

//Send Ques data to Main Window when ready
ipcMain.on('ques_data:ready', (e, isReady) => {

  //Check if ready to receive the data
  if (isReady) {

    //JSON File path
    json_file = path.join(__dirname, 'ques_data.json');

    //Read the JSON Data File
    fs.readFile(json_file, (error, raw_data) => {

      //Check for read error
      if (error) throw error;

      //Parse the file
      ques_data_array = JSON.parse(raw_data);

      console.log("Data Read Complete", ques_data_array);

      //Randomize the Questions
      ques_data_array.sort(() => Math.random() - 0.5);

      //Send the Data to the Screen
      mainWindow.webContents.send('ques_data:add', ques_data_array);
    })
  }

  //Not Ready
  else {
    console.log("Main Window not ready to recieve the data");
  }
});

//Listener for the test completion and results
ipcMain.on('test_results:ready', (e, results) => {

  //Store data
  results_data = results;
  
  //Load HTML into the window
  mainWindow.loadURL(url.format({

    //Formats the URL as file://(directory_name)/(html file)
    pathname: path.join(__dirname, "results.html"),
    protocol: 'file:',
    slashes: true
  }))
})

//Send Results data to Main Window when ready
ipcMain.on('results_page:ready', (e, isReady) => {
  
  //Check if ready to receive the data
  if (isReady) {

    //Send the Data to the Screen
    mainWindow.webContents.send('results_data:add', results_data, ques_data_array);
  }
  //Not Ready
  else {
    console.log("Results Window not ready to recieve the data");
  }

})