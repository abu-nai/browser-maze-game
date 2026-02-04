// adding script to MatterJS in HTML file added a global variable called Matter; here we are destructuring objects from the Matter object for access and use
const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 3;
const width = 600;
const height = 600;

const engine = Engine.create();
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
    Bodies.rectangle(width/2, 0, width, 40, {isStatic: true}),
    Bodies.rectangle(width/2, height, width, 40, {isStatic: true}),
    Bodies.rectangle(0, height/2, 40, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 40, height, {isStatic: true})
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
