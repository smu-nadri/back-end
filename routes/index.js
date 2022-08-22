const express = require("express");
const photoSchema = require("../schemas/photo");
const tagSchema = require("../schemas/tags");
const albumSchema = require("../schemas/album");
const mongoose = require("mongoose");
const router = express.Router();

//앨범 목록 보내주기
router.get("/:id", async (req, res) => {
    try {
        const androidId = req.params.id;
        const albumId = "album" + androidId;

        const result = await mongoose.model(albumId, albumSchema, albumId).find({});

        console.log(result);

        res.json({"resJson": result});
    } catch (err) {
        console.error(err);
    }
})

//해당 앨범의 사진들 보내주기
router.get("/:id/:title", async (req, res) => {
    try{
        const androidId = req.params.id;

        const result = await mongoose.model(androidId, photoSchema, androidId).find({
            pages: { $elemMatch : { albumTitle: req.params.title } },
        });
        console.log(result);
        res.json(result);

    } catch(err) {
        console.error(err);
    }
});

//받은 사진들 저장하기
router.post("/:id/:title", async (req, res) => {
    try{
        const androidId = req.params.id;
        const albumId = "album" + androidId;

        console.log(req.body);
        
        //사진들
        const photos = req.body.photos;
        const deletedList = req.body.deletedList;

        var resJson = new Array();

        /*
        //첫 생성시 앨범 목록에 추가
        const albumsave = await mongoose.model(albumId, albumSchema, albumId).findOneAndUpdate({
            title: req.params.title,
        }, {
            $setOnInsert: {
                title: req.params.title,
                albumTumbnail: photos[0].uri,
                albumType: "dateAlbum",
            }
        }, {
            upsert: true,
            new: true,
        });
        console.log("앨범 저장: ", albumsave);*/

        //사진 삭제(고쳐야함)
        for(idx in deletedList){
            await mongoose.model(androidId, photoSchema, androidId).deleteOne({
                _id: deletedList._id,
            })
        }
        
        //사진 생성 및 수정
        for(idx in photos){
            console.log(idx, ": ", photos[idx]);
            const photo = photos[idx];
            var result;

            if(photo._id) {
                result = await mongoose.model(androidId, photoSchema, androidId).findOneAndUpdate({
                    _id: photo._id 
                }, {
                    $set: {
                        comment: photo.comment,
                        page: photo.page,
                    }
                }, {
                    new: true
                });
            }
            else {
                var datetime; 
                try {
                    datetime = new Date(photo.datetime);
                } catch (error) {
                    console.log(error);
                };

                result = await mongoose.model(androidId, photoSchema, androidId).create({
                    uri: photo.uri,
                    datetime: datetime,
                    location: photo.location,
                    comment: photo.comment,
                    page: photo.page,
                });
            }
            console.log("result : ", result);
            resJson.push(result);
        };

        res.json({"resJson": resJson});
    
    } catch(err) {
        console.log(err);
        res.json({"resJson": "ERROR"});
    }
});

router.get("/:id/search", async (req, res) => {
    const androidId = req.params.id;
    const albumId = androidId+"album";
    const query = req.query;
    console.log(query);

})

module.exports = router;
