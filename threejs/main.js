// Rotation around point logic
// Based on https://stackoverflow.com/questions/42812861/three-js-pivot-point/42866733#42866733

THREE.Object3D.prototype.savePosition = function() {
    return function () {
        this.__position = this.position.clone(); 
        
        return this;
    }
}();

THREE.Object3D.prototype.rotateAroundPoint = function() {
    return function (point, theta, pointIsWorld = false, axis = new THREE.Vector3(0, 0, 1)) {
    // point: Vector3 -  center of rotation
    // theta: float - rotation angle (in radians)
    // pointIsWord: bool
        if(pointIsWorld){
            this.parent.localToWorld(this.position); // compensate for world coordinate
        }
    
        this.position.sub(point); // remove the offset
        this.position.applyAxisAngle(axis, theta); // rotate the POSITION
        this.position.add(point); // re-add the offset
    
        if(pointIsWorld){
            this.parent.worldToLocal(this.position); // undo world coordinates compensation
        }
    
        this.rotateOnAxis(axis, theta); // rotate the OBJECT
        

        return this;
    }

}();


// ThreeJS variables
var camera, scene, renderer;
// Optional (showFps)
var stats;
// Objects in Scene
var robot;


// Function to generate robot
// The strategy below is just a suggestion, you may change the shapes to create your customized robot

function gen_robot() {
    // Creating Group (not necessary, but better readability)
    var robot = new THREE.Group();

    // torso
    var torso = gen_rect(4, 6);
    torso.name = "torso";

    // head
    var head = gen_circle(1.6);
    head.name = "head";
    head.position.y = 4.8;
    head.position.z = -0.05;  // Not necessary, makes head not in front of other robot parts

    // left: upper arm, arm, hand
    var left_upper_arm = gen_rect(1.5, 4);
    left_upper_arm.name = "left_upper_arm";
    var left_lower_arm = gen_rect(1, 3);
    left_lower_arm.name = "lower_arm";
    var left_hand = gen_rect(1.5,0.5);
    left_hand.name = "hand";
    left_upper_arm.add(left_lower_arm);
    left_lower_arm.add(left_hand);
    left_hand.position.y = -1.5;
    left_lower_arm.position.y = -3;
    left_upper_arm.position.x = -2.6;
    left_upper_arm.position.z = 1;
    
    // right: upper arm, arm, hand
    var right_upper_arm = left_upper_arm.clone();  
    right_upper_arm.name = "right_upper_arm";
    right_upper_arm.position.x = 2.6;
    right_upper_arm.position.z = 1;

    // left: upper leg, leg, foot
    var left_upper_leg = gen_rect(1.5, 4);
    left_upper_arm.name = "left_upper_leg";
    var left_lower_leg = gen_rect(1, 3);
    left_lower_leg.name = "lower_leg";
    var left_foot = gen_rect(1.5,0.5);
    left_foot.name = "foot";
    left_upper_leg.add(left_lower_leg);
    left_lower_leg.add(left_foot);
    left_foot.position.y = -1.5;
    left_lower_leg.position.y = -3;
    left_upper_leg.position.x = -1;
    left_upper_leg.position.y = -5;
    

    // right: upper leg, leg, foot
    var right_upper_leg = left_upper_leg.clone();  
    right_upper_leg.name = "right_upper_leg";
    right_upper_leg.position.x = 1;
    
    // Creating hieararchy
    robot.add(torso);
    torso.add(head);
    torso.add(right_upper_arm);      
    torso.add(left_upper_arm);
    torso.add(left_upper_leg);
    torso.add(right_upper_leg);

    robot.name = "robot";

    return robot
}


// Auxiliary function to generate rectangle
function gen_rect( width, height ) {
    var plane_geometry = new THREE.PlaneGeometry( width, height );
    var plane_material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh(plane_geometry, plane_material);

    return plane;
}

// Auxiliary function to generate circle
function gen_circle( radius, segs = 30 ) {
    var circle_geometry = new THREE.CircleGeometry( radius, segs);
    var circle_material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff} );
    var circle = new THREE.Mesh(circle_geometry, circle_material);

    return circle
}

// Auxiliary function to generate triangle
function gen_triangle( size, v1 = new THREE.Vector3(-1, 0, 0), v2 = new THREE.Vector3(1, 0, 0), v3 = new THREE.Vector3(-1, 1, 0) ) {
    var triangle_geometry = new THREE.Geometry();
    var triangle = new THREE.Triangle(v1, v2, v3);
    var normal = triangle.normal();
    triangle_geometry.vertices.push(triangle.a);
    triangle_geometry.vertices.push(triangle.b);
    triangle_geometry.vertices.push(triangle.c);
    triangle_geometry.faces.push(new THREE.Face3(0, 1, 2, normal));
    var triangle = new THREE.Mesh(triangle_geometry, new THREE.MeshNormalMaterial());
    
    triangle.size = size;

    return triangle;
}

function init() {
    // Canvas height/height 
    var width = 40;
    var height = 22;
    // Setting up camera
    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0, 2 );
    camera.lookAt( 0, 0, -1);
    camera.position.z = 1;

    // Setting up scene
    scene = new THREE.Scene();
    robot = gen_robot();
    scene.add(robot);

    // Setting up renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    window.addEventListener('resize', onWindowResize, false);
    /* renderer.setViewport( vpXmin, vpYmin, vpXwidth, vpYheight );  Unused */ 
    renderer.setSize(window.innerWidth, window.innerHeight);  

    // Adding both renderer and stats to the Web page
    stats = new Stats();
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(stats.dom);

    // Adding listener for keydown 
    document.addEventListener("keydown", onDocumentKeyDown, false);

    // Saving initial position (necessary for rotation solution)
    scene.traverse( function( node ) {
        if ( node instanceof THREE.Object3D ) {
            node.savePosition();
        }
    
    } );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
}

function onDocumentKeyDown(event) {
    // One for Hand wave, Two for your Custom Animation #2 and Three - Your Custom Animation #3
    // For now, only prints inserted key
    
    if(event.which==49){
        console.log("Primeira Animação");    
        aceno();
        
    }else if(event.which==50){
        console.log("Segunda Animação");        

    }else if (event.which==51){
        console.log("Terceira Animação");

    }    
}

function aceno() {
   
    // Sample animation, you should implement at least 3 animations:
    // One is the hand wave (as in lecture 3.4)
    // The other two: explore your creativity =) 
    requestAnimationFrame(aceno);
    
    var rot_pt;
    
    var right_upper_arm = robot.getObjectByName("right_upper_arm"); 
    var right_lower_arm = ((robot.getObjectByName("right_upper_arm")).getObjectByName("lower_arm") );
    var hand = ((robot.getObjectByName("right_upper_arm")).getObjectByName("lower_arm").getObjectByName("hand") );

    if(right_upper_arm.rotation._z <= (Math.PI/2)){
        
        rot_pt = new THREE.Vector3
            (
                ( right_upper_arm.geometry.parameters.width + right_upper_arm.__position.x) / 2,
                ( right_upper_arm.geometry.parameters.height + right_upper_arm.__position.y) / 2.6,
                0
            );
        right_upper_arm.rotateAroundPoint( rot_pt, 0.01 );    
                
        rot_pt = new THREE.Vector3
            (
                ( 0) / 2,
                ( right_lower_arm.__position.y  ) / 1.6,
                0
            );
        right_lower_arm.rotateAroundPoint( rot_pt, 0.005 );    
    }else{
        rot_pt = new THREE.Vector3
        (
            ( 0) / 2,
            (hand.__position.y),
            0
        );

        if( hand.rotation._z <= (Math.PI/4) ){
            console.log("IF 1");
            hand.rotateAroundPoint( rot_pt, -0.05 );
           // console.log(hand.rotation._z);
        }else{
            console.log("IF 2");
            hand.rotateAroundPoint( rot_pt, 0.009 );    
        }        
         
    }
    // Update changes to renderer
    stats.update();
    renderer.render(scene, camera);  

}

init();

