import dotenv from "dotenv";
dotenv.config(); // omg, for some reason, if this is done in another file, .env is not loaded T_T
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const generate = async (slackMessages, triggerRegex) => {
  const validMsgArry = constructMessageArray(slackMessages, triggerRegex);
  const systemObject = {
    role: "system",
    content:
      "You are a socratic tutor, your personality is a helpful teacher that does not give the answer but helps the student to find the answer",
  };
  const validMsgArryWithSystem = [systemObject, ...validMsgArry];

  console.log({ validMsgArryWithSystem });
  // return JSON.stringify(validMsgArryWithSystem);
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: validMsgArryWithSystem,
    });

    return completion.data.choices[0].message.content;
    // return completion.data.choices[0].text;
    // return "valid but processing reponse";
  } catch (e) {
    console.log(e);
    return "Sorry, I don't understand.";
  }
};

const constructMessageArray = (messagesArray, triggerRegex) => {
  const userId = messagesArray[0].user;
  const botId = (
    messagesArray.find((message) => message.bot_id) ?? { user: undefined }
  ).user;
  // cool! now we have isolated the user and bot ids
  const filteredMessages = messagesArray.filter((message) => {
    // removes non first user && bot messages
    return message.user === userId || message.user === botId;
  });
  const mappedMessages = filteredMessages.map((message) => {
    const role = message.user === userId ? "user" : "assistant";
    return { role, content: processMessage(message.text, triggerRegex) };
  });
  return mappedMessages;
};

const processMessage = (text, regex) => {
  const removeByRegex = (input, regex) => {
    return input.replace(regex, "");
  };

  const htmlDecode = (input) => {
    const entities = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
    };
    return input.replace(/&amp;|&lt;|&gt;/g, (m) => entities[m]);
  };

  const addNewline = (input) => {
    // adds a `\n` before and after an "```" if it is not already there
    return input.replace(/(\\n)?```(\\n)?/g, "\n```\n");
  };

  return addNewline(htmlDecode(removeByRegex(text, regex))).trim();
};

export { generate };
