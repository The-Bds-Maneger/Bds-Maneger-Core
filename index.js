console.log(`Running the Bds Maneger API in version ${require(__dirname+"/package.json").version}`)
let blanks;
function date(fu) {
    var today = new Date();
    if (fu == "year")
        return `${today.getFullYear()}`
    else if (fu == "day")
        return `${String(today.getDate()).padStart(2, "0")}`
    else if (fu == "month")
        return `${String(today.getMonth() + 1).padStart(2, "0")}`
    else if (fu == "hour")
        return `${today.getHours()}_${today.getMinutes()}`
    else 
        return `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}_${today.getHours()}-${today.getSeconds()}`
}
if (process.argv[0].includes("electron")){
    var electron_de = true;
} else if (process.argv[0].includes("node")){
    var electron_de = undefined;
    if (process.env.BDS_MONI == blanks){
        process.env.BDS_MONI = true
    }
    // process.env.BDS_MONI
    if (process.env.ENABLE_BDS_API == blanks){
        process.env.ENABLE_BDS_API = true
    }
    // process.env.ENABLE_BDS_API

} else {
    var electron_de = false;
}
const arch = process.arch
if (arch == "x64"){
    var archi = "amd64"
} else if (arch == "arm64"){
    console.warn(`It is not recommended to use platforms that are not amd64 (x64), please inform you that you will need to manually configure some things. \!\!`)
    var archi = "arm"
} else {
    console.warn(`Unsupported processor, ${arch} will not be supported by The Bds Maneger`)
}
const path = require("path")
const fs = require("fs");
const package_root = path.join(process.cwd(), "package.json")
if (process.platform == "win32") {
    var home = process.env.USERPROFILE;
    var desktop = path.join(home, "Desktop")
    // Server directories
    var bds_dir = path.join(home, `bds_Server`);
    var bds_dir_bedrock = path.join(home, `bds_Server`, 'bedrock');
    var bds_dir_java = path.join(home, `bds_Server`, 'java');
    
    if (fs.existsSync(package_root)){
        var cache_dir = path.join(home, "AppData", "Roaming", require(package_root).name)
    } else {
        console.warn(`Temporary Storages, some functions will be lost after restarting the system`)
        var cache_dir = path.join(process.env.TMP, `bds_tmp_configs`);
    }
    var log_dir = path.join(bds_dir, "log")
    var log_file = path.join(log_dir, `${date()}_Bds_log.log`)
    var log_date = `${date()}`
    var tmp = process.env.TMP
    var system = `windows`;
} else if (process.platform == "linux") {
    var home = process.env.HOME;
    // Server directories
    var bds_dir = path.join(home, "bds_Server");
    var bds_dir_bedrock = path.join(home, `bds_Server`, 'bedrock');
    var bds_dir_java = path.join(home, `bds_Server`, 'java');

    if (fs.existsSync(package_root)){
        var cache_dir = path.join(home, ".config", require(package_root).name);
    } else {
        console.warn(`Temporary Storages, some functions will be lost after restarting the system`)
        var cache_dir = `/tmp/bds_tmp_configs`;
    }
    let file = path.join(home, ".config", "user-dirs.dirs")
    let data = {}
    if(fs.existsSync(file)){
        let content = fs.readFileSync(file,"utf8")
        let lines = content.split(/\r?\n/g).filter((a)=> !a.startsWith("#"))
        for(let line of lines){
            let i = line.indexOf("=")
            if(i >= 0){
                try{
                    data[line.substring(0,i)] = JSON.parse(line.substring(i + 1))
                }catch(e){}
            }
        }
    }
    // one day will be in the documents XDG_DOCUMENTS_DIR
    if(data["XDG_DESKTOP_DIR"]){
        var desktop = data["XDG_DESKTOP_DIR"]
        desktop = desktop.replace(/\$([A-Za-z\-\_]+)|\$\{([^\{^\}]+)\}/g, (_, a, b) => (process.env[a || b] || ""))
    }else{
        var desktop = "/tmp"
    }
    var log_dir = path.join(bds_dir, "log")
    var log_file = path.join(log_dir, `${date()}_Bds_log.log`)
    var log_date = `${date()}`
    var tmp = `/tmp`
    var system = `linux`;
} else if (process.platform == "android") {
    if (process.env.ANDROID_IGNORE !== undefined){
        var home = `/data/data/com.temux/files/home`;
        var bds_dir = path.join(home, "bds_Server");
        if (fs.existsSync(package_root)){
            var cache_dir = path.join(home, ".config", require(package_root).name);
        } else {
            console.warn(`Temporary Storages, some functions will be lost after restarting the system`)
            var cache_dir = `/tmp/bds_tmp_configs`;
        }
        var log_dir = path.join(bds_dir, "log")
        var log_file = path.join(log_dir, `${date()}_Bds_log.log`)
        var log_date = `${date()}`
        var tmp = `/tmp`
        var system = `linux`;
    } else {
        require("open")("https://github.com/Bds-Maneger/Bds_Maneger/wiki/systems-support#a-message-for-android-users")
        console.error("Android is not yet supported by bds manager")
        process.exit(2007)
    }
} else if (process.platform == "darwin") {
    require("open")("https://github.com/Bds-Maneger/Bds_Maneger/wiki/systems-support#a-message-for-mac-os-users")
    console.error("Please use Windows or Linux MacOS Not yet supported")
    process.exit(1984)
} else {
    console.log(`Please use an operating system (OS) compatible with Minecraft Bedrock Server ${process.platform} is not supported`);
    process.exit(2021)
};
var shell = require("shelljs");
if (!(fs.existsSync(cache_dir))){
    console.log(`Creating a folder for Storage in ${cache_dir}`);
    shell.mkdir("-p", cache_dir);
}
// e
if (!(fs.existsSync(bds_dir))){
    console.log("Creating the bds directory")
    shell.mkdir("-p", bds_dir);
}
if (!(fs.existsSync(bds_dir_java))){
    console.log("Creating the bds directory to Java")
    shell.mkdir("-p", bds_dir_java);
}
if (!(fs.existsSync(bds_dir_bedrock))){
    console.log("Creating the bds directory to Bedrock")
    shell.mkdir("-p", bds_dir_bedrock);
}
// e
if (fs.existsSync(log_dir)){
    if (!fs.existsSync(log_dir)){
        console.log("Creating the bds log dir")
        shell.mkdir("-p", log_dir);
    };
};
// e
if (require("fs").existsSync(`${bds_dir}/telegram_token.txt`)){
    module.exports.token = require("fs").readFileSync(`${bds_dir}/telegram_token.txt`, "utf8").replaceAll("\n", "");
} else {
    module.exports.token = undefined;
}

// Depacretd function
module.exports.Storage = () => {
    var localStorage = require("node-localstorage").localStorage;
    return new localStorage(`${cache_dir}/Local_Storage`)();
};

module.exports.telegram_token_save = (token) =>{
    fs.writeFileSync(`${bds_dir}/telegram_token.txt`, token)
    return "OK"
}

// Set commands
if (typeof fetch === "undefined"){
    global.fetch = require("node-fetch")
}

if (typeof localStorage === "undefined"){
    var localStorageS = require("node-localstorage").LocalStorage;
    global.localStorage = new localStorageS(`${cache_dir}/Local_Storage`);
}


if (process.env.JAVA_ENABLE !== undefined)
    localStorage.setItem('bds_edititon', 'java');
else
    localStorage.setItem('bds_edititon', 'bedrock');

if (process.env.BDS_MONI == blanks){
    process.env.BDS_MONI = "false"
}
// process.env.BDS_MONI
if (process.env.ENABLE_BDS_API == blanks){
    process.env.ENABLE_BDS_API = "false"
}
// process.env.ENABLE_BDS_API


// Fetchs
fetch("https://raw.githubusercontent.com/Bds-Maneger/Raw_files/main/credentials.json").then(response => response.text()).then(gd_cre => {
    module.exports.google_drive_credential = gd_cre
    module.exports.drive_backup = require("./bedrock/drive/auth").drive_backup
    module.exports.mcpe_file = require("./bedrock/drive/auth").mcpe
});
fetch("https://raw.githubusercontent.com/Bds-Maneger/Raw_files/main/Server.json").then(response => response.json()).then(rawOUT => {
    const versions = Object.getOwnPropertyNames(rawOUT.bedrock)
    for (let v in versions){
        var html = `${versions[v]}`;
        var out = `${out}\n <option value=\"${html}\">${html}</option>`;
        v++;
    };
    module.exports.version_select = out.replaceAll(undefined, "");
    module.exports.version_raw = Object.getOwnPropertyNames(rawOUT.bedrock);
    module.exports.bds_latest = rawOUT.bedrock_lateste;
    const enable_api = process.env.ENABLE_BDS_API.includes("true")
    if (enable_api){
        if (typeof bds_api_start === "undefined"){
            require("./API/api")()
            require("./API/log")()
            require("./API/remote_access")()
        } else {
            console.log(`API already started`)
        }
    } else {
        console.warn(`The API via http is disabled, for more information, visit https://docs.srherobrine23.com/enable_bds_requests.html`)
    }
    
    module.exports.get_version = (type) => {
        if (type == "raw")
            return rawOUT.Versions;
        else
            return out.replaceAll(undefined, "");
    }
})
// Fetchs

// 
// Module export
/* Variaveis */

module.exports.home = home
module.exports.desktop = desktop
module.exports.system = system
module.exports.bds_dir = bds_dir
module.exports.bds_dir_bedrock = bds_dir_bedrock
module.exports.bds_dir_java = bds_dir_java
module.exports.world_dir = path.join(bds_dir, "worlds")
module.exports.tmp_dir = tmp
module.exports.electron = electron_de
module.exports.api_dir = cache_dir
module.exports.log_file = log_file
module.exports.log_date = log_date
module.exports.arch = archi

/* Commands server */
module.exports.detect = require("./bedrock/detect_bds").bds_detect
module.exports.telegram = require("./bedrock/telegram/telegram_bot")
module.exports.start = require("./bedrock/start").Server_start
module.exports.stop = require("./bedrock/stop").Server_stop
module.exports.date = date
module.exports.command = require("./bedrock/command").command
module.exports.backup = require("./bedrock/backup").World_BAckup
module.exports.kill = require("./bedrock/kill").bds_kill
module.exports.version_Download = require("./bedrock/download")
module.exports.set_config = require("./bedrock/bds_settings").config
module.exports.get_config = require("./bedrock/bds_settings").get_config
module.exports.config_example = require("./bedrock/bds_settings").config_example
module.exports.token_register = () => {
    if (!(fs.existsSync(path.join(bds_dir, "bds_tokens.json")))){
        fs.writeFileSync(path.join(bds_dir, "bds_tokens.json"), "[]")
    }
    require("crypto").randomBytes(10, function(err, buffer) {
        var token = buffer.toString("hex");
        console.log(token)
        var QRCode = require("qrcode")
        QRCode.toString(token, function (err, url) {
            fs.readFile(path.join(bds_dir, "bds_tokens.json"), "utf8", function (err, data){
                if (err){
                    console.log(err);
                } else {
                obj = JSON.parse(data); //now it an object
                var count = Object.keys(obj).length
                var teste = {count, token}
                obj.push(teste); //add some data
                json = JSON.stringify(obj); //convert it back to json
                fs.writeFileSync(path.join(bds_dir, "bds_tokens.json"), json, "utf8"); // write it back 
            }});
        })
    });
}
const bds_monitor = process.env.BDS_MONI.includes("true")
if (bds_monitor){
    const si = require("systeminformation");
    setInterval(() => {
        // si.cpu().then(data => {module.exports.cpu_speed = Math.trunc(data.speed)})
        si.mem().then(data => {
            module.exports.ram_free = Math.trunc(data.free / 1024 / 1024 / 1024);
            module.exports.ram_total = Math.trunc(data.total / 1024 / 1024 / 1024);
        })
        si.currentLoad().then(data => {
            module.exports.current_cpu = Math.trunc(data.currentload)
        })

    }, 1000);
    si.processes().then(data => {
        const list = data.list
        for (let pid in list) {
            var pids = list[pid].command
            if (pids.includes("bedrock_server")){
                module.exports.bds_cpu = Math.trunc(list[pid].pcpu)
            } else {
                pid++
            }
        }
    })
    setInterval(() => {
        si.processes().then(data => {
            const list = data.list
            for (let pid in list) {
                var pids = list[pid].command
                if (pids.includes("bedrock_server")){
                    module.exports.bds_cpu = Math.trunc(list[pid].pcpu)
                } else {
                    pid++
                }
            }
        })
    }, 3000);
}else {
    console.warn(`the use of cpu is disabled, for more information, visit https://docs.srherobrine23.com/enable_bds_requests.html`)
}