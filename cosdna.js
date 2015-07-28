javascript:(function(){
  var message = {
    prompt: 'Enter the URL for the CosDNA product you wish to compare',
    matches: '{#} exact matching ingredients found!',
    noMatches: 'No exact matching ingredients found!',
    domain: 'Sorry! This tool currently only works for cosDNA.com!',
    nullInput: 'You need to enter a product to compare this to!',
    other: 'Oops! Something went wrong! :('
  };

  var getIngredients = function( $dom ){
    var results = [];
    $dom.find('.iStuffTable .iStuffETitle').each(function(){
      results.push($(this).text())
    });

    return results;
  };

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


  var init = function(product2){
    var product1 = getIngredients( $('html') );

    $('.iStuffTable .iStuffETitle').each(function(){
      product1.push($(this).text())
    });

    $.ajax({
        type: 'GET',
        url: product2,
        error: function(xhr,status,error) {
          alert( message.other );
        },
        success: function(data, status, xhr) {
          var vDom = document.createElement( 'div' );
          vDom.innerHTML = data;

          product2 = getIngredients( $(vDom) );

          showMatches( matchArrays( product1.sort(), product2.sort() ).matching );
        }
    });
  }

  if( window.location.hostname !== 'cosdna.com'){
    alert( message.domain );
  } else {
    var product2 = prompt( message.prompt );

    if(product2){
      var hostname = $('<a>').attr('href', product2).attr('hostname');

      if (hostname === 'cosdna.com' && product2 != null) {
        init(product2);
      } else {
        alert( message.domain );
      }
    } else {
      alert( message.nullInput );
    }
  }
})();
