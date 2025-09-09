# Download and unpack Java 11
wget https://download.java.net/java/GA/jdk24.0.2/fdc5d0102fe0414db21410ad5834341f/12/GPL/openjdk-24.0.2_linux-x64_bin.tar.gz
tar xzf openjdk-24.0.2_linux-x64_bin.tar.gz
export JAVA_HOME=$PWD/jdk-24.0.2
export PATH=$JAVA_HOME/bin:$PATH
