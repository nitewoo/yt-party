define([
  '_services/dict'
], function (dict) {
angular.module('matcherService', [])
  .factory('matcher', function () {
    // targetString 'abc陈承星'
    // queryString may contain space, when space(s) is located, it's deemed to be multiple matching. It should be authentic when all queries matched.
    // [PROCESS] First, we need to solve targetString. For example, we solve 'abc陈承星' to ['abc陈承星', 'abcchenchengxing', 'a', 'b', 'c', 'chen', 'cheng', 'xing']. Then regarding to queryString, we split it using space in case we have multiple queries. If we're facing mutiple queries, it will be authentic only when all queries match the targetString individually. Here's how things is going on when one query item matching the target. It is divided into two branches. One is that Chinese character is in the query item, we simply match the origin target, which resulted in the resolved array. We can retrieve that using `array[0]`. In this condition, when matches, it is done. The other one is more complicated. If no chinese character in the query item, we make a match to the second item in the resolved array, which is resolved by dict.js if any chinese character is in the target string. When matched, we want to make sure that match is the beginning of some word.
    var match = function (queryString, targetString) {
      var resolvedArray = resolveTargetString(targetString);
      var _queryString = queryString && queryString.toLowerCase() || '';
      return matchResolvedArray(_queryString, resolvedArray)
    }
    // solvedStringArray is something like this:
    // origin: 'abc陈承星'
    // solved: ['abc陈承星', 'abcchenchengxing', 'a', 'b', 'c', 'chen', 'cheng', 'xing']
    var matchResolvedArray = function (queryString, resolvedArray) {
      var items = queryString.split(' ');
      var index = 0;
      while (matchItem(items[index], resolvedArray) && index < items.length) {
        index ++;
      }
      if (index < items.length) {
        return false;
      }
      return true;
    }
    // macth query item
    var matchItem = function (queryItem, resolvedArray) {
      if (isChChar(queryItem)) {
        return resolvedArray[0].indexOf(queryItem) !== -1;
      } else {
        var reg = new RegExp(queryItem, 'g');
        var match;
        var resolvedString = resolvedArray[1];
        var flag = false;
        do {
          match = reg.exec(resolvedString);
          if (match != null) {
            flag = true;
          }
        } while (match && !flag);
        return flag;
        // if (matches.length) {
        //   for (var i = 0; i < matches.length; i++) {
        //     var match = matches[i];
        //   };
        // } else {
        //   return false;
        // }
      }
    }
    // function that resolve the target string
    var resolveTargetString = function (targetString) {
      var result = new Array(targetString.length + 2);
      result[0] = targetString.toLowerCase();
      var secondaryString = '';
      for (var i = 0; i < targetString.length; i++) {
        var ch = targetString[i];
        if (isChChar(ch)) {
          // result.splice(result.length - 1, 0, dict[ch]);
          result[i + 2] = dict[ch];
          secondaryString = secondaryString + dict[ch];
        } else {
          // result.splice(result.length - 1, 0, ch);
          result[i + 2] = ch.toLowerCase();
          secondaryString = secondaryString + ch.toLowerCase();
        }
      }
      // result.splice(1, 0, secondaryString);
      result[1] = secondaryString;
      return result;
    }
    // Chinese Character?
    var CHINESE_REG = /[\u4E00-\u9FA5]/;
    var isChChar = function (input) {
      return CHINESE_REG.test(input);
    }
    return {
      match: match,
      matchResolvedArray: matchResolvedArray
    }
  });
});
