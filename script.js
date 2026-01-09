let expenses = [];

//////////GLOBAL VARIABLES//////////
const resetBtn = document.getElementById('reset-btn');
const totalExpensesValue = document.querySelector(".totalExpensesValue");
const yearValue = document.querySelector(".yearValue");
const monthValue = document.querySelector(".monthValue");
const svgCircle = document.getElementById("progress-circle");
const transactionDescriptionInput = document.getElementById('transaction-description-input');
const transactionAmountInput = document.getElementById('transaction-amount-input');
const categoryInput = document.getElementById('category-input');
const dateInput = document.getElementById('date-input');
const addTransactionBtn = document.getElementById('add-transaction-btn');



/// Set default date value to today ///
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;
dateInput.value = formattedDate;

//////////EVENT LISTENERS//////////
// resetBtn.addEventListener('click', resetExpenses);

// addTransactionBtn.addEventListener('click', addTransaction);

/////////HELPER FUNCTIONS//////////

function generateRandomID(length = 8) {
      let result = '';
      result = Math.random().toString(36).substring(2, 2 + length);
      return result;
}

function getInputs() {

      const newTransaction = {
            id: generateRandomID(),
            description: transactionDescriptionInput.value,
            amount: Number(transactionAmountInput.value),
            category: categoryInput.value,
            date: dateInput.value
      }
      console.log(newTransaction);
}

getInputs();