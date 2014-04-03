var app;

app = angular.module('app', ['ngResource', 'ngClipboard']);

app.config([
  'ngClipProvider', function(ngClipProvider) {
    return ngClipProvider.setPath("zeroclipboard/ZeroClipboard.swf");
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
  '$scope', '$location', '$timeout', 'Address', 'Currency', function($scope, $location, $timeout, Address, Currency) {
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
    $scope.handleProfileUrlClick = function() {
      var el, old_text;
      el = $('#profile_url');
      old_text = el.find('.small').text();
      el.find('.small').text('Copied !');
      el.find('.glyphicon-link').addClass('hidden');
      el.find('.glyphicon-ok').removeClass('hidden');
      return $timeout(function() {
        el.find('.small').text(old_text);
        el.find('.glyphicon-link').removeClass('hidden');
        return el.find('.glyphicon-ok').addClass('hidden');
      }, 1500);
    };
    return $scope.$watch('hash', function() {
      $scope.profile_url = 'http://gravaco.in/' + $scope.hash;
      return $scope.addresses = Address.query({
        hash: $scope.hash
      });
    });
  }
]);
