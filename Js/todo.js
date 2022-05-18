$(window).load(function () {
    $('#loader').fadeOut(3000);

});
$(document).ready(function () {
    var VERY_HIGH_IMPORTANCE = 'veryHigh',
        HIGH_IMPORTANCE = 'high',
        NORMAL_IMPORTANCE = 'normal';
    //Load the data using this variable on page load for the very first time
    function reFreshData() {
        var currentData = showData();
        //by importance
        if (currentData) {
            var importanceCategoryData = searchByImportance(currentData.items);
            $('#totalCount').text(currentData.items.length);

            var veryHighCount = importanceCategoryData.veryHigh.length;
            $('#veryHighCount').text(veryHighCount);
            var highCount = importanceCategoryData.high.length;
            $('#highCount').text(highCount);
            var normalCount = importanceCategoryData.normal.length;
            $('#normalCount').text(normalCount);
            //by dates
            var dateCategoryDate = searchByPredefinedDates(currentData.items);
            var todayCount = dateCategoryDate.today.length;
            console.log("todays count: " + todayCount);
            $('#todayCount').text(todayCount);
            var thisWeekCount = dateCategoryDate.thisWeek.length;
            $('#thisWeekCount').text(thisWeekCount);
            var nextWeekCount = dateCategoryDate.nextWeek.length;
            $('#nextWeekCount').text(nextWeekCount);
            var thisMonthCount = dateCategoryDate.thisMonth.length;
            $('#thisMonthCount').text(thisMonthCount);

            //recent items
            var recent = getRecentToDos(currentData.items);

            $('#recent ul.list-group').empty();
            if (!$('#noItem').hasClass('hide')) {
                $('#noItem').addClass('hide');
            }
            //populate the recent data
            $.each(recent, function (index, value) {
                var importanceClass = "";
                var completed = "";
                var checked = "";
                if (value.isCompleted) {
                    completed = "completed-item";
                    checked = "checked";
                }
                if (value.importance.toLowerCase() == "veryhigh") {
                    importanceClass = "veryHighList";
                } else if (value.importance.toLowerCase() == "high") {
                    importanceClass = "highList";
                } else {
                    importanceClass = "normalList";
                }

                $('#recent ul.list-group').append('<li class="list-group-item ' + importanceClass + '"><label class="form-check-label main ' + completed + '">' +
                    '<input data-id="' + value.id + '" type="checkbox" class="form-check-input changeStatus" value="" ' + checked + '>' + value.name + '<span class="checkmark"></span></label><i data-id="' + value.id + '"  class="fa fa-trash float-right trash">' +
                    '</i><p class="small-text">Due Date: ' + toMMDDYYYYString(new Date(value.dueDate)) + '</p></li>');
            });

        } else {
            $('#recent ul.list-group').empty();
            if ($('#noItem').hasClass('hide')) {
                $('#noItem').removeClass('hide');
            }

            //Set the Left navigation bar count to zero
            $('#totalCount').text(0);
            $('#veryHighCount').text(0);
            $('#highCount').text(0);
            $('#normalCount').text(0);
            //by dates
            $('#todayCount').text(0);
            $('#thisWeekCount').text(0);
            $('#nextWeekCount').text(0);
            $('#thisMonthCount').text(0);
        }

    }
    // create Calendar from div HTML element
    $("#mainCalendar").kendoCalendar({
        format: "MM/dd/yyyy",
        change: calendarChange

    });
    $("#fromDate").kendoDatePicker({

        // display month and year in the input
        format: "MM/dd/yyyy",
    });
    $("#toDate").kendoDatePicker({

        // display month and year in the input
        format: "MM/dd/yyyy",
    });
    //Class to create todo Object
    function Todo(id, name, dueDate, importance, isCompleted) {
        this.id = id;
        this.name = name;
        this.dueDate = dueDate;
        this.importance = importance;
        this.isCompleted = isCompleted;
    }
    //Class declaration ends
    /****************LOCAL STORAGE STUFFS***************/
    if (typeof (Storage) !== "undefined") {

    } else {
        alert("Local storage not supported.")
    }
    /****************LOCAL STORAGE STUFFS ENDS***************/
    //stored using the key="todos"
    function getDataFromLocalStorage() {
        return JSON.parse(localStorage.getItem("todos"));
    }
    //stored using the key="todos"
    function setDataToLocalStorage(data) {
        if (data) {
            if (localStorage["todos"]) {
                localStorage.clear();
                localStorage.setItem("todos", JSON.stringify(data));
            } else {
                localStorage.setItem("todos", JSON.stringify(data));
            }

        }
    }
    //Users CRUD operations
    function addToDoList(name, dueDate, importance, isCompleted) {
        //get the local storage data // get the index of the highest item // add to the list //set the localstorage
        currentData = getDataFromLocalStorage();

        if (!currentData) {
            var currentData = {
                index: 0,
                items: []
            };
            currentData.index += 1;
            var toDo = new Todo(currentData.index, name, dueDate, importance, isCompleted);
            currentData.items.push(toDo);
            setDataToLocalStorage(currentData);
        } else {
            currentData.index += 1;
            var toDo = new Todo(currentData.index, name, dueDate, importance, isCompleted);
            currentData.items.push(toDo);
            setDataToLocalStorage(currentData);
        }

    }
    //Display all the items
    function showData() {
        return getDataFromLocalStorage();
    }
    //change from completedToNotCompletedAndViceVersa
    function changeStatusOfAToDo(id) {
        var currentData = showData();
        if (currentData && currentData.index > 0) {
            for (i = 0, currentData.items.length; i < currentData.items.length; i++) {
                var item = currentData.items[i];
                if (item.id === id) {
                    currentData.items[i].isCompleted = !currentData.items[i].isCompleted;
                    setDataToLocalStorage(currentData);
                    break;
                }
            }
        }
    }

    //Delete item from the storage

    //Delete item from the storage
    function deleteItem(id) {
        if (id) {
            var currentData = showData();
            if (currentData) {
                if (currentData.index == 1) {
                    localStorage.clear();
                } else {
                    currentData.index -= 1;
                    currentData.items = removeItemFromArray(currentData.items, id);
                    setDataToLocalStorage(currentData);
                }
            }
        }

    }
    //Utility methods- this will return a new array
    function removeItemFromArray(array, index) {
        return array.filter(e => e !== array[index]);
    }

    /***************SEARCH AND FILTER UTILITIES */
    //search for an item by importance
    function searchByImportance(currentData) {
        var result = {
            veryHigh: [],
            high: [],
            normal: []
        };
        if (currentData) {
            result.veryHigh = currentData.filter(function (element) {
                return element.importance.toLowerCase() == "veryhigh";
            });
            result.high = currentData.filter(function (element) {
                return element.importance.toLowerCase() == "high";
            });
            result.normal = currentData.filter(function (element) {
                return element.importance.toLowerCase() == "normal";
            });

        }
        return result;
    }
    //search by completion status
    function searchByCompletion(currentData) {
        var result = {
            completed: [],
            notCompleted: []
        };
        if (currentData) {

            result.completed = currentData.filter(function (element) {

                return element.isCompleted == true;
            });
            result.notCompleted = currentData.filter(function (element) {

                return element.isCompleted == false;
            });

        }
        return result;
    }

    //search between dates
    function searchBetweenDates(fromDate, toDate) {
        var result = {
            total: 0,
            completed: [],
            notCompleted: []
        };
        //not implemented yet
        return result;
    }
    //search by predefined dates
    function searchByPredefinedDates(currentData) {
        var result = {
            today: [],
            thisWeek: [],
            nextweek: [],
            thisMonth: []

        };
        if (currentData) {
            result.today = currentData.filter(function (element, index) {
                return toMMDDYYYY(new Date(element.dueDate)).getTime() == toMMDDYYYY(new Date()).getTime();
            });
            result.thisWeek = currentData.filter(function (element, index) {
                var startDate = getStartAndEndDate("thisweek").start;
                var endDate = getStartAndEndDate("thisweek").end;
                return toMMDDYYYY(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYY(new Date(element.dueDate)).getTime() <= endDate;
            });
            result.nextweek = currentData.filter(function (element, index) {

                var startDate = getStartAndEndDate("nextweek").start;
                var endDate = getStartAndEndDate("nextweek").end;
                return toMMDDYYYY(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYY(new Date(element.dueDate)).getTime() <= endDate;
            });
            result.thisMonth = currentData.filter(function (element, index) {
                var startDate = getStartAndEndDate("thismonth").start;
                var endDate = getStartAndEndDate("thismonth").end;
                return toMMDDYYYY(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYY(new Date(element.dueDate)).getTime() <= endDate;
            });

        }
        return result;
    }
    //pass a date and get the weej start
    //params: date to get the week start
    function getStartOfWeek(date) {
        var d = new Date(+date);
        var shift = d.getDay();
        d.setDate(d.getDate() - shift);
        return d;
    }


    /*************DATE UTILITIES************/
    //convert to mm/dd/yyyy
    function toMMDDYYYY(date) {
        var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
        return new Date(dateInMMDDYYYY);
    }
    //convert to mm/dd/yyyy
    function toMMDDYYYYString(date) {
        var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
        return dateInMMDDYYYY;
    }
    //removes the millisecond part
    function formatDate(date) {
        var dateInMMDDYYYY = date.substr(0, 10);
        return dateInMMDDYYYY;
    }

    //get todos for today
    function getTotalitemsToday() {
        var allTodosForToday = [];
        return allTodosForToday;
    }
    //get todos for this week
    function getTotalitemsThisWeek() {

        var allTodosForThisWeek = [];
        return allTodosForThisWeek;
    }
    //get todos for last week
    function getTotalitemsnextweek() {

        var allTodosFornextweek = [];
        return allTodosFornextweek;
    }
    //get todos for this month
    function getTotalitemsThisMonth() {

        var allTodosForThisMonth = [];
        return allTodosForThisMonth;
    }

    /**************CATEGORY HELPER */

    //get todos with high imp
    function getTotalHighItems(data) {
        var allHighTodos = searchByImportance(data).veryHigh;
        return allHighTodos;
    }
    //get todos with very high imp
    function getTotalVeryHighItems(data) {

        var allVeryHighTodos = searchByImportance(data).high;
        return allVeryHighTodos;
    }
    //get todos with normal imp
    function getTotalNormalItems(data) {
        var allNormalTodos = searchByImportance(data).normal;
        return allNormalTodos;
    }

    /**************IS COMPLETED HELPER */
    //get todos with high imp
    function getTotalCompletedItems(data) {

        var allCompleted = searchByCompletion(data).completed;
        return allCompleted;
    }
    //get todos with high imp
    function getTotalNotCompletedItems(data) {
        var allNotCompleted = searchByCompletion(data).notCompleted;
        return allNotCompleted;
    }
    //gets the 5 recent items
    function getRecentToDos(currentData) {
        var total = currentData != null ? currentData.length : 0;
        if (total > 5) {
            var filteredData = currentData.filter(function (element) {
                return element.id > (total - 5);
            });

            filteredData.sort(function (a, b) {
                var dateA = new Date(a.dueDate),
                    dateB = new Date(b.dueDate);
                return dateB - dateA;
            });
            return filteredData;

        } else {

            currentData.sort(function (a, b) {
                var dateA = new Date(a.dueDate),
                    dateB = new Date(b.dueDate);
                return dateB - dateA;
            });
            return currentData;
        }
    }
    /******************EVENT HANDLING PARTS ONLY********************** */

    //Display selected date on the calendar on load
    var calendar = $("#mainCalendar").data('kendoCalendar');
    var dateSelected = calendar.current();
    displayCalendarValue(toMMDDYYYYString(dateSelected));
    //to Display the value of the calendar on the text
    function displayCalendarValue(val) {
        var selecteDateId = "#selectedDate";
        $(selecteDateId).text(val);
    }
    //When calendar value changes, change the dates as well
    function calendarChange() {
        dateSelected = this.value();
        displayCalendarValue(dateSelected.toLocaleDateString())
    }
    //create an alert messgae
    function createAlert(message) {
        $("#actionAlert #alertMessage").text(message);
        $("#actionAlert").show();
        $("#actionAlert").fadeTo(2000, 500).slideUp(500, function () {
            $("#actionAlert").slideUp(500);
        });

    }

    //When an item is created
    $('#createForm').submit(function (event) {
        event.preventDefault();
        //Gather form data
        var dueDate = dateSelected;
        var formData = $(this).serializeArray();
        var name = formData[0].value;
        var importance = formData[1].value;
        addToDoList(name, dueDate, importance, false);
        $('#todoList').val('');
        reFreshData();
        //show alert
        createAlert("You just created a todo list. Add more...");
    });

    //when users click on the checkbox

    $("#recent").on('change', '.changeStatus', function () {
        var currentData = showData();
        var index = parseInt($(this).attr("data-id"));
        var message = "status changed";
        if (this.checked) {

            changeStatusOfAToDo(index);
            message = "You have marked a todo list as completed";
        } else {
            changeStatusOfAToDo(index);
            message = "You have marked a todo list as incomplete";
        }
        reFreshData();
        //show alert
        createAlert(message);
    });
    //on delete event
    $("#recent").on('click', '.trash', function () {
        var index = $(this).attr("data-id");
        if (confirm("Are you sure you would like to delete this item?")) {
            deleteItem(index);
            reFreshData();
            createAlert("You have deleted a todo list");
        }


    });

    //delte all the storage data
    $('#deleteAll').on('click', function () {
        if (confirm("This action will remove all your data. Are you sure?")) {
            if (localStorage["todos"]) {
                localStorage.clear();
                location.reload(true);
            } else {
                alert("You do not have any information stored on this website. Please create todos first");
            }

        }

    });
    /*************MODAL OPERATIONS */
    //format
    function toMMDDYYYYForComparing(date) {
        var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
        return new Date(dateInMMDDYYYY);
    }
    //***********BOSTRAP MODAL AND THEIR OPERATIONS************ */
    function DisplayDataInModal(isModalRefresh, category, filter) {
        var currentData = showData();
        if (currentData) {
            var dataToBeBound = null;

            if (category == "1") {
                //this is for importance
                var allImportantData = searchByImportance(currentData.items);
                if (filter == "veryhigh") {
                    dataToBeBound = allImportantData.veryHigh;
                } else if (filter == "high") {
                    dataToBeBound = allImportantData.high;
                } else if (filter == "normal") {
                    dataToBeBound = allImportantData.normal;
                } else {
                    alert("no filter found");
                }

            } else if (category == "2") {
                //this is for predefined dates
                var allDatesData = searchByPredefinedDates(currentData.items);
                if (filter == "today") {
                    dataToBeBound = allDatesData.today;
                } else if (filter == "thisweek") {
                    dataToBeBound = allDatesData.thisWeek;
                } else if (filter == "nextweek") {
                    dataToBeBound = allDatesData.nextWeek;

                } else if (filter == "thismonth") {
                    dataToBeBound = allDatesData.thisMonth;
                } else {
                    alert("no filter found");
                }

            } else if (category == "3") {

                //this is for custom search

                //check to see if any of the fields are empty
                //todate cannot be smaller than the 
                var fromDate = $("#fromDate").data("kendoDatePicker").value();
                var toDate = $("#toDate").data("kendoDatePicker").value();
                console.log(fromDate + ":" + toDate);
                if (fromDate && toDate) {
                    if (toDate < fromDate) {
                        createAlert('to date has to be bigger.Try again');
                    } else {
                        dataToBeBound = searchBetweenDates(currentData.items, fromDate, toDate);
                    }
                } else {
                    createAlert('Missing from or to date.Try again');
                }
            } else {
                alert("no category found");
            }
            if (dataToBeBound.length > 0) {
                bindDataToModal(dataToBeBound, isModalRefresh, category, filter);
            } else {

                if (isModalRefresh) {
                    $('#toDoModal').modal('hide');
                } else {
                    alert("No data to display");
                }

            }
        } else {

            if (isModalRefresh) {
                $('#toDoModal').modal('hide');
            } else {
                alert("No data found in your system");
            }

        }
    }
    //When users click on the items on the left panel 
    $('.category').on('click', '.openModal', function () {
        var category = $(this).attr('data-category');
        var filter = $(this).attr('data-filter');
        DisplayDataInModal(false, category, filter);
    });
    $('#todoModal').on('hidden.bs.modal', function () {
        $('#md-todoList ul.list-group').empty();
    });
    //this will create a modal and bind the incoming data to it
    function bindDataToModal(data, isModalRefresh, category, filter) {
        $('#md-todoList ul.list-group').empty();
        $('#md-todoList #categoryAndFilter').attr('data-category', "");
        $('#md-todoList #categoryAndFilter').attr('data-filter', "");
        $('#md-todoList #categoryAndFilter').attr('data-category', category);
        $('#md-todoList #categoryAndFilter').attr('data-filter', filter);
        //populate the recent data
        $.each(data, function (index, value) {
            var importanceClass = "";
            var completed = "";
            var checked = "";
            if (value.isCompleted) {
                completed = "completed-item";
                checked = "checked";
            }
            if (value.importance.toLowerCase() == VERY_HIGH_IMPORTANCE.toLowerCase()) {
                importanceClass = "veryHighList";
            } else if (value.importance.toLowerCase() == HIGH_IMPORTANCE.toLowerCase()) {
                importanceClass = "highList";
            } else if (value.importance.toLowerCase() == NORMAL_IMPORTANCE.toLowerCase()) {
                importanceClass = "normalList";
            } else {
                //no class
            }


            $('#md-todoList ul.list-group').append('<li class="list-group-item ' + importanceClass + '"><label class="form-check-label main ' + completed + '">' +
                '<input data-id="' + value.id + '" type="checkbox" class="form-check-input changeStatus" value="" ' + checked + '>' + value.name + '<span class="checkmark"></span></label><i data-id="' + value.id +
                '"  class="fa fa-trash float-right trash">' +
                '</i><p class="small-text">Due Date: ' + toMMDDYYYYString(new Date(value.dueDate)) + '</p></li>');


        });
        if (!isModalRefresh) {
            $('#toDoModal').modal('show');
        }

    }

    //search between dates
    function searchBetweenDates(currentData, fromDate, toDate) {
        var result = [];
        if (currentData) {

            result = currentData.filter(function (element, index) {
                return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() >= toMMDDYYYYForComparing(fromDate) && toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() <= toMMDDYYYYForComparing(toDate);
            });
        }
        return result;
    }
    //on delete event in the modal
    $("#md-todoList").on('click', '.trash', function () {
        var index = parseInt($(this).attr("data-id"));
        if (confirm("Are you sure you would like to delete this item?")) {
            deleteItem(index);
            createAlert('Todo item deleted.');
            reFreshData();
            var category = $('#md-todoList #categoryAndFilter').attr('data-category');
            var filter = $('#md-todoList #categoryAndFilter').attr('data-filter');
            if (category == "3") {
                location.reload();
            } else {
                DisplayDataInModal(true, category, filter);
            }

        }

    });
    //Chaneg status within the modal
    $("#md-todoList").on('change', '.changeStatus', function () {
        var currentData = showData();
        var index = parseInt($(this).attr("data-id"));
        changeStatusOfAToDo(index);
        createAlert('toDO item Status Changed');
        reFreshData();
        var category = $('#md-todoList #categoryAndFilter').attr('data-category');
        var filter = $('#md-todoList #categoryAndFilter').attr('data-filter');
        if (category == "3") {
            location.reload();
        } else {
            DisplayDataInModal(true, category, filter);
        }
    });

    //search by predefined dates
    function searchByPredefinedDates(currentData) {
        var result = {
            today: [],
            thisWeek: [],
            nextWeek: [],
            thisMonth: []
        };
        if (currentData) {
            result.today = currentData.filter(function (element, index) {
                return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() == toMMDDYYYYForComparing(new Date()).getTime();
            });
            result.thisWeek = currentData.filter(function (element, index) {
                var startDate = getStartAndEndDate("thisweek").start;
                var endDate = getStartAndEndDate("thisweek").end;
                return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() <= endDate;
            });
            result.nextWeek = currentData.filter(function (element, index) {

                var startDate = getStartAndEndDate("nextweek").start;
                var endDate = getStartAndEndDate("nextweek").end;
                return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() <= endDate;
            });
            result.thisMonth = currentData.filter(function (element, index) {
                var startDate = getStartAndEndDate("thismonth").start;
                var endDate = getStartAndEndDate("thismonth").end;
                return toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYYForComparing(new Date(element.dueDate)).getTime() <= endDate;
            });

        }
        return result;
    }
    //based on the params, it will generate start and end date
    function getStartAndEndDate(range) {
        let result = {
            start: new Date(),
            end: new Date()
        };
        if (range.toLowerCase() == "today") {
            result.start = toMMDDYYYYForComparing(new Date());
            result.end = toMMDDYYYYForComparing(new Date());
        }
        if (range.toLowerCase() == "thisweek") {
            var current = new Date();
            var diff = current.getDate() - current.getDay();
            result.start = toMMDDYYYYForComparing(new Date(current.setDate(diff)));
            result.end = toMMDDYYYYForComparing(new Date(current.setDate(result.start.getDate() + 6)));
        }
        if (range.toLowerCase() == "nextweek") {
            var today = new Date();
            var nextSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (7 - today.getDay()));
            result.start = toMMDDYYYYForComparing(nextSunday);
            result.end = toMMDDYYYYForComparing(new Date(today.setDate(result.start.getDate() + 6)));
        }
        if (range.toLowerCase() == "thismonth") {
            var date = new Date(),
                year = date.getFullYear(),
                month = date.getMonth();
            result.start = toMMDDYYYYForComparing(new Date(year, month, 1));
            result.end = toMMDDYYYYForComparing(new Date(year, month + 1, 0));
        }
        return result;
    }
    //search for an item by importance
    function searchByImportance(currentData) {
        var result = {
            veryHigh: [],
            high: [],
            normal: []
        };
        if (currentData) {
            result.veryHigh = currentData.filter(function (element) {
                return element.importance == VERY_HIGH_IMPORTANCE;
            });
            result.high = currentData.filter(function (element) {
                return element.importance == HIGH_IMPORTANCE;
            });
            result.normal = currentData.filter(function (element) {
                return element.importance == NORMAL_IMPORTANCE;
            });

        }
        return result;
    }



    /**********MODAL DONE*************** */
    /*************MODAL OPERATIONS */
    reFreshData();

});