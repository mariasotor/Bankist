"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2023-11-18T21:31:17.178Z",
    "2023-12-23T07:42:02.383Z",
    "2023-01-28T09:15:04.904Z",
    "2023-04-01T10:17:24.185Z",
    "2023-05-08T14:11:59.604Z",
    "2023-06-27T17:01:17.194Z",
    "2023-07-01T23:36:17.929Z",
    "2023-07-03T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2023-11-01T13:15:33.035Z",
    "2023-11-30T09:48:16.867Z",
    "2023-12-25T06:04:23.907Z",
    "2023-01-25T14:18:46.235Z",
    "2023-02-05T16:33:06.386Z",
    "2023-04-10T14:43:26.374Z",
    "2023-06-25T18:49:59.371Z",
    "2023-07-01T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

//Create username
const createUsername = function (accounts) {
  accounts.forEach(function (account) {
    //ForEach good use case since we are not returning anything, no new value is being created. The method is producing a "side effect" - do some work without returning anything
    account.username = account.owner //looped over the accounts array and manipulated the current account object and added the username property based on the account.owner value+transformations below
      .toLocaleLowerCase()
      .split(" ")
      .map((name) => name[0]) //allow to create a new array
      .join("");
  });
};

createUsername(accounts);
console.log(accounts);

//Format Dates

const formatMovementsDates = function (date) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const year = date.getFullYear();
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    return `${day}/${month}/${year}`;
  }
};

const displayMovements = function (acct, sort = false) {
  containerMovements.innerHTML = ""; //empty container

  const movs = sort
    ? acct.movements.slice().sort((a, b) => a - b)
    : acct.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    //use the current index to get data from other array
    const date = new Date(acct.movementsDates[i]);

    const displayDate = formatMovementsDates(date);

    const html = `
  <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${mov.toFixed(2)} €</div>
 </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html); //with afterbegin, every new item is added before the previous one. At the beginning of the container
  });
};

//Calculate balance

const calcDisplayBalance = function (acct) {
  acct.balance = acct.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = `${acct.balance.toFixed(2)}€`;
};

//Calculate summary (income, outcome, interest) value

const calcDisplaySummary = function (account) {
  const income = account.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const outcome = account.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  const interest = account.movements
    .filter((mov) => mov > 0) //interest rate of 1.2 for each deposit
    .map((deposit) => deposit * (account.interestRate / 100))
    .filter((int) => int >= 1) //only pay interest if the interest is at least 1%
    .reduce((acc, int) => acc + int);

  labelSumIn.textContent = `${income.toFixed(2)}€`;
  labelSumOut.textContent = `${Math.abs(outcome).toFixed(2)}€`;
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

//Update UI

const updateUI = function (acct) {
  displayMovements(acct);
  calcDisplayBalance(acct);
  calcDisplaySummary(acct);
};

//login implementation
let currentAccount;

//FAKE ALWAYS LOGGED IN
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

//Event listeners

btnLogin.addEventListener("click", function (event) {
  //Prevent form from submitting
  event.preventDefault();

  currentAccount = accounts.find(
    (acct) => acct.username === inputLoginUsername.value
  );

  // with the optional chaining the pin property will only be read if the current account exist
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    //Create current date and time
    const now = new Date();
    const year = now.getFullYear();
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);

    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    //clear input field
    inputLoginPin.value = inputLoginUsername.value = "";
    inputLoginPin.blur(); //input field looses its focus

    updateUI(currentAccount);
  }
});

//Transfer money implementation

btnTransfer.addEventListener("click", function (event) {
  event.preventDefault();

  const amount = Number(inputTransferAmount.value);

  const transferAccount = accounts.find(
    (acct) => acct.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    transferAccount &&
    amount <= currentAccount.balance &&
    transferAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    transferAccount.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    transferAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  }
  inputTransferTo.value = inputTransferAmount.value = "";
  inputTransferAmount.blur();
});

//Request loan

btnLoan.addEventListener("click", function (event) {
  event.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);

  const loanAccess = currentAccount.movements.some(
    //A loan can only be given if the user has any deposit >= 10% of requested amount
    (mov) => mov >= loanAmount * 0.1
  );

  if (loanAmount > 0 && loanAccess) {
    currentAccount.movements.push(loanAmount);

    //Add loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  }
  inputLoanAmount.value = "";
});

// Close account
btnClose.addEventListener("click", function (event) {
  event.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const deletedAccountIndex = accounts.findIndex(
      (acct) => acct.username === currentAccount.username
    );
    //Delete account
    accounts.splice(deletedAccountIndex, 1);
    //Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

//Sorting movements
let sorted = false; //state variable: keeps track of whether the account.movements are sorted or not
btnSort.addEventListener("click", function (event) {
  event.preventDefault();
  displayMovements(currentAccount, !sorted); //if sorted is false, !sorted will be true, and vice versa

  sorted = !sorted; //This line toggles the value of the sorted variable. If it was false, it becomes true, and vice versa. This is done to ensure that the next time the button is clicked, the opposite sorting order is applied to the movements.
});
