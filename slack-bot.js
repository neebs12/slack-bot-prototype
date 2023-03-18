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

app.event("message", async ({ event, say }) => {
  // Check if the message starts with Ask Tutor: and has no thread_ts
  let generatedReply;
  if (event.text.startsWith("Ask Tutor:") && !event.thread_ts) {
    generatedReply = await generate([event]);
  } else if (
    // is a reply to a message, is not a bot message, the follow up message is from an identical user
    event.thread_ts &&
    event.subtype !== "bot_message" &&
    event.user === event.parent_user_id
  ) {
    const { messages } = await app.client.conversations.replies({
      channel: event.channel,
      ts: event.thread_ts,
    });
    generatedReply = await generate(messages);
  } else {
    // not a message we want to reply to
    console.log({ message: "message is ignored" });
    return;
  }
  await say({
    text: generatedReply,
    thread_ts: event.ts,
    reply_broadcast: false, // dont post reply to channel
  });
});

/* Add functionality here */
app.message(/^health check[.!]?/i, async ({ message, say }) => {
  await say(`Your message is: ${message.text}, and I am ok!!`);
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
