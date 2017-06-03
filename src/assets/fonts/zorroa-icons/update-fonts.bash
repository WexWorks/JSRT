#!/bin/bash -e # -x

# We need the github cli
command -v hub >/dev/null 2>&1 || { echo >&2 "Please install hub https://hub.github.com/"; exit 0; }

# Make sure you don't have any staged git files
GITSTATUS=$(git status -s)
GITHASHLOCAL=$(git rev-parse HEAD)
CUR_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GITHASHREMOTE=$(git rev-parse origin/$CUR_BRANCH)

if [ ! -z "$GITSTATUS" ] || [ "$GITHASHLOCAL" != "$GITHASHREMOTE" ]; then
  echo "You have uncommitted changes; bailing out."
  exit 0
fi

# make a new branch
git fetch
git branch -f zorroa-icons origin/master
git checkout zorroa-icons

# We need to be sitting in src/assets/fonts/zorroa-icons (where this script is)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# Download zorroa-icons.zip. This URL is also in preview-fonts.bash
curl -L 'https://docs.google.com/uc?export=download&id=0B2crMLkmt3O9TU9BWm4xeUlLQVU' > zorroa-icons.zip

# unpack the downloaded file in place, with overwrite
unzip -o zorroa-icons.zip

# check the contents into git, create a pull request
git add -- .
git commit -m "Update zorroa-icons"
git push -f -u origin zorroa-icons
hub pull-request -b master -h zorroa-icons -m "Update zorroa-icons"

echo ""
echo "NOTE: you're now in the zorroa-icons branch."
echo "Once the pull request is merged, delete the branch"
echo "To preview the fonts and make sure you have the glyphs you expect:"
echo "open demo.html (after unzipping the new zip file)"
