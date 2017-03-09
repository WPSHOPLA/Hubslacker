(function  () {
	
  var slack, getChannels, titleCase, setDefaultChannel, getDefaultChannel;

  slack = window.slack = {};

  // initiates onpage event listeners
  slack.initListeners = function(){

    $('#default_channel').click(slack.setDefaultChannel);
    $('#channels').change(function(e){
      $('.fa-check').remove();
    });

  }
  

  // gets Channels cached in DB (not from Slack API)
  slack.getChannels = function(){
    $.get('api/slack/channels', function(d){
    	insertChannels(d);
    });
  }

  // inserts channels into UI
  insertChannels = function(data) {

    var html = "";

    data.channels.forEach(function(d){
      //console.log(d);
      if(d.id === data.default_channel){  // sets the chosen default channel as selected in the UI
        html += `<option value=${d.id} selected>${firstToUpper(d.name)}</option>`
      } else {
        html += `<option value=${d.id}>${firstToUpper(d.name)}</option>`
      }
      
    });

    // inserts HTML string into DOM
    $('#channels').html(html);
  }

  
  // caches selected channel as default
  slack.setDefaultChannel = function(){
    
    // init spinner
    $('#default_channel').after('<i class="fa fa-spinner fa-pulse fa-2x fa-fw margin-bottom"></i>');
    
    $.post('/api/slack/channels/set', {
        default_channel : getDefaultChannel()
    }, function(err, res, d){
      if (err) throw err;

      if(d.statusText === 'OK'){

        // remove spinner 
        $('.fa-spinner').remove();

        // success -> check
        $('#default_channel').after('<i class="fa fa-check fa-2x" aria-hidden="true"></i>');
      }
    });
  }

  // gets selected channel
  getDefaultChannel = function(){
    // return value attr of selected option
    return $('#channels')[0].selectedOptions[0].value;
  }

  // first char in each word to Upper
  firstToUpper = function(string) { 
    return string.charAt(0).toUpperCase() + string.slice(1); 
  }

})()