const path = require("path");
const connection = require("../db/mysql_connection");

const {query} = require("express");

// @desc 게시글 업로드 하는 API
// @route POST /api/v1/life/
// @request user_id(auth),title,content
// @response success

exports.LifeUpload = async (req, res, next) => {
    let user_id = req.user.id;
    let title = req.body.title;
    let content = req.body.content;

    if (!user_id || !title || !content) {
        res
            .status(400)
            .json({message: "hi"});
        return;
    }

    let query = `insert into neighbor_life (title, content, user_id) values (
        "${title}", "${content}",${user_id})`;
    console.log(query);
    try {
        [result] = await connection.query(query);
    } catch (e) {
        res
            .status(500)
            .json({success: false});
        return;
    }

    query = `select * from neighbor_life where user_id = ${user_id} order by created_at desc limit 1`;
    console.log(query);

    try {
        [data] = await connection.query(query);
        res
            .status(200)
            .json({data: data});
    } catch (e) {
        res
            .status(500)
            .json({success: false});
        return;
    }
}

// @desc 최신글 보여주기
// @route GET /api/v1/life
// @request order
// @response success, items

exports.getLifelist = async (req, res, next) => {
    let order = req.query.order;

    let query = `select l.*,u.nickname from neighbor_life as l left join market_user as u on l.user_id = u.id 
                 order by created_at ${order}`;
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

// @desc 글 수정하기
// @route POST /api/v1/life/update
// @request life_id, title, content
// @response success, items

exports.updateBoard = async (req, res, next) => {
  let life_id = req.body.life_id;
  let user_id = req.user.id;
  let title = req.body.title;
  let content = req.body.content;

  let query = `select * from neighbor_life where id = ${life_id}`;
  console.log(query);
  
  try {
    [rows] = await connection.query(query);
    // 다른사람이 쓴 글을, 이 사람이 바꾸려고 하면, 401로 보낸다.
    if (rows[0].user_id != user_id) {
      res.status(401).json({ message: "자신의 아이디가 아닙니다." });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "위치 확인" });
    return;
  }

  query = `update neighbor_life set content = "${content}" , title = "${title}" where id = ${life_id}`;

  let qur = `select u.nickname ,l.* from neighbor_life as l join market_user as u on l.user_id = u.id where l.id = ${life_id}`;

  try {
    [result] = await connection.query(query);
    [rows] = await connection.query(qur);
    res
      .status(200)
      .json({ success: true, message: "수정되었습니다.", items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc    동네 게시글 삭제하기
// @route   Delete /api/v1/life/delete
// @request life_id,  user_id
// @response success, items

exports.deleteBoard = async (req, res, next) => {
  let user_id = req.user.id;
  let life_id = req.body.life_id;

  // 해당 유저의 게시글이 맞는지 체크
  let query = `select * from neighbor_life where id = ${life_id}`;

  try {
    [rows] = await connection.query(query);
    if (rows[0].user_id != user_id) {
      res.status(401).json({ message: "자신의 아이디가 아닙니다." });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "위치 확인" });
    return;
  }

  let boardquery = `delete from neighbor_life where id = ${life_id}`;

  try {
    [result] = await connection.query(boardquery);
    res.status(200).json({ success: true, message: "삭제되었습니다" });
    console.log(boardquery)
  } catch (e) {
    res.status(500).json();
    return;
  }
  // let commentquery = `delete from p_comment where board_id =  ${board_id}`
  
  // try {
  //   [result] = await connection.query(commentquery);
  //   console.log(commentquery)
  //   res.status(200).json({ success: true, message: "삭제되었습니다" });
  //   return;
  // } catch (e) {
  //   res.status(500).json();
  //   return;
  // }
  
};
  

  
// @desc   즐겨찾기 게시글 추가
// @route   POST /api/v1/life/favorite
// @request life_id, user_id(auth)
// @response success, items

exports.addFavorite = async (req, res, next) => {
    // 즐겨찾기에 이미 추가된 게시글은, 즐겨찾기에 추가되지 않도록 한다.
    let life_id = req.body.life_id;
    let user_id = req.user.id;

    if (!life_id) {
        res.status(400).json();
        return;
      }

    let query = `insert into life_like (life_id, user_id) values (${life_id} , ${user_id})`;
    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as favorite_cnt from neighbor_life as l 
               join life_like as f on l.id = f.life_id where l.id = ${life_id} limit 1;`;

    
    try {
        [result] = await connection.query(query);
        [rows] = await connection.query(qur);
        res
            .status(200)
            .json({success: true, items:rows});
    } catch (e) {
        if (e.errno == 1062) {
            res
                .status(401)
                .json({message: "이미 즐겨찾기에 추가되었습니다."});
        } else {
            res
                .status(500)
                .json({error: e});
        }
    }
};

// @desc    즐겨찾기 삭제
// @route   DELETE  /api/v1/life/favorite
// @request  life_id, user_id(auth)
// @response success, items

exports.deleteFavorite = async (req, res, next) => {
    let life_id = req.body.life_id;
    let user_id = req.user.id
  
    if (!life_id) {
      res.status(400).json();
      return;
    }
  
    let query = `delete from life_like where life_id = ${life_id} and user_id = ${user_id}`;
    console.log(query);
  
    try {
      [result] = await connection.query(query);
      res.status(200).json({ success: true ,message:"성공"});
    } catch (e) {
      res.status(500).json({success : false , message:"즐겨찾기 추가가 안되어있습니다."});
    }
  };


