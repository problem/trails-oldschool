
  $(document).ready(function() {
    $("a.iframe").fancybox({
      'frameWidth': 690,
      'frameHeight': 650,
      'zoomSpeedIn': 300, 
  		'zoomSpeedOut': 300
    });
    
    $("a:has(img)").fancybox({
        'zoomSpeedIn': 300, 
    		'zoomSpeedOut': 300
      });
    
    $("a:has(img)").css("border", "none");

    $("#new_user").validate({
    
    errorContainer: "#errorbox",
    errorLabelContainer: "#errorbox ul",
    wrapper: "li",
    rules: {
    	"user[email]": {
    		required: true,
    		email: true,
    	},
    	"user[unencrypted_password]": "required",
      "agreement-checkbox": "required",
    },
	messages: {
    	"user[email]": {
    		required: "Email address is required.",
    	},
    	"user[unencrypted_password]": {
    		required: "Password is required."
    	},
      "agreement-checkbox": {
        required: "Please agree to our terms."
      },
    }
        
    });

    
    $('input[type=text]').focus(function(){ 
      if($(this).val() == $(this).attr('defaultValue'))
      {
        $(this).val('');
      }
    });

    $('input[type=text]').blur(function(){
      if($(this).val() == '')
      {
        $(this).val($(this).attr('defaultValue'));
        $(this).css("border-color", "#999999");
      } 
    });

  	$(".overlabel").overlabel();

    $('#header h1 a').hover(
      function(){
        $(this).css({opacity: 0.7});
      },
      function(){
        $(this).css({opacity: 1});
      });
    

   });
