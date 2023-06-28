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
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

//It is better to pass the data that a function needs(as a parameter) inside that function instead of using global variable.

const displayMovements = function (movements) {
  containerMovements.innerHTML = ""; //empty container
  movements.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const html = `
  <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">${mov} €</div>
 </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html); //with afterbegin, every new item is added before the previous one. At the beginning of the container
  });
};

displayMovements(account1.movements);

//Calculate balance

const calcDisplayBalance = function (movements) {
  const balance = movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = `${balance}€`;
  console.log(balance);
};

calcDisplayBalance(account1.movements);

//Calculate summary (income, outcome, interest) value

const calcDisplaySummary = function (movements) {
  const income = movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const outcome = movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  const interest = movements
    .filter((mov) => mov > 0) //interest rate of 1.2 for each deposit
    .map((deposit) => deposit * (1.2 / 100))
    .filter((int) => int >= 1) //only pay interest if the interest is at least 1%
    .reduce((acc, int) => acc + int);

  labelSumIn.textContent = `${income}€`;
  labelSumOut.textContent = `${Math.abs(outcome)}€`;
  labelSumInterest.textContent = `${interest}€`;
};

calcDisplaySummary(account1.movements);
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
