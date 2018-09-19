var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "greatbay_db"
});

function Product(title, category, bid, create) {
    this.title = title;
    this.category = category;
    this.bid = parseFloat(bid);
    this.newbid = 0;
    this.create = create;
    this.connect = function () {
        var that = this;
        connection.connect(function (err) {
            if (err) throw err;
            that.afterConnection();
        });
    }
    this.afterConnection = function () {
        if (this.create === "TRUE") {
            this.createProduct();
        } else {
            this.readProducts();
        }

    };

    this.createProduct = function () {
        var that = this;
        connection.query(
            "INSERT INTO products SET ?",
            {
                title: that.title,
                category: that.category,
                h_bid: that.bid,
            },
            function (err, res) {
                // connection.end();
                start();
                console.log("Your item has been added!!");
            }
        );
        
        
        

    };
    this.readProducts = function () {
        var that = this;
        connection.query("SELECT ? FROM products",
            {
                title: that.title,
            },
            function (err, res) {
                if (err) throw err;
                if (that.bid < that.newbid) {
                    that.updateProduct();
                } else {
                    console.log("Sorry your bid was too low...");
                    start();// connection.end();
                }
            });
    }
    this.updateProduct = function () {
        var that = this;
        var query = connection.query(
            "UPDATE products SET ? WHERE ?",
            [
                {
                    h_bid: that.newbid,
                },
                {
                    title: that.title,
                }
            ],
            function (err, res) {
                start();
                // connection.end();
            }
        );

        console.log("Your bid was accepted as the new high bid\n");
    }
    this.deleteProduct = function () {
        var that = this;
        console.log("Deleting all products by Green Day...\n");
        connection.query(
            "DELETE FROM products WHERE ?",
            {
                title: that.title,
            },
            function (err, res) {
                console.log(res.affectedRows + " products deleted!\n");
                that.readProducts();
            }
        );
    }
}
function connect(func) {
    connection.connect(function (err) {
        if (err) throw err;
        if (func === "BID") {
            displayCAT();
        }
    });
}
function displayCAT() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var catArray = [];
        for (i = 0; i < res.length; i++) {
            var cat = res[i].category;
            catArray.push(cat);
        }
        BIDpromptOne(catArray);
    });
}
function BIDpromptOne(catArray) {
    var cats = catArray;
    inquirer.prompt([
        {
            type: "list",
            name: "category",
            message: "Which category?",
            choices: cats
        }
    ]).then(function (user) {
        connection.query("SELECT * FROM products WHERE ?",
            {
                category: user.category,
            },
            function (err, res) {
                if (err) throw err;
                var titleArray = [];
                for (i = 0; i < res.length; i++) {
                    var title = res[i].title;
                    titleArray.push(title);
                }
                BIDpromptTwo(titleArray, user.category);
            });
    });
}
function BIDpromptTwo(titleArray) {
    var titles = titleArray;
    inquirer.prompt([
        {
            type: "list",
            name: "title",
            message: "Which item?",
            choices: titles
        }
    ]).then(function (user) {
        connection.query("SELECT * FROM products WHERE ?",
            {
                title: user.title,
            },
            function (err, res) {
                if (err) throw err;
                var selectedProduct = new Product(res[0].title,res[0].category,res[0].h_bid, "FALSE")
                BIDpromptThree(selectedProduct);
            });
    });
}
function BIDpromptThree(selectedProduct){
    var product = selectedProduct;
    inquirer.prompt([
        {
            type: "input",
            name: "bid",
            message: "What is your bid?"
        }
    ]).then(function (user) {
            product.newbid = parseFloat(user.bid);
            product.afterConnection();
        
        
})};
function chosePOST() {
    inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What are you posting for sale?",

        },
        {
            type: "input",
            name: "category",
            message: "Which category would you like to post to?",
        },
        {
            type: "input",
            name: "bid",
            message: "What's the starting bid?",
        }
    ]).then(function (user) {
        var newProduct = new Product(user.title, user.category, user.bid, "TRUE");
        newProduct.connect();
    });
}
function choseBID() {
    connect("BID");
}
function start() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Select [POST] to put an item up for auction, [BID] to place a bid on an item?",
            choices: ["POST", "BID","Leave"],

        }
    ]).then(function (user) {
        if (user.action === "POST") {
            chosePOST();
        }
        if (user.action === "BID") {
            choseBID();
        }
        if (user.action === "Leave") {
            connection.end();
        }
    });
}
start();