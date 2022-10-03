const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const photoSchema = require("../schemas/photo");

//하이라이트 보내주기
router.get("/:id", async (req, res) => {
    try{
        const androidId = req.params.id;

        let resArr;

        let value = ["date", "location", "tag"];
        let toDayPick = Math.floor(Math.random() * value.length);
        console.log("toDayPick : ", toDayPick, " ", value[toDayPick]);

        switch (toDayPick) {
            case 0:
                //날짜 하이라이트는 좀 더 생각해보자
                const dateList = await mongoose.model("photos", photoSchema, "photos").aggregate([
                    { $match : { userId: androidId } },
                    {
                        $group: {
                            _id: {
                                year: { "$year": "$datetime" },
                                month: { "$month":"$datetime" }
                            }
                        }
                    }
                ]);
                if(dateList != 0){
                    let datePick = Math.floor(Math.random() * dateList.length);
                    console.log("list", dateList[datePick]);
                    resArr = await mongoose.model("photos", photoSchema, "photos").find({
                        $expr: {
                            $and: [
                                { userId: androidId },
                                { $eq: [ { "$year": "$datetime" }, dateList[datePick]._id.year ] },
                                { $eq: [ { "$month": "$datetime" }, dateList[datePick]._id.month ] }
                            ]
                        }
                    });
                    console.log("result", resArr);
                }
                break;
            case 1:
                let district = ["location.admin", "location.locality", "location.thoroughfare"] //도, 시, 동
                let dPick = Math.floor(Math.random() * district.length);

                let locationList = await mongoose.model("photos", photoSchema, "photos").find({ userId: androidId }).distinct(district[dPick]);
                if(locationList != 0){
                    let locationPick = Math.floor(Math.random() * locationList.length);

                    resArr = await mongoose.model("photos", photoSchema, "photos").find({
                        userId: androidId,
                        [district[dPick]] : locationList[locationPick]
                    });
                    console.log(resArr);
                }
                break;
            case 2:
                let tagList = await mongoose.model("photos", photoSchema, "photos").find({ userId: androidId }).distinct("tags");
                if(tagList != 0){
                    let tagPick = Math.floor(Math.random() * tagList.length);

                    //또는 _id로 찾기
                    resArr = await mongoose.model("photos", photoSchema, "photos").find({
                        userId: androidId,
                        tags: tagList[tagPick]
                    }); 
                    console.log(resArr);
                }
                break;
        }

        res.json(resArr);

    } catch (err){
        console.error(err);
        res.status(500);
        res.json("ERROR");
    }
})

module.exports = router;
