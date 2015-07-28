/*!
* CosDNA Compare - Tool to compare product ingredients on cosdna.com
*/

var cosDnaCompare = (function ($) {
  // Variables
  // -------------------------------------------------------------------
  var message = {
    prompt: 'Enter the URL for the CosDNA product you wish to compare',
    matches: '{#} exact matching ingredients found!',
    noMatches: 'No exact matching ingredients found!',
    domain: 'Sorry! This tool currently only works for cosDNA.com!',
    nullInput: 'You need to enter a product to compare this to!',
    other: 'Oops! Something went wrong! :('
  };



  // Init - Anything you want to happen onLoad (usually event bindings)
  // -------------------------------------------------------------------
  var init = function () {
    // Make sure we're on CosDNA
    if( window.location.hostname !== 'cosdna.com'){
      alert( message.domain );
    } else {
      var product2 = prompt( message.prompt );

      // Make sure the user filled out the prompt
      if(product2){
        var hostname = $('<a>').attr('href', product2).attr('hostname');

        // Make they entered a CosDNA link into the prompt
        if (hostname === 'cosdna.com' && product2 != null) {
          compareProducts(product2);
        } else {
          alert( message.domain );
        }
      } else {
        alert( message.nullInput );
      }
    }
  };



  // FUNCTIONS
  // ===================================================================

  // Compare Products - Kickoff function for the comparison
  // -------------------------------------------------------------------
  var compareProducts = function( product2 ){
    // Get the ingredients on this page
    var product1 = getIngredients( $('html') );

    // Fetch the page we're comparing
    $.ajax({
        type: 'GET',
        url: product2,
        error: function(xhr,status,error) {
          alert( message.other );
        },
        success: function(data, status, xhr) {
          var vDom = document.createElement( 'div' );
          vDom.innerHTML = data;

          // Get the ingredients from the other page
          product2 = getIngredients( $(vDom) );

          // Find matches and show them
          showMatches( matchArrays( product1.sort(), product2.sort() ).matching );
        }
    });
  };

  // Get Ingredients - Takes DOM node contaihning ingredients table and spits out an array
  // -------------------------------------------------------------------
  var getIngredients = function( $dom ){
    var results = [];
    $dom.find('.iStuffTable .iStuffETitle').each(function(){
      results.push($(this).text())
    });

    return results;
  };

  // Match Arrays - Compares the ingredient arrays and returns an object of matches
  // -------------------------------------------------------------------
  var matchArrays = function(list1, list2){
    var match = [];

    $.each(list1, function( index1, prod1 ) {
      $.each(list2, function( index2, prod2 ) {
        if( prod1 === prod2){
          match.push(prod2);

          list1.splice(index1, 1);
          list2.splice(index2, 1);
        }
      });
    });

    return {
      matching: match,
      list1: list1,
      list2: list2
    };
  };

  // Show Matches - Highlights matching ihngredients in the table on the page
  // -------------------------------------------------------------------
  var showMatches = function(matches){
    if( matches.length > 0 ){
      $('.iStuffTable .iStuffETitle').each(function(){
        var matched = matches.indexOf( $(this).text() );

        if( matched >= 0 ){
          $(this).parent().css({ 'backgroundColor': 'khaki' });
        }
      });

      alert( message.matches.replace('{#}', matches.length) );
    } else {
      alert( message.noMatches );
    }
  };



  // CLEANUP
  // ===================================================================

  // Return - Which variables and objects to make available publicly
  // -------------------------------------------------------------------
  return {
    init              : init
  };
})(jQuery);


cosDnaCompare.init();
