var app;

app = angular.module('indexApp', ['ngResource']);

app.factory('Currency', [
  '$resource', function($resource) {
    return $resource('/api/currencies/:id', {
      id: '@id'
    }, {
      query: {
        method: 'GET',
        isArray: true
      }
    });
  }
]);

app.controller('IndexCtrl', [
  '$scope', '$timeout', 'Currency', function($scope, $timeout, Currency) {
    var currencySlide, idx;
    idx = 10;
    currencySlide = function() {
      $scope.currency = $scope.currencies[idx].name;
      idx += 1;
      if (idx >= $scope.currencies.length) {
        idx = 0;
      }
      return $timeout(currencySlide, 1500);
    };
    return $scope.currencies = Currency.query(currencySlide);
  }
]);
