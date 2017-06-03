#!/bin/bash -e # -x

# We need to be sitting in src/assets/fonts/zorroa-icons (where this script is)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# Download zorroa-icons.zip. This URL is also in update-fonts.bash
curl -L 'https://docs.google.com/uc?export=download&id=0B2crMLkmt3O9TU9BWm4xeUlLQVU' > zorroa-icons.zip

# unpack the downloaded file in place, with overwrite
unzip -o zorroa-icons.zip

# open font preview page
open demo.html
