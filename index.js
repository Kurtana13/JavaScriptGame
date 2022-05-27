const canvas = document.querySelector('canvas')
const body = document.querySelector('body')
const c = canvas.getContext('2d')

canvas.width = 1280
canvas.height = 680

body.style = 'background-color:gray'

c.fillRect(0, 0, canvas.width, canvas.height)

var score = document.getElementById('score')
var finalScore = document.getElementById('points')
const startGameBtn = document.getElementById('startGameBtn')
const menu = document.getElementById('menu')

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.velocity = velocity
    }
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color

      this.velocity = velocity
    }
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 30, 'white')
let projectiles = [] // projectiles
let enemies = [] // enemies

/*ყოველ თამაშის დაწყებისას რო დარესეთდეს თამაში*/
function init() {
  player = new Player(x, y, 30, 'white')
  projectiles = []
  enemies = []
}

function spawnEnemies() {
  //every enemy will be spawned once every 1 second
  setInterval(() => {
    const radius = Math.random() * (30 - 5) + 5 //every enemy's size will be different
    let x
    let y
    if (Math.random() < 0.5) {
      /*თუ random() ნაკლებია 0.5-ზე მაშინ ჰორიზონტზე გავაკეთებთ რანდომულად მარცხნივ დასპაუნდება თუ მარჯვნივ */
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      /*თუ მეტია მაშინ ვერტიკალზე გავაკეთებთ რანდომულად ზემოთ დასპაუნდება თუ ქვემოთ */
      x = canvas.width * Math.random()
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }
    const color = `hsl(${Math.random() * 360},50%,50%)`
    const angle = Math.atan2(player.y - y, player.x - x) // კუთხე მოთამაშისა და მტრის შორის რადიანებში
    const velocity = {
      x: Math.cos(angle), // რა სისწრაფით ვამოძრაოთ x ღერძის მიმართ რომ მივიდეს მოთამაშემდე
      y: Math.sin(angle), // რა სისწრაფით ვამოძრაოთ y ღერძის მიმართ რომ მივიდეს მოთამაშემდე
    }
    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000)
}

let animationId //შევქმნათ ანიმაციის ცვლადი რომ საჭიროების შემთხვევაში მისი გაჩერება დამჭირდეს

function animate() {
  /* ყოველ Frame-ის დროს ენემის პოზიციას ვუმატებ იმ velocity-ის x da y-ს რომ მიუახლოვდეს მოთამაშეს და ვხატავ თავიდან და იძლევა ანიმაციას, იგივე რამ ხდება ტყვიაზეც, მოთამაშე არ ინძრევა მარა თავიდან ვხატავ რადგან თუ არ დავხატე შავი background-ი გადაფარავს და მოთამაშე აღარ გამოჩნდება*/

  animationId = requestAnimationFrame(animate) // შეიქმნა ანიმაცია
  c.fillStyle = 'rgba(0,0,0,0.1)' // MotionBlur effect
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update() // მოათამაშეს ვხატავთ

  projectiles.forEach((projectile, index) => {
    /*აქ საზღვრებს გასულ ტყვიებს ვშლი და ინდექსაც ვუწერ რო კონკრეტული ტყვია წავშალო */
    projectile.update()
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y - projectile.radius > canvas.height ||
      projectile.y + projectile.radius < 0
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1)
      }, 0)
    }
  })

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update()

    const dist = Math.hypot(
      player.x - enemy.x,
      player.y - enemy.y
    ) /*აქ მოთამაშესა და მტრის ცენტრებს შორის მანძილი */

    //როდესაც მოთამაშე და მტერი ერთმანეთს ეხებიან
    if (dist - player.radius - enemy.radius < 1) {
      /*აქ ვაკლებ რადიუსებს რადგან მინდა წრეწირის შეხების დროს ამოქმედდეს ეს if */
      cancelAnimationFrame(animationId) // გაჩერდეს ანიმაცია
      menu.style.display = 'block' // ამოაგდოს menu
    }

    //როდესაც ტყვია და მტერი ეხებიან ერთმანეთს
    projectiles.forEach((projectile, projIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      if (dist - enemy.radius - projectile.radius < 1) {
        //იგივე რამ ხდება აქაც
        setTimeout(() => {
          enemies.splice(enemyIndex, 1) // დაჯახებისას ტყვიას და მოწინააღმდეგეს ვაქრობთ
          projectiles.splice(projIndex, 1)
        }, 0)
        score.innerHTML++ //ქულას ვიმატებთ
        finalScore.innerHTML = score.innerHTML // და საბოოლოო ქულას ვუტოლებთ
      }
    })
  })
}

addEventListener('click', (event) => {
  const angle = Math.atan2(
    //ტყვიის გასროლის კუთხე რადიანებში
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  )

  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  }
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
  )
})

//თამაშის დაწყების ღილაკი
startGameBtn.addEventListener('click', () => {
  score.innerHTML = 0
  init()
  animate()
  spawnEnemies()
  document.getElementById('menu').style.display = 'none'
})
