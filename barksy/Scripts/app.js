(function () {
    'use strict';

    /* Instantiate application */
    /* Injections: ngRoute: page routing */
    /*             ngFileUpload: Plug-in for easy file uploading */
    /*             ngTagsInput: Plug-in for tags that plays nice with Bootstrap */

    var myApp = angular.module('app', ['ngRoute', 'ngFileUpload', 'ngTagsInput']);

    /* Configure the routes */

    myApp.config(function ($routeProvider) {
        $routeProvider.when('/', {
            controller: 'FileUploadController as fileUpload',
            templateUrl: 'upload.html'
        }).when('/files', {
            controller: 'FileDisplayController as fileDisplay',
            templateUrl: 'display.html'
        }).when('/contact', {
            templateUrl: 'contact.html'
        }).otherwise({
            template: "<p>Oops! Something went wrong. You shouldn't be here.</p>"
        });
    });

    /* Controllers */

    /* FileUploadController                                                         */
    /* Injections:                                                                  */
    /*      Upload: File upload service from ngFileUpload                           */
    /*      fileService: File services provided in this module                      */
    /*      $location: Angular $location service                                    */
    /* Properties:                                                                  */
    /*      tags: Array of tags provided by the user                                */
    /*      badTag: Boolean - true if the user has entered an invalid tag           */
    /*      serverResponse: Response received from http calls                       */
    /* Methods:                                                                     */
    /*      uploadFile: Upload the user provided file                               */
    /*      getTags: Check to see if the file has already been uploaded and get its */
    /*               tags if it has                                                 */
    /*      tagHasBadChars: Check to see if a tag contains invalid characters       */
    /*                                                                              */
    /********************************************************************************/

    myApp.controller('FileUploadController', function (Upload, filesService, $location) {
        var self = this;
        self.tags = [];
        self.badTag = false;

        self.uploadFile = function (isValid) {
            var file = self.theFile;
            var tagString = self.tags.join('|'); /* Convert tags array into pipe-delimited string */

            if (isValid) {
                file.upload = Upload.upload({
                    url: 'server/file_upload.php',
                    data: { file: file, tags: tagString }
                });

                file.upload.then(function (response) {
                    self.serverResponse = response.data.name + ' file uploaded successfully at ' + response.data.uploadDate + ' with tags: ' + response.data.tags;
                    $location.path('/files');
                }, function (response) {
                    self.serverResponse = 'An error has occurred: ' + response.status + ' ' + response.statusText;
                    alert(self.serverResponse); /* In case of an error, alert the user */
                });
            }
        }

        self.getTags = function () {
            var file = self.theFile;
            var requestUrl = "server/get_tags.php";

            if (file) {
                var promise = filesService.getTagsForFileFromUrl(file, requestUrl);

                promise.then(function (response) {

                    if (response.data.tags) {
                        self.tags = response.data.tags.split('|').sort(); /* Sort the returned tags */
                    } else {
                        self.tags = [];
                    }

                    self.leftoverText = '';

                }, function (response) {
                    self.serverResponse = 'An error has occurred: ' + response.status + ' ' + response.statusText;
                    alert(self.serverResponse); /* In case of an error, alert the user */
                });
            }
        }

        self.tagHasBadChars = function (tag) {

            if (tag.text.match(/^[A-Za-z0-9-_]+$/)) {
                self.badTag = false;
            } else {
                self.badTag = true;
            }
        }
    });

    /* FileDisplayController                                                        */
    /* Injections:                                                                  */
    /*      fileService: File services provided in this module                      */   
    /* Properties:                                                                  */
    /*      filterTags: Array of tags used to filter file list                      */
    /*      serverResponse: Response from http calls                                */
    /*      sortKey: Table column to sort on                                        */
    /*      sortReverse: Boolean - true if the sort order is reversed (Z-A)         */
    /* Methods:                                                                     */
    /*      sort(key): Sets the sort properties (sortKey and sortReverse)           */
    /*      filter(file): Apply filter tags to the file record - return true to     */
    /*                    to show the file and false to hide it                     */
    /*                                                                              */
    /********************************************************************************/ 

    myApp.controller('FileDisplayController', function (filesService) {
        var self = this;
        var requestUrl = "server/list_files.php";
        var downloadUrl = 'uploads/';
        self.filterTags = [];

        var promise = filesService.getFileListFromUrl(requestUrl);

        promise.then(function (response) {
            self.fileList = response.data;
        }, function (response) {
            self.serverResponse = 'An error has occurred: ' + response.status + ' ' + response.statusText;
            alert(self.serverResponse); /* In case of an error, alert the user */
        });

        self.sortKey = 'filename';
        self.sortReverse = false;
 
        self.sort = function (key) {
            self.sortReverse = (self.sortKey == key) ? !self.sortReverse : self.sortReverse;
            self.sortKey = key;
        }

        self.filter = function (file) {
            var showFile = true;
            var i;

            for (i = 0; i < self.filterTags.length; i++) {
                showFile = showFile && (file.tags.indexOf(self.filterTags[i]) >= 0);
            }

            return showFile;
        }
    });

    /* Services */

    /* fileService                                                          */
    /* Injections:                                                          */
    /*      $http: Angular $http service                                    */
    /*      $q: Angular $q service                                          */
    /* Methods:                                                             */
    /*      getFileListFromUrl: Get list of uploaded files                  */
    /*      getTagsForFileFromUrl: Get list of tags for an uploaded file    */
    /************************************************************************/

    myApp.service('filesService', function ($http, $q) {
        var self = this;

        self.getFileListFromUrl = function (requestUrl) {
            var deferred = $q.defer();

            $http.post(requestUrl, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(function (response) {
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        }

        self.getTagsForFileFromUrl = function (file, requestUrl) {
            var fileFormData = new FormData();
            fileFormData.append('file', file);

            var deferred = $q.defer();
            $http.post(requestUrl, fileFormData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(function (response) {
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        }
    });
})();