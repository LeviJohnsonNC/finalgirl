# Play header face detection

`pico.js` adapts the still-image detector from [picojs at afffa50](https://github.com/nenadmarkus/picojs/tree/afffa50) as an ES module. The unused webcam detection buffer is omitted. `facefinder.bin` is the pretrained frontal-face cascade from [pico at 7d550c7](https://github.com/nenadmarkus/pico/blob/7d550c78b2c31a4e1dfc5bcdfe9da013297b5cc8/rnt/cascades/facefinder). Both are MIT licensed.

A worker analyzes a downsized copy in the browser. Photos are never sent to a service for cropping. Faces with low detection confidence fall back to the standard upper-biased crop. Close-ups can use a narrower foreground photo with soft matching edges when the heads would exceed the full-width crop.
