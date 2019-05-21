require('colors');
const argv = require('yargs').argv;
const { execFile } = require('child_process');
const gifsicle = require('gifsicle');
const { requireArg } = require('./util.js');

const constructFrameSelection = (frameCount, n) => {
  const frameCountInclusive = frameCount - 1;
  const isKeepMode = argv['keep-mode'] || argv['k'];

  //Tell the user what's going on
  if (isKeepMode) {
    console.log('Only keep frames that are multiples of:'.cyan, n);
  } else {
    console.log('Remove frames that are multiples of:'.cyan, n);
  }
  return Array.from(Array(frameCountInclusive).keys())
    .filter(i => isKeepMode ? i % n !== 0 : i % n === 0)
    .map(i => `#${i}`);
};

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
  const n = argv.n || 2;
  return {
    input,
    output,
    n
  };
};

const cutFrames = (input, frameSelection, output) => {
  return new Promise((resolve, reject) => {
    const gifsicleOptions = ['-U', '-i', input, '--delete', ...frameSelection, '-o', output];
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
    n
  } = getParameters();

  console.log('Input:'.cyan, input);

  getFrameCount(input)
    .then(framecount => {
      const frameSelection = constructFrameSelection(framecount, n);
      const amountReduction = (frameSelection.length / framecount * 100).toFixed(2)
      console.log(`${amountReduction}% framecount reduction.`.cyan, `(${framecount} => ${framecount - frameSelection.length})`);
      return cutFrames(input, frameSelection, output);
    })
    .catch((err) => {
      console.log('Error'.red, err)
    })

}

init();