
require('colors');
const argv = require('yargs').argv;
const { execFile } = require('child_process');
const gifsicle = require('gifsicle');
const { requireArg } = require('./util.js');

/*
SAMPLE USAGE:
node app.js --preset all -i  sample/input.gif -outpath sample/output/ -prefix '20170420demo_'
*/

//Load the preset JSON, defaulting to `./presets/config.json`;
const getPreset = function getPreset () {
  const presetName = argv.preset || 'all';
  let preset;
  try {
    preset = require(`./presets/${presetName}.json`)
  } catch (e) {
    throw new Error('Preset could not be found:', preset);
  }

  return preset;
};

//Select and exclude the crops listed in the commandline options
const selectCrops = function selectCrops (crops) {
  const selectors = argv.select ? argv.select.split(',') : crops.map(c => c.name);
  const exclusions = argv.exclude ? argv.exclude.split(',') : [];

  const selection = crops.filter(c => selectors.includes(c.name));
  const final = selection.filter(c => !exclusions.includes(c.name));

  return final;
}


//Load the input file (fs functionality made into promise by Bluebird)
const getInput = function getInput () {
  const input = requireArg(['i', 'input'], 'string', 'input');
  console.log('Input:'.cyan, input);
  return input;
};

//Format the output name
const setOutput = function setOutput (crop, inputPath) {
  const arg = argv.o || argv.outpath || path.dirname(inputPath);
  const lastChar = arg.length - 1;
  const destDir = arg.substring(lastChar) === '/' ?
    arg.substring(0, lastChar) : arg;
  const prefix = argv.prefix || '';
  const { name } = crop;
  const dest = `${destDir}/${prefix}${name}.gif`;

  return dest;
};

//Get the dimensions of the input image
const getSizeData = function getSizeData (file, cb) {
  return new Promise((resolve, reject) => {
    execFile(gifsicle, [file, '--info'], (err, response) => {
      if (err) {
        reject(err);
      }
  
      const sizeMatches = response.match(/(\d{1,})x(\d{1,})/i);
      if (sizeMatches) {
        const [ sizeStr, width, height ] = sizeMatches;
        resolve({
          width,
          height
        });
      } else {
        reject(`Could not get image dimensions from file ${file}`);
      }
    });
  });

  return sizeDataPromise;
};

//Create a file with the passed in dimensions
const resize = function resize (inputPath, srcWidth, srcHeight, crop) {
  const {
    name,
    width : destWidth,
    height : destHeight
  } = crop;

  const srcAspectRatio = srcWidth / srcHeight;
  const destAspectRatio = destWidth / destHeight;

  //Options must go: output, flags/arguments, input
  const gifsicleOptions = [];

  if (srcAspectRatio !== destAspectRatio) {
    if (argv.stretch) {
      //Stretch to fit the given size.

      gifsicleOptions.push('--resize', `${destWidth}x${destHeight}`);
    } else if (argv.crop) {
      /*
      Crop from the center.
      Note: Gifsicle crop options are based on the source dimensions,
            not destination dimensions.
      */
      let resizeOption;
      let cropOption;

      if (destAspectRatio > srcAspectRatio) {
        /*
        If the destination aspect ratio is larger than the source aspect ratio,
        then the destination is a wider image format than the source image.
        This means if you resize the source image to match the width, it will
        be too tall. Therefore, crop the height.
        */
        
        const croppedSrcHeight = Math.round(srcWidth * destHeight / destWidth);
        const verticalCropOffset = Math.floor((Math.abs(croppedSrcHeight - srcHeight)) / 2);
        cropOption = `0,${verticalCropOffset}+${srcWidth}x${croppedSrcHeight}`;
        resizeOption = `${destWidth}x_`;

      } else if (destAspectRatio < srcAspectRatio) {
        /*
        If the source aspect ratio is larger than the destination aspect ratio
        Then the source image is a wider image format than the destination.
        This means if you resize the source image to match the destination,
        it won't be tall enough. Therefore, and crop the width.
        */

        const croppedSrcWidth = Math.round(srcHeight * destWidth / destHeight);
        const horizontalCropOffset = Math.floor((Math.abs(croppedSrcWidth - srcWidth)) / 2);
        cropOption = `${horizontalCropOffset},0+${croppedSrcWidth}x${srcHeight}`;
        resizeOption = `_x${destHeight}`;

      }
      //Add to list of Gifsicle command options
      gifsicleOptions.push('--resize', resizeOption);
      gifsicleOptions.push('--crop', cropOption);
    }
    //Otherwise who knows!!
    else {
      console.error('Error:'.red, `The output aspect ratio of crop ${name} does not match the source aspect ratio, but the program does not know whether to crop or stretch. Use --crop or --stretch.`)
      return false;
    }
  } else {
    gifsicleOptions.push('--resize', `${destWidth}x${destHeight}`);
  }

  //Add the input last.
  gifsicleOptions.push('-i', inputPath);

  //Add the output
  const dest = setOutput(crop, inputPath);
  gifsicleOptions.push('-o', dest);


  execFile(gifsicle, gifsicleOptions, err => {
    if (err) {
      console.error(err);
      return false;
    }
    console.log(`Created file at ${dest}`.green);
  });

  return true;
};

const startResize = function startResize (path, sizeData, crops) {
  const { width, height } = sizeData;
  crops.forEach((c) => {
    resize(path, width, height, c);
  });
};

const init = function init() {
  const preset = getPreset();
  const crops = selectCrops(preset);
  const input = getInput();
  getSizeData(input)
    .then((sizeData) => {
      startResize(input, sizeData, crops);
    });
};

init();
