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

    //implement error message
    //this.ErrorMessage = "";
    
    this.directoryPath = "ImagesQR/";

    this.fileService = null;
    var self = this;

    setTimeout(function() {
        //this.fileService = intuiface.get('fileService', this);
        self._init();
    }, 500);
}


QRCodeEncoder.prototype.setTextToEncode = function(value) {
    
    //check for an empty string as well
    if (this.TextToEncode != value && value != "") {
        this.TextToEncode = value;
        
        this.emit('TextToEncodeChanged', [this.TextToEncode]);
        //this.init();
        this.writeQRCode();
    } 
} 


QRCodeEncoder.prototype._init = function() {

    //initalize fileservice 
    if (this.fileService == null) {
        this.fileService = intuiface.get('fileService', this);
    }

    
    console.log("new init");
    this.writeQRCode();

}//end _init






QRCodeEncoder.prototype.writeQRCode = function() {

    var self = this;

    
    var fullFileName =  this.directoryPath + "qr_output_" + Date.now() + ".png";
    
    //console.log("path???===>>>" + this.directoryPath);
    //console.log("full???===>>>" + fullFileName);
    var qr = new QRious({    
        value: this.TextToEncode,
        size: 600,
        padding: 50,

    });

    var newImage = qr.toDataURL('image/png');
    var newImageBlob = dataURItoBlob(newImage);
    console.log(newImageBlob);
    //filePath: relative file path (i.e. relative to the experience folder) of the file to be written
    this.fileService.write(newImageBlob, fullFileName, true, {
    
        "success": function()
        {
            self.getNewFilePath(fullFileName);
            
            //console.log("the file was written!!!");
        },//end success
        'error': function(error) {

            //console.log("error message==>" + error)
        }//end error
    });//end write
}

QRCodeEncoder.prototype.getNewFilePath = function(newFileName) {
    
    var self = this;

    this.fileService.getFilePath(newFileName, {
        "success": function(returnValFilePath) {
            console.log("value from fs:" + returnValFilePath);

            self.GeneratedQRCodePath = returnValFilePath;
            self.emit('GeneratedQRCodePathChanged', [this.GeneratedQRCodePath]);

            self.deleteDayOldFiles();
        },
        'error': function(error) {
            //console.log("error message==>" + error)
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
                //console.log(qrFileName);
                var fileDate = qrFileName.substring(
                    qrFileName.lastIndexOf("_") + 1, 
                    qrFileName.lastIndexOf(".")
                );

                var aDayAgo = new Date();
                aDayAgo.setDate(aDayAgo.getDate() - 1);
                
                //delete file if older than one day
                if (aDayAgo > fileDate)
                {
                    //console.log("we will delete: " + this.directoryPath + qrFileName);
                    self.fileService.deleteFile(self.directoryPath + qrFileName, {
                        "success": function(delItem)
                        {
                            console.log("file deleted? " + delItem)
                        },
                        'error': function(error) {
                            console.log("error message del==>" + error)
                        }//end error
                    });
                }
            }
        },
        'error': function(error) {
            console.log("error message==>" + error)
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


QRCodeEncoder.prototype.init = function() {

    var urlToQR = this.TextToEncode;
    var directoryPath = "Data/QRCodeGenerator/";
    var fullFileName =  directoryPath + "qr_output_" + Date.now() + ".png";
    console.log("what we're encoding: " + urlToQR + " " + fullFileName);
    console.log("==> init()");
    
    /*
     * This logic can be used to account for the DOM not being available in PLW
     *
     */

    if (typeof Document !== 'undefined')
    {   //console.log("Document available, we're running in PLH!");
        //------------------------------------------------------------------------------------------------------
        

        var qr = new QRious({    
            value: urlToQR,
            size: 600,
            padding: 50,

        });

        //qr code has been created
        //ready to write

        //toDataURL() supports: image/webp, image/jpeg, image/png
        var newImage = qr.toDataURL('image/png');
        var newImageBlob = dataURItoBlob(newImage);
        
        //used for the fileservice
        //var self = this;

        var promiseCreateFS = new Promise(function(resolve, reject) {
        
        setTimeout(function() {
            this.fileService = intuiface.get('fileService', this);
                //should resolve once fileservice has been created
                resolve();
            }, 500);
        });

        //once the fileservice resolves
        promiseCreateFS.then(
            function(result) {

                fileService.write(newImageBlob, fullFileName, true, {
    
                    "success": function()
                    {

                        fileService.getFilePath(fullFileName, {
                            "success": function(valFP) {
                                console.log("value from fs:" + valFP);

                                newImage = valFP;

                                self.GeneratedQRCodePath = valFP;
                                self.emit('GeneratedQRCodePathChanged', [this.GeneratedQRCodePath]);

                                //delete all generated images in the content directory
                                //written over 1 day ago 
                                fileService.getDirectoryContent(directoryPath, {
                                    /**  
                                     * returns: the list of entries of the directory [array]. Each entry will have the following properties:
                                     *   name: name of the entry
                                     *   isDirectory: boolean indicating if the entry is a directory or not
                                     *   isFile: boolean indicating if the entry is a file or not
                                     *   fullPath: the absolute path of the entry
                                    */
                                    "success": function(list)
                                    {
                                        //console.log(list);

                                        var arrayLength = list.length;
                                        for (var i = 0; i < arrayLength; i++) 
                                        {
                                            
                                            //split the file name string to get the miliseconds since unix epoch
                                            var qrFileName = list[i].name;
                                            //console.log(qrFileName);
                                            var fileDate = qrFileName.substring(
                                                qrFileName.lastIndexOf("_") + 1, 
                                                qrFileName.lastIndexOf(".")
                                            );

                                            var aDayAgo = new Date();
                                            aDayAgo.setDate(aDayAgo.getDate() - 1);
                                            
                                            //delete file if older than one day
                                            if (aDayAgo > fileDate)
                                            {
                                                //console.log("we will delete: " + directoryPath + qrFileName);
                                                fileService.deleteFile(directoryPath + qrFileName, {
                                                    "success": function(list)
                                                    {
                                                        //console.log("file deleted?")
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });//end getDirectoryContent
                            },
                            "error": function(err) {
                                console.log("==> error from [file] service");
                            }
                        });//end getFilePath
                    },
                    "error": function(err2) {
                        console.log("==> error from [write] method " + err2);
                    }
                });//end write
            }
        );//end promise
        //------------------------------------------------------------------------------------------------------

    }//end Document check if statement
    else
    {   //console.log("Document (DOM) NOT available.");
    }
    
}//end init()



