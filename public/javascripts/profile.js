var app;

app = angular.module('app', ['ngResource', 'ngClipboard', 'monospaced.qrcode']);

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

app.controller('IndexCtrl', [
  '$scope', '$location', '$timeout', 'Address', 'Currency', function($scope, $location, $timeout, Address, Currency) {
    $scope.handleClick = function(currency) {
      var el, old_text;
      el = $("button[data-currency=" + currency + "]");
      old_text = el.find('.small').text();
      el.find('.small').text('Copied !');
      el.find('.glyphicon-link').addClass('hidden');
      el.find('.glyphicon-ok').removeClass('hidden');
      el.removeClass('btn-warning').addClass('btn-success');
      return $timeout(function() {
        el.find('.small').text(old_text);
        el.addClass('btn-warning').removeClass('btn-success');
        el.find('.glyphicon-link').removeClass('hidden');
        return el.find('.glyphicon-ok').addClass('hidden');
      }, 1500);
    };
    $scope.address_for_currency = function(currency) {
      var address, _i, _len, _ref;
      if (!currency) {
        return '';
      }
      _ref = $scope.addresses;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        address = _ref[_i];
        if (address.currency.symbol === currency) {
          return address.address;
        }
      }
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
