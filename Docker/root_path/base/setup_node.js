const bds = require("/opt/bdsCore/index");
const { existsSync } = require("fs");
const { join } = require("path")

if (process.env.TELEGRAM_TOKEN === "null") console.warn("Telegram bot disabled, bot token not informed")
else if (process.env.TELEGRAM_TOKEN === "undefined") console.warn("Telegram bot disabled, bot token not informed")
else if (process.env.TELEGRAM_TOKEN === "") console.warn("Telegram bot disabled, bot token not informed")
else  bds.telegram_token_save(process.env.TELEGRAM_TOKEN)

bds.kill()
bds.set_config(JSON.stringify({
    "description": process.env.DESCRIPTION,
    "name": process.env.WORLD_NAME,
    "gamemode": process.env.GAMEMODE,
    "difficulty": process.env.DIFFICULTY,
    "players": process.env.PLAYERS,
    "xbox": process.env.XBOX_ACCOUNT
}))

var bds_software;
if (existsSync(join(bds.bds_dir_bedrock, "bedrock_server"))) bds_software = true
else if (existsSync(join(bds.bds_dir_bedrock, "bedrock_server.exe"))) bds_software = true
else if (existsSync(join(bds.bds_dir_java, "MinecraftServerJava.jar"))) bds_software = true
else if (existsSync(join(bds.bds_dir_pocketmine, "PocketMine-MP.phar"))) bds_software = true
else {
    console.error("No software was detected, using the latest version available !!");
    bds_software = false;
}

if (bds_software){
    // ------------------------------
    /* Install version */
    if (process.env.BDS_REINSTALL === "true") {
        bds.platform_update(process.env.SERVER)
        bds.download("latest");
    }
    /* Skip installation */
    else console.log("Skipping reinstallation")
    // ------------------------------
} else bds.download("latest")