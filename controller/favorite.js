const path = require("path");
const connection = require("../db/mysql_connection");

const {query} = require("express");

// @desc   동네 글 공감(좋아요) 추가
// @route   POST /api/v1/life/favorite
// @request life_id, user_id(auth)
// @response success, items

// test
exports.addFavorite = async (req, res, next) => {
    // 즐겨찾기에 이미 추가된 게시글은, 즐겨찾기에 추가되지 않도록 한다.
    let life_id = req.body.life_id;
    let user_id = req.user.id;
  
    if (!life_id) {
        res.status(400).json();
        return;
      }
  
    let query = `insert into life_like (life_id, user_id) values (${life_id} , ${user_id})`;
    let bestdel = `delete from life_best where life_id = ${life_id} and user_id = ${user_id}`
    let smiledel = `delete from life_smile where life_id = ${life_id} and user_id = ${user_id}`
    let surprisedel = `delete from life_surprise where life_id = ${life_id} and user_id = ${user_id}`
    let saddel = `delete from life_sad where life_id = ${life_id} and user_id = ${user_id}`
    let hatedel = `delete from life_hate where life_id = ${life_id} and user_id = ${user_id}`

    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
  
    
    try {
        [result] = await connection.query(query);
        [result] = await connection.query(bestdel);
        [result] = await connection.query(smiledel);
        [result] = await connection.query(surprisedel);
        [result] = await connection.query(saddel);
        [result] = await connection.query(hatedel);
        [rows] = await connection.query(qur);
        
        res.status(200).json({success: true, items:rows});
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
  
  // @desc    동네 글 공감(좋아요) 삭제
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

    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
    try {
      [result] = await connection.query(query);
      [rows] = await connection.query(qur);
      res.status(200).json({ success: true , items:rows});
    } catch (e) {
      res.status(500).json({success : false , message:"즐겨찾기 추가가 안되어있습니다."});
    }
  };

// @desc   동네 글 공감(최고) 추가
// @route   POST /api/v1/life/best
// @request life_id, user_id(auth)
// @response success, items

exports.addBest = async (req, res, next) => {
    // 즐겨찾기에 이미 추가된 게시글은, 즐겨찾기에 추가되지 않도록 한다.
    let life_id = req.body.life_id;
    let user_id = req.user.id;
  
    if (!life_id) {
        res.status(400).json();
        return;
      }
  
    let query = `insert into life_best (life_id, user_id) values (${life_id} , ${user_id})`;
    let likedel = `delete from life_like where life_id = ${life_id} and user_id = ${user_id}`
    let smiledel = `delete from life_smile where life_id = ${life_id} and user_id = ${user_id}`
    let surprisedel = `delete from life_surprise where life_id = ${life_id} and user_id = ${user_id}`
    let saddel = `delete from life_sad where life_id = ${life_id} and user_id = ${user_id}`
    let hatedel = `delete from life_hate where life_id = ${life_id} and user_id = ${user_id}`

    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
  
    
    try {
        [result] = await connection.query(query);
        [result] = await connection.query(likedel);
        [result] = await connection.query(smiledel);
        [result] = await connection.query(surprisedel);
        [result] = await connection.query(saddel);
        [result] = await connection.query(hatedel);
        [rows] = await connection.query(qur);
        
        res.status(200).json({success: true, items:rows});
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

// @desc    동네 글 공감(최고) 삭제
// @route   DELETE  /api/v1/life/best
// @request  life_id, user_id(auth)
// @response success, items
  
  exports.deleteBest = async (req, res, next) => {
    let life_id = req.body.life_id;
    let user_id = req.user.id
  
    if (!life_id) {
      res.status(400).json();
      return;
    }
  
    let query = `delete from life_best where life_id = ${life_id} and user_id = ${user_id}`;
    console.log(query);
  
    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
    try {
      [result] = await connection.query(query);
      [rows] = await connection.query(qur);
      res.status(200).json({ success: true , items:rows});
    } catch (e) {
      res.status(500).json({success : false , message:"즐겨찾기 추가가 안되어있습니다."});
    }
  };


// @desc   동네 글 공감(웃음) 추가
// @route   POST /api/v1/life/smile
// @request life_id, user_id(auth)
// @response success, items

exports.addSmile = async (req, res, next) => {
    // 즐겨찾기에 이미 추가된 게시글은, 즐겨찾기에 추가되지 않도록 한다.
    let life_id = req.body.life_id;
    let user_id = req.user.id;
  
    if (!life_id) {
        res.status(400).json();
        return;
      }
  
    let query = `insert into life_smile (life_id, user_id) values (${life_id} , ${user_id})`;
    let likedel = `delete from life_like where life_id = ${life_id} and user_id = ${user_id}`
    let bestdel = `delete from life_best where life_id = ${life_id} and user_id = ${user_id}`
    let surprisedel = `delete from life_surprise where life_id = ${life_id} and user_id = ${user_id}`
    let saddel = `delete from life_sad where life_id = ${life_id} and user_id = ${user_id}`
    let hatedel = `delete from life_hate where life_id = ${life_id} and user_id = ${user_id}`

    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
  
    
    try {
        [result] = await connection.query(query);
        [result] = await connection.query(likedel);
        [result] = await connection.query(bestdel);
        [result] = await connection.query(surprisedel);
        [result] = await connection.query(saddel);
        [result] = await connection.query(hatedel);
        [rows] = await connection.query(qur);
        
        res.status(200).json({success: true, items:rows});
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

// @desc    동네 글 공감(웃음) 삭제
// @route   DELETE  /api/v1/life/smile
// @request  life_id, user_id(auth)
// @response success, items
  
  exports.deleteSmile = async (req, res, next) => {
    let life_id = req.body.life_id;
    let user_id = req.user.id
  
    if (!life_id) {
      res.status(400).json();
      return;
    }
  
    let query = `delete from life_smile where life_id = ${life_id} and user_id = ${user_id}`;
    console.log(query);
  
    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
    try {
      [result] = await connection.query(query);
      [rows] = await connection.query(qur);
      res.status(200).json({ success: true , items:rows});
    } catch (e) {
      res.status(500).json({success : false , message:"즐겨찾기 추가가 안되어있습니다."});
    }
  };



// @desc   동네 글 공감(놀람) 추가
// @route   POST /api/v1/life/surprise
// @request life_id, user_id(auth)
// @response success, items

exports.addSurprise = async (req, res, next) => {
    // 즐겨찾기에 이미 추가된 게시글은, 즐겨찾기에 추가되지 않도록 한다.
    let life_id = req.body.life_id;
    let user_id = req.user.id;
  
    if (!life_id) {
        res.status(400).json();
        return;
      }
  
    let query = `insert into life_surprise (life_id, user_id) values (${life_id} , ${user_id})`;
    let likedel = `delete from life_like where life_id = ${life_id} and user_id = ${user_id}`
    let bestdel = `delete from life_best where life_id = ${life_id} and user_id = ${user_id}`
    let smiledel = `delete from life_smile where life_id = ${life_id} and user_id = ${user_id}`
    let saddel = `delete from life_sad where life_id = ${life_id} and user_id = ${user_id}`
    let hatedel = `delete from life_hate where life_id = ${life_id} and user_id = ${user_id}`

    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
  
    
    try {
        [result] = await connection.query(query);
        [result] = await connection.query(likedel);
        [result] = await connection.query(bestdel);
        [result] = await connection.query(smiledel);
        [result] = await connection.query(saddel);
        [result] = await connection.query(hatedel);
        [rows] = await connection.query(qur);
        
        res.status(200).json({success: true, items:rows});
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

// @desc    동네 글 공감(놀람) 삭제
// @route   DELETE  /api/v1/life/surprise
// @request  life_id, user_id(auth)
// @response success, items
  
  exports.deleteSurprise = async (req, res, next) => {
    let life_id = req.body.life_id;
    let user_id = req.user.id
  
    if (!life_id) {
      res.status(400).json();
      return;
    }
  
    let query = `delete from life_surprise where life_id = ${life_id} and user_id = ${user_id}`;
    console.log(query);
  
    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
    try {
      [result] = await connection.query(query);
      [rows] = await connection.query(qur);
      res.status(200).json({ success: true , items:rows});
    } catch (e) {
      res.status(500).json({success : false , message:"즐겨찾기 추가가 안되어있습니다."});
    }
  };

// @desc   동네 글 공감(슬픔) 추가
// @route   POST /api/v1/life/sad
// @request life_id, user_id(auth)
// @response success, items

exports.addSad = async (req, res, next) => {
    // 즐겨찾기에 이미 추가된 게시글은, 즐겨찾기에 추가되지 않도록 한다.
    let life_id = req.body.life_id;
    let user_id = req.user.id;
  
    if (!life_id) {
        res.status(400).json();
        return;
      }
  
    let query = `insert into life_sad (life_id, user_id) values (${life_id} , ${user_id})`;
    let likedel = `delete from life_like where life_id = ${life_id} and user_id = ${user_id}`
    let bestdel = `delete from life_best where life_id = ${life_id} and user_id = ${user_id}`
    let smiledel = `delete from life_smile where life_id = ${life_id} and user_id = ${user_id}`
    let surprisedel = `delete from life_surprise where life_id = ${life_id} and user_id = ${user_id}`
    let hatedel = `delete from life_hate where life_id = ${life_id} and user_id = ${user_id}`

    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
  
    
    try {
        [result] = await connection.query(query);
        [result] = await connection.query(likedel);
        [result] = await connection.query(bestdel);
        [result] = await connection.query(smiledel);
        [result] = await connection.query(surprisedel);
        [result] = await connection.query(hatedel);
        [rows] = await connection.query(qur);
        
        res.status(200).json({success: true, items:rows});
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

// @desc    동네 글 공감(슬픔) 삭제
// @route   DELETE  /api/v1/life/sad
// @request  life_id, user_id(auth)
// @response success, items
  
  exports.deleteSad = async (req, res, next) => {
    let life_id = req.body.life_id;
    let user_id = req.user.id
  
    if (!life_id) {
      res.status(400).json();
      return;
    }
  
    let query = `delete from life_sad where life_id = ${life_id} and user_id = ${user_id}`;
    console.log(query);
  
    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
    try {
      [result] = await connection.query(query);
      [rows] = await connection.query(qur);
      res.status(200).json({ success: true , items:rows});
    } catch (e) {
      res.status(500).json({success : false , message:"즐겨찾기 추가가 안되어있습니다."});
    }
  };

  // @desc   동네 글 공감(싫음) 추가
// @route   POST /api/v1/life/hate
// @request life_id, user_id(auth)
// @response success, items

exports.addHate = async (req, res, next) => {
    // 즐겨찾기에 이미 추가된 게시글은, 즐겨찾기에 추가되지 않도록 한다.
    let life_id = req.body.life_id;
    let user_id = req.user.id;
  
    if (!life_id) {
        res.status(400).json();
        return;
      }
  
    let query = `insert into life_sad (life_id, user_id) values (${life_id} , ${user_id})`;
    let likedel = `delete from life_like where life_id = ${life_id} and user_id = ${user_id}`
    let bestdel = `delete from life_best where life_id = ${life_id} and user_id = ${user_id}`
    let smiledel = `delete from life_smile where life_id = ${life_id} and user_id = ${user_id}`
    let surprisedel = `delete from life_surprise where life_id = ${life_id} and user_id = ${user_id}`
    let saddel = `delete from life_sad where life_id = ${life_id} and user_id = ${user_id}`

    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
  
    
    try {
        [result] = await connection.query(query);
        [result] = await connection.query(likedel);
        [result] = await connection.query(bestdel);
        [result] = await connection.query(smiledel);
        [result] = await connection.query(surprisedel);
        [result] = await connection.query(saddel);
        [rows] = await connection.query(qur);
        
        res.status(200).json({success: true, items:rows});
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

// @desc    동네 글 공감(싫음) 삭제
// @route   DELETE  /api/v1/life/hate
// @request  life_id, user_id(auth)
// @response success, items
  
  exports.deleteHate = async (req, res, next) => {
    let life_id = req.body.life_id;
    let user_id = req.user.id
  
    if (!life_id) {
      res.status(400).json();
      return;
    }
  
    let query = `delete from life_hate where life_id = ${life_id} and user_id = ${user_id}`;
    console.log(query);
  
    let qur = `select l.*,(select count(*) from life_like where life_id = ${life_id})as like_cnt, (select count(*) from life_best where life_id = ${life_id}) as best_cnt,
    (select count(*) from life_smile where life_id = ${life_id}) as smile_cnt,(select count(*) from life_surprise where life_id = ${life_id}) as surprise_cnt,
    (select count(*) from life_hate where life_id =${life_id}) as hate_cnt,(select count(*) from life_sad where life_id = ${life_id}) as sad_cnt from neighbor_life as l limit 1;`;
    try {
      [result] = await connection.query(query);
      [rows] = await connection.query(qur);
      res.status(200).json({ success: true , items:rows});
    } catch (e) {
      res.status(500).json({success : false , message:"즐겨찾기 추가가 안되어있습니다."});
    }
  };