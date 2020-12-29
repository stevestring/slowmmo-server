
var grid = {};    
var players = {};  

var gridRows=20;
var gridCols=30;

var nextID = 11;//Next ID for new player (already have 1-5)

SetUpBoard();

var io={};

//console.log(app);
//setInterval(addReinforcements, 1000);

setInterval(AITurn, 1000,1);
setInterval(AITurn, 1000,2);
setInterval(AITurn, 1000,3);
setInterval(AITurn, 1000,4);
// setInterval(AITurn, 1000,5);
// setInterval(AITurn, 1000,6);
// setInterval(AITurn, 1000,7);
// setInterval(AITurn, 1000,8);


//setInterval(keepAlive, 5000);

function keepAlive()
{
    io.emit('board1','ping');
}
//private
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

//private
function RandomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

//private
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

//private
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
    players[4] = {units: 5, color:'red'};
    players[5] = {units: 5, color:'blue'};
    players[6] = {units: 5, color:'purple'};
    players[7] = {units: 5, color:'lightgreen'};
    players[8] = {units: 5, color:'gold'};

    grid[0][0]["owner"] = 1;
    grid[0][0]["units"] = 1;

    grid[0][29]["owner"] = 2;
    grid[0][29]["units"] = 2;

    grid[19][29]["owner"] = 3;
    grid[19][29]["units"] = 3;

    grid[19][0]["owner"] = 4;
    grid[19][0]["units"] = 1;
}



//public
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

//public
function CreatePlayer(name, color)
{
    var newID = nextID;
    players[newID] = {playerID: newID, units: 5, name:name, color:color, squares:0};
    nextID++; //Could have concurrency issues
    return newID;
}
//public
function AttachIO(socket)
{
    console.log("io attached to game");
    io = socket;
}

//public
function Attack(pId, sourceY, sourceX, targetY, targetX){
    const g = grid;
    var targetPId=0;
    
    //console.log("Attack:" + sourceY + "," + sourceX + "," +  targetY + "," +  targetX)

    // const sScore = g[sourceY][sourceX].units * Math.random();
    // const tScore = g[targetY][targetX].units * Math.random();

    //console.log("Source:" + g[sourceY][sourceX].units + "," + sourceY + "," +  targetX + "," +  targetY)

    let win=false;

    if (g[targetY][targetX].units===0)
    {
        win=true;
        //console.log("anything beats empty");
    }
    else if (g[targetY][targetX].units===1)
    {
        win = g[sourceY][sourceX].units===3;  
        //console.log("paper beats rock"); 
    }
    else if (g[targetY][targetX].units===2)
    {
        win = g[sourceY][sourceX].units===1;   
        //console.log("rock beats scissors"); 
    }
    else if (g[targetY][targetX].units===3)
    {
        win = g[sourceY][sourceX].units===2;   
        //console.log("rock scissors beats paper"); 
    }
    if(win)
    {
        targetPId = g[targetY][targetX].owner; //need for remove square
        io.emit('board', {y:targetY, x:targetX, owner:pId});
        g[targetY][targetX].owner = pId;        
        g[targetY][targetX].units = g[sourceY][sourceX].units;
        players[pId].squares++;
        players[targetPId].squares--;
        return true;
    }
    else
    {
        io.emit('board', {y:sourceY, x:sourceX, owner:0});
        g[sourceY][sourceX].units = 0; //lost battle, set to 0 units
        g[sourceY][sourceX].owner = 0; //lost battle, set to no owner
        players[pId].squares--;
        return false;
    }
    
}

exports.grid = grid;
exports.players = players;
exports.Attack = Attack;
exports.Deploy = Deploy;
exports.CreatePlayer = CreatePlayer;
exports.AttachIO = AttachIO;