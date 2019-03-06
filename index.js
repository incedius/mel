const path = require('path'),
	  fs = require('fs')

module.exports = function Mel(mod) {
    let enabled = true,
        channels,
        fileopen=true,
        stopwrite,
        regex = new RegExp(/<FONT>(.*)<\/FONT>/)

    try{
        channels = JSON.parse(fs.readFileSync(path.join(__dirname,'channels.json'), 'utf8'))
    }
    catch(e){
        msg("channels.json not found/malformed. Regenerating from default.")
        channels = JSON.parse(fs.readFileSync(path.join(__dirname,'channels-default.json'), 'utf8'))
        save(channels,"channels.json")
    }

    mod.command.add('mel', {
        $none() {
            enabled = !enabled
            msg(enabled?"enabled":"disabled")
        }
    })


    mod.hook('C_CHAT', 1, event => {
        if (!enabled) return true
        
        if (channels.includes(event.channel.toString())){
            
            mod.toServer('C_CHAT',1, {
                channel: event.channel,
                message: event.message.replace(regex, '<FONT>$1...</FONT>')
            })

            return false
        }
    })

    mod.hook('C_WHISPER', 1, event => {
        if (!enabled) return true

        mod.toServer('C_WHISPER',1, {
            target: event.target,
            message: event.message.replace(regex, '<FONT>$1...</FONT>')
        })

        return false
        
    })

    function save(data, filename) {
        if(fileopen) {
            fileopen=false
            fs.writeFile(path.join(__dirname, filename), JSON.stringify(data,null,"\t"), err => {
                if(err){
            mod.command.message('Error Writing File, attempting to rewrite')
            console.log(err)
        }
                fileopen = true
            })
        }
        else {
            clearTimeout(stopwrite)			 //if file still being written
            stopwrite=setTimeout(save(__dirname, filename),2000)
            return
        }
    }

    function msg(event) { mod.command.message(event); }
}