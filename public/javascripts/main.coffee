app = angular.module('app', ['ngResource'])

app.factory('Currency', ['$resource',
  ($resource)->
    $resource '/api/currencies/:id' , {id: '@id'}, query: {method:'GET', isArray:true}
  ]
)
app.factory('Address', ['$resource',
  ($resource)->
    $resource('/api/:currency/addresses', {currency: '@currency'}, {})
  ]
)

app.controller('IndexCtrl', ['$scope', '$timeout', 'Currency', 'Address', ($scope, $timeout, Currency, Address)->
  idx = 0
  $scope.new_address = {}
  $scope.error = {}
  can_submit = true
  $scope.error_response = ""
  $scope.error_response = ""

  resetErrors = ->
    $scope.error_response = ""
    $scope.success_response = ""

    $scope.error.currency = ''
    $scope.error.address = ''
    $scope.error.email = ''

  saveAddress = ->
    can_submit = false
    Address.save(
        {currency: $scope.new_address.currency}
      ,
        {
          email: $scope.new_address.email,
          address: $scope.new_address.address
        }
      , (response) ->
        $scope.success_response = true
        $scope.new_address = {}
        can_submit = true
      , (error) ->
        can_submit = true
        $scope.error_response = error.data.error
    )

  $scope.createAddress = ->
    resetErrors()

    if !$scope.new_address.currency
      $scope.error.currency = 'has-error'
    else if !$scope.new_address.email
      $scope.error.email = 'has-error'
    else if !$scope.new_address.address
      $scope.error.address = 'has-error'
    else
      resetErrors()
      saveAddress() if can_submit

  currencySlide = ->
    $scope.currency = $scope.currencies[idx].name

    idx += 1
    idx = 0 if idx >= $scope.currencies.length

    $timeout currencySlide, 1500

  $scope.currencies = Currency.query currencySlide
])
