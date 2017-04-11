/// <reference path="../Scripts/jquery-3.1.1.min.js" />
/// <reference path="../Scripts/knockout-3.4.2.js" />
/// <reference path="../Scripts/knockout.validation.min.js" />
/// <reference path="../bootstrap.min.js" />
/// <reference path="../jquery.unobtrusive-ajax.min.js" />
/// <reference path="../toastr.min.js" />
/// <reference path="../bootbox.min.js" />

$(document).ready(function () {

    const apiKey = "?api_key=24153d5c-172c-4440-a3e5-5e3e0b1a51fc";
    const url = "http://test.semmweb.com/sparql-cabinet/api/sparql/queries";

    var QueryViewModel = function () {
        self = this;
        self.id = ko.observable("").extend({
            required: true,
            pattern: {
                message: 'Invalid (A-Z, a-z, 0-9,underscore,dash - Characters Allowed).',
                params: /^([a-zA-Z0-9_-]+)$/
            }
        });
        self.creator = ko.observable("").extend({ required: true });
        self.description = ko.observable("");
        self.name = ko.observable("").extend({ required: true });
        self.query = ko.observable("").extend({ required: true });
        self.errors = ko.validation.group({
            id: self.id,
            name: self.name,
            creator: self.creator,
            query: self.query
        });
    };

    var CreateQVMObject = function (data) {
        var newObj = new QueryViewModel();
        if (data && data.id) {
            newObj.id(data.id);
            newObj.creator(data.creator);
            newObj.description(data.description);
            newObj.name(data.name);
            newObj.query(data.query);
        }
        return newObj;
    };

    var MainViewModel = function () {
        var self = this;

        /*Variables*/
        self.SingleQueryData = ko.observable(CreateQVMObject());
        self.OriginalSingleQueryData = ko.toJS(CreateQVMObject());
        self.OriginalQueryList = [];
        self.QueryList = ko.observableArray([]);
        self.IsNew = ko.observable(false);
        self.SearchText = ko.observable("");
        self.ShowListPage = ko.observable(true);
        self.IsEdit = ko.observable(false);
        self.loading = ko.observable(false);
        /*Variables*/

        /*Functions*/
        //Function to open List page
        self.LoadQueryList = function () {
            self.loading(true);
            self.QueryList.removeAll();
            self.OriginalQueryList.length = 0;
            self.ShowListPage(false);
            self.SearchText("");
            self.SingleQueryData(CreateQVMObject());
            self.OriginalSingleQueryData = ko.toJS(CreateQVMObject());
            self.IsNew(false);
            self.IsEdit(false);

            /* AJAX call to get data */
            $.ajax({
                type: "GET",
                url: url + apiKey,
                cache: false,
                dataType: "json",
                success: function (dataFromServer) {
                    var sortedData = dataFromServer.slice(0); // to sort the data acc to id
                    sortedData.sort(function (a, b) {
                        var x = a.id.toLowerCase();
                        var y = b.id.toLowerCase();
                        return x < y ? -1 : x > y ? 1 : 0;
                    });

                    ko.utils.arrayPushAll(self.QueryList(), sortedData);    //to prevent flashing of ui
                    self.QueryList.valueHasMutated();
                    self.OriginalQueryList = self.OriginalQueryList.concat(sortedData);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    bootbox.alert("Some error occured. Please try again");
                    console.error(textStatus + errorThrown); //To check error on console.
                },
                complete: function () {
                    self.ShowListPage(true);
                    $('#search_text_input').focus();
                    self.loading(false);
                },
            });
        };

        //Function to open View and Edit page
        self.OpenDetailsPage = function (isEdit, data) {
            self.loading(true);
            self.OriginalQueryList.length = 0;
            self.ShowListPage(true);
            self.IsEdit(!isEdit);
            self.QueryList.removeAll();
            self.SingleQueryData(CreateQVMObject());
            self.OriginalSingleQueryData = ko.toJS(CreateQVMObject());
            self.IsNew(true);
            self.SearchText("");
            if (data != undefined && data != null) {
                var id = ko.toJS(data).id;

                /* AJAX call to get data with id*/
                $.ajax({
                    type: "GET",
                    url: url + "/" + id + apiKey,
                    cache: false,
                    dataType: "json",
                    success: function (dataFromServer) {
                        self.SingleQueryData(CreateQVMObject(dataFromServer));
                        self.OriginalSingleQueryData = ko.toJS(CreateQVMObject(dataFromServer));
                        self.IsNew(false);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        switch (jqXHR.status) {
                            case 400:
                                toastr.error("Invalid request. Please try again");
                                break;
                            case 404:
                                toastr.error("Id not found. Please try again");
                                break;
                            default:
                                toastr.error("Some error occured. Please try again");
                        }
                        console.error(jqXHR.status + errorThrown); //To check error on console.
                        self.LoadQueryList();
                    },
                    complete: function () {
                    },
                });
            }
            //To deal with UI refresh issues
            self.IsEdit(isEdit);
            self.ShowListPage(false);
            self.loading(false);
        };

        //Function to handle Search
        self.search = function (searchtext) {
            // remove all the entries, which removes them from the view
            self.QueryList.removeAll();
            var tempArray = [];

            self.OriginalQueryList.forEach(function (q) {
                if (q.id.toLowerCase().indexOf(searchtext.toLowerCase()) >= 0 ||
                q.name.toLowerCase().indexOf(searchtext.toLowerCase()) >= 0 ||
                q.description.toLowerCase().indexOf(searchtext.toLowerCase()) >= 0 ||
                q.creator.toLowerCase().indexOf(searchtext.toLowerCase()) >= 0 ||
                q.query.toLowerCase().indexOf(searchtext.toLowerCase()) >= 0) {
                    tempArray.push(q);
                }
            });
            ko.utils.arrayPushAll(self.QueryList(), tempArray);
            self.QueryList.valueHasMutated();
            $('#search_text_input').focus();
            tempArray.length = 0;
        };
        self.SearchText.subscribe(self.search);

        //Function to handle Back
        self.Back = function (data) {
            if (!self.IsEdit()) {
                self.LoadQueryList();
            }
            else {
                self.CancelEdit(data);
            }
        };

        //Function to save new Query or update existing
        self.SaveQuery = function () {
            if (!self.SingleQueryData().id.isValid() || !self.SingleQueryData().name.isValid() || !self.SingleQueryData().creator.isValid() || !self.SingleQueryData().query.isValid()) {
                if (self.SingleQueryData().errors().length > 0) {
                    self.SingleQueryData().errors.showAllMessages(true);
                    toastr.error("There are some validation errors on page. Please fix tem and retry.");
                }
            }
            else {
                self.loading(true);
                var queryDataModel = {
                    id: self.SingleQueryData().id(),
                    name: self.SingleQueryData().name(),
                    description: self.SingleQueryData().description(),
                    creator: self.SingleQueryData().creator(),
                    query: self.SingleQueryData().query()
                };
                var JsonData = JSON.stringify(queryDataModel);

                //check if its new query or update
                if (self.OriginalSingleQueryData.id == "") {

                    //Ajax call to create new query
                    $.ajax({
                        type: "POST",
                        url: url + apiKey,
                        contentType: "application/json",
                        data: JsonData,
                        success: function () {
                            toastr.success("Query Saved Sucessfully :)");
                            self.OpenDetailsPage(false, self.SingleQueryData());
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            switch (jqXHR.status) {
                                case 400:
                                    toastr.error("Invalid request. Please try again.");
                                    break;
                                case 409:
                                    toastr.error("Id already used. Please try with new Id.");
                                    break;
                                default:
                                    toastr.error("Some error occured. Please try again.");
                            }
                            console.error(jqXHR.status + errorThrown); //To check error on console.
                        },
                        complete: function () {
                            self.loading(false);
                        },
                    });
                }
                else if (self.OriginalSingleQueryData.id == self.SingleQueryData().id()) {
                    //ajax call to update query
                    $.ajax({
                        type: "PUT",
                        url: url + "/" + self.OriginalSingleQueryData.id + apiKey,
                        contentType: "application/json",
                        data: JsonData,
                        success: function () {
                            toastr.success("Query Updated Sucessfully :)");
                            self.OpenDetailsPage(false, self.OriginalSingleQueryData);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            switch (jqXHR.status) {
                                case 400:
                                    toastr.error("Invalid request. Please try again.");
                                    break;
                                case 404:
                                    toastr.error("Id not found. Please try again.");
                                    break;
                                default:
                                    toastr.error("Some error occured. Please try again.");
                            }
                            console.error(jqXHR.status + errorThrown); //To check error on console.
                        },
                        complete: function () {
                            self.loading(false);
                        },
                    });
                }
            }
        };

        //Function to delete an existing query
        self.DeleteQuery = function (data) {
            bootbox.confirm("This query will be permanently deleted. Do you want to continue?", function (result) {
                if (result) {
                    self.loading(true);
                    var id = ko.toJS(data).id;
                    //ajax call to delete query
                    $.ajax({
                        type: "DELETE",
                        url: url + "/" + id + apiKey,
                        success: function () {
                            toastr.success("Query Deleted Sucessfully :)");
                            self.LoadQueryList();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            switch (jqXHR.status) {
                                case 400:
                                    toastr.error("Invalid request. Please try again.");
                                    break;
                                case 404:
                                    toastr.error("Id not found. Please try again.");
                                    break;
                                default:
                                    toastr.error("Some error occured. Please try again.");
                            }
                            console.error(jqXHR.status + errorThrown); //To check error on console.
                        },
                        complete: function () {
                            self.loading(false);
                        },
                    });
                }
            });
        };

        //Function to handle cancel edit button
        self.CancelEdit = function (data) {
            bootbox.confirm("All changes will be lost. Do you want to continue?", function (result) {
                if (result) {
                    if (self.IsNew()) {
                        self.LoadQueryList();
                    }
                    else {
                        self.OpenDetailsPage(false, data);
                    }
                }
            });
        };
        /*Functions*/

        //set toastr to top center
        toastr.options = {
            positionClass: "toast-top-center"
        };

        //Load list on starting
        self.LoadQueryList();
    };

    // to set class to td elements of table -- expand on mouse hover
    $('.mightOverflow').each(function () {
        var $ele = $(this);
        if (this.offsetWidth < this.scrollWidth)
            $ele.attr('title', $ele.text());
    });

    //Bind viewmodel with Html
    ko.applyBindings(new MainViewModel());
});