var express = require('express');
var router = express.Router();

var grid = {};    
var players = {};  

var nextID = 6;//Next ID for new player (already have 1-5)

SetUpBoard();
setInterval(addReinforcements, 30000);

function addReinforcements() {
    console.log('Updating Reinforcements');
    //could use entries?
    for (const row of Object.keys(grid)) {
        for (const cell of Object.keys(grid[row])) {
            if (grid[row][cell].owner !== 0)
            {   
                players[grid[row][cell].owner].units++;
                players[grid[row][cell].owner].squares++;
            }
        }
    }
}
  

function SetUpBoard()
{
    var x;
    var y;
    for (y=0; y<20; y++)
    {
        grid[y] = {};
        for (x=0; x<30; x++)
        {
            grid[y][x] = {units: 5, owner: 0};   
        }
    }

//     0: "lightgrey",
//     1: "lightblue",
//     2: "orange",   
//     3: "pink",
//     4: "lightgreen"

    players[0] = {units: 5, color:'lightgrey'};
    players[1] = {units: 5, color:'lightblue'};
    players[2] = {units: 5, color:'orange'};
    players[3] = {units: 5, color:'pink'};
    players[4] = {units: 5, color:'lightgreen'};

    grid[0][0]["owner"] = 1;
    grid[0][0]["units"] = 50;

    grid[0][29]["owner"] = 2;
    grid[0][29]["units"] = 50;

    grid[19][29]["owner"] = 3;
    grid[19][29]["units"] = 50;

    grid[19][0]["owner"] = 4;
    grid[19][0]["units"] = 50;
}


/* GET board */
router.get('/', function(req, res, next) {
  res.json(grid);
});

/* RESET board */
router.post('/reset', function(req, res, next) {
    SetUpBoard();
    res.json(grid);
});


//Add unit to cell
//only needs to return affected cells
router.post('/claim', function(req, res, next) {
    const g = grid;
    
    const pId = parseInt(req.body.pId);

    const x1 = req.body.x1;
    const y1 = req.body.y1;

    if (players[pId].units > 0 &&  //have units to deploy
        0 === g[y1][x1].owner &&
        players[pId].squares===0) //valid target?
    {
        g[y1][x1].owner=pId;
        g[y1][x1].units=1;
        players[pId].units--;
    }

    console.log (pId + " Claimed square: [" + x1+ "," + y1 + "]");

    res.json(grid);
});



//Add unit to cell
//only needs to return affected cells
router.post('/deploy/:pId/:x1/:y1', function(req, res, next) {
    const g = grid;
    
    const pId = parseInt(req.params.pId);

    const x1 = req.params.x1;
    const y1 = req.params.y1;

    if (players[pId].units>0 &&  //have units to deploy
        pId === g[y1][x1].owner && 
        g[y1][x1].units < 99) //valid target?
    {
        g[y1][x1].units++;
        players[pId].units--;
    }

    console.log (pId + " Deployed units: [" + x1+ "," + y1 + "]");

    res.json(grid);
});

//Return player data
//Should force authentication
router.get('/player/:pId', function(req, res, next) {
    
    const pId = parseInt(req.params.pId);
    console.log ("Getting player data: " + pId);
    res.json(players[pId]);
});

//Return player data
//Should force authentication
router.get('/players', function(req, res, next) {
    console.log ("Getting all players: ");
    res.json(players);
});


/* Create player */
router.post('/player', function(req, res, next) {
    var newID = CreatePlayer(req.body.name,req.body.color);
    console.log (newID + ":" + players[newID]);
    console.log (players);
    res.json(players[newID]);
});

function CreatePlayer(name, color)
{
    var newID = nextID;
    players[newID] = {playerID: newID, units: 5, name:name, color:color, squares:0};
    nextID++; //Could have concurrency issues
    return newID;
}


//should be post
//only needs to return affected cells
router.get('/attack/:pId/:x1/:y1/:x2/:y2', function(req, res, next) {
    const g = grid;
    
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
            if (Attack (x1,y1,x2,y2))
            {
                g[y2][x2].owner = pId;        
                g[y2][x2].units = Math.floor(g[y1][x1].units/2);
                g[y1][x1].units = g[y2][x2].units;//already half
            }
            else
            {
                 g[y1][x1].units = 0; //lost battle, set to 0 units
            }
        }
    }
    //console.log(g);
    //grid[req.params.x1][req.params.y1] = 1;
    res.json(g);
});


function Attack(sourceX, sourceY, targetX, targetY){
    const g = grid;

    //alert(unitsGrid);
    console.log("Attack:" + sourceX + "," + sourceY + "," +  targetX + "," +  targetY)

    const sScore = g[sourceY][sourceX].units * Math.random();
    const tScore = g[targetY][targetX].units * Math.random();

    //console.log("Source:" + g[sourceY][sourceX].units + "," + sourceY + "," +  targetX + "," +  targetY)

    //alert (sScore + ":" + tScore);

    if(sScore>tScore)
    {
        return true;
    }
    else
    {
        return false;
    }
    
}


module.exports = router;
