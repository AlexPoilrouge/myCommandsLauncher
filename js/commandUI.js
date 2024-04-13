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

class CommandsUI {
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
    }

    createLauncherWindows(){
        if(this.windows[LAUNCHERWINDOW_KEY]){
            console.log(`"${LAUNCHERWINDOW_KEY}" window already open…`)
            return
        }

        let win= new BrowserWindow(this.cmdWindow_options)

        win.loadFile(path.join(__dirname, CMDWINDOW_HTMLFILE_PATH))

        if(this.devMode) win.webContents.openDevTools();

        win.on('closed', (e) => {
          delete this.windows[LAUNCHERWINDOW_KEY]
        })

        this.windows[LAUNCHERWINDOW_KEY]= win
    }

    toggleLauncherWindows(){
        if(this.windows[LAUNCHERWINDOW_KEY]){
            this.windows[LAUNCHERWINDOW_KEY].close()
        }
        else{
            this.createLauncherWindows()
        }
    }

    closeLauncherWindows() {
        if(this.windows[LAUNCHERWINDOW_KEY]){
            this.windows.launcher.close()
            delete this.windows[LAUNCHERWINDOW_KEY]
        }
    }

    callCommandsFile(commandsDefaultFilePath=undefined) {
        let file= commandsDefaultFilePath ?? commons.COMMANDS_DEFAULT_FILE
        shell.openPath(file)
    }

    createTray(){
        const tray= new Tray(path.join(__dirname, TRAYICON_PNGFILE_PATH))
        tray.setToolTip(`commands launcher`)

        const contextMenu= Menu.buildFromTemplate([
            {label: "Commands Launcher", type: 'normal', click: () => this.createLauncherWindows()},
            {label: "___", type: 'separator'},
            {label: "Commands File", type: 'normal', click: () => this.callCommandsFile()},
            {label: "___", type: 'separator'},
            {label: "Exit", type: 'normal', click: app.quit},
        ])

        tray.setContextMenu(contextMenu)

        tray.on('click', (event) => {
            this.toggleLauncherWindows();
        })
    }

    addCallBack(name, func){
        this.callBacks.push({name, func})
    }

    invoke(name){
        for(let cb_obj of this.callBacks){
            if(cb_obj.name===name && cb_obj.func) cb_obj.func()
        }
    }

    getInvokables(){
        //each only once
        return this.callBacks.map(cb_obj => cb_obj.name)
                .filter((value, index, array) => {
                    return array.indexOf(value)===index
                })
    }

    setIpcMainHandles(ipc_main){
        let invokables= this.getInvokables()
        for(let invokable of invokables){
            ipc_main.handle(invokable, () => this.invoke(invokable))
        }
    }
}

module.exports= {
    CommandsUI,
    Invokables: { INVOKABLE_COMMANDCLOSE_NOTICE }
}
