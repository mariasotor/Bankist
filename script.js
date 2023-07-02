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
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
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
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
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

//It is better to pass the data that a function needs(as a parameter) inside that function instead of using global variable.

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = ""; //empty container

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
  <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
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
  displayMovements(acct.movements);
  calcDisplayBalance(acct);
  calcDisplaySummary(acct);
};

//login implementation
let currentAccount;

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
  displayMovements(currentAccount.movements, !sorted); //if sorted is false, !sorted will be true, and vice versa

  sorted = !sorted; //This line toggles the value of the sorted variable. If it was false, it becomes true, and vice versa. This is done to ensure that the next time the button is clicked, the opposite sorting order is applied to the movements.
});
