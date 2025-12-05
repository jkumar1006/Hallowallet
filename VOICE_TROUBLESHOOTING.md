# Voice Assistant Troubleshooting Guide

## ✅ What I Fixed

1. **Better error handling** - Clear messages for network, permission, and speech detection issues
2. **Single-shot mode** - More reliable than continuous mode (less prone to network errors)
3. **Interim results** - See what you're saying in real-time
4. **Proper cleanup** - Prevents memory leaks and conflicts
5. **Audio feedback** - Better logging to debug issues
6. **Network error handling** - Specific message for network issues

## 🎤 How to Use Voice Assistant

1. **Click the 🎙️ microphone button** in the top-right of the AI Assistant panel
2. **Wait for "🎤 Listening... Speak now!"** message
3. **Speak clearly** - e.g., "Add 50 dollars for groceries"
4. **Wait** - It will auto-stop when you finish speaking
5. Your command will be processed automatically

## 🔧 Common Issues & Solutions

### Issue: "Network error" message

**Cause:** Browser's speech recognition service needs internet connection

**Solutions:**
- Check your internet connection
- Try refreshing the page
- Make sure you're not using a VPN that blocks Google services
- Try a different network

### Issue: "Microphone blocked" message

**Solutions:**
1. Click the 🔒 lock icon in your browser's address bar
2. Find "Microphone" in the permissions list
3. Change it to "Allow"
4. Refresh the page (F5 or Cmd+R)

### Issue: "No speech detected"

**Solutions:**
- Speak louder and clearer
- Check if your microphone is working (test in System Settings)
- Make sure the correct microphone is selected in browser settings
- Try getting closer to your microphone

### Issue: Voice button doesn't work at all

**Solutions:**
- Make sure you're using Chrome, Edge, or Safari (Firefox doesn't support Web Speech API)
- Update your browser to the latest version
- Try in an Incognito/Private window
- Check browser console (F12) for errors

## 🌐 Browser Compatibility

✅ **Supported:**
- Chrome (Desktop & Mobile)
- Edge (Desktop)
- Safari (Desktop & iOS)

❌ **Not Supported:**
- Firefox (no Web Speech API support)
- Opera (limited support)

## 🧪 Testing Steps

1. **Test microphone access:**
   - Go to https://www.onlinemictest.com/
   - Verify your mic works

2. **Test in HalloWallet:**
   - Open http://localhost:3001
   - Click AI Assistant panel
   - Click 🎙️ button
   - Allow microphone when prompted
   - Say: "Add 20 dollars for coffee"

3. **Check browser console:**
   - Press F12 (or Cmd+Option+I on Mac)
   - Go to Console tab
   - Look for `[Voice]` logs
   - Share any errors you see

## 💡 Tips for Best Results

- **Speak naturally** - No need to speak slowly
- **Be specific** - "Add 50 dollars for groceries yesterday"
- **Use clear amounts** - "Twenty dollars" or "20 dollars"
- **Include category** - "for food", "for transport", etc.
- **Quiet environment** - Reduce background noise

## 🐛 Still Having Issues?

If voice still doesn't work:

1. **Check browser console** (F12) for errors
2. **Try these test commands:**
   - "Add 20 dollars for coffee"
   - "Monthly summary"
   - "Set yearly goal 1000 for clothes"

3. **Alternative:** Use the text input instead
   - Type the same commands in the chat box
   - All features work the same way

## 📝 Supported Voice Commands

All the same commands that work in text chat work with voice:

- **Add expense:** "Add 50 dollars for groceries"
- **Set goal:** "Set yearly goal 1000 for clothes"
- **Create watch:** "Watch food 500 monthly"
- **Get summary:** "Monthly summary"
- **Get insights:** "Insights"
- **Top spending:** "Most spent on this month"

The voice assistant has the exact same capabilities as the text chat!
