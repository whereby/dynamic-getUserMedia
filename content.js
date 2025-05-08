// Helper function to get the extension's runtime API (chrome or browser)
function getExtensionRuntime() {
    if (typeof browser !== "undefined" && browser.runtime) {
        return browser.runtime;
    } else if (typeof chrome !== "undefined" && chrome.runtime) {
        return chrome.runtime;
    } else {
        console.error("Dynamic GUM errors: Extension runtime API not found.");
        return null;
    }
}

const runtimeAPI = getExtensionRuntime();

if (runtimeAPI) {
    const script = document.createElement("script");
    script.src = runtimeAPI.getURL("injected_script.js");

    // It's generally recommended to inject into document.documentElement
    // as document.head might not be available when run_at is 'document_start'.
    // insertBefore ensures it's one of the first scripts.
    (document.head || document.documentElement).insertBefore(
        script,
        (document.head || document.documentElement).firstChild,
    );

    script.onload = function () {
        // Optional: remove the script tag from the DOM after it has loaded
        // This can help keep the DOM clean.
        // However, be cautious if the injected script itself relies on being
        // in the DOM for some reason (unlikely for this use case).
        // script.parentNode.removeChild(script);
        console.log("Dynamic GUM errors: Injected script loaded.");
    };

    script.onerror = function () {
        console.error("Dynamic GUM errors: Failed to load injected_script.js.");
    };
} else {
    // Fallback or error handling if no runtime API is found
    console.error(
        "Dynamic GUM errors: Could not determine extension runtime (Chrome or Firefox). Script injection failed.",
    );
}
