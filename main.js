enchant();

var socket = io();
var ranking = [];
var registered = false;
var received = false;

/**
 * ランキング登録
 */
socket.on('registered', function(){
    registered = true;
});

/**
 * ランキング取得
 */
socket.on('got', function(a){
    ranking = a;
    received = true;
});

/**
 * サーバ側エラー
 */
socket.on('failed', function(){
    ranking = [];
    registered = false;
    received = false;
});

window.onload = function()
{
    // 定数
    const IMG_CHR = "img/char.png";
    const IMG_MAP = "img/map.png";
    const IMG_PNT = "img/point.png";
    const IMG_TIM = "img/time.png";
    const IMG_NUM = "img/number.png";
    const IMG_ENT = "img/entry.png";
    const IMG_BTN = "img/button.png";
    const IMG_ALP = "img/alphabet.png";
    
    // フレームワーク
    var game = new Game(320, 480);
    game.preload(IMG_CHR, IMG_MAP, IMG_PNT, IMG_TIM, IMG_NUM, IMG_ENT, IMG_BTN, IMG_ALP);
    game.fps = 30;
    previewCenter(game);
    
    //****************************************************
    // ステージ
    //****************************************************
    var Stage = Class.create(Map,
    {
        initialize: function(scene)
        {
            Map.call(this, 20, 16);
            this.image = game.assets[IMG_MAP];
            this.change(0);
            scene.addChild(this);
        },
        change:  function(no)
        {
            this.no = no;
            this.loadData(getMap(this.no));
            this.collisionData = getCol(this.no);
        },
        scroll: function(scene, chr)
        {
            // 横スクロール
            var wx = game.width / 2 - chr.x;
            if(wx >= 0)
            {
                scene.x = 0;
            }
            else if(wx <= (this.width - game.width) * - 1)
            {
                scene.x = (this.width - game.width) * - 1;
            }
            else
            {
                scene.x = wx;
            }
            
            // 縦スクロール
            var wy = game.height / 2 - chr.y;
            if(wy >= 0)
            {
                scene.y = 0;
            }
            else if(wy <= (this.height - game.height) * - 1)
            {
                scene.y = (this.height - game.height) * - 1;
            }
            else
            {
                scene.y = wy;
            }
        }
    });
    
    //****************************************************
    // キャラ
    //****************************************************
    var Char = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 20, 32);
            this.image = game.assets[IMG_CHR];
            this.frame = [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2];
            this.position(0);
            this.stop = false;
            scene.addChild(this);
        },
        next: function(no)
        {
            var next = no;
            switch(no)
            {
                case 0:
                    if(this.x == 260 && this.y == 368)
                    {
                        next = 1;
                    }
                    else if(this.x == 40 && this.y == 288)
                    {
                        next = 2;
                    }
                    else if(this.x == 260 && this.y == 208)
                    {
                        next = 3;
                    }
                    else if(this.x == 40 && this.y == 128)
                    {
                        next = 4;
                    }
                    else if(this.x == 260 && this.y == 48)
                    {
                        next = 5;
                    }
                    break;
                case 1:
                    if(this.x == 180 && this.y == 240)
                    {
                        next = 0;
                    }
                    break;
                case 2:
                    if(this.x == 260 && this.y == 48)
                    {
                        next = 0;
                    }
                    break;
                case 3:
                    if(this.x == 40 && this.y == 208)
                    {
                        next = 0;
                    }
                    break;
                case 4:
                    if(this.x == 40 && this.y == 96)
                    {
                        next = 0;
                    }
                    break;
                case 5:
                    if(this.x == 600 && this.y == 1232)
                    {
                        next = 0;
                    }
                    break;
            }
            return next;
        },
        position: function(no)
        {
            switch(no)
            {
                case 0:
                    this.x = 40;
                    this.y = 432;
                    break;
                case 1:
                    this.x = 40;
                    this.y = 432;
                    break;
                case 2:
                    this.x = 40;
                    this.y = 752;
                    break;
                case 3:
                    this.x = 40;
                    this.y = 432;
                    break;
                case 4:
                    this.x = 40;
                    this.y = 592;
                    break;
                case 5:
                    this.x = 40;
                    this.y = 1232;
                    break;
            }
            this.scaleX = 1;
            this.py = this.y;
            this.vy = 0;
            this.f = 1;
            this.touch = false;
            this.jump = false;
        },
        start: function()
        {
            this.stop = false;
        },
        pause: function()
        {
            this.frame = 0;
            this.stop = true;
        },
        collision: function(map)
        {
            // 停止
            if(this.stop) return;
            
            // 重力
            this.vy = (this.y - this.py) + this.f;
            if(this.vy > map.tileHeight - 1)
            {
                this.vy = map.tileHeight - 1;
            }
            this.py = this.y;
            this.y += this.vy;
            this.f = 1;
            
            // 衝突（上）
            if((map.hitTest(this.x, this.y) || map.hitTest(this.x + this.width - 1, this.y)) && this.vy <= 0)
            {
                this.y = Math.floor(this.y / map.tileHeight) * map.tileHeight + map.tileHeight;
            }
            
            // 衝突（下）
            if((map.hitTest(this.x, this.y + this.height - 1) || map.hitTest(this.x + this.width - 1, this.y + this.height - 1)) && this.vy >= 0)
            {
                this.y = Math.floor((this.y + this.height - 1) / map.tileHeight) * map.tileHeight - this.height;
                this.frame = [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2];
                this.jump = true;
            }
            else if(this.y > map.height)
            {
                // 落下（未実装）
            }
            else
            {
                this.jump = false;
                
                // 方向変換
                if(this.touch)
                {
                    this.scaleX *= - 1;
                    this.touch = false;
                }
            }
            
            // 前進
            this.x += 2 * this.scaleX;
            
            // 衝突（左）
            if(map.hitTest(this.x, this.y) || map.hitTest(this.x, this.y + this.height - 1))
            {
                this.x = Math.floor(this.x / map.tileWidth) * map.tileWidth + map.tileWidth;
                if(this.jump) this.scaleX = 1;
            }
            
            // 衝突（右）
            if(map.hitTest(this.x + this.width - 1, this.y) || map.hitTest(this.x + this.width - 1, this.y + this.height - 1))
            {
                this.x = Math.floor((this.x + this.width - 1) / map.tileWidth) * map.tileWidth - this.width;
                if(this.jump) this.scaleX = - 1;
            }
            
            // 跳ぶ
            if(this.touch && this.jump)
            {
                this.f = -11;
                this.py = this.y;
                this.frame = [4, 4, 4, 4, 3, 3, 3, 3, 0, null];
                this.touch = false;
            }
        }
    });
    
    //****************************************************
    // スクリーン
    //****************************************************
    var Screen = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            var bg = new Surface(game.width, game.height);
            bg.context.fillStyle = "black";
            bg.context.fillRect(0, 0, bg.width, bg.height);
            Sprite.call(this, bg.width, bg.height);
            this.image = bg;
            this.x = 0;
            this.y = 0;
            this.clear();
            scene.addChild(this);
        },
        fadein: function(min, max, add)
        {
            this.state = 1;
            this.min = min;
            this.max = max;
            this.add = add;
            this.opacity = max;
        },
        fadeout: function(min, max, add)
        {
            this.state = 2;
            this.min = min;
            this.max = max;
            this.add = add;
            this.opacity = min;
        },
        do: function()
        {
            if(this.state == 1)
            {
                // フェードイン
                this.opacity -= this.add;
                if(this.opacity <= this.min)
                {
                    this.opacity = this.min;
                    return true;
                }
            }
            else if(this.state == 2)
            {
                // フェードアウト
                this.opacity += this.add;
                if(this.opacity >= this.max)
                {
                    this.opacity = this.max;
                    return true;
                }
            }
            return false;
        },
        clear: function()
        {
            this.state = 0;
            this.min = 0;
            this.max = 0;
            this.add = 0;
            this.opacity = 0;
        }
    });
    
    //****************************************************
    // ポイント
    //****************************************************
    var Point = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 8, 8);
            this.image = game.assets[IMG_PNT];
            this.frame = [0, 0, 0, 0, 0, 1, 1, 1, 1];
            this.clear();
            scene.addChild(this);
        },
        collision: function(chr)
        {
            if(this.intersect(chr))
            {
                this.clear();
                return true;
            }
            return false;
        },
        clear: function()
        {
            this.x = this.width * -1;
            this.y = this.height * -1;
        }
    });
    
    //****************************************************
    // タイム
    //****************************************************
    var Time = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 54, 30);
            this.image = game.assets[IMG_TIM];
            this.frame = 0;
            this.x = 4;
            this.y = 4;
            scene.addChild(this);
            this.number = [];
            for(var i = 0; i <= 3; i++)
            {
                this.number[i] = new Number(scene);
            }
            this.clear();
        },
        start: function()
        {
            this.time = 0;
            this.frame = 1;
        },
        goal: function()
        {
            this.frame = 4;
        },
        do: function()
        {
            for(var i = 0; i < this.number.length; i++)
            {
                this.number[i].clear();
            }
            if(game.frame % game.fps == 0)
            {
                if(this.frame != 4)
                {
                    this.add(1);
                }
            }
            if(this.frame == 1)
            {
                if(this.time >= 2)
                {
                    this.frame = 2;
                    this.time = 0;
                }
                return false;
            }
            else if(this.frame == 2)
            {
                if(this.time >= 1)
                {
                    this.frame = 3;
                    this.time = 0;
                }
                return false;
            }
            else if(this.frame == 3)
            {
                this.set();
            }
            else if(this.frame == 4)
            {
                this.set();
                return false;
            }
            return true;
        },
        add: function(num)
        {
            this.time += num;
            if(this.time > 9999)
            {
                this.time = 9999;
            }
            else if(this.time < 0)
            {
                this.time = 0;
            }
        },
        get: function()
        {
            return this.time;
        },
        set: function()
        {
            if(this.time >= 0)
            {
                this.number[0].set(Math.floor((this.time / 1) % 10), 40, 19);
            }
            if(this.time >= 10)
            {
                this.number[1].set(Math.floor((this.time / 10) % 10), 30, 19);
            }
            if(this.time >= 100)
            {
                this.number[2].set(Math.floor((this.time / 100) % 10), 20, 19);
            }
            if(this.time >= 1000)
            {
                this.number[3].set(Math.floor((this.time / 1000) % 10), 10, 19);
            }
        },
        clear: function()
        {
            this.time = 0;
            this.frame = 0;
            for(var i = 0; i < this.number.length; i++)
            {
                this.number[i].clear();
            }
        }
    });
    
    //****************************************************
    // ナンバー
    //****************************************************
    var Number = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 8, 8);
            this.image = game.assets[IMG_NUM];
            this.clear();
            scene.addChild(this);
        },
        set: function(num, x, y)
        {
            if(num >= 0 && num <= 9)
            {
                this.frame = num;
                this.x = x;
                this.y = y;
            }
            else
            {
                this.clear();
            }
        },
        clear: function()
        {
            this.frame = 0;
            this.x = this.width * -1;
            this.y = this.height * -1;
        }
    });
    
    //****************************************************
    // エントリー
    //****************************************************
    var Entry = Class.create(Sprite,
    {
        initialize: function(scene)
        {
            Sprite.call(this, 114, 14);
            this.image = game.assets[IMG_ENT];
            this.frame = 0;
            this.clear();
            scene.addChild(this);
        },
        set: function()
        {
            this.x = game.width / 2 - this.width / 2;
            this.y = 40;
        },
        clear: function()
        {
            this.x = this.width * -1;
            this.y = this.height * -1;
        }
    });
    
    //****************************************************
    // アルファベット
    //****************************************************
    var Alphabet = Class.create(Sprite,
    {
        initialize: function(scene, c)
        {
            Sprite.call(this, 10, 10);
            this.image = game.assets[IMG_ALP];
            this.x = 19;
            this.y = 19;
            this.frame = 0;
            this.change(c);
            scene.addChild(this);
        },
        change: function(c)
        {
            var str = " ABCDEFGHIJKLMNOPQRSTUVWXYZ-.";
            for(var i = 0; i < str.length; i++)
            {
                {
                    if(c.trim() == str.charAt(i).trim())
                    {
                        this.frame = i;
                        break;
                    }
                }
            }
        }
    });
    
    //****************************************************
    // 入力
    //****************************************************
    var Input = Class.create(Group,
    {
        initialize: function(scene)
        {
            Group.call(this);
            
            // 背景
            var s = new Surface(160, 30);
            s.context.fillStyle = "white";
            s.context.fillRect(0, 0, s.width, s.height);
            s.context.strokeStyle = "black";
            s.context.strokeRect(0, 0, s.width, s.height);
            var bg = new Sprite(s.width, s.height);
            bg.image = s;
            bg.x = 0;
            bg.y = 0;
            bg.opacity = 0.5;
            this.addChild(bg);
            
            // 文字
            var alphabet = [];
            for(var i = 0; i < 10; i++)
            {
                alphabet[i] = new Alphabet(scene, "");
                alphabet[i].x = 8 + i * 15;
                alphabet[i].y = s.height / 2 - alphabet[i].height / 2;
                this.addChild(alphabet[i]);
            }
            
            // グループ
            this.width = s.width;
            this.height = s.height;
            this.clear();
            this.value = "";
            scene.addChild(this);
        },
        set: function()
        {
            this.x = game.width / 2 - this.width / 2;
            this.y = 60;
            for(var i = 1; i < this.childNodes.length; i++)
            {
                if(i <= this.value.length)
                {
                    this.childNodes[i].change(this.value.charAt(i - 1));
                }
                else
                {
                    this.childNodes[i].change("");
                }
            }
        },
        add: function(c)
        {
            this.value = (this.value + c).substr(0, 10);
            this.set();
        },
        bs: function()
        {
            this.value = this.value.substr(0, this.value.length - 1);
            this.set();
        },
        check: function()
        {
            if(this.value.length >= 1 && this.value.length <= 10)
            {
                return true;
            }
            return false;
        },
        clear: function()
        {
            this.x = this.width * -1;
            this.y = this.height * -1;
        }
    });
    
    //****************************************************
    // ボタン
    //****************************************************
    var Button = Class.create(Group,
    {
        initialize: function(scene, type, c)
        {
            Group.call(this);
            this.width = 48;
            this.height = 48;
            this.pushed = false;
            this.type = type;
            this.value = c;
            
            // 枠
            var edge = new Sprite(48, 48);
            edge.image = game.assets[IMG_BTN];
            edge.opacity = 0.8;
            this.addChild(edge);
            
            // 文字
            if(type == 0)
            {
                edge.frame = 0;
                var alp = new Alphabet(this, c);
            }
            else if(type == 1)
            {
                edge.frame = 2;
            }
            else if(type == 2)
            {
                edge.frame = 4;
            }
            
            // 押す
            this.addEventListener(Event.TOUCH_START, function()
            {
                if(this.childNodes[0].frame == 0)
                {
                    this.childNodes[0].frame = 1;
                }
                else if(this.childNodes[0].frame == 2)
                {
                    this.childNodes[0].frame = 3;
                }
                else if(this.childNodes[0].frame == 4)
                {
                    this.childNodes[0].frame = 5;
                }
                this.pushed = true;
            });
            
            // 離す
            this.addEventListener(Event.TOUCH_END, function()
            {
                if(this.childNodes[0].frame == 1)
                {
                    this.childNodes[0].frame = 0;
                }
                else if(this.childNodes[0].frame == 3)
                {
                    this.childNodes[0].frame = 2;
                }
                else if(this.childNodes[0].frame == 5)
                {
                    this.childNodes[0].frame = 4;
                }
                this.pushed = false;
            });
            this.clear();
            scene.addChild(this);
        },
        push: function()
        {
            if(this.pushed)
            {
                this.pushed = false;
                return true;
            }
            return false;
        },
        set: function(x, y)
        {
            this.x = x;
            this.y = y;
        },
        clear: function()
        {
            this.x = this.width * -1;
            this.y = this.height * -1;
        }
    });
    
    //****************************************************
    // スコア
    //****************************************************
    var Score = Class.create(Group,
    {
        initialize: function(scene)
        {
            Group.call(this);
            var f = "16px monospace";
            
            // 背景
            var s = new Surface(220, 335);
            s.context.fillStyle = "white";
            s.context.fillRect(0, 0, s.width, s.height);
            var bg = new Sprite(s.width, s.height);
            bg.image = s;
            bg.x = 0;
            bg.y = 0;
            bg.opacity = 0.5;
            this.addChild(bg);
            
            // 順位
            var rank = new Label();
            rank.width = 20;
            rank.height = 320;
            rank.x = 5;
            rank.y = 5;
            rank.font = f;
            rank.textAlign = "right";
            rank.text = "";
            this.addChild(rank);
            
            // 名前
            var name = new Label();
            name.width = 120;
            name.height = 320;
            name.x = 35;
            name.y = 5;
            name.font = f;
            name.textAlign = "left";
            name.text = "";
            this.addChild(name);
            
            // スコア
            var score = new Label();
            score.width = 60;
            score.height = 320;
            score.x = 155;
            score.y = 5;
            score.font = f;
            score.textAlign = "right";
            score.text = "";
            this.addChild(score);
            
            // グループ
            this.width = bg.width;
            this.height = bg.height;
            this.clear();
            scene.addChild(this);
        },
        set: function(arr)
        {
            this.x = game.width / 2 - this.width / 2;
            this.y = 120;
            var rank  = "";
            var name  = "";
            var score = "";
            if(!arr)
            {
                arr = [];
            }
            for(var i = 0; i < 20; i++)
            {
                if(!arr[i])
                {
                    arr[i] = {name:'----------', score:'9999'};
                }
            }
            for(var i = 0; i < arr.length; i++)
            {
                if(rank  != "") rank  = rank  + "<br>";
                if(name  != "") name  = name  + "<br>";
                if(score != "") score = score + "<br>";
                rank  = rank  + (i + 1);
                name  = name  + arr[i].name;
                score = score + arr[i].score + "s";
            }
            this.childNodes[1].text = rank;
            this.childNodes[2].text = name;
            this.childNodes[3].text = score;
        },
        clear: function()
        {
            this.x = this.width * -1;
            this.y = this.height * -1;
            this.childNodes[1].text = "";
            this.childNodes[2].text = "";
            this.childNodes[3].text = "";
        }
    });
    
    //****************************************************
    // メイン処理
    //****************************************************
    game.onload = function()
    {
        var createScene = function()
        {
            // シーン生成
            var scene = new Scene();
            
            // グループ生成
            var group = new Group();
            
            // ステージ生成
            var stage = new Stage(group);
            var next = stage.no;
            
            // ポイント生成
            var point = [];
            for(var i = 0; i < 20; i++)
            {
                point[i] = new Point(group);
            }
            
            // キャラ生成
            var chr = new Char(group);
            
            // グループ追加
            scene.addChild(group);
            
            // スクリーン生成
            var screen = new Screen(scene);
            
            // タイム生成
            var time = new Time(scene);
            
            // スコア入力生成
            var entry = new Entry(scene);
            var input = new Input(scene);
            var button = [];
            var btnPos = -1;
            var alp = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-.";
            for(var i = 0; i < alp.length; i++)
            {
                button[i] = new Button(scene, 0, alp.charAt(i));
            }
            button.push(new Button(scene, 1, ""));
            button.push(new Button(scene, 2, ""));
            var score = new Score(scene);
            
            // 状態管理
            var state = 0;
            
            // カウンタ
            var count = 0;
            
            // タッチ開始
            scene.addEventListener(Event.TOUCH_START, function(e)
            {
                chr.touch = true;
            });
            
            // タッチ終了
            scene.addEventListener(Event.TOUCH_END, function(e)
            {
                chr.touch = false;
            });
            
            // フレーム処理
            scene.addEventListener(Event.ENTER_FRAME, function()
            {
                if(screen.do())
                {
                    // 画面切替
                    if(screen.state == 1)
                    {
                        // フェードイン
                        screen.clear();
                    }
                    else
                    {
                        // フェードアウト
                        if(stage.no == 0)
                        {
                            // 選択ステージへ
                            stage.change(next);
                            setPoint(stage.no, point);
                            chr.position(stage.no);
                            screen.fadein(0, 1, 0.05);
                        }
                        else
                        {
                            if(state == 0)
                            {
                                // 名前入力
                                entry.set();
                                input.set();
                                btnPos = -1;
                                for(var i = 0; i < button.length; i++)
                                {
                                    if(i % 5 == 0)
                                    {
                                        btnPos++;
                                    }
                                    button[i].set(36 + (i % 5) * 50, 150 + btnPos * 50);
                                }
                                state = 1;
                            }
                            else if(state == 1)
                            {
                                // ボタン押下
                                for(var i = 0; i < button.length; i++)
                                {
                                    if(button[i].push())
                                    {
                                        if(button[i].type == 0)
                                        {
                                            // 入力
                                            input.add(button[i].value);
                                            break;
                                        }
                                        else if(button[i].type == 1)
                                        {
                                            // 削除
                                            input.bs();
                                            break;
                                        }
                                        else if(button[i].type == 2 && input.check())
                                        {
                                            // ランキング登録
                                            socket.emit('regist', stage.no, input.value, time.get());
                                            for(var j = 0; j < button.length; j++)
                                            {
                                                button[j].clear();
                                            }
                                            chr.touch = false;
                                            state = 2;
                                            break;
                                        }
                                    }
                                }
                            }
                            else if(state == 2)
                            {
                                // ランキング表示
                                if(game.frame % game.fps == 0)
                                {
                                    count++;
                                    if(count >= 3)
                                    {
                                        alert("ランキングに登録できませんでした。");
                                        registered = false;
                                        received = true;
                                    }
                                }
                                if(registered)
                                {
                                    // ランキング登録完了
                                    socket.emit('get', stage.no);
                                    registered = false;
                                    count = 0;
                                }
                                else if(received)
                                {
                                    // ランキング取得完了
                                    score.set(ranking);
                                    received = false;
                                    count = 0;
                                    state = 3;
                                }
                            }
                            else if(state == 3 && chr.touch)
                            {
                                // ランキング非表示
                                screen.fadeout(0.6, 1, 0.02);
                                entry.clear();
                                input.clear();
                                for(var i = 0; i < button.length; i++)
                                {
                                    button[i].clear();
                                }
                                score.clear();
                                state = 4;
                            }
                            else if(state == 4)
                            {
                                // 初期画面に戻る
                                stage.change(next);
                                setPoint(stage.no, point);
                                chr.position(stage.no);
                                time.clear();
                                screen.fadein(0, 1, 0.02);
                                state = 0;
                            }
                        }
                    }
                }
                else
                {
                    if(time.do())
                    {
                        // タイム計測
                        next = chr.next(stage.no);
                        if(stage.no != next)
                        {
                            if(stage.no == 0)
                            {
                                screen.fadeout(0, 1, 0.05);
                                time.start();
                            }
                            else
                            {
                                screen.fadeout(0, 0.6, 0.02);
                                time.goal();
                            }
                            chr.pause();
                        }
                        else
                        {
                            if(screen.opacity == 0)
                            {
                                chr.start();
                            }
                        }
                    }
                    else
                    {
                        // 待ち
                        chr.pause();
                    }
                }
                
                // スクロール制御
                stage.scroll(group, chr);
                
                // 衝突判定（Stage）
                chr.collision(stage);
                
                // 衝突判定（Point）
                for(var i = 0; i < point.length; i++)
                {
                    if(point[i].collision(chr))
                    {
                        time.add(-2);
                    }
                }
            });
            return scene;
        };
        game.replaceScene(createScene());
    }
    
    // ゲーム開始
    game.start();
}

/**
 * マップ
 */
function getMap(no)
{
    var map;
    switch(no)
    {
        case 0:
            map =
            [
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0,10,11,16, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 5, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 6, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
                [ 2,10,11,15, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 5, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 6, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0,10,11,14, 2],
                [ 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 5, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 6, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
                [ 2,10,11,13, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 5, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 6, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0,10,11,12, 2],
                [ 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 5, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 6, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
                [ 2, 0, 5, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
            ];
            break;
        case 1:
            map =
            [
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 0, 7, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 0, 5, 0, 0, 0, 1, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 0, 6, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 0, 0, 0, 2, 4, 4, 4, 2, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2],
                [ 2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
            ];
            break;
        case 2:
            map =
            [
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 2], 
                [ 2, 0, 0, 0, 2, 2, 2, 2, 2, 0, 2, 2, 3, 3, 3, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2], 
                [ 2, 2, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 0, 0, 0, 2, 2, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 2, 0, 0, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2], 
                [ 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2], 
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2], 
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
                [ 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
            ];
            break;
        case 3:
            map =
            [
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2],
                [ 2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 4, 4, 4, 2, 2, 2, 2, 0, 2, 2, 0, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
            ];
            break;
        case 4:
            map =
            [
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 2],
                [ 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 5, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 6, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 1, 1, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2],
                [ 2, 4, 4, 4, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 1, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 2],
                [ 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
            ];
            break;
        case 5:
            map =
            [
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 2, 2, 2, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 1, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 2, 2, 0, 0, 0, 2, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 2, 2, 2, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 1, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2],
                [ 2, 2, 2, 0, 0, 0, 2, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                [ 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 2],
                [ 2, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 5, 0, 2],
                [ 2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 6, 0, 2],
                [ 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 2]
            ];
    }
    return map;
}

/**
 * 衝突
 */
function getCol(no)
{
    var col = getMap(no);
    var w = [2, 3, 4];
    for(var i = 0; i < col.length; i++)
    {
        for(var j = 0; j < col[i].length; j++)
        {
            if(w.indexOf(col[i][j]) >= 0)
            {
                col[i][j] = 1;
            }
            else
            {
                col[i][j] = 0;
            }
        }
    }
    return col;
}

/**
 * ポイント配置
 */
function setPoint(no, point)
{
    var map = getMap(no);
    var p = 0;
    for(var i = 0; i < map.length; i++)
    {
        for(var j = 0; j < map[i].length; j++)
        {
            if(map[i][j] == 1)
            {
                point[p].x = j * 20 + 6;
                point[p].y = i * 16 + 4;
                p++;
            }
        }
    }
    for(var i = p; i < point.length; i++)
    {
        point[i].clear();
    }
}

/**
 * 画面中央表示
 */
function previewCenter(game)
{
    var left = (window.innerWidth - (game.width * game.scale)) / 2;
    var top = (window.innerHeight - (game.height * game.scale)) / 2;
    var stage = document.getElementById('enchant-stage');
    stage.style.position = 'absolute';
    stage.style.left = left + 'px';
    stage.style.top = top + 'px';
    game._pageX = left;
    game._pageY = top;
}
