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
    let querySelect = `select m.*, i.image as thumbnail from market as m join market_image as i on m.id = i.market_id where m.id ="${market_id}"`;
    
    try {
      [result] = await connection.query(query);
      [rows] = await connection.query(querySelect);
      res.status(200).json({ success: true , items : rows ,  cnt : rows.length});
    
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
  let user_id = req.user.id;

  let query = `select m.*, u.nickname, ifnull((select count(market_id) from market_like where market_id = m.id and user_id = ${user_id} group by market_id),0) as interest_cnt, 
              (select image from market_image where market_id = m.id order by image limit 1) as thumbnail 
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

// @desc 중고거래 글 상세보기
// @route GET /api/v1/posts/detail
// @request market_id
// @response success, items, imgeTree

exports.detailMarket = async (req, res, next) => {
  let market_id = req.query.market_id;
  let user_id = req.user.id;

  let query = ` insert into market_boardview(market_id, user_id, boardview)
                values(${market_id}, ${user_id}, now())
                ON DUPLICATE KEY UPDATE boardview = now()`;

  try {
    if (!user_id) {
      user_id = 0;
                  }
      [rows] = await connection.query(query);
    } catch (e) {
      console.log(e);
      res.status(500).json();
      return;
  }


  query = `select m.*, u.nickname, u.location, (select count(*) from market_boardview where market_id =${market_id}) as view_cnt , 
           ifnull((select count(market_id) from market_like where market_id = m.id and user_id = ${user_id} group by market_id),0) as interest_cnt 
               from market as m left join market_user as u on m.user_id = u.id where m.id = ${market_id}`
  let query1 = `select image from market_image where market_id = ${market_id}`

  console.log(query);
  try {
    [rows] = await connection.query(query);
    [rows1] = await connection.query(query1);
  
    res
        .status(200)
        .json({success: true, items: rows, imageTree : rows1 ,cnt: rows1.length});
  } catch (e) {
    console.log(e);
    res
        .status(400)
        .json({success: false});
  }
};


// @desc 중고거래 관심목록 추가
// @route POST /api/v1/posts/interest
// @request user_id(auth), market_id
// @response success, items

exports.interestMarket = async(req,res,next) =>{
  let user_id = req.user.id;
  let market_id = req.body.market_id;

  let query = `insert into market_like (market_id, user_id) values (${market_id} , ${user_id})`;
  let qur = `select * , (select count(*) from market_like where user_id = ${user_id} and market_id = ${market_id})as interest_cnt 
             from market where id = ${market_id};`;

  console.log(query);
  console.log(qur);

  try {
    [result] = await connection.query(query);
    [rows] = await connection.query(qur);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(500).json({ message: "이미 즐겨찾기에 추가되었습니다." });
    } else {
      res.status(500).json({ error: e });
    }
  }
};

// @desc 중고거래 관심목록 제외
// @route DELETE /api/v1/posts/interest
// @request user_id(auth), life_id
// @response success, items

exports.uninterestMarket = async(req,res,next) =>{
  let user_id = req.user.id;
  let market_id = req.body.market_id;

  let query = `delete from market_like where user_id = ${user_id} and market_id = ${market_id}`;
  let qur = `select * , (select count(*) from market_like where user_id = ${user_id} and market_id = ${market_id})as interest_cnt 
             from market where id = ${market_id};`;

  console.log(query);
  console.log(qur);

  try {
    [result] = await connection.query(query);
    [rows] = await connection.query(qur);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};


// @desc 관심목록 추가한 중고 글만 가져오기
// @route GET /api/v1/posts/myinterestMarket
// @request user_id(auth)
// @response success, items

exports.myinterestMarket = async(req,res,next) =>{
  let offset = req.query.offset;
  let limit = req.query.limit;
  let user_id = req.user.id;

  let query = `select m.*,u.nickname, ifnull((select count(market_id) from market_like where market_id = m.id and user_id = ${user_id} group by market_id),0) as interest_cnt, 
  ifnull((select count(market_id) from market_comment where market_id = m.id group by market_id),0) as com_cnt,
  (select count(*) from market_like as ml where ml.market_id = m.id) as like_cnt
  from market as m left join market_user as u on m.user_id = u.id 
  where ifnull((select count(market_id) from market_like where market_id = m.id and user_id = ${user_id} group by market_id),0) = 1 order by created_at desc limit ${offset}, ${limit}`

  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt : rows.length });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};