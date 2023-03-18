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
app.message(/^health check[.!]?/i, async ({ message, say }) => {
  await say(`Your message is: ${message.text}, and I am ok!!`);
});

const triggerRegex = /^tutor:[.!]?/i;
app.message(triggerRegex, async ({ message, say }) => {
  // dont reply to bot messages
  if (message.subtype === "bot_message") return;
  let generatedReply;
  if (message.thread_ts) {
    // get all the converstations in the current thread where the message was sent
    const { messages } = await app.client.conversations.replies({
      channel: message.channel,
      ts: message.thread_ts,
    });
    generatedReply = await generate(messages, triggerRegex);
  } else {
    // so the generated reply here will be a normal generation message
    generatedReply = await generate([message], triggerRegex);
  }

  await say({
    text: `${generatedReply}`,
    thread_ts: message.ts,
    reply_broadcast: false, // dont post reply to channel
  });
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
