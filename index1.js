const canvas=document.querySelector('canvas');
const scoreEl=document.querySelector('#scoreEl');
const c=canvas.getContext('2d');

canvas.width=innerWidth;
canvas.height=innerHeight-5;

class Player{
    constructor(){
        this.position={
            x:canvas.width/2,
            y:canvas.height-80
        }
        this.velocity={
            x:0,
            y:0
        }

        // image of player
        const image=new Image();
        image.src='./img/spaceship.png'
        this.image=image;
        this.width=70;
        this.height=45;

    }
    draw(){
        c.drawImage(this.image, this.position.x,this.position.y,this.width,this.height);
    }
    update(){
        this.draw();
        this.position.x+=this.velocity.x;
        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x=0;
        } else if (this.position.x + this.width > canvas.width) {
            this.position.x = canvas.width - this.width;
            this.velocity.x=0;
        }
    }
}

class Projectile{
  constructor({position,velocity}){
    this.position=position;
    this.velocity=velocity;
    this.radius=5;
  }
  draw(){
    c.beginPath();
    c.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2,false);
    c.fillStyle='white';
    c.fill();
    c.closePath();
  }
  update(){
    this.draw();
    
    this.position.x+=this.velocity.x;
    this.position.y+=this.velocity.y;
  }
}
class InvaderProjectile{
    constructor({position,velocity}){
      this.position=position;
      this.velocity=velocity;
      this.width=5;
      this.height=10;
    }
    draw(){
     c.fillRect(this.position.x,this.position.y,this.width,this.height);
     c.fillStyle='red';
    }
    update(){
      this.draw();
      if (this.position.y > canvas.height) {
        // Remove projectile if it goes below the screen
        const index = invaderProjectiles.indexOf(this);
        if (index > -1) {
            invaderProjectiles.splice(index, 1);
        }
    }
      
      this.position.x+=this.velocity.x;
      this.position.y+=this.velocity.y;
    }
  }

class Invader{
    constructor({position}){
        this.position={
            x:position.x,
            y:position.y
        }
        this.velocity={
            x:0,
            y:0
        }

        // image of player
        const image=new Image();
        image.src='./img/invader.png'
        this.image=image;
        this.width=50;
        this.height=50;

    }
    draw(){
        c.drawImage(this.image, this.position.x,this.position.y,this.width,this.height);
    }
    update({velocity}){
        this.draw();
        this.position.x+=velocity.x;
        this.position.y+=velocity.y;
    }
    shoot(invaderProjectiles){
        invaderProjectiles.push(new InvaderProjectile({
            position:{
                x:this.position.x +this.width/2,
                y:this.position.y+this.height
            },
            velocity:{
                x:0,
                y:5
            }
        }));

    }
}

class Grid{
    constructor(){
        this.position={
            x:0,
            y:0
        }
        this.velocity={
            x:7,
            y:0
        }
        this.invaders=[]
        this.width=13*35;
        for(let i=0; i<9; i++){
            for(let j=0; j<5; j++){
            this.invaders.push(new Invader({
                position :{
                    x: i*50,
                    y:j*25
                }
            }))
        }
    }

    }
    update(){
        this.position.x+=this.velocity.x;
        this.position.y+=this.velocity.y;
        this.velocity.y=0;   // frame by frame it sets to 0
        if(this.position.x + this.width>=canvas.width  || this.position.x<=0){
            this.velocity.x=-this.velocity.x;
            this.velocity.y=30;
        }
    }
}

const player=new Player();
const projectiles=[];
//const invader=new Invader();
const grids=[new Grid()];
const invaderProjectiles=[];
player.draw();
let frames=0;
let randominterval=Math.floor(Math.random()*500+500);
let game={
    over:false,
    active:true
}
let score=0;

function animate(){
    if(game.active==false){
        return
    }
    requestAnimationFrame(animate);
    c.fillStyle='black';
    c.fillRect(0,0,innerWidth,innerHeight);
    player.update();

    invaderProjectiles.forEach( (invaderProjectile)=>{
        invaderProjectile.update();
// game lose condn if hits
        if(invaderProjectile.position.y + invaderProjectile.height>=player.position.y && invaderProjectile.position.x + invaderProjectile.width>=player.position.x  && invaderProjectile.position.x <= player.position.x+ player.width){
            setTimeout(()=>{
                game.over=true;
            },0)
            setTimeout(()=>{
                game.active=false;
            },2000)
        }
    })
    projectiles.forEach(projectile =>{
        projectile.update();
    })

    grids.forEach(grid =>{
        grid.update();
// spanning projectiles from invaders
        if(frames%100==0 && grid.invaders.length>0){
            grid.invaders[Math.floor(Math.random()*grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader,i) =>{
            invader.update({velocity: grid.velocity});

            projectiles.forEach((projectile,j)=>{
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height && projectile.position.x + projectile.radius>=invader.position.x  && projectile.position.x - projectile.radius<=invader.position.x + invader.width && projectile.position.y + projectile.radius>=invader.position.y){
                     setTimeout(()=>{
                        score+=100;
                        scoreEl.innerHTML=score;
                        grid.invaders.splice(i,1);
                        projectiles.splice(j,1);

                     },0)
                }
            })
        })
    })
    if(frames%randominterval==0){
        grids.push(new Grid());
        randominterval=Math.floor(Math.random()*500+500);
        frames=0;

    }

        frames++;
}
animate();

addEventListener('keydown', ({key}) => {
    if(game.over==true){
        return
    }
    switch (key) {
        case 'a'  :
          console.log('left');
          player.velocity.x=-10
            break
        case 'd'  :
            console.log('right')
            player.velocity.x=10    
            break
        case ' ':
            console.log('space')
            projectiles.push(new Projectile({
                position:{
                    x:player.position.x+ player.width/2,
                    y:player.position.y
                },
                velocity:{
                    x:0,
                    y:-20
                }
            }))
            break
    }
})

addEventListener('keyup', ({key}) => {
    if(game.over==true){
        return
    }
    switch (key) {
        case 'a':
            if (player.velocity.x < 0)
                 player.velocity.x = 0;
            break;
        case 'd':
           if (player.velocity.x > 0) 
                player.velocity.x = 0;
            break;
         case' ':
            break;
    }
       
});