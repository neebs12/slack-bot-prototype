const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

/* Add functionality here */
app.event("app_home_opened", ({ event, say }) => {
  say(`Hello world, <@${event.user}>!`);
});

// Listen for messages in the #random channel
app.message("#random", async ({ message, say }) => {
  // Say yes in the same channel
  console.log({ message });
  await say("Yes");
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
