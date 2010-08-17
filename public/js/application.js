var SubmittingStr = "<img src='/img/loading.gif' alt='Submitting... Please Wait'> Submitting... Please Wait";

var validateAndSubmitForm = function() {
  var valid = false;
  var email = $("#email").val();
  if(email != "" && email.match(/^.+@.+\..+$/)) {
    $.ajax( { url: "/submit_form",
              dataType: "text",
              method: "POST",
              data: { email : email},
              beforeSend: function() {
                /*$("#pre_register_link").empty()
                                .append(SubmittingStr);*/
              },
              error: function() {
                /*$("#pre_register_link").empty()
                  .append("We're sorry an error occurred. Please try again later.");*/
                valid = false;
              },
              success: function(d) {
                if(d == "true") {
                  $("#pre_register_link").trigger('click');
                  $("#email").val("");
                  $("#email2").val("");
                 /* $("#pre_register_link").empty()
                                  .append("Submitted. Thanks!"); */
                  valid = true;
                } else {
                  /*$("#pre_register_link").empty()
                                  .append("We're sorry an error occurred. Please try again later.");*/
                }
              }
            });
      return valid;
    } else {
      return true;
    }
  
};


$(function() {
  //$("#email").placeholder();

  //Register fancybox(popup) to the link
  $("a#pre_register_link, a#submit_button_top").fancybox({
    overlayColor: '#000',
    overlayOpacity: 0.6
  });
  $("#fancybox-outer").css('background','none repeat scroll 0 0 #000000');
  $("#fancybox-outer").css('opacity','0.95');

  $("#pre_reg_button").live('click', function() {
    validateAndSubmitForm()
  });

  $("#email, #email2").placeholder();

  $("#pre_reg_button-top").live('click', function() {
    $("#email").val($("#email2").val());
    validateAndSubmitForm()
  });

  if($('#thumb-list').length) {
    $('#thumb-list').jcarousel();
  }

});