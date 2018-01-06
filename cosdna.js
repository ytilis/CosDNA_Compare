/*!
* CosDNA Compare - Tool to compare product ingredients on cosdna.com
*/

var cosDnaCompare = (function ($) {
  // Variables
  // -------------------------------------------------------------------
  var message = {
    prompt: 'Enter the URL for the CosDNA product you wish to compare',
    domain: 'Sorry! This tool currently only works for cosDNA.com!',
    nullInput: 'You need to enter a product to compare this to!',
    other: 'Oops! Something went wrong! :(',
  };

  var products = [];

  var $table = $('.iStuffTable');

  // Init - Anything you want to happen onLoad (usually event bindings)
  // -------------------------------------------------------------------
  var init = function () {
    // If this is our first time running (we haven't saved a product yet)
    if ( products.length === 0 ) {
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
        
        // Add a new table header
        $table.find('tr:first-child').append(`<td class="iStuffList">Matches</td>`);

        // Remove product elements which no longer apply
        $('.Ing_ProdDesc, .Ing_ProdImgOuter, .Ing_Comment, .Ing_ProdImgsOuter, #ing_reviewbar').remove();
        $('.member_name').parent().remove();
      }

      return true;
    }
  };
  
  var saveProduct = function(url, $dom){
    var alreadySaved = !!products.filter(product => product.url === url.href).length;
    
    if (!alreadySaved) {
      var name = $dom.find('.ProdTitle').text();
      var link = $('<a>').attr('target', '_blank').attr('href', url.href).text( name ).prop('outerHTML');
      
      products.push({
        url: url.href,
        link: link,
        name: name,
        ingredients: getIngredients( $dom ),
      });
    }

    if ( products.length > 1 ) {
      showComparison();      
    }
  };

  var showComparison = function(){
    // Wipe the current table
    $table.find('tr:nth-child(n+2)').remove();
    
    $.each(products, function(pindex, product){
      $.each(product.ingredients, function(iIndex, ingredient){
        var $exists = $table.find('[data-name="'+ ingredient.name +'"]');
        if ($exists.length === 0) {
          $table.append(ingredient.html);
        } else {
          var matches = (parseInt($exists.attr('data-cc-match')) || 0) + 1;
          ingredient.name == 'Tansy' && console.log(ingredient.name, $exists.attr('data-cc-match'), matches);
          $exists
            .attr('data-cc-match', matches)
            .find('.cc-matches').html(matches);
        }
      });
    });
    // TODO: Add list of matched products to a popover on the right of the table
    
    // Show the comparison overview
    showOverview($table);
  };

  // Show Overview - Show the product comparison from the AJAX fetched page
  // -------------------------------------------------------------------
  var showOverview = function($table){
    // Add overview block if this is our first time running on the page
    if( products.length <= 2 ) $('<div class="cc-overview">').insertBefore($table);
    
    var matches = 0;
    
    $('[data-cc-match]').each((index, ele) => {
      matches += parseInt($(ele).attr('data-cc-match'));
    });

    var $overview = $('.cc-overview');
    $overview.empty().html(`<strong>${matches}</strong> matching ingredients across <strong>${products.length}</strong> products: <ul></ul>`);
    $.each(products, function(pindex, product){
      // Build link to second product
      var link = $('<a>').attr('target', '_blank').attr('href', product.url).text( product.name ).prop('outerHTML');
      
      // Add the number of matches with the link to the other product
      $('.cc-overview ul').append(`<li>${link}</li>`);
    });
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
        // Save the table row 
        var $tr = $(this).parent();
        
        $tr
          // Add a data-attribute matching the name to it          
          .attr('data-name', $(this).text())
          // Add a column for number of matches
          .append(`<td nowrap class="cc-matches"></td>`);

        // Save the ingredient name and the html row
        results.push({
          name: $(this).text(),
          html: $tr.prop('outerHTML'),
        })
      });

    return results;
  };



  // CLEANUP
  // ===================================================================

  // Return - Which variables and objects to make available publicly
  // -------------------------------------------------------------------
  return {
    init              : init
  };
})(jQuery);
