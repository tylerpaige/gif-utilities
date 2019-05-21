# Promo GIF Utilities

## Setup
`npm install`

---

## Resizer
This is a small little Node app using Gifsicle to resize GIFs for promos.

Please note that this may not be the best solution for all cases. For example, GIFs involving text may be a better case for Photoshop or After Effects.

It is advised that you optimize your GIFs after this app generates your crops. For example, you may want to limit the colors, dithering, and frames for an individual crop. This is an action that should be handled on a crop-by-crop basis, and therefore will not be applied in batch file creation.

Static promos should be use in the main promo slot in Methode. Animated promos should be placed in the "Alt" input.

Finally, remember to have an `OR` crop in order to have a valid image bucket. This program does not generate an OR crop, because it does not have any specified dimensions.

### Usage
For example:
`node resize.js -i ./sample/input.gif -o ./sample/output/ --prefix '20170420demo_'`

Other examples:
```sh
node resize.js -i ./sample/input.gif --select TOP,SOC --crop
node resize.js -i ./sample/input.gif --preset homepage --stretch
node resize.js -i ./sample/input.gif --exclude A,AM,TOP,SOC
```

### Options

option|required?|description
------|---------|-----------
`-i`, `--input`|true|path to input gif
`-o`, `--outpath` |false|path to output directory; defaults to input path
`--prefix`|false|string; how to prefix each filename (use for date and slug)
`--preset`|false|string; filename (sans extension) of JSON in presets directory; Defaults to `all`
`--select`|false|comma,separated,list; which crops to select from preset
`--exclude`|false|comma,separated,list; which crops to exclude from preset
`--crop`|false|In the event that input/output aspect ratios mismatch, crop from the center
`--stretch`|false|In the event that input/output aspect ratios mismatch, stretch to fit

---

## Framecount Reducer

This script will remove every _nth_ frame from an input GIF. This can be useful for reducing animations with consistent motion. For example, passing the script `-n 4` will result in a 25% reduction (1 in every 4 frames will be removed).

NOTE: You may find undesired results if your animation has varying delays on individual delays. 

NOTE: This script does nothing to change the frame delays on the source animation. Running this script will make your overall animation shorter. You can compensate by applying new frame delays with Gifsicle.

NOTE: This script does not "optimize" the GIF output. You may want to run `gifsicle input.gif -O3 > output.gif`  to achieve a smaller file size.

### Usage

```sh
node reduce-framecount.js -i ./sample/input.gif -o ./sample/half-frames.gif -n 3
node reduce-framecount.js -i ./sample/input.gif -o ./sample/one-third-reduction -n 3 --keep-mode
```

### Options

option|required?|description
------|---------|-----------
`-i`, `--input`| true | path to input gif
`-o`, `--output` | true | path to output gif
`-n`| false | remove every _nth_ frame; defaults to 2.
`--keep-mode`, `-k` | false | enable keep mode: instead of removing every _nth_ frame, remove _everything but_ every nth frame

---

## GIF Converter

This script will convert video files into GIFs. The other scripts in this app require a GIF input, so this script will come in handy if you only have a video file. Supports any video format that ffmpeg supports — although you may need to independently install ffmpeg codec libraries. 

NOTE: requires ffmpeg to be installed on your machine.

NOTE: This script does not "optimize" the GIF output. You may want to run `gifsicle input.gif -O3 > output.gif`  to achieve a smaller file size.

### Usage

```sh
node convert-to-gif.js -i ./sample/video.mp4 -o ./sample/video.gif
node convert-to-gif.js -i ./sample/video.mp4 -o ./sample/video.gif -w 300 --fps 12
```

### Options

option|required?|description
------|---------|-----------
`-i`, `--input`| true | path to input gif
`-o`, `--output` | true | path to output gif
`-w` `--width`| false | produce a file that is _w_ px wide; defaults to 620.
`--fps`| false | produce a file that is _fps_ frames per second; defaults to 10.


---

## Frame Delay Setter

This script will apply a new delay (measured in milliseconds) to every frame in a GIF.

NOTE: This script does not "optimize" the GIF output. You may want to run `gifsicle input.gif -O3 > output.gif`  to achieve a smaller file size.


### Usage

```sh
node convert-to-gif.js -i ./sample/video.mp4 -o ./sample/video.gif
node convert-to-gif.js -i ./sample/video.mp4 -o ./sample/video.gif -w 300 --fps 12
```

### Options

option|required?|description
------|---------|-----------
`-i`, `--input`| true | path to input gif
`-o`, `--output` | true | path to output gif
`-w` `--width`| false | produce a file that is _w_ px wide; defaults to 620.
`--fps`| false | produce a file that is _fps_ frames per second; defaults to 10.


## TODO
- Refine list of crops to only those actively used



