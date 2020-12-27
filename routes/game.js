var express = require('express');
var router = express.Router();


/* GET board */
router.get('/', function(req, res, next) {    
    res.json(req.game.grid);
});


//Add unit to cell
//only needs to return affected cells
router.post('/claim', function(req, res, next) {
    const g = req.game.grid;

    
    const pId = parseInt(req.body.pId);

    const x1 = req.body.x1;
    const y1 = req.body.y1;

    if (0 === g[y1][x1].owner ) //valid target?
    {
        g[y1][x1].owner=pId;
        g[y1][x1].units=1;
        req.game.players[pId].squares=1;
    }

    console.log (pId + " Claimed square: [" + x1+ "," + y1 + "]");

    res.json(req.game.grid);
});



//Add unit to cell
//only needs to return affected cells
router.post('/deploy/:pId/:x1/:y1', function(req, res, next) {
    
    const pId = parseInt(req.params.pId);

    const x1 = req.params.x1;
    const y1 = req.params.y1;

    req.game.Deploy (pId,y1,x1);

    res.json(req.game.grid);
});


//Return player data
//Should force authentication
router.get('/player/:pId', function(req, res, next) {    
    const pId = parseInt(req.params.pId);
    console.log ("Getting player data: " + pId);
    res.json(req.game.players[pId]);
});

//Return player data
//Should force authentication
router.get('/players', function(req, res, next) {
    console.log ("Getting all players: ");
    res.json(req.game.players);
});


/* Create player */
router.post('/player', function(req, res, next) {
    var newID = req.game.CreatePlayer(req.body.name,req.body.color);
    //console.log (newID + ":" + players[newID]);
    //console.log (players);
    res.json(req.game.players[newID]);
});


//should be post
//only needs to return affected cells
router.get('/attack/:pId/:x1/:y1/:x2/:y2', function(req, res, next) {
    const g = req.game.grid;
    
    const pId = parseInt(req.params.pId);

    const x1 = req.params.x1;
    const y1 = req.params.y1;

    const x2 = req.params.x2;
    const y2 = req.params.y2;

    //console.log (pId);

    if (g[y1][x1].owner !== g[y2][x2].owner && pId === g[y1][x1].owner) //valid target?
    {
        if (Math.abs(x1-x2)<=1 && Math.abs(y1-y2)<=1) //adjacent
        {
            req.game.Attack (pId, y1,x1,y2,x2)  
        }
    }
    //console.log(g);
    //grid[req.params.x1][req.params.y1] = 1;
    res.json(g);
});



module.exports = router;
