#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 \"<version>\"" >&2
    exit 1
fi

JHI_VERSION=$1
sed -e '/<artifactId>jhipster-control-center<\/artifactId>/{N;s/<version>.*<\/version>/<version>'$JHI_VERSION'<\/version>/1;}' pom.xml > pom.xml.sed
mv -f pom.xml.sed pom.xml
