import bdscore from "../src/index";

export default async function start(done: (error?: Error) => void) {
  console.log("Starting...");
  const Server = await bdscore.Server.Start("bedrock");
  Server.logRegister("all", console.log);
  Server.onExit(code => {
    if (code !== 0) {
      done(new Error(`Server exited with code ${code}`));
    } else {
      done();
    }
  });
  while (true) {
    if (Server.started) {
      console.log("Server started");
      Server.stop();
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 5*100));
  }
}