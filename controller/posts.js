const path = require("path");
const connection = require("../db/mysql_connection");

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
  let market_id;

  let query =
    "insert into market (user_id, category, title, content, price) \
                values (?,?,?,?,?)";

  let data = [user_id, category, title, content, price];

  // let query1 = `select id, user_id from market where user_id = ${user_id} order by created_at desc limit 1`;

  // console.log(query1);
   try {
    [result] = await connection.query(query, data);
    //[rows] = await connection.query(query1)
    res.status(200).json({ success: true , items : rows});
    //market_id = rows[0].id ;
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

let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

photo.mv(fileUploadPath, async (err) => {
  if (err) {
    console.log(err);
    return;
  }
});

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
console.log(query);
console.log(querySelect);
try {
  [result] = await connection.query(query);
  [rows] = await connection.query(querySelect);
  res.status(200).json({ success: true , items : rows , cnt : rows.length});

} catch (e) {
  res.status(500).json({ error: e });
  return;
}
};

