var app;

app = angular.module('app', ['ngResource', 'ngClipboard']);

app.config([
  'ngClipProvider', function(ngClipProvider) {
    return ngClipProvider.setPath("ZeroClipboard.swf");
  }
]);

app.factory('Address', [
  '$resource', function($resource) {
    return $resource('/api/addresses/:hash', {
      hash: '@hash'
    }, {
      query: {
        method: 'GET',
        isArray: true
      }
    });
  }
]);

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

app.controller('CurrencyCtrl', [
  '$scope', '$location', 'Address', 'Currency', function($scope, $location, Address, Currency) {
    var fetchCurrencies;
    $scope.currencies = {};
    $scope.handleClick = function(address) {
      var current;
      current = $("button[data-address=" + address + "]");
      current.removeClass('btn-info').addClass('btn-success');
      current.find('.legend').text("Copied !");
      current.find('.glyphicon').removeClass('hidden');
    };
    fetchCurrencies = function(addresses) {
      var address, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = addresses.length; _i < _len; _i++) {
        address = addresses[_i];
        _results.push(address.currency = Currency.get({}, {
          id: address.currency
        }));
      }
      return _results;
    };
    return $scope.$watch('hash', function() {
      return $scope.addresses = Address.query({
        hash: $scope.hash
      }, fetchCurrencies);
    });
  }
]);
