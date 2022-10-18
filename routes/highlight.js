const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const photoSchema = require("../schemas/photo");

//하이라이트 보내주기
router.get("/:id", async (req, res) => {
    try{
        const androidId = req.params.id;

        let resArr = [];
        let title = "";

        let value = ["date", "location", "tag"];
        let toDayPick = Math.floor(Math.random() * value.length);
        console.log("toDayPick : ", toDayPick, " ", value[toDayPick]);

        switch (toDayPick) {
            case 0:
                //작년
                let lastday = new Date();
                lastday.setFullYear(lastday.getFullYear() - 1);
                let year = lastday.getFullYear();
                let month = lastday.getMonth() + 1;
                let day = lastday.getDate();

                const lastyear = await mongoose.model("photos", photoSchema, "photos").find({
                    $expr: {
                        $and: [
                            { userId: androidId },
                            { $eq: [ { "$year": "$datetime" }, year ] },
                            { $eq: [ { "$month": "$datetime" }, month ] },
                            { $eq: [ { "$dayOfMonth": "$datetime" }, day ] }
                        ]
                    }
                });

                title = "작년";
                resArr = lastyear;

                if(lastyear.length == 0){
                    //저번달
                    lastday = new Date();
                    lastday.setMonth(lastday.getMonth() - 1);
                    year = lastday.getFullYear();
                    month = lastday.getMonth() + 1;
                    day = lastday.getDate();

                    const lastmonth = await mongoose.model("photos", photoSchema, "photos").find({
                        $expr: {
                            $and: [
                                { userId: androidId },
                                { $eq: [ { "$year": "$datetime" }, year ] },
                                { $eq: [ { "$month": "$datetime" }, month ] },
                                { $eq: [ { "$dayOfMonth": "$datetime" }, day ] }
                            ]
                        }
                    });

                    title = "지난달";
                    resArr = lastmonth;

                    if(lastmonth.length == 0){
                        //지난주
                        lastday = new Date();
                        lastday.setDate(lastday.getDate() - 7);
                        year = lastday.getFullYear();
                        month = lastday.getMonth() + 1;
                        day = lastday.getDate();

                        const lastweek = await mongoose.model("photos", photoSchema, "photos").find({
                            $expr: {
                                $and: [
                                    { userId: androidId },
                                    { $eq: [ { "$year": "$datetime" }, year ] },
                                    { $eq: [ { "$month": "$datetime" }, month ] },
                                    { $eq: [ { "$dayOfMonth": "$datetime" }, day ] }
                                ]
                            }
                        });

                        title = "지난주";
                        resArr = lastweek;

                        if(lastweek.length == 0){
                            //랜덤 날짜
                            let today = new Date();
                            month = today.getMonth() + 1;
                            const dateList = await mongoose.model("photos", photoSchema, "photos").aggregate([
                                { $match : { 
                                    $and : [
                                        { userId: '4f69a1e89104426c' },
                                        { "$expr" : {$lt : [{ "$month": "$datetime" }, month ]}}
                                    ] 
                                }},
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
                                
                                title = dateList[datePick];
                                resArr = await mongoose.model("photos", photoSchema, "photos").find({
                                    $expr: {
                                        $and: [
                                            { userId: androidId },
                                            { $eq: [ { "$year": "$datetime" }, dateList[datePick]._id.year ] },
                                            { $eq: [ { "$month": "$datetime" }, dateList[datePick]._id.month ] }
                                        ]
                                    }
                                });
                            }
                            else {
                                title = "";
                                resArr = [];
                            }
                        }
                    }
                }
                break;
            case 1:
                let district = ["location.admin", "location.locality", "location.thoroughfare"] //도, 시, 동
                let dPick = Math.floor(Math.random() * district.length);

                let locationList = await mongoose.model("photos", photoSchema, "photos").find({ userId: androidId }).distinct(district[dPick]);
                if(locationList != 0){
                    let locationPick = Math.floor(Math.random() * locationList.length);

                    title = locationList[locationPick];
                    resArr = await mongoose.model("photos", photoSchema, "photos").find({
                        userId: androidId,
                        [district[dPick]] : locationList[locationPick]
                    });
                }
                break;
            case 2:
                let tagList = await mongoose.model("photos", photoSchema, "photos").find({ userId: androidId }).distinct("tags");
                if(tagList != 0){
                    let tagPick = Math.floor(Math.random() * tagList.length);

                    title = tagList[tagPick];
                    //또는 _id로 찾기
                    resArr = await mongoose.model("photos", photoSchema, "photos").find({
                        userId: androidId,
                        tags: tagList[tagPick]
                    }); 
                }
                break;
        }

        console.log("title : ", title, "\nresArr : ",  resArr);
        res.json({ "title" : title, "resArr" : resArr });

    } catch (err){
        console.error(err);
        res.status(500);
        res.json("ERROR");
    }
})

module.exports = router;
