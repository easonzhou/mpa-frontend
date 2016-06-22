import subprocess,sys

for i in range(1,360):
    convert = "convert ship0.png -distort ScaleRotateTranslate {} ship{}.png".format(i, i) 
    print convert
    subprocess.call(convert, shell=True)
