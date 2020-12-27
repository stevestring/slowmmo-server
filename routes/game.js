var express = require('express');
var router = express.Router();

var grid = {};    
var players = {};  

var gridRows=20;
var gridCols=30;


var nextID = 6;//Next ID for new player (already have 1-5)

SetUpBoard();
//setInterval(addReinforcements, 1000);


// setInterval(AITurn, 1000,1);
// setInterval(AITurn, 1000,2);
// setInterval(AITurn, 1000,3);
// setInterval(AITurn, 1000,4);

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

function getPlayerSquares(playerID) {
    console.log('Getting Player Sqaures for player ID: ' + playerID);

    var squares = {};  
    var i=0;
     //could use entries?
     
    for (const row of Object.keys(grid)) {
        for (const cell of Object.keys(grid[row])) {
            if (grid[row][cell].owner === playerID)
            {   
                squares[i]=[+row,+cell];
                i++;
            }
        }
    }
    return squares;
}

function RandomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

function AITurn(playerID) {
    //const playerID = 1;
    console.log('AI Move:' + playerID);
    
    let squares = getPlayerSquares(playerID);

    let targets = {};

    let sq = [0,0];
    let target = [0,0];
    var i=0;

    if (Object.keys(squares).length>0)
    {
        sq = RandomProperty(squares);
    
        console.log(sq);   

        //check U,D,L,R to find weakest opponent
        if (sq[0]>1 && grid[sq[0]-1][sq[1]].owner!= playerID)
        {          
            targets[i]=[sq[0]-1,sq[1]];
            i++;
        }
        if (sq[0]<gridRows-2 && grid[sq[0]+1][sq[1]].owner!= playerID)
        {
            targets[i] = [sq[0]+1,sq[1]];
            i++;
        }
        if (sq[1]>1 && grid[sq[0]][sq[1]-1].owner!= playerID)
        {
            targets[i] = [sq[0],sq[1]-1];
            i++;
        }
        if (sq[1]<gridCols-2 && grid[sq[0]][sq[1]+1].owner!= playerID)
        {
            targets[i] = [sq[0],sq[1]+1];
            i++;
        }
        
        console.log(Object.keys(targets).length);
        //Targets found?
        if (Object.keys(targets).length>0)
        {
            target = RandomProperty(targets);
            Attack (playerID, sq[0],sq[1],target[0],target[1]);
            return;
        }
    }
    else //Choose a new spot
    {
        console.log('Player: '+ + 'Finding new spot');
        //could use entries?
        for (const row of Object.keys(grid)) {
            for (const cell of Object.keys(grid[row])) {
                if (grid[row][cell].owner === 0)
                {   
                    grid[row][cell].owner = playerID;
                    grid[row][cell].units = Math.ceil(Math.random()*3);
                    return;
                }
            }
        }

    }
}


function SetUpBoard()
{
    var x=0;
    var y=0;
    var units=0;
    for (y=0; y<20; y++)
    {
        grid[y] = {};
        for (x=0; x<30; x++)
        {
            units = Math.round(Math.random()*3);
            grid[y][x] = {units: units, owner: 0};   
        }
    }

    players[0] = {units: 5, color:'lightgrey'};
    players[1] = {units: 5, color:'lightblue'};
    players[2] = {units: 5, color:'orange'};
    players[3] = {units: 5, color:'pink'};
    players[4] = {units: 5, color:'lightgreen'};

    grid[0][0]["owner"] = 1;
    grid[0][0]["units"] = 1;

    grid[0][29]["owner"] = 2;
    grid[0][29]["units"] = 2;

    grid[19][29]["owner"] = 3;
    grid[19][29]["units"] = 3;

    grid[19][0]["owner"] = 4;
    grid[19][0]["units"] = 1;
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
        players[pId].squares=1;
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

    Deploy (pId,y1,x1);

    res.json(grid);
});

function Deploy (pId, y1, x1)
{
    const g = grid;
    if ( pId === g[y1][x1].owner) //valid target?
    {
        if (g[y1][x1].units===3 )
        {
            g[y1][x1].units=1;
        }
        else
        {
            g[y1][x1].units++;
        }
        
        console.log (pId + " Changed unit: [" + y1+ "," + x1 + "]");
    }
    else
    {
        console.log (pId + " Failed deployed units: [" + y1+ "," + x1 + "]");        
        console.log (pId +":"+ g[y1][x1].owner);
    }
    
}

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
            Attack (pId, y1,x1,y2,x2)  
        }
    }
    //console.log(g);
    //grid[req.params.x1][req.params.y1] = 1;
    res.json(g);
});


function Attack(pId, sourceY, sourceX, targetY, targetX){
    const g = grid;

    //alert(unitsGrid);
    console.log("Attack:" + sourceY + "," + sourceX + "," +  targetY + "," +  targetX)

    // const sScore = g[sourceY][sourceX].units * Math.random();
    // const tScore = g[targetY][targetX].units * Math.random();

    //console.log("Source:" + g[sourceY][sourceX].units + "," + sourceY + "," +  targetX + "," +  targetY)

    let win=false;

    if (g[targetY][targetX].units===0)
    {
        win=true;
        console.log("anything beats empty");
    }
    else if (g[targetY][targetX].units===1)
    {
        win = g[sourceY][sourceX].units===3;  
        console.log("paper beats rock"); 
    }
    else if (g[targetY][targetX].units===2)
    {
        win = g[sourceY][sourceX].units===1;   
        console.log("rock beats scissors"); 
    }
    else if (g[targetY][targetX].units===3)
    {
        win = g[sourceY][sourceX].units===2;   
        console.log("rock scissors beats paper"); 
    }
    if(win)
    {

        g[targetY][targetX].owner = pId;        
        g[targetY][targetX].units = g[sourceY][sourceX].units;
        return true;
    }
    else
    {
        g[sourceY][sourceX].units = 0; //lost battle, set to 0 units
        g[sourceY][sourceX].owner = 0; //lost battle, set to no owner
        return false;
    }
    
}


module.exports = router;
