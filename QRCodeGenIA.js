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
 * QRCodeEncoder
 * ------------
 * 
 */
 
// using Chrome DevTools
// https://support.intuiface.com/hc/en-us/articles/360028205792-Using-Chrome-DevTools-to-Debug-Custom-JavaScript-based-Interface-Assets

// this describes the specifics of creating an 'Intuiface Descriptor File' (.ifd)
// https://support.intuiface.com/hc/en-us/articles/360007179812-Design-an-Interface-Asset-Descriptor-for-a-REST-based-Web-Service




/**
* Inheritance on EventEmitter base class
* @type {EventEmitter}
*/
QRCodeEncoder.prototype = new EventEmitter();
QRCodeEncoder.prototype.constructor = QRCodeEncoder;

/**
 * @constructor
 * 
 *
 * 
 */
function QRCodeEncoder() {
    //this.encodeText = "";
    //this.qrCodeFilePath = "";
    this.TextToEncode = "";
    this.GeneratedQRCodePath = "";
    

    //this.getInitFile();
    //if needed
    //this.init();
    //this.ConnectToServer
    //this.DisconnectFromServer
    //this.fileService = intuiface.get('fileService', this);
}

/*
QRCodeEncoder.prototype.setQrCodeFilePath = function(value){

    if (this.qrCodeFilePath != value) {
        this.qrCodeFilePath = value;
        
        this.emit('qrCodeFilePathChanged', [this.qrCodeFilePath]);
        console.log("==>>>>set qr fired with new val");
    } 
}
*/

QRCodeEncoder.prototype.setTextToEncode = function(value) {
    
    if (this.TextToEncode != value) {
        this.TextToEncode = value;
        
        this.emit('TextToEncodeChanged', [this.TextToEncode]);
        this.init();
    } 
} 


function str2ab(str) {
    //https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    //var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    //var bufView = new Uint16Array(buf);
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++)
    {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
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

function updateTheImage(newImg)
{

    this.GeneratedQRCodePath = newImg;
    console.log("should update: " + newImg);
    this.emit('GeneratedQRCodePathChanged', [this.GeneratedQRCodePath]);
    //this.setQrCodeFilePath(valFP);
}

QRCodeEncoder.prototype.getInitFile = function() {
    /*
    console.log("git init fired");
    //to provide a filepath for the inital image
    var self = this;

    var promiseCreateFSInit = new Promise(function(resolve, reject) {
    
        setTimeout(function() {
            this.fileService = intuiface.get('fileService', this);
            //should resolve once fileservice has been created
            resolve();
    
        }, 6000);

    });

    promiseCreateFSInit.then(
        function(result) {
            fileService.getFilePath("writeFile.png", {
                "success": function(valFP) {
                    console.log("value from fs:" + valFP);

                    self.qrCodeFilePath = valFP;
                    self.emit('qrCodeFilePathChanged', [this.qrCodeFilePath]);
                },
                "error": function(err) {
                    //IA is not fully initialized yet, FileService must be used out of the IA constructor, at a later time...
                    console.log("==> error from init filepath");
                }
            });

        }
    );
    */

}

QRCodeEncoder.prototype.init = function() {

    var urlToQR = this.TextToEncode;
    var directoryPath = "Data/QRCodeGenerator/";
    var randomNamePNG =  directoryPath + "qr_output_" + Date.now() + ".png";
    console.log("what we're encoding: " + urlToQR + " " + randomNamePNG);
    console.log("==> init()");
    
    /*
     * This logic can be used to account for the DOM not being available in PLW
     *
     */

    if (typeof Document !== 'undefined')
    {   //console.log("Document available, we're running in PLH!");
        //------------------------------------------------------------------------------------------------------
        
        //var imageArrayBuffer;

        //toDataURL() supports: image/webp, image/jpeg, image/png
        //mime,     String, MIME type used to render the image for the QR code, "image/png"
        //level,    String, Error correction level of the QR code (L, M, Q, H), "L"
        var qr = new QRious({    
            value: urlToQR,
            size: 600,
            padding: 50,

        });
        //qr code has been created and stored in a blob
        //ready to write
        var newImage = qr.toDataURL('image/png');
        var newImageBlob = dataURItoBlob(newImage);
        
        //used for the fileservice
        var self = this;

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
                
                //may need to add a unique variable to the filename

                fileService.write(newImageBlob, randomNamePNG, true, {
    
                    "success": function()
                    {

                        //now we need the filepath
                        //and then bind that to an image
                        fileService.getFilePath(randomNamePNG, {
                            "success": function(valFP) {
                                console.log("value from fs:" + valFP);

                                newImage = valFP;

                                self.GeneratedQRCodePath = valFP;
                                self.emit('GeneratedQRCodePathChanged', [this.GeneratedQRCodePath]);

                                
                                //date time - day
                                fileService.getDirectoryContent(directoryPath, {
                                    "success": function(list)
                                    {
                                        console.log(list);

                                        var arrayLength = list.length;
                                        for (var i = 0; i < arrayLength; i++) 
                                        {
                                            
                                            //split the file name string to get the miliseconds since 1/1/70
                                            var qrFileName = list[i].name;
                                            console.log(qrFileName);
                                            var fileDate = qrFileName.substring(
                                                qrFileName.lastIndexOf("_") + 1, 
                                                qrFileName.lastIndexOf(".")
                                            );

                                            var aDayAgo = new Date();
                                            aDayAgo.setDate(aDayAgo.getDate() - 1);
                                            
                                            //console.log("file date: " + aDayAgo.getTime());
                                            if (aDayAgo > fileDate)
                                            {
                                                console.log("we should delete this: " + directoryPath + qrFileName);
                                                fileService.deleteFile(directoryPath + qrFileName, {
                                                    "success": function(list)
                                                    {
                                                        console.log("file deleted?")
                                                    }
                                                });

                                            }


                                        }
                                        /*
                                        returns: the list of entries of the directory [array]. Each entry will have the following properties:
                                            name: name of the entry
                                            isDirectory: boolean indicating if the entry is a directory or not
                                            isFile: boolean indicating if the entry is a file or not
                                            fullPath: the absolute path of the entry
                                        */
                                        
                                        
                                    }
                                });
                            },
                            "error": function(err) {
                                console.log("==> error from [file] service");
                            }
                        });

                    },
                    "error": function(err2) {
                        console.log("==> error from [write] method " + err2);
                    }

                });
            }
        );

        /*
        setTimeout(function() {
            console.log("==> new timeout");
            
            fileService.getFilePath('', {
                "success": function(val) {
                    console.log("value from fs:" + val);
                },
                "error": function(err) {
                    console.log("==> error from [file] service");
                }
            });
    
            fileService.read('awesomeface.jpg', true, {
                "success": function(val2) {
                    //ArrayBuffer if using Player for Tables/Kiosks, array of bytes if using Player for Windows?
                    //console.log("value from read: \n " + val);
                    
                    //https://javascript.info/arraybuffer-binary-arrays
                    //Uint8Array, Uint16Array, Uint32Array
                    //Uint8ClampedArray
                    //Int8Array, Int16Array, Int32Array
                    //Float32Array, Float64Array
                    //DataView 
    
                    //var imageArrayView = new Uint8Array([val])
    
                    console.log("val typeof: " + typeof(val2));
    
                    var convertedStrToAB = str2ab(val2);
                    //var imageArrayView = new Uint8Array(val);
    
                    //console.log("length of array uint8" + imageArrayView.byteLength);
                    
                    
                    
                    
                    //the dataview failing - throwing an error saying that val is NOT an array buffer
                    var valView = new DataView(convertedStrToAB)
                    //console.log("length of dataview: " + valView.byteLength);
                    
                    
                    //var blob = new Blob( [ imageArrayView ], { type: "image/jpeg" } );
                    //var blobImg = new Blob([imageArrayBuffer]);
    
                    //--------------------------------------------------------------
                    setTimeout(function() { }, 1500);
                    //--------------------------------------------------------------
    
                    //write the file as text
                    //then try an empty blob type without data
                    fileService.write(newImageBlob, 'writeFile.png', true, {
    
                        "success": function()
                        {
                            //console.log("write worked?");
    
                            //now we need the filepath
                            //and then bind that to an image
                            fileService.getFilePath('writeFile.png', {
                                "success": function(valFP) {
                                    console.log("value from fs:" + valFP);
    
                                    var qr = new QRious();
    
    
    
                                    //this.qrCodeFilePath = valFP;
                                    //this.setQrCodeFilePath(valFP);
                                    newImage = valFP;
                                    //updateTheImage(valFP);
                                    self.qrCodeFilePath = valFP;
                                    self.emit('qrCodeFilePathChanged', [this.qrCodeFilePath]);
                                },
                                "error": function(err) {
                                    console.log("==> error from [file] service");
                                }
                            });
    
                        },
                        "error": function(err2) {
                            console.log("==> error from [write] method " + err2);
                        }
    
                    });
    
    
                },
                "error": function(err) {
                    console.log("==> error from [read] method");
                }
            });
    
        }, 1500);
        */
    
        //------------------------------------------------------------------------------------------------------
    }//end Document check if statement
    else
    {   //console.log("Document (DOM) NOT available.");
    }
    
    
    
}

QRCodeEncoder.prototype.generateCode = function() {



}


