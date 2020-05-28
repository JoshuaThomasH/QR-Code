## QR Generator IA 


#### Note

There are some difference in the current way the .net version and JS version deal with file paths.

The .net version stores the generated files with `Environment.SpecialFolder.LocalApplicationData` in (my machine's user name is 'Intuiface'):

```C:\Users\Intuiface\AppData\Local\IntuiLab\QRCodeGenerator```

The JS version uses the existing local (to the interface asset) `\ImagesQR` directory.