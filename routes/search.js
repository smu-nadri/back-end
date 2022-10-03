const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const photoSchema = require("../schemas/photo");

//태그 목록 보내주기
router.get("/taglist/:id", async(req, res) => {
    try{
        const androidId = req.params.id;
        const tagList = await mongoose.model("photos", photoSchema, "photos").aggregate([
            { $match : { "userId" : androidId } },
            { $unwind: { path: "$tags" } }, 
            {
                $group: {
                    _id: "$tags",
                    tag: {
                        $first: {
                            tag: "$tags",
                            thumbnail: "$uri"
                        }
                    }
                }
            },
            { $sort : { "_id.tag_ko1" : 1 } }
        ]);
        console.log(tagList);

        res.json({ "tagList": tagList });

    } catch(err){
        console.log(err);
        res.status(500);
        res.json({ "resJson": "ERROR" });
    }
});

//클릭한 태그가 달린 사진들 보내주기
router.get("/:tagidx/:id", async(req, res) => {
    try{
        const androidId = req.params.id;
        const result = await mongoose.model("photos", photoSchema, "photos").find({
            userId: androidId,
            "tags": { $elemMatch: { _id: req.params.tagidx } },
        });

        res.json(result);

    } catch(err){
        console.log(err);
        res.status(500);
        res.json({ "resJson": "ERROR" });
    }
});

//검색 결과 보내주기
router.get("/:id", async (req, res) => {
    try{
        const androidId = req.params.id;
        const query = req.query.query;
        let query_split = query.trim().split(/\s+/g); //모든 공백 제거
        console.log("query:", decodeURIComponent(query));

        //검색 쿼리
        let photoQuery = { $and : [{ userId: androidId }] };

        let year = [], month = [], day = [], daytime = [], season = [], day_bool = false, word_bool = false;
        let tag_regexs = [{ $all: [] }, { $in : [] }, { $nin : [] }];
        let query_regexs = [{ $all: [] }, { $in : [] }, { $nin : [] }];
        let day_regexs = { $all : [] };

        //패턴들
        const logical_pattern = [/^\+/, /\|/, /^-/]; //AND +, OR |, NOT -
        const date_ym_pattern = /^(19|20)\d{2}-([1-9]|1[012])$|^(19|20)\d{2}.([1-9]|1[012])$|^(19|20)\d{2}년([1-9]|1[012])월$/;
        const date_md_pattern = /^([1-9]|1[012])-([1-9]|[12][0-9]|3[0-1])$|^([1-9]|1[012]).([1-9]|[12][0-9]|3[0-1])$|^([1-9]|1[012])월([1-9]|[12][0-9]|3[0-1])일$/;
        const date_ymd_pattern = /^(19|20)\d{2}-([1-9]|1[012])-([1-9]|[12][0-9]|3[0-1])$|^(19|20)\d{2}.([1-9]|1[012]).([1-9]|[12][0-9]|3[0-1])$|^(19|20)\d{2}년([1-9]|1[012])월([1-9]|[12][0-9]|3[0-1])일$/;
        const date_pattern = [/^(19|20)\d{2}년/, /^([1-9]|1[012])월/, /^([1-9]|[12][0-9]|3[0-1])일/];
        const season_pattern = ["봄", "여름", "가을", "겨울"];
        const day_pattern = ["새벽", "아침", "낮", "저녁", "밤"];  

        query_split.forEach(async element => {
            console.log("element:", element);
            day_bool = false;

            //논리 검색일 때
            if(/^\+|\||^-/.test(element)){
                logical_pattern.forEach((p, i) => {
                    if(p.test(element)){
                        switch(i){
                            case 0 : {
                                tag_regexs[0].$all.push(new RegExp(`^${element.slice(1, element.lengh)}$`, "i"));
                                query_regexs[0].$all.push(new RegExp(element.slice(1, element.lengh), "i"));
                                break;
                            }
                            case 1 : {
                                let or_split = element.split("|");
                                for(var s of or_split){
                                    console.log(s);
                                    tag_regexs[1].$in.push(new RegExp(`^${s}$`, "i"));
                                    query_regexs[1].$in.push(new RegExp(s, "i"));
                                }
                                break;
                            }
                            case 2 : {
                                tag_regexs[2].$nin.push(new RegExp(`^${element.slice(1, element.lengh)}$`, "i"));
                                query_regexs[2].$nin.push(new RegExp(element.slice(1, element.lengh), "i"));
                                break;
                            }
                        }
                    }
                })
                word_bool = true;
            }
            else {
                //날짜 검색일 때 2022-9-1, 2022.9.1, 2022년9월1일
                if(date_ym_pattern.test(element)){
                    [y, m] = element.split(/-|\.|년|월/).map(Number);
                    year.push(y);
                    month.push(m);
                    day_bool = true;
                }
                else if(date_md_pattern.test(element)){
                    [m, d] = element.split(/-|\.|월|일/);
                    month.push(m);
                    day.push(d);
                    day_bool = true;
                }
                else if(date_ymd_pattern.test(element)){
                    [y, m, d] = element.split(/-|\.|년|월|일/);
                    year.push(y);
                    month.push(m);
                    day.push(d);
                    day_bool = true;
                }

                date_pattern.forEach((p, i) => {
                    if(p.test(element)) {
                        switch(i){
                            case 0 : year.push(Number(element.slice(0, -1))); break;
                            case 1 : month.push(Number(element.slice(0, -1))); break;
                            case 2 : day.push(Number(element.slice(0, -1))); break;
                        }
                        day_bool = true;
                    }
                })
   
                //계절 검색일 때     
                const season_idx = season_pattern.indexOf(element);
                switch(season_idx) {
                    case 0 : season.push(3, 4, 5); day_bool = true; break;
                    case 1 : season.push(6, 7, 8); day_bool = true; break;
                    case 2 : season.push(9, 10, 11); day_bool = true; break;
                    case 3 : season.push(12, 1, 2); day_bool = true; break;
                }
                
                //시간 검색일 때              
                const day_idx = day_pattern.indexOf(element);
                switch(day_idx) {
                    case 0 : daytime.push(1, 2, 3, 4, 5); day_bool = true; break;
                    case 1 : daytime.push(6, 7, 8, 9); day_bool = true; break;
                    case 2 : daytime.push(10, 11, 12, 13, 14, 15, 16); day_bool = true; break;
                    case 3 : daytime.push(17, 18, 19, 20); day_bool = true; break;
                    case 4 : daytime.push(21, 22, 23, 0); day_bool = true; break;
                }
                
                if(!day_bool) {
                    tag_regexs[0].$all.push(new RegExp(`^${element}$`, "i"));
                    query_regexs[0].$all.push(new RegExp(element, "i"));
                    word_bool = true;
                }
                else {
                    day_regexs.$all.push(new RegExp(element, "i"));
                }
            }
            
        });

        let orQuery = { $or : [] };
        let dayOrQuery = { $or : [] };
        
        console.log(day_regexs.$all);
        if(day_regexs.$all.length != 0) dayOrQuery.$or.push({ "comment" : day_regexs });

        let dayAndQuery = { $and : [] };
        if(year != 0) dayAndQuery.$and.push({"$expr" : { "$in": [ { "$year": "$datetime" }, year ] }});
        if(month != 0) dayAndQuery.$and.push({"$expr" : { "$in": [ { "$month": "$datetime" }, month ] }});
        if(day != 0) dayAndQuery.$and.push({"$expr" : { "$in": [ { "$dayOfMonth": "$datetime" }, day ] }});
        if(season.length != 0) dayAndQuery.$and.push({"$expr" : { "$in": [ { "$month": "$datetime" }, season ] }});
        if(daytime.length != 0) dayAndQuery.$and.push({"$expr" : { "$in": [ { "$month": "$datetime" }, daytime ] }});

        if(dayAndQuery.$and.length != 0) dayOrQuery.$or.push(dayAndQuery);
        if(dayOrQuery.$or.length != 0) photoQuery.$and.push(dayOrQuery);

        console.log(tag_regexs, query_regexs);

        let tag_and = [{ $and : [] }, { $and : [] }, { $and : [] }, { $and : [] }];
        let query_and = [{ $and : [] }, { $and : [] }];
        let ninAndQuery = { $and : [] };
        
        let tag_field = ["tags.tag_en", "tags.tag_ko1", "tags.tag_ko2", "tags.tag_ko3"];
        let query_field = ["comment", "location.address"];
        let oper = [ "$all", "$in", "$nin" ];

        tag_regexs.forEach((e, i) => {
            if(e[oper[i]].length != 0){
                switch(i){
                    case 0:
                    case 1: 
                        tag_field.forEach((te, ti) => {
                            tag_and[ti].$and.push({ [te] : e });
                        });
                    break;
                    case 2:
                        
                        tag_field.forEach((te, ti) => {
                            ninAndQuery.$and.push({ [te] : e });
                        });
                        break;
                }
            }
        });
        
        query_regexs.forEach((e, i) => {
            if(e[oper[i]].length != 0){
                switch(i){                    
                    case 0:
                    case 1:
                        query_field.forEach((qe, qi) => {
                            query_and[qi].$and.push({ [qe] : e })
                        });
                        break;
                    case 2:
                        query_field.forEach((qe, qi) => {
                            ninAndQuery.$and.push({ [qe] : e })
                        });
                        break;
                }
            }
        });
        
        if(ninAndQuery.$and.length != 0) photoQuery.$and.push(ninAndQuery);

        for(var tmp of tag_and){
            if(tmp.$and.length != 0) orQuery.$or.push(tmp);
        }

        for(var tmp of query_and){
            if(tmp.$and.length != 0) orQuery.$or.push(tmp);
        }

        if(orQuery.$or.length != 0) photoQuery.$and.push(orQuery)


        console.log(JSON.stringify(photoQuery));

        const photoResult = await mongoose.model("photos", photoSchema, "photos").find(photoQuery);

        let albumAndQuery = [];
        query_regexs.forEach((e, i) => {
            if(e[oper[i]].length != 0){
                albumAndQuery.push({ "album.title" : query_regexs[i] });
            }
        });
        if(day_regexs.$all.length != 0) albumAndQuery.push({ "album.title" : day_regexs });
        console.log(JSON.stringify(albumAndQuery));

        const albumResult = await mongoose.model("photos", photoSchema, "photos").aggregate([
            {
                $match: { 
                    userId: androidId,
                    "album.type" : "customAlbum",
                    $and: albumAndQuery
                }
            }, {
                $group: {
                    _id: "$album.title",
                    title: { $first: "$album.title" },
                    type: { $first: "$album.type" },
                    thumbnail: { $first: "$album.thumbnail" },
                }
            }, {
                $project: { _id : 0 }
            }
        ]);

        var resJson = {
            "photoResult": photoResult,
            "albumResult": albumResult,
        };

        console.log(resJson);

        res.json(resJson);

    } catch(err){
        console.log(err);
        res.status(500);
        res.json({ "resJson": "ERROR" });
    }
})

module.exports = router;
