// Wake word detection module
// Note: Backend wake word detection requires 'sox' system dependency
// Frontend HotwordListener (React component) handles wake word detection in the browser
// This provides a fallback in case frontend wake words are needed on backend

let isWakeWordEnabled = false;

export const initWakeWord = (io) => {
    console.log('ℹ️  Backend wake word detection is disabled.');
    console.log('   → Frontend HotwordListener handles wake words in the browser');
    console.log('   → If you need backend detection, ensure sox is installed:');
    console.log('   → Windows: Download from https://sox.sourceforge.io/');
    console.log('   → macOS: brew install sox');
    console.log('   → Linux: sudo apt-get install sox');
    isWakeWordEnabled = false;
};

export const cleanupWakeWord = () => {
    console.log('ℹ️  No backend wake word resources to clean up');
};