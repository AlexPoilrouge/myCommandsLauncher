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

/**
 * Handles and process the 'commands' data
 *  from the source JSON datafile
 *  (~/.commands.json by default)
 */
class CommandHandler {
    /**
     * @param {string} commands_JSONFile_path - the path of the 'commands' data source file.
     *                 If none provided (undefined) will be internally set to default path
     */
    constructor(commands_JSONFile_path= undefined){
        this.dataFilePath= commands_JSONFile_path ?? commons.COMMANDS_DEFAULT_FILE
    }

    /**
     * Updates the internal 'commands' data from the source data JSON file.
     */
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

    /**
     * Makes sure the 'commands' source data JSON file exists by
     *  trying to create it if needed.
     * 
     * @param {boolean} updateData - whether or not the internal 'commands' data
     *                  should be updated after the verification (false by defalut).
     * @throws An Error if the data source file path isn't properly set.
     */
    createCommandsFileIfNeeded(updateData=false){
        if(!this.dataFilePath) throw new Error('No cmd data source specified…');

        if(!fs.existsSync(this.dataFilePath)){
            fs.writeFileSync( this.dataFilePath, JSON.stringify([]))
        }

        if(updateData) this.updateData()
    }

    /**
     * Fetches a command's code
     * 
     * @param {String | int} commandId - the command's id
     * @returns {String} - the commands's code
     */
    getCommand(commandId){
        if(!this.commandsData) throw new Error(`Data not set`);

        let cmdObj= this.commandsData.find(elem => String(elem.id)===String(commandId))
        if(!cmdObj) return undefined;

        return cmdObj.command
    }

    /**
     * Runs a commands's code in a new process
     * 
     * @param {String | int} commandId - the command's id 
     * @param {Object} std_callbacks - provides the different callback
     * @param {Function} std_callbacks.stdout - the callback function on stdout,
     *                  takes a String as argument
     * @param {Function} std_callbacks.stderr - the callback function on stderr,
     *                  takes a String as argument
     * @param {Function} std_callbacks.error - the callback function on a thrown Error,
     *                  takes an Error as argument
     * @param {Function} std_callbacks.close - the callback function on the command termination,
     *                  takes a number as argument that represents the return code
     */
    runCommand(commandId, std_callbacks=undefined){
        const cmd_code= this.getCommand(commandId)
        
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

    /**
     * Returns the basic html layout that represents the command list.
     * 
     * @returns HTML code as a String
     */
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
