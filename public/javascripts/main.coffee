app = angular.module('indexApp', ['ngResource'])

app.factory('Currency', ['$resource',
  ($resource)->
    $resource '/api/currencies/:id' , {id: '@id'}, query: {method:'GET', isArray:true}
  ]
)
app.factory('Address', ['$resource',
  ($resource)->
    $resource('/api/:currency/addresses', {currency: '@currency'}, {})
  ]
);

app.controller('IndexCtrl', ['$scope', '$timeout', 'Currency', 'Address', ($scope, $timeout, Currency, Address)->
  idx = 0

  currencySlide = ->
    $scope.currency = $scope.currencies[idx].name

    idx += 1
    idx = 0 if idx >= $scope.currencies.length

    $timeout currencySlide, 1500

  $scope.currencies = Currency.query currencySlide
])
