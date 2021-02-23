const path = require("path");
const connection = require("../db/mysql_connection");
var AWS = require('aws-sdk');
var fs = require('fs');
require('dotenv').config({path: __dirname + '\\' + '.env'});

//
// @desc        중고거래 업로드 하는 API
// @route       POST /api/v1/posts
// @request     photo, content, user_id(auth)
// @response    success
exports.uploadNew = async (req, res, next) => {
  let user_id = req.user.id;
  let category = req.body.category;
  let title = req.body.title;
  let content = req.body.content;
  let price = req.body.price;

  let query =
    "insert into market (user_id, category, title, content, price) \
                values (?,?,?,?,?)";

  let data = [user_id, category, title, content, price];

  let query1 = `select m.*, u.nickname from market as m join market_user as u on m.user_id = u.id where user_id = ${user_id} order by id desc limit 1 `;

   try {
    [result] = await connection.query(query, data);
    [rows] = await connection.query(query1);
    res.status(200).json({ success: true , items : rows, cnt : rows.length});
  } catch (e) {
    res.status(500).json({ error: e });
    return;
  }
};

// @desc        중고거래 이미지 업로드 하는 API
// @route       POST /api/v1/posts
// @request     photo, content, user_id(auth)
// @response    success
exports.uploadImage = async (req, res, next) => {
  let user_id = req.user.id;
  let photo = req.files.photo;
  let market_id;

 // 이미지
 if (photo.mimetype.startsWith("image") == false) {
  res.stats(400).json({ message: "사진 파일 아닙니다." });
  return;
}

if (photo.size > process.env.MAX_FILE_SIZE) {
  res.stats(400).json({ message: "파일 크기가 너무 큽니다." });
  return;
}

photo.name = `photo_${user_id}_${Date.now()}${path.parse(photo.name).ext}`;

// S3에 올릴 때는 필요없어지는 부분
  // let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  // photo.mv(fileUploadPath, async (err) => {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  // });

  // S3에 올릴 때 필요한 부분
  // 1. S3 의 버킷 이름과 aws 의 credential.csv 파일의 정보를 셋팅한다.
  let file = photo.data;

  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: `ap-northeast-2`
  });

  // 2. S3에 파일 업로드를 위한 파라미터를 설정한다.
  // S3를 퍼블릭으로 설정해야 읽어올 수 있다.
  const s3 = new AWS.S3();
  let params = {
    Bucket: process.env.S3_BUCKET,
    Key: photo.name,
    Body: file,
    ContentType: path.parse(photo.name).ext.split(".")[1],
    ACL: "public-read",
  };

  // S3에 파일을 업로드 하고, 성공하면 디비에 파일명 저장한다.
  s3.upload(params, async function (err, s3Data) {
    
    if(err){
      console.log(err);
    }else{
      console.log(s3Data);
    }
    // err이 null이면 업로드에 성공한 것

let query1 = `select id, user_id from market where user_id = "${user_id}" order by created_at desc limit 1`;
console.log(query1);
try {
  [rows] = await connection.query(query1)
  market_id = rows[0].id;
} catch (e) {
  res.status(500).json({ error: e });
  return;
}
  

let query = `insert into market_image (image , market_id, user_id) values ("${photo.name}", "${market_id}", "${user_id}")`;
let querySelect = `select m.*, i.image from market as m join market_image as i on m.id = i.market_id where m.id ="${market_id}"`;

try {
  [result] = await connection.query(query);
  [rows] = await connection.query(querySelect);
  res.status(200).json({ success: true , items : rows , cnt : rows.length});

} catch (e) {
  res.status(500).json({ error: e });
  return;
}
});
};

// @desc 중고거래 최신글 보여주기
// @route GET /api/v1/posts
// @request order
// @response success, items

exports.getMarketlist = async (req, res, next) => {
  let order = req.query.order;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select m.*, u.nickname, (select image from market_image where market_id = m.id order by image limit 1) as thumbnail 
               from market as m left join market_user as u on m.user_id = u.id 
               order by created_at ${order} limit ${offset}, ${limit}`;

  console.log(query);

  try {
      [rows] = await connection.query(query);
      res
          .status(200)
          .json({success: true, items: rows, cnt: rows.length});
  } catch (e) {
      console.log(e);
      res
          .status(400)
          .json({success: false});
  }
};

// // @desc 중고거래 썸네일 가져오기
// // @route GET /api/v1/posts/thumbnail
// // @request 
// // @response success, items

// exports.getThumbnail = async (req, res, next) => {

//   let query1 = `select m.id from market as m order by created_at `

//   try {
//       [rows] = await connection.query(query1);
//       market_id = rows[0].id;
//   } catch (e) {
//     res.status(500).json({ error: e });
//     return;
//   }

//   let query = `select id, image from market_image where market_id = ${market_id} order by id asc limit 1`
//   console.log(query);
//   try {
//     [rows] = await connection.query(query);
//     res.status(200).json({ success: true , items : rows , cnt : rows.length});
  
//   } catch (e) {
//     res.status(500).json({ error: e });
//     return;
//   }
// };



