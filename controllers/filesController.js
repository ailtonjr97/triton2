const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/:name", async(req, res)=>{
    try {
        res.sendFile(path.join(__dirname, `../storage/${req.params.name}`));
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})



module.exports = router;