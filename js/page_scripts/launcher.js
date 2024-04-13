const HTMLCLASSNAME_DIV_COMMANDSRENDER= "cmd_render"

CommandsUtils.handler.ensureDataExists()

function populate_cmd(){
    let render_div= document.querySelector(`div#${HTMLCLASSNAME_DIV_COMMANDSRENDER}`)
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


populate_cmd()
