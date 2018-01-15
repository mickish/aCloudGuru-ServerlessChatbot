const log = (event) => {
  console.log('Event', JSON.stringify(event, null, 2));
  return Promise.resolve(event);
};

const getCommand = text => /^<@[A-Z0-9]*>(.+)/.exec(text)[1].trim();

const parseConvertCommand = (command) => {
  const pattern = /[a-z\s]*(\d+).*([a-z]{3}).*([a-z]{3})/i;
  const matches = command.match(pattern);
  if (matches) {
    return {
      amount: +matches[1],
      source: matches[2],
      target: matches[3],
    };
  }
  return null;
};

// Generate a response to the command.
const doCommand = (event) => {
  const rawCommand = event.slack.event.text;
  const command = getCommand(rawCommand);
  const convertCommand = parseConvertCommand(command);
  if (convertCommand) {
    return convertCommand;
    // return callFixer(convertCommand)
    //   .then(reply => Object.assign(event, { reply }));
  }
  const defaultReply = `I'm sorry, I don't understand the command "${command}"
Please use a format like "convert 1AUD to USD"`;
  return Object.assign(event, { reply: defaultReply });
};

module.exports.handler = (event, context, callback) => log(event)
  .then(doCommand) // Attempt the command
  // .then(sendResponse) // Update the channel
  .then(log) // Testing: Log event
  .then(() => callback(null)) // Success
  .catch(callback); // Error
