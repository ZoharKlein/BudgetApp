
//////////////budget controller
let budgetController = (function(){
    
    const Expense = function(id , description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    Expense.prototype.calcPercentage = function(totalIncome){   
        
        if (totalIncome > 0){
                this.percentage = Math.round(100 * (this.value / totalIncome)); 
            }
        else{
                this.percentage = -1;
            }
        //console.log(this.percentage);
    }
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    const Income = function(id , description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    } 
    
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:
        {
            exp: 0,
            inc: 0,
            allBudget: 0
        },
        percentageOfBudget: -1

    };
    
    const calcTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(current){
        sum += current.value;
        });
        
        data.totals[type] = sum;
    };
    
    return {
        
        addItem: function(type, des, val){
            let newItem, ID;
            
            if(data.allItems[type].length > 0){
                    ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
               }
            else{
                    ID = 0;
                }
               
            if (type === 'exp'){
                    newItem = new Expense(ID, des, val);
                }
            else if (type === 'inc'){
                    newItem = new Income(ID, des, val);
                }
            
            data.allItems[type].push(newItem);
            //data.totals[type] += parseFloat(val);
            //data.totals.budget = data.totals.inc - data.totals.exp;
            
            return newItem;
        },

        removeItem: function(id, type){
            let idArr,index;
            
            idArr = data.allItems[type].map(current => current.id);
            index = idArr.indexOf(id);
            
            if (index !== -1)
                {
                    data.allItems[type].splice(index, 1);
                } 
        },
        
        calcBudget: function(){
            calcTotal('inc');
            calcTotal('exp');
            
            data.totals.allBudget = data.totals.inc - data.totals.exp;
            
            if (data.totals.allBudget > 0){
                    data.percentageOfBudget = Math.round(100 * data.totals.exp / data.totals.inc);
                }
            else{
                    data.percentageOfBudget = -1;
                }
        },
    
        getBudget: function(){
            return {
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                totalBudget: data.totals.allBudget,
                percentageOfBudget: data.percentageOfBudget
            };
        },
    
        calcPercentages: function(){
            
            data.allItems.exp.forEach(current => current.calcPercentage(data.totals.inc));
        },
        
        getPercentages: function(){
            let allPercentages = data.allItems.exp.map(current => current.getPercentage());
            return allPercentages;
        },
        
    };
    
})();

////////////////UI controller

let UIController = (function(){
        
    const DOMstrings = {
        
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeList: '.income__list',
        expensesList: '.expenses__list',
        budgetTotalLabel: '.budget__value',
        budgetIncomeValueLabel: '.budget__income--value',
        budgetExpensesValueLabel: '.budget__expenses--value',
        budgetExpensesPercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    const nodeListForEach = function(list, callback){
        for(var i=0; i < list.length; i++){
                        callback(list[i], i);
        }
    };
    
    return {
        getInput: function(){
        return {
            
            type: document.querySelector(DOMstrings.inputType).value,//+ or -
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            //1.

            if (type === 'inc')
                {
                    element = DOMstrings.incomeList;
                    html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
            
            else if (type === 'exp')
                {
                    element = DOMstrings.expensesList;
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
            //2.
            
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',this.formatNumber(obj.value));
            
            //3.
            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },
        
        removeListItem: function(selectorID){
            
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
            
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            var fieldsArr = Array.prototype.slice.call(fields);
            
            fields.forEach(function(current, index, array) {
                current.value = "";
                
            });
            
            fieldsArr[0].focus();
        },
        
        getDOMStrings: function(){
            
            return DOMstrings;
            },
        
        displayBudget: function(obj){
            
            var typeSign = obj.totalBudget > 0 ? 'inc' : 'exp';
            
            document.querySelector(DOMstrings.budgetTotalLabel).textContent = this.formatNumber(obj.totalBudget, typeSign);
            document.querySelector(DOMstrings.budgetIncomeValueLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.budgetExpensesValueLabel).textContent = obj.totalExp;
            
            if (obj.percentageOfBudget > 0)
                {
                    document.querySelector(DOMstrings.budgetExpensesPercentageLabel).textContent = obj.percentageOfBudget + '%';
                }
            else
                {
                    document.querySelector(DOMstrings.budgetExpensesPercentageLabel).textContent = '0%';
                }
            
            
        },
        
        displayPercentages: function(percentages){
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercentage);

            nodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent = 0 + '%';
                }
            });
        },
        
        formatNumber: function(num, type){
            
            var numSplit, int, dec, type;

            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');

            int = numSplit[0];
            dec = numSplit[1];
        
            var numLength = int.length;
        
            while (numLength > 3){
                
                int = int.substr(0, numLength - 3) + ',' + int.substr(numLength - 3, int.length);
                numLength -= 3;
            }   

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        },
        
        displayDate: function(){
            
            const month =["January","February","March","April","May","June","July","August",
                        "September","October","November","December"];
            var nowDate = new Date();
            
            document.querySelector(DOMstrings.dateLabel).textContent = (month[nowDate.getMonth()]) + '   ' + nowDate.getFullYear();
        },
        
        changedTypeInput: function(){
            
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            //var color = type === 'inc' ? 'bed-focus' : 'red-focus';
            
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
        }
    };
    
    
})();
                    
////////////////app controller
var controller = (function(budgetCtrl, UICtrl) 
{
    var setEventListener = function(){
    {
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
            if (event.key === 'Enter' || event.keyCode === 13 )
                {
                    ctrlAddItem();
                }
           
            });
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedTypeInput);//
        document.querySelector(DOM.container).addEventListener('click',ctrlRemoveItem);
    }
    }
    
    var DOM = UICtrl.getDOMStrings();
    
    var updateBudget = function()
    {
        var budget;
        
        budgetCtrl.calcBudget();
        
        budget = budgetCtrl.getBudget();
        
        UICtrl.displayBudget(budget);
        
        console.log(budget);
    }
    
    var updatePercentage = function()
    {
        var allPercentages;
        
        //1. clac the percentage
        budgetCtrl.calcPercentages();
        
        //2. take the budget from the budctl
        
        allPercentages = budgetCtrl.getPercentages();
        
        //3. update the ui
        UICtrl.displayPercentages(allPercentages);
    }
    
    var ctrlAddItem = function ()
    {
        //1. get field input data
        var input = UICtrl.getInput();
        
        
        if(input.value !== "" && !isNaN(input.value) && input.value > 0 && input.description != "")
            {
                //2. add the item to the budget controller
                var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
                //3. add the item to the UI
                UICtrl.addListItem(newItem, input.type);
                UICtrl.clearFields();
        
                //4. calculate & update the budget
                updateBudget();
                
                //5. update percentage
                updatePercentage();   
            }
    }
    
    var ctrlRemoveItem = function (event){
        var itemID,splitID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID)
            {
                splitID = itemID.split('-');
                type = splitID[0];
                id = parseInt(splitID[1]);
                
                
                //1. delete from the budgetCtl

                budgetCtrl.removeItem(id, type);
                
                //2. delte from the UI
                
                UICtrl.removeListItem(itemID);
                
                //3. update the new budget
                
                updateBudget();
            }
    }
    
    return {
        init: function()
        {
            setEventListener();
            UICtrl.displayDate();
            UICtrl.displayBudget({totalBudget:0,
                                  totalInc:0,
                                  totalExp:0,
                                  percentageOfBudget:0});
            
        }
    }
   
    
})(budgetController, UIController);


///////start
controller.init();