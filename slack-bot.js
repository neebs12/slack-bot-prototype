import dotenv from "dotenv";
dotenv.config(); // prior EVERYTHING else otherwise .env arent loaded properly

import slackBolt from "@slack/bolt";
import { generate, generate2 } from "./open-ai-interface.js";

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
  await say(`${await generate(message)}`);
  const after = performance.now();
  console.log(`Call to generate took ${after - before} milliseconds`);
});

/*
There needs to be a few things which happen here:
- the bot needs to be able to listen to the thread
- the bot needs to be able to only reply to the person who started the thread (this seems to make the most sense)
- how to handle multiple conseq messages from a valid user? I guess thats ok.
- so ideal message structure is:
{
  system: "you are a socratic tutor, your personality is a helpful teacher that does not give the answer but helps the student to find the answer",
  user1: `{first message}`,
  agent: `{agent message}`, etc.
}
- we need to be aware of the token limitations of this bot, so this needs to be considered somehow.
- need to check if the message is from a user or a bot
*/

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
    // console.log({ messages: messages.map((m) => m.text) });
    generatedReply = await generate2(messages, triggerRegex);
  } else {
    // so the generated reply here will be a normal generation message
    generatedReply = await generate2([message], triggerRegex);
  }

  await say({
    text: `Bot message is: ${generatedReply}`,
    thread_ts: message.ts,
    reply_broadcast: false, // dont post reply to channel
  });
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
