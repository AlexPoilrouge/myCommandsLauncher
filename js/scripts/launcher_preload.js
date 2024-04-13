const { contextBridge, ipcRenderer } = require('electron')
const handler= require('../commandHandler')

const {Invokables} = require('../commandUI')

let commandHandler= new handler.CommandHandler()

const ALLOWED_INVOKABLES= [
    Invokables.INVOKABLE_COMMANDCLOSE_NOTICE
]

contextBridge.exposeInMainWorld('CommandsUtils', {
    handler : {
        ensureDataExists: () => commandHandler.createCommandsFileIfNeeded(true),
        commandsHTML: () => commandHandler.getCommandDataBasicHTML(),
        runCommand: (commandID, cb=undefined) => commandHandler.runCommand(commandID, cb)
    },
    ipcRendererInvoke: (invokable) => {
        if (ALLOWED_INVOKABLES.find(inv => (inv===invokable))) ipcRenderer.invoke(invokable)
        else console.error(`Invokable "${invokable}" isn't allowed…`)
    },
    html: handler.html,
    invokables: Invokables
})


