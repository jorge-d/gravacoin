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

app.factory('Address', [
  '$resource', function($resource) {
    return $resource('/api/:currency/addresses', {
      currency: '@currency'
    }, {});
  }
]);

app.controller('IndexCtrl', [
  '$scope', '$timeout', 'Currency', 'Address', function($scope, $timeout, Currency, Address) {
    var currencySlide, idx;
    idx = 0;
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
