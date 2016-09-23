function reqQuery(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

function loadPageIndex(pageName, callback) {
  $container = $("#container")
  $.ajax({
    url: pageName + '/index.html'
  }).done(function(data) {
    $container.html(data)
    callback()
  }).fail(function() {
    $container.html('<h1>File does not exist</h1>')
  })
}

function loadPage(pageName, langId) {
  $pageContainer = $('#pageContainer')
  $.ajax({
    url: pageName + '/' + langId + '/' + langId + '.md'
  }).done(function(data) {
    //try {
      $pageContainer.html(markdown.toHTML(data,'Maruku'))
      formatPage(pageName, langId)
    //} catch (err) {

    //}
  }).fail(function() {
    console.log('loadPage fail')
    loadPage(pageName, 'en')
  });
}

function loadLangConfig(pageName, langId) {
  $pageContainer = $('#pageContainer')
  $.ajax({
    url: 'lang_config.txt'
  }).done(function(data) {
    var configArray = data.split('\n')
    var langSelectStr = ''
    var search = 'page=' + pageName + '&lang='
    configArray = $.grep(configArray, function(n, i) {
      return $.trim(n) != "";
    });
    try {
      $.each(configArray, function(i, v) {
        var langInfo = v.split(':')
        var selectLang = $.trim(langInfo[0])

        if (selectLang == langId) {
          if (langInfo.length > 2) {
            $("#langLabel").html(langInfo[2] + ':')
          }
          langSelectStr += '<option value="' + selectLang + '" selected>' + langInfo[1] + '</option>'
        } else {
          langSelectStr += '<option value="' + selectLang + '">' + langInfo[1] + '</option>'
        }

      })
      $("#langSelect").html(langSelectStr).bind('change', function() {
        window.location.search = search + $(this).val()
      })
    } catch (err) {

    }
  }).fail(function() {
    console.log('loadPage fail')
    loadPage(pageName, 'en')
  });
}

function formatPage(pageName, langId) {
  $('img').each(function() {
    $this = $(this)
    var src = $this.attr('src')
    var enImg = pageName + '/en/' + src
    $this.attr('src', pageName + '/' + langId + '/' + src)
      .addClass('img-responsive')
      .attr('onerror', "this.src='" + enImg + "';this.onerror='return true'")
  })
  document.title = $('h1:first').text() || "UM2"
  $('table').addClass('table table-bordered')
}

$(function() {
  var pageName = reqQuery('page');
  var langId = reqQuery('lang') || 'en';
  loadLangConfig(pageName, langId)
  if (pageName == null) {
    $('.index').removeClass('hide')
    $('#navbar').addClass('hide')
      //$('#container').html('<h1>File does not exist</h1>')
  } else {
    loadPageIndex(pageName, function() {
      loadPage(pageName, langId)
    })
  }


})