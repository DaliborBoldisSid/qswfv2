#!/usr/bin/expect -f

set timeout 600

spawn bubblewrap build

expect "Do you want Bubblewrap to install the Android SDK*"
send "Y\r"

expect "Do you agree to the Android SDK terms*"
send "y\r"

expect {
    "Generating Android Project" {
        exp_continue
    }
    "Build succeeded" {
        puts "APK built successfully!"
        exit 0
    }
    "BUILD SUCCESSFUL" {
        puts "APK built successfully!"
        exit 0
    }
    timeout {
        puts "Build timed out"
        exit 1
    }
    eof {
        puts "Build completed"
        exit 0
    }
}

interact
