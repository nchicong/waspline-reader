var defaultSettings = {
  color1: "#0000FF",
  color2: "#FF0000",
  color_text: "#000000",
  gradient_size: 50,
  enabled: false
}
var tabsMap = {};


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.local.get(defaultSettings, function(result) {
    // When the page loads, inject the content script
    chrome.tabs.executeScript(tabId, {file: "/contentScript.js"});
    // Apply gradient to every new tab if addon is enabled
    if(result.enabled) {
      chrome.tabs.sendMessage(tabId, {
        command: "apply_gradient",
        colors: [result.color1, result.color2],
        color_text: result.color_text,
        gradient_size: result.gradient_size
      });
    }
  });
});

chrome.commands.onCommand.addListener(function (command, tab) {
	chrome.tabs.executeScript(tab.id, {file: "/contentScript.js"});

  chrome.storage.local.get(defaultSettings, function(result) {

  	console.log(tabsMap[tab.id])
    if (tabsMap[tab.id] && tabsMap[tab.id].enabled) {
    	chrome.tabs.sendMessage(tab.id, {
	      command: "reset",
	      colors: [result.color1, result.color2],
	      color_text: result.color_text,
	      gradient_size: result.gradient_size
	    });

	    delete(tabsMap[tab.id].enabled);
	    console.log("reset");
    } else {
  		chrome.tabs.sendMessage(tab.id, {
	      command: "apply_gradient",
	      colors: [result.color1, result.color2],
	      color_text: result.color_text,
	      gradient_size: result.gradient_size
	    });

			tabsMap[tab.id] = tabsMap[tab.id] || {};
	    tabsMap[tab.id].enabled = true;
	    console.log("apply");
    }
  });
});

