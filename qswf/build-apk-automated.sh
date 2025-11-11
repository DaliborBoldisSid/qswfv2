#!/bin/bash
# Automated APK Build Script for Quit Smoking App
# This script builds the PWA and packages it as an APK using Bubblewrap

set -e

echo "======================================"
echo " Quit Smoking App - Automated APK Builder"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${YELLOW}[1/6] Installing dependencies...${NC}"
npm install --ignore-scripts
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Build the app
echo -e "${YELLOW}[2/6] Building production app...${NC}"
npm run build
echo -e "${GREEN}✓ App built successfully${NC}"
echo ""

# Step 3: Check Bubblewrap
echo -e "${YELLOW}[3/6] Checking for Bubblewrap...${NC}"
if ! command -v bubblewrap &> /dev/null; then
    echo "Installing Bubblewrap globally..."
    npm install -g @bubblewrap/cli
fi
echo -e "${GREEN}✓ Bubblewrap is ready${NC}"
echo ""

# Step 4: Start preview server in background
echo -e "${YELLOW}[4/6] Starting preview server...${NC}"
npm run serve > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3
echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"
echo ""

# Step 5: Build APK using expect
echo -e "${YELLOW}[5/6] Building APK with Bubblewrap...${NC}"
if command -v expect &> /dev/null; then
    expect <<EOF
    set timeout 600
    spawn bubblewrap build
    expect "Do you want Bubblewrap to install the Android SDK*"
    send "Y\r"
    expect "Do you agree to the Android SDK terms*"
    send "y\r"
    expect {
        "BUILD SUCCESSFUL" { exit 0 }
        "Build succeeded" { exit 0 }
        timeout { exit 1 }
        eof
    }
EOF
else
    echo -e "${YELLOW}Note: expect is not installed. You'll need to answer prompts manually:${NC}"
    echo "1. Press Y to install Android SDK"
    echo "2. Press y to agree to terms"
    bubblewrap build
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ APK built successfully!${NC}"
else
    echo -e "${RED}✗ APK build failed. Check errors above.${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo ""

# Step 6: Move APK to build folder
echo -e "${YELLOW}[6/6] Moving APK to build folder...${NC}"
mkdir -p build
if [ -f "app-release-unsigned.apk" ]; then
    mv app-release-unsigned.apk build/
    echo -e "${GREEN}✓ APK moved to build/app-release-unsigned.apk${NC}"
elif [ -f "app-release-signed.apk" ]; then
    mv app-release-signed.apk build/
    echo -e "${GREEN}✓ APK moved to build/app-release-signed.apk${NC}"
else
    # Search for APK in the project directory
    APK_FILE=$(find . -name "*.apk" -type f | head -1)
    if [ -n "$APK_FILE" ]; then
        cp "$APK_FILE" build/
        echo -e "${GREEN}✓ APK copied to build/$(basename $APK_FILE)${NC}"
    else
        echo -e "${YELLOW}Warning: APK file not found in expected location${NC}"
        echo "Please check the project directory for the generated APK"
    fi
fi
echo ""

# Cleanup
echo -e "${YELLOW}Stopping preview server...${NC}"
kill $SERVER_PID 2>/dev/null || true
echo -e "${GREEN}✓ Server stopped${NC}"
echo ""

echo "======================================"
echo -e "${GREEN} APK Build Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Check the build/ folder for your APK file"
echo "2. Transfer the APK to your Android device"
echo "3. Enable 'Install from Unknown Sources' in Android settings"
echo "4. Install and test the app"
echo ""
