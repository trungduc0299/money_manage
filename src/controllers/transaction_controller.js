const connection = require('../config/database');
const { use } = require('../routes/route_name');

// const getSingleInfor = (req, res) => {
//     let singerId = req.params.id;
//     connection.query(
//         'SELECT * FROM singer_profile WHERE id = ?', [singerId],
//         function (err, result) {
//             if (err) {
//                 throw err;
//             }
//             console.log("singer profile:", result);
//             res.send(result);
//         }
//     );
// }

// const addSinger = (req, res) => {
//     let singerName = req.body.singer_name;
//     let singerImg = req.body.singer_img;
//     console.log(singerImg, singerName);
//     connection.query(
//         'INSERT INTO singer_profile VALUES (id,?,?)', [singerName, singerImg],
//         function (err, result) {
//             if (err) {
//                 throw err;
//             }
//             console.log(result);
//             res.send("Create success");
//         }
//     )
// }

const createTransaction = (req, res) => {
    let typeId = req.body.type_id;
    let value = req.body.value;
    let userId = req.body.user_id;
    let isSpend = req.body.is_spend;
    let groupId = req.body.group_id;
    console.log(typeId, value, userId, isSpend, groupId);
    connection.query(
        'INSERT INTO transaction VALUES (id,?,?,?,?,?,now())', [groupId, typeId, value, userId, isSpend],
        function (err, result) {
            if (err) {
                throw err;
            }
            console.log(result);
            res.send("Create success");
        }
    )
}

const getTransactionType = (req, res) => {
    connection.query(
        'SELECT * FROM transaction_type',
        function (err, result) {
            if (err) {
                throw err;
            }
            console.log(result);
            res.send(result);
        }
    )
}

// const searchSinger = (req, res) => {
//     let keyWord = req.params.key_word;
//     let searchValue = `%${keyWord}%`;
//     connection.query('SELECT * FROM singer_profile WHERE singer_name LIKE ?', [searchValue],
//         function (err, result) {
//             if (err) {
//                 throw err;
//             }
//             res.send(result);
//         }
//     )
// }


module.exports = {
    createTransaction,
    getTransactionType
};