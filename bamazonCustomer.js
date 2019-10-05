var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "deepstreets",
    database: "bamazon_db",
    port: 3306
})
connection.connect();

var display = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log("---------------------------");
        console.log("   Welcome to Bamazon   ");
        console.log("---------------------------");
        console.log("");
        console.log("Find Your Product Below");
        console.log("");
        var table = new Table({
            head: ["Product Id", "Product Description", "Price", "Department_Id", "Stock Quantity"],
            colWidths: [12, 30, 8, 30, 30],
            colAligns: ["center", "left", "left", "left", "left"],
            style: {
                head: ["aqua"],
                compact: true
            }
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].id, res[i].products_name, res[i].price, res[i].department_id, res[i].stock_quantity]);
        }
        console.log(table.toString());
        console.log("");
        shopping();

    });
};

var shopping = function () {
    inquirer.prompt({
        name: "productToBuy",
        type: "input",
        message: "Please enter the Product Id of the item you wish to purchase!"
    }).then(function (answer) {

        var selection = answer.productToBuy;
        connection.query("SELECT * FROM products Where Id=?", selection, function (
            err,
            res
        ) {
            if (err) throw err;
            if (res.length === 0) {

                console.log(
                    "That product does not exist, Please enter a Product Id from the list above"
                );

                shopping();
            } else {


                quantity(res[0].id, res[0].products_name, res[0].price, res[0].department_id, res[0].stock_quantity);
            }
        });
    });
};
var quantity = function (id, name, price, department, quantity) {
    inquirer.prompt({
        name: "amountToBuy",
        type: "input",
        message: `How many ${name}s would you like to purchase?`
    }).then(function (answer) {

        var desiredQuantity = answer.amountToBuy;
        if (desiredQuantity <= quantity) {
            var newQuantity = quantity - desiredQuantity;
            connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: newQuantity,
                    },
                    {
                        id: id
                    }
                ],
                function (err, res) {
                    if (err) throw err;
                    var totalCost = price * desiredQuantity
                    console.log(`Your total is ${totalCost}`);
                    display();
                }
            )
        } else {
            console.log("Insufficient quantity!");
            shopping();
        }
        // connection.query("SELECT * FROM products Where Id=?", selection, function (
        //     err,
        //     res
        // ) {
        //     if (err) throw err;
        //     if (res.length === 0) {

        //         console.log(
        //             "That product does not exist, Please enter a Product Id from the list above"
        //         );

        //         shopping();
        //     } else {
        //         console.log(id,name);
        //     }
        // });
    });
};

display();
