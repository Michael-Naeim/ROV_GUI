const {app, BrowserWindow, Menu, globalShortcut } = require('electron')
const path = require('path')
const url = require('url')
const contextMenu = require('electron-context-menu');
contextMenu({
	showSaveImageAs:true,
});

// setting up the environment as development

const isDev = process.env.NODE_ENV !== 'production' ? false : true;
let mainWindow

// size, icons and some specification for the app
function createWindow () {
   mainWindow = new BrowserWindow({
    // width: 850,
    // height: 640,
    resizable : false,
    icon: __dirname + '/pictures/logo.png',
    webPreferences: {
      nodeIntegration : true,spellcheck: true,
    },
  })
  mainWindow.maximize()

  // load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }))

}
// when the app opens
app.on('ready', ()=>{
  createWindow()
// some shortcuts
  globalShortcut.register('ctrl + R', ()=>mainWindow.reload())
  globalShortcut.register('ctrl + Shift + I', ()=>mainWindow.toggleDevTools())
  globalShortcut.register('ctrl + Q ', ()=>mainWindow.close())
  globalShortcut.register('ctrl + M', ()=>mainWindow.minimize())

  // hide default file menu
  mainWindow.setMenuBarVisibility(false)

  mainWindow.on('ready', ()=> mainWindow = null)
})


// Quit when all windows are closed.

app.on('window-all-closed', () => {
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app
  if (win === null) {
    createWindow()
  }
})
