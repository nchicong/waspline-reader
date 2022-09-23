var defaultSettings = {
  color1: "#0000FF",
  color2: "#FF0000",
  color_text: "#000000",
  gradient_size: 50,
  enabled: false,
  whitelist_urls: "",
}
var tabsMap = {}; //store temporary color status of current tab

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.storage.local.get(defaultSettings, function(result) {
  	if(!result.enabled) { // Apply gradient to every new tab if addon is enabled
    	return;
  	}
  	var whitelistMatched = false;

    chrome.tabs.executeScript(tabId, {file: "/contentScript.js"}); // When the page loads, inject the content script

  	chrome.tabs.get(tabId, function (tab) {
  		if (!tab.url) {
  			return;
  		}

  		result.whitelist_urls
  			.split("\n")
  			.forEach(function(whitelist_url) {
	  			console.log(tab.url, whitelist_url, tab.url.includes(whitelist_url))
	  			if (tab.url.includes(whitelist_url)) {
	  				whitelistMatched = true;
	  			}
	  		});

  		if (!whitelistMatched) {
  			return;
  		}

	    setTabColor(tabId, "apply_gradient", result);
  	});
  });
});

chrome.commands.onCommand.addListener(function (command, tab) {
	chrome.tabs.executeScript(tab.id, {file: "/contentScript.js"});

  chrome.storage.local.get(defaultSettings, function(result) {

    if (tabsMap[tab.id] && tabsMap[tab.id].enabled) {
	    setTabColor(tab.id, "reset", result);

	    delete(tabsMap[tab.id].enabled);
    } else {
  		setTabColor(tab.id, "apply_gradient", result);

			tabsMap[tab.id] = tabsMap[tab.id] || {};
	    tabsMap[tab.id].enabled = true;
    }
  });
});

function setTabColor(tabId, command, result) {
	chrome.tabs.sendMessage(tabId, {
    command: command,
    colors: [result.color1, result.color2],
    color_text: result.color_text,
    gradient_size: result.gradient_size
  });
}
