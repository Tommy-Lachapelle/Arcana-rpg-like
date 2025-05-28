const characters = {
  archer: { name: "ARCHER", gif: "animated-gif/archer.gif", hp: 250, mp: 50, lv: 5 },
  mage: { name: "MAGE", gif: "animated-gif/mage-cat.gif", hp: 200, mp: 150, lv: 5 },
  rogue: { name: "ROGUE", gif: "animated-gif/rogue-human.gif", hp: 280, mp: 60, lv: 5 },
  warrior: { name: "WARRIOR", gif: "animated-gif/warrior-tiger.gif", hp: 350, mp: 30, lv: 6 }
};

const backgrounds = ['arena.png', 'swamp.jpg', 'castle.webp'];
const spriteMap = {
  construct: 'golem.gif', golem: 'golem.gif', undead: 'skeleton.gif',
  beast: 'spider.gif', monstrosity: 'spider.gif', ooze: 'slime.gif'
};
const supportedTypes = Object.keys(spriteMap);
const characterKeys = Object.keys(characters);
const currentCharacter = characters[characterKeys[Math.floor(Math.random() * characterKeys.length)]];

let playerHp = currentCharacter.hp;
let enemyHp = 100;
let enemyData = null;

function getRandomBackground() {
  const bg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  return `background/${bg}`;
}

function buildInterface() {
  const root = document.createElement('div');
  root.className = 'battle-screen';

  const leftSidebar = document.createElement('div');
  leftSidebar.className = 'sidebar left';

  const playerBox = document.createElement('div');
  playerBox.className = 'character-card';

  const playerImg = document.createElement('img');
  playerImg.src = currentCharacter.gif;
  playerImg.alt = currentCharacter.name;

  const playerInfo = document.createElement('p');
  playerInfo.innerHTML = `<strong>${currentCharacter.name}</strong><br>HP: <span id="playerHp">${playerHp}</span><br>MP: ${currentCharacter.mp}<br>LV: ${currentCharacter.lv}`;
  playerBox.appendChild(playerImg);
  playerBox.appendChild(playerInfo);
  leftSidebar.appendChild(playerBox);

  const rightSidebar = document.createElement('div');
  rightSidebar.className = 'sidebar right';

  const enemyBox = document.createElement('div');
  enemyBox.className = 'enemy-info';

  const enemyCard = document.createElement('div');
  enemyCard.className = 'enemy-card';
  enemyCard.id = 'enemySprite';

  const enemyStats = document.createElement('p');
  enemyStats.id = 'enemyStats';
  enemyStats.textContent = 'Chargement..';
  enemyBox.appendChild(enemyCard);
  enemyBox.appendChild(enemyStats);
  rightSidebar.appendChild(enemyBox);

  const battlefield = document.createElement('div');
  battlefield.className = 'battlefield';

  const background = document.createElement('img');
  background.src = getRandomBackground();
  background.className = 'battle-bg';
  background.id = 'battleBg';
  battlefield.appendChild(background);

  const actionMenu = document.createElement('div');
  actionMenu.className = 'action-menu';

  const attackBtn = document.createElement('button');
  attackBtn.textContent = 'Attack';
  attackBtn.id = 'attackBtn';
  
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset Combat';
  resetBtn.id = 'resetBtn';
  actionMenu.appendChild(attackBtn);
  actionMenu.appendChild(resetBtn);

  root.appendChild(leftSidebar);
  root.appendChild(battlefield);
  root.appendChild(rightSidebar);
  root.appendChild(actionMenu);
  document.body.appendChild(root);

  attackBtn.addEventListener('click', doAttack);
  resetBtn.addEventListener('click', resetCombat);
}

function updateEnemySprite(type) {
  const sprite = spriteMap[type] || 'default.gif';
  const enemyContainer = document.getElementById('enemySprite');
  enemyContainer.innerHTML = '';
  const spriteEl = document.createElement('img');
  spriteEl.src = `enemy-sprites/${sprite}`;
  spriteEl.className = 'enemy-gif';
  spriteEl.alt = type;
  enemyContainer.appendChild(spriteEl);
}

function doAttack() {
  if (!enemyData || enemyHp <= 0 || playerHp <= 0) return;

  const dmg = Math.floor(Math.random() * 20) + 10;
  enemyHp = Math.max(0, enemyHp - dmg);
  updateStats();

  if (enemyHp === 0) {
    document.getElementById('enemyStats').innerHTML += "<br><span style='color:lime;'>Enemy defeated!</span>";
    return;
  }

  setTimeout(() => {
    const enemyDmg = Math.floor(Math.random() * 15) + 5;
    playerHp = Math.max(0, playerHp - enemyDmg);
    updateStats();

    if (playerHp === 0) {
      document.getElementById('enemyStats').innerHTML += "<br><span style='color:red;'>You died!</span>";
    }
  }, 500);
}

function resetCombat() {
  playerHp = currentCharacter.hp;
  enemyHp = 100;
  updateStats();
  document.getElementById('enemyStats').textContent = 'Chargement...';
  document.getElementById('battleBg').src = getRandomBackground();
  getRandomMonster();
}

function updateStats() {
  document.getElementById('playerHp').textContent = playerHp;
  if (enemyData) {
    document.getElementById('enemyStats').innerHTML = `
      <strong>${enemyData.name}</strong><br>
      HP: ${enemyHp}<br>
      Type: ${enemyData.type}<br>
      Challenge: ${enemyData.challenge_rating}
    `;
  }
}

async function getRandomMonster() {
  try {
    const res = await fetch('https://www.dnd5eapi.co/api/monsters');
    const data = await res.json();
    const monsters = data.results;

    let monster = null;
    while (!monster) {
      const pick = monsters[Math.floor(Math.random() * monsters.length)];
      const details = await fetch(`https://www.dnd5eapi.co${pick.url}`);
      const candidate = await details.json();
      if (supportedTypes.includes(candidate.type)) {
        monster = candidate;
      }
    }

    enemyData = monster;
    enemyHp = monster.hit_points || 100;
    updateStats();
    updateEnemySprite(monster.type);
  } 
    /* fait avec l'aide de l'IA, sert a déboguer plus facilement "utilisation de F12 par exemple" */
    catch (err) {
    document.getElementById('enemyStats').textContent = "Erreur de chargement.";
    console.error(err);
  }
}


buildInterface();
getRandomMonster();
