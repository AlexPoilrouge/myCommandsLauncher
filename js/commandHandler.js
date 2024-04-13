const os= require('os');
const fs= require('fs');

const { spawn } = require("child_process");

const commons= require('./commons')

const HTMLCLASSNAME_DIV_COMMANDLIST = "cmd_parent_list"
const HTMLCLASSNAME_DIV_SEPARATOR   = "cmd_separator"
const HTMLCLASSNAME_DIV_COMMAND     = "command"
const HTMLCLASSNAME_DIV_UNKNOWN     = "unknown"

const HTMLCLASSNAME_LABEL_COMMAND   = "cmd_title"
const HTMLCLASSNALE_DIV_CMD_CODE    = "cmd_code"

const HTMLDATAATTRIBUTE_CMD_ID      = "cmd_id"

class CommandHandler {
    constructor(commands_JSONFile_path= undefined){
        this.dataFilePath= commands_JSONFile_path ?? commons.COMMANDS_DEFAULT_FILE
    }

    updateData(){
        //we need to read the data from somewhere
        if(!this.dataFilePath) throw new Error('Missing or invalid commands data source.');

        //handling data reading errors/fails
        var parsedData= undefined
        try{
            parsedData= JSON.parse(fs.readFileSync(this.dataFilePath))
        }
        catch(err){
            console.error(`JSON data parse failure: ${err}`)
            throw new Error('Error fetching data from commands source.')
        }
        if((!parsedData) || Object.keys(parsedData).length<=0) throw new Error('No data was found.')

        //giving a timestamps to last update; reseting; checking; setting the data
        this.dataLastUpdate= Date.now()
        this.commandsData= undefined
        if(!Array.isArray(parsedData)){
            if(parsedData.menu){
                parsedData= (Array.isArray(parsedData.menu)) ?
                                    parsedData.menu
                                :   [parsedData.menu]
            }
            else{
                parsedData= [parsedData]
            }
        }
        this.commandsData= parsedData

        //giving ids to commands
        var commandId= 0
        for(var commandObj of this.commandsData){
            //only for objects that seem to be actual commands…
            if(this._commandObjType(commandObj)==="CMD"){
                commandObj['id']= commandId;
                ++commandId;
            }
        }
    }

    createCommandsFileIfNeeded(updateData=false){
        if(!this.dataFilePath) throw new Error('No cmd data source specified…');

        if(!fs.existsSync(this.dataFilePath)){
            fs.writeFileSync( this.dataFilePath, JSON.stringify([]))
        }

        if(updateData) this.updateData()
    }

    getCommand(commandId){
        if(!this.commandsData) throw new Error(`Data not set`);

        console.log(`commandsData:\n${JSON.stringify(this.commandsData)}`)

        let cmdObj= this.commandsData.find(elem => String(elem.id)===String(commandId))
        console.log(`=> ${JSON.stringify(cmdObj)}`)
        if(!cmdObj) return undefined;

        return cmdObj.command
    }

    runCommand(commandId, std_callbacks=undefined){
        const cmd_code= this.getCommand(commandId)
        console.log(`>>>> ${cmd_code}`)
        const cmd= spawn("sh", [ "-c", cmd_code ])

        std_callbacks= std_callbacks ?? {}
        cmd.stdout.on('data', std_callbacks.stdout ?? ( (data) => {
            console.log(`stdout: ${data}`);
        }));
          
        cmd.stderr.on('data', std_callbacks.stderr ?? ( (data) => {
            console.error(`stderr: ${data}`);
        }));
    
        cmd.on('error', std_callbacks.error ?? ( (error) => {
            console.log(`error: ${error.message}`);
        }));
          
        cmd.on('close',  std_callbacks.close ?? ( (code) => {
            console.log(`child process exited with code ${code}`);
        })); 
    }

    getCommandDataBasicHTML(){
        if(!this.commandsData) throw new Error(`Data not set`);

        var htmlStr= `<div class="${HTMLCLASSNAME_DIV_COMMANDLIST}">\n`

        for (let cmdObj of this.commandsData){
            htmlStr+= this._commandObjHTML(cmdObj) + `\n`
        }

        htmlStr+= `</div>`

        return htmlStr
    }

    _commandObjType(cmdObj){
        if(((!cmdObj.type) && cmdObj.command) || (cmdObj.type==="command")){
            return "CMD";
        }
        else if(cmdObj.type==="separator") return "SEP";
        else return "???";
    }

    _commandObjHTML(cmdObj){
        let type= this._commandObjType(cmdObj);

        if(type==='SEP'){
            return `<div class="${HTMLCLASSNAME_DIV_SEPARATOR}"></div>`
        }
        else if(type==='CMD'){
            return  `<div class="${HTMLCLASSNAME_DIV_COMMAND}" data-${HTMLDATAATTRIBUTE_CMD_ID}="${cmdObj.id}">`+
                        `<label class="${HTMLCLASSNAME_LABEL_COMMAND}">`+
                            `${cmdObj.title ?? `??? [${cmdObj.id}]`}</label>`+
                        `<div class="${HTMLCLASSNALE_DIV_CMD_CODE}"><code></code></div>`+
                    `</div>`
        }
        else {
            return `<div class="${HTMLCLASSNAME_DIV_UNKNOWN}"></div>`
        }
    }
}

module.exports= {
    CommandHandler,

    html: {
        HTMLCLASSNAME_DIV_COMMANDLIST,
        HTMLCLASSNAME_DIV_SEPARATOR,
        HTMLCLASSNAME_DIV_COMMAND,
        HTMLCLASSNAME_DIV_UNKNOWN,
        HTMLCLASSNAME_LABEL_COMMAND,
        HTMLCLASSNALE_DIV_CMD_CODE,
        HTMLDATAATTRIBUTE_CMD_ID
    }
}
