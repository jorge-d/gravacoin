var app;

app = angular.module('app', ['ngResource']);

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
    var can_submit, currencySlide, idx, resetErrors, saveAddress;
    idx = 0;
    $scope.new_address = {};
    $scope.error = {};
    can_submit = true;
    $scope.error_response = "";
    $scope.error_response = "";
    resetErrors = function() {
      $scope.error_response = "";
      $scope.success_response = "";
      $scope.error.currency = '';
      $scope.error.address = '';
      return $scope.error.email = '';
    };
    saveAddress = function() {
      can_submit = false;
      return Address.save({
        currency: $scope.new_address.currency
      }, {
        email: $scope.new_address.email,
        address: $scope.new_address.address
      }, function(response) {
        $scope.success_response = true;
        $scope.new_address = {};
        return can_submit = true;
      }, function(error) {
        can_submit = true;
        return $scope.error_response = error.data.error;
      });
    };
    $scope.createAddress = function() {
      resetErrors();
      if (!$scope.new_address.currency) {
        return $scope.error.currency = 'has-error';
      } else if (!$scope.new_address.email) {
        return $scope.error.email = 'has-error';
      } else if (!$scope.new_address.address) {
        return $scope.error.address = 'has-error';
      } else {
        resetErrors();
        if (can_submit) {
          return saveAddress();
        }
      }
    };
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
