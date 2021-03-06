
var grid = {};    
var players = {};  

var gridRows=20;
var gridCols=30;

var nextID = 11;//Next ID for new player (already have 1-5)

SetUpBoard();

var io={};

//console.log(app);
setInterval(addReinforcements, 10000);

const AIInterval=5000;

setInterval(AITurn, AIInterval,1);
setInterval(AITurn, AIInterval,2);
setInterval(AITurn, AIInterval,3);
setInterval(AITurn, AIInterval,4);
setInterval(AITurn, AIInterval,5);
setInterval(AITurn, AIInterval,6);
setInterval(AITurn, AIInterval,7);
setInterval(AITurn, AIInterval,8);


//setInterval(keepAlive, 5000);

function addReinforcements()
{
    for (const pID of Object.keys(players)) 
    {
        if (players[pID].moves<5)
        {   
            players[pID].moves++;
        }

    }
}


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
        players[playerID].squares=1;
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

    const startingMoves=3;

    for (y=0; y<20; y++)
    {
        grid[y] = {};
        for (x=0; x<30; x++)
        {
            units = Math.round(Math.random()*3);
            grid[y][x] = {units: units, owner: 0};   
        }
    }

    players[0] = {units: 5, name: 'CPU', color:'lightgrey', kills: 0, killed:0, squares:0, score:0, moves:startingMoves};
    players[1] = {units: 5, name: 'Bob', color:'lightblue', kills: 0, killed:0,squares:0, score:0, moves:startingMoves};
    players[2] = {units: 5, name: 'Bill', color:'orange', kills: 0, killed:0,squares:0, score:0, moves:startingMoves};
    players[3] = {units: 5, name: 'Ned', color:'pink', kills: 0, killed:0,squares:0, score:0, moves:startingMoves};
    players[4] = {units: 5, name: 'Buddy', color:'red', kills: 0, killed:0,squares:0, score:0, moves:startingMoves};
    players[5] = {units: 5, name: 'Hank', color:'blue', kills: 0, killed:0,squares:0, score:0, moves:startingMoves};
    players[6] = {units: 5, name: 'Gill', color:'purple', kills: 0, killed:0,squares:0, score:0, moves:startingMoves};
    players[7] = {units: 5, name: 'Harry', color:'lightgreen', kills: 0, killed:0,squares:0, score:0, moves:startingMoves};
    players[8] = {units: 5, name: 'Mutt', color:'gold', kills: 0, killed:0,squares:0, score:0, moves:startingMoves};

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
    players[newID] = {playerID: newID, units: 5, name:name, color:color, squares:0, kills:0, killed:0, score:0, moves:3};
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

    if (players[pId].moves<=0)
    {
        return -1;
    }
    else
    {

        if (g[targetY][targetX].units === g[sourceY][sourceX].units)//tie
        {
            return 2;//tie
        }
        else //evaluate
        {
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
                
                if(targetPId !==0) //ignore gray squares
                {
                    if(players[targetPId].squares<=1)
                    {
                        players[pId].kills++;
                        players[pId].score++;
                        players[targetPId].killed++;
                        players[targetPId].score--;
                        console.log (targetPId + " killed by " + pId );
                    }        
                    players[targetPId].squares--;
                }
                return 1;
            }
            else
            {
                // io.emit('board', {y:sourceY, x:sourceX, owner:0});
                // g[sourceY][sourceX].units = 0; //lost battle, set to 0 units
                // g[sourceY][sourceX].owner = 0; //lost battle, set to no owner
                // players[pId].squares--;

                players[pId].moves--;
                return 0;
            }
        }
    }
}

exports.grid = grid;
exports.players = players;
exports.Attack = Attack;
exports.Deploy = Deploy;
exports.CreatePlayer = CreatePlayer;
exports.AttachIO = AttachIO;