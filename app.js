/*
** Project:     Budgety App Javascript
** Author:      Brian Klein
** Description: Web application to keep track of your monthly budget. I built this app as an exercise for a 
**              Javascript class taught by Jonas Schmedtman on Udemy. Used MVC architecture.
*/
//////////////////////////////////////////////////////////////////
// BUDGET CONTROLLER
// This module controls the budget app's logic
var budgetController = (function() {

    // Private Function Constructors
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Method to calculate the percentage of an expense versus the total income
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // Method to return the percentage of an income versus the total income
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Private Function to calculate income or expense totals
    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // Private data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    // Public Functions
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new Item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push into data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // create an array and return the index of the element we are looking for since the id numbers may not be in their correct location
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            // delete the item at the correct index, if the index is -1 it is not there and we do nothing
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };

})();

//////////////////////////////////////////////////////////////////
// UI CONTROLLER
// This module controls the interface and what you see.
var UIController = (function() {

    // DOMstrings variable for querySelectors
    var DOMstrings = {
        inputType: '.add__type',
        inputDesription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    // Function to format numbers to have commas and decimal points
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        // take the absolute value of the number passed into the function
        num = Math.abs(num);
        // round the number to the 2nd decimal point and always displays 2 decimal points
        num = num.toFixed(2);
        // split the string representing the number at the decimal point and store the parts in an array
        numSplit = num.split('.');
        // int is the integer part of the split number
        int = numSplit[0];
        // if the integer part of the number is greater than 3, split it into substrings and add a comma to the spot 3 places from the end of the number. This will only work correctly on numbers with less than 7 digits
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        // dec is the decimal part of the split number
        dec = numSplit[1];
        // if the type is an expense, the sign is a '-' else it is a '+'. Return the newly formatted number
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        
    };

    // Reuseable ForEach Function for a NodeList
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    //Public Functions
    return {
        // Export public input values
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDesription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // Replace HTML string with placeholder text
            if (type === 'inc') {
                // Select the DOM element
                element = DOMstrings.incomeContainer;

                // This is the placeholder text where we put %SOMETHING% using the %% to mark the text we will replace in the next step
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type ==='exp') {
                // Select the DOM element
                element = DOMstrings.expenseContainer;

                // This is the placeholder text where we put %SOMETHING% using the %% to mark the text we will replace in the next step
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArray;

            // This selects the fields that have user input typed in them as a list
            fields = document.querySelectorAll(DOMstrings.inputDesription + ', ' + DOMstrings.inputValue);

            // This call function lets us set the 'this' variable as the fields list then we can use the Array function slice on the fields list and save it as an Array called fieldsArray
            fieldsArray = Array.prototype.slice.call(fields);

            // For each element in the fieldsArray we are setting the value to empty.
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            // Set the input back to the first element of the fieldsArray which is the input field for the description. This makes it easier to input multiple entries.
            fieldsArray[0].focus();

        },

        // Change DOM to reflect the new budget at the top of the page
        displayBudget: function(obj) {
            var type;
            // if the budget is positive type in 'inc' else type is 'exp'
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            // change the DOM to the formatted version of the budget number at the top of the page
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            // if statement to add the '%' when appropriate in the correct spot on the side of the label
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {
            // Store all the expense percentages from the HTML DOM into the fields
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        // Function to display the correct date at the top of the page
        displayDate: function() {
            var now, year, month, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        // Function called by the eventListener when the user changes the input type from income to expense or back. Changes the color of the input field to red for expenses and blue for income
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesription + ',' +
                DOMstrings.inputValue
            );
            // toggle red border for type, description, and value fields using the nodeListForEach function we created
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            // toggle the input button from red to blue and back depending on the input type
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        // Export public DOMstrings
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();

//////////////////////////////////////////////////////////////////
// GLOBAL APP CONTROLLER
// This module controls the user's input
var controller = (function(budgetCtrl, UICtrl) {

    // Private Function to setup all Event Listeners
    var setupEventListeners = function() {

        // Import DOM Strings from the UIController module
        var DOM = UICtrl.getDOMstrings();

        // Event Listener for clicking the add button
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Event Listener for pressing ENTER
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // create an eventListener for clicking the remove button, use event delegation to catch this event from the 'container' parentNode
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        // create an eventListener for when the user changes the input type from income to expense
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    // Private function to update the budget
    var updateBudget = function() {
        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        var budget = budgetCtrl.getBudget();

        // display the budget to UI
        UICtrl.displayBudget(budget);
    };

    // Private function to update the expense percentages
    var updatePercentages = function() {
        // calculate percentages
        budgetCtrl.calculatePercentages();

        // read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        // update user interface with new percentages
        UICtrl.displayPercentages(percentages);

    };

    // Private Function to handle adding items
    var ctrlAddItem = function() {
        var input, newItem;

        // get field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // add new item to UI
            UICtrl.addListItem(newItem, input.type);

            // clear the fields
            UICtrl.clearFields();

            // calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    };

    // Private Function to handle removing items
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        // set the event target to the 'container' parentNode so we can use the id
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // make sure the target has an id (only the remove button should be able to find an id in the parentNode)
        if (itemID) {
            //split the id at the '-' into an array with 'inc' or 'exp' in the [0] index && the unique number of the id in the [1] index
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // delete item from UI
            UICtrl.deleteListItem(itemID);

            // update new budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    };

    // Public Functions
    return {
        // initialization of the budget application: This is what we are calling when we start the program
        init: function() {
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);

// Start the application
controller.init();