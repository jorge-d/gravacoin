app = angular.module('app', ['ngResource', 'ngClipboard']);

app.config(['ngClipProvider', (ngClipProvider)->
  ngClipProvider.setPath("ZeroClipboard.swf");
]);
app.factory('Address', ['$resource',
  ($resource)->
    $resource('/api/addresses/:hash', {hash: '@hash'}, {
      query: {method:'GET', isArray:true}
    });
  ]
);
app.factory('Currency', ['$resource',
  ($resource)->
    $resource('/api/currencies/:id', {id: '@id'}, {
      query: {method:'GET', isArray:true}
    });
  ]
);

app.controller('CurrencyCtrl', ['$scope', '$location', 'Address', 'Currency', ($scope, $location, Address, Currency)->
  $scope.currencies = {}

  $scope.handleClick = (address)->
    current = $("button[data-address=#{address}]")
    current.removeClass('btn-info').addClass('btn-success')
    current.find('.legend').text("Copied !")
    current.find('.glyphicon').removeClass('hidden')

    window.setInterval ()->
        current.addClass('btn-info').removeClass('btn-success')
        current.find('.legend').text("Copy to Clipboard")
        current.find('.glyphicon').addClass('hidden')
      , 2000

    return

  fetchCurrencies = (addresses)->
    for address in addresses
      address.currency = Currency.get({}, id: address.currency)

  $scope.$watch 'hash', ->
    $scope.addresses = Address.query {hash: $scope.hash}, fetchCurrencies
]);
