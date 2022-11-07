// Utils
import * as platformPathManeger from "./platformPathManeger"
import * as globalPlatfroms from "./globalPlatfroms";
import * as pluginManeger from "./plugin/plugin";
import * as export_import from "./export_import";
import * as pluginHooks from "./plugin/hook";
import * as proxy from "./lib/proxy";

// Platforms
import * as Bedrock from "./bedrock";
import * as Java from "./java";
import * as PocketmineMP from "./pocketmine";
import * as Spigot from "./spigot";
import * as Powernukkit from "./pwnuukit";
import * as PaperMC from "./paper";

export {platformPathManeger, globalPlatfroms, pluginManeger, export_import, PocketmineMP, pluginHooks, Powernukkit, PaperMC, Bedrock, Spigot, proxy, Java};
export default {
  Bedrock,
  Java,
  PocketmineMP,
  Powernukkit,
  PaperMC,
  Spigot,
  utils: {
    platformPathManeger,
    globalPlatfroms,
    pluginManeger,
    pluginHooks,
    export_import,
    proxy
  }
};
