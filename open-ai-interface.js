import dotenv from "dotenv";
dotenv.config(); // omg, for some reason, if this is done in another file, .env is not loaded T_T
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const generate = async ({ text }) => {
  let processedText = text.replace(/^hello tutor[.!]?/i, "");
  processedText = processedText.trim();
  //

  if (processedText.length === 0) {
    return "Please enter a prompt.";
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: processedText }],
    });

    return completion.data.choices[0].message.content;
    // return completion.data.choices[0].text;
    // return "valid but processing reponse";
  } catch (e) {
    console.log(e);
    return "Sorry, I don't understand.";
  }
};

const generate2 = async (slackMessages, triggerRegex) => {
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
  // we then filter the messages according to the existence of the user and bot ids, ie if theres a second user that is not the first bot OR the parent user, we ignore it
  const filteredMessages = messagesArray.filter((message) => {
    return message.user === userId || message.user === botId;
  });
  const mappedMessages = filteredMessages.map((message) => {
    const role = message.user === userId ? "user" : "assistant";
    return { role, content: message.text.replace(triggerRegex, "").trim() };
  });
  return mappedMessages;
};

export { generate, generate2 };
