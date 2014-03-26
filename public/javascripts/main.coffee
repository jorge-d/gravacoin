app = angular.module('indexApp', ['ngResource'])

app.factory('Currency', ['$resource',
  ($resource)->
    $resource '/api/currencies/:id' , {id: '@id'}, query: {method:'GET', isArray:true}
  ]
)

app.controller('IndexCtrl', ['$scope', '$timeout', 'Currency', ($scope, $timeout, Currency)->
  idx = 0

  currencySlide = ->
    $scope.currency = $scope.currencies[idx].name

    idx += 1
    idx = 0 if idx >= $scope.currencies.length

    $timeout currencySlide, 1500

  $scope.currencies = Currency.query currencySlide
])
