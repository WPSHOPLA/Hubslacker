(function() {

  path = location.pathname;

  // Index JS
  if(path === '/'){
    
    // inserts slack channels into UI
    slack.getChannels();

    // initiates all on page event listeners related to slack.js
    slack.initListeners();

    // inserts HubSpot properties into UI
    hubspot.getProperties();

    hubspot.initListeners();
  }

  if(path === '/account'){
    

    // initiates onpage event listeners
    util.initListeners();

    // displays the Org Auth Info in the accounts screen
    util.getOrgInfo();


  }
	
})();