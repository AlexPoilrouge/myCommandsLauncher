const { app, BrowserWindow, ipcMain } = require('electron')

const { CommandsUI } = require('./js/commandUI')


process.argv= process.argv.splice(2) // shift 2

const isDevMode= (process.argv.indexOf('dev') > -1)

const showOnStart= (process.argv.indexOf('show') > -1) || isDevMode

const ui= new CommandsUI({devMode: isDevMode})


app.whenReady().then(() => {
    ui.createTray()
    if(showOnStart) ui.createLauncherWindows()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) ui.createLauncherWindows()
    })

    ui.setIpcMainHandles(ipcMain)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      // let do nothing to keep the tray (?)
    }
  })