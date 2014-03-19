$ ->
  client = new ZeroClipboard $(".copy-button")
  client.on "load", (client)->
    client.on "complete", (client, args)->
      $(this).removeClass('btn-info').addClass('btn-success')
      $(this).find('.legend').text("Copied !")
      $(this).find('.glyphicon').removeClass('hidden')

