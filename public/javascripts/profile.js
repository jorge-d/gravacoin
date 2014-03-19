var app;

app = angular.module('app', ['ngResource', 'ngClipboard']);

app.config([
  'ngClipProvider', function(ngClipProvider) {
    return ngClipProvider.setPath("ZeroClipboard.swf");
  }
]);

app.factory('Address', [
  '$resource', function($resource) {
    return $resource('api/addresses/:hash', {
      hash: '@hash'
    }, {
      query: {
        method: 'GET',
        isArray: true
      }
    });
  }
]);

app.controller('CurrencyCtrl', [
  '$scope', '$location', 'Address', function($scope, $location, Address) {
    $scope.handleClick = function(address) {
      var current;
      current = $("button[data-address=" + address + "]");
      current.removeClass('btn-info').addClass('btn-success');
      current.find('.legend').text("Copied !");
      current.find('.glyphicon').removeClass('hidden');
    };
    return $scope.$watch('hash', function() {
      return $scope.addresses = Address.query({
        hash: $scope.hash
      });
    });
  }
]);
