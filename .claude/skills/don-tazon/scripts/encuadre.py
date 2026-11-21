import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB'); W,H=1080,1350
r=max(W/im.width,H/im.height); im=im.resize((round(im.width*r),round(im.height*r)),Image.LANCZOS)
l,t=(im.width-W)//2,(im.height-H)//2; im.crop((l,t,l+W,t+H)).save(sys.argv[2]); print(sys.argv[2],im.size)
