#!/bin/bash -x

# Example bump uses
# patch: sh build-prod.sh patch
# minor: sh build-prod.sh minor
# major: sh build-prod.sh major

versionType="$1"

CUR_BRANCH=$(git rev-parse --abbrev-ref HEAD)

deployCheck() {
  # We need the github cli
  command -v hub >/dev/null 2>&1 || { echo >&2 "Please install hub https://hub.github.com/"; exit 0; }

  # Potential Types: [prepatch, preminor, premajor, prerelease]
  # Available Types: [patch, minor, major] patch is the default so it is not passed
  ALLOWED_VERSIONS="patch minor major"
  if [[ ! " $ALLOWED_VERSIONS " =~ " $versionType " ]]; then
    echo "Unknown version type \"$versionType\""
    echo "Known version types: $ALLOWED_VERSIONS"
    exit 0
  fi

  GITSTATUS=$(git status -s)
  GITHASHLOCAL=$(git rev-parse HEAD)
  GITHASHREMOTE=$(git rev-parse origin/$CUR_BRANCH)

  if [ ! -z "$GITSTATUS" ] || [ "$GITHASHLOCAL" != "$GITHASHREMOTE" ]; then
    echo "You have uncommitted changes; bailing out."
    exit 0
  fi

  # make sure for patches that git branch version and npm version match
  if [ "$versionType" == "patch" ]; then
    CUR_NPM_VER=$(npm version | grep zorroa-js-curator | egrep -o '\d+\.\d+\.\d+')
    CUR_NPM_MAJOR_MINOR=$(echo $CUR_NPM_VER | cut -f -2 -d.)
    if [ "$CUR_BRANCH" != "$CUR_NPM_MAJOR_MINOR" ]; then
      echo "You must be in branch $CUR_NPM_MAJOR_MINOR to patch"
      exit 0
    fi
  fi

  if [ "$versionType" != "patch" ] && [ "$CUR_BRANCH" != "master" ]; then
    echo "Deploying from branch $CUR_BRANCH"
    read -p "Type $CUR_BRANCH to continue deploying from a custom branch, or Ctrl-C to cancel: " p
    if [ "$p" != "$CUR_BRANCH" ]; then
      echo "Name doesn't match; bailing out."
      exit 0
    fi
  fi
}

build() {
  git pull origin master &&
  rm -rf node_modules &&
  npm cache clean &&
  npm install &&
  npm run build
}

bumpVersion() {
  # patch? create a new branch
  if [ "$versionType" != "patch" ]; then
    git checkout -b ${versionType}_$(date +%s%3N)
  fi

  # Bump the version number. This creates a commit changing package.json, and a tag with the version number
  npm version $versionType -m "$USER deployed %s on $(date +%Y-%m-%d@%H:%M)"
  VERSION_PATCH=$(npm version | grep zorroa-js-curator | egrep -o '\d+\.\d+\.\d+')
  VERSION_MAJMIN=$(echo $VERSION_PATCH | cut -f -2 -d.)
  if [ "$VERSION_PATCH" == "" ] || [ "$VERSION_MAJMIN" == "" ]; then
    echo npm version failed; bailing out
    exit 0
  fi

  echo "Version bumped to" $VERSION_PATCH

  if [ "$versionType" != "patch" ]; then
    # maj.min branches have no 'v' prefix
    git branch -m $VERSION_MAJMIN
  fi

  # push the commit, use -u for major.minor new branch (ignored for existing branches)
  git push -u origin HEAD

  # push the tag (note tags have a 'v' prefix)
  git push origin v$VERSION_PATCH

  # if we just made a new branch, let's make a PR, then go back to the branch we started in
  if [ "$versionType" != "patch" ]; then
    echo "Creating a pull request. hub will request a username & password the first time only."
    hub pull-request -m "Version $VERSION_PATCH by $USER" &&
    git checkout $CUR_BRANCH
  fi
}

deployCheck && build && bumpVersion
