const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const connection = require("../db/mysql_connection");

const {query} = require("express");

// @desc    회원가입
// @route   POST    /api/v1/users
// @parameters  email, passwd, nickname, location
exports.createUser = async (req, res, next) => {
    let email = req.body.email;
    let passwd = req.body.passwd;
    let location = req.body.location;
    let nickname = req.body.nickname;

    // npm validator
    if (!validator.isEmail(email)) {
        res
            .status(400)
            .json({message: "파라미터 잘못"});
        return;
    }

    // npm bcryptjs
    const hashedPasswd = await bcrypt.hash(passwd, 8);

    let query = "insert into market_user (email, passwd, nickname, location) values ( ? , ? , ?" +
            ", ?)";
    let data = [email, hashedPasswd, nickname, location];
    let user_id;

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        [result] = await conn.query(query, data);
        user_id = result.insertId;
    } catch (e) {
        await conn.rollback();
        res
            .status(500)
            .json({error: e});
        return;
    }

    // 토큰 처리  npm jsonwebtoken 토큰 생성 sign
    const token = jwt.sign({
        user_id: user_id
    }, process.env.ACCESS_TOKEN_SECRET);
    query = "insert into market_token (user_id, token) values (? , ? )";
    data = [user_id, token];

    try {
        [result] = await conn.query(query, data);
    } catch (e) {
        await conn.rollback();
        res
            .status(500)
            .json({success: false});
        return;
    }

    await conn.commit();
    await conn.release();

    res
        .status(200)
        .json({success: true, token: token});
};

// @desc        로그인
// @route       POST    /api/v1/users/login
// @request  email, passwd
// @response success token

exports.loginUser = async (req, res, next) => {
    let email = req.body.email;
    let passwd = req.body.passwd;

    let query = "select * from market_user where email = ? ";
    let data = [email];

    let user_id;
    try {
        [rows] = await connection.query(query, data);
        let hashedPasswd = rows[0].passwd;
        user_id = rows[0].id;
        const isMatch = await bcrypt.compare(passwd, hashedPasswd);
        if (isMatch == false) {
            res
                .status(401)
                .json({message: "아이디와 비밀번호가 맞는지 확인해 주세요."});
            return;
        }
    } catch (e) {
        res
            .status(500)
            .json({error: e});
        return;
    }
    const token = jwt.sign({
        user_id: user_id
    }, process.env.ACCESS_TOKEN_SECRET);
    query = "insert into market_token (token, user_id) values (?, ?)";
    data = [token, user_id];
    let qur = `select nickname from market_user where email = "${email}"`;
    try {
        [result] = await connection.query(query, data);
        [rows] = await connection.query(qur);

        res
            .status(200)
            .json({success: true, token: token, items: rows});

    } catch (e) {
        res
            .status(500)
            .json();
    }
};

// @desc    로그아웃 (현재의 기기 1개에 대한 로그아웃)
// @route   /api/v1/users/logout

exports.logout = async (req, res, next) => {
    // movie_token 테이블에서, 토큰 삭제해야 로그아웃이 되는것이다.

    let user_id = req.user.id;
    let token = req.user.token;

    let query = "delete from market_token where user_id = ? and token = ? ";
    let data = [user_id, token];
    try {
        [result] = await connection.query(query, data);
        res
            .status(200)
            .json({success: true});
    } catch (e) {
        res
            .status(500)
            .json({error: e});
    }
};

// @desc 내 정보 닉넴 변경
// @route POST /api/v1/users/cgnick
// @parameters nickname, user_id
exports.changeMyNik = async (req, res, next) => {
    let nickname = req.body.nickname;
    let user_id = req.user.id;

    // 이 유저가, 맞는 유저인지 체크
    let qur = `select * from market_user where id = ${user_id}`;

    let query = `update market_user set nickname = "${nickname}" where id = ${user_id}`;

    if (nickname == undefined || nickname == "") {
        res
            .status(401)
            .json({success: false, error: 1, message: "닉네임을 입력해 주세요"});
        return;
    }

    let nikcheck = `select * from market_user where nickname = "${nickname}"`;

    try {

        [rows] = await connection.query(nikcheck);

        if (rows.length > 0) {
            res
                .status(401)
                .json({success: false, error: 1, message: "이미 존재하는 닉네임 입니다."});
        } else {
            try {
                [result] = await connection.query(query);
                [user] = await connection.query(qur);
                res
                    .status(200)
                    .json({success: true, items: user});
            } catch (e) {
                res
                    .status(500)
                    .json({success: false});
            }
        }
    } catch (e) {
        res
            .status(500)
            .json({success: false});
    }
};

// @desc 회원탈퇴
// @route DELETE /api/v1/users
// @parameters user_id
exports.deleteuser = async (req, res, next) => {
    let user_id = req.user.id;
    let query = `delete from market_user where id = ${user_id}`;

    const conn = await connection.getConnection();
    try {
        await conn.beginTransaction();
        // 첫번째 테이블에서 정보 삭제
        [result] = await conn.query(query);
        // 두번째 테이블에서 정보 삭제
        query = `delete from market_token where user_id = ${user_id}`;
        [result] = await conn.query(query);

        await conn.commit();
        res
            .status(200)
            .json({success: true});
    } catch (e) {
        await conn.rollback();
        res
            .status(500)
            .json({success: false, error: e});
    } finally {
        await conn.release();
    }
};