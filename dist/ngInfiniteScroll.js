(function () {
    'use strict';
    (angular.module('ngInfiniteScroll', ['ng'])).directive('ngInfiniteScroll', [

        function () {

            var PagerFactory = function () {
                this.limit = 50; //Number of records per page
                this.offset = 0; //Current Page
                this.direction = undefined; //Order
                this.property = ''; //sorted column
            };

            return {
                restrict: 'E',
                template: function (element, attrs) {

                    var html = '';
                    html += '<div ng-show="ngModel.content.length > 0">';
                    html += '  <div class="grid">';
                    html += '    <table class="ui single line table">';
                    html += '      <thead>';
                    html += '        <tr>';
                    html += '          <th ng-show="ngCheckbox"><input type="checkbox" ng-click="selectAll()" /></th>';
                    html += '          <th ng-repeat="($key, $header) in ngHeader" ng-click="sort($key)">{{$header}}';
                    html += '            <span class="fa fa-sort" ng-show="ngFilter.property==$key" ng-class="{\'fa fa-sort-asc\':ngFilter.direction === \'ASC\',\'fa fa-sort-desc\':ngFilter.direction === \'DESC\'}"></span>';
                    html += '          </th>';
                    html += '        </tr>';
                    html += '      </thead>';
                    html += '      <tbody>';
                    html += '        <tr ng-repeat="$obj in ngModel.content" ng-include="ngTemplate" />';
                    html += '      </tbody>';
                    html += '    </table>';
                    html += '  </div>';
                    html += '</div>';
                    html += '<div ng-show="ngModel.content.length === 0">';
                    html += '  <p style="padding-left: 30px; padding-top: 15px; font-weight: bold;">No results found.</span></p>';
                    html += '</div>';

                    return html;
                },
                scope: {
                    ngHeader: '=ngHeader',
                    ngTrigger: '=ngTrigger',
                    ngTemplate: '=ngTemplate',
                    ngService: '=ngService',
                    ngFilter: '=ngFilter',
                    ngCheckbox: '=ngCheckbox',
                    ngGetlist: '=ngGetlist',
                    ngDefaultOrder: '=ngDefaultOrder'
                },

                link: function (scope, element, attrs, ctrl) {

                    scope.ngModel = {};
                    scope.ngFilter = new PagerFactory();
                    
                    if (scope.ngDefaultOrder) {
                        scope.ngFilter.property = scope.ngDefaultOrder;
                        scope.ngFilter.direction = 'ASC';
                    }

                    scope.selectAll = function () {
                        for (var i = 0; i < scope.ngModel.content.length; i++) {
                            scope.ngModel.content[i].isChecked = !scope.ngModel.content[i].isChecked;
                        }
                    };

                    scope.sort = function (key) {
                        if (key !== 'actions') {
                            scope.ngFilter.property = key;
                            if (scope.ngFilter.direction === undefined) {
                                scope.ngFilter.direction = 'ASC';
                            } else if (scope.ngFilter.direction === 'ASC') {
                                scope.ngFilter.direction = 'DESC';
                            } else if (scope.ngFilter.direction === 'DESC') {
                                scope.ngFilter.direction = 'ASC';
                            }

                            scope.getNewsRecords();
                        }
                    };

                    scope.addRecords = function (record) {
                        if (record) {
                            if (record.content) {
                                if (!scope.ngModel.content) {
                                    scope.ngModel.content = [];
                                }
                                for (var i = 0; i < record.content.length; i++) {
                                    scope.ngModel.content.push(record.content[i]);
                                }
                                if (scope.ngFilter) {
                                    scope.ngFilter.offset = scope.ngFilter.offset + 1;
                                } else {
                                    scope.ngFilter = new PagerFactory();
                                }
                            }
                        }
                    };

                    scope.getMoreRecords = function (callback) {
                        scope.ngService(scope.ngFilter, function (result) {
                            scope.addRecords(result);
                            callback ? callback() : '';
                        });
                    };

                    scope.getNewsRecords = function () {
                        scope.ngFilter.offset = 0;
                        scope.ngService(scope.ngFilter, function (result) {
                            scope.ngModel.content = [];
                            scope.addRecords(result);
                        });
                    };

                    scope.initEvent = function () {
                        scope.getMoreRecords();
                        var progress = true;
                        $(window).off().on('scroll', function () {
                            var enabledCall = (parseInt($(element).find('.grid table').height() + $(element).find('.grid table').offset().top) >= $(window).height()) && $(element).find('.grid table').is(":visible") && scope.ngModel.content;
                            var endGrid = $(this).scrollTop() >= ($(element).find('.grid table').height() - $(element).find('.grid table').offset().top - 200);
                            if (enabledCall && endGrid && progress) {
                                progress = false;
                                scope.getMoreRecords(function(){
                                    progress = true;
                                });
                            }
                        });
                    };

                    scope.refresh = function () {
                        if (scope.ngDefaultOrder) {
                            scope.ngFilter.property = scope.ngDefaultOrder;
                            scope.ngFilter.direction = 'ASC';
                        }
                        scope.getNewsRecords();
                    };

                    scope.$watch('ngGetlist', function (value) {
                        scope.ngGetlist = scope.refresh;
                    });
                    
                    scope.initEvent();
                }
            };
        }]);
})(window, document);
