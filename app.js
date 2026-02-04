// adding script to MatterJS in HTML file added a global variable called Matter; here we are destructuring objects from the Matter object for access and use
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cells = 6;
const width = 600;
const height = 600;

const unitLength = width / cells;

const engine = Engine.create();
// disables gravity in the y direction

engine.world.gravity.y = 0;
// when we create a new Engine, we receive a world object with it
const { world } = engine;
const render = Render.create({
    // this tells Render to show our representation of the World in document.body
    element: document.body,
    engine: engine,
    options: {
        wireframes: true, // gives us solid shaped with randomised colours
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    // first two dimensions determine where the center of our object is placed own the screen
    // second two dimensions determine the height and width of the rectangle
    Bodies.rectangle(width/2, 0, width, 2, {isStatic: true}),
    Bodies.rectangle(width/2, height, width, 2, {isStatic: true}),
    Bodies.rectangle(0, height/2, 2, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 2, height, {isStatic: true})
];

// need to add shapes we create to the world object in order for them to show up
// the world object has many properies, one of which is bodies, which contains the shapes we've added to it
World.add(world, walls);

// Maze Generation

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

// cannot do direct fill with false from the get-go because when we use Array, it creates identical inner arrays in memory. changes to one array would affect all arrays since they have the same reference in memory.
const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));

const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
    .fill(null)
    .map(() => Array(cells).fill(false));

// generate random starting point
const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
    // if I have visited the cell at [row, column], then return
    if (grid[row][column]) {
        return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbours
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    // For each neighbour...

    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
    // See if that neighbour is out of bounds
        if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
            continue;
        }

    // If we have visited that neighbour, continue to next neighbour
        if (grid[nextRow][nextColumn]) {
            continue;
        }

    // Remove a wall from the appropriate array
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

    stepThroughCell(nextRow, nextColumn);
    };
    // Visit that next cell (call stepThroughCell and pass in the row and column of the cell we are trying to visit)
};

stepThroughCell(startRow, startColumn);

// Iterate through the horizontal array -- when you perform a forEach method on horizontals, it will return two inner arrays which we can refer to as a row
horizontals.forEach((row, rowIndex) => {
    // for each row, determine if the path is open or not to decide whether we want to draw a wall segment
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength / 2,
            rowIndex * unitLength + unitLength,
            unitLength,
            10,
            {
                isStatic: true,
                label: 'wall'
            }
        );

        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + unitLength / 2,
            10,
            unitLength,
            {
                isStatic: true,
                label: 'wall'
            }
        );

        World.add(world, wall);
    });
});

// Goal
const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * 0.75,
    unitLength * 0.75,
    {
        isStatic: true,
        label: 'goal'
    }
);

World.add(world, goal);

// Ball
const ball = Bodies.circle(
    unitLength / 2,
    unitLength / 2,
    unitLength / 4,
    {
        label: 'ball'
    }
);

World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
    // console.log(x, y);

    // move ball up w/ W key
    if (event.keyCode === 87) {
        Body.setVelocity(ball, { x, y: y - 5 });
    }

    // move ball right w/ D key
    if (event.keyCode === 68) {
        Body.setVelocity(ball, { x: x + 5, y });
    }

    // move ball down with S key
    if (event.keyCode === 83) {
        Body.setVelocity(ball, { x: x, y: y + 5});
    }

    // move ball left with A key
    if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 5, y })
    }

})

// Win Condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];

        if (
            labels.includes(collision.bodyA.label) && 
            labels.includes(collision.bodyB.label)
        ) {
            // if user wins, collapse the maze!
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});