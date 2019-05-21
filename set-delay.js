require('colors');
const argv = require('yargs').argv;
const { execFile } = require('child_process');
const gifsicle = require('gifsicle');
const { requireArg } = require('./util.js');

const getFrameCount = (input) => {
  return new Promise((resolve, reject) => {
    execFile(gifsicle, [input, '--info'], (err, data) => {
      if (err) {
        reject(err);
      }

      const countMatches = data.match(/(\d+)(\simages)/i);
      if (countMatches) {
        resolve(countMatches[1]);
      } else {
        reject(`Could not get metadata from file ${input}`);
      }
    })
  });
};

const getParameters = () => {
  /* Make sure all required arguments are present */
  const input = requireArg(['i', 'input'], 'string', 'input');
  const output = requireArg(['o', 'output'], 'string', 'output');
  const delay = argv.delay || 10;
  return {
    input,
    output,
    delay
  };
};

const delayFrames = (input, delay, frames, output) => {
  return new Promise((resolve, reject) => {
    const gifsicleOptions = ['-U', '-i', input, `-d${delay}`, ...frames, '-o', output];
    execFile(gifsicle, gifsicleOptions, (err) => {
      if (err) {
        console.error(`Err`, err)
        reject(err)
      }

      console.log(`Create file at ${output}`.green)
      resolve();
    });
  });
}


const init = () => {
  const {
    input,
    output,
    delay
  } = getParameters();

  console.log('Input:'.cyan, input);
  console.log('Delay:'.cyan, `${delay}ms`);

  getFrameCount(input)
    .then(framecount => {
      const frames = Array.from({length : framecount}).map((_, i) => {
        return `#${i}`
      });
      return delayFrames(input, delay, frames, output);

    })
    .catch((err) => {
      console.log('Error'.red, err)
    })

}

init();