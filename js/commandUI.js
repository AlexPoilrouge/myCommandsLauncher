const { app, BrowserWindow, Tray, Menu, shell } = require('electron')
const path = require('node:path') 

const commons= require('./commons')


const WINDOW_SIZE= {w: 300, h: 600}
const WINDOW_SIZE_DEV= {w: 800, h:600}

const CMDWINDOW_HTMLFILE_PATH= "../html/launcher.html"
const CMDWINDOW_PRELOAD_SCRIPT_PATH= "scripts/launcher_preload.js"

const TRAYICON_PNGFILE_PATH= "../icons/tray.png"

const LAUNCHERWINDOW_KEY= "launcher"

const INVOKABLE_COMMANDCLOSE_NOTICE= "command_close"
const INVOKABLE_APPSHUTDOWN_NOTICE= "app_shutdown"

/**
 * Handles the app's UI:
 *  'Commands' window, tray, etc.
 */
class CommandsUI {
    /**
     * @param {Object | Electron.BrowserWindowConstructorOptions} options - essentially a
     *          Electron.BrowserWindowConstructorOptions. 'width' and 'height' are unchangable
     *          though. Following unprovided parameters will be set to a default value:
     *              webPreferences, frame, resizable
     */
    constructor(options){
        this.cmdWindow_options= Object.assign({}, options)

        this.devMode= this.cmdWindow_options.devMode ?? false
        delete options['devMode']

        this.cmdWindow_options.width=
            options.width ?? ((this.devMode? WINDOW_SIZE_DEV.w : WINDOW_SIZE.w))
        this.cmdWindow_options.height=
            options.height ?? ((this.devMode? WINDOW_SIZE_DEV.h : WINDOW_SIZE.h))

        this.cmdWindow_options.webPreferences= options.webPreferences ??
            {
                sandbox: false,
                contextIsolation: true,
                preload: path.join(__dirname, CMDWINDOW_PRELOAD_SCRIPT_PATH),
            }

        this.cmdWindow_options.frame = (options.frame!==undefined)? options.frame : false

        this.cmdWindow_options.resizable = (options.resizable!==undefined)? options.resizable : false

        this.windows= {}
        this.callBacks= []

        this.addCallBack(INVOKABLE_COMMANDCLOSE_NOTICE, () => {
            let win= this.windows[LAUNCHERWINDOW_KEY]
            if(win){
                win.close()
            }
        })

        this.addCallBack(INVOKABLE_APPSHUTDOWN_NOTICE, app.quit)
    }

    /**
     * Creates the app's 'Commands' window, if it isn't already
     *  opened.
     */
    createLauncherWindows(){
        if(this.windows[LAUNCHERWINDOW_KEY]){
            console.log(`"${LAUNCHERWINDOW_KEY}" window already open…`)
            return
        }

        let win= new BrowserWindow(this.cmdWindow_options)

        // loading the html
        win.loadFile(path.join(__dirname, CMDWINDOW_HTMLFILE_PATH))

        // dev tools if in devmode
        if(this.devMode) win.webContents.openDevTools();

        //cleanup when window is closed
        win.on('closed', (e) => {
          delete this.windows[LAUNCHERWINDOW_KEY]
        })

        //register window as created
        this.windows[LAUNCHERWINDOW_KEY]= win
    }

    /**
     * Creates the app's 'Commands' window, if it isn't already
     *  opened. Otherwise closes the already existing one.
     */
    toggleLauncherWindows(){
        if(this.windows[LAUNCHERWINDOW_KEY]){
            this.windows[LAUNCHERWINDOW_KEY].close()
        }
        else{
            this.createLauncherWindows()
        }
    }

    /**
     * If the app's 'Commands' window is opened, closes it.
     */
    closeLauncherWindows() {
        if(this.windows[LAUNCHERWINDOW_KEY]){
            this.windows.launcher.close()
            delete this.windows[LAUNCHERWINDOW_KEY]
        }
    }

    /**
     * Opens the 'commands' file JSON data source with external editor/application
     */
    callCommandsFile(commandsDefaultFilePath=undefined) {
        let file= commandsDefaultFilePath ?? commons.COMMANDS_DEFAULT_FILE
        shell.openPath(file)
    }

    /**
     * Creates the app's indicator in system's tray.
     */
    createTray(){
        const tray= new Tray(path.join(__dirname, TRAYICON_PNGFILE_PATH))
        tray.setToolTip(`commands launcher`)

        // right click's context menu
        const contextMenu= Menu.buildFromTemplate([
            {label: "Commands Launcher", type: 'normal', click: () => this.createLauncherWindows()},
            {label: "___", type: 'separator'},
            {label: "Commands File", type: 'normal', click: () => this.callCommandsFile()},
            {label: "___", type: 'separator'},
            {label: "Exit", type: 'normal', click: app.quit},
        ])

        tray.setContextMenu(contextMenu)

        // Toggles 'Commands' window when tray icon click
        tray.on('click', (event) => {
            this.toggleLauncherWindows();
        })
    }

    /**
     * Registers a clallback function for a given inovkable
     *  (ipcHandle)
     * 
     * @param {String} name - the name of the inovkable (ipcHandle)
     * @param {Function} func - the callback function (no parameter)
     */
    addCallBack(name, func){
        this.callBacks.push({name, func})
    }

    /**
     * Runs all the callbacks for a given invokable (ipcHandle)
     * 
     * @param {String} name  - the name of the inovkable (ipcHandle)
     */
    invoke(name){
        for(let cb_obj of this.callBacks){
            if(cb_obj.name===name && cb_obj.func) cb_obj.func()
        }
    }

    /**
     * Returns a list of all invokables (ipcHandle)
     * 
     * @returns a list of strings: string[]
     */
    getInvokables(){
        //each only once
        return this.callBacks.map(cb_obj => cb_obj.name)
                .filter((value, index, array) => {
                    return array.indexOf(value)===index
                })
    }

    /**
     * Registers all of the invokables (ipcHandle)
     * 
     * @param {IpcMain} ipc_main 
     */
    setIpcMainHandles(ipc_main){
        let invokables= this.getInvokables()
        for(let invokable of invokables){
            ipc_main.handle(invokable, () => this.invoke(invokable))
        }
    }
}

module.exports= {
    CommandsUI,
    Invokables: {
        INVOKABLE_COMMANDCLOSE_NOTICE,
        INVOKABLE_APPSHUTDOWN_NOTICE
    }
}
