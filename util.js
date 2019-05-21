const argv = require('yargs').argv;

const requireArg = (argvOptions, type, label) => {
  const matchesType = option => typeof argv[option] === type;
  if (argvOptions.some(matchesType)) {
    return argv[argvOptions.find(matchesType)];
  } else {
    throw new Error(`Argument ${label} is required and must be type ${type}`);
    return false;
  }
};

module.exports = {
  requireArg
};
