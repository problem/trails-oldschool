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

    $('input:password').each(function(){
      var $currentPass = $(this);
      $currentPass.hide();
      $currentPass.wrap('<div style="position: relative; height: 38px"></div>');
      $currentPass.before('<input type="text" class="removeit ' + $currentPass.attr("id") + '" value="' + $currentPass.attr("rel") + '" style="position: absolute;" />');
      
      var $visiblePassword = $(".removeit");

      $visiblePassword.focus(function () {
        $(this).hide();
        $currentPass.show();
      });

      $currentPass.blur( function () {
        if ( $currentPass.attr("value") == "" ){
          $currentPass.hide();
          $visiblePassword.show();
          }
       });

    });


  });

