import spectro
import sys
import os

flname = sys.argv[1]
path = os.path.abspath(os.path.join("temp/spectro/audio/", flname))
imgname = flname.replace(".wav", ".png")
spectro.show(filename=path, min_freq=0.1, num_frequencies=44100, channel=1,
             outfile=os.path.abspath(os.path.join("temp/spectro/images/", imgname)))
