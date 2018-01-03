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
    other: 'Oops! Something went wrong! :(',
    maxCompare: 'Sorry! You can currently only compare a maximum of 5 products! Refresh the page or go to a different product to compare others. In the future this error will be fixed.',
  };

  var products = [];

  // Init - Anything you want to happen onLoad (usually event bindings)
  // -------------------------------------------------------------------
  var init = function () {
    // If this is our first time running (we haven't saved a product yet)
    console.log(products.length, products);
    if ( products.length > 5 ) {
      alert( message.maxCompare );
    } else if ( products.length === 0 ) {
      // Get what's currently on the page (if we can), then run again to grab another product if it succeeded
      getProduct(window.location) && init();
    } else {
      // Get a product to compare from user
      var productUrl = prompt( message.prompt );
      
      // Make sure the user filled out the prompt
      if( !productUrl ){
        alert( message.nullInput );
      } else {
        productUrl = $('<a>').attr('href', productUrl).get(0);  // We do this so that it turns into a Location object
        getProduct(productUrl);
      }
    }
  };



  // FUNCTIONS
  // ===================================================================

  // Get Product - Fetch a remote product url
  // -------------------------------------------------------------------
  var getProduct = function( url ){
    if (url.hostname.indexOf('cosdna.com') === -1) {
      // Make sure they entered a CosDNA link into the prompt (or we're on a CosDNA page)
      alert( message.domain );
      return false;

    } else {
      // If we already have a saved product, then we're fetching one remotely
      if (products.length > 0) {
        $.ajax({
          type: 'GET',
          url: url,
          error: function(xhr,status,error) {
            alert( message.other );
          },
          success: function(data, status, xhr) {
            var vDom = document.createElement( 'div' );
            vDom.innerHTML = data;

            var $vDom = $(vDom);

            // Get the ingredients from the other page
            saveProduct(url, $vDom);
          }
        });
      } else {
        // Get the current product page and save it
        saveProduct(url, $('html'));
      }

      return true;
    }
  };
  
  var saveProduct = function(url, $dom){
    var alreadySaved = !!products.filter(product => product.url === url.href).length;
    
    if (!alreadySaved) {
      products.push({
        url: url.href,
        name: getTitle( $dom ),
        ingredients: getIngredients( $dom ),
      });
    }

    if ( products.length > 1 ) {
      showComparison();      
    }
  };

  var showComparison = function(){
    var $table = $('.iStuffTable');
    // Wipe the current table
    $table.find('tr:nth-child(n+2)').remove();
    
    $.each(products, function(pindex, product){
      $.each(product.ingredients, function(iIndex, ingredient){
        var $exists = $table.find('[data-ingredient-name="'+ ingredient.name +'"]');
        if ($exists.length === 0) {
          $table.append(ingredient.html);
        } else {
          $exists.attr('data-cc-match', ($exists.data('cc-match') || 0) + 1);
        }
      });
    });
    // TODO: Add list of matched products to a popover on the right of the table
    
    // Show the comparison overview
    showOverview();


    // Find matches
    // var matches = matchIngredients( ...products );

    // Show matches
    // showMatches( matches );
  };

  // Show Overview - Show the product comparison from the AJAX fetched page
  // -------------------------------------------------------------------
  var showOverview = function(){
    // Add overview block if this is our first time running on the page
    if( products.length <= 2 ) $('<div class="cc-overview">').insertBefore('.iStuffTable');

    var $overview = $('.cc-overview');
    $overview.empty().html( "<strong>" + products.length + "</strong> matches with: " );
    $.each(products, function(pindex, product){
      // Build link to second product
      var link = $('<a>').attr('target', '_blank').attr('href', product.url).text( product.name );
      
      // Add the number of matches with the link to the other product
      $('.cc-overview').append( link );
    });
  };

  // 
  // -------------------------------------------------------------------
  var getTitle = function( $dom ){
    return $dom.find('.ProdTitle').text();
  };

  // Get Ingredients - Takes DOM node containing ingredients table and spits out an array
  // -------------------------------------------------------------------
  var getIngredients = function( $dom ){
    var results = [];
    $dom
      .find('.iStuffTable')                   // Read the table
      .find('tr:not("[style]")')              // Ignore rows with inline styles (hidden duplicates are sometimes here)
      .find('.iStuffETitle, .iStuffNTitle')   // Get the names, whether the ingredient is known or not
      .each(function(){
        var $tr = $(this).parent().attr('data-ingredient-name', $(this).text());

        // Save the ingredient name and the html row
        results.push({
          name: $(this).text(),
          html: $tr.get(0).outerHTML,
        })
      });

    return results;
  };

  // Match Ingredients - Compares the ingredient arrays and returns an object of matches
  // -------------------------------------------------------------------
  var matchIngredients = function(list1, list2){
    console.log(list1, list2);
    return list1.filter(i1 => list2.filter(i2 => i1.name === i2.name).length ? true : false);
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
