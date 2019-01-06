var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg');

// DB接続
var client = new pg.Client(process.env.DATABASE_URL);

// 静的ファイル配置
app.use(express.static(__dirname + '/'));

// ルーティング
app.get('/', function(req, res)
{
    res.sendFile(__dirname + '/index.html');
});

// ソケット通信
io.on('connection', function(socket)
{
    outputLog('connection id ' + socket.id);
    
    // ランキング登録
    socket.on('regist', function(stage, name, score)
    {
        outputLog('regist stage:' + stage + ' name:' + name + ' score:' + score + ' socket:' + socket.id);
        
        // 登録
        client.connect(function(error)
        {
            client.query(
            {
                text: 'insert into t_ranking (stage, name, time, socket) values ($1, $2, $3, $4)',
                values: [stage, name, score, socket.id]
            })
            .catch((error) =>
            {
                outputLog('regist error ' + error)
                socket.emit('failed');
            })
            .then(() =>
            {
                socket.emit('registered');
            });
        });
    });
    
    // ランキング取得
    socket.on('get', function(stage)
    {
        outputLog('get stage:' + stage + ' socket:' + socket.id);
        
        // 取得
        client.connect(function(error)
        {
            client.query(
            {
                text: 'select name, time from t_ranking where stage = $1 order by time asc, id desc offset 0 limit 20',
                values: [stage]
            })
            .catch((error) =>
            {
                outputLog('get error ' + error);
                socket.emit('failed');
            })
            .then((result) =>
            {
                var ranking = [];
                if(result.rows)
                {
                    for(var i = 0; i < result.rows.length; i++)
                    {
                        ranking[i] = {name:result.rows[i].name, score:result.rows[i].time};
                    }
                }
                socket.emit('got', ranking);
            });
        });
    });
});

// ログ出力
function outputLog(mes)
{
    var d = new Date();
    console.log('[' + d.getFullYear() + '/'
                + ('0' + (d.getMonth() + 1)).slice(-2) + '/'
                + ('0' + d.getDate()).slice(-2) + ' '
                + ('0' + d.getHours()).slice(-2) + ':'
                + ('0' + d.getMinutes()).slice(-2) + ':'
                + ('0' + d.getSeconds()).slice(-2) + '] ' + mes);
}

// サーバ起動
var port = process.env.PORT || 3000;
http.listen(port, function()
{
    outputLog('listening on port ' + port);
});
