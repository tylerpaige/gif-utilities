require('colors');
const argv = require('yargs').argv;
const ffmpeg = require('ffmpeg');
const { requireArg } = require('./util.js');

const getParameters = () => {
  /* Make sure all required arguments are present */
  const input = requireArg(['i', 'input'], 'string', 'input');
  const output = requireArg(['o', 'output'], 'string', 'output');
  const width = argv.width || argv.w || 620;
  const fps = argv.fps || 10;
  return {
    input,
    output,
    width,
    fps
  };
};

const startProcess = (input) => {
  return new ffmpeg(input);
};

const producePalette = (video, palettePath, filters) => {
  return new Promise((resolve, reject) => {
    console.log('Attempting to produce palette');
    video.addCommand('-vf', `"${filters},palettegen"`);
    video.addCommand('-y');
    video.save(palettePath, (err, file) => {
      if (err) {
        console.log('Error producing palette'.red);
        reject(err);
      } else {
        console.log('Successfully produced palette'.green);
        resolve();
      }
    });
  });
};

const convertToGif = (video, palettePath, filters, output) => {
  return new Promise((resolve, reject) => {
    console.log('Attempting to create GIF');
    video.addCommand('-i', palettePath);
    video.addCommand('-lavfi', `"${filters} [x]; [x][1:v] paletteuse"`);
    video.addCommand('-y');
    video.save(output, (err, file) => {
      if (err) {
        console.log('Error creating GIF'.red);
        reject(err);
      } else {
        console.log('Successfully created GIF'.green);
        console.log('Output:'.cyan, file);
        resolve();
      }
    });
  })
};

const init = () => {
  const {
    input,
    output,
    width,
    fps
  } = getParameters();

  console.log('Input:'.cyan, input);
  console.log('fps:'.cyan, fps);
  console.log('width:'.cyan, width);
  const palettePath = '/tmp/palette.png';
  const filters = `fps=${fps},scale=${width}:-1:flags=lanczos`;

  startProcess(input)
    .then((video) => {
      return producePalette(video, palettePath, filters);
    })
    .then(() => {
      return startProcess(input);
    })
    .then((video) => {
      return convertToGif(video, palettePath, filters, output);
    });

}

init();