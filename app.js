// adding script to MatterJS in HTML file added a global variable called Matter; here we are destructuring objects from the Matter object for access and use
const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;

const width = 800;
const height = 600;

const engine = Engine.create();
// when we create a new Engine, we receive a world object with it
const { world } = engine;
const render = Render.create({
    // this tells Render to show our representation of the World in document.body
    element: document.body,
    engine: engine,
    options: {
        wireframes: false, // gives us solid shaped with randomised colours
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// allows us to click, drag, and throw shapes 
World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}));

// Walls
const walls = [
    // first two dimensions determine where the center of our object is placed own the screen
    // second two dimensions determine the height and width of the rectangle
    Bodies.rectangle(400, 0, 800, 40, {isStatic: true}),
    Bodies.rectangle(400, 600, 800, 40, {isStatic: true}),
    Bodies.rectangle(0, 300, 40, 600, {isStatic: true}),
    Bodies.rectangle(800, 300, 40, 600, {isStatic: true})
];

// need to add shapes we create to the world object in order for them to show up
// the world object has many properies, one of which is bodies, which contains the shapes we've added to it
World.add(world, walls);

// Random Shapes

for (let i = 0; i < 45; i++) {
    if (Math.random() > 0.5) {
        World.add(world, Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50));
    } else {
        World.add(world, Bodies.circle(Math.random() * width, Math.random() * height, 35, {
            render: {
                fillStyle: 'violet'
            }
        }));
    }
    
};
