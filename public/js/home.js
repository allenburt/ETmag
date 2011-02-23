var aspectRatio = 1.33;

var SubmittingStr = "<img src='/img/loading.gif' alt='Submitting... Please Wait'> Submitting... Please Wait";


//Retrieves the current viewport dimensions and calculates
// image dimensions preserving aspect ratio of 3:4
//Returns an array of img and window dimensions.
var getDimensions = function() {
  var window_width = $(window).width();
  var window_height = $(window).height();
  var img_width, img_height;
  /*if(window_width/aspectRatio >= window_height) {
    img_width = window_width+20;
    img_height = window_width/aspectRatio;
  } else {
    img_height = window_height;
    img_width = window_height*aspectRatio;
  }*/
  if(window_width > 600) {
    img_width = window_width+20;
    img_height = window_width/aspectRatio;
  }
  return [img_width, img_height, window_width, window_height];
};

var validateAndSubmitForm = function() {
  var valid = false;
  var email = $("#email").val();
  var ref = '';

  if(email != "" && email.match(/^.+@.+\..+$/)) {
    var ajaxData = { email: email};
    if($("#referrer").length) {
      ajaxData['r'] = $("#referrer").val();
    }
    $.ajax( { url: "/submit_form",
              dataType: "text",
              method: "POST",
              data: ajaxData,
              beforeSend: function() {
                /*$("#pre_register_link").empty()
                                .append(SubmittingStr);*/
              },
              error: function() {
                $(".error").removeClass('hidden').html("An error occurred. Please try again later.").fadeIn();
                valid = false;
              },
              success: function(d) {
                $(".error").html('');
                if(d != "false" && d != "exists") {
                  if(d.indexOf(':') !== -1) {
                    d = d.split(':').pop()
                    setWelcomeBackText()
                  }
                  updateLinks(d);
                  $("#pre_register_link").trigger('click');
                  $("#email").val("");
                  valid = true;
                } else if (d == 'exists') {
                  $(".error").removeClass('hidden').html("Looks like you've already signed up!").fadeIn();
                } else {
                  $(".error").removeClass('hidden').html("An error occurred. Please try again later.").fadeIn();
                }
              }
            });
      return valid;
    } else {
      return true;
    }
  
};

var updateLinks = function(id) {
  var href = 'http://www.facebook.com/sharer.php?u=http%3A%2F%2Fwww.epicthrills.com%3Fr%3D'+id;
  href += '&t=EpicThrills.com is launching soon and I just snagged early exclusive access to extreme adventure trips';
  $("#fb-link").attr('href', href);
  var text = $(".twitter-share-button").attr('src');
  text = text.replace('http%3A%2F%2Fwww.epicthrills.com', 'http%3A%2F%2Fwww.epicthrills.com%3Fr%3D'+id);
  $(".twitter-share-button").attr('src', text)
  $("#direct-link").val('http://www.epicthrills.com?r='+id);
}

var setWelcomeBackText = function() {
  $("#register_form_container .title").html('Welcome back!')
  $("#register_form_container .text").html("The more friends you invite, the sooner you'll get access!")
}

//Function called on load.
$(function() {


  $("#email").placeholder();
  //Register callback to recalculate img size
  //whenever window is resized
  $(window).bind("resize", function(){
    dimensions = getDimensions();
    $("#bg_img").attr({
      width: dimensions[0],
      height: dimensions[1]
    });
  });

  //Register fancybox(popup) to the link
  $("a#pre_register_link").fancybox({
    overlayColor: '#000',
    overlayOpacity: 0.6
  });
  $("#fancybox-outer").css('background','none repeat scroll 0 0 #000000');
  $("#fancybox-outer").css('opacity','0.95');

  //Handles placeholder text in form
  $("#register_form input[type=text]").focus(function() {
    if($(this).val() == $(this).attr('default_value'))
    {
      $(this).val('');
    }
  });

  $("#register_form input[type=text]").blur(function() {
    if($(this).val() == '')
    {
      $(this).val($(this).attr('defaultValue'));
    } 
  });

  $("#pre_reg_button").live('click', function() {
    if(validateAndSubmitForm()) {
      $("#pre_register_link").trigger('click');
    }
  });

  if($("#ref_id").length) {
    var id = $("#ref_id").val()
    setWelcomeBackText()
    updateLinks(id)
    $("#pre_register_link").trigger('click');
  }

});


//Get window and img dimensions
//and set them during first draw.
$(window).load(function() {
  var dimensions = getDimensions();
  $("#bg_img").attr({
    width: dimensions[0],
    height: dimensions[1]
  });
  $("#bg_img_container").fadeIn('slow');
});