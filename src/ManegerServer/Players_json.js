const fs = require("fs");
const BdsSettings = require("../lib/BdsSettings");

module.exports.PlayersJsonExample = module.exports.Example = [
  {
    Player: "",
    Action: "",
    Platform: "",
    Date: "",
  },
  {
    Player: "",
    Action: "",
    Platform: "",
    xuid: "",
    Date: "",
  },
];


async function BedrockJson(Data = "") {
  const Bedrock_Json = [];
  /*
    *************************
    Old Versions

    [INFO] Player connected: Sirherobrine, xuid: 2535413418839840
    [INFO] Player disconnected: Sirherobrine, xuid: 2535413418839840
    
    *************************
    New Version

    [2022-01-05 16:19:07:752 INFO] Player connected: Sirherobrine, xuid: 2535413418839840
    [2022-01-05 16:19:38:988 INFO] Player disconnected: Sirherobrine, xuid: 2535413418839840
  */
  // Regex to test line
  for (const line of Data.split(/\r\n|\n/gi)){
    if (/\[.*\]\s+Player\s+.*connected:\s+.*,\s+xuid:[\s+]/gi.test(line)) {
      const playerAction = {
        Player: "",
        Action: "",
        Platform: "bedrock",
        xuid: "",
        Date: (new Date()).toString()
      };
      if (/disconnected|disconnected.*:/.test(line)) playerAction.Action = "disconnect"; else playerAction.Action = "connect";
      // Player
      line.replace(/\[.*\]\s+Player\s+.*connected:(.*),\s+xuid:[\s+]/gi, (a, b) => playerAction.Player = b.trim());
      // xuid
      line.replace(/\[.*\]\s+Player\s+.*connected:.*,\s+xuid:[\s+](.*)/gi, (a, b) => playerAction.xuid = b.trim());
      // New Version get Date
      if (/\[.*\s+.*\]\s+Player\s+.*connected:(.*),\s+xuid:[\s+]/gi.test(line)) line.replace(/\[(.*)\s+.*\]\s+Player\s+connected:.*,\s+xuid:[\s+].*/gi, (_, b) => playerAction.Date = (new Date(b.trim())).toString());

      // Add to array
      if (playerAction.Player) Bedrock_Json.push(playerAction);
      else {
        console.log("Error in parse bedrock json:", line);
      }
    }
  }
  return Bedrock_Json;
}

async function pocketmineJson(Data = "") {
  const JavaStyle = [];
  /*
    [15:05:18.001] [Server thread/INFO]: Sirherobrine joined the game
    [15:05:30.695] [Server thread/INFO]: Sirherobrine left the game
    [15:05:21.501] [Server thread/INFO]: Sirherobrine fell out of the world
  */
  for (const line of Data.split(/\r\n|\n/gi)) {
    if (/\[.*\].*\[.*\]:\s+.*the game/gi.test(line)) {
      const playerAction = {
        Player: "",
        Action: "",
        Platform: "pocketmine",
        Date: (new Date()).toString()
      }
      if (/fell.*out.*of.*the.*world/gi.test(line)) {
        playerAction.Action = "Out_of_World";
      } else {
        if (/left.*the.*game/gi.test(line)) playerAction.Action = "disconnect";
        else playerAction.Action = "connect";
      }
      // Player
      line.replace(/\[.*\]\s+\[.*\]:\s+(.*)\s+joined the game/gi, (a, b) => playerAction.Player = b.trim());

      // Add to array
      JavaStyle.push(playerAction);
    }
  }
  return JavaStyle;
}

// async function javaJson(Data = "") {
  //   const JavaStyle = [];
  //   /**/
//   for (const line of Data.split(/\n|\r/gi)) {
//     if (line.trim().includes("joined the game") || line.includes("left the game")) {
//       const JavaObject = {
//         Player: line.replace(/joined the game|left the game/gi, "").trim(),
//         Action: "",
//         Platform: "java",
//         Date: (new Date()).toString()
//       }
//       if (/joined/.test(line)) JavaObject.Action = "connect"; else JavaObject.Action = "disconnect";
//       JavaStyle.push(JavaObject);
//     }
//   }
//   return JavaStyle;
// }

module.exports.createJsons = {
  BedrockJson: BedrockJson,
  pocketmineJson: pocketmineJson,
};

async function Promise_CreatePlayerJson(data = "", Current_platorm = BdsSettings.CurrentPlatorm()) {
  // Bedrock
  if (Current_platorm === "bedrock") return await BedrockJson(data);
  // Pocketmine-MP
  else if (Current_platorm === "pocketmine") return await pocketmineJson(data);
  // Java
  // else if (Current_platorm === "java") {
  //   javaJson(data).then(Data => {
  //     if (Data.length === 0) return;
  //     callback(Data);
  //   }).catch(err => console.log("Error in parse java json:", err.stack||String(err)));
  // }
}
module.exports.Promise_CreatePlayerJson = Promise_CreatePlayerJson;

function CreatePlayerJsonCallback(data = "", callback = (d = [{Player: "", Action: "connect", Platform: "", xuid: "", Date: ""},{Player: "", Action: "disconnect", Platform: "", xuid: "", Date: ""}]) => console.log(d), Current_platorm = BdsSettings.CurrentPlatorm()){
  Promise_CreatePlayerJson(data, Current_platorm).then(Data => {
    if (Data.length === 0) return;
    return callback(Data);
  }).catch(err => console.log("Error in parse json:", err.stack||String(err)));
}
module.exports.CreatePlayerJson = CreatePlayerJsonCallback;

/**
 * Concat new Users Array to old Users Array and Save to file
 * 
 * @returns {Array<{
 *  Player: string;
 *  Action: string;
 *  Platform: string;
 *  Date: string;
 * }>}
 */
function UpdateUserJSON(New_Object = [{Player: "", Action: "", Platform: "", Date: ""}]){
  const Player_Json_path = BdsSettings.GetPaths("Player");
  let Players_Json = [];
  if (fs.existsSync(Player_Json_path)) Players_Json = JSON.parse(fs.readFileSync(Player_Json_path, "utf8"));
  Players_Json = Players_Json.concat(New_Object)
  fs.writeFileSync(Player_Json_path, JSON.stringify(Players_Json, null, 2));
  return Players_Json;
}
module.exports.UpdateUserJSON = UpdateUserJSON;

// Search player in JSON
function Player_Search(player = "dontSteve") {
  const Player_Json_path = BdsSettings.GetPaths("Player");
  const Players_Json = JSON.parse(fs.readFileSync(Player_Json_path, "utf8"));
  for (let Player of Players_Json) {
    if (Player.Player === player.trim()) return Player;
  }
  return {};
}
module.exports.Player_Search = Player_Search;