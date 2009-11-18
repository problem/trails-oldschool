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
    
    $("a:has(img), a img").css("border", "none");
    
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
      } 
    });

	$(".overlabel").overlabel();

  });

