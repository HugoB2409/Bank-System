const express = require("express");
const router = express.Router();
const authBroker = require("../brokers/auth");
const transactionBroker = require("../brokers/transactions");
const userBroker = require("../brokers/user")
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
var validator = require("email-validator");
const saltRounds = 10;

router.get("/", function (req, res, next) {
    if(req.session.walletId == null) {
        res.redirect("/login")
    }
    userBroker.getUser(req.session.walletId).then(user => {
        transactionBroker.getTransactions(user.username).then((transactions) => {
            transactionBroker.getBalance(req.session.walletId).then((balance) => {
                res.render("index", { title: "Bonjour " + user.username, balance: balance, transactions: transactions });
            })
        })
    })
});

router.get("/addMoney", function (req, res, next) {
    if(req.session.walletId == null) {
        res.redirect("/login")
    }
    res.render("addMoney", { title: "Ajouter des fonds" });
});

router.get("/transferMoney", function (req, res, next) {
    if(req.session.walletId == null) {
        res.redirect("/login")
    }
    res.render("transferMoney", { title: "Virement entre compte" });
});

router.get("/login", function (req, res, next) {
    res.render("login", { title: "Express" });
});

router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "Express" });
});

router.post("/login", function (req, res, next) {
    const credential = req.body;
    authBroker.findByEmail(credential.email).then((user) => {
        if(user) {
            bcrypt.compare(credential.pass, user.password, function(err, result) {
                if(result) {
                    req.session.walletId = user._id
                    res.redirect("/");
                } else {
                    res.render("login", { message: "Email ou mot de passe invalide" });
                }
            });
        } else {
            res.render("login", { message: "Email ou mot de passe invalide" });
        }
    })
});

router.post("/signup", function (req, res, next) {
    const user = req.body;
    if(!validator.validate(user.email)) {
        res.render("signup", {message: "Le email n'est pas valide."})
    } else if(user.password.length < 6) {
        console.log("PASSSWOORRD")
        res.render("signup", {message: "Le mot de passe doit etre minimum 6 caractères."})
    } else {
        authBroker.getByUsername(user.username).then(r => {
            if(r != null) {
                res.render("signup", {message: "Le surnom est deja utiliser."})
            } else {
                bcrypt.hash(user.password, saltRounds).then((hash) => {
                    user.password = hash;
                    authBroker.signup(user).then((id) => {
                        req.session.walletId = id
                        res.redirect("/");
                    })
                });
            }
        })
    }
});

router.get("/logout", function (req, res, next) {
    req.session.walletId = null
    res.redirect("/login");
});

router.post("/addMoney", function (req, res, next) {
    const data = req.body;

    fetch('http://credit.cegeplabs.qc.ca/api/withdraw/' + data.number + '?amt=' + data.montant + '&exp=' + data.expirationDate , { method: 'POST'})
        .then(res => res.json())
        .then(json => {
            if(json.status === "success") {
                userBroker.getUser(req.session.walletId).then(user => {
                    transactionBroker.transferMoney(data.montant, user.username, user.username).then(r => {
                        transactionBroker.addMoney(data.montant, user.username).then(r => {
                            res.redirect("/")
                        })
                    })

                })

            } else {
                res.render("addMoney", { title: "Ajouter des fonds ERROR" })
            }
        });
});

router.post("/transferMoney", function (req, res, next) {
    const data = req.body;

    authBroker.getByUsername(data.username).then(r => {
        if(r == null) {
            res.render("transferMoney", { title: "Virement entre compte", message: "Utilisateur introuvable." });
        } else {
            userBroker.getUser(req.session.walletId).then(user => {
                if(user.balance < data.amount) {
                    res.render("transferMoney", { title: "Virement entre compte", message: "Vous n'avez pas assez d'argent dans votre compte." });
                } else {
                    transactionBroker.transferMoney(data.amount, user.username, data.username).then(r => {
                        transactionBroker.addMoney(-Math.abs(data.amount), user.username).then(r => {
                            transactionBroker.addMoney(data.amount, data.username).then(r => {
                                res.redirect("/")
                            })
                        })
                    })
                }

            })
        }


    })
});

module.exports = router;
