const express = require("express");
const photoSchema = require("../schemas/photo");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/:id", async (req, res) => {
    try {
        const androidId = req.params.id;
        
        //년도별 개수, 2022년도 10개, 2021년도 20개
        const yearCnt = await mongoose.model("photos", photoSchema, "photos").aggregate([
            { $match: { "userId" : androidId } },
            { 
                $group: {
                    _id: { uri: "$uri", year : {$year : "$datetime"}},
                }
            },
            { 
                $group: {
                    _id: "$_id.year",
                    year: { $first: "$_id.year" },
                    count: { $sum: 1 }
                } 
            },
            { $sort: { year: -1 } },
            { $project: { "_id": 0 } }
        ]);
        console.log("yearCnt", yearCnt);
        
        //년-월별 개수, 2022년 10월 5개, 2022년 7월 3개
        const monthCnt = await mongoose.model("photos", photoSchema, "photos").aggregate([
            { $match: { "userId" : androidId } },
            { 
                $group: {
                    _id: { uri: "$uri", year: { $year : "$datetime" }, month: { $month:"$datetime" } },
                  }
            },
            { 
                $group: {
                    _id: { year: "$_id.year", month: "$_id.month" },
                    year: { $first: "$_id.year" },
                    month: { $first: "$_id.month" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { year: -1, month: 1 } },
            { $project: { "_id": 0 } },
        ]);
        console.log("monthCnt", monthCnt);
        
        let n = 0;
        let mCnt = [];
        yearCnt.forEach((e) => {
            let y = e.year;
            let m = {};
            for(var i = 1; i < 13; i++){
                if(n < monthCnt.length && monthCnt[n].year == y && monthCnt[n].month == i){
                    m[i] = monthCnt[n].count;
                    n++;
                }
                else {
                    m[i] = 0;
                }
            }
            mCnt.push({"year": y, "month": m});
        })
        console.log(mCnt);
        
        //년-월-요일별 개수, 2022년 10월 화요일 1개, 2022년 10월 금요일 1개
        const dayCnt = await mongoose.model("photos", photoSchema, "photos").aggregate([
            { $match: { "userId" : androidId } },
            { 
                $group: {
                    _id: { 
                        uri: "$uri", 
                        year : {$year: "$datetime"},
                        month: {$month: "$datetime"},
                        dayofweek:{$dayOfWeek: "$datetime"}
                    }
                }
            },
            { 
                $group: {
                    _id: {year:"$_id.year", dayofweek: "$_id.dayofweek"},
                    year: { $first: "$_id.year" },
                    dayofweek: { $first: "$_id.dayofweek" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { year: -1, month: 1, dayofweek: 1 }},
            { $project: { "_id": 0 } }
        ]);
        console.log("dayCnt", dayCnt);

        n = 0;
        let dCnt = [];
        yearCnt.forEach((e) => {
            let y = e.year;
            let d = {};
            for(var i = 1; i < 8; i++){
                if(n < dayCnt.length && dayCnt[n].year == y && dayCnt[n].dayofweek == i){
                    d[i] = dayCnt[n].count;
                    n++;
                }
                else {
                    d[i] = 0;
                }
            }

            dCnt.push({ "year": y, "dayofweek": d});
        })
        console.log("dCnt", dCnt);

        //태그
        const tagCnt = await mongoose.model("photos", photoSchema, "photos").aggregate([
            { $match: { "userId" : androidId } },
            { 
                $group: { 
                    _id: "$uri",
                    tags: { $first: "$tags" }
                }
            },
            { $unwind: { path: "$tags" } }, 
            {
                $group: {
                    _id: "$tags._id",
                    tag: { $first: "$tags.tag_ko1" },
                    count: { $sum : 1 }
                }
            },
            { $sort: { "tag" : 1 } },
            { $project: { "_id": 0 } },
        ]);
        console.log("tagCnt", tagCnt);

        //얼굴
        const faceCnt = await mongoose.model("photos", photoSchema, "photos").aggregate([
            { $match: { "userId" : androidId, "faces": { $exists: true } } },
            { 
                $group: {
                    _id: "$uri",
                    faces: { $first: "$faces" }
                } 
            },
            { $unwind: { path: "$faces" } },
            { $group: {
                    _id: "$faces.label",
                    label: { $first: "$faces.label" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "label" : 1 } },
            { $project: { "_id": 0 } }
        ]);
        console.log("faceCnt", faceCnt);

        //시군
        const localityCnt = await mongoose.model("photos", photoSchema, "photos").aggregate([
            { $match: { "userId" : androidId, "location": { $exists: true } } },
            { 
                $group: {
                    _id: "$uri",
                    locality: { $first: "$location.locality" },
                    count: { $sum: 1 }
                } 
            },
            {
                $group: {
                    _id: "$locality",
                    locality: { $first: "$locality" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "locality": 1 } },
            { $project: { "_id": 0 } }
        ]);
        console.log("localityCnt", localityCnt);

        //읍면동
        const thoroughfareCnt = await mongoose.model("photos", photoSchema, "photos").aggregate([
            { $match: { "userId" : androidId, "location": { $exists: true } } },
            { 
                $group: {
                    _id: "$uri",
                    locality: { $first: "$location.locality" },
                    thoroughfare: { $first: "$location.thoroughfare" },
                    count: { $sum: 1 }
                } 
            },
            { 
                $group: {
                    _id: { locality: "$locality", thoroughfare: "$thoroughfare" },
                    locality: { $first: "$locality" },
                    thoroughfare: { $first: "$thoroughfare" },
                    count: { $sum: 1 }
                } 
            },
            { $sort: { locality: 1, thoroughfare: 1 } },
            { $project: { "_id": 0 } }
        ]);
        console.log("thoroughfareCnt", thoroughfareCnt);
        
        n = 0;
        let tfCnt = [];
        localityCnt.forEach((e) => {
            let t = [];
            let local = e.locality;
            let cnt = e.count;
            for(var i = n; i < thoroughfareCnt.length; i++) {
                if(thoroughfareCnt[n].locality == local){
                    t.push({ "name": thoroughfareCnt[n].thoroughfare, "count": thoroughfareCnt[n].count });
                    n++;
                }
                else {
                    break;
                }
            }

            tfCnt.push({ "locality" : local, "thoroughfares": t });
        })
        console.log("tfCnt ", tfCnt);

        res.json({
            "yearCnt": yearCnt,
            "monthCnt": mCnt,
            "dayCnt": dCnt,
            "tagCnt": tagCnt,
            "faceCnt": faceCnt,
            "localityCnt": localityCnt,
            "thoroughfareCnt": tfCnt,
        })

        /*
        const total = await mongoose.model("photos", photoSchema, "photos").aggregate([
            { $match : { "userId" : androidId } },
            {
                $project: {
                    uri: 1,
                    year: {$year :  "$datetime"},
                    month: {$month : "$datetime"},
                    dayofweek: {$dayOfWeek : "$datetime"},
                    location: 1,
                    tags: 1,
                    faces: 1,
                    "album.type": 1    
                }
            },
            { 
                $group: {
                    _id: "$uri",
                    year: { $first: "$year" },
                    month: { $first: "$month" },
                    dayofweek: { $first: "$dayofweek" },
                    location: { $first: "$location" },
                    tags: { $first: "$tags" },
                    faces: { $first: "$faces" },
                    type: { $first: "$album.type" }
                }
            }
        ]);

        let resJson = {};

        total.forEach((e, i) => {
            if(resJson.hasOwnProperty(e.year)){
                resJson[e.year] = resJson[e.year] + 1;
            }
            else {
                resJson[e.year] = 0;
            }
        }); */

    } catch(err) {
        console.error(err);
        res.status(500);
        res.json({ "resJson" : "ERROR" });
    }

})

module.exports = router;
