const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
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

app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  console.log("Someone said hello!");
  await say(`Hey there <@${message.user}>!`);
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
