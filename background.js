'use strict';

const GAME_URL = chrome.runtime.getURL('index.html');

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: GAME_URL });
});