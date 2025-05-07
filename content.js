// This content script's primary role is now to tell the background script (or service worker in MV3)
// to inject the main world script. However, since content scripts can use chrome.scripting.executeScript
// directly if they have the "scripting" permission and matching host_permissions, we can do it here.

// Ensure this runs only once or as needed
if (typeof window.myExtensionInjected === "undefined") {
    window.myExtensionInjected = true; // Simple flag to prevent multiple injections if content.js runs multiple times

    if (window.chrome?.scripting) {
        window.chrome.scripting
            .executeScript({
                target: {
                    tabId: chrome.devtools.inspectedWindow.tabId,
                    allFrames: true,
                }, // Get tabId dynamically if not in devtools context
                // If not in devtools, you'll need to get the tabId
                // via messages from a background script or other means
                // depending on when/how content.js is triggered.
                // For typical content scripts, this isn't directly available.
                // Let's assume this content script is for the main frame
                // and you want to inject into the current tab.
                // A more robust way to get current tabId might be needed
                // if content.js isn't triggered by tab events directly.
                // For simplicity, if this content.js is declared in manifest
                // it will run in the context of a tab that matches.
                // We often don't need to specify tabId if injecting into the
                // tab the content script is running in.
                // However, to be explicit for MAIN world:
                func: () => {
                    const script = document.createElement("script");
                    script.src = chrome.runtime.getURL("injected_script.js");
                    (document.head || document.documentElement).appendChild(
                        script,
                    );
                    // The script will load and execute in the MAIN world.
                    // You might want to remove it after execution if it's large and not needed.
                    script.onload = () => script.remove();
                },
                injectImmediately: true, // Try to inject as soon as possible
                world: "MAIN", // Execute in the main page context
            })
            .then(() => {
                console.log("Injected main world script.");
            })
            .catch((err) => {
                console.error("Failed to inject main world script:", err);
            });
    }
}
