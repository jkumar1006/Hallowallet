#!/bin/bash

echo "🎤 Attempting to fix voice recognition on macOS..."
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

echo "1️⃣ Checking microphone permissions..."
# Check if Chrome has microphone access
if system_profiler SPApplicationsDataType 2>/dev/null | grep -A 5 "Google Chrome" | grep -q "Microphone"; then
    echo "✅ Chrome has microphone access"
else
    echo "⚠️  Please grant microphone access:"
    echo "   System Settings > Privacy & Security > Microphone > Enable Chrome"
fi

echo ""
echo "2️⃣ Checking internet connectivity to Google..."
if ping -c 1 www.google.com &> /dev/null; then
    echo "✅ Can reach Google"
else
    echo "❌ Cannot reach Google - check your internet connection"
fi

echo ""
echo "3️⃣ Testing DNS resolution..."
if nslookup www.google.com &> /dev/null; then
    echo "✅ DNS working"
else
    echo "❌ DNS issues detected"
    echo "   Try: sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder"
fi

echo ""
echo "4️⃣ Checking for VPN/Proxy..."
if scutil --proxy | grep -q "HTTPEnable : 1"; then
    echo "⚠️  Proxy detected - this might block voice recognition"
    echo "   Try disabling proxy in System Settings > Network"
else
    echo "✅ No proxy detected"
fi

echo ""
echo "5️⃣ Recommended fixes:"
echo "   • Open Chrome at: chrome://settings/content/microphone"
echo "   • Make sure localhost:3001 is allowed"
echo "   • Try in Incognito mode (Cmd+Shift+N)"
echo "   • Clear browser cache and reload"
echo "   • Restart Chrome completely"
echo ""
echo "6️⃣ Alternative browsers to try:"
echo "   • Safari (often works better on macOS)"
echo "   • Microsoft Edge"
echo ""
echo "7️⃣ If nothing works:"
echo "   • The typing feature works identically!"
echo "   • Type: 'Add 50 dollars for groceries'"
echo ""
