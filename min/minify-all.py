#!/usr/bin/env python
import sys, re, json, os

# Change working directory to location of this script
abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

##############
# Minify CSS #
##############
os.system("./minify-css.py > main.min.css")


#############
# Minify JS #
#############
# Get and set version
version = int(open("version", "r").read())
version += 1
open("version", "w").write(str(version))
os.system("sed -i '' -E 's/Offline Cache version .*/Offline Cache version "+str(version)+"/' ../manifest.appcache")
# Minify files
os.system("echo \"app.value('version', "+str(version)+")\" | ./minify-js initial.min.js ../src/js/app.js ../src/js/controllers/masterCtrl.js  ../src/js/directives/para-back.js /dev/stdin");
os.system("./minify-js lazyModules.js ../src/js/controllers/weatherCtrl.js ../src/js/controllers/searchCtrl.js  ../src/js/controllers/cookieCtrl.js");
