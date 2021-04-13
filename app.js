const fs = require('fs');
const Jimp = require('jimp');
const inquirer = require('inquirer');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    const textData = {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);

    console.log('\n' + outputFile + ' successfully created!');
    startApp();
  }
  catch(error) {
    console.log('\nSomething went wrong :( Please try again.');
  }
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;
  
    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
  
    console.log('\n' + outputFile + ' successfully created!');
    startApp();
  }
  catch(error) {
    console.log('\nSomething went wrong :( Please try again.');
  }
};

const prepareOutputFilename = inputFilename => {
  const filenameArr = inputFilename.split('.');
  const fileName = filenameArr[0];
  const fileExtension = filenameArr[1];
  return `${fileName}-watermarked.${fileExtension}`;
};

const startApp = async () => {

  // ask if user is ready
  const answer = await inquirer.prompt([{
    name: 'start',
    message: '\nHi! Welcome to "Watermark manager". Copy your image files to /img folder. Then you\'ll be able to use them in the app. Are you ready?',
    type: 'confirm',
  }]);

  // if answer is 'no', just quit the app
  if (!answer.start) {
    inquirer.prompt([{
      name: 'quit',
      message: 'Ok. Bye then :)',
    }]);
    process.exit();
  }

  // if answer is 'yes', ask about input file and watermark type
  const input = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
  }]);
  
  if (fs.existsSync('./img/' + input.inputImage)) {

    const type = await inquirer.prompt([{
      name: 'watermarkType',
      type: 'list',
      message: 'Type of watermark:',
      choices: ['Text watermark', 'Image watermark'],
    }]);
  
    if (type.watermarkType === 'Text watermark') {
  
      const text = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:',
      }]);
      addTextWatermarkToImage('./img/' + input.inputImage, './img/' + prepareOutputFilename(input.inputImage), text.value);
  
    } else {
  
      const image = await inquirer.prompt([{
        name: 'filename',
        type: 'input',
        message: 'Type your watermark image name:',
        default: 'logo.png',
      }]);

      if (fs.existsSync('./img/' + image.filename)) {
        addImageWatermarkToImage('./img/' + input.inputImage, './img/' + prepareOutputFilename(input.inputImage), './img/' + image.filename);
      } else {
        inquirer.prompt([{
          name: 'exit',
          message: 'Unfortunately such file doesn\'t exist :( Please try again.\n',
        }]);
        process.exit();
      }
    }
  } else {
    inquirer.prompt([{
      name: 'exit',
      message: 'Unfortunately such file doesn\'t exist :( Please try again.\n',
    }]);
    process.exit();
  }
};

startApp();
