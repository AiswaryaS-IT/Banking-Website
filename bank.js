const express=require("express");
const router=express.Router();
const bankcontroller=require("../controller/bankcontrol");
router.get("/",bankcontroller.view);
router.get("/register",bankcontroller.view_transaction);
router.get("/home",bankcontroller.view);

/*
router.get('',(req,res)=>{
    res.render("home");
});
*/

module.exports=router;