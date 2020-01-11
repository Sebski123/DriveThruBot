import test from 'ava';
const Order = require("./bot.js");



test("Order single item", t => {
    const order = ["cheeseburger"];
    let result = Order("", "", "",order) 
    const expectedResult = 1;
    t.is(result, expectedResult);
});

test("Order multiple different items", t => {
    const order = ["cheeseburger", "bigmac", "filet-o-fish"];
    let result = Order("", "", "",order) 
    const expectedResult = 8.78;
    t.is(result, expectedResult);
});

test("Order multiple of the same item", t => {
    const order = ["cheeseburger", "cheeseburger", "cheeseburger"];
    let result = Order("", "", "",order) 
    const expectedResult = 3;
    t.is(result, expectedResult);
});

test("Order non-existing item", t => {
    const order = ["notRealItem"];
    let result = Order("", "", "",order) 
    const expectedResult = 0.00;
    t.is(result, expectedResult);
});

test("Order non-existing item and real item", t => {
    const order = ["cheeseburger", "notRealItem"];
    let result = Order("", "", "",order) 
    const expectedResult = 1;
    t.is(result, expectedResult);
});

test("Order nothing", t => {
    const order = [];
    let result = Order("", "", "",order) 
    const expectedResult = 0.00;
    t.is(result, expectedResult);
});

test("Order meal-item", t => {
    const order = ["bigmac:m"];
    let result = Order("", "", "",order) 
    const expectedResult = 5.99;
    t.is(result, expectedResult);
});

test("Order meal for non-meal item", t => {
    const order = ["cheeseburger:m"];
    let result = Order("", "", "",order) 
    const expectedResult = 0.00;
    t.is(result, expectedResult);
});

test("Order item with size", t => {
    const order = ["fries-m"];
    let result = Order("", "", "",order) 
    const expectedResult = 1.79;
    t.is(result, expectedResult);
});

test("Order item with size without specifying size", t => {
    const order = ["fries"];
    let result = Order("", "", "",order) 
    const expectedResult = 0.00;
    t.is(result, expectedResult);
});

test("Order (too) many items", t => {
    const order = [];
    for (let i=0;i<1000;i++){order.push("cheeseburger")}
    let result = Order("", "", "",order) 
    const expectedResult = 1000;
    t.is(result, expectedResult);
});

test("Order combination of everything", t => {
    const order = ["cheeseburger", "cheeseburger:m", "bigmac:m", "fries-l", "fries", "notRealItem", "", "cheeseburger"];
    let result = Order("", "", "",order) 
    const expectedResult = 9.88;
    t.is(result, expectedResult);
});