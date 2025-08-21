// auto-hash-bot.js

(async () => {
  let scriptTag = document.currentScript;

  // Fallback if currentScript is null
  if (!scriptTag) {
    scriptTag = [...document.querySelectorAll("script")].find(
      (s) => s.src && s.src.includes("auto-hash-bot.js")
    );
  }

  if (!scriptTag) {
    console.error("HashBot: Unable to find <script> tag.");
    return;
  }

  // Read optional UI customization attributes
  const iconSize = scriptTag.getAttribute("data-iconsize") || "70";
  const chatbotWidth = scriptTag.getAttribute("data-width") || "300";
  const chatbotHeight = scriptTag.getAttribute("data-height") || "400";
  const theme = scriptTag.getAttribute("data-theme") || "light";
  const welcome = scriptTag.getAttribute("data-welcome") || "";

  // Optional: bot ID for dynamic API endpoint (commented out for now)
  // const botId = scriptTag.getAttribute("data-bot-id") || "default-bot";
  // const apiUrl = `https://yourapi.com/chat?bot=${encodeURIComponent(botId)}`;

  // Use the default API URL only
  const apiUrl = "https://hashbot.dev.clockhash.com";

  // Load the chatbot component library
  const hashBotScript = document.createElement("script");
  hashBotScript.type = "module";
  hashBotScript.src = "https://cdn.jsdelivr.net/npm/alpha-interface@0.0.4/dist/hash-bot/hash-bot.esm.js";
  document.head.appendChild(hashBotScript);

  // Wait briefly to ensure the web component is loaded
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Create and configure the chatbot
  const bot = document.createElement("hash-bot");
  bot.setAttribute("apiurl", apiUrl);
  bot.setAttribute("iconsize", iconSize);
  bot.setAttribute("chatbotwidth", chatbotWidth);
  bot.setAttribute("chatbotheight", chatbotHeight);
  if (theme) bot.setAttribute("theme", theme);
  if (welcome) bot.setAttribute("welcome", welcome);

  // Append chatbot to the body
  document.body.appendChild(bot);
})();



