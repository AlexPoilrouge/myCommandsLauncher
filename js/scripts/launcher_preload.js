const { contextBridge, ipcRenderer } = require('electron')
const handler= require('../commandHandler')

const {Invokables} = require('../commandUI')

//we'll handle the 'commands' data from here
let commandHandler= new handler.CommandHandler()

//only these should be invokable from ui code
const ALLOWED_INVOKABLES= [
    Invokables.INVOKABLE_COMMANDCLOSE_NOTICE,
    Invokables.INVOKABLE_APPSHUTDOWN_NOTICE
]

contextBridge.exposeInMainWorld('CommandsUtils', {
    //exposes the required method from the 'CommandHandler' instance
    handler : {
        ensureDataExists: () => commandHandler.createCommandsFileIfNeeded(true),
        commandsHTML: () => commandHandler.getCommandDataBasicHTML(),
        runCommand: (commandID, cb=undefined) => commandHandler.runCommand(commandID, cb)
    },
    //the method to invoke a given (allowed) invokable
    ipcRendererInvoke: (invokable) => {
        if (ALLOWED_INVOKABLES.find(inv => (inv===invokable))) ipcRenderer.invoke(invokable)
        else console.error(`Invokable "${invokable}" isn't allowed…`)
    },
    //exposes the html constants for factorization purpose
    html: handler.html,
    //exposes the invokables constants for factorization puprose
    invokables: Invokables
})


