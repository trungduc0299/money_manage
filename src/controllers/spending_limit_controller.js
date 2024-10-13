const connection = require('../config/database');
const { use } = require('../routes/route_name');

const createSpendingLimit = (req, res) => {
    let typeId = req.body.type_id;
    let limitValue = req.body.limit_value;
    let ownerId = req.body.owner_id;
    let endAt = req.body.end_at;
    connection.query(
        'INSERT INTO spending_limit VALUES (limit_id,?,?,?,now(),now(),?)', [typeId, limitValue, ownerId, endAt],
        function (err, result) {
            if (err) {
                throw err;
            }
            // if (result.affectedRows == 1) {
            //     connection.query(
            //         "SELECT * FROM spending_limit WHERE limit_id = ?", [userId],
            //         function (err, result) {
            //             if (err) {
            //                 throw err;
            //             }
            //             res.send(result);
            //         }
            //     )
            // }
            console.log(result);
            res.send("Create limit success");
        }
    )
}

const getAllSpendingLimit = (req, res) => {
    connection.query(
        'SELECT * FROM spending_limit',
        function (err, result) {
            if (err) {
                throw err;
            }
            console.log(result);
            res.send(result);
        }
    )
}

const deleteSpendingLimit = (req, res) => {
    let id = req.params.id;
    connection.query(
        'DELETE FROM spending_limit WHERE limit_id = ?', [id],
        function (err, result) {
            if (err) {
                throw err;
            }
            if (result.affectedRows == 0) {
                res.send("Wrong limit_id");
            }
            console.log(result);
            res.send("Delete limit success");
        }
    )
}

const updateLimit = (req, res) => {
    let limitValue = req.body.limit_value;
    let endAt = req.body.end_at;
    let limitId = req.body.limit_id;
    connection.query(
        'UPDATE spending_limit SET limit_value = ?,end_at = ? WHERE limit_id = ?', [limitValue, endAt, limitId],
        function (err, results) {
            if (err) {
                throw err;
            }
            if (results.affectedRows == 1) {
                connection.query(
                    "SELECT * FROM spending_limit WHERE limit_id = ?", [limitId],
                    function (err, result) {
                        if (err) {
                            throw err;
                        }
                        res.send(result);
                    }
                )
            }
            else {
                res.send("Update limit error");
            }
        }
    )
}



module.exports = {
    createSpendingLimit,
    getAllSpendingLimit,
    deleteSpendingLimit,
    updateLimit
};