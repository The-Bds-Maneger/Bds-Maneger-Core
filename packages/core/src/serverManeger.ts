import readline from "node:readline";
import { createWriteStream } from "node:fs";
import { extendsFS } from "@sirherobrine23/extends";
import { pipeline } from "node:stream/promises";
import { format } from "node:util";
import sanitizeFilename from "sanitize-filename";
import child_process from "node:child_process";
import crypto from "node:crypto";
import stream from "node:stream";
import path from "node:path";
import tar from "tar";
import fs from "node:fs/promises";
import os from "node:os";


// Default bds maneger core
const ENVROOT = process.env.BDSCOREROOT || process.env.bdscoreroot;
export const bdsManegerRoot = ENVROOT ? path.resolve(process.cwd(), ENVROOT) : path.join(os.homedir(), ".bdsmaneger");
if (!(await extendsFS.exists(bdsManegerRoot))) await fs.mkdir(bdsManegerRoot, {recursive: true});
export type withPromise<T> = T|Promise<T>;

export interface manegerOptions {
  ID?: string,
  newID?: boolean,
};

// only letters and numbers
const idReg = /^[a-zA-Z0-9_]+$/;

export interface serverManegerV1 {
  id: string,
  rootPath: string,
  serverFolder: string,
  backup: string,
  logs: string,
  platform: "java"|"bedrock",
  runCommand(options: Omit<runOptions, "cwd">): ReturnType<typeof runServer>
};

/**
 * Platform path maneger
 */
export async function serverManeger(platform: serverManegerV1["platform"], options: manegerOptions): Promise<serverManegerV1> {
  if (!((["java", "bedrock"]).includes(platform))) throw new TypeError("Invalid platform target!");
  if (!options) throw new TypeError("Please add serverManeger options!");
  const platformFolder = path.join(bdsManegerRoot, platform);
  if ((await fs.readdir(platformFolder).then(a => a.length).catch(() => 0)) === 0 && options.newID === undefined) options.newID = true;

  // Create or check if exists
  if (options.newID === true) {
    while(true) {
      options.ID = typeof crypto.randomUUID === "function" ?  crypto.randomUUID().split("-").join("_") : crypto.randomBytes(crypto.randomInt(8, 14)).toString("hex");
      if (!(idReg.test(options.ID))) continue;
      if (!((await fs.readdir(platformFolder).catch(() => [])).includes(options.ID))) break;
    }
    await fs.mkdir(path.join(platformFolder, options.ID), {recursive: true});
  } else {
    // Test invalid ID
    if (String(options.ID).length > 32) throw new TypeError("options.ID is invalid, is very long!");
    if (!(!!options.ID && idReg.test(options.ID))) throw new TypeError("options.ID is invalid");
    else if (!((await fs.readdir(platformFolder)).includes(options.ID))) throw new Error("ID not exists")
  }

  // Folders
  const rootPath = path.join(platformFolder, path.posix.resolve("/", sanitizeFilename(options.ID)));
  const serverFolder = path.join(rootPath, "server");
  const backup = path.join(rootPath, "backups");
  const log = path.join(rootPath, "logs");

  for await (const p of [
    serverFolder,
    backup,
    log,
  ]) if (!(await extendsFS.exists(p))) await fs.mkdir(p, {recursive: true});

  return {
    id: options.ID,
    platform,
    rootPath,
    serverFolder,
    backup,
    logs: log,
    async runCommand(options: Omit<runOptions, "cwd">) {
      return runServer({...options, cwd: serverFolder});
    }
  };
}

export async function listIDs(): Promise<{id: string, platform: "bedrock"|"java", delete: () => Promise<void>}[]> {
  const main = [];
  for await (const platform of ["bedrock", "java"]) {
    try {
      const platformFolder = path.join(bdsManegerRoot, platform);
      if (!(await extendsFS.exists(platformFolder))) continue;
      const IDs = await fs.readdir(platformFolder);
      for await (const id of IDs) main.push({
        id: id,
        platform,
        async delete() {
          return fs.rm(path.join(platformFolder, id), {recursive: true, force: true});
        }
      });
    } catch {}
  }
  return main;
}

export type portListen = {
  port: number,
  protocol: "TCP"|"UDP"|"both",
  listenOn?: string,
  listenFrom?: "server"|"plugin"
};

export type playerAction = {
  playerName: string,
  onDate: Date,
  action: string,
  extra?: any
};

export type runOptions = {
  cwd: string,
  env?: {[k: string]: string|number|boolean},
  command: string,
  args?: (string|number|boolean)[],
  stdio?: child_process.StdioOptions,
  paths: serverManegerV1,
  serverActions?: {
    stop?(this: serverRun): withPromise<void>,
    playerAction?(this: serverRun, lineString: string): withPromise<null|void|playerAction>,
    hotBackup?(this: serverRun): withPromise<stream.Readable|void>,
    portListen?(this: serverRun, lineString: string): withPromise<void|portListen>,
    onAvaible?(this: serverRun, lineString: string): withPromise<void|Date>,
    postStart?: ((this: serverRun) => withPromise<void>)[],
  }
};

export declare class serverRun extends child_process.ChildProcess {
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  on(event: "close", listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  once(event: "close", listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  on(event: "disconnect", listener: () => void): this;
  once(event: "disconnect", listener: () => void): this;
  on(event: "exit", listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  once(event: "exit", listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  on(event: "message", listener: (message: child_process.Serializable, sendHandle: child_process.SendHandle) => void): this;
  once(event: "message", listener: (message: child_process.Serializable, sendHandle: child_process.SendHandle) => void): this;
  on(event: "spawn", listener: () => void): this;
  once(event: "spawn", listener: () => void): this;
  on(event: "warning", listener: (data: any) => void): this;
  once(event: "warning", listener: (data: any) => void): this;

  // BDS Assigns
  once(event: "line", fn: (data: string, from: "stdout"|"stderr") => void): this;
  on(event: "line", fn: (data: string, from: "stdout"|"stderr") => void): this;
  once(event: "player", fn: (playerInfo: playerAction) => void): this;
  on(event: "player", fn: (playerInfo: playerAction) => void): this;
  once(event: "portListening", fn: (portInfo: portListen) => void): this;
  on(event: "portListening", fn: (portInfo: portListen) => void): this;
  once(event: "serverAvaible", fn: (date: Date) => void): this;
  on(event: "serverAvaible", fn: (date: Date) => void): this;
  once(event: "backup", fn: (filePath: string) => void): this;
  on(event: "backup", fn: (filePath: string) => void): this;
  once(event: "hotBackup", fn: (fileStream: stream.Readable) => void): this;
  on(event: "hotBackup", fn: (fileStream: stream.Readable) => void): this;

  avaibleDate?: Date;
  runOptions: runOptions;
  portListening: portListen[];
  logPath: {stderr: string, stdout: string, merged: string};
  playerActions: playerAction[];
  stdoutInterface: readline.Interface;
  stderrInterface: readline.Interface;

  stopServer(): Promise<{code?: number, signal?: NodeJS.Signals}>;
  sendCommand(streamPipe: stream.Readable): this;
  sendCommand(...args: (string|number|boolean)[]): this;
  hotBackup(): this & Promise<Awaited<ReturnType<runOptions["serverActions"]["hotBackup"]>>>;
}

/**
 * Run servers globally and hormonally across servers
 */
export async function runServer(options: runOptions): Promise<serverRun> {
  if (!options.stdio) options.stdio = ["pipe", "pipe", "pipe"];
  const child = child_process.spawn(options.command, [...((options.args ?? []).map(String))], {
    // maxBuffer: Infinity,
    stdio: options.stdio,
    cwd: options.cwd,
    env: {
      ...process.env,
      ...Object.keys(options.env ?? {}).reduce((acc, a) => {
        acc[a] = String(options.env[a]);
        return acc;
      }, {})
    }
  }) as serverRun;
  child.runOptions = options;
  child.portListening = [];
  child.playerActions = [];
  for (const std of [child.stdout, child.stderr]) if (!std) {
    child.kill("SIGKILL");
    throw new TypeError("Stdout or Stderr stream disabled, killed process, cannot continue to exec server, check stdio passed to spawn!");
  }

  // Log Write
  const currentDate = new Date();
  const baseLog = path.join(options.paths.logs, format("%s_%s_%s_%s-%s-%s", currentDate.getDate(), currentDate.getMonth()+1, currentDate.getFullYear(), currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds()));
  await fs.mkdir(baseLog, {recursive: true});
  child.logPath = {stdout: path.join(baseLog, "stdout.log"), stderr: path.join(baseLog, "stderr.log"), merged: path.join(baseLog, "server.log")};
  const allLog = createWriteStream(child.logPath.merged);
  child.stdout.pipe(allLog);
  child.stdout.pipe(createWriteStream(child.logPath.stdout));
  child.stderr.pipe(allLog);
  child.stderr.pipe(createWriteStream(child.logPath.stderr));

  // Lines
  const stdout = child.stdoutInterface = readline.createInterface(child.stdout).on("line", data => child.emit("line", data, "stdout")).on("error", err => child.emit("error", err));
  const stderr = child.stderrInterface = readline.createInterface(child.stderr).on("line", data => child.emit("line", data, "stderr")).on("error", err => child.emit("error", err));

  if (typeof options.serverActions?.playerAction === "function") {
    for (const std of [stdout, stderr]) std.on("line", async data => {
      const playerData = await Promise.resolve(options.serverActions.playerAction.call(child, data) as ReturnType<typeof options.serverActions.playerAction>);
      if (!playerData) return;
      child.playerActions.push(playerData);
      child.emit("player", playerData);
    });
  }

  if (typeof options.serverActions?.portListen === "function") {
    for (const std of [stdout, stderr]) std.on("line", async data => {
      const portData = await Promise.resolve(options.serverActions.portListen.call(child, data) as ReturnType<typeof options.serverActions.portListen>);
      if (!portData) return;
      portData.listenFrom ??= "server";
      child.portListening.push(portData);
      child.emit("portListening", portData);
    });
  }

  child.sendCommand = function (...args) {
    if (!child.stdin.writable) {
      child.emit("error", new Error("cannot send command to server"));
      return child;
    };
    if (args[0] instanceof stream.Readable) {
      args[0].on("data", data => child.stdin.write(data)).once("close", () => child.stdin.write("\n"));
      return child;
    }
    child.stdin.write(args.map(String).join(" ")+"\n");
    return child;
  }

  child.stopServer = async function () {
    child.sendCommand("");
    const stop = options.serverActions?.stop ?? function () {
      child.kill("SIGINT");
      const kill = setTimeout(() => {
        clearTimeout(kill);
        if (child.exitCode !== null) return;
        child.kill("SIGKILL");
      }, 2500);
    };
    Promise.resolve().then(() => stop.call(child)).catch(err => child.emit("error", err));
    return new Promise((done, reject) => child.once("error", reject).once("exit", (code, signal) => done({code, signal})));
  }

  child.hotBackup = function hotBackup() {
    return Object.assign({}, Promise.resolve().then((async () => {
      if (!options.serverActions?.hotBackup) throw new Error("Hot backup disabled to current platform!");
      child.emit("backup", "start");
      return Promise.resolve(options.serverActions.hotBackup.call(child) as ReturnType<typeof options.serverActions.hotBackup>).then(data => {
        child.emit("backup", "success");
        return data;
      }).catch(err => {
        child.emit("backup", "fail");
        return Promise.reject(err);
      });
    })), child);
  }

  if (typeof options.serverActions?.onAvaible === "function") {
    let run = options.serverActions.onAvaible;
    for (const std of [stdout, stderr]) std.on("line", async data => {
      if (!run) return null;
      const avaibleDate = await Promise.resolve(run.call(child, data) as ReturnType<typeof run>);
      if (!avaibleDate) return;
      child.avaibleDate = avaibleDate;
      if (options.serverActions?.postStart) for (const ss of options.serverActions?.postStart) Promise.resolve().then(() => ss.call(child)).catch(err => child.emit("error", err));
    });
  } else if (options.serverActions?.postStart?.length > 0) child.emit("warning", "no post actions run!");

  child.once("close", async () => {
    const cDate = new Date();
    const month = String(cDate.getMonth()+1 > 9 ? cDate.getMonth()+1 : "0"+(cDate.getMonth()+1).toString());
    const day = String(cDate.getDate() > 9 ? cDate.getDate() : "0"+((cDate.getDate()).toString()));
    const backupFile = path.join(options.paths.backup, String(cDate.getFullYear()), month, day, `${cDate.getHours()}_${cDate.getMinutes()}.tgz`);
    try {
      if (!(await extendsFS.exists(path.dirname(backupFile)))) await fs.mkdir(path.dirname(backupFile), {recursive: true});
      const ff = await fs.readdir(options.paths.serverFolder);
      await pipeline(tar.create({
        gzip: true,
        cwd: options.paths.serverFolder,
        prefix: ""
      }, ff), createWriteStream(backupFile));
      child.emit("backup", backupFile);
    } catch (err) {
      if (await extendsFS.exists(backupFile)) await fs.unlink(backupFile);
      child.emit("error", err);
    }
  });

  return child;
}