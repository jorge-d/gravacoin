var app;

app = angular.module('app', ['ngResource', 'ngClipboard']);

app.config([
  'ngClipProvider', function(ngClipProvider) {
    return ngClipProvider.setPath("ZeroClipboard.swf");
  }
]);

app.factory('Address', [
  '$resource', function($resource) {
    return $resource('/api/:hash', {
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
    $scope.handleClick = function(currency) {
      var current;
      current = $("button[data-currency=" + currency + "]");
      current.removeClass('btn-info').addClass('btn-success');
      current.find('.legend').text("");
      current.find('.glyphicon').removeClass('hidden');
      window.setInterval(function() {
        current.addClass('btn-info').removeClass('btn-success');
        current.find('.legend').text("Copy to Clipboard");
        return current.find('.glyphicon').addClass('hidden');
      }, 2000);
    };
    return $scope.$watch('hash', function() {
      return $scope.addresses = Address.query({
        hash: $scope.hash
      });
    });
  }
]);
