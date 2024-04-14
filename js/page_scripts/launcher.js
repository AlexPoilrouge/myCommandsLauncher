const HTMLIDNAME_DIV_COMMANDSRENDER= "cmd_render"
const HTMLIDNAME_DIV_BUTTONS= "buttons"
const HTMLIDNAME_BUTTON_CLOSE= "close"
const HTMLIDNAME_BUTTON_SHUTDOWN= "shutdown"

CommandsUtils.handler.ensureDataExists()

function populate_cmd(){
    let render_div= document.querySelector(`div#${HTMLIDNAME_DIV_COMMANDSRENDER}`)
    render_div.innerHTML += CommandsUtils.handler.commandsHTML()

    let cmd_div= render_div.querySelectorAll(`div.${CommandsUtils.html.HTMLCLASSNAME_DIV_COMMAND}`)
    cmd_div.forEach(div => {
        decorate_cmdDiv(div)
    })
}

function decorate_cmdDiv(cmd_div){
    let cmd_id= cmd_div.dataset[CommandsUtils.html.HTMLDATAATTRIBUTE_CMD_ID]

    cmd_div.onclick= () => {
        CommandsUtils.handler.runCommand(cmd_id, {
            //request to close lancher when command closes
            close: () => CommandsUtils.ipcRendererInvoke(CommandsUtils.invokables.INVOKABLE_COMMANDCLOSE_NOTICE)
        })
    }
}

function activate_buttons() {
    let close_btn= document.querySelector(`div#${HTMLIDNAME_DIV_BUTTONS} button#${HTMLIDNAME_BUTTON_CLOSE}`)
    let shutdown_btn= document.querySelector(`div#${HTMLIDNAME_DIV_BUTTONS} button#${HTMLIDNAME_BUTTON_SHUTDOWN}`)

    console.log(`999 ${close_btn} ${JSON.stringify(close_btn)}`)
    close_btn.onclick= () => {
        CommandsUtils.ipcRendererInvoke(CommandsUtils.invokables.INVOKABLE_COMMANDCLOSE_NOTICE)
    }

    shutdown_btn.onclick= () => {
        CommandsUtils.ipcRendererInvoke(CommandsUtils.invokables.INVOKABLE_APPSHUTDOWN_NOTICE)
    }
}


populate_cmd()
activate_buttons()
