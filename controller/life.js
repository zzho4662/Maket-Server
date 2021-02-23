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
    let offset = req.query.offset;
    let limit = req.query.limit;
    let user_id = req.user.id;

    let query = `select l.*,u.nickname, ifnull((select count(life_id) from life_interest where life_id = l.id and user_id = ${user_id} group by life_id),0) as interest_cnt, 
                 ifnull((select count(life_id) from life_comment where life_id = l.id group by life_id),0) as com_cnt
                 from neighbor_life as l left join market_user as u on l.user_id = u.id 
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

// @desc 동네 글 상세보기
// @route POST /api/v1/life/detail
// @request life_id,
// @response success, items

exports.detailBoard = async(req,res,next) =>{
  let life_id = req.query.life_id;
  let user_id = req.user.id;

  let query = `select l.*,u.nickname,(select count(*) from life_interest where life_id = ${life_id} and user_id = ${user_id}) as interest_cnt,
               ifnull((select count(life_id) from life_comment where life_id = l.id group by life_id),0) as com_cnt
               from neighbor_life as l join market_user as u on l.user_id = u.id where l.id = ${life_id}`;
  console.log(query);
  try {
    [rows] = await connection.query(query);
    res.status(200).json({items:rows });
    return;
  } catch (e) {
    res.status(500).json();
    return;
  }
};

// @desc 동네 글 수정하기
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
  let commentquery = `delete from life_comment where life_id =  ${life_id}`
  
  try {
    [result] = await connection.query(commentquery);
    console.log(commentquery)
    res.status(200).json({ success: true, message: "삭제되었습니다" });
  } catch (e) {
    res.status(500).json();
    return;
  }
  
};

// @desc 동네 글 주제별로 보여주기
// @route GET /api/v1/life/title
// @request order, title
// @response success, items

exports.getTitlelist = async (req, res, next) => {
  let title = req.query.title;
  let order = req.query.order;

  let query = `select l.*,u.nickname from neighbor_life as l left join market_user as u on l.user_id = u.id 
               where l.title like '%${title}%' order by created_at ${order}`
               
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

// @desc 동네 글 검색하기
// @route GET /api/v1/life/search
// @request keyword
// @response success, items

exports.searchLife = async(req,res,next) =>{
  let keyword = req.body.keyword;

let query = `select l.*,u.nickname,u.location from neighbor_life as l left join market_user as u on l.user_id = u.id 
               where l.title like '%${keyword}%' or l.content like '%${keyword}%' order by created_at desc`
               
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


// @desc 동네 글 댓글 보기
// @route GET /api/v1/life/comment
// @request life_id
// @response success, items

exports.getComment = async (req, res, next) => {
  let life_id = req.query.life_id;
  let order = req.query.order;

  let query = `select c.*,u.nickname, (select exists(select * from life_com_comment where comment_id = c.id)) as parent_id
               from life_comment as c left join market_user as u on c.user_id = u.id
               where life_id = ${life_id} order by created_at ${order}`;
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

// @desc 동네 글 댓글달기
// @route POST /api/v1/life/comment
// @request user_id(auth), life_id, comment
// @response success, items
exports.addComment = async (req, res, next) => {
  let user_id = req.user.id;
  let life_id = req.body.life_id;
  let comment = req.body.comment;

  let query = `insert into life_comment (life_id, comment, user_id) values (
    ${life_id}, "${comment}",${user_id})`;
  console.log(query);
  
  let qur = `select u.nickname,u.location ,c.* from life_comment as c left join market_user as u on c.user_id = u.id 
             where life_id = ${life_id} order by created_at asc`;
  console.log(qur);
  try {
      [result] = await connection.query(query);
      [rows] = await connection.query(qur);
      res.status(200).json({ success: true, items: rows, cnt: rows.length });
      } catch (e) {
      res.status(500).json({ error: e });
      }
};



// @desc 동네 글 댓글 수정하기
// @route POST /api/v1/life/upcomment
// @request user_id(auth), life_id, comment,id
// @response success, items
exports.updateComment = async (req, res, next) => {
  let user_id = req.user.id;
  let id = req.body.id;
  let comment = req.body.comment;
  let life_id = req.body.life_id;

  let query = `select * from life_comment where id = ${id}`;
  try {
    [rows] = await connection.query(query);
    if (rows[0].user_id != user_id) {
      res.status(401).json({ message: "자신의 아이디가 아닙니다." });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "여기인거같은데" });
    return;
  }

  query = `update life_comment set comment = "${comment}"  where id = ${id}`;
  let qur = `select u.nickname,u.location ,c.* from life_comment as c left join market_user as u on c.user_id = u.id 
             where life_id = ${life_id} order by created_at asc  `;
  console.log(query);

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


// @desc 동네 글 댓글 삭제하기
// @route POST /api/v1/life/delcomment
// @request user_id(auth), life_id
// @response success, items
exports.deleteComment = async (req, res, next) => {
  let user_id = req.user.id;
  let id = req.body.id;
  let life_id = req.body.life_id;

  let query = `select * from life_comment where id = ${id}`;
  try {
    [rows] = await connection.query(query);
    if (rows[0].user_id != user_id) {
      res.status(401).json({ message: "자신의 아이디가 아닙니다." });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "여기인거같은데" });
    return;
  }

  query = `delete from life_comment where id = ${id} and life_id = ${life_id}`;
  console.log(query);
  let qur = `select u.nickname,u.location ,c.* from life_comment as c left join market_user as u on c.user_id = u.id 
             where life_id = ${life_id} order by created_at asc  `;

  try {
    [result] = await connection.query(query);
    [rows] = await connection.query(qur);
    res
      .status(200)
      .json({ success: true, message: "삭제되었습니다.", items: rows, cnt:rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};


// @desc 동네 글 댓글에 댓글달기
// @route POST /api/v1/life/comment/comment
// @request user_id(auth), life_id, comment_id, comment
// @response success, items

exports.upupComment = async(req,res,next) =>{
    let user_id = req.user.id;
    let comment_id= req.body.comment_id;
    let life_id = req.body.life_id;
    let comment = req.body.comment;

    let query = `insert into life_com_comment (life_id, comment_id, comment, user_id) values (${life_id},${comment_id}, "${comment}",${user_id})`;
    console.log(query);
  
    let qur = `select u.nickname,u.location ,c.* from life_com_comment as c left join market_user as u on c.user_id = u.id 
             where life_id = ${life_id} order by created_at asc`;
    console.log(qur);
    try {
          [result] = await connection.query(query);
          [rows] = await connection.query(qur);
          res.status(200).json({ success: true, items: rows, cnt: rows.length });
    } catch (e) {
          res.status(500).json({ error: e });
    }
}

// @desc 동네 글 대댓글 최신순으로 보기
// @route GET /api/v1/life/comment/comment
// @request life_id, comment_id
// @response success, items

exports.getComComment = async(req,res,next) =>{
  let comment_id= req.query.comment_id;
  let life_id = req.query.life_id;

  let query = `select u.nickname,u.location ,c.* from life_com_comment as c left join market_user as u on c.user_id = u.id 
               where life_id = ${life_id} and comment_id = ${comment_id} order by created_at asc`;

  try {
        [rows] = await connection.query(query);
        res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
        res.status(500).json({ error: e });
  }
}

// @desc 동네 글 관심목록 추가
// @route POST /api/v1/life/interest
// @request user_id(auth), life_id
// @response success, items

exports.interestLife = async(req,res,next) =>{
  let user_id = req.user.id;
  let life_id = req.body.life_id;

  let query = `insert into life_interest (life_id, user_id) values (${life_id} , ${user_id})`;
  let qur = `select * , (select count(*) from life_interest where user_id = ${user_id} and life_id = ${life_id})as interest_cnt 
             from neighbor_life where id = ${life_id};`;

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
}

// @desc 동네 글 관심목록 제외
// @route POST /api/v1/life/interest/delete
// @request user_id(auth), life_id
// @response success, items

exports.uninterestLife = async(req,res,next) =>{
  let user_id = req.user.id;
  let life_id = req.body.life_id;

  let query = `delete from life_interest where user_id = ${user_id} and life_id = ${life_id}`;
  let qur = `select * , (select count(*) from life_interest where user_id = ${user_id} and life_id = ${life_id})as interest_cnt 
             from neighbor_life where id = ${life_id};`;

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

// @desc 동네 글 중 내가 쓴 글만 보여주기
// @route GET /api/v1/life/mylife
// @request user_id(auth)
// @response success, items

exports.mylife = async(req,res,next) =>{
  let user_id = req.user.id;

  let query = `select * from neighbor_life where user_id = ${user_id} order by created_at desc;`;

  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt : rows.length });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

// @desc 동네 글 중 내가 쓴 댓글만 쓴 글 보여주기
// @route GET /api/v1/life/mylife/comment
// @request user_id(auth)
// @response success, items

exports.mylifecomment = async(req,res,next) =>{
  let user_id = req.user.id;

  let query = `select n.content,c.id as comment_id, null as com_comment_id, c.user_id as user_id, c.life_id as id, c.comment as comment, c.created_at as created_at 
               from neighbor_life as n join life_comment as c on n.id = c.life_id where c.user_id = ${user_id}
               union
               select n.content, null as comment_id, cc.id as com_comment_id, cc.user_id as user_id, cc.life_id as id, cc.comment as comment, cc.created_at as created_at 
               from neighbor_life as n join life_com_comment as cc on n.id = cc.life_id where cc.user_id = ${user_id}`;

  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt : rows.length });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};


// @desc 관심목록 추가한 동네 글만 가져오기
// @route GET /api/v1/life/interestlife
// @request user_id(auth)
// @response success, items

exports.myinterestlife = async(req,res,next) =>{
  let offset = req.query.offset;
  let limit = req.query.limit;
  let user_id = req.user.id;

  let query = `select l.*,u.nickname, ifnull((select count(life_id) from life_interest where life_id = l.id and user_id = ${user_id} group by life_id),0) as interest_cnt, 
  ifnull((select count(life_id) from life_comment where life_id = l.id group by life_id),0) as com_cnt
  from neighbor_life as l left join market_user as u on l.user_id = u.id 
  where ifnull((select count(life_id) from life_interest where life_id = l.id and user_id = 16 group by life_id),0) = 1 order by created_at desc limit ${offset} , ${limit};`;

  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt : rows.length });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};
