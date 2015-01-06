/**
 * Adds a 'yt-scrollfix' class to the element when the page scrolls past it's position.
 * @param [offset] {int} optional Y-offset to override the detected offset.
 *   Takes 300 (absolute) or -300 or +300 (relative to detected)
 */
define([], function () {
angular.module('ytScrollfixDirective', []).directive('ytScrollfix', [
  '$window',
  '$log',
function ($window, $log) {
  return {
    require: '^?ytScrollfixTarget',
    link: function (scope, elm, attrs, ytScrollfixTarget) {
      var top = elm[0].offsetTop,
      // var top = elm.offset().top,
          $target = ytScrollfixTarget && ytScrollfixTarget.$element || angular.element($window);
      if (!attrs.ytScrollfix) {
        attrs.ytScrollfix = top;
      } else if (typeof(attrs.ytScrollfix) === 'string') {
        // charAt is generally faster than indexOf: http://jsperf.com/indexof-vs-charat
        if (attrs.ytScrollfix.charAt(0) === '-') {
          attrs.ytScrollfix = top - parseFloat(attrs.ytScrollfix.substr(1));
        } else if (attrs.ytScrollfix.charAt(0) === '+') {
          attrs.ytScrollfix = top + parseFloat(attrs.ytScrollfix.substr(1));
        }
      }

      function onScroll() {
        // $log.info(elm.offset().top);
        // if pageYOffset is defined use it, otherwise use other crap for IE
        var offset;
        if (angular.isDefined($window.pageYOffset)) {
          offset = $window.pageYOffset;
        } else {
          var iebody = (document.compatMode && document.compatMode !== 'BackCompat') ? document.documentElement : document.body;
          offset = iebody.scrollTop;
        }
        if (!elm.hasClass('yt-scrollfix') && offset > attrs.ytScrollfix) {
          elm.addClass('yt-scrollfix');
        } else if (elm.hasClass('yt-scrollfix') && offset < attrs.ytScrollfix) {
          elm.removeClass('yt-scrollfix');
        }
      }

      $target.on('scroll', onScroll);

      // Unbind scroll event handler when directive is removed
      scope.$on('$destroy', function() {
        $target.off('scroll', onScroll);
      });
    }
  };
}]);
angular.module('ytScrollfixTargetDirective', []).directive('ytScrollfixTarget', [function () {
  return {
    controller: ['$element', function($element) {
      this.$element = $element;
    }]
  };
}]);

});