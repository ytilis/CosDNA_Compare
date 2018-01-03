/*!
* CosDNA Compare - Tool to compare product ingredients on cosdna.com
*/

var cosDnaCompare = (function ($) {
  // Variables
  // -------------------------------------------------------------------
  var loaded = false;
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
    var hostname = window.location.hostname;

    // Make sure we're on CosDNA
    if( hostname.indexOf('cosdna.com') >= 0 ){
      // Get product 2 from user
      var product2 = prompt( message.prompt );

      // Make sure the user filled out the prompt
      if(product2){
        hostname = $('<a>').attr('href', product2).get(0).hostname;

        // Make sure they entered a CosDNA link into the prompt
        if (hostname.indexOf('cosdna.com') >= 0  && product2 != null) {
          compareProducts(product2);
        } else {
          alert( message.domain );
        }
      } else {
        alert( message.nullInput );
      }
    } else {
      alert( message.domain );
    }
  };



  // FUNCTIONS
  // ===================================================================

  // Compare Products - Kickoff function for the comparison
  // -------------------------------------------------------------------
  var compareProducts = function( url ){
    // Get the ingredients on this page
    var product1 = getIngredients( $('html') );

    $('.iStuffTable tr').removeClass('cc-match');

    // Fetch the page we're comparing
    $.ajax({
        type: 'GET',
        url: url,
        error: function(xhr,status,error) {
          alert( message.other );
        },
        success: function(data, status, xhr) {
          var vDom = document.createElement( 'div' );
          vDom.innerHTML = data;

          // Get the ingredients from the other page
          var product2 = getIngredients( $(vDom) );

          // Find matches
          var output = matchArrays( product1.sort(), product2.sort() );

          // Show the comparison overview
          showOverview( $(vDom), url, output.matching );

          // Show matches
          showMatches( output.matching );

          loaded = true;
        }
    });
  };

  // Show Overview - Show the product comparison from the AJAX fetched page
  // -------------------------------------------------------------------
  var showOverview = function( $dom, url, matches ){
    var overview = $dom.find('.ProdTitle').text();

    // Add overview block if this is our first time running on the page
    if( !loaded ) $('<div class="cc-overview">').insertBefore('.iStuffTable');

    // Build link to second product
    var link = $('<a>').attr('target', '_blank').attr('href', url).text( overview );

    // Add the number of matches with the link to the other product
    $('.cc-overview').empty().html( "<strong>" + matches.length + "</strong> matches with: " ).append( link );
  };

  // Get Ingredients - Takes DOM node containing ingredients table and spits out an array
  // -------------------------------------------------------------------
  var getIngredients = function( $dom ){
    var results = [];
    $dom.find('.iStuffTable .iStuffETitle').each(function(){
      results.push($(this).text())
    });

    return results;
  };

  // Splice Value - Remove item from array by value
  // -------------------------------------------------------------------
  var spliceValue = function( arr, val ){
    var index = arr.indexOf( val );
    if (index >= 0) {
      arr.splice( index, 1 );
    }

    return arr;
  };

  // Match Arrays - Compares the ingredient arrays and returns an object of matches
  // -------------------------------------------------------------------
  var matchArrays = function(list1, list2){
    var match = [],
        diffList1 = list1.slice(),
        diffList2 = list2.slice();

    for(var i = 0; i < list1.length; i++){
      var product = list1[i];

      var matched = list2.indexOf( product );

      if( matched >= 0 ){
        match.push(product);

        // Remove it from the other arrays so we have more diff data
        spliceValue(diffList1, product);
        spliceValue(diffList2, product);
      }
    }

    return {
      matching: match,
      list1: diffList1,
      list2: diffList2
    };
  };

  // Show Matches - Highlights matching ingredients in the table on the page
  // -------------------------------------------------------------------
  var showMatches = function(matches){
    if( matches.length > 0 ){
      $('.iStuffTable .iStuffETitle').each(function(){
        var matched = matches.indexOf( $(this).text() );

        if( matched >= 0 ){
          $(this).parent().addClass('cc-match');
        }
      });

      //alert( message.matches.replace('{#}', matches.length) );
    } else {
      //alert( message.noMatches );
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
