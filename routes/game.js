var express = require('express');
var router = express.Router();

var grid = {};    
var players = {};  
SetUpBoard();
setInterval(addReinforcements, 10000);

function addReinforcements() {
    console.log('Updating Reinforcements');
    //could use entries?
    for (const row of Object.keys(grid)) {
        for (const cell of Object.keys(grid[row])) {
            if (grid[row][cell].owner !== 0)
            {   
                players[grid[row][cell].owner].units++;
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

    players[1] = {units: 5};
    players[2] = {units: 5};
    players[3] = {units: 5};
    players[4] = {units: 5};
    players[5] = {units: 5};

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
//Should be POST
router.get('/reset', function(req, res, next) {
    SetUpBoard();
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
