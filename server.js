const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { log } = require('console');

// this will store files in uploads folder but without extension.
// const upload = multer({dest:'uploads/'});

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        const uploadPath = path.join(__dirname, 'uploadFromDisk');
        cb(null,uploadPath);
    },
    filename: function(req,file,cb){
        const extension = path.extname(file.originalname);
        const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + extension;
        console.log(`file name : ${fileName}`);
        cb(null,fileName);
    }
})
const  upload = multer({storage:storage})
const app = express();

//single upload file
// app.post('/upload',upload.single('image'),(req,res)=>{
//     console.log(req.file)
//     console.log(req.body)
//     res.send('File uploaded successfully');

// })

// 2 files upload as array of files
// app.post('/upload',upload.array('fileUpload',2),(req,res)=>{
//     console.log(req.files)
//     console.log(req.files[0])
//     console.log(req.body)
//     res.send('File uploaded successfully');

// })

app.post('/upload',upload.single('mypfphoto'),async(req,res)=>{
    try{
        console.log(req.file)
        //get metadata of image
        // const readImage = await sharp(req.file.path).metadata();
        // console.log(readImage);

        const processedDir = path.join(__dirname,'processed');
        if(!fs.existsSync(processedDir)){
            fs.mkdirSync(processedDir);
        }
        const processedImage = await sharp(req.file.path).resize(500,500).toFormat('jpeg',{mozjpeg:true}).toFile(`processed/${req.file.originalname}`);
        console.log(processedImage);
        res.send('Image processed successfully');

    }catch(err){
        console.error('Error processing image:', err);
        res.status(500).send('Error processing image');

    }
})

app.post('/croppImage',upload.single('mypfphoto'),async(req,res)=>{
    try {
        const croppedImagePath = path.join(__dirname,'croppedImages')
        if(!fs.existsSync(croppedImagePath)){
            fs.mkdirSync(croppedImagePath)
        }

        const croppedImage = await sharp(req.file.path)
        .extract({ width: 2000, height: 2000, left: 500, top: 500 }) // to cropp image
        .grayscale()
        .toFile(`${croppedImagePath}/${req.file.originalname}`);
        console.log(croppedImage);
        res.send('Image cropped successfully');
        
    } catch (err) {
        console.error('error cropping image:',err);
        res.status(500).send('Error cropping image');
        
    }
})

app.post('/rotateImage',upload.single('mypfphoto'),async(req,res)=>{
    try {
        const rotateImagePath = path.join(__dirname,'rotatedImages')
        if(!fs.existsSync(rotateImagePath)){
            fs.mkdirSync(rotateImagePath)
        }
        console.log(req.file)
        const rotatedImage = await sharp(req.file.path)
        .rotate(90)
        .blur(4)
        .toFile(`${rotateImagePath}/${req.file.originalname}`);
        console.log(rotatedImage);
        res.send('Image rotated successfully');
        
    } catch (err) {
        console.error('Error rotating images:',err);
        res.status(500).send('Error rotating images');
        
    }
})

app.post('/compositeImage',upload.single('image'),async(req,res)=>{
    try {
        const compositeImagesPath = path.join(__dirname,'compositeImages')
        if(!fs.existsSync(compositeImagesPath)){
            fs.mkdirSync(compositeImagesPath)
        }
        console.log(req.file)
        const compositeImage = await sharp(req.file.path)
        .composite([
            {
              input: "birdImage.png",
              top: 50,
              left: 50,
            },
        ])
        .toFile(`${compositeImagesPath}/${req.file.originalname}`);
        console.log(compositeImage);
        res.send('Image composited successfully');
        
    } catch (err) {
        console.error('Error compositing images:',err);
        res.status(500).send('Error compositing images');
        
    }
})

const port = 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
