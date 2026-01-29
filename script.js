/// Creates an initial state with an empty array representing the source of truth and a variable storing the id of the item to be edited (if available). ///
function createInitialState() {
      return { 
            expenses: [],
            editingId: null,
            filter: {
                  startDate: null,
                  endDate: null,
                  category: null
            },         
      }
}

let state = createInitialState();

//////////GLOBAL VARIABLES//////////
const resetBtn = document.querySelector('.reset-btn');
const totalExpensesValue = document.querySelector(".totalExpensesValue");
const weekValue = document.querySelector(".weekValue");
const monthValue = document.querySelector(".monthValue");
const svgCircle = document.getElementById("progress-circle");
const transactionDescriptionInput = document.getElementById('transaction-description-input');
const transactionAmountInput = document.getElementById('transaction-amount-input');
const categoryInput = document.getElementById('category-input');
const dateInput = document.getElementById('date-input');
const addTransactionBtn = document.getElementById('add-transaction-btn');
const list = document.getElementById("transaction-list");
const emptyMessage = document.querySelector(".empty-state");
const displaySection = document.querySelector(".transaction-display-box");
const inputForm = document.getElementById("user-input-form");
const inputErrMsg = document.querySelector(".input-err-message");
const popupOverlay = document.querySelector(".overlay");
const popUpBox = document.getElementById("pop-up-box");
const trackerApp = document.querySelector(".tracker-app");
const cancelBtn = document.getElementById("cancel-btn");
const okBtn = document.getElementById("ok-btn");
const dateFilterRevealBtn = document.querySelector(".filter-reveal-btn");
const datePickGroup = document.querySelector(".date-picker-group");
const startDateInput = document.querySelector("#start-date-input"); 
const endDateInput = document.querySelector("#end-date-input"); 
const clearFiltersBtn = document.querySelector("#reset-filter-btn");
const summary = document.querySelector(".summary");
const datePickErrMsg = document.querySelector(".date-pick-err");
const filterBtns = document.querySelector(".filter-btns");
const categoryRevealBtn = document.querySelector(".category-filter-reveal-btn");
const emptyCanvasMsg = document.querySelector(".empty-canvas-msg");
const detailsBox = document.querySelector(".details");





/// Set default date value to today on page reload, loads the entries saved to local storage and renders the data. ///
document.addEventListener('DOMContentLoaded', () => {
      setDateToday();
      updateApp(loadSavedEntries());
});


//////////EVENT LISTENERS//////////

/// Shows the warning pop-up whrn the reset button is clicked. /// 
resetBtn.addEventListener('click', showPopUpOverlayAndBox);

addTransactionBtn.addEventListener('click', addTransaction);

categoryRevealBtn.addEventListener('click', () => {
      datePickGroup.classList.remove("show");
      filterBtns.classList.toggle("show");
});

filterBtns.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      
      filterByCategory(btn);
});

dateFilterRevealBtn.addEventListener('click', () => {
    filterBtns.classList.remove("show");
    datePickGroup.classList.toggle("show");
});

clearFiltersBtn.addEventListener('click', () => {
      startDateInput.value = "";
      endDateInput.value = "";
      removeEmptyCanvasMsg();
      updateApp(clearFilters(state));
});

startDateInput.addEventListener('change', showDatePickerErrMsg);

endDateInput.addEventListener('change', filterByDateRange);

list.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;  /// Stops execution if nothing is clicked or clicked element cannot be found.


      //// Checks if the delete button is clicked. ////
      if (e.target.closest('.delete-btn')) {

            /// Reads the id of the item to be deleted ///
            const id = li.dataset.id;
            
            //// State transition that filters out the deleted item ///
            const newState = deleteExpense(state, id);

            ///State is updated using the new array returned from newState ///
            updateApp(newState);
      }


      //// Checks if the edit button is clicked. ////
      if (e.target.closest('.edit-btn')) {

            /// Reads the id of the item to be deleted ///
            const id = li.dataset.id;

            scrollToSection(inputForm);

            /// Updates the state object with the changes made to the edited item. ////
            updateApp(startEditing(state, id));
      }
});

////Checks if the Cancel or Go Ahead button is clicked on the warning pop-up, then acts accordingly. ////
popUpBox.addEventListener('click', (e) => {

      if (e.target.closest('.cancel-btn')) {
            hidePopUpOverlayAndBox();
            return;
      }

      if (e.target.closest('.ok-btn')) {
            hidePopUpOverlayAndBox();
            resetExpenses();
            return;
      }
});

/// Allows the user to exit the warning pop-up by clicking anywhere outside the pop-up ////
document.addEventListener("click", (e) => {
      const isClickInside = popUpBox.contains(e.target);
      const isButton = okBtn.contains(e.target) || cancelBtn.contains(e.target) || resetBtn.contains(e.target);

      if (!isClickInside && !isButton) {
            hidePopUpOverlayAndBox();
      }
});


/////////HELPER FUNCTIONS//////////

function capitalizeFirstLetter(word) {
      return word.charAt(0).toUpperCase() + word.substring(1);
}

function revealDatePicker() {
      datePickGroup.classList.add("show");
}

function removeDatePicker() {
      datePickGroup.classList.remove("show");
}

function addTransaction(e) {
      e.preventDefault();  /// Prevents the button from running a form submission.

      const input = getInputs();
      if (!input) return showErrorMessage();

      /// Creates a new state that is either a new addition to the list or an edit made to the existing array. ///
      let newState = state.editingId ? updateExpense(state, input) : addExpense(state, input);

      newState = stopEditing(newState);

      /// Clears the input fields and error messages, then updates the state object with the new state. ///
      resetFormUI();
      updateApp(newState);
}

function filterByDateRange() {
      const filterDates = getFilterDates();
      if (!filterDates) return;
      console.log(filterDates);

      scrollToSection(summary);
      updateApp(applyDateRangeFilter(state, filterDates));
}

function filterByCategory(child) {
      const categoryFilter = getFilterCategory(child);

      console.log(`Button category: ${categoryFilter}`);
      if(!categoryFilter) return;

      scrollToSection(summary);
      removeEmptyCanvasMsg();
      updateApp(applyCategoryFilter(state, categoryFilter));
}

///////////State Management Functions///////////

function persistExpenses(expenses) {
      /// Saves to local storage for persistence. ///
      localStorage.setItem("expenses", JSON.stringify(expenses));
}

function updateApp(newState) {
      state = newState;  /// Change the state object to a new state.

      persistExpenses(state.expenses);  /// Persistence logic
      
      render(state);  ///Render to UI.
}

function updateExpense(state, updatedData) {
      /// Changes the data in the item selected for editing using its id. 
    return {
        ...state,
        expenses: state.expenses.map(exp => 
            exp.id === state.editingId 
                ? { ...exp, ...updatedData }
                : exp
        )
    };
}

function addExpense(state, expense) {
      return {
            ...state,
            expenses: [...state.expenses, expense]
      };
}

function deleteExpense(state, id) {
      return {
            ...state,
            expenses: state.expenses.filter(exp => exp.id !== id)
      };
}

function startEditing(state, id) {
      return {
            ...state,
            editingId: id
      };
}

function stopEditing(state) {
      return {
            ...state,
            editingId: null
      };
}

function applyDateRangeFilter(state, dateFilter) {
      return {
            ...state,
            filter: {
                  ...state.filter,
                  startDate: dateFilter.startDate,
                  endDate: dateFilter.endDate
            }
      };
} 

function applyCategoryFilter(state, categoryFilter) {
      return {
            ...state, 
            filter: {
                  ...state.filter,
                  category: categoryFilter
            }
      };
}

function clearFilters(state) {
      return {
            ...state,
            filter: {
                  startDate: null,
                  endDate: null,
                  category: null
            }
      };
}

/// Resets the expenses by clearing local storage, the expenses array and the list in the UI ///
function resetExpenses() {

      /// Checks if local storage is already empty. ///

      if (state.expenses.length === 0) {
             scrollToSection(list);
      } else {
            updateApp({ ...state, 
                  expenses: []
            });

            scrollToSection(list);
      }

      showEmptyMessage();
}

///////////Side Effect Functions///////////

function removeEmptyCanvasMsg() {
      emptyCanvasMsg.classList.remove("show");
      detailsBox.classList.remove("hide");
}

function showEmptyCanvasMsg() {
      emptyCanvasMsg.classList.add("show");
      detailsBox.classList.add("hide");
}

function resetFormUI() {
      clearErrMsg();
      clearInputs();
      scrollToSection(list);
}

function showDatePickerErrMsg() {
      datePickErrMsg.classList.add("show");
}

function removeDatePickerErrMsg() {
      datePickErrMsg.classList.remove("show");
}

function hidePopUpOverlayAndBox() {
      popupOverlay.classList.remove("show");
      trackerApp.classList.remove("blur-bg");
}

function showPopUpOverlayAndBox() {
      popupOverlay.classList.add("show");
      trackerApp.classList.add("blur-bg");
}

/// Sets the date input field to today's date in YYYY-MM-DD format ///
function setDateToday() {

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      dateInput.value = formattedDate;

}

/// Generates a random ID for each transaction ///
function generateRandomID(length = 8) {
      let result = '';
      result = Math.random().toString(36).substring(2, 2 + length);
      return result;
}

function showErrorMessage() {
      inputErrMsg.classList.add("show");
      inputErrMsg.classList.add("shake");
}

function showEmptyMessage() {
      emptyMessage.classList.remove("hide");
}

function clearErrMsg() {
      inputErrMsg.classList.remove("show");
}

function clearInputs() {
      /// Clears out all input fields, the empty error message and the list ///
      transactionDescriptionInput.value = "";
      transactionAmountInput.value = "";
      categoryInput.value = "";
      dateInput.value = "";

      /// Clear date range filters ///
      startDateInput
      .value = "";
      endDateInput.value = "";
      // list.innerHTML = "";
      
      /// This sets the date back to today's date after clearing the input ///
      setDateToday();
}

function loadSavedEntries() {
      /// Pulls data stored in local storage into the expenses array in state.
      const savedEntries = localStorage.getItem("expenses");

      let expensesData = [];
      if (savedEntries !== null && savedEntries !== "undefined") { // Check if it's not null and not the string "undefined"
            try {
                  expensesData = JSON.parse(savedEntries);
            } catch (e) {
                  console.error("Error parsing saved expenses from localStorage:", e);
                  // Optionally, clear the bad data to prevent future errors
                  localStorage.removeItem("expenses");
            }
      }

      return {
            ...state,
            expenses: expensesData
      };
}


function scrollToSection(section) {
      section.scrollIntoView({ behavior: 'smooth' });
}


function createExpenseNode(expense) {
      /// Create a new list item with the display icon, description, amount, delete and edit buttons.  ///
      const li = document.createElement("li");
      li.className = "transaction-display"
      li.dataset.id = expense.id;

      /// Create a wrapper for the text and icon ///
      const textIconWrapper = document.createElement("div");
      textIconWrapper.className = "text-and-icon-wrapper";

      /// Create an icon for each category ///
      const iconWrapper = document.createElement("div");
      iconWrapper.className = "icon-wrapper";
      iconWrapper.classList.add('green-bg');

      const categoryIcon = document.createElement("img");
      categoryIcon.className = "category-icon";
      categoryIcon.src = `images/list-icons/${expense.category}.png`;
      categoryIcon.setAttribute("title", `${capitalizeFirstLetter(expense.category)}`);
      iconWrapper.appendChild(categoryIcon);

      /// Create a wrapper for the description and subscript ///
      const textWrapper = document.createElement("div");
      textWrapper.className = "text-wrapper";

      /// Create the description text element ///
      const description = document.createElement("span");
      description.className = "display-title";
      description.textContent = expense.description;

      /// Create the subscript for the transaction; date and category. ///
      const subscript = document.createElement("span");
      subscript.className = "display-subscript";
      subscript.textContent = `${expense.date} | ${expense.category}`;
      textWrapper.append(description, subscript);
      textIconWrapper.append(iconWrapper, textWrapper);

      /// Create the transaction amount text element ///
      const amount = document.createElement("p");
      amount.className = "transaction-value";
      amount.classList.add("red-font");
      amount.textContent = `- ₦${expense.amount}`;

      /// Create a container for the edit and delete buttons ///
      const btnGroup = document.createElement('div');
      btnGroup.className = "btn-group";

      /// Create the edit and delete buttons ///
      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.setAttribute("title", "Edit this expense.");
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.setAttribute("title", "Delete this expense.");
      const editIcon = document.createElement("img");
      editIcon.src = "images/edit.png";
      const deleteIcon = document.createElement("img");
      deleteIcon.src = "images/delete.png";
      editBtn.appendChild(editIcon);
      deleteBtn.appendChild(deleteIcon);
      btnGroup.append(editBtn, deleteBtn);
      li.append(textIconWrapper, amount, btnGroup);

      return li;
}


////////////Derivative Functions////////////

function getFilterCategory(child) {
      return child.dataset.category;
}

function getFilterDates() {

      if (!startDateInput.value || !endDateInput.value) {
            return null;
      };

      return {
            startDate: new Date(startDateInput.value),
            endDate: new Date(endDateInput.value)
      }
}

/// Sums up the expenses for each category and returns the values as an object. ///
function getCategoryBreakdown(expenses) {
    return expenses.reduce((breakdown, expense) => {
        if (breakdown[expense.category]) {
            breakdown[expense.category] += expense.amount;
        } else {
            breakdown[expense.category] = expense.amount;
        }
        return breakdown;
    }, {});
}

function getInputs() {

            /// Creates an object representing the new entry /// 
            const newEntry = {
                  id: generateRandomID(),
                  description: transactionDescriptionInput.value.trim(),
                  amount: Number(transactionAmountInput.value),
                  category: categoryInput.value,
                  date: dateInput.value
            }

            /// Checks if any input field is empty or has invalid input and shows an error message if true ///
            if (!newEntry.description || Number.isNaN(newEntry.amount) || newEntry.amount <= 0 || !newEntry.category || !newEntry.date) {
                  return;
            }

            return newEntry;
}

function getWeekDateRange(referenceDate = new Date()) {
      const today = new Date(referenceDate);

      const currentDay = today.getDay();

      const startOfWeek = new Date(today); 
      startOfWeek.setDate(today.getDate() - currentDay);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return {
            start: startOfWeek,
            end: endOfWeek
      }
      
}

function getTotalExpenses(expenses) {
      /// Sums up all the expense amounts and returns the value ///
      return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

function getExpensesByDateRange(expenses, start, end) {
      /// Returns all expenses that match the provided date range (start - end) ///
      return expenses.filter(e => {
            const d = new Date(e.date);
            return d >= start && d <= end;
      });
}

function getMonthlyTotal(expenses, referenceDate = new Date()) {
      /// Specifies the start and end dates of the current month. ///
      const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
      const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);

      /// Passes the above dates into the getDateRange function to return expenses that match the range (This month). ///
      return getTotalExpenses(getExpensesByDateRange(expenses, start, end));
}

function getWeeklyTotal(expenses, referenceDate = new Date()) {
      /// Does the same as the function above, just in the range of a week. ///
      const { start, end } = getWeekDateRange(referenceDate);
      return getTotalExpenses(getExpensesByDateRange(expenses, start, end));
}


function selectVisible(state) {
      let filtered = state.expenses;

      console.log('Filtering by category:', state.filter.category);  // What's in state?
      console.log('Available expenses:', state.expenses.map(e => e.category));

      //Applies date filter if set ///
      if (state.filter.startDate && state.filter.endDate) {
            filtered = getExpensesByDateRange(
                  filtered,
                  state.filter.startDate,
                  state.filter.endDate
            );
      }

      ///Applies category filter if set ///
      if (state.filter.category) {
            filtered = filtered.filter(e => e.category === state.filter.category);
      }

      return filtered;
}

/////////////// Rendering Functions //////////////////////

function renderExpenseList(expenses) {
      if (expenses.length > 0) {
            emptyMessage.classList.add("hide");
      } else {
            emptyMessage.classList.remove("hide");
      }

      list.innerHTML = "";

      setTimeout(removeDatePickerErrMsg, 2500);

      expenses.forEach(expense => {
            list.appendChild(createExpenseNode(expense));
      });
}

function renderForm(state) {

      addTransactionBtn.textContent = state.editingId === null ? 'Add Transaction' : 'Update Expense';

      if (state.editingId === null) return;

      
      const expense = state.expenses.find(e => e.id === state.editingId);
      if (!expense) return;

      transactionDescriptionInput.value = expense.description;
      transactionAmountInput.value = expense.amount;
      categoryInput.value = expense.category;
      dateInput.value = expense.date;

}

function renderSummary(expenses) {
  totalExpensesValue.textContent =
    `₦${getTotalExpenses(expenses).toLocaleString()}`;

  monthValue.textContent =
    `₦${getMonthlyTotal(expenses).toLocaleString()}`;

  weekValue.textContent =
    `₦${getWeeklyTotal(expenses).toLocaleString()}`;
}

function render(state) {
      const visibleExpenses = selectVisible(state);


      renderExpenseList(visibleExpenses);
      renderSummary(visibleExpenses);
      renderForm(state);
      renderChart(visibleExpenses);
      renderChartDetails(visibleExpenses);
}


///////////////Donut Chart Logic//////////////
let chartInstance = null;

function renderChart(expenses) {
    const breakdown = getCategoryBreakdown(expenses);
    const labels = Object.keys(breakdown);
    const data = Object.values(breakdown);
    
    // If no expenses, don't show chart
    if (data.length === 0) {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        showEmptyCanvasMsg();
        return;
    }
    
    const donut = document.querySelector('#myChart');
    
    // Destroy existing chart before creating new one
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(donut, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Expenses For This Category',
                data: data
            }]
        },
        options: {
            borderWidth: 5,
            borderRadius: 3,
            hoverBorderWidth: 0,
            hoverBorderColor: '#faf8f8',
            plugins: {
                legend: {
                    display: false,
                }
            }
        }
    });
}

function renderChartDetails(expenses) {
      const breakdown = getCategoryBreakdown(expenses);
      const detailsList = document.querySelector('.details-list');

      /// Stores the keys and values of the objects labels and data in an array respectively. ///
      const entries = Object.entries(breakdown);

      detailsList.innerHTML = "";

      if (entries.length === 0) {
            detailsList.classList.add("hide");
            return;
      };

      entries.forEach(([category, amount]) => {
            const li = createDetailsNode(category, amount);
            detailsList.appendChild(li);
      })
}

function createDetailsNode(category, amount) {
      /// Creates a new list item for each value ///
      const li = document.createElement('li');
      li.textContent = `${category}: `;
      const span = document.createElement('span');
      span.className = 'percent';
      span.textContent = `₦${amount.toLocaleString()}`;
      li.appendChild(span);

      return li;
}
