(function () {
	
  var util;

	util = window.util = {};

	util.initListeners = function(){

    // inserts tooltip for 
    tooltipHTML = '<span id="org_id_tooltip" class="tooltip">HubSlacker uses this information to identify your Organization when sending incoming notifications to Slack. This is not/should not be your HubSpot, Slack, or HubSlacker credentials.</span>'
    $('#org_id_h4').after(tooltipHTML);

    // shows/hides tooltip
    $('#org_id_h4').on('mouseover', function (e) {
      if(e.offsetX >= 275 ){
        $('#org_id_tooltip').show();
      }
    });
    $('#org_id_h4').on('mouseout', function (e) {
      if(e.offsetX >= 275 ){
        $('#org_id_tooltip').hide();
      }
    });

    
    // form submission
    $('#org_id').submit(function(e){
      e.preventDefault();

      var org = {};
      
      [].slice.call(e.target.children).forEach(function(d){
        if(d.tagName === "INPUT"){
          org[d.name] = d.value;
        }
      })

      updateOrgInfo(org);

    });

    

	}


  util.getOrgInfo = function(){
    
    $.ajax({
      url : '/api/message/meta',
      method : 'GET',
      success : function(d){

        // on success input Org ID & password placeholder
        $('#org_id input[name=username]').val(d);
        $('#org_id input[name=password]').val('123456');

        // clears pass placeholder on click
        $('#org_id input[name=password]').click(function(){
          $(this).val('');
        });
      }
    });
  }

  updateOrgInfo = function(org){

    // init spinner
    $('#org_id button').after('<i class="fa fa-spinner fa-pulse fa-2x fa-fw margin-bottom"></i>');

    // posts updated org info
    $.post('/api/message/update', org, function(err, res, d){
      if (err) throw err;

      if(d.statusText === 'OK'){

        // remove spinner 
        $('.fa-spinner').remove();

        // success -> check
        $('#org_id button').after('<i class="fa fa-check fa-2x" aria-hidden="true"></i>');
      }

    })
  }

})();