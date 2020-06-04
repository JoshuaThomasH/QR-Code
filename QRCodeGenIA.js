/**
* @license
* Copyright © 2020 Intuilab
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
* 
* The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, 
* fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, 
* whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.
* 
* Except as contained in this notice, the name of Intuilab shall not be used in advertising or otherwise to promote the sale, 
* use or other dealings in this Software without prior written authorization from Intuilab.
*/

/**
 * QRCodeGenIA
 * -----------
 * 
 * utilizes:
 * https://github.com/neocotic/qrious
 * qrious.min.js
 * 
 * qr image output stored in ImagesQR/ directory
 */
 

/**
 * 
 * Inheritance on EventEmitter base class
 * @type {EventEmitter}
 * 
 */

QRCodeEncoder.prototype = new EventEmitter();
QRCodeEncoder.prototype.constructor = QRCodeEncoder;

/**
 * @constructor
 * 
 */

function QRCodeEncoder() {

    this.TextToEncode = "";
    this.GeneratedQRCodePath = "";
    
    this.directoryPath = "ImagesQR/";

    this.fileService = null;
    var self = this;

    setTimeout(function() {
        //create fileservice
        self._init();
    }, 500);
}

QRCodeEncoder.prototype._init = function() {

    //initalize fileservice 
    if (this.fileService == null) {
        this.fileService = intuiface.get('fileService', this);
    }

    //write qr code
    this.writeQRCode();

}//end _init

QRCodeEncoder.prototype.setTextToEncode = function(value) {
    
    //check for an empty string as well
    if (this.TextToEncode != value && value != "") {
        this.TextToEncode = value;
        
        this.emit('TextToEncodeChanged', [this.TextToEncode]);
        //this.init();
        this.writeQRCode();
    } 
} 

QRCodeEncoder.prototype.writeQRCode = function() {

    var self = this;

    var fullFileName =  this.directoryPath + "qr_output_" + Date.now() + ".png";
    
    //removed QRious - now using node-qrcode
    /*
    var qr = new QRious({    
        value: this.TextToEncode,
        size: 600,
        padding: 50,
    });

    var newImage = qr.toDataURL('image/png');
    var newImageBlob = dataURItoBlob(newImage);
    */

    /**
     * version,                 number, QR Code version. If not specified the more suitable value will be calculated.
     * errorCorrectionLevel,    string, Possible values are low, medium, quartile, high or L, M, Q, H.
     * margin,                  number, Define how much wide the quiet zone (?) should be.
     * scale,                   number, Scale factor. A value of 1 means 1px per modules (black dots).
     */
 
    var qr_opts = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 1,
        margin: 0,
        width: 600,
        color: {
            dark:"#000",
            light:"#FFF"
        }
    }

    var newImage;
    var newImageBlob;

    var qr = QRCode.toDataURL(this.TextToEncode, qr_opts, function (err, url) {
        if (err) throw err
      
        newImage = url;
        newImageBlob = dataURItoBlob(newImage);
    });
    //console.log(newImageBlob);

    //filePath: relative file path (i.e. relative to the experience folder) of the file to be written
    this.fileService.write(newImageBlob, fullFileName, true, {
    
        "success": function()
        {
            self.getNewFilePath(fullFileName);
            
        },//end success
        'error': function(error) {
            //console.log("write method error callback: " + error)
        }//end error
    });//end write
}

/**
 * getNewFilePath
 */
QRCodeEncoder.prototype.getNewFilePath = function(newFileName) {
    
    var self = this;

    this.fileService.getFilePath(newFileName, {

        "success": function(returnValFilePath) {

            self.GeneratedQRCodePath = returnValFilePath;
            self.emit('GeneratedQRCodePathChanged', [this.GeneratedQRCodePath]);

            self.deleteDayOldFiles();
        },
        'error': function(error) {
        }//end error
    });

}

QRCodeEncoder.prototype.deleteDayOldFiles = function() {
    
    var self = this;
    
    //delete all generated images in the content directory
    //written over 1 day ago 
    this.fileService.getDirectoryContent(this.directoryPath, {
 
        "success": function(list)
        {
            var arrayLength = list.length;
            for (var i = 0; i < arrayLength; i++) 
            {
                
                //split the file name string to get the miliseconds since unix epoch
                var qrFileName = list[i].name;
                if(qrFileName == ".gitignore")
                {    continue;
                }

                var fileDate = qrFileName.substring(
                    qrFileName.lastIndexOf("_") + 1, 
                    qrFileName.lastIndexOf(".")
                );

                var aDayAgo = new Date();
                aDayAgo.setDate(aDayAgo.getDate() - 1);
                
                //delete file if older than one day
                if (aDayAgo > fileDate)
                {  
                    self.fileService.deleteFile(self.directoryPath + qrFileName, {
                        "success": function()
                        {   //console.log("file deleted")
                        },
                        'error': function(error) {
                        }//end error
                    });
                }
            }
        },
        'error': function() {
        }//end error
    });//end getDirectoryContent
}

//https://gist.github.com/exinferis/4216799
dataURItoBlob = function(dataURI) {
    var array, binary, i;
    binary = atob(dataURI.split(",")[1]);
    array = [];
    i = 0;
    while (i < binary.length) {
        array.push(binary.charCodeAt(i));
        i++;
    }

    return new Blob([new Uint8Array(array)], {
        type: "image/png"
    });
};
