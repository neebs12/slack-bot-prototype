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

export { generate };
