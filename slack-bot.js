import dotenv from "dotenv";
dotenv.config(); // prior EVERYTHING else otherwise .env arent loaded properly

import slackBolt from "@slack/bolt";
import { generate } from "./open-ai-interface.js";

const app = new slackBolt.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: process.env.PORT || 3000,
});

/* Add functionality here */
app.event("app_home_opened", ({ event, say }) => {
  console.log("App has been opened!");
  say(`Hello world, <@${event.user}>!`);
});

app.message(/^hello tutor[.!]?/i, async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  console.log("Hello tutor is triggered with message: ", message.text);
  const before = performance.now();
  // console.log({ text: message.text });
  // await say(`Hey there <@${message.user}>!`);
  await say(`${await generate(message)}`);
  const after = performance.now();
  console.log(`Call to generate took ${after - before} milliseconds`);
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
