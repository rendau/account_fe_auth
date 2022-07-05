#!/bin/sh

confpath=/www/site/config.js

# Recreate config file
rm -rf ${confpath}
touch ${confpath}

# Add assignment
echo "window.API_URL = '$API_URL';" >> ${confpath}
